var walletprovider;
try {
  // "truffle-wallet.js" file is not checked into version control since it contains sensitive information
  walletprovider = require('./truffle-wallet');
} catch (ex) {
  // implementation of null wallet provider so deployments won't fail when truffle-wallet.js file is not available
  walletprovider = {
    mainnet: function() {return null;},
    ropsten: function() {return null;},
    rinkeby: function() {return null;},
    kovan: function() {return null;}
  }
}

module.exports = {
  networks: {
    localnet: {
      host: "localhost",
      port: 8545,
      network_id: "*",
      gas: 4600000
    },
    ganache: {
      host: "localhost",
      port: 7545,
      network_id: "5777",
      gas: 4600000
    },
    ganache1: {
      host: "localhost",
      port: 7545,
      network_id: "5777",
      from: "0xB64A5473a6AC746B3efD0E3007ECC62F43DbB399",
      gas: 4600000
    },
    mainnet: {
      provider: walletprovider.mainnet,
      network_id: 1,
      gas: 4700000
    },    
    ropsten: {
      provider: walletprovider.ropsten,
      network_id: 3,
      gas: 4700000
    },
    rinkeby: {
      provider: walletprovider.rinkeby,
      network_id: 4,
      gas: 4700000
    },
    kovan: {
      provider: walletprovider.kovan,
      network_id: 42,
      gas: 4700000
    }
  }  
};
