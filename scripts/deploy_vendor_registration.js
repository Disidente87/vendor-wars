// Script de deploy para VendorRegistration en Base Sepolia
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Iniciando deploy de VendorRegistration en Base Sepolia...");
  
  // Configuración
  const BATTLE_TOKEN_ADDRESS = "0xDa6884d4F2E68b9700678139B617607560f70Cc3";
  const OWNER_ADDRESS = "0x80bEC485a67549ea32e303d3a1B8bafa4B3B5e99";
  
  console.log("📋 Configuración:");
  console.log("  - BATTLE Token:", BATTLE_TOKEN_ADDRESS);
  console.log("  - Owner:", OWNER_ADDRESS);
  console.log("  - Red: Base Sepolia");
  
  // Obtener el contrato
  const VendorRegistration = await ethers.getContractFactory("VendorRegistration");
  
  console.log("📦 Desplegando contrato...");
  
  // Deploy del contrato
  const vendorRegistration = await VendorRegistration.deploy(
    BATTLE_TOKEN_ADDRESS,
    OWNER_ADDRESS
  );
  
  await vendorRegistration.waitForDeployment();
  
  const contractAddress = await vendorRegistration.getAddress();
  
  console.log("✅ Contrato desplegado exitosamente!");
  console.log("📍 Dirección del contrato:", contractAddress);
  console.log("🔗 Explorer:", `https://sepolia.basescan.org/address/${contractAddress}`);
  
  // Verificar que el owner sea correcto
  const owner = await vendorRegistration.owner();
  console.log("👤 Owner del contrato:", owner);
  
  // Verificar que el token BATTLE sea correcto
  const battleToken = await vendorRegistration.battleToken();
  console.log("🪙 Token BATTLE:", battleToken);
  
  console.log("\n📝 Información para actualizar el frontend:");
  console.log(`NEXT_PUBLIC_VENDOR_REGISTRATION_CONTRACT_ADDRESS=${contractAddress}`);
  
  console.log("\n🔍 Para verificar el contrato en Basescan:");
  console.log("1. Ve a https://sepolia.basescan.org/verifyContract");
  console.log("2. Ingresa la dirección:", contractAddress);
  console.log("3. Selecciona 'Solidity (Single file)'");
  console.log("4. Usa el ABI que se genera automáticamente");
  
  return contractAddress;
}

main()
  .then((address) => {
    console.log("\n🎉 Deploy completado exitosamente!");
    console.log("📍 Dirección:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error durante el deploy:", error);
    process.exit(1);
  });
