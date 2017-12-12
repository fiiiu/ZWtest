pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

import "./CrowdsaleFactory.sol";
import "./CrowdsalePropertyFactory.sol";
import "./Crowdsale.sol";
import "./ValidationProperty.sol";
import "./FinalizationProperty.sol";

import "./WhitelistedProperty.sol";
import "./MANAFinalizationProperty.sol";

import "./decentraland/MANAContinuousSale.sol";
import "./decentraland/MANAToken.sol";

contract MANACrowdsale is Ownable {
  using SafeMath for uint256;

  uint256 public constant TOTAL_SHARE = 100;
  uint256 public constant CROWDSALE_SHARE = 40;
  uint256 public constant FOUNDATION_SHARE = 60;

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

  Crowdsale public crowdsale;
  WhitelistedProperty whitelistedProperty;
  MANAFinalizationProperty finalizationProperty;

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

      ValidationProperty cappedProperty = propertyFactory.createCappedProperty(86206 ether);
      whitelistedProperty = propertyFactory.createWhitelistedProperty();
      //FinalizationProperty finalizationProperty = propertyFactory.createFinalizationProperty();

      finalizationProperty = new MANAFinalizationProperty();

      ValidationProperty[] validationProperties;
      validationProperties.push(cappedProperty);
      validationProperties.push(whitelistedProperty);

      FinalizationProperty[] finalizationProperties;
      finalizationProperties.push(finalizationProperty);

      crowdsale = crowdsaleFactory.createCrowdsale(_startTime, _endTime, initialRate, _wallet, validationProperties, finalizationProperties);
      //whitelistedProperty.transferOwnership(crowdsale);

      continuousSale = createContinuousSaleContract();

      token = MANAToken(crowdsale.token());
      token.pause();
      //MANAToken(crowdsale.token()).pause();

  }

  function createTokenContract() internal returns(MintableToken) {
      return new MANAToken();
  }

  function createContinuousSaleContract() internal returns(MANAContinuousSale) {
      return new MANAContinuousSale(crowdsale.rate(), crowdsale.wallet(), crowdsale.token());
  }

  function addToWhitelist(address buyer) public onlyOwner {
      //crowdsale.addToWhitelist(buyer);
      whitelistedProperty.addToWhitelist(buyer);
  }

  function setBuyerRate(address buyer, uint256 rate) onlyOwner public {
      require(rate != 0);
      //require(crowdsale.isWhitelisted(buyer));
      require(whitelistedProperty.isWhitelisted(buyer));
      require(now < crowdsale.startTime()); //block.number < startBlock);

      buyerRate[buyer] = rate;

      PreferentialRateChange(buyer, rate);
  }

  function setInitialRate(uint256 rate) onlyOwner public {
      require(rate != 0);
      require(now < crowdsale.startTime()); //Changed block.number -> now

      initialRate = rate;

      InitialRateChange(rate);
  }

  function setEndRate(uint256 rate) onlyOwner public {
      require(rate != 0);
      require(now < crowdsale.startTime()); //Changed block.number -> now

      endRate = rate;

      EndRateChange(rate);
  }

  function getRate() internal returns(uint256) {
      // some early buyers are offered a discount on the crowdsale price
      if (buyerRate[msg.sender] != 0) {
          return buyerRate[msg.sender];
      }

      // whitelisted buyers can purchase at preferential price before crowdsale ends
      //if (crowdsale.isWhitelisted(msg.sender)) {
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
  function buyTokens(address beneficiary) public payable { //Wasn't public in original! Why?
      uint256 rate = getRate();
      crowdsale.setRate(rate);
      crowdsale.buyTokens.value(msg.value)(beneficiary); //only caveat is TokenPurchase event will come out with this.address as purchaser.. does it matter? should pass purchaser as argument? emit event here?
  }

  function setWallet(address _wallet) onlyOwner public {
      crowdsale.setWallet(_wallet);
      continuousSale.setWallet(_wallet);
      WalletChange(_wallet);
  }

  function unpauseToken() onlyOwner {
      require(crowdsale.finalizationProperties(0).isFinalized());
      MANAToken(crowdsale.token()).unpause();
  }

  function pauseToken() onlyOwner {
      require(crowdsale.finalizationProperties(0).isFinalized());
      MANAToken(crowdsale.token()).pause();
  }

  function beginContinuousSale() onlyOwner public {
      require(crowdsale.finalizationProperties(0).isFinalized());

      crowdsale.token().transferOwnership(continuousSale); //Does this work?! how about ownership?

      continuousSale.start();
      continuousSale.transferOwnership(owner);
  }

  function finalize() public onlyOwner {
      finalizationProperty.finalize();
  }

}
