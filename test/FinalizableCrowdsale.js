import increaseTimeTo from './helpers/increaseTime';

require('chai')
  .use(require('chai-as-promised'))
  //.use(require('chai-bignumber')(BigNumber))
  .should();

const Crowdsale = artifacts.require('Crowdsale');
const FinalizationProperty = artifacts.require('FinalizationProperty');

contract('Finalizable Crowdsale', function(accounts) {

  var crowdsale;
  const rate = 1;
  const wallet = 0x11;
  var afterEndTime;

  beforeEach(async function() {
    const startTime = Date.now()/1000;
    const endTime = startTime + 100000;
    afterEndTime = endTime + 1000;
    crowdsale = await Crowdsale.new(startTime, endTime, rate, wallet);
    var property = await FinalizationProperty.new();
    await crowdsale.addFinalizationProperty(property.address);
  });


  describe('finalization routine', function () {

    it('should fail if has not ended', async function () {
      await crowdsale.finalize().should.be.rejected;
    });

    it('should succeed if has ended', async function () {
      await increaseTimeTo(afterEndTime);
      await crowdsale.finalize().should.be.fulfilled;
    });

  });
});
