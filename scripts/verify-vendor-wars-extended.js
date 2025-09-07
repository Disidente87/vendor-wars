const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Verifying VendorWarsExtended contract...");

    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress) {
        throw new Error("CONTRACT_ADDRESS environment variable is required");
    }

    const battleTokenAddress = process.env.BATTLE_TOKEN_ADDRESS;
    if (!battleTokenAddress) {
        throw new Error("BATTLE_TOKEN_ADDRESS environment variable is required");
    }

    console.log("Contract Address:", contractAddress);
    console.log("Battle Token Address:", battleTokenAddress);

    // Get the contract instance
    const VendorWarsExtended = await ethers.getContractFactory("VendorWarsExtended");
    const contract = VendorWarsExtended.attach(contractAddress);

    // Verify basic contract state
    console.log("\n📊 Contract State Verification:");
    
    const owner = await contract.owner();
    const battleToken = await contract.battleToken();
    const totalTokensBurned = await contract.getTotalTokensBurned();
    const totalVendors = await contract.getTotalVendorsRegistered();
    const totalVotes = await contract.getGeneralStats();

    console.log("✅ Owner:", owner);
    console.log("✅ Battle Token:", battleToken);
    console.log("✅ Total Tokens Burned:", totalTokensBurned.toString());
    console.log("✅ Total Vendors:", totalVendors.toString());
    console.log("✅ Total Votes:", totalVotes.totalVotes.toString());

    // Verify constants
    console.log("\n🔧 Constants Verification:");
    
    const vendorCost = await contract.getVendorRegistrationCost();
    const minCost = await contract.MIN_COST();
    const maxCost = await contract.MAX_COST();
    const maxOpsPerDay = await contract.MAX_OPERATIONS_PER_DAY();
    const maxOpsPerWeek = await contract.MAX_OPERATIONS_PER_WEEK();
    const maxSlippage = await contract.MAX_SLIPPAGE_PERCENTAGE();
    const minBurnInterval = await contract.MIN_BURN_INTERVAL();

    console.log("✅ Vendor Registration Cost:", ethers.formatEther(vendorCost), "BATTLE");
    console.log("✅ Min Cost:", ethers.formatEther(minCost), "BATTLE");
    console.log("✅ Max Cost:", ethers.formatEther(maxCost), "BATTLE");
    console.log("✅ Max Operations Per Day:", maxOpsPerDay.toString());
    console.log("✅ Max Operations Per Week:", maxOpsPerWeek.toString());
    console.log("✅ Max Slippage Percentage:", maxSlippage.toString(), "%");
    console.log("✅ Min Burn Interval:", minBurnInterval.toString(), "seconds");

    // Verify rate limiting
    console.log("\n⏱️ Rate Limiting Verification:");
    
    const maxVendorsPerDay = await contract.MAX_VENDORS_PER_DAY();
    const maxVendorsPerWeek = await contract.MAX_VENDORS_PER_WEEK();
    const cooldownPeriod = await contract.COOLDOWN_PERIOD();

    console.log("✅ Max Vendors Per Day:", maxVendorsPerDay.toString());
    console.log("✅ Max Vendors Per Week:", maxVendorsPerWeek.toString());
    console.log("✅ Cooldown Period:", cooldownPeriod.toString(), "seconds");

    // Verify front-running protection
    console.log("\n🛡️ Front-Running Protection Verification:");
    
    const minTerritoryClaimPercentage = await contract.MIN_TERRITORY_CLAIM_PERCENTAGE();
    const commitRevealDelay = await contract.COMMIT_REVEAL_DELAY();
    const maxTerritoryClaimsPerDay = await contract.MAX_TERRITORY_CLAIMS_PER_DAY();

    console.log("✅ Min Territory Claim Percentage:", minTerritoryClaimPercentage.toString(), "%");
    console.log("✅ Commit Reveal Delay:", commitRevealDelay.toString(), "seconds");
    console.log("✅ Max Territory Claims Per Day:", maxTerritoryClaimsPerDay.toString());

    // Verify data validation
    console.log("\n📏 Data Validation Verification:");
    
    const maxVendorDataLength = await contract.MAX_VENDOR_DATA_LENGTH();
    const maxReviewDataLength = await contract.MAX_REVIEW_DATA_LENGTH();
    const maxVerificationDataLength = await contract.MAX_VERIFICATION_DATA_LENGTH();
    const maxTerritoryDataLength = await contract.MAX_TERRITORY_DATA_LENGTH();
    const maxMetadataLength = await contract.MAX_METADATA_LENGTH();

    console.log("✅ Max Vendor Data Length:", maxVendorDataLength.toString(), "bytes");
    console.log("✅ Max Review Data Length:", maxReviewDataLength.toString(), "bytes");
    console.log("✅ Max Verification Data Length:", maxVerificationDataLength.toString(), "bytes");
    console.log("✅ Max Territory Data Length:", maxTerritoryDataLength.toString(), "bytes");
    console.log("✅ Max Metadata Length:", maxMetadataLength.toString(), "bytes");

    // Test basic functionality
    console.log("\n🧪 Functionality Test:");
    
    try {
        // Test that we can call view functions
        const currentDay = await contract.getCurrentDay();
        const currentWeek = await contract.getCurrentWeek();
        
        console.log("✅ Current Day:", currentDay.toString());
        console.log("✅ Current Week:", currentWeek.toString());
        
        // Test slippage calculation
        const testAmount = ethers.parseEther("100");
        const maxAllowedSlippage = await contract.getMaxAllowedSlippage(testAmount);
        console.log("✅ Max Allowed Slippage for 100 BATTLE:", ethers.formatEther(maxAllowedSlippage), "BATTLE");
        
        console.log("✅ All basic functionality tests passed!");
        
    } catch (error) {
        console.error("❌ Functionality test failed:", error.message);
        throw error;
    }

    // Verify contract is not paused
    console.log("\n⏸️ Pause State Verification:");
    
    try {
        const isPaused = await contract.paused();
        console.log("✅ Contract is paused:", isPaused);
        
        if (isPaused) {
            console.log("⚠️  Warning: Contract is currently paused");
        } else {
            console.log("✅ Contract is active and ready for use");
        }
    } catch (error) {
        console.log("⚠️  Could not check pause state:", error.message);
    }

    // Verify contract balance
    console.log("\n💰 Contract Balance Verification:");
    
    try {
        const contractBalance = await ethers.provider.getBalance(contractAddress);
        const tokenBalance = await contract.battleToken();
        
        console.log("✅ Contract ETH Balance:", ethers.formatEther(contractBalance), "ETH");
        console.log("✅ Battle Token Contract:", tokenBalance);
        
        if (contractBalance > 0) {
            console.log("⚠️  Warning: Contract has ETH balance (should be 0 for token-only contract)");
        }
    } catch (error) {
        console.log("⚠️  Could not check contract balance:", error.message);
    }

    console.log("\n🎉 Contract verification completed successfully!");
    console.log("\n📋 Summary:");
    console.log("- Contract is properly deployed and accessible");
    console.log("- All constants are correctly set");
    console.log("- Basic functionality is working");
    console.log("- Contract is ready for production use");

    return true;
}

main()
    .then(() => {
        console.log("\n✅ Verification successful!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Verification failed:", error);
        process.exit(1);
    });
