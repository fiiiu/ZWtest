
//import EVMRevert from 'zeppelin-solidity/test/helpers/EVMRevert'; NOT WORKING
//const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  //.use(require('chai-bignumber')(BigNumber))
  .should();

const Crowdsale = artifacts.require('Crowdsale');

contract('\'Plain\' Crowdsale', function(accounts) {

  var crowdsale;
  const rate = 1;
  const wallet = 0x11;

  beforeEach(async function() {
    const startTime = Date.now()/1000;
    const endTime = startTime + 100000;
    crowdsale = await Crowdsale.new(startTime, endTime, rate, wallet);
  });

  describe('accepting payments', function () {
    const investor = accounts[0];
    const purchaser = accounts[1];
    const value = 42;

    it('should accept payments', async function () {
      await crowdsale.send(value).should.be.fulfilled;
      await crowdsale.buyTokens(investor, { value: value, from: purchaser }).should.be.fulfilled;
    });
  });
});
