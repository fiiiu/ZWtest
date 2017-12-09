//Tests taken from OpenZeppelin, edited for factory generation

import ether from './helpers/ether';
import { advanceBlock } from './helpers/advanceToBlock';
import { increaseTimeTo, duration } from './helpers/increaseTime';
import latestTime from './helpers/latestTime';
import EVMRevert from './helpers/EVMRevert';

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const CrowdsaleFactory = artifacts.require('CrowdsaleFactory');
const CrowdsalePropertyFactory = artifacts.require('CrowdsalePropertyFactory');
const Crowdsale = artifacts.require('Crowdsale');
const CappedProperty = artifacts.require('CappedProperty');

contract('CappedCrowdsale', function ([_, wallet]) {
  var crowdsaleFactory;
  var propertyFactory;
  const rate = new BigNumber(1000);
  const cap = ether(10);
  const lessThanCap = ether(5);
  var startTime;
  var endTime;
  var crowdsale;

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
    crowdsaleFactory = await CrowdsaleFactory.new();
    propertyFactory = await CrowdsalePropertyFactory.new();
  });

  beforeEach(async function () {
    var property;
    startTime = latestTime() + duration.weeks(1);
    endTime = startTime + duration.weeks(1);

    var propertyCreation = await propertyFactory.createCappedProperty(cap);
    for (var i = 0; i < propertyCreation.logs.length; i++) {
      var log = propertyCreation.logs[i];
      if(log.event == "PropertyCreated") {
        property = CappedProperty.at(log.args.addr);
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
    beforeEach(async function () {
      await increaseTimeTo(startTime);
    });

    it('should accept payments within cap', async function () {
      await crowdsale.send(cap.minus(lessThanCap)).should.be.fulfilled;
      await crowdsale.send(lessThanCap).should.be.fulfilled;
    });

    it('should reject payments outside cap', async function () {
      await crowdsale.send(cap);
      await crowdsale.send(1).should.be.rejectedWith(EVMRevert);
    });

    it('should reject payments that exceed cap', async function () {
      await crowdsale.send(cap.plus(1)).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('ending', function () {
    beforeEach(async function () {
      await increaseTimeTo(startTime);
    });

    it('should not be ended if under cap', async function () {
      let hasEnded = await crowdsale.hasEnded();
      hasEnded.should.equal(false);
      await crowdsale.send(lessThanCap);
      hasEnded = await crowdsale.hasEnded();
      hasEnded.should.equal(false);
    });

    it('should not be ended if just under cap', async function () {
      await crowdsale.send(cap.minus(1));
      let hasEnded = await crowdsale.hasEnded();
      hasEnded.should.equal(false);
    });

    it('should be ended if cap reached', async function () {
      await crowdsale.send(cap);
      let hasEnded = await crowdsale.hasEnded();
      hasEnded.should.equal(true);
    });
  });
});
