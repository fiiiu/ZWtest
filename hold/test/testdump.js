// APPROACH A
//var factory = CrowdsaleFactory.new();
// var factory = CrowdsaleFactory.at("0x3922264e82c8ccf990e425af3ead540fcf0a7a09");
//
// //web3.eth.contract()
// //console.log(factory);
// var creationEvent = factory.Creation();
// creationEvent.watch(function(error, result) {
//   if (!error) {
//       console.log('yay');
//       console.log(result);
//       //return result.args.addr;
//   } else { console.log('boo'); }
// });
//
// factory.createCrowdsale(0);
//
// creationEvent.get(function(error, logs){
//   if (!error) {
//     console.log('yayoo');
//     console.log(logs);
//     //return result.args.addr;
// } else { console.log('booox'); } });
//
// creationEvent.stopWatching();
//


// APPROACH C
// contract("CrowdsaleFactory", function() {
//
//     it("wiieieii", function(done){
//     //CrowdsaleFactory.deployed().then(function(instance) {
//     //var cf = CrowdsaleFactory.deployed();
//     var events = instance.Creation();
//     cf.createCrowdsale(0).then(new Promise(
//       function(resolve, reject){
//         events.watch(function(error, log){ resolve(log, done); });
//       }).then(function(log, done){
//         assert.equal(log.event, "error", "ev mbe");
//       }).then(done).catch(done));
//     });
//   });
  //
  //   send({from: accounts[0], value: web3.toWei(5, 'ether')}).then(new Promise(
  //     function(resolve, reject){
  //       events.watch(function(error, log){ resolve(log, done); });
  //   }).then(function(log, done){
  //     assert.equal(log.event, "Error", "Event must be an Error");
  //   }).then(done).catch(done));
  // });


// APPROACH B --SUCCESSSSSS
// CrowdsaleFactory.deployed().then(function(instance) {
//      //console.log(instance);
//      return instance.createCrowdsale(0);
// }).then(function(result) {
//      console.log('w');
//
//      // We can loop through result.logs to see if we triggered the Transfer event.
//      for (var i = 0; i < result.logs.length; i++) {
//        var log = result.logs[i];
//        if(log.event == "Creation") {
//          // We found the event!
//          console.log('waa');
//          console.log(log.args);
//          var crowdsale = Crowdsale.at(log.args.addr);
//          //console.log(crowdsale.weiRaised.call());
//          return crowdsale.weiRaised.call(); //check without call()
//          return crowdsale.buyTokens()
//          //break;
//        }
//      }
//  }).then(function (weis) { console.log(weis.toNumber()); });



// APPROACH D -- with vector version of factory
     //var creationEvent = instance.Creation();
//     creationEvent.watch(function(error, result) {
//       if (!error) {
//           console.log('yay')
//           return result.args.addr;
//       } else { console.log('boo'); }
//     });
//     instance.createCrowdsale(0);
//     console.log('addr', addr);
//     })
//     // instance.createCrowdsale(0).then(function(txn) {
//     // console.log("The txn hash is", txn);
//     //     });
//       });
//     //});
//     // let's make sure this is mined before we continue
//     //return txn;
//     //console.log(web3.eth.getTransactionReceiptMined(txn));
//     //return web3.eth.getTransactionReceiptMined(txn).then(function() {
//     console.log('ea');
//
//     });
//     //instance.getCrowdsaleAddressAtIndex(0).then(function(addr) {
//     //console.log("address", addr);
//     //return Crowdsale.at(addr).then(function(crowdsale) {
//       //console.log("raised", crowdsale.weiRaised());
//     //});
//   });
// //});
//
//         console.log("weiRaised", crowdsale.weiRaised());
//         setTimeout(function(){
//           console.log("weiRaised", crowdsale.weiRaised());
//           return;
//         }, 2000);
//     });
//   });
// });


//
//
// contract("CrowdsaleFactory", function(accounts) {
//
//   //var factory;
//   var account = accounts[0];
//   //var factory = CrowdsaleFactory.new("0x1", {from: account});
//   //var crowdsale = factory.createCrowdsale();
//
//   it('should be happy', function() {
//     return CrowdsaleFactory.deployed().then(function(instance) {
//       return instance.createCrowdsale().then(function(crowdsale) {
//         console.log("ad", crowdsale.address);
//         assert.equal(-1, -1);
//       });
//     });
//   });
// });


// })
//
// contract("CrowdsaleFactory", function(accounts) {
//
//     var factory;
//     var account = accounts[0];
//
//     beforeEach('Deploy a new factory and one "Crowdsale"', function() {
//         // deploy a new factory for each test
//         return CrowdsaleFactory.new("0x1", {from: account})
//         .then(function(_factory) {
//             factory = _factory;
//             // deploy a new Crowdsale so there's something to return in the first slot
//             return factory.createCrowdsale()//"0x1", {from: account})
//             .then(function(txn) {
//                 console.log("The txn hash is", txn);
//                 // let's make sure this is mined before we continue
//                 return txn; //
//                 //return web3.eth.getTransactionReceiptMined(txn);
//             })
//         })
//     })
//
//     it("Should return a Crowdsale address", function() {
//
//         console.log("factory", factory.address);
//         // now check the address
//         return factory.getAddress.call(0)
//         .then(function(_address) {
//             console.log("The Crowdsale Address is", _address);
//             assert.isAbove(_address, "0x0", "The address is empty");
//         })
//     })
//
// })
//
// A handy tool to ensure mining is complete
// https://gist.github.com/xavierlepretre/88682e871f4ad07be4534ae560692ee6


web3.eth.getTransactionReceiptMined = function (txnHash, interval) {
    var transactionReceiptAsync;
    interval = interval ? interval : 500;
    transactionReceiptAsync = function(txnHash, resolve, reject) {
        try {
            var receipt = web3.eth.getTransactionReceipt(txnHash);
            if (receipt == null) {
                setTimeout(function () {
                    transactionReceiptAsync(txnHash, resolve, reject);
                }, interval);
            } else {
                resolve(receipt);
            }
        } catch(e) {
            reject(e);
        }
    };

    if (Array.isArray(txnHash)) {
        var promises = [];
        txnHash.forEach(function (oneTxHash) {
            promises.push(web3.eth.getTransactionReceiptMined(oneTxHash, interval));
        });
        return Promise.all(promises);
    } else {
        return new Promise(function (resolve, reject) {
                transactionReceiptAsync(txnHash, resolve, reject);
            });
    }
};


//const BigNumber = web3.BigNumber;


//eth.getBalance('0x72c5c28aa636b911fe9c0b21ca6a15f60b291389');

//
//
// CrowdsaleFactory
//
// contract('CrowdsaleFactory', function () {
//   it("should create a simple crowdsale", function() {
//     return CrowdsaleFactory.deployed().then(function(instance) {
//       return instance.createCrowdsale.call(Date.now(), Date.now()+1, 11, 0x1);
//     }).then(function(address) {
//       assert.equal(address, 0x1, "oh!");
//     });
//   });
// });


//   const rate = new BigNumber(1000);
//   const cap = 300;
//   const wallet = 0x1;
//   startTime = Date.now();
//   endTime = startTime + 1;
//   it("Should deploy!", function() { return Crowdsale.deployed(startTime, endTime, rate, wallet, cap).then(function(instance) {return instance.getBalance.call();
//     });
//   });
// })
