// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Accounts {
    address public admin;

    struct User {
        address userAddress;
        string passwordHash;
        bool isActive;
        uint256 lastLogin;
    }

    mapping(uint256 => User) public users;
    uint256 public nextUserId = 0;

    event UserCreated(uint256 userId, address userAddress);
    event UserUpdated(uint256 userId, string newPasswordHash);
    event UserStateSet(bool userState);
    event UserLogin(uint256 userId, uint256 lastLogin);
    event AdminUpdated(address);

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
    function addUser(
        address _userAddress,
        string memory _passwordHash
    ) public onlyAdmin {
        require(_userAddress != address(0), "Invalid user address");
        require(
            bytes(_passwordHash).length > 0,
            "Password hash cannot be empty"
        );

        users[nextUserId] = User(_userAddress, _passwordHash, true, 0);
        emit UserCreated(nextUserId, _userAddress);
        nextUserId++;
    }

    /**
     * @dev Get the user's address and password hash by their user ID.
     * @param _userId The ID of the user.
     * @return The user's Ethereum address and password hash.
     */
    function getUser(
        uint256 _userId
    ) public view returns (address, string memory, bool) {
        require(_userId < nextUserId, "User does not exist");
        User storage user = users[_userId];
        return (user.userAddress, user.passwordHash, user.isActive);
    }

    /**
     * @dev Record a login for the user with the provided ID.
     * @param _userId The ID of the user.
     */
    function login(uint256 _userId) public {
        require(_userId < nextUserId, "User does not exist");
        require(
            msg.sender == users[_userId].userAddress,
            "Not authorized to record login for this user"
        );

        User storage user = users[_userId];
        user.lastLogin = block.timestamp;
        emit UserLogin(_userId, user.lastLogin);
    }

    /**
     * @dev set a user state to active or inactive.
     * @param _userId The ID of the user to set state
     * @param _state The state to set  true or false
     */
    function setUserState(uint256 _userId, bool _state) public onlyAdmin {
        require(_userId < nextUserId, "User does not exist");
        User storage user = users[_userId];
        user.isActive = _state;
        emit UserStateSet(_state);
    }

    /**
     * @dev Update the user's address and password hash by their user ID.
     * @param _userId The ID of the user to update.
     * @param _newPasswordHash The new password hash.
     */
    function updateUser(
        uint256 _userId,
        string memory _newPasswordHash
    ) public onlyAdmin {
        require(_userId < nextUserId, "User does not exist");
        require(
            bytes(_newPasswordHash).length > 0,
            "Password hash cannot be empty"
        );

        User storage user = users[_userId];
        user.passwordHash = _newPasswordHash;

        emit UserUpdated(_userId, _newPasswordHash);
    }

    /**
     * @dev Get all user IDs and addresses.
     * @return Arrays of user addresses.
     */
    function getAllUsers() public view returns (address[] memory) {
        address[] memory userAddresses = new address[](nextUserId);

        for (uint256 i = 0; i < nextUserId; i++) {
            userAddresses[i] = users[i].userAddress;
        }

        return (userAddresses);
    }

    /**
     * @dev Update the contract admin.
     * @param _newAdmin The address of the new admin.
     */
    function updateAdmin(address _newAdmin) public onlyAdmin {
        require(_newAdmin != address(0), "Invalid admin address");
        admin = _newAdmin;
        emit AdminUpdated(_newAdmin);
    }
}
