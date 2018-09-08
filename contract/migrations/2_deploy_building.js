var Building = artifacts.require("./Building.sol");

module.exports = function(deployer) {
  deployer.deploy(Building, "HT Park", "Shanghai, China", "http://htpark.com/avatar").then(function(inst) {
    inst.addFloors(20, 2400, 45, 1);
  });
};
