const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x747B4de5f01FbB36539E338AD7B436F1326DeC3c";
  
  console.log("🔍 Verifying contract deployment...");
  console.log("📍 Contract Address:", contractAddress);
  
  // Get the contract factory
  const VendorWarsUpgradeable = await ethers.getContractFactory("VendorWarsUpgradeable");
  
  // Attach to the deployed contract
  const contract = VendorWarsUpgradeable.attach(contractAddress);
  
  try {
    // Check if the contract is initialized
    console.log("🔧 Checking contract initialization...");
    
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
    
    console.log("🎉 Contract verification successful!");
    
  } catch (error) {
    console.error("❌ Contract verification failed:", error.message);
    
    // Try to check if the contract exists
    try {
      const code = await ethers.provider.getCode(contractAddress);
      if (code === "0x") {
        console.log("❌ No contract found at address");
      } else {
        console.log("✅ Contract exists but may not be initialized");
        console.log("📝 Contract code length:", code.length);
      }
    } catch (codeError) {
      console.error("❌ Error checking contract code:", codeError.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });
