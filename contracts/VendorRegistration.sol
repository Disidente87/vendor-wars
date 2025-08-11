// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IVendorRegistration.sol";

/**
 * @title VendorRegistration
 * @dev Smart contract para el sistema de registro de vendors con cobro de tokens
 * @dev Los tokens se queman (destruyen) al registrar un vendor
 * @dev Solo el owner (backend) puede ejecutar operaciones
 */
contract VendorRegistration is IVendorRegistration, Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    // ============ CONSTANTS ============
    
    /// @dev Costo fijo para registrar un vendor (50 $BATTLE)
    uint256 public constant VENDOR_REGISTRATION_COST = 50 * 10**18; // 50 tokens con 18 decimales
    
    /// @dev Máximo número de vendors que un usuario puede registrar por día
    uint256 public constant MAX_VENDORS_PER_DAY = 3;
    
    /// @dev Máximo número de vendors que un usuario puede registrar por semana
    uint256 public constant MAX_VENDORS_PER_WEEK = 10;
    
    /// @dev Período de cooldown entre registros (1 hora)
    uint256 public constant COOLDOWN_PERIOD = 1 hours;
    
    // ============ STATE VARIABLES ============
    
    /// @dev Dirección del token $BATTLE
    IERC20 public immutable battleToken;
    
    /// @dev Total de tokens quemados por registros de vendor
    uint256 private _totalTokensBurned;
    
    /// @dev Total de vendors registrados
    uint256 private _totalVendorsRegistered;
    
    /// @dev Mapping de vendorId a información del vendor
    mapping(string => VendorInfo) private _vendors;
    
    /// @dev Mapping de usuario a contador diario de vendors
    mapping(address => mapping(uint256 => uint256)) private _dailyVendorCount;
    
    /// @dev Mapping de usuario a contador semanal de vendors
    mapping(address => mapping(uint256 => uint256)) private _weeklyVendorCount;
    
    /// @dev Mapping de usuario a timestamp del último registro
    mapping(address => uint256) private _lastRegistrationTime;
    
    /// @dev Mapping de vendorId a si ya existe
    mapping(string => bool) private _vendorExists;
    
    // ============ STRUCTS ============
    
    /**
     * @dev Estructura para almacenar información de un vendor
     */
    struct VendorInfo {
        address user;           // Usuario que registró el vendor
        uint256 amount;         // Cantidad de tokens quemados
        uint256 timestamp;      // Timestamp del registro
        string vendorData;      // Datos del vendor (nombre, descripción, etc.)
        bool exists;            // Si el vendor existe
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
    
    // ============ MODIFIERS ============
    
    /**
     * @dev Modificador para verificar que el usuario tenga saldo suficiente
     */
    modifier checkSufficientBalance(address user) {
        require(
            battleToken.balanceOf(user) >= VENDOR_REGISTRATION_COST,
            "Insufficient balance"
        );
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
     * @dev Modificador para verificar que el vendor no exista
     */
    modifier vendorDoesNotExist(string calldata vendorId) {
        require(!_vendorExists[vendorId], "Vendor already exists");
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
        string calldata vendorId
    ) 
        external 
        override 
        onlyOwner 
        nonReentrant 
        whenNotPaused
        checkSufficientBalance(user)
        checkRateLimits(user)
        vendorDoesNotExist(vendorId)
        returns (bool success)
    {
        require(amount == VENDOR_REGISTRATION_COST, "Invalid amount");
        require(bytes(vendorData).length > 0, "Empty vendor data");
        require(bytes(vendorId).length > 0, "Empty vendor ID");
        require(user != address(0), "Invalid user address");
        
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
     * @dev Obtiene el costo de registro de vendor
     * @return Costo en tokens $BATTLE
     */
    function getVendorRegistrationCost() external view override returns (uint256) {
        return VENDOR_REGISTRATION_COST;
    }
    
    /**
     * @dev Verifica si un usuario tiene saldo suficiente para registrar un vendor
     * @param user Dirección del usuario
     * @return True si tiene saldo suficiente
     */
    function hasSufficientBalance(address user) public view override returns (bool) {
        return battleToken.balanceOf(user) >= VENDOR_REGISTRATION_COST;
    }
    
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
        return (vendor.user, vendor.amount, vendor.timestamp, vendor.exists);
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
     * @dev Verifica si un vendor existe
     * @param vendorId ID del vendor
     * @return True si el vendor existe
     */
    function vendorExists(string calldata vendorId) external view returns (bool) {
        return _vendorExists[vendorId];
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
        string calldata vendorId
    ) internal {
        _vendors[vendorId] = VendorInfo({
            user: user,
            amount: amount,
            timestamp: block.timestamp,
            vendorData: vendorData,
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
