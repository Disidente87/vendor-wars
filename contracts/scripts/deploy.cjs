const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Iniciando deploy del contrato VendorRegistration en Base Sepolia...");
  
  // Obtener la cuenta deployer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deployando desde la cuenta:", deployer.address);
  
  // Obtener balance de la cuenta
  try {
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance de la cuenta:", ethers.formatEther(balance), "ETH");
  } catch (error) {
    console.log("⚠️  No se pudo obtener el balance de la cuenta");
  }
  
  // Verificar que estamos en Base Sepolia
  const network = await ethers.provider.getNetwork();
  if (network.chainId !== 84532n) {
    console.error("❌ Error: Este script solo funciona en Base Sepolia (Chain ID: 84532)");
    console.log("💡 Ejecuta: HARDHAT_NETWORK=baseSepolia npm run deploy:vendor-registration");
    process.exit(1);
  }
  
  console.log("🌐 Red: Base Sepolia (Chain ID:", network.chainId.toString(), ")");
  
  // Dirección del token $BATTLE (debe ser configurada)
  const BATTLE_TOKEN_ADDRESS = process.env.BATTLE_TOKEN_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
  
  if (BATTLE_TOKEN_ADDRESS === "0x0000000000000000000000000000000000000000") {
    console.error("❌ Error: BATTLE_TOKEN_CONTRACT_ADDRESS no está configurada en las variables de entorno");
    console.log("💡 Configura BATTLE_TOKEN_CONTRACT_ADDRESS en tu archivo .env");
    process.exit(1);
  }
  
  console.log("🎯 Token $BATTLE:", BATTLE_TOKEN_ADDRESS);
  
  // Verificar que el token existe y es accesible
  try {
    const battleToken = await ethers.getContractAt("IERC20", BATTLE_TOKEN_ADDRESS);
    const tokenName = await battleToken.name();
    const tokenSymbol = await battleToken.symbol();
    console.log("✅ Token verificado:", tokenName, "(", tokenSymbol, ")");
  } catch (error) {
    console.log("⚠️  Advertencia: No se pudo verificar el token $BATTLE en la dirección:", BATTLE_TOKEN_ADDRESS);
    console.log("💡 Continuando con el deploy...");
    console.log("💡 Verifica que la dirección sea correcta después del deploy");
  }
  
  // Deploy del contrato VendorRegistration
  console.log("🏗️ Deployando VendorRegistration...");
  const VendorRegistration = await ethers.getContractFactory("VendorRegistration");
  const vendorRegistration = await VendorRegistration.deploy(
    BATTLE_TOKEN_ADDRESS,
    deployer.address // Owner inicial (backend)
  );
  
  await vendorRegistration.waitForDeployment();
  const vendorRegistrationAddress = await vendorRegistration.getAddress();
  
  console.log("✅ VendorRegistration deployado en:", vendorRegistrationAddress);
  
  // Verificar el deploy
  console.log("🔍 Verificando deploy...");
  
  try {
    // Verificar constantes
    const registrationCost = await vendorRegistration.getVendorRegistrationCost();
    const maxDaily = await vendorRegistration.MAX_VENDORS_PER_DAY();
    const maxWeekly = await vendorRegistration.MAX_VENDORS_PER_WEEK();
    const cooldownPeriod = await vendorRegistration.COOLDOWN_PERIOD();
    
    console.log("📊 Configuración del contrato:");
    console.log("   💰 Costo de registro:", ethers.formatEther(registrationCost), "$BATTLE");
    console.log("   📅 Límite diario:", maxDaily.toString());
    console.log("   📅 Límite semanal:", maxWeekly.toString());
    console.log("   ⏰ Cooldown:", cooldownPeriod.toString(), "segundos");
    
    // Verificar owner
    const owner = await vendorRegistration.owner();
    console.log("👑 Owner del contrato:", owner);
    
    // Verificar token
    const battleToken = await vendorRegistration.battleToken();
    console.log("🎯 Token configurado:", battleToken);
    
    console.log("✅ Verificación completada exitosamente!");
    
  } catch (error) {
    console.error("❌ Error durante la verificación:", error.message);
  }
  
  // Generar archivo de configuración para el frontend
  console.log("📝 Generando configuración para el frontend...");
  
  const config = {
    network: "baseSepolia",
    chainId: network.chainId.toString(),
    vendorRegistration: {
      address: vendorRegistrationAddress,
      abi: VendorRegistration.interface.format()
    },
    battleToken: {
      address: BATTLE_TOKEN_ADDRESS
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    explorer: "https://sepolia.basescan.org"
  };
  
  const fs = require('fs');
  const configPath = './contracts/deploy-config-base-sepolia.json';
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log("💾 Configuración guardada en:", configPath);
  
  // Instrucciones para el usuario
  console.log("\n🎉 ¡Deploy completado exitosamente en Base Sepolia!");
  console.log("\n📋 Próximos pasos:");
  console.log("1. Configura la dirección del contrato en tu backend:");
  console.log(`   NEXT_PUBLIC_VENDOR_REGISTRATION_CONTRACT_ADDRESS=${vendorRegistrationAddress}`);
  console.log("2. Verifica el contrato en Basescan:");
  console.log(`   https://sepolia.basescan.org/address/${vendorRegistrationAddress}`);
  console.log("3. Ejecuta los tests con 'npm run test:vendor-registration'");
  console.log("4. Configura las variables de entorno en tu aplicación");
  
  console.log("\n🔗 Enlaces útiles:");
  console.log(`   Basescan: https://sepolia.basescan.org/address/${vendorRegistrationAddress}`);
  console.log(`   Base Sepolia RPC: https://sepolia.base.org`);
  
  return {
    vendorRegistration: vendorRegistrationAddress,
    battleToken: BATTLE_TOKEN_ADDRESS,
    owner: deployer.address,
    network: "baseSepolia"
  };
}

// Manejo de errores
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error durante el deploy:", error);
    process.exit(1);
  });
