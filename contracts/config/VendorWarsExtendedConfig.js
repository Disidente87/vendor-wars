/**
 * @fileoverview Configuración para el contrato VendorWarsExtended
 */

const { ethers } = require("hardhat");

// ============ CONSTANTS ============

// Costos de operaciones (en wei)
const COSTS = {
    VENDOR_REGISTRATION: ethers.parseEther("50"),    // 50 BATTLE
    REVIEW: ethers.parseEther("15"),                 // 15 BATTLE
    VOTE: ethers.parseEther("10"),                   // 10 BATTLE
    BOOST: ethers.parseEther("25"),                  // 25 BATTLE
    NFT_MINTING: ethers.parseEther("30"),            // 30 BATTLE
    CUSTOMIZATION: ethers.parseEther("20"),          // 20 BATTLE
    MIN_COST: ethers.parseEther("1"),                // 1 BATTLE mínimo
    MAX_COST: ethers.parseEther("500"),              // 500 BATTLE máximo
};

// Límites de rate limiting
const RATE_LIMITS = {
    MAX_VENDORS_PER_DAY: 3,
    MAX_VENDORS_PER_WEEK: 10,
    MAX_OPERATIONS_PER_DAY: 20,
    MAX_OPERATIONS_PER_WEEK: 100,
    MAX_TERRITORY_CLAIMS_PER_DAY: 3,
    COOLDOWN_PERIOD: 1 * 60 * 60, // 1 hora en segundos
};

// Límites de datos
const DATA_LIMITS = {
    MAX_VENDOR_DATA_LENGTH: 1000,      // bytes
    MAX_REVIEW_DATA_LENGTH: 500,       // bytes
    MAX_VERIFICATION_DATA_LENGTH: 200, // bytes
    MAX_TERRITORY_DATA_LENGTH: 300,    // bytes
    MAX_METADATA_LENGTH: 400,          // bytes
};

// Protección contra front-running
const FRONT_RUNNING_PROTECTION = {
    MIN_TERRITORY_CLAIM_PERCENTAGE: 51, // 51%
    COMMIT_REVEAL_DELAY: 24 * 60 * 60,  // 1 día en segundos
};

// Protección contra slippage
const SLIPPAGE_PROTECTION = {
    MAX_SLIPPAGE_PERCENTAGE: 5,        // 5%
    MIN_BURN_INTERVAL: 1 * 60 * 60,    // 1 hora en segundos
};

// ============ CONFIGURATION FUNCTIONS ============

/**
 * Obtiene la configuración completa del contrato
 * @returns {Object} Configuración completa
 */
function getContractConfig() {
    return {
        costs: COSTS,
        rateLimits: RATE_LIMITS,
        dataLimits: DATA_LIMITS,
        frontRunningProtection: FRONT_RUNNING_PROTECTION,
        slippageProtection: SLIPPAGE_PROTECTION,
    };
}

/**
 * Obtiene los costos de operaciones
 * @returns {Object} Costos de operaciones
 */
function getCosts() {
    return COSTS;
}

/**
 * Obtiene los límites de rate limiting
 * @returns {Object} Límites de rate limiting
 */
function getRateLimits() {
    return RATE_LIMITS;
}

/**
 * Obtiene los límites de datos
 * @returns {Object} Límites de datos
 */
function getDataLimits() {
    return DATA_LIMITS;
}

/**
 * Obtiene la configuración de protección contra front-running
 * @returns {Object} Configuración de protección
 */
function getFrontRunningProtection() {
    return FRONT_RUNNING_PROTECTION;
}

/**
 * Obtiene la configuración de protección contra slippage
 * @returns {Object} Configuración de protección
 */
function getSlippageProtection() {
    return SLIPPAGE_PROTECTION;
}

/**
 * Valida una configuración de contrato
 * @param {Object} config - Configuración a validar
 * @returns {boolean} True si la configuración es válida
 */
function validateConfig(config) {
    try {
        // Validar costos
        if (!config.costs || typeof config.costs !== 'object') {
            throw new Error('Costs configuration is required');
        }

        // Validar rate limits
        if (!config.rateLimits || typeof config.rateLimits !== 'object') {
            throw new Error('Rate limits configuration is required');
        }

        // Validar data limits
        if (!config.dataLimits || typeof config.dataLimits !== 'object') {
            throw new Error('Data limits configuration is required');
        }

        // Validar que los costos estén en el rango correcto
        const minCost = config.costs.MIN_COST;
        const maxCost = config.costs.MAX_COST;
        
        if (minCost >= maxCost) {
            throw new Error('MIN_COST must be less than MAX_COST');
        }

        // Validar que todos los costos estén en el rango
        Object.entries(config.costs).forEach(([key, value]) => {
            if (key !== 'MIN_COST' && key !== 'MAX_COST') {
                if (value < minCost || value > maxCost) {
                    throw new Error(`Cost ${key} is out of range`);
                }
            }
        });

        return true;
    } catch (error) {
        console.error('Configuration validation failed:', error.message);
        return false;
    }
}

/**
 * Obtiene la configuración para deployment
 * @returns {Object} Configuración de deployment
 */
function getDeploymentConfig() {
    return {
        contractName: 'VendorWarsExtended',
        constructorArgs: [
            'BATTLE_TOKEN_ADDRESS', // Se reemplaza en runtime
            'OWNER_ADDRESS'         // Se reemplaza en runtime
        ],
        gasLimit: 3000000, // 3M gas
        gasPrice: 'auto',
        timeout: 300000, // 5 minutos
    };
}

/**
 * Obtiene la configuración para testing
 * @returns {Object} Configuración de testing
 */
function getTestingConfig() {
    return {
        testTimeout: 300000, // 5 minutos
        gasLimit: 2000000,   // 2M gas para tests
        accounts: 10,        // Número de cuentas de test
        initialBalance: ethers.parseEther("1000"), // Balance inicial para tests
    };
}

// ============ EXPORTS ============

module.exports = {
    getContractConfig,
    getCosts,
    getRateLimits,
    getDataLimits,
    getFrontRunningProtection,
    getSlippageProtection,
    validateConfig,
    getDeploymentConfig,
    getTestingConfig,
    COSTS,
    RATE_LIMITS,
    DATA_LIMITS,
    FRONT_RUNNING_PROTECTION,
    SLIPPAGE_PROTECTION,
};
