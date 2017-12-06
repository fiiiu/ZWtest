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
  function validPurchase(Crowdsale caller, address beneficiary, uint256 value) public view returns (bool) {
     bool authorizedBuyer = false;
     //This can probably be improved with a mapping, without traversing the list.
     for(uint i = 0; i < whitelist.length; i++){
       if(beneficiary == whitelist[i]){
         authorizedBuyer = true;
       }
     }
   return authorizedBuyer;
   }

}
