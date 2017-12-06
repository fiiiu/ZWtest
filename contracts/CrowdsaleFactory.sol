
pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import './CrowdsaleProperty.sol';
import './CappedProperty.sol';
import './WhitelistedProperty.sol';
import './FinalizationProperty.sol';
import './Crowdsale.sol';


contract CrowdsaleFactory {
  using SafeMath for uint256;

  event CrowdsaleCreated(address _from, Crowdsale addr);
  event PropertyAdded(CrowdsaleProperty property);

  function createCrowdsale(uint256 _startTime, uint256 _endTime, uint256 _rate, address _wallet, uint256 _cap, address[] _whitelist, FinalizationProperty[] _finalizationProperties) public returns(Crowdsale) {

    Crowdsale crowdsale = new Crowdsale(_startTime, _endTime, _rate, _wallet);
    CrowdsaleCreated(msg.sender, crowdsale);

    if(_cap > 0){
      CappedProperty capped = new CappedProperty(_cap);
      crowdsale.addProperty(capped);
      PropertyAdded(capped);
    }

    if(_whitelist.length > 0){
      WhitelistedProperty whitelisted = new WhitelistedProperty(_whitelist);
      crowdsale.addProperty(whitelisted);
      PropertyAdded(whitelisted);
    }

    if(_finalizationProperties.length > 0){
      for(uint i = 0; i < _finalizationProperties.length; i++) {
        crowdsale.addFinalizationProperty(_finalizationProperties[i]);
        PropertyAdded(_finalizationProperties[i]);
      }
    }

    return crowdsale;
  }

}
