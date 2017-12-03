
AbiOfContract: what's between []'s after "abi": [ THIS ] in build/contracts/Crowdsale.json

..magic with \n's (did it by hand)...

var contractAbi = eth.contract(AbiOfContract);
var myContract = contractAbi.at(contractAddress);

myContract.hasEnded()
false
