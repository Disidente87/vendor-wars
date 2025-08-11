# 🧪 Sistema de Testing del Sistema de Pagos

## 📋 **Descripción General**

Este documento describe cómo probar todas las funcionalidades del sistema de pagos para registro de vendors. El sistema incluye tests para:

- **Frontend**: Componentes React y hooks
- **Backend**: APIs del servidor
- **Smart Contract**: Funcionalidades de blockchain
- **Configuración**: Validación de configuraciones del sistema

## 🚀 **Inicio Rápido**

### **1. Testing del Frontend**

```bash
# Navegar a la página de testing
http://localhost:3000/vendors/test-payment-system
```

Esta página incluye:
- ✅ Verificación de configuración del sistema
- ✅ Testing de componentes React
- ✅ Validación de datos
- ✅ Estado del hook de pagos
- ✅ Verificación de APIs del backend

### **2. Testing de Configuración del Sistema**

```bash
npm run test:payment-system
```

Este script verifica:
- Configuración de tokens y contratos
- Funciones de utilidad
- Validaciones de datos
- Mensajes del sistema
- Endpoints de API
- Rate limiting
- Estados de transacción
- Configuración de gas
- Validaciones de imagen

### **3. Testing de APIs del Backend**

```bash
npm run test:payment-apis
```

Este script prueba:
- `/api/vendors/verify-payment` - Verificación de pagos
- `/api/vendors/payment-history` - Historial de pagos
- `/api/vendors/payment-stats` - Estadísticas de pagos
- `/api/vendors/register` - Registro de vendors

### **4. Testing del Smart Contract**

```bash
npm run test:payment-contract
```

Este script verifica:
- Conexión a la red Base Sepolia
- Configuración del contrato
- Funciones del token $BATTLE
- Funciones de vendor
- Rate limiting
- Estados del contrato

### **5. Testing Completo**

```bash
npm run test:payment-all
```

Ejecuta todos los tests en secuencia.

## 🔧 **Configuración Requerida**

### **Variables de Entorno**

Asegúrate de tener configuradas estas variables en `.env.local`:

```bash
# Contratos
BATTLE_TOKEN_CONTRACT_ADDRESS=0x...
VENDOR_REGISTRATION_ADDRESS=0x...

# Red Base Sepolia
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=tu_api_key

# Clave privada para testing
PRIVATE_KEY=tu_clave_privada
```

### **Dependencias**

```bash
npm install viem @radix-ui/react-progress
```

## 📱 **Componentes de Testing**

### **PaymentSystemTester**

Componente React que proporciona una interfaz visual para testing:

```tsx
import { PaymentSystemTester } from '@/components/vendor-registration/PaymentSystemTester'

// En tu página
<PaymentSystemTester />
```

**Características:**
- ✅ Testing automático de todas las funcionalidades
- ✅ Interfaz visual con resultados en tiempo real
- ✅ Configuración de datos de prueba
- ✅ Estado del sistema en tiempo real
- ✅ Resumen de resultados

### **Scripts de Testing**

#### **test-payment-system.ts**

```typescript
import { PAYMENT_CONFIG } from '@/config/payment'

// Ejecutar tests
console.log('🧪 Iniciando Testing del Sistema de Pagos...')

// Test 1: Configuración del Sistema
console.log('✅ Token Address:', PAYMENT_CONFIG.BATTLE_TOKEN.ADDRESS)
console.log('✅ Contract Address:', PAYMENT_CONFIG.VENDOR_REGISTRATION.ADDRESS)

// Test 2: Funciones de Utilidad
const formattedAmount = PAYMENT_CONFIG.formatTokenAmount('50000000000000000000')
console.log('✅ Format Token Amount:', formattedAmount)
```

#### **test-apis.ts**

```typescript
import { ApiTester } from './test-apis'

const tester = new ApiTester()

// Probar todas las APIs
await tester.runAllTests()

// O probar APIs específicas
await tester.testPaymentVerification()
await tester.testPaymentHistory()
await tester.testPaymentStats()
```

#### **test-smart-contract.ts**

```typescript
import { SmartContractTester } from './test-smart-contract'

const tester = new SmartContractTester()

// Probar smart contract
await tester.runAllTests()

// O probar funcionalidades específicas
await tester.testContractConfiguration()
await tester.testTokenContract()
await tester.testVendorFunctions()
```

## 📊 **Interpretación de Resultados**

### **Estados de Test**

- **✅ ÉXITO**: La funcionalidad está funcionando correctamente
- **❌ ERROR**: Hay un problema que necesita atención
- **⏳ PENDIENTE**: El test está en ejecución

### **Métricas de Rendimiento**

- **Tiempo de Respuesta**: Tiempo que tarda cada API en responder
- **Tasa de Éxito**: Porcentaje de tests que pasan exitosamente
- **Errores Comunes**: Problemas frecuentes y sus soluciones

### **Resumen de Tests**

Al final de cada ejecución, verás un resumen como:

```
📊 Resumen: 15 ✅ | 2 ❌ | 17 Total

🎉 ¡El sistema está funcionando correctamente!
```

O si hay errores:

```
⚠️  2 test(s) fallaron. Revisa los errores para identificar problemas.
```

## 🐛 **Solución de Problemas Comunes**

### **Error: "Cannot connect to Base Sepolia"**

**Causa**: Problemas de conectividad o RPC URL incorrecta
**Solución**: 
1. Verifica `BASE_SEPOLIA_RPC_URL` en `.env.local`
2. Asegúrate de tener conexión a internet
3. Prueba con un RPC alternativo

### **Error: "Contract not found"**

**Causa**: Dirección de contrato incorrecta o contrato no desplegado
**Solución**:
1. Verifica `VENDOR_REGISTRATION_ADDRESS` en `.env.local`
2. Asegúrate de que el contrato esté desplegado en Base Sepolia
3. Ejecuta `npm run deploy:base-sepolia` si es necesario

### **Error: "API endpoint not found"**

**Causa**: Servidor no ejecutándose o ruta incorrecta
**Solución**:
1. Ejecuta `npm run dev` para iniciar el servidor
2. Verifica que esté corriendo en `http://localhost:3000`
3. Revisa las rutas en `src/app/api/`

### **Error: "Insufficient balance"**

**Causa**: Wallet sin suficientes tokens $BATTLE
**Solución**:
1. Conecta una wallet con tokens $BATTLE
2. Obtén tokens de un faucet de Base Sepolia
3. Verifica el saldo en el componente `TokenBalanceChecker`

## 🔄 **Flujo de Testing Recomendado**

### **1. Testing Inicial (Desarrollo)**

```bash
# 1. Verificar configuración
npm run test:payment-system

# 2. Probar APIs (con servidor corriendo)
npm run test:payment-apis

# 3. Probar smart contract
npm run test:payment-contract
```

### **2. Testing de Integración**

```bash
# 1. Iniciar servidor
npm run dev

# 2. Navegar a página de testing
http://localhost:3000/vendors/test-payment-system

# 3. Ejecutar tests automáticos
# (Usar el botón "Ejecutar Todos los Tests")
```

### **3. Testing de Producción**

```bash
# 1. Build de producción
npm run build

# 2. Testing completo
npm run test:payment-all

# 3. Verificar métricas de rendimiento
```

## 📈 **Métricas y Monitoreo**

### **KPIs del Sistema**

- **Tiempo de Respuesta Promedio**: < 2 segundos
- **Tasa de Éxito de Tests**: > 95%
- **Disponibilidad de APIs**: > 99%
- **Tiempo de Confirmación de Transacciones**: < 5 minutos

### **Logs y Debugging**

```bash
# Ver logs del servidor
npm run dev

# Ver logs de tests
npm run test:payment-system 2>&1 | tee test-results.log

# Ver logs de smart contract
npm run test:payment-contract 2>&1 | tee contract-test-results.log
```

## 🚀 **Próximos Pasos**

### **Fase 5: Optimizaciones Avanzadas**

1. **Testing de Carga**: Simular múltiples usuarios simultáneos
2. **Testing de Seguridad**: Verificar vulnerabilidades comunes
3. **Testing de UI/UX**: Validar experiencia del usuario
4. **Testing de Performance**: Optimizar tiempos de respuesta

### **Fase 6: Monitoreo en Producción**

1. **Alertas Automáticas**: Notificaciones de fallos
2. **Dashboard de Métricas**: Monitoreo en tiempo real
3. **Logs Centralizados**: Análisis de errores
4. **Backup y Recuperación**: Planes de contingencia

## 📚 **Recursos Adicionales**

- [Documentación del Sistema de Pagos](./VENDOR_REGISTRATION_PAYMENT_SYSTEM.md)
- [Guía de Configuración](./VENDOR_REGISTRATION_SETUP.md)
- [README del Sistema](./VENDOR_REGISTRATION_README.md)
- [Opciones de Despliegue](./DEPLOYMENT_OPTIONS.md)

## 🤝 **Soporte**

Si encuentras problemas:

1. **Revisa los logs** de error
2. **Verifica la configuración** de variables de entorno
3. **Ejecuta tests individuales** para aislar problemas
4. **Consulta la documentación** de cada componente
5. **Revisa el estado** de la red Base Sepolia

---

**🎯 Objetivo**: Asegurar que el sistema de pagos funcione correctamente en todos los niveles antes de la producción.

**📅 Última Actualización**: Diciembre 2024
**🔄 Versión**: 1.0.0
