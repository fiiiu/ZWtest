# TODO

## Design
- Crowdsale Factory: creation event vs. vector of crowdsales? Now implemented with event.
- Whitelist for beneficiaires or purchase makers? Now implemented for beneficiaries.
- See Questions for FinalizationProperty implementation. Alternatives: Pass a contract address? Does this make sense at all?

## Environment
- Implement and polish tests.

## Questions/Issues
- FinalizationProperty. Implemented like: client inherits a property from this and then is added through Factory (weird). Issues:
  - onlyOwner modifier: Who owns stuff?! Should declare some owner somewhere and pass ownership around? at Crowdsale?
- Security: anyone can add properties to Crowdsale! Enforce ending with cap, etc.. Should we use Ownable? Same for finalization..
- Overloading createCrowdsale failed! Compiles, runs with minimum # of args, but not with more!
