const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying VendorWarsExtended...");

    // Get the contract factory
    const VendorWarsExtended = await ethers.getContractFactory("VendorWarsExtended");

    // Get the Battle Token address from environment or use a default
    const battleTokenAddress = process.env.BATTLE_TOKEN_ADDRESS;
    if (!battleTokenAddress) {
        throw new Error("BATTLE_TOKEN_ADDRESS environment variable is required");
    }

    // Get the owner address (deployer)
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

    // Deploy the contract
    const vendorWarsExtended = await VendorWarsExtended.deploy(
        battleTokenAddress,
        deployer.address
    );

    await vendorWarsExtended.waitForDeployment();

    const contractAddress = await vendorWarsExtended.getAddress();
    console.log("✅ VendorWarsExtended deployed to:", contractAddress);

    // Verify deployment
    console.log("\n🔍 Verifying deployment...");
    
    // Check basic contract state
    const owner = await vendorWarsExtended.owner();
    const battleToken = await vendorWarsExtended.battleToken();
    const totalTokensBurned = await vendorWarsExtended.getTotalTokensBurned();
    const totalVendors = await vendorWarsExtended.getTotalVendorsRegistered();

    console.log("Owner:", owner);
    console.log("Battle Token:", battleToken);
    console.log("Total Tokens Burned:", totalTokensBurned.toString());
    console.log("Total Vendors:", totalVendors.toString());

    // Test basic functionality
    console.log("\n🧪 Testing basic functionality...");
    
    // Test constants
    const vendorCost = await vendorWarsExtended.getVendorRegistrationCost();
    console.log("Vendor Registration Cost:", ethers.formatEther(vendorCost), "BATTLE");

    // Test rate limiting constants
    console.log("Max Vendors Per Day:", await vendorWarsExtended.MAX_VENDORS_PER_DAY());
    console.log("Max Vendors Per Week:", await vendorWarsExtended.MAX_VENDORS_PER_WEEK());
    console.log("Cooldown Period:", await vendorWarsExtended.COOLDOWN_PERIOD());

    // Test new constants
    console.log("Min Cost:", ethers.formatEther(await vendorWarsExtended.MIN_COST()), "BATTLE");
    console.log("Max Cost:", ethers.formatEther(await vendorWarsExtended.MAX_COST()), "BATTLE");
    console.log("Max Operations Per Day:", await vendorWarsExtended.MAX_OPERATIONS_PER_DAY());
    console.log("Max Operations Per Week:", await vendorWarsExtended.MAX_OPERATIONS_PER_WEEK());

    // Test slippage protection constants
    console.log("Max Slippage Percentage:", await vendorWarsExtended.MAX_SLIPPAGE_PERCENTAGE(), "%");
    console.log("Min Burn Interval:", await vendorWarsExtended.MIN_BURN_INTERVAL(), "seconds");

    // Test front-running protection constants
    console.log("Min Territory Claim Percentage:", await vendorWarsExtended.MIN_TERRITORY_CLAIM_PERCENTAGE(), "%");
    console.log("Commit Reveal Delay:", await vendorWarsExtended.COMMIT_REVEAL_DELAY(), "seconds");
    console.log("Max Territory Claims Per Day:", await vendorWarsExtended.MAX_TERRITORY_CLAIMS_PER_DAY());

    // Test data validation constants
    console.log("Max Vendor Data Length:", await vendorWarsExtended.MAX_VENDOR_DATA_LENGTH(), "bytes");
    console.log("Max Review Data Length:", await vendorWarsExtended.MAX_REVIEW_DATA_LENGTH(), "bytes");
    console.log("Max Verification Data Length:", await vendorWarsExtended.MAX_VERIFICATION_DATA_LENGTH(), "bytes");
    console.log("Max Territory Data Length:", await vendorWarsExtended.MAX_TERRITORY_DATA_LENGTH(), "bytes");
    console.log("Max Metadata Length:", await vendorWarsExtended.MAX_METADATA_LENGTH(), "bytes");

    console.log("\n✅ Deployment verification completed successfully!");

    // Save deployment info
    const deploymentInfo = {
        network: await ethers.provider.getNetwork(),
        contractAddress: contractAddress,
        battleTokenAddress: battleTokenAddress,
        owner: owner,
        deploymentTime: new Date().toISOString(),
        blockNumber: await ethers.provider.getBlockNumber()
    };

    console.log("\n📋 Deployment Information:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    // Instructions for next steps
    console.log("\n🎯 Next Steps:");
    console.log("1. Verify the contract on block explorer");
    console.log("2. Update your frontend to use the new contract address");
    console.log("3. Test the new functionality with the test suite");
    console.log("4. Update your backend to use the new contract interface");

    return contractAddress;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then((contractAddress) => {
        console.log(`\n🎉 Deployment successful! Contract address: ${contractAddress}`);
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
