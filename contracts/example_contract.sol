// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./IVendorRegistration.sol";

/**
 * @title VendorRegistration
 * @dev Smart contract para el sistema de registro de vendors con cobro de tokens
 * @dev Los tokens se queman (destruyen) al registrar un vendor
 * @dev Solo el owner (backend) puede ejecutar operaciones
 */
contract VendorRegistration is IVendorRegistration, Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    // ============ CONSTANTS ============
    
    /// @dev Costo mínimo para cualquier operación (validación de seguridad)
    uint256 public constant MIN_COST = 1 * 10**18; // 1 token mínimo
    
    /// @dev Costo máximo para cualquier operación (validación de seguridad)
    uint256 public constant MAX_COST = 500 * 10**18; // 500 tokens máximo
    
    /// @dev Máximo número de operaciones por usuario por día (rate limiting genérico)
    uint256 public constant MAX_OPERATIONS_PER_DAY = 20;
    
    /// @dev Máximo número de operaciones por usuario por semana (rate limiting genérico)
    uint256 public constant MAX_OPERATIONS_PER_WEEK = 100;
    
    /// @dev Máximo número de vendors que un usuario puede registrar por día
    uint256 public constant MAX_VENDORS_PER_DAY = 3;
    
    /// @dev Máximo número de vendors que un usuario puede registrar por semana
    uint256 public constant MAX_VENDORS_PER_WEEK = 10;
    
    /// @dev Período de cooldown entre registros (1 hora)
    uint256 public constant COOLDOWN_PERIOD = 1 hours;
    
    // ============ DATA VALIDATION CONSTANTS ============
    
    /// @dev Máximo tamaño de datos de vendor (1000 bytes)
    uint256 public constant MAX_VENDOR_DATA_LENGTH = 1000;
    
    /// @dev Máximo tamaño de datos de review (500 bytes)
    uint256 public constant MAX_REVIEW_DATA_LENGTH = 500;
    
    /// @dev Máximo tamaño de datos de verificación (200 bytes)
    uint256 public constant MAX_VERIFICATION_DATA_LENGTH = 200;
    
    /// @dev Máximo tamaño de datos de territorio (300 bytes)
    uint256 public constant MAX_TERRITORY_DATA_LENGTH = 300;
    
    /// @dev Máximo tamaño de metadata de NFT (400 bytes)
    uint256 public constant MAX_METADATA_LENGTH = 400;
    
    // ============ FRONT-RUNNING PROTECTION CONSTANTS ============
    
    /// @dev Porcentaje mínimo de votos para reclamar territorio (51%)
    uint256 public constant MIN_TERRITORY_CLAIM_PERCENTAGE = 51;
    
    /// @dev Delay obligatorio para commit-reveal (1 día)
    uint256 public constant COMMIT_REVEAL_DELAY = 1 days;
    
    /// @dev Máximo número de claims de territorio por usuario por día
    uint256 public constant MAX_TERRITORY_CLAIMS_PER_DAY = 3;
    
    // ============ SLIPPAGE PROTECTION CONSTANTS ============
    
    /// @dev Porcentaje máximo de slippage permitido (5%)
    uint256 public constant MAX_SLIPPAGE_PERCENTAGE = 5;
    
    /// @dev Tiempo mínimo entre quemas de tokens (1 hora)
    uint256 public constant MIN_BURN_INTERVAL = 1 hours;
    
    // ============ STATE VARIABLES ============
    
    /// @dev Dirección del token $BATTLE
    IERC20 public immutable battleToken;
    
    /// @dev Total de tokens quemados por registros de vendor
    uint256 private _totalTokensBurned;
    
    /// @dev Total de vendors registrados
    uint256 private _totalVendorsRegistered;
    
    /// @dev Total de votos registrados
    uint256 private _totalVotes;
    
    /// @dev Contador para generar IDs únicos de tokens
    uint256 private _tokenIdCounter;
    
    /// @dev Mapping de vendorId a información del vendor
    mapping(string => VendorInfo) private _vendors;
    
    /// @dev Mapping de usuario a contador diario de vendors
    mapping(address => mapping(uint256 => uint256)) private _dailyVendorCount;
    
    /// @dev Mapping de usuario a contador semanal de vendors
    mapping(address => mapping(uint256 => uint256)) private _weeklyVendorCount;
    
    /// @dev Mapping de usuario a contador diario de operaciones (rate limiting genérico)
    mapping(address => mapping(uint256 => uint256)) private _dailyOperationCount;
    
    /// @dev Mapping de usuario a contador semanal de operaciones (rate limiting genérico)
    mapping(address => mapping(uint256 => uint256)) private _weeklyOperationCount;
    
    /// @dev Mapping de usuario a timestamp del último registro
    mapping(address => uint256) private _lastRegistrationTime;
    
    /// @dev Mapping de vendorId a si ya existe
    mapping(string => bool) private _vendorExists;
    
    /// @dev Mapping de vendorId a votos
    mapping(string => Vote[]) private _vendorVotes;
    
    /// @dev Mapping de zoneId a votos
    mapping(string => Vote[]) private _zoneVotes;
    
    /// @dev Mapping de usuario a votos
    mapping(address => Vote[]) private _userVotes;
    
    /// @dev Mapping de zoneId a total de votos
    mapping(string => uint256) private _zoneTotalVotes;
    
    /// @dev Mapping de zoneId a territorio
    mapping(string => Territory) private _territories;
    
    /// @dev Mapping de zoneId a vendor dominante
    mapping(string => string) private _dominantVendorByZone;
    
    /// @dev Mapping de zoneId + vendorId a votos
    mapping(string => mapping(string => uint256)) private _zoneVendorVotes;
    
    /// @dev Mapping de vendorId a puntuación de territorio
    mapping(string => uint256) private _vendorTerritoryScore;
    
    // ============ FRONT-RUNNING PROTECTION STATE ============
    
    /// @dev Mapping de zoneId a claim de territorio
    mapping(string => TerritoryClaim) private _territoryClaims;
    
    /// @dev Mapping de usuario a contador diario de claims de territorio
    mapping(address => mapping(uint256 => uint256)) private _dailyTerritoryClaimCount;
    
    // ============ SLIPPAGE PROTECTION STATE ============
    
    /// @dev Mapping de usuario a timestamp de última quema de tokens
    mapping(address => uint256) private _lastTokenBurnTime;
    
    /// @dev Mapping de usuario a porcentaje de slippage registrado
    mapping(address => uint256) private _userBurnSlippage;
    
    // ============ STRUCTS ============
    
    /**
     * @dev Estructura para almacenar información de un vendor
     */
    struct VendorInfo {
        address user;           // Usuario que registró el vendor
        uint256 amount;         // Cantidad de tokens quemados
        uint256 timestamp;      // Timestamp del registro
        string vendorData;      // Datos del vendor (JSON)
        string zoneId;          // ID de la zona donde opera
        bool isVerified;        // Si el vendor está verificado
        address verifier;       // Quien verificó el vendor
        uint256 verificationTime; // Timestamp de verificación
        uint256 totalVotes;     // Total de votos recibidos
        uint256 territoryScore; // Puntuación en territorio
    }
    
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
    
    /// @dev Evento emitido cuando se actualiza el costo de registro
    event RegistrationCostUpdated(uint256 oldCost, uint256 newCost);
    
    /// @dev Evento emitido cuando se actualiza el límite diario
    event DailyLimitUpdated(uint256 oldLimit, uint256 newLimit);
    
    /// @dev Evento emitido cuando se actualiza el límite semanal
    event WeeklyLimitUpdated(uint256 oldLimit, uint256 newLimit);
    
    /// @dev Evento emitido cuando se actualiza el período de cooldown
    event CooldownPeriodUpdated(uint256 oldPeriod, uint256 newPeriod);
    
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
    
    // ============ FRONT-RUNNING PROTECTION EVENTS ============
    
    /// @dev Evento emitido cuando se hace commit de un claim de territorio
    event TerritoryClaimCommitted(string indexed zoneId, string vendorId, bytes32 commitHash);
    
    /// @dev Evento emitido cuando se revela un claim de territorio
    event TerritoryClaimRevealed(string indexed zoneId, string vendorId, uint256 claimAmount);
    
    // ============ SLIPPAGE PROTECTION EVENTS ============
    
    /// @dev Evento emitido cuando se queman tokens con protección de slippage
    event TokensBurnedWithSlippage(address indexed user, uint256 amount, uint256 minAmount, uint256 slippagePercentage);
    
    /// @dev Evento emitido cuando se detecta slippage alto
    event HighSlippageDetected(address indexed user, uint256 expectedAmount, uint256 actualAmount, uint256 slippagePercentage);
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Constructor del contrato
     * @param _battleTokenAddress Dirección del token $BATTLE
     * @param _initialOwner Dirección del owner inicial (backend)
     */
    constructor(
        address _battleTokenAddress,
        address _initialOwner
    ) Ownable(_initialOwner) {
        require(_battleTokenAddress != address(0), "Invalid token address");
        require(_initialOwner != address(0), "Invalid owner address");
        
        battleToken = IERC20(_battleTokenAddress);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Obtiene el total de votos de un vendor
     * @param vendorId ID del vendor
     * @return totalVotes Total de votos del vendor
     */
    function getVendorTotalVotes(string calldata vendorId) external view returns (uint256 totalVotes) {
        return _vendors[vendorId].totalVotes;
    }
    
    /**
     * @dev Obtiene el total de votos de una zona
     * @param zoneId ID de la zona
     * @return totalVotes Total de votos de la zona
     */
    function getZoneTotalVotes(string calldata zoneId) external view returns (uint256 totalVotes) {
        return _zoneTotalVotes[zoneId];
    }
    
    /**
     * @dev Obtiene la información de un territorio
     * @param zoneId ID de la zona
     * @return territory Información del territorio
     */
    function getTerritory(string calldata zoneId) external view returns (Territory memory territory) {
        return _territories[zoneId];
    }
    
    /**
     * @dev Obtiene los votos de un vendor
     * @param vendorId ID del vendor
     * @return votes Array de votos del vendor
     */
    function getVendorVotes(string calldata vendorId) external view returns (Vote[] memory votes) {
        return _vendorVotes[vendorId];
    }
    
    /**
     * @dev Obtiene los votos de una zona
     * @param zoneId ID de la zona
     * @return votes Array de votos de la zona
     */
    function getZoneVotes(string calldata zoneId) external view returns (Vote[] memory votes) {
        return _zoneVotes[zoneId];
    }
    
    /**
     * @dev Obtiene los votos de un usuario
     * @param user Dirección del usuario
     * @return votes Array de votos del usuario
     */
    function getUserVotes(address user) external view returns (Vote[] memory votes) {
        return _userVotes[user];
    }
    
    /**
     * @dev Obtiene información extendida de un vendor
     * @param vendorId ID del vendor
     * @return user Usuario que registró el vendor
     * @return amount Cantidad de tokens quemados
     * @return timestamp Timestamp del registro
     * @return vendorData Datos del vendor
     * @return zoneId ID de la zona
     * @return isVerified Si está verificado
     * @return verifier Quien lo verificó
     * @return verificationTime Timestamp de verificación
     * @return exists Si existe
     * @return totalVotes Total de votos
     * @return territoryScore Puntuación de territorio
     */
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
    ) {
        VendorInfo memory vendor = _vendors[vendorId];
        return (
            vendor.user,
            vendor.amount,
            vendor.timestamp,
            vendor.vendorData,
            vendor.zoneId,
            vendor.isVerified,
            vendor.verifier,
            vendor.verificationTime,
            _vendorExists[vendorId],
            vendor.totalVotes,
            vendor.territoryScore
        );
    }
    
    /**
     * @dev Obtiene información de territorio
     * @param zoneId ID de la zona
     * @return dominantVendorId Vendor dominante
     * @return totalVotes Total de votos
     * @return lastUpdateTime Última actualización
     * @return exists Si existe
     */
    function getTerritoryInfo(string calldata zoneId) external view returns (
        string memory dominantVendorId,
        uint256 totalVotes,
        uint256 lastUpdateTime,
        bool exists
    ) {
        Territory memory territory = _territories[zoneId];
        return (
            territory.dominantVendorId,
            territory.totalVotes,
            territory.lastUpdateTime,
            bytes(territory.zoneId).length > 0
        );
    }
    
    /**
     * @dev Obtiene votos de un vendor en una zona específica
     * @param zoneId ID de la zona
     * @param vendorId ID del vendor
     * @return votes Total de votos del vendor en la zona
     */
    function getZoneVendorVotes(string calldata zoneId, string calldata vendorId) 
        external view returns (uint256 votes) {
        return _zoneVendorVotes[zoneId][vendorId];
    }
    
    /**
     * @dev Obtiene estadísticas generales
     * @return totalTokensBurned Total de tokens quemados
     * @return totalVendorsRegistered Total de vendors registrados
     * @return totalVotes Total de votos
     */
    function getGeneralStats() external view returns (
        uint256 totalTokensBurned,
        uint256 totalVendorsRegistered,
        uint256 totalVotes
    ) {
        return (_totalTokensBurned, _totalVendorsRegistered, _totalVotes);
    }
    
    // ============ FRONT-RUNNING PROTECTION VIEW FUNCTIONS ============
    
    /**
     * @dev Obtiene información de un claim de territorio
     * @param zoneId ID de la zona
     * @return claim Información del claim
     */
    function getTerritoryClaim(string calldata zoneId) external view returns (TerritoryClaim memory claim) {
        return _territoryClaims[zoneId];
    }
    
    /**
     * @dev Obtiene el contador diario de claims de territorio de un usuario
     * @param user Dirección del usuario
     * @param day Día específico
     * @return Número de claims en ese día
     */
    function getDailyTerritoryClaimCount(address user, uint256 day) external view returns (uint256) {
        return _dailyTerritoryClaimCount[user][day];
    }
    
    /**
     * @dev Verifica si un claim de territorio puede ser revelado
     * @param zoneId ID de la zona
     * @return canReveal True si puede ser revelado
     * @return timeRemaining Tiempo restante en segundos
     */
    function canRevealTerritoryClaim(string calldata zoneId) external view returns (bool canReveal, uint256 timeRemaining) {
        TerritoryClaim memory claim = _territoryClaims[zoneId];
        if (claim.commitTime == 0 || claim.revealed) {
            return (false, 0);
        }
        
        uint256 timeElapsed = block.timestamp - claim.commitTime;
        if (timeElapsed >= COMMIT_REVEAL_DELAY) {
            return (true, 0);
        } else {
            return (false, COMMIT_REVEAL_DELAY - timeElapsed);
        }
    }
    
    // ============ SLIPPAGE PROTECTION VIEW FUNCTIONS ============
    
    /**
     * @dev Obtiene el timestamp de la última quema de tokens de un usuario
     * @param user Dirección del usuario
     * @return Timestamp de la última quema
     */
    function getLastTokenBurnTime(address user) external view returns (uint256) {
        return _lastTokenBurnTime[user];
    }
    
    /**
     * @dev Obtiene el porcentaje de slippage registrado para un usuario
     * @param user Dirección del usuario
     * @return Porcentaje de slippage
     */
    function getUserBurnSlippage(address user) external view returns (uint256) {
        return _userBurnSlippage[user];
    }
    
    /**
     * @dev Verifica si un usuario puede quemar tokens (intervalo mínimo)
     * @param user Dirección del usuario
     * @return canBurn True si puede quemar
     * @return timeRemaining Tiempo restante en segundos
     */
    function canBurnTokens(address user) external view returns (bool canBurn, uint256 timeRemaining) {
        if (_lastTokenBurnTime[user] == 0) {
            return (true, 0);
        }
        
        uint256 timeElapsed = block.timestamp - _lastTokenBurnTime[user];
        if (timeElapsed >= MIN_BURN_INTERVAL) {
            return (true, 0);
        } else {
            return (false, MIN_BURN_INTERVAL - timeElapsed);
        }
    }
    
    /**
     * @dev Calcula el slippage máximo permitido para una cantidad
     * @param minAmount Cantidad mínima
     * @return Slippage máximo en wei
     */
    function getMaxAllowedSlippage(uint256 minAmount) external pure returns (uint256) {
        return (minAmount * MAX_SLIPPAGE_PERCENTAGE) / 100;
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Valida que el costo esté dentro del rango permitido
     * @param cost Costo a validar
     */
    function _validateCost(uint256 cost) internal pure {
        require(cost >= MIN_COST, "Cost too low");
        require(cost <= MAX_COST, "Cost too high");
    }
    
    /**
     * @dev Actualiza los contadores de operaciones genéricas
     * @param user Dirección del usuario
     */
    function _updateGenericOperationCounters(address user) internal {
        uint256 currentDay = _getCurrentDay();
        uint256 currentWeek = _getCurrentWeek();
        
        _dailyOperationCount[user][currentDay]++;
        _weeklyOperationCount[user][currentWeek]++;
    }
    
    /**
     * @dev Inicializa un nuevo territorio
     * @param zoneId ID de la zona
     */
    function _initializeTerritory(string calldata zoneId) internal {
        _territories[zoneId] = Territory({
            zoneId: zoneId,
            dominantVendorId: "",
            totalVotes: 0,
            lastUpdateTime: block.timestamp
        });
    }
    
    /**
     * @dev Actualiza el dominio de territorio
     * @param zoneId ID de la zona
     * @param vendorId ID del vendor
     * @param voteValue Valor del voto
     */
    function _updateTerritory(string calldata zoneId, string calldata vendorId, uint256 voteValue) internal {
        // Actualizar votos del vendor en la zona
        _zoneVendorVotes[zoneId][vendorId] += voteValue;
        
        // Actualizar territorio
        Territory storage territory = _territories[zoneId];
        territory.totalVotes += voteValue;
        territory.lastUpdateTime = block.timestamp;
        
        // Verificar si este vendor se convierte en dominante
        if (bytes(territory.dominantVendorId).length == 0 || 
            _zoneVendorVotes[zoneId][vendorId] > _zoneVendorVotes[zoneId][territory.dominantVendorId]) {
            territory.dominantVendorId = vendorId;
            _dominantVendorByZone[zoneId] = vendorId;
        }
        
        // Actualizar puntuación de territorio del vendor
        _vendors[vendorId].territoryScore = _zoneVendorVotes[zoneId][vendorId];
        _vendorTerritoryScore[vendorId] = _zoneVendorVotes[zoneId][vendorId];
    }
    
    // ============ MODIFIERS ============
    
    /**
     * @dev Modificador para verificar que el usuario tenga saldo suficiente
     */
    modifier checkSufficientBalance(address user) {
        // La validación de saldo se hace en cada función específica
        _;
    }
    
    /**
     * @dev Modificador para verificar límites de rate limiting
     */
    modifier checkRateLimits(address user) {
        require(
            _dailyVendorCount[user][_getCurrentDay()] < MAX_VENDORS_PER_DAY,
            "Daily limit exceeded"
        );
        require(
            _weeklyVendorCount[user][_getCurrentWeek()] < MAX_VENDORS_PER_WEEK,
            "Weekly limit exceeded"
        );
        require(
            _lastRegistrationTime[user] == 0 || 
            block.timestamp - _lastRegistrationTime[user] >= COOLDOWN_PERIOD,
            "Cooldown period not met"
        );
        _;
    }
    
    /**
     * @dev Modificador para verificar límites de rate limiting genérico
     */
    modifier checkGenericRateLimits(address user) {
        uint256 currentDay = _getCurrentDay();
        uint256 currentWeek = _getCurrentWeek();
        
        // Verificar límite diario genérico
        require(
            _dailyOperationCount[user][currentDay] < MAX_OPERATIONS_PER_DAY,
            "Daily operation limit exceeded"
        );
        
        // Verificar límite semanal genérico
        require(
            _weeklyOperationCount[user][currentWeek] < MAX_OPERATIONS_PER_WEEK,
            "Weekly operation limit exceeded"
        );
        
        _;
    }
    
    /**
     * @dev Modificador para verificar que el vendor exista
     */
    modifier vendorExists(string calldata vendorId) {
        require(_vendorExists[vendorId], "Vendor does not exist");
        _;
    }
    
    /**
     * @dev Modificador para verificar que el vendor esté en la zona correcta
     */
    modifier vendorInZone(string calldata vendorId, string calldata zoneId) {
        require(
            keccak256(bytes(_vendors[vendorId].zoneId)) == keccak256(bytes(zoneId)),
            "Vendor not in specified zone"
        );
        _;
    }
    
    /**
     * @dev Modificador para verificar que el vendor no exista
     */
    modifier vendorDoesNotExist(string calldata vendorId) {
        require(!_vendorExists[vendorId], "Vendor already exists");
        _;
    }
    
    // ============ DATA VALIDATION MODIFIERS ============
    
    /**
     * @dev Modificador para validar datos de vendor
     */
    modifier validateVendorData(string calldata data) {
        require(bytes(data).length > 0, "Vendor data cannot be empty");
        require(bytes(data).length <= MAX_VENDOR_DATA_LENGTH, "Vendor data too large");
        _;
    }
    
    /**
     * @dev Modificador para validar datos de review
     */
    modifier validateReviewData(string calldata data) {
        require(bytes(data).length > 0, "Review data cannot be empty");
        require(bytes(data).length <= MAX_REVIEW_DATA_LENGTH, "Review data too large");
        _;
    }
    
    /**
     * @dev Modificador para validar datos de verificación
     */
    modifier validateVerificationData(string calldata data) {
        require(bytes(data).length > 0, "Verification data cannot be empty");
        require(bytes(data).length <= MAX_VERIFICATION_DATA_LENGTH, "Verification data too large");
        _;
    }
    
    /**
     * @dev Modificador para validar metadata de NFT
     */
    modifier validateMetadata(string calldata data) {
        require(bytes(data).length > 0, "Metadata cannot be empty");
        require(bytes(data).length <= MAX_METADATA_LENGTH, "Metadata too large");
        _;
    }
    
    // ============ FRONT-RUNNING PROTECTION MODIFIERS ============
    
    /**
     * @dev Modificador para validar claim de territorio
     */
    modifier validateTerritoryClaim(string calldata zoneId, string calldata vendorId) {
        require(bytes(zoneId).length > 0, "Zone ID cannot be empty");
        require(bytes(vendorId).length > 0, "Vendor ID cannot be empty");
        require(_vendorExists[vendorId], "Vendor does not exist");
        
        // Verificar que el vendor tiene >51% de votos en la zona
        uint256 zoneTotalVotes = _zoneTotalVotes[zoneId];
        uint256 vendorZoneVotes = _zoneVendorVotes[zoneId][vendorId];
        require(zoneTotalVotes > 0, "No votes in zone");
        require((vendorZoneVotes * 100) / zoneTotalVotes >= MIN_TERRITORY_CLAIM_PERCENTAGE, 
                "Insufficient votes for territory claim");
        _;
    }
    
    /**
     * @dev Modificador para verificar límites de claims de territorio
     */
    modifier checkTerritoryClaimLimits(address user) {
        uint256 currentDay = _getCurrentDay();
        require(
            _dailyTerritoryClaimCount[user][currentDay] < MAX_TERRITORY_CLAIMS_PER_DAY,
            "Daily territory claim limit exceeded"
        );
        _;
    }
    
    // ============ SLIPPAGE PROTECTION MODIFIERS ============
    
    /**
     * @dev Modificador para validar slippage en quemas de tokens
     */
    modifier validateSlippage(uint256 amount, uint256 minAmount) {
        require(amount >= minAmount, "Amount below minimum threshold");
        require(minAmount > 0, "Minimum amount must be positive");
        
        // Calcular slippage máximo permitido
        uint256 maxSlippage = (minAmount * MAX_SLIPPAGE_PERCENTAGE) / 100;
        require(amount <= minAmount + maxSlippage, "Slippage too high");
        _;
    }
    
    /**
     * @dev Modificador para verificar intervalo mínimo entre quemas
     */
    modifier checkBurnInterval(address user) {
        require(
            _lastTokenBurnTime[user] == 0 || 
            block.timestamp - _lastTokenBurnTime[user] >= MIN_BURN_INTERVAL,
            "Burn interval not met"
        );
        _;
    }
    
    // ============ EXTERNAL FUNCTIONS ============
    
    /**
     * @dev Registra un nuevo vendor y quema tokens
     * @param user Dirección del usuario que registra el vendor
     * @param amount Cantidad de tokens a quemar (debe ser 50 $BATTLE)
     * @param vendorData Datos del vendor (nombre, descripción, etc.)
     * @param vendorId ID único del vendor
     * @return success True si el registro fue exitoso
     */
    function registerVendor(
        address user,
        uint256 amount,
        string calldata vendorData,
        string calldata vendorId,
        string calldata zoneId
    ) 
        external 
        override 
        onlyOwner 
        nonReentrant 
        whenNotPaused
        checkSufficientBalance(user)
        checkRateLimits(user)
        vendorDoesNotExist(vendorId)
        validateVendorData(vendorData)
        returns (bool success)
    {
        _validateCost(amount);
        require(bytes(vendorId).length > 0, "Empty vendor ID");
        require(bytes(zoneId).length > 0, "Empty zone ID");
        require(user != address(0), "Invalid user address");
        
        // Quemar tokens del usuario
        bool burnSuccess = _burnTokens(user, amount);
        require(burnSuccess, "Token burn failed");
        
        // Registrar vendor
        _registerVendor(user, amount, vendorData, vendorId, zoneId);
        
        // Actualizar contadores y timestamps
        _updateCounters(user);
        
        emit VendorRegistered(user, amount, vendorId, block.timestamp);
        
        return true;
    }
    
    /**
     * @dev Envía un review y quema tokens
     * @param user Dirección del usuario que envía el review
     * @param amount Cantidad de tokens a quemar (debe ser 15 $BATTLE)
     * @param reviewData Datos del review (contenido, vendorId, etc.)
     * @param reviewId ID único del review
     * @return success True si el review fue enviado exitosamente
     */
    function submitReview(
        address user,
        uint256 amount,
        string calldata reviewData,
        string calldata reviewId
    ) 
        external 
        onlyOwner 
        nonReentrant 
        whenNotPaused
        checkSufficientBalance(user)
        checkGenericRateLimits(user)
        validateReviewData(reviewData)
        returns (bool success)
    {
        _validateCost(amount);
        require(bytes(reviewId).length > 0, "Empty review ID");
        require(user != address(0), "Invalid user address");
        
        // Quemar tokens del usuario
        bool burnSuccess = _burnTokens(user, amount);
        require(burnSuccess, "Token burn failed");
        
        // Actualizar contadores de operaciones genéricas
        _updateGenericOperationCounters(user);
        
        emit TokensBurned(user, amount, block.timestamp);
        
        return true;
    }

    /// @dev Actualiza información de un vendor existente
    function updateVendorInfo(
        string calldata vendorId,
        string calldata newName,
        string calldata newDescription,
        string calldata newCategory
    )
        external
        onlyOwner
        nonReentrant
        whenNotPaused
        returns (bool success)
    {
        require(bytes(vendorId).length > 0, "Vendor ID cannot be empty");
        require(bytes(newName).length > 0, "Vendor name cannot be empty");
        require(bytes(newDescription).length > 0, "Vendor description cannot be empty");
        require(bytes(newCategory).length > 0, "Vendor category cannot be empty");
        require(_vendorExists[vendorId], "Vendor does not exist");

        // Actualizar información del vendor en storage
        VendorInfo storage vendor = _vendors[vendorId];
        vendor.vendorData = string(abi.encodePacked(
            '{"name":"', newName, '","description":"', newDescription, '","category":"', newCategory, '"}'
        ));

        // Emit event for vendor info update
        emit VendorInfoUpdated(vendorId, newName, newDescription, newCategory);

        return true;
    }

    /// @dev Verifica un vendor con evidencia
    function verifyVendor(
        string calldata vendorId,
        address verifier,
        string calldata verificationData
    )
        external
        onlyOwner
        nonReentrant
        whenNotPaused
        validateVerificationData(verificationData)
        returns (bool success)
    {
        require(bytes(vendorId).length > 0, "Vendor ID cannot be empty");
        require(verifier != address(0), "Invalid verifier address");
        require(_vendorExists[vendorId], "Vendor does not exist");

        // Actualizar estado de verificación en storage
        VendorInfo storage vendor = _vendors[vendorId];
        vendor.isVerified = true;
        vendor.verifier = verifier;
        vendor.verificationTime = block.timestamp;

        // Emit event for vendor verification
        emit VendorVerified(vendorId, verifier, verificationData);

        return true;
    }

    /// @dev Aplica boost a un vendor
    function boostVendor(
        address user,
        string calldata vendorId,
        uint256 boostAmount,
        uint256 duration,
        uint256 cost
    )
        external
        onlyOwner
        nonReentrant
        whenNotPaused
        checkSufficientBalance(user)
        checkGenericRateLimits(user)
        returns (bool success)
    {
        require(bytes(vendorId).length > 0, "Vendor ID cannot be empty");
        require(boostAmount > 0, "Boost amount must be positive");
        require(duration > 0, "Duration must be positive");
        _validateCost(cost);

        // Burn tokens from user
        bool burnSuccess = _burnTokens(user, cost);
        require(burnSuccess, "Token burn failed");

        // Actualizar contadores de operaciones genéricas
        _updateGenericOperationCounters(user);

        // Emit event for vendor boost
        emit VendorBoosted(user, vendorId, boostAmount, duration);

        return true;
    }

    /// @dev Registra un voto para tracking
    function recordVote(
        address user,
        uint256 cost,
        string calldata vendorId,
        string calldata zoneId,
        uint256 voteValue,
        bool isVerified
    )
        external
        onlyOwner
        nonReentrant
        whenNotPaused
        checkSufficientBalance(user)
        checkGenericRateLimits(user)
        vendorExists(vendorId)
        vendorInZone(vendorId, zoneId)
        returns (bool success)
    {
        require(bytes(vendorId).length > 0, "Vendor ID cannot be empty");
        require(bytes(zoneId).length > 0, "Zone ID cannot be empty");
        require(voteValue > 0, "Vote value must be positive");

        // Validar costo
        _validateCost(cost);

        // Quemar tokens
        bool burnSuccess = _burnTokens(user, cost);
        require(burnSuccess, "Token burn failed");

        // Crear voto
        Vote memory newVote = Vote({
            voter: user,
            vendorId: vendorId,
            zoneId: zoneId,
            voteValue: voteValue,
            tokensSpent: cost,
            isVerified: isVerified,
            timestamp: block.timestamp
        });

        // Guardar en storage
        _vendorVotes[vendorId].push(newVote);
        _zoneVotes[zoneId].push(newVote);
        _userVotes[user].push(newVote);
        
        // Actualizar totales (solo una vez)
        _zoneTotalVotes[zoneId] += voteValue;
        _vendors[vendorId].totalVotes += voteValue;

        // Actualizar territorio
        _updateTerritory(zoneId, vendorId, voteValue);

        // Actualizar contadores de operaciones genéricas
        _updateGenericOperationCounters(user);

        // Emit event for vote recording
        emit VoteRecorded(user, vendorId, zoneId, voteValue, isVerified);

        return true;
    }

    /// @dev Reclama un territorio para un vendor
    function claimTerritory(
        string calldata zoneId,
        string calldata vendorId,
        uint256 claimAmount
    )
        external
        onlyOwner
        nonReentrant
        whenNotPaused
        returns (bool success)
    {
        require(bytes(zoneId).length > 0, "Zone ID cannot be empty");
        require(bytes(vendorId).length > 0, "Vendor ID cannot be empty");
        require(claimAmount > 0, "Claim amount must be positive");
        require(_vendorExists[vendorId], "Vendor does not exist");

        // Crear o actualizar territorio
        Territory storage territory = _territories[zoneId];
        territory.zoneId = zoneId;
        territory.dominantVendorId = vendorId;
        territory.totalVotes = claimAmount;
        territory.lastUpdateTime = block.timestamp;

        // Emit event for territory claim
        emit TerritoryClaimed(zoneId, vendorId, claimAmount);

        return true;
    }

    // ============ FRONT-RUNNING PROTECTION FUNCTIONS ============

    /// @dev Hace commit de un claim de territorio (commit-reveal)
    function commitTerritoryClaim(
        string calldata zoneId, 
        string calldata vendorId, 
        bytes32 commitHash
    ) 
        external 
        onlyOwner 
        nonReentrant 
        whenNotPaused 
        checkTerritoryClaimLimits(msg.sender)
        returns (bool success) 
    {
        require(commitHash != bytes32(0), "Invalid commit hash");
        require(_territoryClaims[zoneId].commitTime == 0, "Claim already exists");
        require(bytes(zoneId).length > 0, "Zone ID cannot be empty");
        require(bytes(vendorId).length > 0, "Vendor ID cannot be empty");
        require(_vendorExists[vendorId], "Vendor does not exist");
        
        _territoryClaims[zoneId] = TerritoryClaim({
            claimant: msg.sender,
            vendorId: vendorId,
            commitTime: block.timestamp,
            commitHash: commitHash,
            revealed: false,
            claimAmount: 0
        });
        
        // Actualizar contador diario
        uint256 currentDay = _getCurrentDay();
        _dailyTerritoryClaimCount[msg.sender][currentDay]++;
        
        emit TerritoryClaimCommitted(zoneId, vendorId, commitHash);
        return true;
    }

    /// @dev Revela un claim de territorio (commit-reveal)
    function revealTerritoryClaim(
        string calldata zoneId, 
        string calldata vendorId, 
        uint256 claimAmount, 
        string calldata nonce
    ) 
        external 
        onlyOwner 
        nonReentrant 
        whenNotPaused 
        validateTerritoryClaim(zoneId, vendorId) 
        returns (bool success) 
    {
        TerritoryClaim storage claim = _territoryClaims[zoneId];
        require(claim.commitTime > 0, "No claim exists");
        require(!claim.revealed, "Claim already revealed");
        require(block.timestamp >= claim.commitTime + COMMIT_REVEAL_DELAY, "Reveal too early");
        require(keccak256(bytes(claim.vendorId)) == keccak256(bytes(vendorId)), "Vendor ID mismatch");
        
        // Verificar el commit hash
        bytes32 revealedHash = keccak256(abi.encodePacked(vendorId, claimAmount, nonce));
        require(revealedHash == claim.commitHash, "Invalid reveal");
        
        claim.revealed = true;
        claim.claimAmount = claimAmount;
        
        // Actualizar territorio
        _territories[zoneId] = Territory({
            zoneId: zoneId,
            dominantVendorId: vendorId,
            totalVotes: claimAmount,
            lastUpdateTime: block.timestamp
        });
        
        emit TerritoryClaimRevealed(zoneId, vendorId, claimAmount);
        return true;
    }

    // ============ SLIPPAGE PROTECTION FUNCTIONS ============

    /// @dev Quema tokens con protección de slippage
    function burnTokensWithSlippageProtection(
        address user, 
        uint256 amount, 
        uint256 minAmount
    ) 
        external 
        onlyOwner 
        nonReentrant 
        whenNotPaused 
        validateSlippage(amount, minAmount)
        checkBurnInterval(user)
        returns (bool success) 
    {
        require(user != address(0), "Invalid user address");
        require(amount > 0, "Amount must be positive");
        
        // Verificar balance y allowance
        uint256 balance = battleToken.balanceOf(user);
        uint256 allowance = battleToken.allowance(user, address(this));
        
        require(balance >= amount, "Insufficient balance");
        require(allowance >= amount, "Insufficient allowance");
        
        // Transferir y quemar tokens
        bool transferSuccess = battleToken.transferFrom(user, address(this), amount);
        require(transferSuccess, "Token transfer failed");
        
        bool burnSuccess = battleToken.transfer(address(0), amount);
        require(burnSuccess, "Token burn failed");
        
        // Actualizar contadores
        _totalTokensBurned += amount;
        _lastTokenBurnTime[user] = block.timestamp;
        
        // Calcular y registrar slippage
        uint256 slippagePercentage = 0;
        if (minAmount > 0) {
            slippagePercentage = ((amount - minAmount) * 100) / minAmount;
            _userBurnSlippage[user] = slippagePercentage;
        }
        
        // Emitir evento con información de slippage
        emit TokensBurnedWithSlippage(user, amount, minAmount, slippagePercentage);
        
        // Si el slippage es alto, emitir evento de advertencia
        if (slippagePercentage > MAX_SLIPPAGE_PERCENTAGE) {
            emit HighSlippageDetected(user, minAmount, amount, slippagePercentage);
        }
        
        return true;
    }

    /// @dev Mina un NFT de logro para un usuario
    function mintAchievementNFT(
        address user,
        string calldata achievementType,
        string calldata metadata,
        uint256 cost
    )
        external
        onlyOwner
        nonReentrant
        whenNotPaused
        checkSufficientBalance(user)
        checkGenericRateLimits(user)
        validateMetadata(metadata)
        returns (uint256 tokenId)
    {
        require(bytes(achievementType).length > 0, "Achievement type cannot be empty");
        _validateCost(cost);

        // Burn tokens from user
        bool burnSuccess = _burnTokens(user, cost);
        require(burnSuccess, "Token burn failed");

        // Actualizar contadores de operaciones genéricas
        _updateGenericOperationCounters(user);

        // Generate unique token ID using counter
        tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        // Emit event for NFT minting
        emit AchievementNFTMinted(user, tokenId, achievementType, metadata);

        return tokenId;
    }

    /// @dev Compra personalización de perfil
    function purchaseProfileCustomization(
        address user,
        string calldata customizationType,
        uint256 cost
    )
        external
        onlyOwner
        nonReentrant
        whenNotPaused
        checkSufficientBalance(user)
        checkGenericRateLimits(user)
        returns (bool success)
    {
        require(bytes(customizationType).length > 0, "Customization type cannot be empty");
        _validateCost(cost);

        // Burn tokens from user
        bool burnSuccess = _burnTokens(user, cost);
        require(burnSuccess, "Token burn failed");

        // Actualizar contadores de operaciones genéricas
        _updateGenericOperationCounters(user);

        // Emit event for profile customization
        emit ProfileCustomizationPurchased(user, customizationType, cost);

        return true;
    }
    
    /**
     * @dev Quema tokens del usuario
     * @param user Dirección del usuario
     * @param amount Cantidad de tokens a quemar
     * @return success True si la quema fue exitosa
     */
    function burnTokens(
        address user,
        uint256 amount
    ) 
        external 
        override 
        onlyOwner 
        nonReentrant 
        whenNotPaused
        returns (bool success)
    {
        require(user != address(0), "Invalid user address");
        require(amount > 0, "Invalid amount");
        require(
            battleToken.balanceOf(user) >= amount,
            "Insufficient balance for burn"
        );
        
        return _burnTokens(user, amount);
    }
    
    /**
     * @dev Reembolsa tokens al usuario (solo en caso de fallo del sistema)
     * @param user Dirección del usuario
     * @param amount Cantidad de tokens a reembolsar
     * @param reason Razón del reembolso
     * @return success True si el reembolso fue exitoso
     */
    function refundTokens(
        address user,
        uint256 amount,
        string calldata reason
    ) 
        external 
        override 
        onlyOwner 
        nonReentrant 
        whenNotPaused
        returns (bool success)
    {
        require(user != address(0), "Invalid user address");
        require(amount > 0, "Invalid amount");
        require(bytes(reason).length > 0, "Empty reason");
        
        // Transferir tokens del contrato al usuario
        battleToken.safeTransfer(user, amount);
        
        emit TokensRefunded(user, amount, reason, block.timestamp);
        
        return true;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    
    
    /**
     * @dev Obtiene el total de tokens quemados por registros de vendor
     * @return Total de tokens quemados
     */
    function getTotalTokensBurned() external view override returns (uint256) {
        return _totalTokensBurned;
    }
    
    /**
     * @dev Obtiene el número total de vendors registrados
     * @return Total de vendors
     */
    function getTotalVendorsRegistered() external view override returns (uint256) {
        return _totalVendorsRegistered;
    }
    
    /**
     * @dev Obtiene información de un vendor por su ID
     * @param vendorId ID del vendor
     * @return user Dirección del usuario que lo registró
     * @return amount Cantidad de tokens quemados
     * @return timestamp Timestamp del registro
     * @return exists True si el vendor existe
     */
    function getVendorInfo(string calldata vendorId) external view override returns (
        address user,
        uint256 amount,
        uint256 timestamp,
        bool exists
    ) {
        VendorInfo memory vendor = _vendors[vendorId];
        return (vendor.user, vendor.amount, vendor.timestamp, _vendorExists[vendorId]);
    }
    
    /**
     * @dev Obtiene el contador diario de vendors de un usuario
     * @param user Dirección del usuario
     * @param day Día específico (timestamp del inicio del día)
     * @return Número de vendors registrados en ese día
     */
    function getDailyVendorCount(address user, uint256 day) external view returns (uint256) {
        return _dailyVendorCount[user][day];
    }
    
    /**
     * @dev Obtiene el contador semanal de vendors de un usuario
     * @param user Dirección del usuario
     * @param week Semana específica (timestamp del inicio de la semana)
     * @return Número de vendors registrados en esa semana
     */
    function getWeeklyVendorCount(address user, uint256 week) external view returns (uint256) {
        return _weeklyVendorCount[user][week];
    }
    
    /**
     * @dev Obtiene el timestamp del último registro de un usuario
     * @param user Dirección del usuario
     * @return Timestamp del último registro
     */
    function getLastRegistrationTime(address user) external view returns (uint256) {
        return _lastRegistrationTime[user];
    }
    
    
    /**
     * @dev Obtiene el día actual (inicio del día)
     * @return Timestamp del inicio del día actual
     */
    function getCurrentDay() external view returns (uint256) {
        return _getCurrentDay();
    }
    
    /**
     * @dev Obtiene la semana actual (inicio de la semana)
     * @return Timestamp del inicio de la semana actual
     */
    function getCurrentWeek() external view returns (uint256) {
        return _getCurrentWeek();
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Función interna para quemar tokens
     * @param user Dirección del usuario
     * @param amount Cantidad de tokens a quemar
     * @return success True si la quema fue exitosa
     */
    function _burnTokens(address user, uint256 amount) internal returns (bool success) {
        try battleToken.transferFrom(user, address(this), amount) {
            // Quemar tokens enviándolos a address(0)
            battleToken.safeTransfer(address(0), amount);
            
            _totalTokensBurned += amount;
            
            emit TokensBurned(user, amount, block.timestamp);
            
            return true;
        } catch {
            return false;
        }
    }
    
    /**
     * @dev Función interna para registrar un vendor
     * @param user Dirección del usuario
     * @param amount Cantidad de tokens quemados
     * @param vendorData Datos del vendor
     * @param vendorId ID del vendor
     */
    function _registerVendor(
        address user,
        uint256 amount,
        string calldata vendorData,
        string calldata vendorId,
        string calldata zoneId
    ) internal {
        _vendors[vendorId] = VendorInfo({
            user: user,
            amount: amount,
            timestamp: block.timestamp,
            vendorData: vendorData,
            zoneId: zoneId,
            isVerified: false,
            verifier: address(0),
            verificationTime: 0,
            totalVotes: 0,
            territoryScore: 0
        });
        
        _vendorExists[vendorId] = true;
        _totalVendorsRegistered++;
    }
    
    /**
     * @dev Función interna para actualizar contadores y timestamps
     * @param user Dirección del usuario
     */
    function _updateCounters(address user) internal {
        uint256 currentDay = _getCurrentDay();
        uint256 currentWeek = _getCurrentWeek();
        
        _dailyVendorCount[user][currentDay]++;
        _weeklyVendorCount[user][currentWeek]++;
        _lastRegistrationTime[user] = block.timestamp;
    }
    
    /**
     * @dev Función interna para obtener el día actual
     * @return Timestamp del inicio del día actual
     */
    function _getCurrentDay() internal view returns (uint256) {
        return block.timestamp - (block.timestamp % 1 days);
    }
    
    /**
     * @dev Función interna para obtener la semana actual
     * @return Timestamp del inicio de la semana actual
     */
    function _getCurrentWeek() internal view returns (uint256) {
        return block.timestamp - (block.timestamp % 7 days);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Pausa el contrato (solo owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Despausa el contrato (solo owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Función de emergencia para retirar tokens del contrato (solo owner)
     * @param token Dirección del token a retirar
     * @param amount Cantidad a retirar
     * @param to Dirección de destino
     */
    function emergencyWithdraw(
        address token,
        uint256 amount,
        address to
    ) external onlyOwner {
        require(to != address(0), "Invalid destination address");
        require(amount > 0, "Invalid amount");
        
        IERC20(token).safeTransfer(to, amount);
    }
    
    /**
     * @dev Función de emergencia para retirar ETH del contrato (solo owner)
     * @param to Dirección de destino
     * @param amount Cantidad a retirar
     */
    function emergencyWithdrawETH(
        address to,
        uint256 amount
    ) external onlyOwner {
        require(to != address(0), "Invalid destination address");
        require(amount > 0, "Invalid amount");
        require(amount <= address(this).balance, "Insufficient balance");
        
        (bool success, ) = to.call{value: amount}("");
        require(success, "ETH transfer failed");
    }
}
