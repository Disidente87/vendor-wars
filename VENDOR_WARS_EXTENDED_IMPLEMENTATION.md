# VendorWars Extended - Implementación de Reviews

## Resumen

Se ha implementado la integración del contrato `VendorWarsExtended.sol` con el sistema de reviews existente. Esta implementación permite a los usuarios submitir reviews quemando tokens BATTLE directamente en el contrato inteligente.

## Archivos Creados/Modificados

### 1. ABI del Contrato
- **Archivo**: `src/contracts/VendorWarsExtendedABI.ts`
- **Descripción**: ABI completo del contrato VendorWarsExtended con todas las funciones y eventos
- **Incluye**: Funciones para reviews, votos, territorios, NFTs, y más

### 2. Servicio de Interacción
- **Archivo**: `src/services/vendorWarsExtended.ts`
- **Descripción**: Servicio para interactuar con el contrato VendorWarsExtended
- **Funciones principales**:
  - `hasSufficientBalanceForReview()`: Verifica saldo suficiente
  - `hasSufficientAllowanceForReview()`: Verifica allowance
  - `getVendorInfo()`: Obtiene información del vendor
  - `getGeneralStats()`: Obtiene estadísticas generales

### 3. Hook Personalizado
- **Archivo**: `src/hooks/useVendorWarsExtendedReview.ts`
- **Descripción**: Hook React para manejar reviews con VendorWarsExtended
- **Funcionalidades**:
  - Gestión de estado de conexión
  - Verificación de balance y allowance
  - Aprobación de tokens
  - Submit de reviews
  - Manejo de errores

### 4. Componente de UI
- **Archivo**: `src/components/VendorWarsExtendedReviewForm.tsx`
- **Descripción**: Componente React para el formulario de reviews
- **Características**:
  - Interfaz intuitiva
  - Validaciones en tiempo real
  - Estados de carga y error
  - Información de balance y allowance

### 5. API Actualizada
- **Archivo**: `src/app/api/vendors/reviews/submit/route.ts`
- **Modificaciones**:
  - Uso del contrato VendorWarsExtended en lugar de VendorRegistration
  - Función `submitReview` específica para reviews
  - Validaciones mejoradas
  - Manejo de errores específicos

### 6. Configuración Actualizada
- **Archivo**: `src/config/payment.ts`
- **Modificaciones**:
  - Agregada configuración para VendorWarsExtended
  - Costo de review reducido a 15 BATTLE tokens
  - Endpoint de API para reviews

### 7. Script de Deploy
- **Archivo**: `scripts/deployVendorWarsExtended.js`
- **Descripción**: Script para deployar el contrato VendorWarsExtended
- **Funcionalidades**:
  - Deploy automático
  - Verificación del contrato
  - Generación de configuración
  - Variables de entorno

## Funcionalidades Implementadas

### 1. Submit de Reviews
- **Función**: `submitReview(user, cost, reviewData, reviewId)`
- **Costo**: 15 BATTLE tokens
- **Validaciones**:
  - Saldo suficiente
  - Allowance apropiado
  - Rate limiting (20 operaciones/día, 100/semana)
  - Contenido del review (10-500 caracteres)

### 2. Rate Limiting
- **Límites**:
  - 20 operaciones por día por usuario
  - 100 operaciones por semana por usuario
  - Cooldown de 1 hora entre registros

### 3. Validaciones de Seguridad
- **Balance**: Verificación de saldo suficiente
- **Allowance**: Verificación de aprobación de tokens
- **Pausa**: Verificación de estado del contrato
- **Rate Limiting**: Prevención de spam

### 4. Eventos Emitidos
- `TokensBurned`: Cuando se queman tokens
- `VoteRecorded`: Cuando se registra un voto
- `TerritoryClaimed`: Cuando se reclama un territorio
- `VendorRegistered`: Cuando se registra un vendor

## Uso

### 1. Deploy del Contrato
```bash
# Deployar el contrato
npx hardhat run scripts/deployVendorWarsExtended.js --network baseSepolia

# Actualizar variable de entorno
NEXT_PUBLIC_VENDOR_WARS_EXTENDED_CONTRACT_ADDRESS=0x...
```

### 2. Uso en Componentes
```tsx
import { VendorWarsExtendedReviewForm } from '@/components/VendorWarsExtendedReviewForm'

function ReviewPage() {
  return (
    <VendorWarsExtendedReviewForm
      vendorId="vendor123"
      userFid={12345}
      onReviewSubmitted={(reviewId) => {
        console.log('Review submitted:', reviewId)
      }}
    />
  )
}
```

### 3. Uso del Hook
```tsx
import { useVendorWarsExtendedReview } from '@/hooks/useVendorWarsExtendedReview'

function MyComponent() {
  const {
    reviewState,
    approveTokensForReview,
    submitReviewTransaction,
    isPaused
  } = useVendorWarsExtendedReview()

  // Usar las funciones del hook
}
```

### 4. Uso del Servicio
```tsx
import { vendorWarsExtendedService } from '@/services/vendorWarsExtended'

// Verificar si un vendor existe
const exists = await vendorWarsExtendedService.vendorExists('vendor123')

// Obtener estadísticas
const stats = await vendorWarsExtendedService.getGeneralStats()
```

## Diferencias con VendorRegistration

| Aspecto | VendorRegistration | VendorWarsExtended |
|---------|-------------------|-------------------|
| **Función** | `registerVendor` | `submitReview` |
| **Costo** | 50 BATTLE | 15 BATTLE |
| **Propósito** | Registrar vendors | Submitir reviews |
| **Rate Limiting** | Básico | Avanzado |
| **Funcionalidades** | Limitadas | Extensas |

## Próximos Pasos

1. **Deploy del Contrato**: Ejecutar el script de deploy
2. **Actualizar Variables**: Configurar `NEXT_PUBLIC_VENDOR_WARS_EXTENDED_CONTRACT_ADDRESS`
3. **Testing**: Probar la funcionalidad completa
4. **Integración**: Integrar en la UI existente
5. **Monitoreo**: Implementar monitoreo de transacciones

## Consideraciones de Seguridad

- **Rate Limiting**: Previene spam y ataques
- **Validaciones**: Múltiples capas de validación
- **Pausa**: Capacidad de pausar el contrato
- **Ownership**: Control de acceso restringido
- **Reentrancy**: Protección contra reentrancy attacks

## Monitoreo y Logs

- **Eventos**: Todos los eventos se emiten para monitoreo
- **Logs**: Logs detallados en la API
- **Errores**: Manejo robusto de errores
- **Estados**: Estados claros para debugging

## Conclusión

La implementación de VendorWarsExtended proporciona una base sólida para el sistema de reviews con funcionalidades avanzadas como rate limiting, validaciones de seguridad, y una arquitectura extensible para futuras funcionalidades como votos, territorios, y NFTs.
