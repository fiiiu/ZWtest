# TODO

## Design
- Crowdsale Factory: creation event vs. vector of crowdsales? Now implemented with event.

## Environment
- Implement and polish tests.

## Questions
- Whitelist for beneficiaires or purchase makers? Now implemented for beneficiaries.
- FinalizableProperty issues:
  - onlyOwner decorator: trouble with multiple inheritance!
  - Need to pass a function to Factory for finalize! How to do this/desirable? Pass a contract address and execute this? But then need to pass all data, reasonable?
  - New approach with separate finalization properties.. Still need a method: inherit a property from this and then manually add through Factory? Strange. Plus.. who owns stuff?! Should declare some owner somewhere and pass ownership around?
- Security: anyone can add properties to Crowdsale! Enforce ending with cap, etc.. Should we use Ownable? Same for finalizing..
- Overloading createCrowdsale failed! Compiles, runs with minimum # of args, but not with more!
