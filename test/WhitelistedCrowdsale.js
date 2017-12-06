
require('chai')
  .use(require('chai-as-promised'))
  //.use(require('chai-bignumber')(BigNumber))
  .should();

const Crowdsale = artifacts.require('Crowdsale');
const WhitelistedProperty = artifacts.require('WhitelistedProperty');

contract('Whitelisted Crowdsale', function(accounts) {

  var crowdsale;
  const rate = 1;
  const wallet = 0x11;
  const whitelist = [accounts[1]];
  var property;

  beforeEach(async function() {
    const startTime = Date.now()/1000;
    const endTime = startTime + 100000;
    crowdsale = await Crowdsale.new(startTime, endTime, rate, wallet);
    property = await WhitelistedProperty.new(whitelist);
    await crowdsale.addValidationProperty(property.address);
  });


  describe('accepting payments', function () {
    const authorized = accounts[1];
    const unauthorized = accounts[2];
    const value = 42;

    it('should accept payments from whitelisted (with whichever beneficiaries)', async function () {
      await crowdsale.buyTokens(authorized, { value: value, from: authorized }).should.be.fulfilled;
      await crowdsale.buyTokens(unauthorized, { value: value, from: authorized }).should.be.fulfilled;
    });

    it('should reject payments from not whitelisted (with whichever beneficiaries)', async function () {
      await crowdsale.send(value).should.be.rejected; // send() goes from accounts[0]
      await crowdsale.buyTokens(unauthorized, { value: value, from: unauthorized }).should.be.rejected;
      await crowdsale.buyTokens(authorized, { value: value, from: unauthorized }).should.be.rejected;
    });

  });
});
