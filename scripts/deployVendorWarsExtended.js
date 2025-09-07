const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Iniciando deploy de VendorWarsExtended...");

  // Obtener la cuenta deployer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with the account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString());

  // Dirección del token BATTLE en Base Sepolia
  const BATTLE_TOKEN_ADDRESS = "0xDa6884d4F2E68b9700678139B617607560f70Cc3";
  
  // Dirección del owner inicial (backend)
  const INITIAL_OWNER = deployer.address; // Cambiar por la dirección del backend en producción

  console.log("🔧 Configuración del deploy:");
  console.log("  - BATTLE Token Address:", BATTLE_TOKEN_ADDRESS);
  console.log("  - Initial Owner:", INITIAL_OWNER);

  // Deploy del contrato VendorWarsExtended
  console.log("📦 Deploying VendorWarsExtended...");
  const VendorWarsExtended = await ethers.getContractFactory("VendorWarsExtended");
  
  const vendorWarsExtended = await VendorWarsExtended.deploy(
    BATTLE_TOKEN_ADDRESS,
    INITIAL_OWNER
  );

  await vendorWarsExtended.deployed();

  console.log("✅ VendorWarsExtended deployed to:", vendorWarsExtended.address);

  // Verificar el deploy
  console.log("🔍 Verificando deploy...");
  
  try {
    const battleTokenAddress = await vendorWarsExtended.battleToken();
    console.log("  - Battle Token Address:", battleTokenAddress);
    
    const owner = await vendorWarsExtended.owner();
    console.log("  - Owner:", owner);
    
    const vendorRegistrationCost = await vendorWarsExtended.getVendorRegistrationCost();
    console.log("  - Vendor Registration Cost:", ethers.utils.formatEther(vendorRegistrationCost), "BATTLE");
    
    const isPaused = await vendorWarsExtended.paused();
    console.log("  - Is Paused:", isPaused);
    
    console.log("✅ Verificación exitosa");
  } catch (error) {
    console.error("❌ Error en verificación:", error);
  }

  // Generar archivo de configuración
  const config = {
    network: "baseSepolia",
    chainId: "84532",
    vendorWarsExtended: {
      address: vendorWarsExtended.address,
      abi: [
        "constructor(address _battleTokenAddress, address _initialOwner)",
        "function submitReview(address user, uint256 cost, string calldata reviewData, string calldata reviewId) returns (bool success)",
        "function registerVendor(address user, uint256 amount, string calldata vendorData, string calldata vendorId) returns (bool success)",
        "function recordVote(address user, uint256 cost, string calldata vendorId, string calldata zoneId, uint256 voteValue, bool isVerified) returns (bool success)",
        "function getVendorRegistrationCost() view returns (uint256)",
        "function hasSufficientBalance(address user) view returns (bool)",
        "function getTotalTokensBurned() view returns (uint256)",
        "function getTotalVendorsRegistered() view returns (uint256)",
        "function vendorExists(string calldata vendorId) view returns (bool)",
        "function getVendorInfo(string calldata vendorId) view returns (address user, uint256 amount, uint256 timestamp, bool exists)",
        "function getVendorInfoExtended(string calldata vendorId) view returns (address user, uint256 amount, uint256 timestamp, string memory vendorData, string memory zoneId, bool isVerified, address verifier, uint256 verificationTime, bool exists, uint256 totalVotes, uint256 territoryScore)",
        "function getGeneralStats() view returns (uint256 totalTokensBurned, uint256 totalVendorsRegistered, uint256 totalVotes)",
        "function paused() view returns (bool)",
        "function owner() view returns (address)",
        "event VendorRegistered(address indexed user, uint256 amount, string vendorId, uint256 timestamp)",
        "event TokensBurned(address indexed user, uint256 amount, uint256 timestamp)",
        "event VoteRecorded(address indexed voter, string indexed vendorId, string indexed zoneId, uint256 voteValue, bool isVerified)",
        "event TerritoryClaimed(string indexed zoneId, string indexed vendorId, uint256 claimAmount)"
      ]
    },
    battleToken: {
      address: BATTLE_TOKEN_ADDRESS,
      symbol: "BATTLE",
      name: "Battle Token",
      decimals: 18
    },
    deployedAt: new Date().toISOString(),
    deployer: deployer.address
  };

  // Guardar configuración
  const fs = require('fs');
  const path = require('path');
  
  const configPath = path.join(__dirname, '..', 'contracts', 'deploy-config-vendor-wars-extended.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  console.log("📄 Configuración guardada en:", configPath);

  // Mostrar información para actualizar variables de entorno
  console.log("\n🔧 Variables de entorno a actualizar:");
  console.log(`NEXT_PUBLIC_VENDOR_WARS_EXTENDED_CONTRACT_ADDRESS=${vendorWarsExtended.address}`);
  
  console.log("\n📋 Resumen del deploy:");
  console.log("  - Contrato: VendorWarsExtended");
  console.log("  - Dirección:", vendorWarsExtended.address);
  console.log("  - Red: Base Sepolia (84532)");
  console.log("  - Token: BATTLE");
  console.log("  - Owner:", INITIAL_OWNER);
  console.log("  - Configuración: deploy-config-vendor-wars-extended.json");

  console.log("\n✅ Deploy completado exitosamente!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error en el deploy:", error);
    process.exit(1);
  });