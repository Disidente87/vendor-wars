# Deployment Options

This document explains the different deployment options available for the VendorRegistration contract.

## 🚀 Available Scripts

### 1. Full Deployment Script (`deploy:vendor-registration`)

**Command**: `npm run deploy:vendor-registration`

**Features**:
- ✅ Comprehensive validation and verification
- ✅ Detailed logging and progress tracking
- ✅ Network detection and configuration
- ✅ Contract verification after deployment
- ✅ Deployment info saving (optional)
- ✅ Gas price optimization
- ✅ Error handling and recovery

**Best for**: Production deployments, detailed debugging, comprehensive logging

**Usage**:
```bash
# Local development
npm run deploy:vendor-registration

# Testnet deployment
HARDHAT_NETWORK=sepolia npm run deploy:vendor-registration

# Base Sepolia deployment (L2)
HARDHAT_NETWORK=baseSepolia npm run deploy:vendor-registration

# Production deployment
HARDHAT_NETWORK=mainnet npm run deploy:vendor-registration

# Base mainnet deployment (L2)
HARDHAT_NETWORK=base npm run deploy:vendor-registration

# Save deployment info
SAVE_DEPLOY_INFO=true npm run deploy:vendor-registration
```

### 2. Simple Deployment Script (`deploy:vendor-registration:simple`)

**Command**: `npm run deploy:vendor-registration:simple`

**Features**:
- ✅ Quick and simple deployment
- ✅ Basic validation
- ✅ Essential verification
- ✅ Clean output
- ✅ Fast execution

**Best for**: Quick testing, development, simple deployments

**Usage**:
```bash
# Quick local deployment
npm run deploy:vendor-registration:simple

# Quick testnet deployment
HARDHAT_NETWORK=sepolia npm run deploy:vendor-registration:simple

# Base Sepolia deployment (L2)
HARDHAT_NETWORK=baseSepolia npm run deploy:vendor-registration:simple
```

## 🔧 Configuration

### Environment Variables

Both scripts require these environment variables:

```bash
# Required for all networks
BATTLE_TOKEN_CONTRACT_ADDRESS=0x...

# Required for non-local networks
SERVER_PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
```

### Network Configuration

The deployment scripts automatically detect and configure networks:

- **hardhat**: Local development network
- **sepolia**: Ethereum testnet
- **baseSepolia**: Base testnet (L2 - Optimism-based)
- **goerli**: Ethereum testnet (deprecated)
- **mainnet**: Ethereum mainnet
- **base**: Base mainnet (L2 - Optimism-based)
- **mumbai**: Polygon testnet
- **polygon**: Polygon mainnet

## 📊 Output Comparison

### Full Script Output
```
🚀 Deploying VendorRegistration smart contract...
📝 Deploying with account: 0x...
💰 Account balance: 1.234 ETH
🌐 Network: sepolia
🎯 BATTLE Token Address: 0x...
📋 Contract parameters:
  - BattleToken address: 0x...
  - Registration cost: 50 $BATTLE tokens
  - Network: sepolia
  - Deployer: 0x...
🔧 Deploying contract...
✅ VendorRegistration deployed to: 0x...
🔗 Contract URL: https://sepolia.etherscan.io/address/0x...
🔍 Verifying deployment...
✅ Contract verification successful:
  - Registration cost: 50.0 $BATTLE
  - Total tokens burned: 0.0 $BATTLE
  - Total vendors registered: 0
👑 Owner: 0x...
✅ Owner configured correctly
🎯 BATTLE Token configured: 0x...
✅ BATTLE Token configured correctly
📋 Deployment Summary:
{
  "network": "sepolia",
  "vendorRegistrationAddress": "0x...",
  "battleTokenAddress": "0x...",
  "owner": "0x...",
  "deployer": "0x...",
  "timestamp": "2024-01-XX...",
  "blockNumber": 12345,
  "registrationCost": "50.0",
  "constants": {
    "MAX_VENDORS_PER_DAY": 3,
    "MAX_VENDORS_PER_WEEK": 10,
    "COOLDOWN_PERIOD": "1 hour"
  }
}
💾 Add this to your .env file:
# VendorRegistration Contract
NEXT_PUBLIC_VENDOR_REGISTRATION_CONTRACT_ADDRESS=0x...
🧪 Testing basic functionality...
✅ Registration cost: 50.0 $BATTLE
✅ Initial state - Tokens burned: 0.0 Vendors: 0
🎉 Deployment completed successfully!
📚 Next steps:
1. Verify the contract on the blockchain explorer
2. Add NEXT_PUBLIC_VENDOR_REGISTRATION_CONTRACT_ADDRESS to your .env file
3. Run tests: npm run test:vendor-registration
4. Configure environment variables in your backend
5. Integrate the contract in your application
```

### Simple Script Output
```
🚀 Deploying VendorRegistration to sepolia network...
✅ Environment validated for sepolia network
🌐 RPC URL: https://sepolia.infura.io/v3/YOUR_PROJECT_ID
🔗 Explorer: https://sepolia.etherscan.io
⛽ Gas Price: 20000000000
✅ Confirmations: 3
📝 Deploying with account: 0x...
💰 Balance: 1.234 ETH
🎯 BattleToken: 0x...
🔧 Deploying VendorRegistration contract...
⏳ Waiting for deployment confirmation...
✅ Contract deployed to: 0x...
🔗 Explorer: https://sepolia.etherscan.io/address/0x...
🔍 Verifying deployment...
✅ Deployment verified:
  - Registration cost: 50.0 $BATTLE
  - Tokens burned: 0.0 $BATTLE
  - Vendors registered: 0
💾 Add to your .env file:
# VendorRegistration Contract (sepolia)
NEXT_PUBLIC_VENDOR_REGISTRATION_CONTRACT_ADDRESS=0x...
🎉 Deployment completed successfully!
📚 Next steps:
1. Add the contract address to your .env file
2. Test the system: npm run test:vendor-registration
3. Integrate with your frontend application
```

## 🎯 When to Use Which Script

### Use Full Script When:
- Deploying to production networks
- Need detailed logging for debugging
- Want to save deployment information
- Need comprehensive verification
- Working with complex network configurations

### Use Simple Script When:
- Quick local development testing
- Simple testnet deployments
- Don't need detailed logging
- Want fast execution
- Basic deployment verification is sufficient

## 🔄 Migration from Old Scripts

If you were using the old JavaScript deployment script:

1. **Remove old script**: The `contracts/scripts/deploy-vendor-registration.js` has been deleted
2. **Update commands**: Use the new npm scripts
3. **Environment variables**: Ensure your `.env` file has the required variables
4. **Test deployment**: Run a test deployment to verify everything works

## 🆘 Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Ensure `BATTLE_TOKEN_CONTRACT_ADDRESS` is set
   - For non-local networks, ensure `SERVER_PRIVATE_KEY` is set

2. **Network Configuration**
   - Check `HARDHAT_NETWORK` environment variable
   - Verify RPC URLs are correct

3. **Gas Issues**
   - Check account balance
   - Verify gas price settings
   - Monitor network congestion

### Getting Help

- Check the [Vendor Registration Setup Guide](./VENDOR_REGISTRATION_SETUP.md)
- Review error messages in the deployment output
- Verify your environment configuration
- Test with the simple deployment script first
