import { increaseTimeTo, duration } from './helpers/increaseTime';
import { advanceBlock } from './helpers/advanceToBlock';
import latestTime from './helpers/latestTime';

require('chai')
  .use(require('chai-as-promised'))
  .should();

const Crowdsale = artifacts.require('Crowdsale');
const WhitelistedProperty = artifacts.require('WhitelistedProperty');

contract('Direct Whitelisted Crowdsale', function([_, wallet, authorized, unauthorized]) {

  var crowdsale;
  var property;
  const rate = 1;
  //const whitelist = [authorized];

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
    property = await WhitelistedProperty.new();
    await property.addToWhitelist(authorized);
    await crowdsale.addValidationProperty(property.address);
    // var isau = await property.isWhitelisted(authorized);
    // console.log(isau);
    // var isnau = await property.isWhitelisted(unauthorized);
    // console.log(isnau);

  });


  describe('accepting payments', function () {
    const value = 42;

    beforeEach(async function () {
      await increaseTimeTo(startTime);
    });

    it('should accept payments to whitelisted (from whichever buyers)', async function () {
      await crowdsale.buyTokens(authorized, { value: value, from: authorized }).should.be.fulfilled;
      await crowdsale.buyTokens(authorized, { value: value, from: unauthorized }).should.be.fulfilled;
    });

    it('should reject payments to whitelisted (with whichever buyers)', async function () {
      await crowdsale.send(value).should.be.rejected; // send() goes from _ (accounts[0])
      await crowdsale.buyTokens(unauthorized, { value: value, from: unauthorized }).should.be.rejected;
      await crowdsale.buyTokens(unauthorized, { value: value, from: authorized }).should.be.rejected;
    });

  });
});
