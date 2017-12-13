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

  let startTime, endTime
  let crowdsale, token

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    //startTime = latestTime() + duration.weeks(1);
    //endTime = startTime + duration.weeks(1);
    const block = await web3.eth.getBlock('latest');
    startTime = block.timestamp + 10000//latestTime() + duration.weeks(1);
    endTime = startTime + 1000000;//startTime + duration.weeks(1);

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

    // const continuousSale = MANAContinuousSale.at(await crowdsale.continuousSale())
    // wallet = await continuousSale.wallet();
    // wallet.should.equal(wallet2);
  })

  it('non-owner should not be able to change wallet', async function () {
    await crowdsale.setWallet(wallet2, {from: purchaser}).should.be.rejectedWith(EVMRevert);
  })

  it('owner should be able to start continuous sale', async function () {
    //await crowdsale.beginContinuousSale().should.be.rejectedWith(EVMRevert)

    //await increaseTimeTo(endTime)
    // await crowdsale.finalize()

    // const sale = MANAContinuousSale.at(await crowdsale.continuousSale())
    //
    // let started = await sale.started()
    // started.should.equal(false)

    // await crowdsale.beginContinuousSale().should.be.fulfilled
    //
    // started = await sale.started()
    // started.should.equal(true)
  })
});
