//var Crowdsale = artifacts.require("Crowdsale");
var MANACrowdsale = artifacts.require("MANACrowdsale");


module.exports = function(deployer) {
  //deployer.deploy(Crowdsale, Date.now(), Date.now()+1, 1, 0x1, 1);
  deployer.deploy(MANACrowdsale, Date.now(), Date.now()+1000, 1, 1, 1, 0x1);
};
