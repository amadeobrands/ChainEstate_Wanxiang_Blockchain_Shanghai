pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "./Space.sol";

contract Building is MintableToken {
    string public name = "ChainEstate Building Token";
    string public symbol = "CEBT";
    uint public decimals = 6;

    string public buildingName;
    string public buildingAddress;
    string public pictureUrl;
    int public numberFloors;
    Space public spaces;

    /**
    * @dev Constructor that also creates the space ERC721 contract
    */
    constructor (string _name, string addr, string url) public {
        buildingName = _name;
        buildingAddress = addr;
        pictureUrl = url;

        spaces = new Space();
    }

    /**
    * @dev Retrieve the ERC721 space contract associated with the building. 
    *      The contract holds all ERC721 tokens for the building
    */
    function getSpaceContract() view public returns(address) {
        return spaces;
    }

    /**
    * @dev Add a set of floors to the building. This can be called multiple times to add floors with different size or price 
    */
    function addFloors(uint32 floors, uint32 size, uint32 price, uint32 startFloor) onlyOwner public {
        for (uint32 i = 0; i < floors; i++) {
            spaces.createSpace(startFloor + i, "Unit", size, price);
        }
    }

}