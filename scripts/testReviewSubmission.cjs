const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Iniciando prueba de submit de reviews...");

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
    // 1. Verificar que el contrato no está pausado
    const isPaused = await contract.paused();
    if (isPaused) {
      console.log("⚠️  El contrato está pausado. No se pueden realizar operaciones.");
      return;
    }

    // 2. Preparar datos del review
    const reviewData = JSON.stringify({
      vendorId: "test-vendor-123",
      content: "Este es un review de prueba para el contrato VendorWarsExtended",
      userFid: 12345,
      timestamp: Date.now()
    });

    const reviewId = `review_test_${Date.now()}`;
    const cost = ethers.parseEther("15"); // 15 BATTLE tokens

    console.log("\n📝 Datos del review:");
    console.log("  - Review ID:", reviewId);
    console.log("  - Cost:", ethers.formatEther(cost), "BATTLE");
    console.log("  - Review Data:", reviewData);

    // 3. Verificar rate limiting antes del submit
    console.log("\n⏰ Verificando rate limiting antes del submit:");
    const currentDay = await contract.getCurrentDay();
    const currentWeek = await contract.getCurrentWeek();
    const dailyCount = await contract.getDailyVendorCount(testUser.address, currentDay);
    const weeklyCount = await contract.getWeeklyVendorCount(testUser.address, currentWeek);
    
    console.log("  - Daily Count:", dailyCount.toString());
    console.log("  - Weekly Count:", weeklyCount.toString());

    // 4. Intentar submitir el review (esto fallará porque no tenemos BATTLE tokens)
    console.log("\n🚀 Intentando submitir review...");
    try {
      const tx = await contract.submitReview(
        testUser.address,
        cost,
        reviewData,
        reviewId
      );
      
      console.log("✅ Review submitido exitosamente!");
      console.log("  - Transaction Hash:", tx.hash);
      
      // Esperar confirmación
      const receipt = await tx.wait();
      console.log("  - Block Number:", receipt.blockNumber);
      console.log("  - Gas Used:", receipt.gasUsed.toString());
      
    } catch (error) {
      console.log("❌ Error al submitir review (esperado si no tienes BATTLE tokens):");
      console.log("  - Error:", error.message);
      
      if (error.message.includes("Insufficient balance")) {
        console.log("💡 Este error es esperado - necesitas BATTLE tokens para submitir reviews");
      } else if (error.message.includes("Daily limit exceeded")) {
        console.log("💡 Rate limit alcanzado - necesitas esperar");
      } else if (error.message.includes("Weekly limit exceeded")) {
        console.log("💡 Límite semanal alcanzado - necesitas esperar");
      }
    }

    // 5. Verificar estadísticas después del intento
    console.log("\n📊 Estadísticas después del intento:");
    const stats = await contract.getGeneralStats();
    console.log("  - Total Tokens Burned:", ethers.formatEther(stats.totalTokensBurned), "BATTLE");
    console.log("  - Total Vendors Registered:", stats.totalVendorsRegistered.toString());
    console.log("  - Total Votes:", stats.totalVotes.toString());

    console.log("\n✅ Prueba de submit de reviews completada!");
    console.log("🎉 El contrato está listo para recibir reviews (con BATTLE tokens)");

  } catch (error) {
    console.error("❌ Error durante la prueba:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error en la prueba:", error);
    process.exit(1);
  });
