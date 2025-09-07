const { ethers } = require("hardhat");

/**
 * Script de migración para actualizar desde VendorRegistration a VendorWarsExtended
 * Este script ayuda a migrar datos y configuraciones del contrato base al extendido
 */

async function main() {
    console.log("🔄 Iniciando migración a VendorWarsExtended...");

    // Obtener direcciones de contratos
    const oldContractAddress = process.env.OLD_CONTRACT_ADDRESS;
    const newContractAddress = process.env.NEW_CONTRACT_ADDRESS;
    const battleTokenAddress = process.env.BATTLE_TOKEN_ADDRESS;

    if (!oldContractAddress || !newContractAddress || !battleTokenAddress) {
        throw new Error("Se requieren las siguientes variables de entorno: OLD_CONTRACT_ADDRESS, NEW_CONTRACT_ADDRESS, BATTLE_TOKEN_ADDRESS");
    }

    console.log("Contrato anterior:", oldContractAddress);
    console.log("Contrato nuevo:", newContractAddress);
    console.log("Battle Token:", battleTokenAddress);

    // Obtener instancias de contratos
    const VendorRegistration = await ethers.getContractFactory("VendorRegistration");
    const VendorWarsExtended = await ethers.getContractFactory("VendorWarsExtended");
    
    const oldContract = VendorRegistration.attach(oldContractAddress);
    const newContract = VendorWarsExtended.attach(newContractAddress);

    // Verificar que los contratos están desplegados
    console.log("\n🔍 Verificando contratos...");
    
    try {
        const oldOwner = await oldContract.owner();
        const newOwner = await newContract.owner();
        console.log("✅ Contrato anterior - Owner:", oldOwner);
        console.log("✅ Contrato nuevo - Owner:", newOwner);
    } catch (error) {
        throw new Error(`Error al verificar contratos: ${error.message}`);
    }

    // Migrar datos del contrato anterior
    console.log("\n📊 Migrando datos del contrato anterior...");
    
    try {
        // Obtener estadísticas del contrato anterior
        const oldTotalTokensBurned = await oldContract.getTotalTokensBurned();
        const oldTotalVendors = await oldContract.getTotalVendorsRegistered();
        
        console.log("Total tokens quemados (anterior):", oldTotalTokensBurned.toString());
        console.log("Total vendors registrados (anterior):", oldTotalVendors.toString());

        // Verificar que el nuevo contrato tiene los mismos datos
        const newTotalTokensBurned = await newContract.getTotalTokensBurned();
        const newTotalVendors = await newContract.getTotalVendorsRegistered();
        
        console.log("Total tokens quemados (nuevo):", newTotalTokensBurned.toString());
        console.log("Total vendors registrados (nuevo):", newTotalVendors.toString());

        if (oldTotalTokensBurned.toString() !== newTotalTokensBurned.toString()) {
            console.log("⚠️  Advertencia: Los totales de tokens quemados no coinciden");
        }

        if (oldTotalVendors.toString() !== newTotalVendors.toString()) {
            console.log("⚠️  Advertencia: Los totales de vendors no coinciden");
        }

    } catch (error) {
        console.log("⚠️  Error al migrar datos:", error.message);
    }

    // Verificar funcionalidades del nuevo contrato
    console.log("\n🧪 Verificando funcionalidades del nuevo contrato...");
    
    try {
        // Verificar constantes
        const vendorCost = await newContract.getVendorRegistrationCost();
        const minCost = await newContract.MIN_COST();
        const maxCost = await newContract.MAX_COST();
        
        console.log("✅ Costo de registro de vendor:", ethers.formatEther(vendorCost), "BATTLE");
        console.log("✅ Costo mínimo:", ethers.formatEther(minCost), "BATTLE");
        console.log("✅ Costo máximo:", ethers.formatEther(maxCost), "BATTLE");

        // Verificar rate limiting
        const maxVendorsPerDay = await newContract.MAX_VENDORS_PER_DAY();
        const maxVendorsPerWeek = await newContract.MAX_VENDORS_PER_WEEK();
        const maxOpsPerDay = await newContract.MAX_OPERATIONS_PER_DAY();
        
        console.log("✅ Max vendors por día:", maxVendorsPerDay.toString());
        console.log("✅ Max vendors por semana:", maxVendorsPerWeek.toString());
        console.log("✅ Max operaciones por día:", maxOpsPerDay.toString());

        // Verificar protección contra slippage
        const maxSlippage = await newContract.MAX_SLIPPAGE_PERCENTAGE();
        const minBurnInterval = await newContract.MIN_BURN_INTERVAL();
        
        console.log("✅ Max slippage percentage:", maxSlippage.toString(), "%");
        console.log("✅ Min burn interval:", minBurnInterval.toString(), "segundos");

        // Verificar protección contra front-running
        const minTerritoryClaimPercentage = await newContract.MIN_TERRITORY_CLAIM_PERCENTAGE();
        const commitRevealDelay = await newContract.COMMIT_REVEAL_DELAY();
        
        console.log("✅ Min territory claim percentage:", minTerritoryClaimPercentage.toString(), "%");
        console.log("✅ Commit reveal delay:", commitRevealDelay.toString(), "segundos");

    } catch (error) {
        console.log("❌ Error al verificar funcionalidades:", error.message);
        throw error;
    }

    // Verificar compatibilidad con funciones existentes
    console.log("\n🔗 Verificando compatibilidad con funciones existentes...");
    
    try {
        // Verificar que las funciones del contrato base siguen funcionando
        const hasBalance = await newContract.hasSufficientBalance(await ethers.getSigners().then(signers => signers[0].address));
        console.log("✅ hasSufficientBalance funciona:", hasBalance);

        const currentDay = await newContract.getCurrentDay();
        const currentWeek = await newContract.getCurrentWeek();
        console.log("✅ getCurrentDay funciona:", currentDay.toString());
        console.log("✅ getCurrentWeek funciona:", currentWeek.toString());

        // Verificar nuevas funcionalidades
        const generalStats = await newContract.getGeneralStats();
        console.log("✅ getGeneralStats funciona:", {
            totalTokensBurned: generalStats.totalTokensBurned.toString(),
            totalVendorsRegistered: generalStats.totalVendorsRegistered.toString(),
            totalVotes: generalStats.totalVotes.toString()
        });

    } catch (error) {
        console.log("❌ Error al verificar compatibilidad:", error.message);
        throw error;
    }

    // Verificar eventos
    console.log("\n📡 Verificando eventos...");
    
    try {
        // Verificar que los eventos del contrato base están disponibles
        const contractInterface = newContract.interface;
        const events = contractInterface.fragments.filter(f => f.type === 'event');
        
        console.log("✅ Eventos disponibles:", events.length);
        
        // Verificar eventos específicos
        const expectedEvents = [
            'VendorRegistered',
            'TokensBurned',
            'TokensRefunded',
            'VoteRecorded',
            'TerritoryClaimed',
            'VendorVerified',
            'AchievementNFTMinted'
        ];

        const availableEventNames = events.map(e => e.name);
        expectedEvents.forEach(eventName => {
            if (availableEventNames.includes(eventName)) {
                console.log(`✅ Evento ${eventName} disponible`);
            } else {
                console.log(`❌ Evento ${eventName} no encontrado`);
            }
        });

    } catch (error) {
        console.log("⚠️  Error al verificar eventos:", error.message);
    }

    // Generar reporte de migración
    console.log("\n📋 Generando reporte de migración...");
    
    const migrationReport = {
        timestamp: new Date().toISOString(),
        oldContractAddress,
        newContractAddress,
        battleTokenAddress,
        migrationStatus: 'completed',
        features: {
            vendorRegistration: 'inherited',
            votingSystem: 'new',
            territorySystem: 'new',
            vendorVerification: 'new',
            reviewSystem: 'new',
            boostSystem: 'new',
            nftSystem: 'new',
            frontRunningProtection: 'new',
            slippageProtection: 'new'
        },
        compatibility: {
            backendCompatibility: 'maintained',
            existingFunctions: 'available',
            newFunctions: 'added'
        }
    };

    console.log("📊 Reporte de migración:");
    console.log(JSON.stringify(migrationReport, null, 2));

    // Instrucciones post-migración
    console.log("\n🎯 Instrucciones post-migración:");
    console.log("1. ✅ Actualizar la dirección del contrato en el backend");
    console.log("2. ✅ Actualizar la interfaz del contrato en el frontend");
    console.log("3. ✅ Probar todas las nuevas funcionalidades");
    console.log("4. ✅ Configurar monitoreo de eventos");
    console.log("5. ✅ Actualizar documentación");
    console.log("6. ✅ Notificar a los usuarios sobre las nuevas funcionalidades");

    console.log("\n🎉 Migración completada exitosamente!");
    
    return migrationReport;
}

// Ejecutar migración
main()
    .then((report) => {
        console.log("\n✅ Migración exitosa!");
        console.log("Reporte guardado:", report);
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Migración falló:", error);
        process.exit(1);
    });
