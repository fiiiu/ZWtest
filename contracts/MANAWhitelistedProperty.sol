pragma solidity ^0.4.18;

import "./WhitelistedProperty.sol";
import "./MANACrowdsale.sol";
import "./decentraland/MANAToken.sol";
import "./Crowdsale.sol";

contract MANAWhitelistedProperty is WhitelistedProperty {
  using SafeMath for uint256; //is this inherited?

  // authorize any purchase, whitelist only for early transactions.
  function validPurchase(address purchaser, uint256 value) public view returns (bool) {
    return true;
  }

  // override crowdsale time, can buy before.
  function validOverriding(address purchaser, uint256 value) public view returns (bool) {
    bool positivePurchase = (value > 0);
    Crowdsale crowdsale = Crowdsale(msg.sender);
    bool beforePeriod = now < crowdsale.startTime();
    return positivePurchase && beforePeriod && isWhitelisted(purchaser);
  }


}
