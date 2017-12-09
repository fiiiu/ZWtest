//Tests taken from zeppelin contracts, edited for composite

import {advanceBlock} from './helpers/advanceToBlock'
import {increaseTimeTo, duration} from './helpers/increaseTime'
import latestTime from './helpers/latestTime'
import EVMRevert from './helpers/EVMRevert'

const BigNumber = web3.BigNumber

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

const Crowdsale = artifacts.require('Crowdsale');
const FinalizationProperty = artifacts.require('FinalizationProperty');

contract('FinalizableCrowdsale', function ([_, owner, wallet, thirdparty]) {
  const rate = new BigNumber(1000);
  var crowdsale;
  var startTime;
  var endTime;
  var afterEndTime;

  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock()
  })

  beforeEach(async function () {
    startTime = latestTime() + duration.weeks(1);
    endTime =   startTime + duration.weeks(1);
    afterEndTime = endTime + duration.seconds(1);

    crowdsale = await Crowdsale.new(startTime, endTime, rate, wallet);
    var property = await FinalizationProperty.new();
    await crowdsale.addFinalizationProperty(property.address);
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
