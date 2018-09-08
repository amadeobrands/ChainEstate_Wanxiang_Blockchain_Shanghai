var Building = artifacts.require("./Building.sol");

module.exports = function(deployer) {
  deployer.deploy(Building, "CBD", "Hangzhou, China", "http://htpark.com/avatar").then(function(inst) {
    inst.addFloors(10, 2400, 550, 1);
  });
};
