# 🏪 VendorRegistration Smart Contract

## 📋 Descripción

El contrato `VendorRegistration` implementa el sistema de cobro obligatorio de **50 $BATTLE tokens** por cada nuevo vendor registrado en la plataforma Vendor Wars. Los tokens se queman (destruyen) una vez confirmada la transacción exitosa.

## 🏗️ Arquitectura

### **Características Principales**
- **Costo fijo:** 50 $BATTLE tokens por registro
- **Rate limiting:** Máximo 3 vendors por día, 10 por semana
- **Cooldown:** 1 hora entre registros
- **Quema de tokens:** Los tokens se destruyen al registrar
- **Sistema de reembolso:** Para casos de fallo del sistema
- **Pausable:** El contrato puede ser pausado en emergencias

### **Seguridad**
- **Ownable:** Solo el backend autorizado puede ejecutar operaciones
- **ReentrancyGuard:** Previene ataques de reentrancy
- **Pausable:** Permite pausar operaciones en emergencias
- **Validaciones robustas:** Verificación de saldo, unicidad, límites

## 🚀 Deploy

### **Prerrequisitos**
1. Node.js 18+ y npm
2. Hardhat configurado
3. Cuenta con ETH para gas
4. Token $BATTLE desplegado

### **Configuración**
1. Copia `env.example` a `.env`
2. Configura las variables de entorno:
```bash
# Token $BATTLE
BATTLE_TOKEN_ADDRESS=0x...

# Clave privada para deploy
SERVER_PRIVATE_KEY=0x...

# RPC URLs
SEPOLIA_RPC_URL=https://...
```

### **Deploy Local**
```bash
# Compilar contratos
npx hardhat compile

# Deploy en red local
npx hardhat run scripts/deploy-vendor-registration.js --network localhost
```

### **Deploy en Testnet**
```bash
# Deploy en Sepolia
npx hardhat run scripts/deploy-vendor-registration.js --network sepolia

# Deploy en Mumbai
npx hardhat run scripts/deploy-vendor-registration.js --network mumbai
```

### **Verificación**
```bash
# Verificar contrato desplegado
npx hardhat run scripts/verify-vendor-registration.js --network sepolia
```

## 🧪 Testing

### **Ejecutar Tests**
```bash
# Todos los tests
npx hardhat test

# Tests específicos
npx hardhat test test/VendorRegistration.test.js

# Con logs detallados
npx hardhat test --verbose
```

### **Cobertura de Tests**
- ✅ Constructor y configuración
- ✅ Registro de vendors
- ✅ Quema de tokens
- ✅ Rate limiting (diario, semanal, cooldown)
- ✅ Validaciones de entrada
- ✅ Control de acceso
- ✅ Funciones de emergencia
- ✅ Funciones de lectura
- ✅ Casos edge y errores

## 📊 Funciones del Contrato

### **Funciones Principales**
```solidity
// Registrar vendor y quemar tokens
function registerVendor(
    address user,
    uint256 amount,
    string calldata vendorData,
    string calldata vendorId
) external returns (bool success)

// Quemar tokens manualmente
function burnTokens(address user, uint256 amount) external returns (bool success)

// Reembolsar tokens en caso de fallo
function refundTokens(address user, uint256 amount, string calldata reason) external returns (bool success)
```

### **Funciones de Lectura**
```solidity
// Verificar saldo suficiente
function hasSufficientBalance(address user) external view returns (bool)

// Obtener información del vendor
function getVendorInfo(string calldata vendorId) external view returns (
    address user,
    uint256 amount,
    uint256 timestamp,
    bool exists
)

// Contadores y estadísticas
function getTotalTokensBurned() external view returns (uint256)
function getTotalVendorsRegistered() external view returns (uint256)
```

### **Funciones de Admin**
```solidity
// Pausar/despausar contrato
function pause() external
function unpause() external

// Retiro de emergencia
function emergencyWithdraw(address token, uint256 amount, address to) external
function emergencyWithdrawETH(address to, uint256 amount) external
```

## 🔄 Flujo de Uso

### **1. Preparación**
```typescript
// Verificar saldo del usuario
const hasBalance = await contract.hasSufficientBalance(userAddress);
if (!hasBalance) throw new Error("Saldo insuficiente");

// Verificar límites de rate limiting
const dailyCount = await contract.getDailyVendorCount(userAddress, currentDay);
if (dailyCount >= 3) throw new Error("Límite diario alcanzado");
```

### **2. Registro**
```typescript
// El backend llama al contrato
const tx = await contract.registerVendor(
    userAddress,
    ethers.parseEther("50"),
    vendorData,
    vendorId
);

// Esperar confirmación
await tx.wait();
```

### **3. Verificación**
```typescript
// Verificar que el vendor fue registrado
const vendorInfo = await contract.getVendorInfo(vendorId);
if (!vendorInfo.exists) throw new Error("Vendor no registrado");

// Verificar que los tokens fueron quemados
const totalBurned = await contract.getTotalTokensBurned();
```

## 💰 Análisis de Gas

### **Costos Estimados (Sepolia)**
- **Deploy:** ~1,200,000 gas
- **Registro de vendor:** ~180,000 gas
- **Quema manual:** ~120,000 gas
- **Reembolso:** ~80,000 gas

### **Optimizaciones**
- Uso de `viaIR` en compilación
- Optimizador habilitado (200 runs)
- Estructuras de datos eficientes
- Batch operations cuando sea posible

## 🔒 Consideraciones de Seguridad

### **Riesgos Identificados**
- **Centralización:** Solo el backend puede ejecutar operaciones
- **Single point of failure:** Si se pierde la clave privada del owner
- **Rate limiting:** Podría ser bypassed con múltiples wallets

### **Mitigaciones**
- **Multi-sig wallet:** Para operaciones críticas
- **Timelock:** Para cambios de configuración
- **Pausable:** Para emergencias
- **Auditoría:** Contrato auditado antes de mainnet

## 📈 Monitoreo y Analytics

### **Eventos Importantes**
```solidity
event VendorRegistered(address indexed user, uint256 amount, string vendorId, uint256 timestamp);
event TokensBurned(address indexed user, uint256 amount, uint256 timestamp);
event TokensRefunded(address indexed user, uint256 amount, string reason, uint256 timestamp);
```

### **Métricas a Trackear**
- Total de tokens quemados
- Total de vendors registrados
- Distribución por usuario
- Distribución por día/semana
- Costos de gas promedio

## 🚨 Troubleshooting

### **Errores Comunes**
1. **"Insufficient balance"** - Usuario no tiene 50 $BATTLE
2. **"Daily limit exceeded"** - Límite diario alcanzado
3. **"Cooldown period not met"** - Debe esperar 1 hora
4. **"Vendor already exists"** - ID de vendor duplicado

### **Soluciones**
- Verificar saldo del usuario
- Esperar reset de límites diarios/semanales
- Usar ID único para cada vendor
- Verificar permisos del caller

## 🔗 Enlaces Útiles

- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethereum Gas Optimization](https://ethereum.org/en/developers/docs/gas/)
- [Smart Contract Security](https://consensys.net/diligence/)

## 📝 Licencia

MIT License - Ver [LICENSE](../LICENSE) para más detalles.

---

*Desarrollado para Vendor Wars - Sistema de Cobro por Registro de Vendor*
