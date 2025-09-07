// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IVendorRegistration.sol";

/**
 * @title IVendorWarsExtended
 * @dev Interfaz extendida para el sistema Vendor Wars con funcionalidades avanzadas
 */
interface IVendorWarsExtended is IVendorRegistration {
    
    // ============ STRUCTS ============
    
    /**
     * @dev Estructura para almacenar información de un voto
     */
    struct Vote {
        address voter;           // Usuario que votó
        string vendorId;         // ID del vendor votado
        string zoneId;           // ID de la zona
        uint256 voteValue;       // Valor del voto
        uint256 tokensSpent;     // Tokens gastados en el voto
        bool isVerified;         // Si el voto está verificado con foto
        uint256 timestamp;       // Timestamp del voto
    }
    
    /**
     * @dev Estructura para almacenar información de un territorio
     */
    struct Territory {
        string zoneId;              // ID de la zona
        string dominantVendorId;    // Vendor dominante en la zona
        uint256 totalVotes;         // Total de votos en la zona
        uint256 lastUpdateTime;     // Última actualización
    }
    
    /**
     * @dev Estructura para almacenar información de un claim de territorio (commit-reveal)
     */
    struct TerritoryClaim {
        address claimant;           // Usuario que hace el claim
        string vendorId;            // ID del vendor que reclama
        uint256 commitTime;         // Timestamp del commit
        bytes32 commitHash;         // Hash del commit
        bool revealed;              // Si el claim fue revelado
        uint256 claimAmount;        // Cantidad reclamada
    }
    
    // ============ EVENTS ============
    
    /// @dev Evento emitido cuando se actualiza información de vendor
    event VendorInfoUpdated(string indexed vendorId, string newName, string newDescription, string newCategory);
    
    /// @dev Evento emitido cuando se verifica un vendor
    event VendorVerified(string indexed vendorId, address verifier, string verificationData);
    
    /// @dev Evento emitido cuando se aplica boost a un vendor
    event VendorBoosted(address indexed user, string vendorId, uint256 boostAmount, uint256 duration);
    
    /// @dev Evento emitido cuando se registra un voto
    event VoteRecorded(address indexed user, string vendorId, string zoneId, uint256 voteValue, bool isVerified);
    
    /// @dev Evento emitido cuando se reclama un territorio
    event TerritoryClaimed(string indexed zoneId, string vendorId, uint256 claimAmount);
    
    /// @dev Evento emitido cuando se mintea un NFT de logro
    event AchievementNFTMinted(address indexed user, uint256 tokenId, string achievementType, string metadata);
    
    /// @dev Evento emitido cuando se compra personalización de perfil
    event ProfileCustomizationPurchased(address indexed user, string customizationType, uint256 cost);
    
    /// @dev Evento emitido cuando se hace commit de un claim de territorio
    event TerritoryClaimCommitted(string indexed zoneId, string vendorId, bytes32 commitHash);
    
    /// @dev Evento emitido cuando se revela un claim de territorio
    event TerritoryClaimRevealed(string indexed zoneId, string vendorId, uint256 claimAmount);
    
    /// @dev Evento emitido cuando se queman tokens con protección de slippage
    event TokensBurnedWithSlippage(address indexed user, uint256 amount, uint256 minAmount, uint256 slippagePercentage);
    
    /// @dev Evento emitido cuando se detecta slippage alto
    event HighSlippageDetected(address indexed user, uint256 expectedAmount, uint256 actualAmount, uint256 slippagePercentage);
    
    // ============ CORE FUNCTIONS ============
    
    /// @dev Actualiza información de un vendor existente
    function updateVendorInfo(
        string calldata vendorId,
        string calldata newName,
        string calldata newDescription,
        string calldata newCategory
    ) external returns (bool success);
    
    /// @dev Verifica un vendor con evidencia
    function verifyVendor(
        string calldata vendorId,
        address verifier,
        string calldata verificationData
    ) external returns (bool success);
    
    /// @dev Aplica boost a un vendor
    function boostVendor(
        address user,
        string calldata vendorId,
        uint256 boostAmount,
        uint256 duration,
        uint256 cost
    ) external returns (bool success);
    
    /// @dev Envía un review y quema tokens
    function submitReview(
        address user,
        uint256 amount,
        string calldata reviewData,
        string calldata reviewId
    ) external returns (bool success);
    
    /// @dev Registra un voto para tracking
    function recordVote(
        address user,
        uint256 cost,
        string calldata vendorId,
        string calldata zoneId,
        uint256 voteValue,
        bool isVerified
    ) external returns (bool success);
    
    /// @dev Reclama un territorio para un vendor
    function claimTerritory(
        string calldata zoneId,
        string calldata vendorId,
        uint256 claimAmount
    ) external returns (bool success);
    
    // ============ FRONT-RUNNING PROTECTION FUNCTIONS ============
    
    /// @dev Hace commit de un claim de territorio (commit-reveal)
    function commitTerritoryClaim(
        string calldata zoneId,
        string calldata vendorId,
        bytes32 commitHash
    ) external returns (bool success);
    
    /// @dev Revela un claim de territorio (commit-reveal)
    function revealTerritoryClaim(
        string calldata zoneId,
        string calldata vendorId,
        uint256 claimAmount,
        string calldata nonce
    ) external returns (bool success);
    
    // ============ SLIPPAGE PROTECTION FUNCTIONS ============
    
    /// @dev Quema tokens con protección de slippage
    function burnTokensWithSlippageProtection(
        address user,
        uint256 amount,
        uint256 minAmount
    ) external returns (bool success);
    
    // ============ GAMIFICATION FUNCTIONS ============
    
    /// @dev Mina un NFT de logro para un usuario
    function mintAchievementNFT(
        address user,
        string calldata achievementType,
        string calldata metadata,
        uint256 cost
    ) external returns (uint256 tokenId);
    
    /// @dev Compra personalización de perfil
    function purchaseProfileCustomization(
        address user,
        string calldata customizationType,
        uint256 cost
    ) external returns (bool success);
    
    // ============ VIEW FUNCTIONS ============
    
    /// @dev Obtiene el total de votos de un vendor
    function getVendorTotalVotes(string calldata vendorId) external view returns (uint256 totalVotes);
    
    /// @dev Obtiene el total de votos de una zona
    function getZoneTotalVotes(string calldata zoneId) external view returns (uint256 totalVotes);
    
    /// @dev Obtiene la información de un territorio
    function getTerritory(string calldata zoneId) external view returns (Territory memory territory);
    
    /// @dev Obtiene los votos de un vendor
    function getVendorVotes(string calldata vendorId) external view returns (Vote[] memory votes);
    
    /// @dev Obtiene los votos de una zona
    function getZoneVotes(string calldata zoneId) external view returns (Vote[] memory votes);
    
    /// @dev Obtiene los votos de un usuario
    function getUserVotes(address user) external view returns (Vote[] memory votes);
    
    /// @dev Obtiene información extendida de un vendor
    function getVendorInfoExtended(string calldata vendorId) external view returns (
        address user,
        uint256 amount,
        uint256 timestamp,
        string memory vendorData,
        string memory zoneId,
        bool isVerified,
        address verifier,
        uint256 verificationTime,
        bool exists,
        uint256 totalVotes,
        uint256 territoryScore
    );
    
    /// @dev Obtiene información de territorio
    function getTerritoryInfo(string calldata zoneId) external view returns (
        string memory dominantVendorId,
        uint256 totalVotes,
        uint256 lastUpdateTime,
        bool exists
    );
    
    /// @dev Obtiene votos de un vendor en una zona específica
    function getZoneVendorVotes(string calldata zoneId, string calldata vendorId) external view returns (uint256 votes);
    
    /// @dev Obtiene estadísticas generales
    function getGeneralStats() external view returns (
        uint256 totalTokensBurned,
        uint256 totalVendorsRegistered,
        uint256 totalVotes
    );
    
    // ============ FRONT-RUNNING PROTECTION VIEW FUNCTIONS ============
    
    /// @dev Obtiene información de un claim de territorio
    function getTerritoryClaim(string calldata zoneId) external view returns (TerritoryClaim memory claim);
    
    /// @dev Obtiene el contador diario de claims de territorio de un usuario
    function getDailyTerritoryClaimCount(address user, uint256 day) external view returns (uint256);
    
    /// @dev Verifica si un claim de territorio puede ser revelado
    function canRevealTerritoryClaim(string calldata zoneId) external view returns (bool canReveal, uint256 timeRemaining);
    
    // ============ SLIPPAGE PROTECTION VIEW FUNCTIONS ============
    
    /// @dev Obtiene el timestamp de la última quema de tokens de un usuario
    function getLastTokenBurnTime(address user) external view returns (uint256);
    
    /// @dev Obtiene el porcentaje de slippage registrado para un usuario
    function getUserBurnSlippage(address user) external view returns (uint256);
    
    /// @dev Verifica si un usuario puede quemar tokens (intervalo mínimo)
    function canBurnTokens(address user) external view returns (bool canBurn, uint256 timeRemaining);
    
    /// @dev Calcula el slippage máximo permitido para una cantidad
    function getMaxAllowedSlippage(uint256 minAmount) external pure returns (uint256);
}
