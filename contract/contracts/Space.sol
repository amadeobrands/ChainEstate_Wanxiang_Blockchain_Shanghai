pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";

contract Space is ERC721Token("ChainEstate Space Token", "CEST") {

    /**
    * @dev Additional data for each space
    */
    struct SpaceInfo {
        string name;
        uint32 floor;
        uint32 size;
        uint32 price;
        uint32 status;
        address leasee;
        string leaseEnd;
        uint32 parent;
    }

    /**
    * @dev Array holding all space info
    */
    SpaceInfo[] spaces;

    /**
    * @dev Retrieve space for a space
    */
    function getSpaceInfo(uint32 id) view public returns(string, uint32, uint32, uint32, uint32, address, string) {
        return (spaces[id].name, spaces[id].floor, spaces[id].size, spaces[id].price, spaces[id].status, spaces[id].leasee, 
            spaces[id].leaseEnd);
    }

    /**
    * @dev Create new space
    */
    function createSpace(uint32 floor, string _name, uint32 size, uint32 price) public returns(uint32) {
        SpaceInfo memory space = SpaceInfo({
            name: _name, 
            floor: floor,
            size: size,
            price: price,
            status: 0,
            leasee: address(0x0),
            leaseEnd: "",
            parent: 0xffffffff});

        uint32 id = uint32(spaces.push(space) - 1);
        _mint(msg.sender, id);
        return(id);
    }

    /**
    * @dev Destroy existing space
    */
    function destroySpace(uint32 id) public {
        _burn(ownerOf(id), id);
    }

    /**
    * @dev Used by landlord to split vacant space, or used by tenants to split unoccupied sublet space
    * New space created is sibling of existing
    */
    function splitSpace(uint32 parent, uint32 size, uint32 price) public returns(uint256) {
        require(spaces[parent].size > size);

        spaces[parent].size = spaces[parent].size - size;
        uint256 newid = createSpace(spaces[parent].floor, spaces[parent].name, size, price);
        spaces[newid].leasee = spaces[parent].leasee;
        spaces[newid].leaseEnd = spaces[parent].leaseEnd;
        spaces[newid].parent = spaces[parent].parent;
    }

    /**
    * @dev Used by tenants to sublet unused leased space. New space created is child of existing
    */
    function subletSpace(uint32 parent, uint32 size, uint32 price) public returns(uint256) {
        require(spaces[parent].size > size);

        spaces[parent].size = spaces[parent].size - size;
        uint256 newid = createSpace(spaces[parent].floor, spaces[parent].name, size, price);
        spaces[newid].leasee = address(0x0);
        spaces[newid].status = 2;
        spaces[newid].parent = parent;
    }

    /**
    * @dev Starting a new lease on an unoccupied space
    */
    function startLease(uint32 id, string leaseEnd) public {
        require(spaces[id].status == 0 || spaces[id].status == 2);

        spaces[id].status = 1;
        spaces[id].leasee = msg.sender;
        spaces[id].leaseEnd = leaseEnd;
    }

    /**
    * @dev Check all spaces for lease end and reset to vacant space for original space, or remove sublet space
    */
    function checkLeaseEnd(/*string today*/) public {
        // Loop through all spaces and update as follows if lease end date has passed
        //      reset status to vacant if no parent
        //      delete space if there is parent (sublet)
        for (uint32 i = 0; i < spaces.length; i++) {
            // Todo: find ways to do "spaces[i].leaseEnd < today"
            if (/*spaces[i].leaseEnd  == today && */spaces[i].status==1) {
                spaces[i].leaseEnd = "";
                if (spaces[i].parent == 0xffffffff) {
                    spaces[i].status = 0;
                }
                else {
                    destroySpace(i);
                    spaces[i].status = 0xffffffff;
                }
            }
        }
    }

    /**
    * @dev Update price for space
    */
    function setSpacePrice(uint32 id, uint32 price) public {
        require(spaces[id].status == 0 || spaces[id].status == 2);

        // Only allow parent leasee to be able to change the price for sublet
        if (spaces[id].status == 2 && msg.sender != spaces[spaces[id].parent].leasee)
            revert();

        spaces[id].price = price;
    }

    /**
    * @dev Update all prices for vacant lots within the floor range
    */
    function setVacantSpacePrice(uint32 fromFloor, uint32 toFloor, uint32 price) public {
        for (uint256 i = 0; i < spaces.length; i++) {
            if (spaces[i].floor >= fromFloor && spaces[i].floor <= toFloor && spaces[i].status == 0) {
                spaces[i].price = price;
            }
        }
    }
}