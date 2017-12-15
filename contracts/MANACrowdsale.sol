pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

import "./CrowdsaleFactory.sol";
import "./CrowdsalePropertyFactory.sol";
import "./Crowdsale.sol";
import "./ValidationProperty.sol";
import "./CappedProperty.sol";
import "./FinalizationProperty.sol";

import "./MANAWhitelistedProperty.sol";
import "./MANAFinalizationProperty.sol";

import "./decentraland/MANAContinuousSale.sol";
import "./decentraland/MANAToken.sol";

contract MANACrowdsale is Ownable {
  using SafeMath for uint256;

  uint256 public constant TOTAL_SHARE = 100;
  uint256 public constant CROWDSALE_SHARE = 40;
  uint256 public constant FOUNDATION_SHARE = 60;
  uint256 public constant CAP = 86206 ether; //ok for this to be public? need to access from tests.

  // price at which whitelisted buyers will be able to buy tokens
  uint256 public preferentialRate;

  // customize the rate for each whitelisted buyer
  mapping (address => uint256) public buyerRate;

  // initial rate at which tokens are offered
  uint256 public initialRate;

  // end rate at which tokens are offered
  uint256 public endRate;

  // continuous crowdsale contract
  MANAContinuousSale public continuousSale;

  event WalletChange(address wallet);

  event PreferentialRateChange(address indexed buyer, uint256 rate);

  event InitialRateChange(uint256 rate);

  event EndRateChange(uint256 rate);

  event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

  event BoolEv(bool boolev);


  Crowdsale public crowdsale;
  ValidationProperty cappedProperty;
  MANAWhitelistedProperty whitelistedProperty;
  MANAFinalizationProperty finalizationProperty;
  ValidationProperty[] validationProperties; //THESE NEED TO BE HERE!! (crashes when inside constructor)
  FinalizationProperty[] finalizationProperties; //THESE NEED TO BE HERE!! (crashes when inside constructor)

  MANAToken public token;

  function MANACrowdsale (
      uint256 _startTime, //Block, Changed in zeppelin-solidity #350 commit 77dfcb6e23b452031e478f8f3794a9dbe90b7c64
      uint256 _endTime, //Block, Changed in zeppelin-solidity #350 commit 77dfcb6e23b452031e478f8f3794a9dbe90b7c64
      uint256 _initialRate,
      uint256 _endRate,
      uint256 _preferentialRate,
      address _wallet
  )  {
      require(_initialRate > 0);
      require(_endRate > 0);
      require(_preferentialRate > 0);

      initialRate = _initialRate;
      endRate = _endRate;
      preferentialRate = _preferentialRate;

      CrowdsaleFactory crowdsaleFactory = new CrowdsaleFactory();
      CrowdsalePropertyFactory propertyFactory = new CrowdsalePropertyFactory();

      cappedProperty = propertyFactory.createCappedProperty(CAP);
      whitelistedProperty = new MANAWhitelistedProperty();//propertyFactory.createWhitelistedProperty();
      finalizationProperty = new MANAFinalizationProperty();

      validationProperties.push(cappedProperty);
      validationProperties.push(whitelistedProperty);
      finalizationProperties.push(finalizationProperty);

      //crowdsale = crowdsaleFactory.createCrowdsale(_startTime, _endTime, initialRate, _wallet, new ValidationProperty[](0), new FinalizationProperty[](0));//finalizationProperties);
      //crowdsale = crowdsaleFactory.createCrowdsale(_startTime, _endTime, initialRate, _wallet, validationProperties);//, new FinalizationProperty[](0));//finalizationProperties);
      crowdsale = crowdsaleFactory.createCrowdsale(_startTime, _endTime, initialRate, _wallet, validationProperties, finalizationProperties);
      token = new MANAToken();
      crowdsale.substituteToken(token);
      token.pause();

      continuousSale = createContinuousSaleContract();

  }

  function createContinuousSaleContract() internal returns(MANAContinuousSale) {
      return new MANAContinuousSale(crowdsale.rate(), crowdsale.wallet(), token);
  }

  function addToWhitelist(address buyer) public onlyOwner {
      whitelistedProperty.addToWhitelist(buyer);
  }

  function setBuyerRate(address buyer, uint256 rate) onlyOwner public {
      require(rate != 0);
      require(whitelistedProperty.isWhitelisted(buyer));
      require(now < crowdsale.startTime());

      buyerRate[buyer] = rate;

      PreferentialRateChange(buyer, rate);
  }

  function setInitialRate(uint256 rate) onlyOwner public {
      require(rate != 0);
      require(now < crowdsale.startTime());

      initialRate = rate;

      InitialRateChange(rate);
  }

  function setEndRate(uint256 rate) onlyOwner public {
      require(rate != 0);
      require(now < crowdsale.startTime());

      endRate = rate;

      EndRateChange(rate);
  }

  function getRate() internal returns(uint256) {
      // some early buyers are offered a discount on the crowdsale price
      if (buyerRate[msg.sender] != 0) {
          return buyerRate[msg.sender];
      }

      // whitelisted buyers can purchase at preferential price before crowdsale ends
      if (whitelistedProperty.isWhitelisted(msg.sender)) {
          return preferentialRate;
      }

      // otherwise compute the price for the auction
      uint256 elapsed = now - crowdsale.startTime();
      uint256 rateRange = initialRate - endRate;
      uint256 timeRange = crowdsale.endTime() - crowdsale.startTime();

      return initialRate.sub(rateRange.mul(elapsed).div(timeRange));
  }

  // low level token purchase function
  function buyTokens(address beneficiary) public payable {
      require(beneficiary != 0x0);
      require(crowdsale.validPurchase(beneficiary, msg.value));

      uint256 weiAmount = msg.value;
      uint256 updatedWeiRaised = crowdsale.weiRaised().add(weiAmount);

      uint256 rate = getRate();
      // calculate token amount to be created
      uint256 tokens = weiAmount.mul(rate);

      // update state
      crowdsale.updateWeiRaised(updatedWeiRaised);

      token.mint(beneficiary, tokens);
      TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);

      crowdsale.forwardFunds();
  }

  function setWallet(address _wallet) onlyOwner public {
      crowdsale.setWallet(_wallet);
      continuousSale.setWallet(_wallet);
      WalletChange(_wallet);
  }

  function unpauseToken() onlyOwner {
      require(crowdsale.finalizationProperties(0).isFinalized());
      token.unpause();
  }

  function pauseToken() onlyOwner {
      require(crowdsale.finalizationProperties(0).isFinalized());
      token.pause();
  }

  function beginContinuousSale() onlyOwner public {
      require(crowdsale.finalizationProperties(0).isFinalized());

      token.transferOwnership(continuousSale);

      continuousSale.start();
      continuousSale.transferOwnership(owner);
  }

  function finalize() public onlyOwner {
      token.transferOwnership(finalizationProperty);
      crowdsale.finalize();
      crowdsale.restoreTokenOwnership();
  }

}
