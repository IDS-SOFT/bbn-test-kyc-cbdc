import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('CBDC_KYC', function () {
  let CBDC_KYC: any;
  let cbdcKycInstance: any;
  let owner: any;
  let userAccount: any;

  before(async function () {
    CBDC_KYC = await ethers.getContractFactory('CBDC_KYC');
  });

  beforeEach(async function () {
    [owner, userAccount] = await ethers.getSigners();
    cbdcKycInstance = await CBDC_KYC.deploy();
    await cbdcKycInstance.deployed();
  });

  it('should deploy the CBDC_KYC contract with the correct owner', async function () {
    const contractOwner = await cbdcKycInstance.owner();
    expect(contractOwner).to.equal(owner.address);
  });

  it('should submit a KYC request', async function () {
    const fullName = 'John Doe';
    const nationalID = '123456789';
    const userAccountSigner = await ethers.getSigner(userAccount.address);

    const tx = await cbdcKycInstance.connect(userAccountSigner).submitKYCRequest(fullName, nationalID);

    expect(tx)
      .to.emit(cbdcKycInstance, 'KYCSubmitted')
      .withArgs(1, userAccount.address);

    // Check the KYC request details
    const request = await cbdcKycInstance.kycRequests(1);
    expect(request.applicant).to.equal(userAccount.address);
    expect(request.fullName).to.equal(fullName);
    expect(request.nationalID).to.equal(nationalID);
    expect(request.status).to.equal(1); // KYCStatus.Pending
  });

  it('should approve a KYC request', async function () {
    // First, submit a KYC request
    await cbdcKycInstance.submitKYCRequest('Alice Smith', '987654321');

    const tx = await cbdcKycInstance.approveKYCRequest(1);

    // Check the emitted event
    expect(tx)
      .to.emit(cbdcKycInstance, 'KYCApproved')
      .withArgs(1, userAccount.address);

    // Check that the request is now approved
    const request = await cbdcKycInstance.kycRequests(1);
    expect(request.status).to.equal(2); // KYCStatus.Approved
  });

  it('should reject a KYC request', async function () {
    // First, submit a KYC request
    await cbdcKycInstance.submitKYCRequest('Bob Johnson', '555555555');

    const tx = await cbdcKycInstance.rejectKYCRequest(1);

    // Check the emitted event
    expect(tx)
      .to.emit(cbdcKycInstance, 'KYCRejected')
      .withArgs(1, userAccount.address);

    // Check that the request is now rejected
    const request = await cbdcKycInstance.kycRequests(1);
    expect(request.status).to.equal(3); // KYCStatus.Rejected
  });
});
