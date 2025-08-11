# 🏪 Sistema de Cobro por Registro de Vendor

## 📋 Resumen Ejecutivo

Implementar un sistema de cobro obligatorio de **50 $BATTLE tokens** por cada nuevo vendor registrado en la plataforma. Los tokens se queman (destruyen) una vez confirmada la transacción exitosa, y solo después se procede al registro en la base de datos.

---

## 🎯 **Objetivos del Sistema**

- **Control de Spam:** Prevenir registros masivos de vendors falsos
- **Generación de Valor:** Crear escasez del token $BATTLE
- **Calidad de Contenido:** Asegurar que solo usuarios comprometidos registren vendors
- **Sostenibilidad Económica:** Generar demanda constante del token

---

## 🏗️ **Arquitectura del Sistema**

### **1. Smart Contract (VendorRegistration.sol)**
```solidity
// Funcionalidades principales:
- registerVendor(address user, uint256 amount, string vendorData)
- burnTokens(uint256 amount) - Quema 50 $BATTLE
- emit VendorRegistered(address user, uint256 amount, uint256 timestamp)
- Solo backend autorizado puede ejecutar
- Verificación de saldo antes de quema
```

### **2. Backend (API Route)**
```typescript
// /api/vendors/register
- Validación de datos del vendor
- Verificación de transacción en blockchain
- Confirmación de quema de tokens
- Registro en base de datos
- Manejo de errores y rollback
```

### **3. Frontend (Formulario de Registro)**
```typescript
// VendorRegistrationForm
- Formulario de datos del vendor
- Verificación de saldo en tiempo real
- Integración con wallet (Wagmi)
- Estados: pending, success, error, insufficient_balance
```

---

## 🔄 **Flujo de Ejecución Detallado**

### **Fase 1: Preparación**
1. Usuario llena formulario de vendor
2. Sistema verifica saldo mínimo (50 $BATTLE)
3. Sistema valida unicidad de datos
4. Sistema verifica límites diarios

### **Fase 2: Transacción**
1. Usuario hace clic en "Registrar Vendor (50 $BATTLE)"
2. Se abre wallet para aprobación
3. Usuario firma transacción
4. Frontend recibe hash de transacción

### **Fase 3: Verificación y Ejecución**
1. Frontend envía datos + hash a API
2. Backend verifica transacción en blockchain
3. Smart contract quema 50 $BATTLE tokens
4. Backend confirma quema exitosa

### **Fase 4: Registro y Confirmación**
1. Backend registra vendor en base de datos
2. Se asocia hash de transacción al vendor
3. Frontend muestra confirmación exitosa
4. Usuario puede ver su vendor registrado

---

## 🛠️ **Componentes a Implementar**

### **Nuevos Archivos:**
```
contracts/
├── VendorRegistration.sol          # Smart contract principal
├── interfaces/IVendorRegistration.sol
└── test/VendorRegistration.test.js

src/
├── app/api/vendors/register/
│   └── route.ts                   # API modificada con cobro
├── components/
│   ├── vendor-registration-form.tsx
│   ├── balance-checker.tsx
│   └── transaction-status.tsx
├── hooks/
│   └── useVendorRegistration.ts
├── services/
│   ├── vendorRegistration.ts
│   └── blockchainVerification.ts
└── types/
    └── vendorRegistration.ts
```

### **Archivos a Modificar:**
```
src/
├── app/vendors/register/page.tsx  # Integrar wallet y verificación
├── services/voting.ts             # Agregar verificación de transacción
├── services/vendors.ts            # Modificar lógica de registro
└── package.json                   # Dependencias de smart contracts
```

---

## 💰 **Sistema de Reembolso (Opcional)**

### **Casos de Reembolso:**
- Error en base de datos después de quema exitosa
- Fallo en sistema de backend
- Timeout en operación
- Error de validación no detectado previamente

### **Implementación:**
```typescript
// Mecanismo de rollback
try {
  // 1. Quemar tokens
  const burnResult = await burnTokens(user, amount);
  
  // 2. Registrar en BD
  const dbResult = await registerVendorInDB(vendorData);
  
  // 3. Confirmar éxito
  return { success: true, vendorId: dbResult.id };
  
} catch (error) {
  // 4. Rollback: Reembolsar tokens si BD falla
  if (burnResult.success && !dbResult.success) {
    await refundTokens(user, amount);
  }
  throw error;
}
```

---

## 💳 **Verificación de Saldo**

### **Implementación:**
```typescript
// Balance Checker Component
const BalanceChecker = () => {
  const { balance, isLoading } = useTokenBalance();
  const requiredAmount = 50;
  
  return (
    <div className="balance-info">
      <span>Saldo actual: {balance} $BATTLE</span>
      <span>Costo: {requiredAmount} $BATTLE</span>
      {balance < requiredAmount && (
        <div className="insufficient-balance">
          Saldo insuficiente. Necesitas {requiredAmount - balance} $BATTLE más.
        </div>
      )}
    </div>
  );
};
```

### **Validaciones:**
- Verificar saldo antes de mostrar botón de registro
- Mostrar saldo en tiempo real
- Deshabilitar botón si saldo insuficiente
- Mostrar mensaje de saldo insuficiente

---

## 🚫 **Rate Limiting**

### **Límites Implementados:**
```typescript
// Configuración de límites
const RATE_LIMITS = {
  MAX_VENDORS_PER_DAY: 3,        // Máximo 3 vendors por usuario por día
  MAX_VENDORS_PER_WEEK: 10,      // Máximo 10 vendors por semana
  COOLDOWN_PERIOD: 3600000,      // 1 hora entre registros
};
```

### **Implementación:**
```typescript
// Verificación de límites
const checkRateLimits = async (userId: string) => {
  const today = new Date().toISOString().split('T')[0];
  const weekStart = getWeekStart();
  
  const dailyCount = await getVendorCount(userId, today);
  const weeklyCount = await getVendorCount(userId, weekStart);
  const lastRegistration = await getLastRegistrationTime(userId);
  
  if (dailyCount >= RATE_LIMITS.MAX_VENDORS_PER_DAY) {
    throw new Error('Límite diario alcanzado');
  }
  
  if (weeklyCount >= RATE_LIMITS.MAX_VENDORS_PER_WEEK) {
    throw new Error('Límite semanal alcanzado');
  }
  
  if (lastRegistration && Date.now() - lastRegistration < RATE_LIMITS.COOLDOWN_PERIOD) {
    throw new Error('Debes esperar antes de registrar otro vendor');
  }
};
```

---

## 🔍 **Verificación de Unicidad**

### **Validaciones Implementadas:**
```typescript
// Verificaciones de unicidad
const validateVendorUniqueness = async (vendorData: VendorData) => {
  const checks = [
    // Nombre único
    checkNameUniqueness(vendorData.name),
    
    // Dirección única (si se proporciona)
    vendorData.address && checkAddressUniqueness(vendorData.address),
    
    // Coordenadas únicas (si se proporcionan)
    vendorData.coordinates && checkCoordinatesUniqueness(vendorData.coordinates),
    
    // Identificador único del usuario
    checkUserVendorLimit(vendorData.userId)
  ];
  
  const results = await Promise.all(checks);
  const errors = results.filter(result => !result.success);
  
  if (errors.length > 0) {
    throw new Error(`Vendor ya existe: ${errors.map(e => e.reason).join(', ')}`);
  }
};
```

### **Campos Verificados:**
- **Nombre del vendor:** Debe ser único en toda la plataforma
- **Dirección física:** Evitar duplicados por ubicación
- **Coordenadas GPS:** Prevenir vendors en la misma ubicación
- **Usuario:** Verificar límites por usuario

---

## 🔒 **Consideraciones de Seguridad**

### **Verificación de Transacción:**
- Confirmar que la transacción fue exitosa en blockchain
- Verificar que el usuario que firma es el mismo que solicita el registro
- Validar que la cantidad transferida es exactamente 50 $BATTLE

### **Prevención de Ataques:**
- **Replay Attack:** Usar nonces únicos por transacción
- **Front-running:** Implementar mecanismos de protección
- **Sybil Attack:** Verificar identidad del usuario (Farcaster)
- **DoS:** Rate limiting y validaciones robustas

### **Autorización:**
- Solo el backend autorizado puede llamar al smart contract
- Verificación de permisos antes de ejecutar operaciones
- Logs de auditoría para todas las operaciones

---

## 📊 **Métricas y Analytics**

### **Métricas Implementadas:**
```typescript
// Dashboard de métricas
const VendorMetrics = {
  totalTokensBurned: number,           // Total de tokens quemados
  totalVendorsRegistered: number,      // Total de vendors registrados
  dailyRegistrations: number[],        // Registros por día
  userDistribution: Map<string, number>, // Vendors por usuario
  zoneDistribution: Map<string, number>, // Vendors por zona
  revenueByDay: number[],              // Tokens quemados por día
};
```

### **Logs de Auditoría:**
- Hash de transacción por vendor
- Timestamp de registro
- Usuario que registró
- Cantidad de tokens quemados
- Estado de la transacción

---

## 🧪 **Testing y QA**

### **Tests Implementados:**
```typescript
// Test suites
describe('Vendor Registration Payment System', () => {
  test('Successful vendor registration with payment');
  test('Insufficient balance handling');
  test('Transaction verification');
  test('Database rollback on failure');
  test('Rate limiting enforcement');
  test('Uniqueness validation');
  test('Smart contract integration');
  test('Error handling and user feedback');
});
```

### **Casos de Prueba:**
- Flujo completo de registro exitoso
- Manejo de errores de wallet
- Verificación de límites diarios
- Validación de unicidad
- Sistema de reembolso
- Integración con blockchain

---

## 🚀 **Plan de Implementación por Fases**

### **Fase 1: Smart Contract (Semana 1)**
- [ ] Desarrollar VendorRegistration.sol
- [ ] Tests del smart contract
- [ ] Deploy en testnet
- [ ] Auditoría de seguridad

### **Fase 2: Backend (Semana 2)**
- [ ] Modificar API de registro
- [ ] Implementar verificación de transacción
- [ ] Sistema de rollback
- [ ] Rate limiting

### **Fase 3: Frontend (Semana 3)**
- [ ] Integrar wallet en formulario
- [ ] Verificación de saldo
- [ ] Estados de transacción
- [ ] Manejo de errores

### **Fase 4: Testing y Deploy (Semana 4)**
- [ ] Testing completo del sistema
- [ ] Deploy en mainnet
- [ ] Monitoreo y métricas
- [ ] Documentación de usuario

---

## 📝 **Notas de Implementación**

### **Dependencias Requeridas:**
```json
{
  "hardhat": "^2.19.0",
  "@openzeppelin/contracts": "^5.0.0",
  "ethers": "^6.8.0",
  "wagmi": "^2.0.0",
  "viem": "^2.0.0"
}
```

### **Variables de Entorno:**
```env
# Smart Contract
VENDOR_REGISTRATION_CONTRACT_ADDRESS=
BATTLE_TOKEN_CONTRACT_ADDRESS=
PRIVATE_KEY_BACKEND=

# Blockchain
ETHEREUM_RPC_URL=
POLYGON_RPC_URL=
CHAIN_ID=
```

### **Consideraciones de Gas:**
- Optimizar smart contract para minimizar costos de gas
- Implementar batch operations si es posible
- Considerar L2 solutions para reducir costos

---

## 🎯 **Criterios de Éxito**

- [ ] Usuarios pueden registrar vendors pagando 50 $BATTLE
- [ ] Tokens se queman exitosamente en cada registro
- [ ] Sistema de rollback funciona correctamente
- [ ] Rate limiting previene spam
- [ ] Verificación de unicidad es robusta
- [ ] UX es fluida y clara para el usuario
- [ ] Métricas y logs están implementados
- [ ] Tests cubren todos los casos de uso

---

## 📚 **Recursos y Referencias**

- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
- [Ethereum Gas Optimization](https://ethereum.org/en/developers/docs/gas/)

---

*Documento generado para el proyecto Vendor Wars - Sistema de Cobro por Registro de Vendor*
*Última actualización: $(date)*
