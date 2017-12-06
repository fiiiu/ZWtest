pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './ValidationProperty.sol';

// Only whitelisted addresses can be beneficiaries in token purchases.
// --Alternative: only whitelisted can initiate purchases--

contract WhitelistedProperty is ValidationProperty{
  using SafeMath for uint256;

  address[] public whitelist;

  function WhitelistedProperty(address[] _whitelist) public {

    whitelist = _whitelist;
  }

  //this one needed internal -> public
  function validPurchase(address purchaser, uint256 value) public view returns (bool) {
    return isWhitelisted(purchaser);
  }

  function isWhitelisted(address who) public view returns (bool) {
    bool _whitelisted = false;
    for(uint i = 0; i < whitelist.length; i++){
      if(who == whitelist[i]){
        _whitelisted = true;
      }
    }
    return _whitelisted;
  }

}
