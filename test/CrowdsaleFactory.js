import { increaseTimeTo, duration } from './helpers/increaseTime';
import { advanceBlock } from './helpers/advanceToBlock';
import latestTime from './helpers/latestTime';

require('chai')
  .use(require('chai-as-promised'))
  .should();

const CrowdsaleFactory = artifacts.require('CrowdsaleFactory');
const CrowdsalePropertyFactory = artifacts.require('CrowdsalePropertyFactory');
const CappedProperty = artifacts.require('CappedProperty');
const WhitelistedProperty = artifacts.require('WhitelistedProperty');
const FinalizationProperty = artifacts.require('FinalizationProperty');

contract('CrowdsaleFactory', function([_, wallet, authorized]) {

  var factory;
  var propertyFactory;
  var property;
  const rate = 1;

  var startTime;
  var endTime;

  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  })

  beforeEach(async function() {
    factory = await CrowdsaleFactory.new();
    propertyFactory = await CrowdsalePropertyFactory.new();
  });

  describe('creating crowdsales', function () {

    beforeEach(async function () {
      startTime = latestTime() + duration.weeks(1);
      endTime =   startTime + duration.weeks(1);
    });

    it('should create plain crowdsale', async function () {
      await factory.createCrowdsale(startTime, endTime, rate, wallet, [], []).should.be.fulfilled;
    });

    it('should create capped crowdsale', async function () {
      var cap = 42;
      var propertyCreation = await propertyFactory.createCappedProperty(cap);
      for (var i = 0; i < propertyCreation.logs.length; i++) {
        var log = propertyCreation.logs[i];
        if(log.event == "PropertyCreated") {
          property = CappedProperty.at(log.args.addr);
        }
      }
      await factory.createCrowdsale(startTime, endTime, rate, wallet, [property.address], []).should.be.fulfilled;
    });

    it('should create whitelisted crowdsale', async function () {
      var whitelist = [authorized];
      var propertyCreation = await propertyFactory.createWhitelistedProperty(whitelist);
      for (var i = 0; i < propertyCreation.logs.length; i++) {
        var log = propertyCreation.logs[i];
        if(log.event == "PropertyCreated") {
          property = WhitelistedProperty.at(log.args.addr);
        }
      }
      await factory.createCrowdsale(startTime, endTime, rate, wallet, [property.address], []).should.be.fulfilled;
    });

    it('should create finalizable crowdsale', async function () {
      var propertyCreation = await propertyFactory.createFinalizationProperty();
      for (var i = 0; i < propertyCreation.logs.length; i++) {
        var log = propertyCreation.logs[i];
        if(log.event == "PropertyCreated") {
          property = FinalizationProperty.at(log.args.addr);
        }
      }
      await factory.createCrowdsale(startTime, endTime, rate, wallet, [], [property.address]).should.be.fulfilled;
    });
  });
});
