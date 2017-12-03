pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './CrowdsaleProperty.sol';

contract CappedProperty is CrowdsaleProperty{
  using SafeMath for uint256;

  uint256 public cap;

  function CappedProperty(uint256 _cap) public {
   cap = _cap;
  }

  //this one needed internal -> public
  function validPurchase(Crowdsale caller, address beneficiary, uint256 value) public view returns (bool) {
   bool withinCap = caller.weiRaised().add(value) <= cap;
   return withinCap;
  }

  function hasEnded(Crowdsale caller) public view returns (bool) {
   bool capReached = caller.weiRaised() >= cap;
   return capReached;
  }

}
