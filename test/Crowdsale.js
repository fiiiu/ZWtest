
//import EVMRevert from 'zeppelin-solidity/test/helpers/EVMRevert'; NOT WORKING
const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

//const CrowdsaleFactory = artifacts.require('CrowdsaleFactory');
const Crowdsale = artifacts.require('Crowdsale');

// contract('Plain Crowdsale', function(accounts) {
//
//   beforeEach(async function() {
//     const startTime = Date.now()/1000;
//     const endTime = startTime + 100000;
//     const rate = 1;
//     const wallet = 0x11;
//     this.crowdsale = await Crowdsale.new(startTime, endTime, rate, wallet);
//   });
//
//   describe('accepting payments', function () {
//     const investor = accounts[0];
//     const purchaser = accounts[1];
//     const value = 42;
//
//     it('should accept payments', async function () {
//       await this.crowdsale.send(value).should.be.fulfilled;
//       await this.crowdsale.buyTokens(investor, { value: value, from: purchaser }).should.be.fulfilled;
//     });
//   });
// });

const CappedProperty = artifacts.require('CappedProperty');

contract('Capped Crowdsale', function(accounts) {

  var crowdsale;

  // before(async function() {
  //   const startTime = Date.now()/1000;
  //   const endTime = startTime + 100000;
  //   const rate = 1;
  //   const wallet = 0x11;
  //   const cap = new BigNumber(43);
  //   var property;
  //   await Crowdsale.new(startTime, endTime, rate, wallet).then(function(instance) {
  //     crowdsale = instance;
  //     property = CappedProperty.new(10000);
  //     console.log(property);
  //     return property
  //   }).then(function(prop) {
  //     console.log('property: ', property);
  //     console.log('prop: ', prop);
  //     crowdsale.addValidationProperty(prop.address); //not this! prop, property also don't work!
  //   });
  // });

  before(async function() {
    const startTime = Date.now()/1000;
    const endTime = startTime + 100000;
    const rate = 1;
    const wallet = 0x11;
    const cap = new BigNumber(43);
    var property;
    crowdsale = await Crowdsale.new(startTime, endTime, rate, wallet);
    property = await CappedProperty.new(10000);
    await  crowdsale.addValidationProperty(property); //not this! prop, property also don't work! DO I NEED TO WORK WITH ADDRESSES?
  });


  describe('accepting payments', function () {
    const investor = accounts[0];
    const purchaser = accounts[1];
    const value1 = new BigNumber(42);
    const value2 = new BigNumber(44);

    it('should accept payments below cap', async function () {
      await crowdsale.send(value1).should.be.fulfilled;
      await crowdsale.buyTokens(investor, { value: value1, from: purchaser }).should.be.fulfilled;
    });

    //THESE FAIL! not really a property..
    it('should reject payments above cap', async function () {
      await crowdsale.send(value2).should.be.rejected;
      await crowdsale.buyTokens(investor, { value: value2, from: purchaser }).should.be.rejected;
    });

  });
});
