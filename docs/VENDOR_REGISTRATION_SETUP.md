# Vendor Registration Payment System Setup Guide

This guide will help you set up and deploy the Vendor Registration Payment System.

## Overview

The system consists of:
- **Smart Contract**: `VendorRegistration.sol` - handles token burning and vendor registration
- **Frontend Components**: React components for payment verification and transaction status
- **API Integration**: Updated vendor registration API with payment verification
- **Services**: TypeScript services for blockchain interaction

## Prerequisites

1. **Hardhat Environment**: Ensure Hardhat is configured and working
2. **BattleToken Contract**: Deployed and accessible
3. **Environment Variables**: Configured with contract addresses
4. **Dependencies**: All npm packages installed

## Environment Configuration

Create or update your `.env` file with:

```bash
# BattleToken Contract
BATTLE_TOKEN_CONTRACT_ADDRESS=0x...

# VendorRegistration Contract (will be set after deployment)
NEXT_PUBLIC_VENDOR_REGISTRATION_CONTRACT_ADDRESS=0x...

# Network Configuration
HARDHAT_NETWORK=localhost  # or sepolia, mainnet
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
SERVER_PRIVATE_KEY=your_private_key_for_deployment
```

## Database Schema Updates

### 1. Required Fields

The vendor registration system requires additional fields in the `vendors` table. Create a new migration file:

```sql
-- Add payment and ownership fields to vendors table
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS owner_address TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS payment_amount TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS delegation TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendors_owner_address ON vendors(owner_address);
CREATE INDEX IF NOT EXISTS idx_vendors_payment_status ON vendors(payment_status);
CREATE INDEX IF NOT EXISTS idx_vendors_delegation ON vendors(delegation);

-- Update existing vendors to have default values
UPDATE vendors SET 
  owner_address = '0x0000000000000000000000000000000000000000',
  payment_amount = '0',
  payment_status = 'legacy',
  delegation = 'general'
WHERE owner_address IS NULL;
```

### 2. Apply the Migration

```bash
# Connect to your Supabase database and run the migration
psql -h your-supabase-host -U postgres -d postgres -f supabase/add-vendor-payment-fields.sql

# Or use Supabase CLI
supabase db push
```

## Deployment Steps

### 1. Deploy the Smart Contract

> **Note**: We have consolidated the deployment scripts into a single TypeScript file (`scripts/deploy-vendor-registration.ts`) that provides comprehensive deployment functionality including validation, verification, and deployment info saving. We also provide a simplified version (`scripts/deploy-simple.ts`) for quick deployments.

```bash
# Deploy to local network
npm run deploy:vendor-registration

# Deploy to testnet (Sepolia)
HARDHAT_NETWORK=sepolia npm run deploy:vendor-registration

# Deploy to mainnet
HARDHAT_NETWORK=mainnet npm run deploy:vendor-registration

# Save deployment info to file (optional)
SAVE_DEPLOY_INFO=true npm run deploy:vendor-registration

# Quick deployment (simplified)
npm run deploy:vendor-registration:simple
```

### 2. Update Environment Variables

After deployment, add the contract address to your `.env` file:

```bash
NEXT_PUBLIC_VENDOR_REGISTRATION_CONTRACT_ADDRESS=0x... # Address from deployment
```

### 3. Test the System

```bash
# Test the payment system
npm run test:vendor-registration

# Run comprehensive tests
npm run test:comprehensive
```

## Frontend Integration

### 1. Components Available

- `VendorRegistrationPaymentInfo`: Shows payment cost and user balance
- `VendorRegistrationTransactionStatus`: Displays transaction status
- `VendorRegistrationProgress`: Shows registration progress steps

### 2. Hook Usage

```tsx
import { useVendorRegistration } from '@/hooks/useVendorRegistration'

function VendorRegistrationForm() {
  const {
    paymentInfo,
    canProceed,
    processRegistration,
    registrationState
  } = useVendorRegistration()

  // Use the hook in your component
}
```

### 3. Form Integration

Update your vendor registration form to include:

```tsx
// Add payment verification before submission
const handleSubmit = async (formData) => {
  try {
    const result = await processRegistration({
      ...formData,
      userAddress: userAddress,
      paymentAmount: '50', // 50 $BATTLE tokens
      vendorId: generateVendorId()
    })
    
    if (result.success) {
      // Handle success
    }
  } catch (error) {
    // Handle error
  }
}
```

## API Integration

### 1. Updated Registration Endpoint

The `/api/vendors/register` endpoint now requires:

```json
{
  "name": "Vendor Name",
  "description": "Vendor description",
  "delegation": "delegation_name",
  "category": "category_name",
  "imageUrl": "image_url",
  "ownerFid": 12345,
  "userAddress": "0x...",
  "paymentAmount": "50",
  "vendorId": "unique_vendor_id"
}
```

### 2. Payment Verification

The API now verifies:
- Payment amount (must be 50 $BATTLE tokens)
- User address validity
- Vendor ID uniqueness

## Smart Contract Integration

### 1. Contract Functions

The `VendorRegistration.sol` contract provides:

```solidity
// Register a vendor and burn tokens
function registerVendor(
    string memory vendorId,
    address userAddress,
    uint256 amount
) external returns (bool)

// Get registration cost
function getVendorRegistrationCost() external view returns (uint256)

// Check if vendor is registered
function isVendorRegistered(string memory vendorId) external view returns (bool)
```

### 2. Integration Points

```typescript
// In your frontend service
import { VendorRegistration__factory } from '@/contracts/typechain-types'

const contract = VendorRegistration__factory.connect(
  contractAddress,
  signer
)

// Register vendor
const tx = await contract.registerVendor(vendorId, userAddress, amount)
await tx.wait()
```

## Testing the System

### 1. Local Testing

```bash
# Start local Hardhat node
npx hardhat node

# Deploy contracts
npm run deploy:vendor-registration

# Test the system
npm run test:vendor-registration
```

### 2. Testnet Testing

```bash
# Deploy to Sepolia
HARDHAT_NETWORK=sepolia npm run deploy:vendor-registration

# Test with real tokens
npm run test:vendor-registration
```

### 3. Frontend Testing

1. Connect wallet with sufficient $BATTLE tokens
2. Fill out vendor registration form
3. Verify payment information is displayed
4. Complete registration process
5. Check transaction status

## Monitoring and Maintenance

### 1. Contract Monitoring

- Monitor token burning events
- Track vendor registration counts
- Check contract balance and gas usage

### 2. Error Handling

The system includes comprehensive error handling for:
- Insufficient token balance
- Network issues
- Contract failures
- User validation errors

### 3. Rate Limiting

Consider implementing rate limiting to prevent spam:
- Daily vendor registration limits
- Cooldown periods between registrations
- User-specific limits

## Security Considerations

### 1. Access Control

- Only authorized users can register vendors
- Payment verification prevents double-spending
- Vendor ID uniqueness prevents duplicates

### 2. Token Security

- Tokens are burned (destroyed) during registration
- No refund mechanism (intentional design)
- Secure approval and transfer mechanisms

### 3. Data Validation

- Input validation on frontend and backend
- Smart contract parameter validation
- Database constraint enforcement

## Troubleshooting

### Common Issues

1. **Insufficient Balance**
   - Ensure user has at least 50 $BATTLE tokens
   - Check token approval for contract

2. **Contract Not Found**
   - Verify contract address in environment
   - Check network configuration

3. **Transaction Failures**
   - Verify gas settings
   - Check network congestion
   - Ensure sufficient ETH for gas

4. **Database Errors**
   - Ensure payment fields are added to vendors table
   - Check database permissions
   - Verify migration was applied

### Debug Commands

```bash
# Check contract state
npx hardhat console --network localhost
> const contract = await ethers.getContractAt("VendorRegistration", "CONTRACT_ADDRESS")
> await contract.getVendorRegistrationCost()

# Check user balance
> const token = await ethers.getContractAt("BattleToken", "TOKEN_ADDRESS")
> await token.balanceOf("USER_ADDRESS")

# Check database schema
psql -h your-supabase-host -U postgres -d postgres -c "\d vendors"
```

## Performance Optimization

### 1. Gas Optimization

- Batch multiple registrations in single transaction
- Use efficient data structures in smart contract
- Optimize event emissions

### 2. Frontend Optimization

- Implement lazy loading for vendor lists
- Use React Query for efficient data fetching
- Implement proper error boundaries

### 3. Database Optimization

- Add appropriate indexes for payment fields
- Use connection pooling
- Implement caching for frequently accessed data

## Support

For issues or questions:
1. Check the logs and error messages
2. Verify environment configuration
3. Test with the provided test scripts
4. Review the smart contract code
5. Check network status and gas prices
6. Verify database schema matches requirements

## Next Steps

After successful setup:
1. **User Testing**: Test with real users and feedback
2. **Analytics**: Implement tracking for registration metrics
3. **Optimization**: Monitor gas usage and optimize contracts
4. **Scaling**: Consider implementing batch operations for multiple vendors
5. **Features**: Add additional payment methods or token options
6. **Monitoring**: Set up alerts for failed transactions and system issues
7. **Backup**: Implement backup and recovery procedures for critical data

## Implementation Checklist

- [ ] Deploy VendorRegistration smart contract
- [ ] Update environment variables with contract addresses
- [ ] Apply database schema migrations
- [ ] Test smart contract functionality
- [ ] Test frontend components
- [ ] Test API integration
- [ ] Test end-to-end registration flow
- [ ] Deploy to testnet for validation
- [ ] Set up monitoring and alerting
- [ ] Document any custom configurations
- [ ] Train team on new system
- [ ] Plan production deployment
