// @flow
'use strict'

import { increaseTimeTo, duration } from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';
import { advanceBlock } from '../helpers/advanceToBlock';
import EVMRevert from '../helpers/EVMRevert';

const expect = require('chai').expect

const { advanceToBlock, ether, should, EVMThrow } = require('./utils')
const MANACrowdsale = artifacts.require('./MANACrowdsale.sol')
const MANAContinuousSale = artifacts.require('./decentraland/MANAContinuousSale.sol')
const MANAToken = artifacts.require('./decentraland/MANAToken.sol')
const Crowdsale = artifacts.require('./Crowdsale.sol')

const BigNumber = web3.BigNumber

contract('MANACrowdsale', function ([_, wallet, wallet2, buyer, purchaser, buyer2, purchaser2]) {

  const initialRate = new BigNumber(1000)
  const endRate = new BigNumber(900)

  const newRate = new BigNumber(500)
  const preferentialRate = new BigNumber(2000)
  const value = ether(1)

  const expectedFoundationTokens = new BigNumber(6000)
  const expectedTokenSupply = new BigNumber(10000)

  let startTime, endTime, afterEndTime
  let crowdsale, token

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    //startTime = latestTime() + duration.weeks(1);
    //endTime = startTime + duration.weeks(1);
    const block = await web3.eth.getBlock('latest');
    startTime = block.timestamp + 10000;
    endTime = startTime + 1000000;
    afterEndTime = endTime + 10;

    crowdsale = await MANACrowdsale.new(
      startTime,
      endTime,
      initialRate,
      endRate,
      preferentialRate,
      wallet
    )
    token = MANAToken.at(await crowdsale.token());
  });

  it('starts with token paused', async function () {
    const paused = await token.paused();
    paused.should.equal(true);
  })

  it('owner should be able to change wallet', async function () {
    await crowdsale.setWallet(wallet2);
    let internalCrowdsale = Crowdsale.at(await crowdsale.crowdsale());
    let wallet = await internalCrowdsale.wallet();
    wallet.should.equal(wallet2);

    const continuousSale = MANAContinuousSale.at(await crowdsale.continuousSale())
    wallet = await continuousSale.wallet();
    wallet.should.equal(wallet2);
  })

  it('non-owner should not be able to change wallet', async function () {
    await crowdsale.setWallet(wallet2, {from: purchaser}).should.be.rejectedWith(EVMRevert);
  })

  it('owner should be able to start continuous sale', async function () {
    await crowdsale.beginContinuousSale().should.be.rejectedWith(EVMRevert)

    await increaseTimeTo(afterEndTime)
    await crowdsale.finalize()

    const sale = MANAContinuousSale.at(await crowdsale.continuousSale())

    let started = await sale.started()
    started.should.equal(false)

    await crowdsale.beginContinuousSale().should.be.fulfilled

    started = await sale.started()
    started.should.equal(true)
  })

  it('owner should be able to unpause token after crowdsale ends', async function () {
    //await advanceToBlock(endBlock)
    await increaseTimeTo(afterEndTime)

    await crowdsale.unpauseToken().should.be.rejectedWith(EVMRevert)

    await crowdsale.finalize()

    let paused = await token.paused()
    paused.should.equal(true)

    await crowdsale.unpauseToken()

    paused = await token.paused()
    paused.should.equal(false)
  })

  it('non-owners should not be able to start continuous sale', async function () {
    await crowdsale.beginContinuousSale({from: purchaser}).should.be.rejectedWith(EVMRevert)
  })


  describe('rate during auction should decrease at a fixed step every block', async function () {

    let balance, startTime, endTime, startBlockNumber, endBlockNumber

    let initialRate = 9166
    let endRate = 5500
    let preferentialRate = initialRate
    // const rateAtBlock10 = new BigNumber(9165)
    // const rateAtBlock20 = new BigNumber(9164)
    // const rateAtBlock100 = new BigNumber(9155)
    // const rateAtBlock2 = new BigNumber(9166)
    // const rateAtBlock10000 = new BigNumber(7973)
    // const rateAtBlock30000 = new BigNumber(5586)
    // translate to time using 15s per block.
    const rateAtTime150 = new BigNumber(9165)
    const rateAtTime300 = new BigNumber(9164)
    const rateAtTime1500 = new BigNumber(9155)
    const rateAtTime30 = new BigNumber(9166)
    const rateAtTime150000 = new BigNumber(7973)
    const rateAtTime450000 = new BigNumber(5586)

    before(async function () {
      // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
      await advanceBlock();
    });

    beforeEach(async function() {

      // startBlockNumber = web3.eth.blockNumber + 10
      // endBlockNumber = web3.eth.blockNumber + 10 + 30720
      // //const block = await web3.eth.getBlock('latest');
      //startBlock = block + 10;

      const currentBlock = await web3.eth.getBlock('latest');
      startTime = currentBlock.timestamp + 10000;
      endTime = startTime + 30720*15; //estimate 15 s per block

      // console.log(startTime);
      // console.log(endTime);

      crowdsale = await MANACrowdsale.new(
        startTime,
        endTime,
        initialRate,
        endRate,
        preferentialRate,
        wallet
      )
      token = MANAToken.at(await crowdsale.token())

    })

    it('at start', async function () {
      //await advanceToBlock(startBlock - 1) //WHY -1?
      await increaseTimeTo(startTime+1);

      await crowdsale.buyTokens(buyer, {value, from: purchaser})
      balance = await token.balanceOf(buyer)
      balance.should.be.bignumber.equal(value.mul(initialRate))
    })

    it('at time 150', async function () {
      await increaseTimeTo(startTime+150)

      await crowdsale.buyTokens(buyer2, {value, from: purchaser2})
      balance = await token.balanceOf(buyer2)

      balance.should.be.bignumber.equal(value.mul(rateAtTime150))
    })

    it('at time 300', async function () {
      await increaseTimeTo(startTime+300)

      await crowdsale.buyTokens(buyer2, {value, from: purchaser2})
      balance = await token.balanceOf(buyer2)

      balance.should.be.bignumber.equal(value.mul(rateAtTime300))
    })

    it('at time 1500', async function () {
      await increaseTimeTo(startTime+1500)

      await crowdsale.buyTokens(buyer2, {value, from: purchaser2})
      balance = await token.balanceOf(buyer2)

      balance.should.be.bignumber.equal(value.mul(rateAtTime1500))
    })

    it('at time 30', async function () {
      await increaseTimeTo(startTime+30)

      await crowdsale.buyTokens(buyer2, {value, from: purchaser2})
      balance = await token.balanceOf(buyer2)

      balance.should.be.bignumber.equal(value.mul(rateAtTime30))
    })

    it('at time 150000', async function () {
      await increaseTimeTo(startTime+150000)

      await crowdsale.buyTokens(buyer2, {value, from: purchaser2})
      balance = await token.balanceOf(buyer2)

      balance.should.be.bignumber.equal(value.mul(rateAtTime150000))
    })

    it('at time 450000', async function () {
      await increaseTimeTo(startTime+450000)


      await crowdsale.buyTokens(buyer2, {value, from: purchaser2})
      balance = await token.balanceOf(buyer2)

      balance.should.be.bignumber.equal(value.mul(rateAtTime450000))
    })

    it('whitelisted buyers should access tokens at reduced price until end of auction', async function () {
      await crowdsale.addToWhitelist(buyer)
      console.log(buyer)
      await crowdsale.buyTokens(buyer, {value, from: buyer})
      const balance = await token.balanceOf(buyer)
      balance.should.be.bignumber.equal(value.mul(preferentialRate))
    })

  })
});
