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
