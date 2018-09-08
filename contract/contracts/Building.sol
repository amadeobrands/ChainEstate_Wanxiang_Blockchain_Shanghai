pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

contract Building is MintableToken {
    string public name = "ChainEstate Building Toekn";
    string public symbol = "CEBT";
    uint public decimals = 6;

    string public buildingName;
    string public buildingAddress;
    string public pictureUrl;
    int public numberFloors;
    address public spaces;

    constructor (string name, string addr, string url, int floors) public {
        buildingName = name;
        buildingAddress = addr;
        pictureUrl = url;
    }

    function createSpace(uint32 floor, string name, uint32 size, uint32 price) private returns(uint256) {

    }

    function destroySpace(uint256 id) private {

    }

    function splitSpace(uint256 parent, uint32 size, uint32 price) public returns(uint256) {

    }
}