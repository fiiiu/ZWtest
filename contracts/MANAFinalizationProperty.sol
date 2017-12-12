pragma solidity ^0.4.18;

import "./FinalizationProperty.sol";
import "./MANACrowdsale.sol";
import "./Crowdsale.sol";

contract MANAFinalizationProperty is FinalizationProperty {

  function finalization() internal {
      MANACrowdsale manaCrowdsale = MANACrowdsale(msg.sender);
      Crowdsale crowdsale = manaCrowdsale.crowdsale();
      uint256 totalSupply = crowdsale.token().totalSupply();
      uint256 finalSupply = manaCrowdsale.TOTAL_SHARE().mul(totalSupply).div(manaCrowdsale.CROWDSALE_SHARE());

      // emit tokens for the foundation
      crowdsale.token().mint(crowdsale.wallet(), manaCrowdsale.FOUNDATION_SHARE().mul(finalSupply).div(manaCrowdsale.TOTAL_SHARE()));

      // NOTE: cannot call super here because it would finish minting and
      // the continuous sale would not be able to proceed
  }


}
