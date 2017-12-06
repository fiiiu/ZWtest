
require('chai')
  .use(require('chai-as-promised'))
  //.use(require('chai-bignumber')(BigNumber))
  .should();

const Crowdsale = artifacts.require('Crowdsale');
const CappedProperty = artifacts.require('CappedProperty');

contract('Capped Crowdsale', function(accounts) {

  var crowdsale;
  const rate = 1;
  const wallet = 0x11;
  const cap = 42;

  beforeEach(async function() {
    const startTime = Date.now()/1000;
    const endTime = startTime + 100000;
    var property;
    crowdsale = await Crowdsale.new(startTime, endTime, rate, wallet);
    property = await CappedProperty.new(cap);
    await  crowdsale.addValidationProperty(property.address);
  });


  describe('accepting payments', function () {
    const investor = accounts[0];
    const purchaser = accounts[1];
    const value1 = 41;
    const value2 = 43;
    const value3 = cap;

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

    it('should end crowdsale once cap is reached', async function () {
      await crowdsale.buyTokens(investor, { value: value3, from: purchaser });
      let hasEnded = await crowdsale.hasEnded();
      hasEnded.should.equal(true);
    });

  });
});
