pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './CrowdsaleProperty.sol';
import './Crowdsale.sol';

contract ValidationProperty is CrowdsaleProperty {
  using SafeMath for uint256;

  //The defaults allow for not implementing dummy methods in derived classes
  //The calls are properly directed to children when called from Crowdsale
  function validPurchase(address beneficiary, uint256 value) public view returns (bool) { return true; }
  function hasEnded() public view returns (bool) { return false; }

  //override this function when whitelist needs to override crowdsale validation (but not other properties!)
  function validOverriding(address beneficiary, uint256 value) public view returns (bool) { return false; }

}
