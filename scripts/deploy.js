const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  // Check deployer balance
  const balance = await deployer.getBalance();
  console.log("💰 Account balance:", ethers.utils.formatEther(balance), "ETH");

  // Mock token addresses for testing (replace with actual addresses on mainnet)
  const USDC_ADDRESS = "0xA0b86a33E6441e8e5B09E74E5cD5bc8D98e12777"; // Mock USDC
  const LIVES_TOKEN_ADDRESS = "0x742d35Cc6634C0532925a3b8D428Ec9AF98de5b1"; // Mock LIVES

  // Deploy the PatientSponsorship contract
  console.log("📄 Deploying PatientSponsorship contract...");
  const PatientSponsorship = await ethers.getContractFactory("PatientSponsorship");
  const patientSponsorship = await PatientSponsorship.deploy(USDC_ADDRESS, LIVES_TOKEN_ADDRESS);

  await patientSponsorship.deployed();

  console.log("✅ PatientSponsorship deployed to:", patientSponsorship.address);
  console.log("🔗 USDC Token Address:", USDC_ADDRESS);
  console.log("🔗 LIVES Token Address:", LIVES_TOKEN_ADDRESS);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: patientSponsorship.address,
    usdcAddress: USDC_ADDRESS,
    livesTokenAddress: LIVES_TOKEN_ADDRESS,
    deployer: deployer.address,
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
  };

  console.log("\n📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Verify contract on Etherscan (if not local network)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await patientSponsorship.deployTransaction.wait(6);

    console.log("🔍 Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: patientSponsorship.address,
        constructorArguments: [USDC_ADDRESS, LIVES_TOKEN_ADDRESS],
      });
      console.log("✅ Contract verified on Etherscan");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
    }
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📝 Update your frontend constants with the new contract address:");
  console.log(`export const CONTRACT_ADDRESS = '${patientSponsorship.address}';`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });