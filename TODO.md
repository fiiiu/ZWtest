# TODO

## Design

## Questions
- Overloading createCrowdsale only works from solidity, now web3. reported bug, workarounds don't work for me :()
- Why must property arrays OUTSIDE function?! memory/storage related, but I don't quite get it
- GIANT gas usage, ok? (though repeated tests.. maybe reasonable)
- sketchy test in MANACrowdsale.js, it('owner can set the price for a particular buyer'), using LOTS of gas.. (revealed in the following test failing..). something strange here though. maybe some reveted calls are draining all gas and I'm not catching them.. 
