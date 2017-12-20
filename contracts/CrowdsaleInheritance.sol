
pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './ValidationProperty.sol';
import './FinalizationProperty.sol';

/**
 * @title Crowdsale
 * @dev Crowdsale is a base contract for managing a token crowdsale.
 * Crowdsales have a start and end timestamps, where investors can make
 * token purchases and the crowdsale will assign them tokens based
 * on a token per ETH rate. Funds collected are forwarded to a wallet
 * as they arrive.
 */

contract CrowdsaleInheritance is Ownable {
  using SafeMath for uint256;

  // The token being sold
  MintableToken public token;

  // start and end timestamps where investments are allowed (both inclusive)
  uint256 public startTime;
  uint256 public endTime;

  // address where funds are collected
  address public wallet;

  // how many token units a buyer gets per wei
  uint256 public rate;

  // amount of raised money in wei
  uint256 public weiRaised;

  /**
   * event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param beneficiary who got the tokens
   * @param value weis paid for purchase
   * @param amount amount of tokens purchased
   */
  event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

  ValidationProperty[] public validationProperties;
  FinalizationProperty[] public finalizationProperties;

  function CrowdsaleInheritance(uint256 _startTime, uint256 _endTime, uint256 _rate, address _wallet) public {
    require(_startTime >= now);
    require(_endTime >= _startTime);
    require(_rate > 0);
    require(_wallet != address(0));

    token = createTokenContract();
    startTime = _startTime;
    endTime = _endTime;
    rate = _rate;
    wallet = _wallet;
    validationProperties.length = 0;
    finalizationProperties.length = 0;
  }

  function setRate(uint256 _rate) external onlyOwner {
    require(_rate > 0);
    rate = _rate;
  }

  function setWallet(address _wallet) external onlyOwner {
    require(_wallet != address(0));
    wallet = _wallet;
  }

  function addValidationProperty(ValidationProperty property) public onlyOwner {
    validationProperties.push(property);
  }

  function addFinalizationProperty(FinalizationProperty property) public onlyOwner {
    finalizationProperties.push(property);
  }

  // creates the token to be sold.
  // override this method to have crowdsale of a specific mintable token.
  function createTokenContract() internal returns (MintableToken) {
    return new MintableToken();
  }

  function restoreTokenOwnership() external onlyOwner {
    token.transferOwnership(msg.sender);
  }

  // fallback function can be used to buy tokens
  function () external payable {
    buyTokens(msg.sender);
  }

  // low level token purchase function
  function buyTokens(address beneficiary) public payable {
    require(beneficiary != address(0));
    require(validPurchase(beneficiary, msg.value));

    uint256 weiAmount = msg.value;

    // calculate token amount to be created
    uint256 tokens = weiAmount.mul(rate);

    // update state
    weiRaised = weiRaised.add(weiAmount);

    token.mint(beneficiary, tokens);
    TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);

    forwardFunds();
  }

  // send ether to the fund collection wallet
  // override to create custom fund forwarding mechanisms
  function forwardFunds() internal {
    wallet.transfer(msg.value);
  }

  // @return true if the transaction can buy tokens
  // properties can override default crowdsale conditions
  function validPurchase(address beneficiary, uint256 value) public view returns (bool) {
    bool withinPeriod = now >= startTime && now <= endTime;
    bool nonZeroPurchase = value != 0;
    bool allConditions = true;
    for(uint i = 0; i < validationProperties.length; i++) {
      allConditions = allConditions && validationProperties[i].validPurchase(beneficiary, value);
    }
    bool validOverriding = false;
    for(uint j = 0; j < validationProperties.length; j++) {
      validOverriding = validOverriding || validationProperties[j].validOverriding(beneficiary, value);
    }
    return (withinPeriod && nonZeroPurchase && allConditions) || (validOverriding && allConditions);
  }

  // @return true if crowdsale event has ended
  function hasEnded() public view returns (bool) {
    bool allConditions = false;
    for(uint i = 0; i < validationProperties.length; i++) {
      allConditions = allConditions || validationProperties[i].hasEnded();
    }
    return now > endTime || allConditions;
  }

  // Finalize if any finalizableProperties
  function finalize() public onlyOwner {
    for(uint i = 0; i < finalizationProperties.length; i++) {
      finalizationProperties[i].finalize();
    }
  }


}
