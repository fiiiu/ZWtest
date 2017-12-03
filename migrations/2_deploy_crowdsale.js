//var Crowdsale = artifacts.require("Crowdsale");
var CrowdsaleFactory = artifacts.require("CrowdsaleFactory");


module.exports = function(deployer) {
  //deployer.deploy(Crowdsale, Date.now(), Date.now()+1, 1, 0x1, 1);
  deployer.deploy(CrowdsaleFactory);//, Date.now(), Date.now()+1, 1, 0x1);
};
