// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CBDC_KYC {
    address public owner; // The address of the CBDC authority

    enum KYCStatus { NotSubmitted, Pending, Approved, Rejected }

    struct KYCRequest {
        uint256 requestId;
        address applicant;
        string fullName;
        string nationalID;
        KYCStatus status;
    }

    mapping(uint256 => KYCRequest) public kycRequests;
    uint256 public totalRequests;
    event CheckBalance(string text, uint amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the CBDC authority can perform this action.");
        _;
    }

    event KYCSubmitted(uint256 requestId, address indexed applicant);
    event KYCApproved(uint256 requestId, address indexed applicant);
    event KYCRejected(uint256 requestId, address indexed applicant);

    constructor() {
        owner = msg.sender;
    }

    function submitKYCRequest(string memory _fullName, string memory _nationalID) external returns (uint256) {
        require(bytes(_fullName).length > 0 && bytes(_nationalID).length > 0, "Full name and national ID must be provided.");

        totalRequests++;
        KYCRequest storage request = kycRequests[totalRequests];
        request.requestId = totalRequests;
        request.applicant = msg.sender;
        request.fullName = _fullName;
        request.nationalID = _nationalID;
        request.status = KYCStatus.Pending;

        emit KYCSubmitted(totalRequests, msg.sender);
        return totalRequests;
    }

    function approveKYCRequest(uint256 _requestId) external onlyOwner {
        require(_requestId > 0 && _requestId <= totalRequests, "Invalid request ID.");
        KYCRequest storage request = kycRequests[_requestId];
        require(request.status == KYCStatus.Pending, "Request is not pending approval.");

        request.status = KYCStatus.Approved;
        emit KYCApproved(_requestId, request.applicant);
    }

    function rejectKYCRequest(uint256 _requestId) external onlyOwner {
        require(_requestId > 0 && _requestId <= totalRequests, "Invalid request ID.");
        KYCRequest storage request = kycRequests[_requestId];
        require(request.status == KYCStatus.Pending, "Request is not pending rejection.");

        request.status = KYCStatus.Rejected;
        emit KYCRejected(_requestId, request.applicant);
    }
    
    function getBalance(address user_account) external returns (uint){
    
       string memory data = "User Balance is : ";
       uint user_bal = user_account.balance;
       emit CheckBalance(data, user_bal );
       return (user_bal);

    }
}
