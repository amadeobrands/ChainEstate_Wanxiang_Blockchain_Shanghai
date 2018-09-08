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

    constructor (string _name, string addr, string url, uint256 floors) public {
        buildingName = _name;
        buildingAddress = addr;
        pictureUrl = url;

        spaces = new Space();
        spaces.createSpace(floors-1, "1F", 4000, 45);
    }
}