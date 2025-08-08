export interface BattleTokenContract {
  // Basic ERC20 functions
  name(): Promise<string>
  symbol(): Promise<string>
  decimals(): Promise<number>
  totalSupply(): Promise<bigint>
  balanceOf(owner: string): Promise<bigint>
  allowance(owner: string, spender: string): Promise<bigint>
  
  // Transfer functions
  transfer(to: string, value: bigint): Promise<boolean>
  transferFrom(from: string, to: string, value: bigint): Promise<boolean>
  approve(spender: string, value: bigint): Promise<boolean>
  
  // Minting functions (owner only)
  mint(to: string, amount: bigint): Promise<void>
  
  // Burning functions
  burn(value: bigint): Promise<void>
  burnFrom(from: string, value: bigint): Promise<void>
  
  // Distribution function (owner only)
  distributeTokens(
    recipients: string[],
    amounts: bigint[],
    metadata: string
  ): Promise<void>
  
  // Emergency functions (owner only)
  emergencyWithdraw(): Promise<void>
  
  // Ownership functions
  owner(): Promise<string>
  transferOwnership(newOwner: string): Promise<void>
  renounceOwnership(): Promise<void>
  
  // EIP-2612 permit function
  permit(
    owner: string,
    spender: string,
    value: bigint,
    deadline: bigint,
    v: number,
    r: string,
    s: string
  ): Promise<void>
  
  // Domain separator for EIP-2612
  DOMAIN_SEPARATOR(): Promise<string>
  
  // Nonces for EIP-2612
  nonces(owner: string): Promise<bigint>
  
  // Custom functions from the contract
  getDistributionStats(): Promise<{
    totalSupply: bigint
    ownerBalance: bigint
    availableForDistribution: bigint
  }>
  
  getUserDistributionAmount(user: string): Promise<bigint>
}

export interface TokenDistributionEvent {
  recipients: string[]
  totalAmount: bigint
  metadata: string
}

export interface TokenBalance {
  balance: bigint
  formatted: string
  symbol: string
}

export interface TokenDistributionStats {
  totalSupply: bigint
  ownerBalance: bigint
  availableForDistribution: bigint
  formatted: {
    totalSupply: string
    ownerBalance: string
    availableForDistribution: string
  }
}

// Contract configuration
export interface ContractConfig {
  address: string
  chainId: number
  name: string
  symbol: string
  decimals: number
}

// Distribution request interface
export interface DistributionRequest {
  recipients: string[]
  amounts: bigint[]
  metadata: string
}

// Error types
export class TokenError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'TokenError'
  }
}

export class InsufficientBalanceError extends TokenError {
  constructor(required: bigint, available: bigint) {
    super(`Insufficient balance. Required: ${required}, Available: ${available}`)
    this.name = 'InsufficientBalanceError'
  }
}

export class UnauthorizedError extends TokenError {
  constructor(action: string) {
    super(`Unauthorized: ${action} requires owner privileges`)
    this.name = 'UnauthorizedError'
  }
}
