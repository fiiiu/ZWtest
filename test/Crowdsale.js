
//import EVMRevert from 'zeppelin-solidity/test/helpers/EVMRevert'; NOT WORKING
const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

//const CrowdsaleFactory = artifacts.require('CrowdsaleFactory');
const Crowdsale = artifacts.require('Crowdsale');
const CappedProperty = artifacts.require('CappedProperty');
const WhitelistedProperty = artifacts.require('WhitelistedProperty');

contract('\'Plain\'  Crowdsale', function(accounts) {

  beforeEach(async function() {
    const startTime = Date.now()/1000;
    const endTime = startTime + 100000;
    const rate = 1;
    const wallet = 0x11;
    this.crowdsale = await Crowdsale.new(startTime, endTime, rate, wallet);
  });

  describe('accepting payments', function () {
    const investor = accounts[0];
    const purchaser = accounts[1];
    const value = 42;

    it('should accept payments', async function () {
      await this.crowdsale.send(value).should.be.fulfilled;
      await this.crowdsale.buyTokens(investor, { value: value, from: purchaser }).should.be.fulfilled;
    });
  });
});


contract('Capped Crowdsale', function(accounts) {

  var crowdsale;

  beforeEach(async function() {
    const startTime = Date.now()/1000;
    const endTime = startTime + 100000;
    const rate = 1;
    const wallet = 0x11;
    const cap = 43;
    var property;
    crowdsale = await Crowdsale.new(startTime, endTime, rate, wallet);
    property = await CappedProperty.new(cap);
    await  crowdsale.addValidationProperty(property.address); //not this! prop, property also don't work! DO I NEED TO WORK WITH ADDRESSES?
  });


  describe('accepting payments', function () {
    const investor = accounts[0];
    const purchaser = accounts[1];
    const value1 = 42;//new BigNumber(42);
    const value2 = 44;//new BigNumber(44);

    it('should accept direct payments below cap', async function () {
      await crowdsale.send(value1).should.be.fulfilled;
    });

    it('should accept token purchases below cap', async function () {
      await crowdsale.buyTokens(investor, { value: value1, from: purchaser }).should.be.fulfilled;
    });

    it('should reject direct payments above cap', async function () {
      await crowdsale.send(value2).should.be.rejected;
    });

    it('should reject token purchases above cap', async function () {
      await crowdsale.buyTokens(investor, { value: value2, from: purchaser }).should.be.rejected;
    });

  });
});


contract('Whitelisted Crowdsale', function(accounts) {

  var crowdsale;

  beforeEach(async function() {
    const startTime = Date.now()/1000;
    const endTime = startTime + 100000;
    const rate = 1;
    const wallet = 0x11;
    const whitelist = [accounts[0]];
    var property;
    crowdsale = await Crowdsale.new(startTime, endTime, rate, wallet);
    property = await WhitelistedProperty.new(whitelist);
    await  crowdsale.addValidationProperty(property.address); //not this! prop, property also don't work! DO I NEED TO WORK WITH ADDRESSES?
  });


  describe('accepting payments', function () {
    const authorized = accounts[0];
    const unauthorized = accounts[1];
    const value1 = 42;

    it('should accept payments from whitelisted', async function () {
      //await crowdsale.send(value1).should.be.fulfilled;
      await crowdsale.buyTokens(authorized, { value: value1, from: authorized }).should.be.fulfilled;
    });

    it('should reject payments from not whitelisted', async function () {
      //await crowdsale.send(value2).should.be.rejected;
      await crowdsale.buyTokens(unauthorized, { value: value1, from: unauthorized }).should.be.rejected;
    });


  });
});
