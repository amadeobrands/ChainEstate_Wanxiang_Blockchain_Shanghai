pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";

contract Space is ERC721Token("ChainEstate Space Token", "CEST") {

    struct SpaceInfo {
        string name;
        uint256 floor;
        uint256 size;
        uint256 price;
        uint256 status;
    }

    SpaceInfo[] spaces;

    function createSpace(uint256 floor, string _name, uint256 size, uint256 price) public returns(uint256) {
        SpaceInfo memory space = SpaceInfo({
            name: _name, 
            floor: floor,
            size: size,
            price: price,
            status: 0});

        uint id = spaces.push(space) - 1;
        _mint(msg.sender, id);
        return(id);
    }

    function destroySpace(uint256 id) public {
        _burn(ownerOf(id), id);
    }

    function splitSpace(uint256 parent, uint256 size, uint256 price) public returns(uint256) {
        require(spaces[parent].size > size);

        spaces[parent].size = spaces[parent].size - size;
        createSpace(spaces[parent].floor, spaces[parent].name, size, price);
    }
}