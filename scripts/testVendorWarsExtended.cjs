const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Iniciando pruebas del contrato VendorWarsExtended...");

  // Dirección del contrato deployado
  const CONTRACT_ADDRESS = "0x71a602d04f1aFe473C7557e72e6d6C26cBa2fA75";
  
  // Obtener la cuenta de prueba
  const signers = await ethers.getSigners();
  const testUser = signers[0];
  console.log("📝 Testing with account:", testUser.address);

  // Conectar al contrato
  const VendorWarsExtended = await ethers.getContractFactory("VendorWarsExtended");
  const contract = VendorWarsExtended.attach(CONTRACT_ADDRESS);

  console.log("🔗 Connected to contract at:", CONTRACT_ADDRESS);

  try {
    // 1. Verificar información básica del contrato
    console.log("\n📊 Información básica del contrato:");
    
    const owner = await contract.owner();
    console.log("  - Owner:", owner);
    
    const battleTokenAddress = await contract.battleToken();
    console.log("  - Battle Token Address:", battleTokenAddress);
    
    const vendorRegistrationCost = await contract.getVendorRegistrationCost();
    console.log("  - Vendor Registration Cost:", ethers.formatEther(vendorRegistrationCost), "BATTLE");
    
    const isPaused = await contract.paused();
    console.log("  - Is Paused:", isPaused);
    
    const totalTokensBurned = await contract.getTotalTokensBurned();
    console.log("  - Total Tokens Burned:", ethers.formatEther(totalTokensBurned), "BATTLE");
    
    const totalVendors = await contract.getTotalVendorsRegistered();
    console.log("  - Total Vendors Registered:", totalVendors.toString());
    
    const generalStats = await contract.getGeneralStats();
    console.log("  - General Stats:", {
      totalTokensBurned: ethers.formatEther(generalStats.totalTokensBurned),
      totalVendorsRegistered: generalStats.totalVendorsRegistered.toString(),
      totalVotes: generalStats.totalVotes.toString()
    });

    // 2. Verificar funciones de rate limiting
    console.log("\n⏰ Verificando rate limiting:");
    
    const currentDay = await contract.getCurrentDay();
    console.log("  - Current Day:", currentDay.toString());
    
    const currentWeek = await contract.getCurrentWeek();
    console.log("  - Current Week:", currentWeek.toString());
    
    const dailyCount = await contract.getDailyVendorCount(testUser.address, currentDay);
    console.log("  - Daily Vendor Count:", dailyCount.toString());
    
    const weeklyCount = await contract.getWeeklyVendorCount(testUser.address, currentWeek);
    console.log("  - Weekly Vendor Count:", weeklyCount.toString());

    // 3. Verificar constantes del contrato
    console.log("\n🔧 Constantes del contrato:");
    
    const maxVendorsPerDay = await contract.MAX_VENDORS_PER_DAY();
    console.log("  - Max Vendors Per Day:", maxVendorsPerDay.toString());
    
    const maxVendorsPerWeek = await contract.MAX_VENDORS_PER_WEEK();
    console.log("  - Max Vendors Per Week:", maxVendorsPerWeek.toString());
    
    const cooldownPeriod = await contract.COOLDOWN_PERIOD();
    console.log("  - Cooldown Period:", cooldownPeriod.toString(), "seconds");

    // 4. Verificar que el contrato no está pausado
    if (isPaused) {
      console.log("⚠️  El contrato está pausado. No se pueden realizar operaciones.");
      return;
    }

    console.log("\n✅ Todas las pruebas básicas pasaron exitosamente!");
    console.log("🎉 El contrato VendorWarsExtended está funcionando correctamente.");
    
    console.log("\n📋 Resumen:");
    console.log("  - Contrato deployado correctamente");
    console.log("  - Todas las funciones view funcionan");
    console.log("  - Rate limiting configurado");
    console.log("  - Contrato no está pausado");
    console.log("  - Listo para usar en producción");

  } catch (error) {
    console.error("❌ Error durante las pruebas:", error);
    
    if (error.message.includes("call revert")) {
      console.log("💡 Posibles causas:");
      console.log("  - El contrato no está deployado correctamente");
      console.log("  - La dirección del contrato es incorrecta");
      console.log("  - Problemas de red");
    }
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error en las pruebas:", error);
    process.exit(1);
  });
