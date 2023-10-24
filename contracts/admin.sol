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
    event UserRemoved(uint256 userId);
    event UserUpdated(uint256 userId, address newUserAddress, string newPasswordHash);

    constructor() {
        admin = msg.sender; // Initialize the admin as the contract creator
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    /**
     * @dev Add a new user with the provided address and password hash.
     * @param _userAddress The user's Ethereum address.
     * @param _passwordHash The user's password hash.
     */
    function addUser(address _userAddress, string memory _passwordHash) public onlyAdmin {
        require(_userAddress != address(0), "Invalid user address");
        require(bytes(_passwordHash).length > 0, "Password hash cannot be empty");

        users[nextUserId] = User(_userAddress, _passwordHash);
        emit UserCreated(nextUserId, _userAddress);
        nextUserId++;
    }

    /**
     * @dev Get the user's address and password hash by their user ID.
     * @param _userId The ID of the user.
     * @return The user's Ethereum address and password hash.
     */
    function getUser(uint256 _userId) public view returns (address, string memory) {
        require(_userId > 0 && _userId < nextUserId, "User does not exist");
        User storage user = users[_userId];
        return (user.userAddress, user.passwordHash);
    }

    /**
     * @dev Remove a user by their user ID.
     * @param _userId The ID of the user to remove.
     */
    function removeUser(uint256 _userId) public onlyAdmin {
        require(_userId > 0 && _userId < nextUserId, "User does not exist");
        emit UserRemoved(_userId);
        delete users[_userId];
    }

    /**
     * @dev Update the user's address and password hash by their user ID.
     * @param _userId The ID of the user to update.
     * @param _newUserAddress The new user's Ethereum address.
     * @param _newPasswordHash The new password hash.
     */
    function updateUser(uint256 _userId, address _newUserAddress, string memory _newPasswordHash) public onlyAdmin {
        require(_userId > 0 && _userId < nextUserId, "User does not exist");
        require(_newUserAddress != address(0), "Invalid user address");
        require(bytes(_newPasswordHash).length > 0, "Password hash cannot be empty");

        User storage user = users[_userId];
        user.userAddress = _newUserAddress;
        user.passwordHash = _newPasswordHash;

        emit UserUpdated(_userId, _newUserAddress, _newPasswordHash);
    }
}
