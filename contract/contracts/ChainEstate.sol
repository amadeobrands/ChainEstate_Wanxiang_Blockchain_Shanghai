pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Building.sol";

contract ChainEstate is Ownable {

    Building[] public buildings;

    /**
    * @dev Create a new building within ChainEstate eco system
    */
    function createBuilding(string _name, string addr, string url) onlyOwner public returns(address) {
        Building b = new Building(_name, addr, url);
        buildings.push(b);

        // Temporary code to create floors for convenience
        // Should be created based on buing stats by interacting with building contrace
        b.addFloors(20, 2400, 45, 1);

        return b;
    }

    /**
    * @dev Retrieve total number of buildings
    */
    function getBuildingCount() view public returns(uint256) {
        return buildings.length;
    }

    /**
    * @dev Retrieve address of a particular building
    */
    function getBuildingContract(uint256 index) view public returns(address) {
        return buildings[index];
    }
}