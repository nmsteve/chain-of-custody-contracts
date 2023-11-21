// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Case.sol";

contract CaseFactory {
    address public admin;

    struct CaseData {
        address caseContractAddress;
        uint256 caseID;
        uint256 deploymentDate;
        bool active;
    }

    mapping(uint256 => CaseData) public cases;
    mapping(address => bool) public authorizedUsers;

    string[] public evidenceStages;
    uint256[] public caseIDs;

    event CaseDeployed(
        uint256 indexed caseID,
        address caseContractAddress,
        uint256 deploymentDate
    );

    event CaseDisabled(uint256 indexed caseID);
    event CaseEnabled(uint256 indexed caseID);
    event AuthorizedUserAdded(address userAddress);
    event AuthorizedUserRemoved(address userAddress);
    event StagesSet(address admin, string[] stages);
    event AdminUpdated(address newAdmin);


    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyAuthorized() {
        require(
            authorizedUsers[msg.sender] || msg.sender == admin,
            "Not authorized to deploy the chain of custody"
        );
        _;
    }

    /**
     * @dev Add an address as an authorized user.
     * @param _userAddress The address to be authorized.
     */
    function addAuthorizedUser(address _userAddress) public onlyAdmin {
        authorizedUsers[_userAddress] = true;
        emit AuthorizedUserAdded(_userAddress);
    }

    /**
     * @dev Remove an address from the list of authorized users.
     * @param _userAddress The address to be removed from the list of authorized users.
     */
    function removeAuthorizedUser(address _userAddress) public onlyAdmin {
        authorizedUsers[_userAddress] = false;
        emit AuthorizedUserRemoved(_userAddress);
    }

    /**
     * @dev Set the stages for use when deploying a case.
     * @param _stages The array of stage names.
     */
    function setCaseStages(string[] memory _stages) public onlyAdmin {
        evidenceStages = _stages;
         emit StagesSet(admin, _stages);
    }

    /**
     * @dev Update the admin address.
     * @param _newAdmin The address of the new admin.
     */
    function setAdmin(address _newAdmin) public onlyAdmin {
        require(_newAdmin != address(0), "Invalid admin address");
        admin = _newAdmin;
        emit AdminUpdated(_newAdmin);
    }

    /**
     * @dev Deploy a new case contract.
     * @param _caseID The ID of the new case.
     */
    function deployCase(uint256 _caseID, address _admin, address _deployer) public onlyAuthorized {
        require(cases[_caseID].caseID == 0, "Case with this ID already exists");
        uint256 deploymentDate = block.timestamp;
        Case newCase = new Case(_admin, _deployer, evidenceStages);
        cases[_caseID] = CaseData(address(newCase), _caseID, deploymentDate, true);
        caseIDs.push(_caseID);

        emit CaseDeployed(_caseID, address(newCase), deploymentDate);
    }

    /**
     * @dev Disable a case, preventing further actions.
     * @param _caseID The ID of the case to be disabled.
     */
    function disableCase(uint256 _caseID) public onlyAdmin {
        require(cases[_caseID].caseID != 0, "Case with this ID does not exist");
        require(cases[_caseID].active == true, "Case is already disabled");
        cases[_caseID].active = false;

        emit CaseDisabled(_caseID);
    }

    /**
     * @dev Enable a case, allowing actions to be performed.
     * @param _caseID The ID of the case to be enabled.
     */
    function enableCase(uint256 _caseID) public onlyAdmin {
        require(cases[_caseID].caseID != 0, "Case with this ID does not exist");
        require(cases[_caseID].active == false, "Case is already enabled");
        cases[_caseID].active = true;

        emit CaseEnabled(_caseID);
    }

    /**
     * @dev Get all stages used when deploying a case.
     * @return The array of stage names.
     */
    function getCaseStages() public view returns (string[] memory) {
        return evidenceStages;
    }

    /**
     * @dev Get all case IDs used when deploying a case.
     * @return The array of case IDS.
     */
    function getCaseIDs() public view returns (uint256[] memory) {
        return caseIDs;
    }

    /**
     * @dev Get the status of a case (active or disabled).
     * @param _caseID The ID of the case for which the status is requested.
     * @return The status of the case.
     */
    function getCaseStatus(uint256 _caseID) public view returns (bool) {
        return cases[_caseID].active;
    }

     /**
     * @dev Get cases within a specified range.
     * @param _startPoint The starting index of the range.
     * @param _endPoint The ending index of the range.
     * @return Arrays of case contract addresses, case IDs, deployment dates, and case statuses.
     */
    function getCasesInRange(uint256 _startPoint, uint256 _endPoint)
        public
        view
        returns (
            address[] memory,
            uint256[] memory,
            uint256[] memory,
            bool[] memory
        )
    {
        require(_startPoint < _endPoint, "Invalid range");

        uint256 endPoint = _endPoint < caseIDs.length ? _endPoint : caseIDs.length;

        address[] memory caseAddresses = new address[](endPoint - _startPoint);
        uint256[] memory caseIds = new uint256[](endPoint - _startPoint);
        uint256[] memory deploymentDates = new uint256[](endPoint - _startPoint);
        bool[] memory caseStatuses = new bool[](endPoint - _startPoint);

        for (uint256 i = _startPoint; i < endPoint; i++) {
            CaseData storage caseData = cases[caseIDs[i]];
            caseAddresses[i - _startPoint] = caseData.caseContractAddress;
            caseIds[i - _startPoint] = caseData.caseID;
            deploymentDates[i - _startPoint] = caseData.deploymentDate;
            caseStatuses[i - _startPoint] = caseData.active;
        }

        return (caseAddresses, caseIds, deploymentDates, caseStatuses);
    }

    

    

}
