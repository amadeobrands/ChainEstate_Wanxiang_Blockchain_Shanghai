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
        if (window.location.href.includes("building-view"))
            return;

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
            self.PopulateSpaces();
        }).catch(function(err) {
            console.error(err);
        });
    },

    PopulateSpaces: function() {
        self = this;

        var ad = {};
        this.spaces.forEach (function(item) {
            if (!ad[item.floor])
                ad[item.floor] = [];
            ad[item.floor].push(item);
        });

        console.log(ad);

        var acts_view = new Vue(
            {
                el: '#vue_buildings_list',
                data: {
                    asset_details : ad,
                    space_address : self.spaceAddress,
                    split_area:0,
                    split_price:0
                },
                methods: {
                    lease_space: function(id) {
                        self.StartLease(id, "");
                    },
                    performe_split: function (id,size,price) {
                        self.SplitSpace(id, size, price);
                    }
                }
            });
    },

    StartLease: function(id, enddate) {
        self = this;
        console.log("Starting lease: " + id);

        self.spaceContract.at(self.spaceAddress).startLease(id, "2019-09-10", {from: self.account}).then(function() {
            console.log("Transaction Done");
            GetAllSpaces();
        }).catch(function(err) {
            console.error(err);
        });
    },

    SplitSpace: function(id, size, price) {
        self = this;
        console.log("Splitting space: " + id);

        self.spaceContract.at(self.spaceAddress).splitSpace(id, size, price, {from: self.account}).then(function(newid) {
            console.log("New space created: " + newid.valueOf());
            GetAllSpaces();
        }).catch(function(err) {
            console.error(err);
        });
    }
};

ChainEstateApp.InitPage();

/*
var acts_view = new Vue(
    {
        el: '#vue_buildings_list',
        data: {
        buildings_list :[[2,1],[0,2],[0]],
        asset_details : {
            0: [{'m2': 1000}, {'m2': 1002}],
            1: [{'m2': 2000}, {'m2': 1003}],
            2: [{'m2': 3000}, {'m2': 1004}],
            3: [{'m2': 3000}, {'m2': 1004}],
            4: [{'m2': 3000}, {'m2': 1004}],
            5: [{'m2': 3000}, {'m2': 1004}],
            6: [{'m2': 3000}, {'m2': 1004}],
            7: [{'m2': 3000}, {'m2': 1004}],
            8: [{'m2': 3000}, {'m2': 1004}],
            9: [{'m2': 3000}, {'m2': 1004}],
            10: [{'m2': 3000}, {'m2': 1004}],
        },
        split_area:0,
        },
        methods: {
        performe_split:function (floor,idx,new_details) {
            this.asset_details[floor].push(
                new_details
            );

            this.asset_details[floor][idx]['m2']=new_details['m2']
        }
        }
    });
*/