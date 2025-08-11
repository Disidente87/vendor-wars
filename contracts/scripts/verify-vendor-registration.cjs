const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Verificando VendorRegistration smart contract...");
    
    // Obtener la cuenta deployer
    const [deployer] = await ethers.getSigners();
    console.log("📝 Verificando con account:", deployer.address);
    
    // Dirección del contrato desplegado (debe ser configurada)
    const VENDOR_REGISTRATION_ADDRESS = process.env.VENDOR_REGISTRATION_ADDRESS;
    const BATTLE_TOKEN_ADDRESS = process.env.BATTLE_TOKEN_ADDRESS;
    
    if (!VENDOR_REGISTRATION_ADDRESS) {
        console.error("❌ Error: VENDOR_REGISTRATION_ADDRESS no está configurada");
        console.log("💡 Configura VENDOR_REGISTRATION_ADDRESS en tu archivo .env");
        process.exit(1);
    }
    
    if (!BATTLE_TOKEN_ADDRESS) {
        console.error("❌ Error: BATTLE_TOKEN_ADDRESS no está configurada");
        console.log("💡 Configura BATTLE_TOKEN_ADDRESS en tu archivo .env");
        process.exit(1);
    }
    
    console.log("🎯 VendorRegistration Address:", VENDOR_REGISTRATION_ADDRESS);
    console.log("🎯 BATTLE Token Address:", BATTLE_TOKEN_ADDRESS);
    
    try {
        // Obtener instancia del contrato
        const vendorRegistration = await ethers.getContractAt("VendorRegistration", VENDOR_REGISTRATION_ADDRESS);
        
        console.log("\n🔍 Verificando configuración del contrato...");
        
        // Verificar owner
        const owner = await vendorRegistration.owner();
        console.log("👑 Owner:", owner);
        console.log("📝 Deployer:", deployer.address);
        
        if (owner === deployer.address) {
            console.log("✅ Owner configurado correctamente");
        } else {
            console.log("⚠️  Advertencia: Owner no coincide con el deployer");
        }
        
        // Verificar token BATTLE
        const battleToken = await vendorRegistration.battleToken();
        console.log("🎯 BATTLE Token configurado:", battleToken);
        
        if (battleToken === BATTLE_TOKEN_ADDRESS) {
            console.log("✅ BATTLE Token configurado correctamente");
        } else {
            console.log("❌ Error: BATTLE Token no coincide");
        }
        
        // Verificar constantes
        const registrationCost = await vendorRegistration.getVendorRegistrationCost();
        console.log("💰 Costo de registro:", ethers.formatEther(registrationCost), "$BATTLE");
        
        if (registrationCost === ethers.parseEther("50")) {
            console.log("✅ Costo de registro configurado correctamente");
        } else {
            console.log("❌ Error: Costo de registro incorrecto");
        }
        
        // Verificar estado inicial
        const totalTokensBurned = await vendorRegistration.getTotalTokensBurned();
        const totalVendorsRegistered = await vendorRegistration.getTotalVendorsRegistered();
        
        console.log("🔥 Total tokens quemados:", ethers.formatEther(totalTokensBurned), "$BATTLE");
        console.log("🏪 Total vendors registrados:", totalVendorsRegistered.toString());
        
        // Verificar que el contrato no esté pausado
        const isPaused = await vendorRegistration.paused();
        console.log("⏸️  Contrato pausado:", isPaused);
        
        if (!isPaused) {
            console.log("✅ Contrato activo y funcionando");
        } else {
            console.log("⚠️  Advertencia: Contrato está pausado");
        }
        
        // Verificar permisos del deployer
        console.log("\n🔐 Verificando permisos...");
        
        try {
            // Intentar llamar una función solo del owner
            await vendorRegistration.pause();
            console.log("✅ Deployer tiene permisos de owner");
            
            // Despausar el contrato
            await vendorRegistration.unpause();
            console.log("✅ Contrato despausado correctamente");
            
        } catch (error) {
            console.log("❌ Error: Deployer no tiene permisos de owner");
            console.log("💡 Verifica que la cuenta deployer sea la correcta");
        }
        
        // Verificar funciones de lectura
        console.log("\n📖 Verificando funciones de lectura...");
        
        try {
            const currentDay = await vendorRegistration.getCurrentDay();
            const currentWeek = await vendorRegistration.getCurrentWeek();
            
            console.log("📅 Día actual:", currentDay.toString());
            console.log("📅 Semana actual:", currentWeek.toString());
            console.log("✅ Funciones de lectura funcionando correctamente");
            
        } catch (error) {
            console.log("❌ Error en funciones de lectura:", error.message);
        }
        
        // Verificar integración con token BATTLE
        console.log("\n🎯 Verificando integración con token BATTLE...");
        
        try {
            const MockBattleToken = await ethers.getContractFactory("MockBattleToken");
            const mockToken = await MockBattleToken.deploy(deployer.address);
            
            // Mint tokens al deployer
            await mockToken.mint(deployer.address, ethers.parseEther("1000"));
            
            // Aprobar gasto
            await mockToken.approve(VENDOR_REGISTRATION_ADDRESS, ethers.parseEther("1000"));
            
            // Verificar que el contrato puede verificar el saldo
            const hasBalance = await vendorRegistration.hasSufficientBalance(deployer.address);
            console.log("💰 Usuario tiene saldo suficiente:", hasBalance);
            
            if (hasBalance) {
                console.log("✅ Integración con token BATTLE funcionando");
            } else {
                console.log("⚠️  Advertencia: Verificación de saldo no funciona como esperado");
            }
            
        } catch (error) {
            console.log("❌ Error verificando integración con token:", error.message);
        }
        
        // Resumen de verificación
        console.log("\n📋 Resumen de Verificación:");
        console.log("=" * 50);
        console.log(`🎯 Contrato: ${VENDOR_REGISTRATION_ADDRESS}`);
        console.log(`🎯 Token: ${BATTLE_TOKEN_ADDRESS}`);
        console.log(`👑 Owner: ${owner}`);
        console.log(`💰 Costo: ${ethers.formatEther(registrationCost)} $BATTLE`);
        console.log(`⏸️  Pausado: ${isPaused}`);
        console.log(`🔥 Tokens quemados: ${ethers.formatEther(totalTokensBurned)} $BATTLE`);
        console.log(`🏪 Vendors registrados: ${totalVendorsRegistered}`);
        
        console.log("\n🎉 Verificación completada!");
        console.log("\n📚 Próximos pasos:");
        console.log("1. Ejecuta los tests: npx hardhat test");
        console.log("2. Verifica el contrato en Etherscan");
        console.log("3. Configura las variables de entorno en tu backend");
        console.log("4. Integra el contrato en tu aplicación");
        
    } catch (error) {
        console.error("❌ Error durante la verificación:", error);
        process.exit(1);
    }
}

// Ejecutar el script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
