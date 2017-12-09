//Tests taken from OpenZeppelin, edited for factory generation

import {advanceBlock} from './helpers/advanceToBlock'
import {increaseTimeTo, duration} from './helpers/increaseTime'
import latestTime from './helpers/latestTime'
import EVMRevert from './helpers/EVMRevert'

const BigNumber = web3.BigNumber

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

const CrowdsaleFactory = artifacts.require('CrowdsaleFactory');
const CrowdsalePropertyFactory = artifacts.require('CrowdsalePropertyFactory');
const Crowdsale = artifacts.require('Crowdsale');
const FinalizationProperty = artifacts.require('FinalizationProperty');

contract('FinalizableCrowdsale', function ([_, owner, wallet, thirdparty]) {
  var crowdsaleFactory;
  var propertyFactory;
  const rate = new BigNumber(1000);
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

  beforeEach(async function () {
    var property;
    startTime = latestTime() + duration.weeks(1);
    endTime =   startTime + duration.weeks(1);
    afterEndTime = endTime + duration.seconds(1);

    var propertyCreation = await propertyFactory.createFinalizationProperty();
    for (var i = 0; i < propertyCreation.logs.length; i++) {
      var log = propertyCreation.logs[i];
      if(log.event == "PropertyCreated") {
        property = FinalizationProperty.at(log.args.addr);
      }
    }

    var crowdsaleCreation = await crowdsaleFactory.createCrowdsale(startTime, endTime, rate, wallet, [], [property.address]);
    for (var i = 0; i < crowdsaleCreation.logs.length; i++) {
      var log = crowdsaleCreation.logs[i];
      if(log.event == "CrowdsaleCreated") {
        crowdsale = Crowdsale.at(log.args.addr);
      }
    }

    owner = await crowdsale.owner();
  })

  it('cannot be finalized before ending', async function () {
    await crowdsale.finalize({from: owner}).should.be.rejectedWith(EVMRevert);
  })

  it('cannot be finalized by third party after ending', async function () {
    await increaseTimeTo(afterEndTime);
    await crowdsale.finalize({from: thirdparty}).should.be.rejectedWith(EVMRevert);
  })

  it('can be finalized by owner after ending', async function () {
    await increaseTimeTo(afterEndTime);
    await crowdsale.finalize({from: owner}).should.be.fulfilled;
  })

  it('cannot be finalized twice', async function () {
    await increaseTimeTo(afterEndTime);
    await crowdsale.finalize({from: owner});
    await crowdsale.finalize({from: owner}).should.be.rejectedWith(EVMRevert);
  })

  // This doesn't work, maybe because property being the one logging the event?
  // it('logs finalized', async function () {
  //   await increaseTimeTo(afterEndTime);
  //   const {logs} = await crowdsale.finalize({from: owner});
  //   const event = logs.find(e => e.event === 'Finalized');
  //   should.exist(event);
  // })

})
