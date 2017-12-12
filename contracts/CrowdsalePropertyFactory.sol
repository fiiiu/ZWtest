
pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import './CrowdsaleProperty.sol';
import './CappedProperty.sol';
import './WhitelistedProperty.sol';
import './FinalizationProperty.sol';

contract CrowdsalePropertyFactory {
  using SafeMath for uint256;

  event PropertyCreated(CrowdsaleProperty addr);

  function createCappedProperty(uint256 _cap) public returns(CappedProperty) {
    require(_cap > 0);
    CappedProperty property = new CappedProperty(_cap);
    PropertyCreated(property);
    return property;
  }

  function createWhitelistedProperty() public returns(WhitelistedProperty) {
    WhitelistedProperty property = new WhitelistedProperty();
    property.transferOwnership(msg.sender);
    PropertyCreated(property);
    return property;
  }

  function createFinalizationProperty() public returns(FinalizationProperty) {
    FinalizationProperty property = new FinalizationProperty();
    PropertyCreated(property);
    return property;
  }

}
