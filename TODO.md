# TODO

## Design
- Crowdsale Factory: creation event vs. vector of crowdsales? Now implemented with event.
- Whitelist for beneficiaires or purchase makers? Now implemented for beneficiaries. *Ask Facu*
- See Questions for FinalizationProperty implementation. Alternatives: Pass a contract address? Does this make sense at all?

## Environment
- Implement and polish tests.

## Questions/Issues
- FinalizationProperty. Implemented like: client inherits a property from this and then is added through Factory (weird). Issues:
  - onlyOwner modifier: Who owns stuff?! Should declare some owner somewhere and pass ownership around? at Crowdsale?
- Security: anyone can add properties to Crowdsale! Enforce ending with cap, etc.. Should we use Ownable? Same for finalization..
- Overloading createCrowdsale failed! Compiles, runs with minimum # of args, but not with more! --separate factory for properties!
- Testing: one for factory, one for each contract type? Or a BIG one?
- Async calls, example in mocha docs looks like I can do them sequentially, yet failing...
- .. but maybe because I can't use contracts as arguments from outside?! I'm guessing this..


## facu
- benef vs purch makers (Facu)
- PropertyFactory, split abstraction, crfact takes two property vectors.
- test: I can use Factory
- await should wait!
- property.address should work! check with event logs from solidity
- IMPLEMENT OWNERSHIP MESS, facu's change in property, crowdsale is ownable, factory transfers OWNERSHIP, maybe add onlyOwner in property too? *think*


# Next
- tests
- real crowdsale
