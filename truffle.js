require('babel-register');
require('babel-polyfill');

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      gas: 10000000000,
      //gas: 0xfffffffffff,
      //gasPrice: 0x01,
      network_id: "*" // Match any network id
    }
  }
};
