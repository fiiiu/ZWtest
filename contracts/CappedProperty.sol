pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './ValidationProperty.sol';

contract CappedProperty is ValidationProperty{
  using SafeMath for uint256;

  uint256 public cap;

  function CappedProperty(uint256 _cap) public {
   cap = _cap;
  }

  //this one needed internal -> public
  function validPurchase(address purchaser, uint256 value) public view returns (bool) {
    Crowdsale caller = Crowdsale(msg.sender);
    bool withinCap = caller.weiRaised().add(value) <= cap;
    return withinCap;
  }

  function hasEnded() public view returns (bool) {
    Crowdsale caller = Crowdsale(msg.sender);
    bool capReached = caller.weiRaised() >= cap;
    return capReached;
  }

}
