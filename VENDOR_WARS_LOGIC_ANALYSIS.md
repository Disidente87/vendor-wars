# Vendor Wars - Análisis Completo de Lógica y Funcionamiento

## 📋 Resumen Ejecutivo

**Vendor Wars** es una Mini App de Farcaster que gamifica la cultura gastronómica local en LATAM convirtiendo las compras a vendedores en batallas territoriales. Los usuarios apoyan a sus vendedores favoritos a través de compras simuladas con crypto, ganando tokens de batalla y logros NFT mientras participan en competencias basadas en barrios que preservan y celebran la cultura gastronómica tradicional.

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Autenticación**: Farcaster Mini App SDK (@neynar/react)
- **Cache/Estado**: Redis (Upstash), TanStack Query
- **UI**: Shadcn UI, Radix UI, Tailwind CSS
- **Blockchain**: Base Network (futuro), Viem v2, Wagmi v2

### Estructura de Directorios
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── vendors/           # Páginas de vendedores
│   ├── zones/             # Páginas de zonas
│   ├── profile/           # Perfil de usuario
│   └── battles/           # Sistema de batallas
├── components/            # Componentes React
├── services/              # Lógica de negocio
├── hooks/                 # Custom hooks
├── lib/                   # Utilidades y configuraciones
├── types/                 # Definiciones TypeScript
└── config/                # Configuraciones
```

## 🔐 Sistema de Autenticación

### Flujo de Autenticación Farcaster
1. **Inicialización**: El hook `useFarcasterAuth` se inicializa con el contexto del Mini App
2. **Verificación de Usuario**: Se verifica si el usuario ya existe en la base de datos
3. **Creación de Perfil**: Si no existe, se crea automáticamente con datos del Farcaster
4. **Persistencia**: Los datos se almacenan en localStorage y Supabase
5. **Gestión de Estado**: El estado de autenticación se mantiene en React state

### Características del Usuario
```typescript
interface User {
  fid: number                    // Farcaster ID
  username: string              // Username de Farcaster
  displayName: string           // Nombre mostrado
  pfpUrl: string               // URL de foto de perfil
  battleTokens: number         // Tokens ganados
  credibilityScore: number     // Puntuación de credibilidad
  voteStreak: number          // Racha de votos diarios
  weeklyVoteCount: number     // Votos de la semana
  credibilityTier: 'bronze' | 'silver' | 'gold' | 'platinum'
}
```

## 🏪 Sistema de Vendedores

### Estructura de Vendedor
```typescript
interface Vendor {
  id: string
  name: string
  description: string
  imageUrl: string
  category: VendorCategory
  zone: string              // ID de la zona de batalla
  coordinates: [number, number] // GPS
  owner: User               // Propietario (usuario Farcaster)
  stats: VendorStats        // Estadísticas de batalla
  isVerified: boolean       // Verificación de negocio
}
```

### Categorías de Vendedores
- **PUPUSAS**: Pupusas salvadoreñas
- **TACOS**: Tacos mexicanos
- **TAMALES**: Tamales tradicionales
- **QUESADILLAS**: Quesadillas
- **TORTAS**: Tortas mexicanas
- **BEBIDAS**: Bebidas tradicionales
- **POSTRES**: Postres locales
- **OTROS**: Otros alimentos

### Servicio de Vendedores (`VendorService`)
- **CRUD Operations**: Crear, leer, actualizar, eliminar vendedores
- **Búsqueda**: Por categoría, zona, propietario
- **Estadísticas**: Top vendedores, tasas de victoria
- **Verificación**: Sistema de verificación de negocios

## 🗺️ Sistema de Zonas Territoriales

### Estructura de Zona
```typescript
interface BattleZone {
  id: string
  name: string              // Ej: "Zona Centro"
  description: string       // Descripción de la zona
  color: string            // Color para el mapa
  coordinates: [number, number] // Centro de la zona
  currentOwner?: Vendor    // Vendedor que controla la zona
  heatLevel: number        // Nivel de actividad (0-100)
  totalVotes: number       // Total de votos en la zona
  activeVendors: number    // Vendedores activos
}
```

### Zonas Predefinidas
1. **Zona Centro**: Centro histórico de CDMX
2. **Zona Norte**: Barrios del norte
3. **Zona Sur**: Distritos del sur
4. **Zona Este**: Áreas del este
5. **Zona Oeste**: Barrios del oeste

### Servicio de Zonas (`ZoneService`)
- **Gestión de Propietarios**: Asignar/quitar control de zonas
- **Estadísticas**: Actualizar niveles de calor, votos
- **Ranking**: Top zonas por actividad

## ⚔️ Sistema de Votación

### Tipos de Voto
1. **Regular**: Voto básico (10 $BATTLE tokens)
2. **Verified**: Voto con foto de compra (30 $BATTLE tokens)

### Flujo de Votación
1. **Validación**: Verificar que el vendedor existe
2. **Anti-Fraud**: Verificar foto hash para votos verificados
3. **Rate Limiting**: Control de votos por usuario/vendedor
4. **Cálculo de Tokens**: Base + bonificaciones
5. **Actualización**: Stats del vendedor y zona
6. **Streak Management**: Gestión de rachas diarias

### Cálculo de Tokens
```typescript
interface TokenCalculation {
  baseTokens: number        // 10 (regular) o 30 (verified)
  streakBonus: number       // Bonus por racha diaria
  territoryBonus: number    // Bonus por zona controlada
  totalTokens: number       // Total ganado
  weeklyCapRemaining: number // Límite semanal restante
}
```

### Bonificaciones
- **Streak Bonus**: +1 token por cada día consecutivo de votación
- **Territory Bonus**: +5 tokens si el vendedor controla la zona
- **Weekly Cap**: Límite de 100 tokens por semana

## 🔥 Sistema de Rachas (Streaks)

### Gestión de Rachas
- **Redis Storage**: Almacenamiento en Redis para performance
- **Daily Tracking**: Seguimiento diario de votos
- **Auto-Reset**: Reset automático si se pierde un día
- **Persistence**: Persistencia en base de datos

### Lógica de Rachas
```typescript
// Incrementar racha solo una vez por día
async incrementStreak(userFid: string): Promise<number> {
  // Verificar si ya votó hoy
  // Si votó ayer, incrementar racha
  // Si no votó ayer, resetear a 1
}
```

## 🏆 Sistema de Batallas

### Estructura de Batalla
```typescript
interface Battle {
  id: string
  challenger: Vendor       // Vendedor retador
  opponent: Vendor         // Vendedor oponente
  category: VendorCategory // Categoría de comida
  zone: string            // Zona donde ocurre
  status: BattleStatus    // Estado de la batalla
  startDate: Date         // Fecha de inicio
  endDate?: Date          // Fecha de fin
  winner?: Vendor         // Ganador
  votes: Vote[]           // Votos recibidos
  totalVotes: number      // Total de votos
  verifiedVotes: number   // Votos verificados
}
```

### Estados de Batalla
- **PENDING**: Batalla creada, esperando inicio
- **ACTIVE**: Batalla en curso
- **COMPLETED**: Batalla terminada con ganador
- **CANCELLED**: Batalla cancelada

### Servicio de Batallas (`BattleService`)
- **Creación**: Crear nuevas batallas entre vendedores
- **Votación**: Registrar votos en batallas
- **Finalización**: Determinar ganador y actualizar stats
- **Estadísticas**: Stats de batallas, porcentajes

## 💰 Sistema de Tokens

### Gestión de Tokens
- **Redis Cache**: Cache de balances para performance
- **Database Sync**: Sincronización con Supabase
- **Transaction Log**: Log de todas las transacciones

### Tipos de Transacciones
- **EARN**: Ganar tokens por votar
- **BURN**: Quemar tokens (futuro)
- **PENALTY**: Penalización por fraude
- **BONUS**: Bonificaciones especiales

### Límites y Restricciones
- **Weekly Cap**: 100 tokens por semana
- **Daily Streak**: Bonus por racha diaria
- **Territory Bonus**: Bonus por zona controlada

## 🛡️ Sistema Anti-Fraud

### Protecciones Implementadas
1. **Photo Hash Verification**: Hash único de fotos para evitar duplicados
2. **Rate Limiting**: Límites de votos por usuario/vendedor
3. **Suspicious Activity Tracking**: Seguimiento de actividad sospechosa
4. **GPS Validation**: Validación de ubicación (futuro)

### Redis Keys para Anti-Fraud
```typescript
const REDIS_KEYS = {
  PHOTO_HASHES: 'photo_hashes',           // Hashes de fotos
  SUSPICIOUS_ACTIVITY: 'suspicious_activity', // Actividad sospechosa
  RATE_LIMIT: 'rate_limit',               // Rate limiting
  VOTE_LIMIT: 'vote_limit'                // Límites de votos
}
```

## 📊 API Routes

### Endpoints Principales

#### `/api/votes`
- **POST**: Registrar nuevo voto
- **GET**: Obtener historial de votos o stats de vendedor

#### `/api/vendors`
- **GET**: Listar vendedores con filtros
- **POST**: Crear nuevo vendedor
- **PUT**: Actualizar vendedor

#### `/api/zones`
- **GET**: Obtener zonas y stats
- **PUT**: Actualizar zona

#### `/api/users`
- **GET**: Obtener usuario por FID
- **POST**: Crear nuevo usuario

#### `/api/auth/farcaster`
- **GET**: Autenticación con Farcaster

## 🗄️ Base de Datos (Supabase)

### Tablas Principales

#### `users`
- Información de usuarios Farcaster
- Stats de tokens y credibilidad
- Rachas de votación

#### `vendors`
- Información de vendedores
- Stats de batallas y victorias
- Verificación de negocios

#### `zones`
- Zonas territoriales
- Propietarios actuales
- Stats de actividad

#### `votes`
- Registro de todos los votos
- Información de verificación
- Tokens ganados

#### `battles`
- Batallas entre vendedores
- Estados y resultados
- Votos asociados

## 🔄 Flujo de Datos

### 1. Autenticación
```
Farcaster SDK → useFarcasterAuth → API /auth/farcaster → Supabase users
```

### 2. Votación
```
UI Vote Button → API /votes → VotingService → Redis + Supabase → UI Update
```

### 3. Gestión de Rachas
```
Vote Registration → streakManager → Redis → Database Sync → UI Update
```

### 4. Actualización de Zonas
```
Vote Impact → ZoneService → Territory Cache → UI Map Update
```

## 🎮 Gamificación

### Elementos de Gamificación
1. **Territorial Control**: Vendedores compiten por control de zonas
2. **Token Economy**: Sistema de tokens $BATTLE
3. **Streak System**: Rachas diarias de votación
4. **Achievement System**: Logros y badges (futuro)
5. **Leaderboards**: Rankings de vendedores y zonas
6. **Social Sharing**: Compartir votos en Farcaster

### Mecánicas de Recompensa
- **Base Tokens**: 10 (regular) / 30 (verified)
- **Streak Bonus**: +1 por día consecutivo
- **Territory Bonus**: +5 si controla la zona
- **Weekly Cap**: 100 tokens máximo por semana

## 🔮 Características Futuras

### Integración Crypto (Mes 3)
- **USDC Integration**: Pagos reales en USDC
- **Base Network**: Transacciones en Base
- **Smart Contracts**: Contratos para batallas
- **NFT Achievements**: Logros como NFTs

### Características Sociales
- **Farcaster Frames**: Frames para votación
- **Social Sharing**: Compartir en redes sociales
- **Community Features**: Funciones comunitarias
- **Notifications**: Notificaciones push

## 🛠️ Configuración y Deployment

### Variables de Entorno en archivo .env.local
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_NEYNAR_API_KEY=
```

### Scripts de Desarrollo
- `npm run dev`: Desarrollo con ngrok para testing
- `npm run build`: Build de producción
- `npm run deploy`: Deploy a Vercel

## 📈 Métricas y Analytics

### KPIs Principales
- **Daily Active Users**: Usuarios activos diarios
- **Vote Volume**: Volumen de votos
- **Token Distribution**: Distribución de tokens
- **Zone Activity**: Actividad por zona
- **Vendor Engagement**: Engagement de vendedores

### Tracking Implementado
- **Vote Analytics**: Análisis de patrones de votación
- **User Behavior**: Comportamiento de usuarios
- **Territory Heat**: Calor de territorios
- **Fraud Detection**: Detección de fraude

## 🔧 Mantenimiento y Debugging

### Logs y Monitoreo
- **Console Logs**: Logs detallados en desarrollo
- **Error Tracking**: Tracking de errores
- **Performance Monitoring**: Monitoreo de performance
- **Database Health**: Salud de la base de datos

### Scripts de Testing
- **Vote Testing**: Pruebas del sistema de votación
- **Streak Testing**: Pruebas de rachas
- **Database Testing**: Pruebas de base de datos
- **API Testing**: Pruebas de endpoints

---

#Reglas
- No queremos datos mock, si hay algun error consiguiendo la informacion de supabase, hay que mostrar 'getting data' o un mensaje alusivo a la situacion. Prohibido usar datos mock en cualquier lugar, todo debe estar en la base de datos

*Este documento se actualiza automáticamente con cada cambio significativo en la lógica del sistema.* 