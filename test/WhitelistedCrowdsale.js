import { increaseTimeTo, duration } from './helpers/increaseTime';
import { advanceBlock } from './helpers/advanceToBlock';
import latestTime from './helpers/latestTime';

require('chai')
  .use(require('chai-as-promised'))
  .should();

const Crowdsale = artifacts.require('Crowdsale');
const WhitelistedProperty = artifacts.require('WhitelistedProperty');

contract('Whitelisted Crowdsale', function(accounts) {

  var crowdsale;
  const rate = 1;
  const wallet = 0x11;
  const whitelist = [accounts[1]];

  var startTime;
  var endTime;
  var afterEndTime;

  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock()
  })

  beforeEach(async function() {
    startTime = latestTime() + duration.weeks(1);
    endTime =   startTime + duration.weeks(1);
    afterEndTime = endTime + duration.seconds(1);

    crowdsale = await Crowdsale.new(startTime, endTime, rate, wallet);
    var property = await WhitelistedProperty.new(whitelist);
    await crowdsale.addValidationProperty(property.address);
  });


  describe('accepting payments', function () {
    const authorized = accounts[1];
    const unauthorized = accounts[2];
    const value = 42;

    beforeEach(async function () {
      await increaseTimeTo(startTime);
    });

    it('should accept payments from whitelisted (with whichever beneficiaries)', async function () {
      await crowdsale.buyTokens(authorized, { value: value, from: authorized }).should.be.fulfilled;
      await crowdsale.buyTokens(unauthorized, { value: value, from: authorized }).should.be.fulfilled;
    });

    it('should reject payments from not whitelisted (with whichever beneficiaries)', async function () {
      await crowdsale.send(value).should.be.rejected; // send() goes from accounts[0]
      await crowdsale.buyTokens(unauthorized, { value: value, from: unauthorized }).should.be.rejected;
      await crowdsale.buyTokens(authorized, { value: value, from: unauthorized }).should.be.rejected;
    });

  });
});
