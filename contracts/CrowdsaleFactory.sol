
pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import './CrowdsaleProperty.sol';
import './ValidationProperty.sol';
import './FinalizationProperty.sol';
import './Crowdsale.sol';


contract CrowdsaleFactory {
  using SafeMath for uint256;

  event CrowdsaleCreated(address _from, Crowdsale addr);
  event PropertyAdded(CrowdsaleProperty property);

  function createCrowdsale(uint256 _startTime, uint256 _endTime, uint256 _rate, address _wallet, ValidationProperty[] _validationProperties, FinalizationProperty[] _finalizationProperties) public returns(Crowdsale) {

    Crowdsale crowdsale = new Crowdsale(_startTime, _endTime, _rate, _wallet);
    CrowdsaleCreated(msg.sender, crowdsale);

    if(_validationProperties.length > 0){
      for(uint i = 0; i < _validationProperties.length; i++) {
        crowdsale.addValidationProperty(_validationProperties[i]);
        PropertyAdded(_validationProperties[i]);
      }
    }

    if(_finalizationProperties.length > 0){
      for(uint j = 0; j < _finalizationProperties.length; j++) {
        crowdsale.addFinalizationProperty(_finalizationProperties[j]);
        PropertyAdded(_finalizationProperties[j]);
      }
    }

    crowdsale.transferOwnership(msg.sender);
    return crowdsale;
  }

}
