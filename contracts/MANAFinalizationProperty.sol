pragma solidity ^0.4.18;

import "./FinalizationProperty.sol";
import "./MANACrowdsale.sol";
import "./decentraland/MANAToken.sol";
import "./Crowdsale.sol";

contract MANAFinalizationProperty is FinalizationProperty {
  using SafeMath for uint256; //is this inherited?

  //had to duplicate :(
  uint256 public constant TOTAL_SHARE = 100;
  uint256 public constant CROWDSALE_SHARE = 40;
  uint256 public constant FOUNDATION_SHARE = 60;

  function finalization() internal {
      //MANACrowdsale manaCrowdsale = MANACrowdsale(msg.sender);
      //Crowdsale crowdsale = manaCrowdsale.crowdsale();
      Crowdsale crowdsale = Crowdsale(msg.sender);
      //MANAToken token = crowdsale.token();
      uint256 totalSupply = crowdsale.token().totalSupply();
      uint256 finalSupply = TOTAL_SHARE.mul(totalSupply).div(CROWDSALE_SHARE);

      // emit tokens for the foundation
      crowdsale.token().mint(crowdsale.wallet(), FOUNDATION_SHARE.mul(finalSupply).div(TOTAL_SHARE));
      crowdsale.token().transferOwnership(msg.sender);
      // NOTE: cannot call super here because it would finish minting and
      // the continuous sale would not be able to proceed
  }


}
