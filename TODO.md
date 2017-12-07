# TODO

## Design

## Questions/Issues
- Security: anyone can add properties to Crowdsale! Enforce ending with cap, etc.. Should we use Ownable? Same for finalization..
- Overloading createCrowdsale failed! Compiles, runs with minimum # of args, but not with more! --separate factory for properties! *unsolved*
- Testing: one for factory, one for each contract type? Or a BIG one? *split*

## Next
- FINALIZABLE TEST FAILING FOR NO REASON.. TIME??
- IMPLEMENT OWNERSHIP MESS, facu's change in property --done, CHECK, crowdsale is ownable, factory transfers OWNERSHIP, maybe add onlyOwner in property too? *think*
- PropertyFactory, split abstraction, crfact takes two property vectors.
- learn how to use openZeppelin helpers.. internal imports failing (I solved imports at my project level with babel etc., but can't reproduce this, installing libraries and so on.). solved copypasting :-\
- tests
- real crowdsale
