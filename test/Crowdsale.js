// some verbose console.log()s to illustrate what's happening
// $ truffle build
// $ truffle test
// $ should see the first created contract address returned

const CrowdsaleFactory = artifacts.require('CrowdsaleFactory');
const Crowdsale = artifacts.require('Crowdsale');


 // APPROACH B' --test capped
// var amountBought = 17;
// contract("CrowdsaleFactory", function(accounts) {
//   it('should be happy', function() {
//     return CrowdsaleFactory.deployed().then(function(instance) {
//       return instance.createCrowdsale(0);
//     }).then(function(result) {
//       console.log('w');
//
//       // We can loop through result.logs to see if we triggered the Transfer event.
//       for (var i = 0; i < result.logs.length; i++) {
//         var log = result.logs[i];
//         if(log.event == "PropertyAdded") {
//           console.log('Property added!');
//         }
//         if(log.event == "CrowdsaleCreated") {
//           // We found the event!
//           console.log('Crowdsale created!');
//           console.log(log.args);
//           var crowdsale = Crowdsale.at(log.args.addr);
//           //console.log(crowdsale.weiRaised.call());
//           //return crowdsale.weiRaised.call(); //check without call()
//           crowdsale.buyTokens(accounts[0], {value: amountBought}).then(function() {
//             //return crowdsale.hasEnded();
//             return crowdsale.weiRaised.call().then(function(weis) {
//                   //assert.equal(hasEnded, true)
//                   console.log("weiRaised: ", weis.toNumber());
//                   assert.equal(weis.toNumber(), amountBought);
//                   return crowdsale.hasEnded().then(function (has) {
//                       console.log("hasEnded: ", has);
//                   });
//             });
//           }).catch(function(e) {
//             console.log("invalid buy?");
//             });
//         }
//       }
//     });
//   });
// });


//test purchase validity
var amountBought = 14;
contract("CrowdsaleFactory", function(accounts) {
 it('should allow/disallow purchase', function() {
   return CrowdsaleFactory.deployed().then(function(instance) {
     return instance.createCrowdsale(0, [accounts[4], accounts[1]]);
   }).then(function(result) {
     console.log('w');
     var crowdsale;
     // We can loop through result.logs to see if we triggered the Transfer event.
     for (var i = 0; i < result.logs.length; i++) {
       var log = result.logs[i];
       if(log.event == "PropertyAdded") {
         console.log('Property added!');
       }
       if(log.event == "CrowdsaleCreated") {
         console.log('Crowdsale created!');
         console.log(log.args);
         crowdsale = Crowdsale.at(log.args.addr);
       }
     }
     return crowdsale; }).then(function(crowdsale) {
        crowdsale.buyTokens(accounts[1], {value: amountBought}).then(function() {
        return crowdsale.weiRaised.call().then(function(weis) {
         //assert.equal(hasEnded, true)
         console.log("weiRaised: ", weis.toNumber());
         //assert.equal(weis.toNumber(), amountBought);
         // return crowdsale.hasEnded().then(function (has) {
         //     console.log("hasEnded: ", has);
         //    });
            });
         }).catch(function(e) {
           console.log("invalid buy?");
         });
       });
  });
});

//test hasEnded
var amountBought = 14;
contract("CrowdsaleFactory", function(accounts) {
 it('should end crowdsale', function() {
   return CrowdsaleFactory.deployed().then(function(instance) {
     return instance.createCrowdsale(15, [accounts[1]]);
   }).then(function(result) {
     console.log('w');
     var crowdsale;
     // We can loop through result.logs to see if we triggered the Transfer event.
     for (var i = 0; i < result.logs.length; i++) {
       var log = result.logs[i];
       if(log.event == "PropertyAdded") {
         console.log('Property added!');
       }
       if(log.event == "CrowdsaleCreated") {
         console.log('Crowdsale created!');
         console.log(log.args);
         crowdsale = Crowdsale.at(log.args.addr);
       }
     }
     return crowdsale; }).then(function(crowdsale) {
        crowdsale.buyTokens(accounts[1], {value: amountBought}).then(function() {
        return crowdsale.hasEnded.call().then(function(ended) {
         //assert.equal(hasEnded, true)
         console.log("hasEnded: ", ended);
         //assert.equal(weis.toNumber(), amountBought);
         // return crowdsale.hasEnded().then(function (has) {
         //     console.log("hasEnded: ", has);
         //    });
            });
         }).catch(function(e) {
           console.log("invalid buy?");
         });
       });
  });
});
