import { increaseTimeTo, duration } from './helpers/increaseTime';
import { advanceBlock } from './helpers/advanceToBlock';
import latestTime from './helpers/latestTime';

require('chai')
  .use(require('chai-as-promised'))
  .should();

const CrowdsaleFactory = artifacts.require('CrowdsaleFactory');
const CrowdsalePropertyFactory = artifacts.require('CrowdsalePropertyFactory');
const Crowdsale = artifacts.require('Crowdsale');
const WhitelistedProperty = artifacts.require('WhitelistedProperty');

contract('Whitelisted Crowdsale', function([_, wallet, authorized, unauthorized]) {
  var crowdsaleFactory;
  var propertyFactory;
  const rate = 1;
  //const whitelist = [authorized];
  var startTime;
  var endTime;
  var afterEndTime;
  var crowdsale;

  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
    crowdsaleFactory = await CrowdsaleFactory.new();
    propertyFactory = await CrowdsalePropertyFactory.new();
  })

  beforeEach(async function() {
    var property;
    startTime = latestTime() + duration.weeks(1);
    endTime =   startTime + duration.weeks(1);
    afterEndTime = endTime + duration.seconds(1);

    var propertyCreation = await propertyFactory.createWhitelistedProperty();
    for (var i = 0; i < propertyCreation.logs.length; i++) {
      var log = propertyCreation.logs[i];
      if(log.event == "PropertyCreated") {
        property = WhitelistedProperty.at(log.args.addr);
        property.addToWhitelist(authorized);
      }
    }

    var crowdsaleCreation = await crowdsaleFactory.createCrowdsale(startTime, endTime, rate, wallet, [property.address], []);
    for (var i = 0; i < crowdsaleCreation.logs.length; i++) {
      var log = crowdsaleCreation.logs[i];
      if(log.event == "CrowdsaleCreated") {
        crowdsale = Crowdsale.at(log.args.addr);
      }
    }

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
