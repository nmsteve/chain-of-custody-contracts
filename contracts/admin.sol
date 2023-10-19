// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AdminContract {
    address public admin;

    struct User {
        address userAddress;
        string passwordHash;
    }

    mapping(uint256 => User) public users;
    uint256 public nextUserId = 1;

    event UserCreated(uint256 userId, address userAddress);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    function addUser(address _userAddress, string memory _passwordHash) public onlyAdmin {
        require(_userAddress != address(0), "Invalid user address");
        require(bytes(_passwordHash).length > 0, "Password hash cannot be empty");

        users[nextUserId] = User(_userAddress, _passwordHash);
        emit UserCreated(nextUserId, _userAddress);
        nextUserId++;
    }

    function getUser(uint256 _userId) public view returns (address, string memory) {
        require(_userId > 0 && _userId < nextUserId, "User does not exist");
        User storage user = users[_userId];
        return (user.userAddress, user.passwordHash);
    }
}
