
pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import './CrowdsaleProperty.sol';
import './CappedProperty.sol';
import './WhitelistedProperty.sol';
import './Crowdsale.sol';


contract CrowdsaleFactory {
  using SafeMath for uint256;

  //address[] public crowdsales; //Alternative
  event CrowdsaleCreated(address _from, Crowdsale addr);
  event PropertyAdded(CrowdsaleProperty property);

  function createCrowdsale(uint256 _startTime, uint256 _endTime, uint256 _rate, address _wallet, uint256 _cap, address[] _whitelist) public returns(Crowdsale) {

    //_startTime = now;
    //_endTime = now + 1000;
    //uint256 _rate = 1;
    //address _wallet = 0x11;
    //uint _cap = 2;
    //address[] _whitelist = [address(msg.sender)];

    Crowdsale crowdsale = new Crowdsale(_startTime, _endTime, _rate, _wallet);

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

    //crowdsales.push(crowdsale); //Alternative
    CrowdsaleCreated(msg.sender, crowdsale);
    return crowdsale;
  }

  /* Alternative
    function getCrowdsaleAddressAtIndex(uint i) constant returns(address c) {
    return crowdsales[i];
  }*/

}
