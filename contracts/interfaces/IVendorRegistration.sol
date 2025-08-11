// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IVendorRegistration
 * @dev Interfaz para el sistema de registro de vendors con cobro de tokens
 */
interface IVendorRegistration {
    
    /**
     * @dev Evento emitido cuando se registra un vendor exitosamente
     * @param user Dirección del usuario que registró el vendor
     * @param amount Cantidad de tokens quemados
     * @param vendorId ID único del vendor registrado
     * @param timestamp Timestamp del registro
     */
    event VendorRegistered(
        address indexed user,
        uint256 amount,
        string vendorId,
        uint256 timestamp
    );
    
    /**
     * @dev Evento emitido cuando se queman tokens
     * @param user Dirección del usuario
     * @param amount Cantidad de tokens quemados
     * @param timestamp Timestamp de la quema
     */
    event TokensBurned(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );
    
    /**
     * @dev Evento emitido cuando se reembolsan tokens (en caso de fallo)
     * @param user Dirección del usuario
     * @param amount Cantidad de tokens reembolsados
     * @param reason Razón del reembolso
     * @param timestamp Timestamp del reembolso
     */
    event TokensRefunded(
        address indexed user,
        uint256 amount,
        string reason,
        uint256 timestamp
    );
    
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
    ) external returns (bool success);
    
    /**
     * @dev Quema tokens del usuario
     * @param user Dirección del usuario
     * @param amount Cantidad de tokens a quemar
     * @return success True si la quema fue exitosa
     */
    function burnTokens(
        address user,
        uint256 amount
    ) external returns (bool success);
    
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
    ) external returns (bool success);
    
    /**
     * @dev Obtiene el costo de registro de vendor
     * @return Costo en tokens $BATTLE
     */
    function getVendorRegistrationCost() external view returns (uint256);
    
    /**
     * @dev Verifica si un usuario tiene saldo suficiente para registrar un vendor
     * @param user Dirección del usuario
     * @return True si tiene saldo suficiente
     */
    function hasSufficientBalance(address user) external view returns (bool);
    
    /**
     * @dev Obtiene el total de tokens quemados por registros de vendor
     * @return Total de tokens quemados
     */
    function getTotalTokensBurned() external view returns (uint256);
    
    /**
     * @dev Obtiene el número total de vendors registrados
     * @return Total de vendors
     */
    function getTotalVendorsRegistered() external view returns (uint256);
    
    /**
     * @dev Obtiene información de un vendor por su ID
     * @param vendorId ID del vendor
     * @return user Dirección del usuario que lo registró
     * @return amount Cantidad de tokens quemados
     * @return timestamp Timestamp del registro
     * @return exists True si el vendor existe
     */
    function getVendorInfo(string calldata vendorId) external view returns (
        address user,
        uint256 amount,
        uint256 timestamp,
        bool exists
    );
}
