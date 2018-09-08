import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';

window.ChainEstateApp = {
    buildingContract: null,
    account: null,

    InitPage: function() {
        self = this;

        window.addEventListener('load', function() {
            self.InitWeb3();
        });
    },

    InitWeb3: function() {
        var self = this;

        // Checking if Web3 has been injected by the browser (Mist/MetaMask)
        if (typeof web3 !== 'undefined') {
            console.warn("Using web3 detected from external source");
            // Use Mist/MetaMask's provider
            window.web3 = new Web3(web3.currentProvider);
        } else {
            console.warn("No web3 detected");
            // Falling back to http://localhost:8545. This should be removed for production
            window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        }

        // Watch for metamask account change
        var cs = web3.currentProvider.publicConfigStore;
        if (cs) {
            cs.on('update', function(obj) {
                ChainEstateApp.RefreshAccount(obj.selectedAddress);
            });
        }

        // Load contract
        var p = [];
        p.push(this.GetContract('../contracts/Building.json', c => {self.dripToken=c}));
        Promise.all(p);
    },

    RefreshAccount: function(acct) {
        self = this;
    },

    CheckUser: function() {
        self = this;

        console.log("Getting Account");

        web3.eth.getAccounts().then(function(accs) {
            if (accs.length > 0) {
                self.account = accs[0].toLowerCase();
                if (self.account == self.buildingContract)
                    CheckRedirect(0);
                else
                    CheckRedirect(1);
            } else
                CheckRedirect(2);

        }).catch(function(error) {
            console.error(error);
            self.account = null;
            CheckRedirect(2);
        });
    
    },

    CheckRedirect: function(state) {
        if (state == 0) {
            if (!window.location.contains("real-estate-broker"))
                window.location = "/dashboard/real-estate-broker.html";
        } else if (state == 1) {
            if (!window.location.contains("leaser"))
                window.location = "/dashboard/leaser.html";
        } else {
            if (!window.location.contains("need-metamask"))
                window.location = "/dashboard/need-metamask.html";
        }
    },

    GetContract: function(url, setContract) {
        // Utility function to retrieve contract artifact and create the contract object (async)
        return new Promise(function(resolve, reject) {
            console.log('Getting contract data at ' + url);
            fetch(url).then(function(response){
                return response.json();
            }).then(function(data){
                var c = contract(data);
                c.setProvider(web3.currentProvider);
                setContract(c);
                console.log('Done contract at ' + url);
                resolve();
            }).catch(function(err){
                reject(err);
            });
        });
    }
};

ChainEstateApp.InitPage();