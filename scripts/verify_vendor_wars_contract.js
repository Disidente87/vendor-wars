const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0xA8e6a44353D47f5349CB2FD72671989e55Af2201";
  
  console.log("🔍 Verifying VendorWarsContract deployment...");
  console.log("📍 Contract Address:", contractAddress);
  
  // Get the contract factory
  const VendorRegistration = await ethers.getContractFactory("VendorRegistration");
  
  // Attach to the deployed contract
  const contract = VendorRegistration.attach(contractAddress);
  
  try {
    // Check if the contract is working
    console.log("🔧 Checking contract functionality...");
    
    // Try to call a simple function
    const owner = await contract.owner();
    console.log("✅ Owner:", owner);
    
    // Try to get battle token address
    const battleTokenAddress = await contract.battleToken();
    console.log("✅ Battle Token Address:", battleTokenAddress);
    
    // Check some constants
    const minCost = await contract.MIN_COST();
    console.log("✅ MIN_COST:", minCost.toString());
    
    const maxCost = await contract.MAX_COST();
    console.log("✅ MAX_COST:", maxCost.toString());
    
    // Check total stats
    const totalTokensBurned = await contract.getTotalTokensBurned();
    console.log("✅ Total Tokens Burned:", totalTokensBurned.toString());
    
    const totalVendors = await contract.getTotalVendorsRegistered();
    console.log("✅ Total Vendors:", totalVendors.toString());
    
    console.log("🎉 Contract verification successful!");
    
    // Save deployment info
    const deploymentInfo = {
      contractAddress: contractAddress,
      battleTokenAddress: battleTokenAddress,
      owner: owner,
      minCost: minCost.toString(),
      maxCost: maxCost.toString(),
      totalTokensBurned: totalTokensBurned.toString(),
      totalVendors: totalVendors.toString(),
      network: "baseSepolia",
      chainId: 84532,
      timestamp: new Date().toISOString()
    };
    
    console.log("📝 Deployment Info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
  } catch (error) {
    console.error("❌ Contract verification failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });
