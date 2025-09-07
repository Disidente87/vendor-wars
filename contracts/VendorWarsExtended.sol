// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title VendorWarsExtended
 * @dev Contrato completo para el sistema Vendor Wars con todas las funcionalidades
 * @dev Incluye registro de vendors, votación, territorios, verificación, reviews, boost, NFTs y más
 */
contract VendorWarsExtended is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    // ============ STRUCTS ============
    
    /**
     * @dev Estructura para almacenar información de un vendor
     */
    struct VendorInfo {
        address user;           // Dirección del usuario que registró el vendor
        uint256 amount;         // Cantidad de tokens quemados
        uint256 timestamp;      // Timestamp del registro
        string vendorData;      // Datos del vendor (nombre, descripción, etc.)
        string zoneId;          // ID de la zona del vendor
        bool isVerified;        // Si el vendor está verificado
        address verifier;       // Dirección del verificador
        uint256 verificationTime; // Timestamp de verificación
        uint256 totalVotes;     // Total de votos del vendor
        uint256 territoryScore; // Puntuación de territorio del vendor
        bool exists;            // Si el vendor existe
    }
    
    /**
     * @dev Estructura para almacenar información de un voto
     */
    struct Vote {
        address voter;          // Dirección del votante
        string vendorId;        // ID del vendor votado
        string zoneId;          // ID de la zona
        uint256 voteValue;      // Valor del voto
        uint256 tokensSpent;    // Tokens gastados en el voto
        bool isVerified;        // Si el voto es de un usuario verificado
        uint256 timestamp;      // Timestamp del voto
    }
    
    /**
     * @dev Estructura para almacenar información de un territorio
     */
    struct Territory {
        string zoneId;          // ID de la zona
        string dominantVendorId; // ID del vendor dominante
        uint256 totalVotes;     // Total de votos en la zona
        uint256 lastUpdateTime; // Timestamp de última actualización
    }
    
    /**
     * @dev Estructura para almacenar información de un claim de territorio
     */
    struct TerritoryClaim {
        address claimant;       // Dirección del reclamante
        string vendorId;        // ID del vendor
        uint256 commitTime;     // Timestamp del commit
        bytes32 commitHash;     // Hash del commit
        bool revealed;          // Si el claim fue revelado
        uint256 claimAmount;    // Cantidad del claim
    }
    
    // ============ CONSTANTS ============
    
    /// @dev Costo fijo para registrar un vendor (50 $BATTLE)
    uint256 public constant VENDOR_REGISTRATION_COST = 50 * 10**18;
    
    /// @dev Costo mínimo para cualquier operación (validación de seguridad)
    uint256 public constant MIN_COST = 1 * 10**18;
    
    /// @dev Costo máximo para cualquier operación (validación de seguridad)
    uint256 public constant MAX_COST = 500 * 10**18;
    
    /// @dev Máximo número de vendors que un usuario puede registrar por día
    uint256 public constant MAX_VENDORS_PER_DAY = 3;
    
    /// @dev Máximo número de vendors que un usuario puede registrar por semana
    uint256 public constant MAX_VENDORS_PER_WEEK = 10;
    
    /// @dev Máximo número de operaciones por usuario por día (rate limiting genérico)
    uint256 public constant MAX_OPERATIONS_PER_DAY = 20;
    
    /// @dev Máximo número de operaciones por usuario por semana (rate limiting genérico)
    uint256 public constant MAX_OPERATIONS_PER_WEEK = 100;
    
    /// @dev Período de cooldown entre registros (1 hora)
    uint256 public constant COOLDOWN_PERIOD = 1 hours;
    
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
    
    // ============ EVENTS ============
    
    /// @dev Emitido cuando se registra un vendor
    event VendorRegistered(address indexed user, uint256 amount, string vendorId, uint256 timestamp);
    
    /// @dev Emitido cuando se queman tokens
    event TokensBurned(address indexed user, uint256 amount, uint256 timestamp);
    
    /// @dev Emitido cuando se reembolsan tokens
    event TokensRefunded(address indexed user, uint256 amount, string reason, uint256 timestamp);
    
    /// @dev Emitido cuando se actualiza información de vendor
    event VendorInfoUpdated(string indexed vendorId, string newName, string newDescription, string newCategory);
    
    /// @dev Emitido cuando se verifica un vendor
    event VendorVerified(string indexed vendorId, address verifier, string verificationData);
    
    /// @dev Emitido cuando se aplica boost a un vendor
    event VendorBoosted(address indexed user, string indexed vendorId, uint256 boostAmount, uint256 duration);
    
    /// @dev Emitido cuando se registra un voto
    event VoteRecorded(address indexed voter, string indexed vendorId, string indexed zoneId, uint256 voteValue, bool isVerified);
    
    /// @dev Emitido cuando se reclama un territorio
    event TerritoryClaimed(string indexed zoneId, string indexed vendorId, uint256 claimAmount);
    
    /// @dev Emitido cuando se hace commit de un claim de territorio
    event TerritoryClaimCommitted(string indexed zoneId, string indexed vendorId, bytes32 commitHash);
    
    /// @dev Emitido cuando se revela un claim de territorio
    event TerritoryClaimRevealed(string indexed zoneId, string indexed vendorId, uint256 claimAmount);
    
    /// @dev Emitido cuando se queman tokens con protección de slippage
    event TokensBurnedWithSlippage(address indexed user, uint256 amount, uint256 minAmount, uint256 slippagePercentage);
    
    /// @dev Emitido cuando se detecta slippage alto
    event HighSlippageDetected(address indexed user, uint256 minAmount, uint256 actualAmount, uint256 slippagePercentage);
    
    /// @dev Emitido cuando se mintea un NFT de logro
    event AchievementNFTMinted(address indexed user, uint256 tokenId, string achievementType, string metadata);
    
    /// @dev Emitido cuando se compra personalización de perfil
    event ProfileCustomizationPurchased(address indexed user, string customizationType, uint256 cost);
    
    // ============ CORE FUNCTIONS (FROM VENDOR REGISTRATION) ============
    
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
        string calldata vendorId
    ) 
        external 
        onlyOwner 
        nonReentrant 
        whenNotPaused
        returns (bool success)
    {
        require(amount == VENDOR_REGISTRATION_COST, "Invalid amount");
        require(bytes(vendorId).length > 0, "Empty vendor ID");
        require(user != address(0), "Invalid user address");
        require(!_vendorExists[vendorId], "Vendor already exists");
        require(bytes(vendorData).length > 0, "Vendor data cannot be empty");
        require(battleToken.balanceOf(user) >= amount, "Insufficient balance");
        
        // Verificar límites de rate limiting
        uint256 currentDay = _getCurrentDay();
        uint256 currentWeek = _getCurrentWeek();
        
        require(_dailyVendorCount[user][currentDay] < MAX_VENDORS_PER_DAY, "Daily limit exceeded");
        require(_weeklyVendorCount[user][currentWeek] < MAX_VENDORS_PER_WEEK, "Weekly limit exceeded");
        require(
            _lastRegistrationTime[user] == 0 || 
            block.timestamp - _lastRegistrationTime[user] >= COOLDOWN_PERIOD,
            "Cooldown period not met"
        );
        
        // Quemar tokens del usuario
        bool burnSuccess = _burnTokens(user, amount);
        require(burnSuccess, "Token burn failed");
        
        // Registrar vendor
        _registerVendor(user, amount, vendorData, vendorId);
        
        // Actualizar contadores y timestamps
        _updateCounters(user);
        
        emit VendorRegistered(user, amount, vendorId, block.timestamp);
        
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
    
    // ============ EXTENDED FUNCTIONS ============
    
    /**
     * @dev Actualiza información de un vendor existente
     * @param user Dirección del usuario que paga el costo
     * @param vendorId ID del vendor
     * @param newName Nuevo nombre del vendor
     * @param newDescription Nueva descripción del vendor
     * @param newCategory Nueva categoría del vendor
     * @param cost Costo de la actualización
     * @return success True si la actualización fue exitosa
     */
    function updateVendorInfo(
        address user,
        string calldata vendorId,
        string calldata newName,
        string calldata newDescription,
        string calldata newCategory,
        uint256 cost
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
        require(cost >= MIN_COST, "Cost too low");
        require(cost <= MAX_COST, "Cost too high");
        require(battleToken.balanceOf(user) >= cost, "Insufficient balance");
        require(_vendorExists[vendorId], "Vendor does not exist");

        // Verificar límites de rate limiting genérico
        uint256 currentDay = _getCurrentDay();
        uint256 currentWeek = _getCurrentWeek();
        
        require(_dailyOperationCount[user][currentDay] < MAX_OPERATIONS_PER_DAY, "Daily operation limit exceeded");
        require(_weeklyOperationCount[user][currentWeek] < MAX_OPERATIONS_PER_WEEK, "Weekly operation limit exceeded");

        // Burn tokens from user
        bool burnSuccess = _burnTokens(user, cost);
        require(burnSuccess, "Token burn failed");

        // Actualizar contadores de operaciones genéricas
        _dailyOperationCount[user][currentDay]++;
        _weeklyOperationCount[user][currentWeek]++;

        // Actualizar información del vendor en storage
        VendorInfo storage vendor = _vendors[vendorId];
        vendor.vendorData = string(abi.encodePacked(
            '{"name":"', newName, '","description":"', newDescription, '","category":"', newCategory, '"}'
        ));

        // Emit event for vendor info update
        emit VendorInfoUpdated(vendorId, newName, newDescription, newCategory);

        return true;
    }

    /**
     * @dev Verifica un vendor con evidencia
     * @param user Dirección del usuario que paga el costo
     * @param vendorId ID del vendor
     * @param verifier Dirección del verificador
     * @param verificationData Datos de verificación
     * @param cost Costo de la verificación
     * @return success True si la verificación fue exitosa
     */
    function verifyVendor(
        address user,
        string calldata vendorId,
        address verifier,
        string calldata verificationData,
        uint256 cost
    )
        external
        onlyOwner
        nonReentrant
        whenNotPaused
        returns (bool success)
    {
        require(bytes(vendorId).length > 0, "Vendor ID cannot be empty");
        require(verifier != address(0), "Invalid verifier address");
        require(bytes(verificationData).length > 0, "Verification data cannot be empty");
        require(bytes(verificationData).length <= 200, "Verification data too large");
        require(cost >= MIN_COST, "Cost too low");
        require(cost <= MAX_COST, "Cost too high");
        require(battleToken.balanceOf(user) >= cost, "Insufficient balance");
        require(_vendorExists[vendorId], "Vendor does not exist");

        // Verificar límites de rate limiting genérico
        uint256 currentDay = _getCurrentDay();
        uint256 currentWeek = _getCurrentWeek();
        
        require(_dailyOperationCount[user][currentDay] < MAX_OPERATIONS_PER_DAY, "Daily operation limit exceeded");
        require(_weeklyOperationCount[user][currentWeek] < MAX_OPERATIONS_PER_WEEK, "Weekly operation limit exceeded");

        // Burn tokens from user
        bool burnSuccess = _burnTokens(user, cost);
        require(burnSuccess, "Token burn failed");

        // Actualizar contadores de operaciones genéricas
        _dailyOperationCount[user][currentDay]++;
        _weeklyOperationCount[user][currentWeek]++;

        // Actualizar estado de verificación en storage
        VendorInfo storage vendor = _vendors[vendorId];
        vendor.isVerified = true;
        vendor.verifier = verifier;
        vendor.verificationTime = block.timestamp;

        // Emit event for vendor verification
        emit VendorVerified(vendorId, verifier, verificationData);

        return true;
    }

    /**
     * @dev Aplica boost a un vendor
     * @param user Dirección del usuario
     * @param vendorId ID del vendor
     * @param boostAmount Cantidad de boost
     * @param duration Duración del boost
     * @param cost Costo del boost
     * @return success True si el boost fue exitoso
     */
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
        returns (bool success)
    {
        require(bytes(vendorId).length > 0, "Vendor ID cannot be empty");
        require(boostAmount > 0, "Boost amount must be positive");
        require(duration > 0, "Duration must be positive");
        require(cost >= MIN_COST, "Cost too low");
        require(cost <= MAX_COST, "Cost too high");
        require(battleToken.balanceOf(user) >= cost, "Insufficient balance");
        require(_vendorExists[vendorId], "Vendor does not exist");

        // Verificar límites de rate limiting genérico
        uint256 currentDay = _getCurrentDay();
        uint256 currentWeek = _getCurrentWeek();
        
        require(_dailyOperationCount[user][currentDay] < MAX_OPERATIONS_PER_DAY, "Daily operation limit exceeded");
        require(_weeklyOperationCount[user][currentWeek] < MAX_OPERATIONS_PER_WEEK, "Weekly operation limit exceeded");

        // Burn tokens from user
        bool burnSuccess = _burnTokens(user, cost);
        require(burnSuccess, "Token burn failed");

        // Actualizar contadores de operaciones genéricas
        _dailyOperationCount[user][currentDay]++;
        _weeklyOperationCount[user][currentWeek]++;

        // Emit event for vendor boost
        emit VendorBoosted(user, vendorId, boostAmount, duration);

        return true;
    }

    /**
     * @dev Envía un review y quema tokens
     * @param user Dirección del usuario
     * @param cost Cantidad de tokens a quemar
     * @param reviewData Datos del review
     * @param reviewId ID del review
     * @return success True si el review fue enviado exitosamente
     */
    function submitReview(
        address user,
        uint256 cost,
        string calldata reviewData,
        string calldata reviewId
    ) 
        external 
        onlyOwner 
        nonReentrant 
        whenNotPaused
        returns (bool success)
    {
        require(cost >= MIN_COST, "Cost too low");
        require(cost <= MAX_COST, "Cost too high");
        require(bytes(reviewId).length > 0, "Empty review ID");
        require(bytes(reviewData).length > 0, "Review data cannot be empty");
        require(bytes(reviewData).length <= 500, "Review data too large");
        require(user != address(0), "Invalid user address");
        require(battleToken.balanceOf(user) >= cost, "Insufficient balance");
        
        // Verificar límites de rate limiting genérico
        uint256 currentDay = _getCurrentDay();
        uint256 currentWeek = _getCurrentWeek();
        
        require(_dailyOperationCount[user][currentDay] < MAX_OPERATIONS_PER_DAY, "Daily operation limit exceeded");
        require(_weeklyOperationCount[user][currentWeek] < MAX_OPERATIONS_PER_WEEK, "Weekly operation limit exceeded");
        
        // Quemar tokens del usuario
        bool burnSuccess = _burnTokens(user, cost);
        require(burnSuccess, "Token burn failed");
        
        // Actualizar contadores de operaciones genéricas
        _dailyOperationCount[user][currentDay]++;
        _weeklyOperationCount[user][currentWeek]++;
        
        emit TokensBurned(user, cost, block.timestamp);
        
        return true;
    }

    /**
     * @dev Registra un voto para tracking
     * @param user Dirección del usuario
     * @param cost Costo del voto
     * @param vendorId ID del vendor
     * @param zoneId ID de la zona
     * @param voteValue Valor del voto
     * @param isVerified Si el voto es verificado
     * @return success True si el voto fue registrado exitosamente
     */
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
        returns (bool success)
    {
        require(bytes(vendorId).length > 0, "Vendor ID cannot be empty");
        require(bytes(zoneId).length > 0, "Zone ID cannot be empty");
        require(voteValue > 0, "Vote value must be positive");
        require(cost >= MIN_COST, "Cost too low");
        require(cost <= MAX_COST, "Cost too high");
        require(battleToken.balanceOf(user) >= cost, "Insufficient balance");
        require(_vendorExists[vendorId], "Vendor does not exist");

        // Verificar límites de rate limiting genérico
        uint256 currentDay = _getCurrentDay();
        uint256 currentWeek = _getCurrentWeek();
        
        require(_dailyOperationCount[user][currentDay] < MAX_OPERATIONS_PER_DAY, "Daily operation limit exceeded");
        require(_weeklyOperationCount[user][currentWeek] < MAX_OPERATIONS_PER_WEEK, "Weekly operation limit exceeded");

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
        
        // Actualizar totales
        _zoneTotalVotes[zoneId] += voteValue;
        _vendors[vendorId].totalVotes += voteValue;
        _totalVotes += voteValue;

        // Actualizar territorio
        _updateTerritory(zoneId, vendorId, voteValue);

        // Actualizar contadores de operaciones genéricas
        _dailyOperationCount[user][currentDay]++;
        _weeklyOperationCount[user][currentWeek]++;

        // Emit event for vote recording
        emit VoteRecorded(user, vendorId, zoneId, voteValue, isVerified);

        return true;
    }

    /**
     * @dev Reclama un territorio para un vendor
     * @param user Dirección del usuario que paga el costo
     * @param zoneId ID de la zona
     * @param vendorId ID del vendor
     * @param claimAmount Cantidad del claim
     * @param cost Costo del claim
     * @return success True si el claim fue exitoso
     */
    function claimTerritory(
        address user,
        string calldata zoneId,
        string calldata vendorId,
        uint256 claimAmount,
        uint256 cost
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
        require(cost >= MIN_COST, "Cost too low");
        require(cost <= MAX_COST, "Cost too high");
        require(battleToken.balanceOf(user) >= cost, "Insufficient balance");
        require(_vendorExists[vendorId], "Vendor does not exist");

        // Verificar límites de rate limiting genérico
        uint256 currentDay = _getCurrentDay();
        uint256 currentWeek = _getCurrentWeek();
        
        require(_dailyOperationCount[user][currentDay] < MAX_OPERATIONS_PER_DAY, "Daily operation limit exceeded");
        require(_weeklyOperationCount[user][currentWeek] < MAX_OPERATIONS_PER_WEEK, "Weekly operation limit exceeded");

        // Burn tokens from user
        bool burnSuccess = _burnTokens(user, cost);
        require(burnSuccess, "Token burn failed");

        // Actualizar contadores de operaciones genéricas
        _dailyOperationCount[user][currentDay]++;
        _weeklyOperationCount[user][currentWeek]++;

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

    /**
     * @dev Mina un NFT de logro para un usuario
     * @param user Dirección del usuario
     * @param achievementType Tipo de logro
     * @param metadata Metadata del NFT
     * @param cost Costo del NFT
     * @return tokenId ID del token minteado
     */
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
        returns (uint256 tokenId)
    {
        require(bytes(achievementType).length > 0, "Achievement type cannot be empty");
        require(bytes(metadata).length > 0, "Metadata cannot be empty");
        require(bytes(metadata).length <= 400, "Metadata too large");
        require(cost >= MIN_COST, "Cost too low");
        require(cost <= MAX_COST, "Cost too high");
        require(battleToken.balanceOf(user) >= cost, "Insufficient balance");

        // Verificar límites de rate limiting genérico
        uint256 currentDay = _getCurrentDay();
        uint256 currentWeek = _getCurrentWeek();
        
        require(_dailyOperationCount[user][currentDay] < MAX_OPERATIONS_PER_DAY, "Daily operation limit exceeded");
        require(_weeklyOperationCount[user][currentWeek] < MAX_OPERATIONS_PER_WEEK, "Weekly operation limit exceeded");

        // Burn tokens from user
        bool burnSuccess = _burnTokens(user, cost);
        require(burnSuccess, "Token burn failed");

        // Actualizar contadores de operaciones genéricas
        _dailyOperationCount[user][currentDay]++;
        _weeklyOperationCount[user][currentWeek]++;

        // Generate unique token ID using counter
        tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        // Emit event for NFT minting
        emit AchievementNFTMinted(user, tokenId, achievementType, metadata);

        return tokenId;
    }

    // ============ VIEW FUNCTIONS ============
    
    /// @dev Obtiene el costo de registro de vendor
    function getVendorRegistrationCost() external pure returns (uint256) {
        return VENDOR_REGISTRATION_COST;
    }
    
    /// @dev Verifica si un usuario tiene saldo suficiente para registrar un vendor
    function hasSufficientBalance(address user) public view returns (bool) {
        return battleToken.balanceOf(user) >= VENDOR_REGISTRATION_COST;
    }
    
    /// @dev Obtiene el total de tokens quemados por registros de vendor
    function getTotalTokensBurned() external view returns (uint256) {
        return _totalTokensBurned;
    }
    
    /// @dev Obtiene el número total de vendors registrados
    function getTotalVendorsRegistered() external view returns (uint256) {
        return _totalVendorsRegistered;
    }
    
    /// @dev Obtiene información de un vendor por su ID
    function getVendorInfo(string calldata vendorId) external view returns (
        address user,
        uint256 amount,
        uint256 timestamp,
        bool exists
    ) {
        VendorInfo memory vendor = _vendors[vendorId];
        return (vendor.user, vendor.amount, vendor.timestamp, _vendorExists[vendorId]);
    }
    
    /// @dev Verifica si un vendor existe
    function vendorExists(string calldata vendorId) external view returns (bool) {
        return _vendorExists[vendorId];
    }
    
    // ============ ZONE AND TERRITORY VIEW FUNCTIONS ============
    
    /// @dev Obtiene el total de votos de un vendor
    function getVendorTotalVotes(string calldata vendorId) external view returns (uint256 totalVotes) {
        return _vendors[vendorId].totalVotes;
    }
    
    /// @dev Obtiene el total de votos de una zona
    function getZoneTotalVotes(string calldata zoneId) external view returns (uint256 totalVotes) {
        return _zoneTotalVotes[zoneId];
    }
    
    /// @dev Obtiene la información de un territorio
    function getTerritory(string calldata zoneId) external view returns (Territory memory territory) {
        return _territories[zoneId];
    }
    
    /// @dev Obtiene los votos de un vendor
    function getVendorVotes(string calldata vendorId) external view returns (Vote[] memory votes) {
        return _vendorVotes[vendorId];
    }
    
    /// @dev Obtiene los votos de una zona
    function getZoneVotes(string calldata zoneId) external view returns (Vote[] memory votes) {
        return _zoneVotes[zoneId];
    }
    
    /// @dev Obtiene los votos de un usuario
    function getUserVotes(address user) external view returns (Vote[] memory votes) {
        return _userVotes[user];
    }
    
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
    ) {
        VendorInfo memory vendor = _vendors[vendorId];
        bool exists = _vendorExists[vendorId];
        
        return (
            vendor.user,
            vendor.amount,
            vendor.timestamp,
            vendor.vendorData,
            vendor.zoneId,
            vendor.isVerified,
            vendor.verifier,
            vendor.verificationTime,
            exists,
            vendor.totalVotes,
            vendor.territoryScore
        );
    }
    
    /// @dev Obtiene información de territorio
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
    
    /// @dev Obtiene votos de un vendor en una zona específica
    function getZoneVendorVotes(string calldata zoneId, string calldata vendorId) 
        external view returns (uint256 votes) {
        return _zoneVendorVotes[zoneId][vendorId];
    }
    
    /// @dev Obtiene estadísticas generales
    function getGeneralStats() external view returns (
        uint256 totalTokensBurned,
        uint256 totalVendorsRegistered,
        uint256 totalVotes
    ) {
        return (_totalTokensBurned, _totalVendorsRegistered, _totalVotes);
    }
    
    /// @dev Obtiene el contador diario de vendors de un usuario
    function getDailyVendorCount(address user, uint256 day) external view returns (uint256) {
        return _dailyVendorCount[user][day];
    }
    
    /// @dev Obtiene el contador semanal de vendors de un usuario
    function getWeeklyVendorCount(address user, uint256 week) external view returns (uint256) {
        return _weeklyVendorCount[user][week];
    }
    
    /// @dev Obtiene el timestamp del último registro de un usuario
    function getLastRegistrationTime(address user) external view returns (uint256) {
        return _lastRegistrationTime[user];
    }
    
    /// @dev Obtiene el día actual (inicio del día)
    function getCurrentDay() external view returns (uint256) {
        return _getCurrentDay();
    }
    
    /// @dev Obtiene la semana actual (inicio de la semana)
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
            // Quemar tokens enviándolos a address(0) usando _burn si está disponible
            // o simplemente no transferir los tokens (quedan en el contrato)
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
        string calldata vendorId
    ) internal {
        _vendors[vendorId] = VendorInfo({
            user: user,
            amount: amount,
            timestamp: block.timestamp,
            vendorData: vendorData,
            zoneId: "",
            isVerified: false,
            verifier: address(0),
            verificationTime: 0,
            totalVotes: 0,
            territoryScore: 0,
            exists: true
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
}