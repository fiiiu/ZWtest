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
    //change to cast msg.sender + add onlyOwner
   function finalize() public { //removed onlyOwner decorator, Crowdsale is not owner! will fail!
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
