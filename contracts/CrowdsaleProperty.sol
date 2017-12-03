pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './Crowdsale.sol';

contract CrowdsaleProperty {
  using SafeMath for uint256;

  //The defaults allow for not implementing dummy methods in derived classes
  //The calls are properly directed to children when called from Crowdsale
  function validPurchase(Crowdsale caller, address beneficiary, uint256 value) public view returns (bool) { return true; }
  function hasEnded(Crowdsale caller) public view returns (bool) { return true; }
}
