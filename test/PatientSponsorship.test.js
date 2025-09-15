const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PatientSponsorship", function () {
  let PatientSponsorship;
  let patientSponsorship;
  let MockERC20;
  let usdcToken;
  let livesToken;
  let owner;
  let patient;
  let sponsor1;
  let sponsor2;

  beforeEach(async function () {
    // Get signers
    [owner, patient, sponsor1, sponsor2] = await ethers.getSigners();

    // Deploy mock ERC20 tokens
    MockERC20 = await ethers.getContractFactory("MockERC20");
    usdcToken = await MockERC20.deploy("USD Coin", "USDC", 6);
    livesToken = await MockERC20.deploy("Lives Token", "LIVES", 18);

    await usdcToken.deployed();
    await livesToken.deployed();

    // Deploy PatientSponsorship contract
    PatientSponsorship = await ethers.getContractFactory("PatientSponsorship");
    patientSponsorship = await PatientSponsorship.deploy(usdcToken.address, livesToken.address);
    await patientSponsorship.deployed();

    // Mint tokens to sponsors
    await usdcToken.mint(sponsor1.address, ethers.utils.parseUnits("10000", 6));
    await usdcToken.mint(sponsor2.address, ethers.utils.parseUnits("10000", 6));
    await livesToken.mint(sponsor1.address, ethers.utils.parseEther("10000"));
    await livesToken.mint(sponsor2.address, ethers.utils.parseEther("10000"));
  });

  describe("Campaign Creation", function () {
    it("Should create a campaign successfully", async function () {
      const fundingGoal = ethers.utils.parseUnits("1000", 6); // 1000 USDC
      const ipfsHash = "QmTestHash123456789";

      await expect(patientSponsorship.connect(patient).createCampaign(fundingGoal, ipfsHash))
        .to.emit(patientSponsorship, "CampaignCreated")
        .withArgs(0, patient.address, fundingGoal, ipfsHash);

      const campaign = await patientSponsorship.campaigns(0);
      expect(campaign.patient).to.equal(patient.address);
      expect(campaign.fundingGoal).to.equal(fundingGoal);
      expect(campaign.isActive).to.be.true;
      expect(campaign.goalReached).to.be.false;
    });

    it("Should fail with zero funding goal", async function () {
      await expect(
        patientSponsorship.connect(patient).createCampaign(0, "QmTestHash")
      ).to.be.revertedWith("Funding goal must be greater than 0");
    });

    it("Should fail with empty IPFS hash", async function () {
      await expect(
        patientSponsorship.connect(patient).createCampaign(1000, "")
      ).to.be.revertedWith("IPFS hash required");
    });
  });

  describe("USDC Contributions", function () {
    let campaignId;
    const fundingGoal = ethers.utils.parseUnits("1000", 6);

    beforeEach(async function () {
      await patientSponsorship.connect(patient).createCampaign(fundingGoal, "QmTestHash");
      campaignId = 0;
    });

    it("Should accept USDC contributions", async function () {
      const contributionAmount = ethers.utils.parseUnits("100", 6);
      
      // Approve spending
      await usdcToken.connect(sponsor1).approve(patientSponsorship.address, contributionAmount);
      
      await expect(patientSponsorship.connect(sponsor1).contributeUSDC(campaignId, contributionAmount))
        .to.emit(patientSponsorship, "ContributionMade")
        .withArgs(campaignId, sponsor1.address, contributionAmount);

      const campaign = await patientSponsorship.campaigns(campaignId);
      expect(campaign.currentFunding).to.equal(contributionAmount);
    });

    it("Should reach goal and mint Impact NFTs", async function () {
      const contributionAmount = ethers.utils.parseUnits("1000", 6);
      
      // Approve and contribute
      await usdcToken.connect(sponsor1).approve(patientSponsorship.address, contributionAmount);
      
      await expect(patientSponsorship.connect(sponsor1).contributeUSDC(campaignId, contributionAmount))
        .to.emit(patientSponsorship, "GoalReached")
        .withArgs(campaignId, contributionAmount);

      const campaign = await patientSponsorship.campaigns(campaignId);
      expect(campaign.goalReached).to.be.true;
    });

    it("Should fail contribution to inactive campaign", async function () {
      // First reach the goal
      const contributionAmount = ethers.utils.parseUnits("1000", 6);
      await usdcToken.connect(sponsor1).approve(patientSponsorship.address, contributionAmount);
      await patientSponsorship.connect(sponsor1).contributeUSDC(campaignId, contributionAmount);

      // Try to contribute again after goal is reached
      await usdcToken.connect(sponsor2).approve(patientSponsorship.address, contributionAmount);
      await expect(
        patientSponsorship.connect(sponsor2).contributeUSDC(campaignId, contributionAmount)
      ).to.be.revertedWith("Goal already reached");
    });
  });

  describe("Fund Withdrawal", function () {
    let campaignId;
    const fundingGoal = ethers.utils.parseUnits("1000", 6);

    beforeEach(async function () {
      await patientSponsorship.connect(patient).createCampaign(fundingGoal, "QmTestHash");
      campaignId = 0;

      // Reach the funding goal
      await usdcToken.connect(sponsor1).approve(patientSponsorship.address, fundingGoal);
      await patientSponsorship.connect(sponsor1).contributeUSDC(campaignId, fundingGoal);
    });

    it("Should allow patient to withdraw funds after goal is reached", async function () {
      await expect(patientSponsorship.connect(patient).withdrawFunds(campaignId))
        .to.emit(patientSponsorship, "FundsWithdrawn")
        .withArgs(campaignId, patient.address, fundingGoal);

      const campaign = await patientSponsorship.campaigns(campaignId);
      expect(campaign.isActive).to.be.false;
    });

    it("Should fail withdrawal by non-patient", async function () {
      await expect(
        patientSponsorship.connect(sponsor1).withdrawFunds(campaignId)
      ).to.be.revertedWith("Only patient can withdraw");
    });

    it("Should fail withdrawal before goal is reached", async function () {
      // Create new campaign without reaching goal
      await patientSponsorship.connect(patient).createCampaign(fundingGoal, "QmTestHash2");
      const newCampaignId = 1;

      await expect(
        patientSponsorship.connect(patient).withdrawFunds(newCampaignId)
      ).to.be.revertedWith("Goal not reached yet");
    });
  });

  describe("View Functions", function () {
    it("Should return active campaigns", async function () {
      await patientSponsorship.connect(patient).createCampaign(1000, "QmHash1");
      await patientSponsorship.connect(patient).createCampaign(2000, "QmHash2");

      const activeCampaigns = await patientSponsorship.getActiveCampaigns();
      expect(activeCampaigns.length).to.equal(2);
    });

    it("Should return patient campaigns", async function () {
      await patientSponsorship.connect(patient).createCampaign(1000, "QmHash1");
      
      const patientCampaigns = await patientSponsorship.getPatientCampaigns(patient.address);
      expect(patientCampaigns.length).to.equal(1);
      expect(patientCampaigns[0]).to.equal(0);
    });
  });
});