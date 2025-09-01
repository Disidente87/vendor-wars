const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🧪 Probando conexión con Hardhat...");
  
  // Verificar variables de entorno
  console.log("🔍 Variables de entorno:");
  console.log("  SERVER_PRIVATE_KEY:", process.env.SERVER_PRIVATE_KEY ? "✅ Configurada" : "❌ No configurada");
  console.log("  BASE_SEPOLIA_RPC_URL:", process.env.BASE_SEPOLIA_RPC_URL ? "✅ Configurada" : "❌ No configurada");
  console.log("  BATTLE_TOKEN_CONTRACT_ADDRESS:", process.env.BATTLE_TOKEN_CONTRACT_ADDRESS ? "✅ Configurada" : "❌ No configurada");
  
  try {
    // Obtener la cuenta deployer
    const signers = await ethers.getSigners();
    console.log("✅ Signers obtenidos:", signers.length);
    
    if (signers.length > 0) {
      const deployer = signers[0];
      console.log("📝 Deployer address:", deployer.address);
      
      // Obtener balance de la cuenta
      try {
        const balance = await ethers.provider.getBalance(deployer.address);
        console.log("💰 Balance de la cuenta:", ethers.formatEther(balance), "ETH");
      } catch (error) {
        console.log("⚠️  No se pudo obtener el balance de la cuenta:", error.message);
      }
    } else {
      console.log("❌ No se encontraron signers");
      console.log("💡 Verifica que SERVER_PRIVATE_KEY esté configurada en .env.local");
    }
    
    // Verificar red
    try {
      const network = await ethers.provider.getNetwork();
      console.log("🌐 Red:", network.chainId.toString());
    } catch (error) {
      console.log("⚠️  No se pudo obtener información de la red:", error.message);
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error durante la ejecución:", error);
    process.exit(1);
  });
