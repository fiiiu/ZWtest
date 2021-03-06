pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './CrowdsaleProperty.sol';
import './Crowdsale.sol';

contract FinalizationProperty is CrowdsaleProperty {
  using SafeMath for uint256;

   bool public isFinalized = false;

   event Finalized();

   /**
    * @dev Must be called after crowdsale ends, to do some extra finalization
    * work. Calls the contract's finalization function.
    */
    // I could have Crowdsale own the property and require caller to be owner, but seems unnecessary..
   function finalize() public {
     require(!isFinalized);
     Crowdsale caller = Crowdsale(msg.sender);
     require(caller.hasEnded());
     finalization();
     Finalized();

     isFinalized = true;
   }

   /**
    * @dev Can be overridden to add finalization logic. The overriding function
    * should call super.finalization() to ensure the chain of finalization is
    * executed entirely.
    */
   function finalization() internal {
   }

}
