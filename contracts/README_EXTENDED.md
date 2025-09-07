# 🚀 VendorWarsExtended Smart Contract

## 📋 Descripción

El contrato `VendorWarsExtended` es una extensión del contrato `VendorRegistration` que incluye funcionalidades avanzadas para el sistema Vendor Wars. Hereda todas las funcionalidades del contrato base y agrega nuevas características como sistema de votación, territorios, verificación de vendors, reviews, boosts, NFTs de logros y protección contra front-running.

## 🏗️ Arquitectura

### **Características Principales**
- **Herencia completa** del contrato `VendorRegistration`
- **Sistema de votación** con tracking de votos por vendor, zona y usuario
- **Sistema de territorios** con competencia territorial
- **Verificación de vendors** con evidencia
- **Sistema de reviews** con costo en tokens
- **Sistema de boost** para mayor visibilidad
- **NFTs de logros** para gamificación
- **Protección contra front-running** con commit-reveal
- **Protección contra slippage** en quemas de tokens
- **Rate limiting avanzado** para todas las operaciones

### **Seguridad Avanzada**
- **Commit-reveal** para claims de territorio
- **Validación de slippage** en transacciones
- **Rate limiting granular** por tipo de operación
- **Validación de datos** con límites de tamaño
- **Protección contra front-running** en operaciones críticas

## 🚀 Deploy

### **Prerrequisitos**
1. Node.js 18+ y npm
2. Hardhat configurado
3. Cuenta con ETH para gas
4. Token $BATTLE desplegado
5. Contrato `VendorRegistration` desplegado (opcional, se puede deployar independientemente)

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
npx hardhat run scripts/deploy-vendor-wars-extended.js --network localhost
```

### **Deploy en Testnet**
```bash
# Deploy en Sepolia
npx hardhat run scripts/deploy-vendor-wars-extended.js --network sepolia

# Deploy en Mumbai
npx hardhat run scripts/deploy-vendor-wars-extended.js --network mumbai
```

### **Verificación**
```bash
# Verificar contrato desplegado
CONTRACT_ADDRESS=0x... npx hardhat run scripts/verify-vendor-wars-extended.js --network sepolia
```

## 🧪 Testing

### **Ejecutar Tests**
```bash
# Todos los tests
npx hardhat test

# Tests específicos del contrato extendido
npx hardhat test test/VendorWarsExtended.test.js

# Con logs detallados
npx hardhat test --verbose
```

### **Cobertura de Tests**
- ✅ Herencia del contrato base
- ✅ Sistema de votación
- ✅ Sistema de territorios
- ✅ Verificación de vendors
- ✅ Sistema de reviews
- ✅ Sistema de boost
- ✅ NFTs de logros
- ✅ Protección contra front-running
- ✅ Protección contra slippage
- ✅ Rate limiting avanzado
- ✅ Validación de datos
- ✅ Casos edge y errores

## 📊 Funciones del Contrato

### **Funciones Heredadas (VendorRegistration)**
```solidity
// Todas las funciones del contrato base están disponibles
function registerVendor(...) external returns (bool success)
function burnTokens(...) external returns (bool success)
function refundTokens(...) external returns (bool success)
// ... y todas las demás funciones del contrato base
```

### **Nuevas Funciones Principales**

#### **Gestión de Vendors**
```solidity
// Actualizar información de vendor
function updateVendorInfo(
    string calldata vendorId,
    string calldata newName,
    string calldata newDescription,
    string calldata newCategory
) external returns (bool success)

// Verificar vendor con evidencia
function verifyVendor(
    string calldata vendorId,
    address verifier,
    string calldata verificationData
) external returns (bool success)

// Aplicar boost a vendor
function boostVendor(
    address user,
    string calldata vendorId,
    uint256 boostAmount,
    uint256 duration,
    uint256 cost
) external returns (bool success)
```

#### **Sistema de Votación**
```solidity
// Registrar voto
function recordVote(
    address user,
    uint256 cost,
    string calldata vendorId,
    string calldata zoneId,
    uint256 voteValue,
    bool isVerified
) external returns (bool success)

// Obtener votos de vendor
function getVendorVotes(string calldata vendorId) external view returns (Vote[] memory votes)

// Obtener votos de zona
function getZoneVotes(string calldata zoneId) external view returns (Vote[] memory votes)

// Obtener votos de usuario
function getUserVotes(address user) external view returns (Vote[] memory votes)
```

#### **Sistema de Territorios**
```solidity
// Reclamar territorio
function claimTerritory(
    string calldata zoneId,
    string calldata vendorId,
    uint256 claimAmount
) external returns (bool success)

// Obtener información de territorio
function getTerritory(string calldata zoneId) external view returns (Territory memory territory)

// Obtener información de territorio (simplificada)
function getTerritoryInfo(string calldata zoneId) external view returns (
    string memory dominantVendorId,
    uint256 totalVotes,
    uint256 lastUpdateTime,
    bool exists
)
```

#### **Sistema de Reviews**
```solidity
// Enviar review
function submitReview(
    address user,
    uint256 amount,
    string calldata reviewData,
    string calldata reviewId
) external returns (bool success)
```

#### **Protección contra Front-Running**
```solidity
// Commit de claim de territorio
function commitTerritoryClaim(
    string calldata zoneId,
    string calldata vendorId,
    bytes32 commitHash
) external returns (bool success)

// Reveal de claim de territorio
function revealTerritoryClaim(
    string calldata zoneId,
    string calldata vendorId,
    uint256 claimAmount,
    string calldata nonce
) external returns (bool success)
```

#### **Protección contra Slippage**
```solidity
// Quemar tokens con protección de slippage
function burnTokensWithSlippageProtection(
    address user,
    uint256 amount,
    uint256 minAmount
) external returns (bool success)

// Verificar si se puede quemar tokens
function canBurnTokens(address user) external view returns (bool canBurn, uint256 timeRemaining)

// Obtener slippage máximo permitido
function getMaxAllowedSlippage(uint256 minAmount) external pure returns (uint256)
```

#### **Gamificación**
```solidity
// Mintear NFT de logro
function mintAchievementNFT(
    address user,
    string calldata achievementType,
    string calldata metadata,
    uint256 cost
) external returns (uint256 tokenId)

// Comprar personalización de perfil
function purchaseProfileCustomization(
    address user,
    string calldata customizationType,
    uint256 cost
) external returns (bool success)
```

### **Funciones de Lectura Avanzadas**
```solidity
// Obtener información extendida de vendor
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
)

// Obtener estadísticas generales
function getGeneralStats() external view returns (
    uint256 totalTokensBurned,
    uint256 totalVendorsRegistered,
    uint256 totalVotes
)

// Obtener votos de vendor en zona específica
function getZoneVendorVotes(string calldata zoneId, string calldata vendorId) 
    external view returns (uint256 votes)
```

## 🔄 Flujo de Uso Avanzado

### **1. Registro de Vendor con Zona**
```typescript
// Registrar vendor en zona específica
const tx = await vendorWarsExtended.registerVendor(
    userAddress,
    ethers.parseEther("50"),
    vendorData,
    vendorId,
    zoneId
);
```

### **2. Sistema de Votación**
```typescript
// Votar por vendor en zona
const tx = await vendorWarsExtended.recordVote(
    userAddress,
    ethers.parseEther("10"),
    vendorId,
    zoneId,
    100, // vote value
    true // is verified
);

// Obtener votos
const vendorVotes = await vendorWarsExtended.getVendorVotes(vendorId);
const zoneVotes = await vendorWarsExtended.getZoneVotes(zoneId);
```

### **3. Sistema de Territorios**
```typescript
// Reclamar territorio
const tx = await vendorWarsExtended.claimTerritory(
    zoneId,
    vendorId,
    claimAmount
);

// Obtener información de territorio
const territory = await vendorWarsExtended.getTerritory(zoneId);
```

### **4. Verificación de Vendors**
```typescript
// Verificar vendor
const tx = await vendorWarsExtended.verifyVendor(
    vendorId,
    verifierAddress,
    verificationData
);
```

### **5. Sistema de Reviews**
```typescript
// Enviar review
const tx = await vendorWarsExtended.submitReview(
    userAddress,
    ethers.parseEther("15"),
    reviewData,
    reviewId
);
```

### **6. Sistema de Boost**
```typescript
// Aplicar boost a vendor
const tx = await vendorWarsExtended.boostVendor(
    userAddress,
    vendorId,
    boostAmount,
    duration,
    cost
);
```

### **7. NFTs de Logros**
```typescript
// Mintear NFT de logro
const tx = await vendorWarsExtended.mintAchievementNFT(
    userAddress,
    achievementType,
    metadata,
    cost
);
```

## 💰 Análisis de Gas

### **Costos Estimados (Sepolia)**
- **Deploy:** ~2,500,000 gas
- **Registro de vendor:** ~180,000 gas
- **Voto:** ~200,000 gas
- **Review:** ~150,000 gas
- **Boost:** ~220,000 gas
- **Verificación:** ~120,000 gas
- **Claim de territorio:** ~250,000 gas
- **Commit-reveal:** ~300,000 gas
- **NFT minting:** ~280,000 gas

### **Optimizaciones**
- Uso de `viaIR` en compilación
- Optimizador habilitado (200 runs)
- Estructuras de datos eficientes
- Batch operations cuando sea posible
- Eventos optimizados

## 🔒 Consideraciones de Seguridad

### **Riesgos Identificados**
- **Centralización:** Solo el backend puede ejecutar operaciones
- **Front-running:** Mitigado con commit-reveal
- **Slippage:** Protegido con validaciones
- **Rate limiting:** Podría ser bypassed con múltiples wallets

### **Mitigaciones**
- **Commit-reveal:** Para operaciones críticas
- **Slippage protection:** Validación de slippage máximo
- **Rate limiting granular:** Por tipo de operación
- **Validación de datos:** Límites de tamaño
- **Auditoría:** Contrato auditado antes de mainnet

## 📈 Monitoreo y Analytics

### **Eventos Importantes**
```solidity
event VendorInfoUpdated(string indexed vendorId, string newName, string newDescription, string newCategory);
event VendorVerified(string indexed vendorId, address verifier, string verificationData);
event VoteRecorded(address indexed user, string vendorId, string zoneId, uint256 voteValue, bool isVerified);
event TerritoryClaimed(string indexed zoneId, string vendorId, uint256 claimAmount);
event AchievementNFTMinted(address indexed user, uint256 tokenId, string achievementType, string metadata);
event TokensBurnedWithSlippage(address indexed user, uint256 amount, uint256 minAmount, uint256 slippagePercentage);
```

### **Métricas a Trackear**
- Total de votos por vendor/zona
- Territorios dominados por vendor
- Vendors verificados
- Reviews enviados
- Boosts aplicados
- NFTs minteados
- Slippage promedio
- Gas costs por operación

## 🚨 Troubleshooting

### **Errores Comunes**
1. **"Vendor does not exist"** - Vendor no registrado
2. **"Insufficient votes for territory claim"** - Menos del 51% de votos
3. **"Slippage too high"** - Slippage excede el 5%
4. **"Daily operation limit exceeded"** - Límite diario alcanzado
5. **"Reveal too early"** - Debe esperar 1 día para reveal

### **Soluciones**
- Verificar que el vendor existe
- Asegurar suficientes votos para claim
- Ajustar slippage máximo
- Esperar reset de límites
- Verificar timing de commit-reveal

## 🔗 Enlaces Útiles

- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethereum Gas Optimization](https://ethereum.org/en/developers/docs/gas/)
- [Smart Contract Security](https://consensys.net/diligence/)
- [Commit-Reveal Pattern](https://docs.openzeppelin.com/contracts/4.x/governance#commit-reveal)

## 📝 Licencia

MIT License - Ver [LICENSE](../LICENSE) para más detalles.

---

*Desarrollado para Vendor Wars - Sistema Extendido de Gestión de Vendors*
