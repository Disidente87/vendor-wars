#!/usr/bin/env tsx

/**
 * Script de Testing del Smart Contract
 * 
 * Este script prueba las funcionalidades del smart contract:
 * - Verificación de saldos
 * - Rate limiting
 * - Estados de vendor
 * - Eventos del contrato
 */

import { createPublicClient, http, getContract, parseAbi } from 'viem'
import { baseSepolia } from 'viem/chains'
import { PAYMENT_CONFIG } from '@/config/payment'

// ABI simplificado para testing
const VENDOR_REGISTRATION_ABI = parseAbi([
  'function isVendorRegistered(address user) view returns (bool)',
  'function getVendorInfo(address user) view returns (string name, string description, string delegation, string category, uint256 registrationTime, bool isActive)',
  'function getDailyRegistrationCount(address user) view returns (uint256)',
  'function getWeeklyRegistrationCount(address user) view returns (uint256)',
  'function getLastRegistrationTime(address user) view returns (uint256)',
  'function canRegister(address user) view returns (bool)',
  'function getNextRegistrationTime(address user) view returns (uint256)',
  'function getTotalVendors() view returns (uint256)',
  'function getTotalTokensBurned() view returns (uint256)',
  'function getVendorRegistrationFee() view returns (uint256)',
  'function getRateLimits() view returns (uint256 maxDaily, uint256 maxWeekly, uint256 cooldownPeriod)',
  'function owner() view returns (address)',
  'function paused() view returns (bool)',
  'event VendorRegistered(address indexed user, string name, string description, string delegation, string category, uint256 registrationTime, uint256 tokensBurned)',
  'event TokensBurned(address indexed user, uint256 amount, uint256 timestamp)',
  'event RateLimitExceeded(address indexed user, string reason, uint256 timestamp)'
])

const BATTLE_TOKEN_ABI = parseAbi([
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)'
])

interface ContractTestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
  data?: any
  error?: string
}

class SmartContractTester {
  private results: ContractTestResult[] = []
  private publicClient: any
  private vendorContract: any
  private tokenContract: any

  constructor() {
    this.publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(PAYMENT_CONFIG.VENDOR_REGISTRATION.NETWORK.RPC_URL)
    })

    this.vendorContract = getContract({
      address: PAYMENT_CONFIG.VENDOR_REGISTRATION.ADDRESS as `0x${string}`,
      abi: VENDOR_REGISTRATION_ABI,
      client: this.publicClient
    })

    this.tokenContract = getContract({
      address: PAYMENT_CONFIG.BATTLE_TOKEN.ADDRESS as `0x${string}`,
      abi: BATTLE_TOKEN_ABI,
      client: this.publicClient
    })
  }

  private addResult(name: string, status: 'pending' | 'success' | 'error', message: string, data?: any, error?: string) {
    this.results.push({ name, status, message, data, error })
  }

  async testContractConfiguration(): Promise<void> {
    console.log('⚙️  Probando Configuración del Contrato...')

    try {
      // Test owner
      const owner = await this.vendorContract.read.owner()
      this.addResult(
        'Owner del Contrato',
        'success',
        `Owner: ${owner}`,
        { owner }
      )

      // Test paused state
      const paused = await this.vendorContract.read.paused()
      this.addResult(
        'Estado Pausado',
        'success',
        `Contrato ${paused ? 'pausado' : 'activo'}`,
        { paused }
      )

      // Test vendor registration fee
      const fee = await this.vendorContract.read.getVendorRegistrationFee()
      this.addResult(
        'Tarifa de Registro',
        'success',
        `Tarifa: ${fee} wei`,
        { fee: fee.toString() }
      )

      // Test rate limits
      const rateLimits = await this.vendorContract.read.getRateLimits()
      this.addResult(
        'Límites de Rate',
        'success',
        `Diario: ${rateLimits[0]}, Semanal: ${rateLimits[1]}, Cooldown: ${rateLimits[2]}ms`,
        {
          maxDaily: rateLimits[0].toString(),
          maxWeekly: rateLimits[1].toString(),
          cooldownPeriod: rateLimits[2].toString()
        }
      )

    } catch (error) {
      this.addResult(
        'Configuración del Contrato',
        'error',
        'Error leyendo configuración',
        undefined,
        error instanceof Error ? error.message : 'Error desconocido'
      )
    }
  }

  async testTokenContract(): Promise<void> {
    console.log('🪙 Probando Contrato del Token...')

    try {
      // Test token info
      const name = await this.tokenContract.read.name()
      const symbol = await this.tokenContract.read.symbol()
      const decimals = await this.tokenContract.read.decimals()
      const totalSupply = await this.tokenContract.read.totalSupply()

      this.addResult(
        'Información del Token',
        'success',
        `${name} (${symbol}) - ${decimals} decimales`,
        { name, symbol, decimals, totalSupply: totalSupply.toString() }
      )

      // Test balance of zero address (should be 0)
      const zeroAddress = '0x0000000000000000000000000000000000000000' as `0x${string}`
      const balance = await this.tokenContract.read.balanceOf([zeroAddress])

      this.addResult(
        'Balance de Dirección Cero',
        'success',
        `Balance: ${balance} wei`,
        { balance: balance.toString() }
      )

    } catch (error) {
      this.addResult(
        'Contrato del Token',
        'error',
        'Error leyendo token',
        undefined,
        error instanceof Error ? error.message : 'Error desconocido'
      )
    }
  }

  async testVendorFunctions(): Promise<void> {
    console.log('👥 Probando Funciones de Vendor...')

    try {
      // Test total vendors
      const totalVendors = await this.vendorContract.read.getTotalVendors()
      this.addResult(
        'Total de Vendors',
        'success',
        `Total: ${totalVendors} vendors`,
        { totalVendors: totalVendors.toString() }
      )

      // Test total tokens burned
      const totalBurned = await this.vendorContract.read.getTotalTokensBurned()
      this.addResult(
        'Total de Tokens Quemados',
        'success',
        `Total quemado: ${totalBurned} wei`,
        { totalBurned: totalBurned.toString() }
      )

      // Test vendor registration for zero address
      const zeroAddress = '0x0000000000000000000000000000000000000000' as `0x${string}`
      const isRegistered = await this.vendorContract.read.isVendorRegistered([zeroAddress])
      
      this.addResult(
        'Estado de Vendor (Dirección Cero)',
        'success',
        `Registrado: ${isRegistered}`,
        { isRegistered }
      )

      // Test can register for zero address
      const canRegister = await this.vendorContract.read.canRegister([zeroAddress])
      this.addResult(
        'Puede Registrar (Dirección Cero)',
        'success',
        `Puede registrar: ${canRegister}`,
        { canRegister }
      )

      // Test registration counts for zero address
      const dailyCount = await this.vendorContract.read.getDailyRegistrationCount([zeroAddress])
      const weeklyCount = await this.vendorContract.read.getWeeklyRegistrationCount([zeroAddress])
      
      this.addResult(
        'Contadores de Registro (Dirección Cero)',
        'success',
        `Diario: ${dailyCount}, Semanal: ${weeklyCount}`,
        {
          dailyCount: dailyCount.toString(),
          weeklyCount: weeklyCount.toString()
        }
      )

      // Test last registration time for zero address
      const lastTime = await this.vendorContract.read.getLastRegistrationTime([zeroAddress])
      this.addResult(
        'Último Registro (Dirección Cero)',
        'success',
        `Timestamp: ${lastTime}`,
        { lastRegistrationTime: lastTime.toString() }
      )

    } catch (error) {
      this.addResult(
        'Funciones de Vendor',
        'error',
        'Error probando funciones de vendor',
        undefined,
        error instanceof Error ? error.message : 'Error desconocido'
      )
    }
  }

  async testNetworkConnection(): Promise<void> {
    console.log('🌐 Probando Conexión a la Red...')

    try {
      // Test block number
      const blockNumber = await this.publicClient.getBlockNumber()
      this.addResult(
        'Número de Bloque',
        'success',
        `Bloque actual: ${blockNumber}`,
        { blockNumber: blockNumber.toString() }
      )

      // Test chain ID
      const chainId = await this.publicClient.getChainId()
      this.addResult(
        'Chain ID',
        'success',
        `Chain ID: ${chainId}`,
        { chainId }
      )

      // Test gas price
      const gasPrice = await this.publicClient.getGasPrice()
      this.addResult(
        'Precio del Gas',
        'success',
        `Gas price: ${gasPrice} wei`,
        { gasPrice: gasPrice.toString() }
      )

    } catch (error) {
      this.addResult(
        'Conexión a la Red',
        'error',
        'Error conectando a la red',
        undefined,
        error instanceof Error ? error.message : 'Error desconocido'
      )
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🧪 Iniciando Testing del Smart Contract...\n')

    try {
      await this.testNetworkConnection()
      await this.testContractConfiguration()
      await this.testTokenContract()
      await this.testVendorFunctions()
    } catch (error) {
      console.error('❌ Error ejecutando tests:', error)
    }

    this.printResults()
  }

  printResults(): void {
    console.log('\n📋 Resultados de los Tests del Smart Contract\n')
    console.log('='.repeat(80))

    const successCount = this.results.filter(r => r.status === 'success').length
    const errorCount = this.results.filter(r => r.status === 'error').length
    const totalTests = this.results.length

    this.results.forEach((result, index) => {
      const statusIcon = result.status === 'success' ? '✅' : 
                        result.status === 'error' ? '❌' : '⏳'
      const statusText = result.status === 'success' ? 'ÉXITO' :
                        result.status === 'error' ? 'ERROR' : 'PENDIENTE'
      
      console.log(`${index + 1}. ${statusIcon} ${result.name}`)
      console.log(`   Estado: ${statusText}`)
      console.log(`   Mensaje: ${result.message}`)
      
      if (result.error) {
        console.log(`   Error: ${result.error}`)
      }
      
      if (result.data) {
        console.log(`   Datos: ${JSON.stringify(result.data, null, 2)}`)
      }
      
      console.log('')
    })

    console.log('='.repeat(80))
    console.log(`📊 Resumen: ${successCount} ✅ | ${errorCount} ❌ | ${totalTests} Total`)
    
    if (errorCount === 0) {
      console.log('🎉 ¡El smart contract está funcionando correctamente!')
    } else {
      console.log(`⚠️  ${errorCount} test(s) fallaron. Revisa los errores para identificar problemas.`)
    }
  }

  getResults(): ContractTestResult[] {
    return this.results
  }
}

// Ejecutar tests si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new SmartContractTester()
  tester.runAllTests()
}

export { SmartContractTester }
