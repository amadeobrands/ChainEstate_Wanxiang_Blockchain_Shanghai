import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';

window.ChainEstateApp = {
    buildingContract: null,
    spaceContract: null,
    buildingAddress: null,
    spaceAddress: null,
    buildingOwner: null,
    account: null,
    spaces: null,

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
        p.push(this.GetContract('../contracts/Building.json', c => {self.buildingContract=c}));
        p.push(this.GetContract('../contracts/Space.json', c => {self.spaceContract=c}));
        var buildingInst;
        Promise.all(p).then(function() {
            return self.buildingContract.deployed();
        }).then(function(inst) {
            buildingInst = inst;
            self.buildingAddress = inst.address;
            console.log("Building Contract At: " + inst.address);

            return inst.owner.call();
            
        }).then(function(value) {
            self.buildingOwner = value.valueOf();
            console.log("Building Owner: " + self.buildingOwner);

            return buildingInst.spaces.call();
        }).then(function(spInst) {
            console.log("Space Contract At: " + spInst.valueOf());

            self.spaceContract.at(spInst.valueOf());
            self.spaceAddress = spInst.valueOf();

            self.ReloadData();
        });
    },

    RefreshAccount: function(acct) {
        if (acct != this.account) {
            console.log("Account Change: " + acct);
            this.account = acct;
            this.ReloadData();
        }
    },

    ReloadData: function() {
        self = this;

        web3.eth.getAccounts().then(function(accs) {
            if (accs.length > 0) {
                self.account = accs[0].toLowerCase();
                if (self.account == self.buildingOwner)
                    self.CheckRedirect(0);
                else
                    self.CheckRedirect(1);
            } else {
                self.account = null;
                self.CheckRedirect(2);
            }

            self.GetAllSpaces();
        }).catch(function(error) {
            console.error(error);
            //self.account = null;
            //self.CheckRedirect(2);
        });
    },

    CheckRedirect: function(state) {
        console.log("Page State: " + state);
        if (state == 0) {
            if (!window.location.href.includes("real-estate-broker"))
                window.location.replace("./real-estate-broker.html");
        } else if (state == 1) {
            if (!window.location.href.includes("leaser"))
                window.location.replace("./leaser.html");
        } else {
            if (!window.location.href.includes("need-metamask"))
                window.location.replace("./need-metamask.html");
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
    },

    GetSpace: function(inst, owner, index, result) {
        return new Promise(function(resolve, reject) {
            console.log("Getting Space " + index);

            var prom, id;
            if (owner)
                prom = inst.tokenOfOwnerByIndex.call(owner, index);
            else
                prom = inst.tokenByIndex.call(index);

            prom.then(function(val) {
                id = val.valueOf();

                return inst.getSpaceInfo.call(id);
            }).then(function(res) {
                var v = res.valueOf();
                result.id = id;
                result.name = v[0];
                result.floor = v[1].toNumber();
                result.size = v[2].toNumber();
                result.price = v[3].toNumber();
                result.status = v[4].toNumber();
                result.leasee = v[5];
                result.enddate = v[6];

                resolve();
            }).catch(function(err) {
                reject(err);
            })
        });
    },

    GetAllSpaces: function() {
        self = this;

        var buildingInst;

        console.log("Getting all spaces");
        self.spaceContract.at(self.spaceAddress).totalSupply.call().then(function(value) {
            let count = value.valueOf();
            console.log("Total Spaces: " + count);

            self.spaces = [];
            
            var p = [];
            for (let i = 0; i < count; i++) {
                var r = {};
                self.spaces.push(r);
                p.push(self.GetSpace(self.spaceContract.at(self.spaceAddress), null, i, r));    
            }

            return Promise.all(p);
        }).then(function() {
            console.log(self.spaces);
        }).catch(function(err) {
            console.error(err);
        });
    },

    StartLease: function(id, enddate) {
        console.log("Starting lease: " + id);

        self.spaceContract.at(self.spaceAddress).startLease(id, "2019-09-10").then(function() {
            GetAllSpaces();
        }).catch(function(err) {
            console.error(err);
        });
    },

    SplitSpace: function(id, size, price) {
        console.log("Splitting space: " + id);

        self.spaceContract.at(self.spaceAddress).splitSpace(id, size, price).then(function(newid) {
            console.log("New space created: " + newid.valueOf());
            GetAllSpaces();
        }).catch(function(err) {
            console.error(err);
        });
    }
};

ChainEstateApp.InitPage();