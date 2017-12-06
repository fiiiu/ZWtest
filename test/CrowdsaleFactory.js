
//const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  //.use(require('chai-bignumber')(BigNumber))
  .should();

const CrowdsaleFactory = artifacts.require('CrowdsaleFactory');
const FinalizationProperty = artifacts.require('FinalizationProperty');

contract('CrowdsaleFactory', function(accounts) {

  var factory;
  const rate = 1;
  const wallet = 0x11;
  var crowdsale;

  beforeEach(async function() {
    factory = await CrowdsaleFactory.new();
  });

  describe('creating crowdsales', function () {
    const startTime = Date.now()/1000+1000;
    const endTime = startTime + 100000;
    var cap = 42;
    var whitelist = [accounts[1]];

    it('should create plain crowdsale', async function () {
      await factory.createCrowdsale(startTime, endTime, rate, wallet, 0, [], []).should.be.fulfilled;
    });

    it('should create capped crowdsale', async function () {
      await factory.createCrowdsale(startTime, endTime, rate, wallet, cap, [], []).should.be.fulfilled;
    });

    it('should create whitelisted crowdsale', async function () {
      await factory.createCrowdsale(startTime, endTime, rate, wallet, 0, whitelist, []).should.be.fulfilled;
    });

    it('should create finalizable crowdsale', async function () {
      var finalization = await FinalizationProperty.new();
      var properties = [finalization.address];
      await factory.createCrowdsale(startTime, endTime, rate, wallet, 0, [], properties).should.be.fulfilled;
    });
  });
});
