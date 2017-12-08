import { increaseTimeTo, duration } from './helpers/increaseTime';
import { advanceBlock } from './helpers/advanceToBlock';
import latestTime from './helpers/latestTime';

require('chai')
  .use(require('chai-as-promised'))
  .should();

const CrowdsaleFactory = artifacts.require('CrowdsaleFactory');
const FinalizationProperty = artifacts.require('FinalizationProperty');

contract('CrowdsaleFactory', function([_, wallet, authorized]) {

  var factory;
  const rate = 1;
  var crowdsale;

  var startTime;
  var endTime;

  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  })

  beforeEach(async function() {
    factory = await CrowdsaleFactory.new();
  });

  describe('creating crowdsales', function () {
    var cap = 42;
    var whitelist = [authorized];

    beforeEach(async function () {
      startTime = latestTime() + duration.weeks(1);
      endTime =   startTime + duration.weeks(1);
    });

    it('should create plain crowdsale', async function () {
      await factory.createCrowdsale(startTime, endTime, rate, wallet, 0, [], []).should.be.fulfilled;
    });

    it('should create capped crowdsale', async function () {
      await factory.createCrowdsale(startTime, endTime, rate, wallet, cap, [], []).should.be.fulfilled;
    });

    it('should create whitelisted crowdsale', async function () {
      await factory.createCrowdsale(startTime, endTime, rate, wallet, 0, whitelist, []).should.be.fulfilled;
    });

    it('should create finalizable crowdsale', async function () {
      var finalization = await FinalizationProperty.new();
      var properties = [finalization.address];
      await factory.createCrowdsale(startTime, endTime, rate, wallet, 0, [], properties).should.be.fulfilled;
    });
  });
});
