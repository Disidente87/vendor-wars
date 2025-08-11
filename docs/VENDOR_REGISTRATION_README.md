# Vendor Registration System

A comprehensive system for registering vendors with blockchain-based payment verification using $BATTLE tokens.

## 🚀 Quick Start

### 1. Setup Database Schema

```bash
# Apply the database migration for payment fields
npm run setup:vendor-payment-fields
```

### 2. Deploy Smart Contract

```bash
# Deploy to local network
npm run deploy:vendor-registration

# Deploy to testnet
HARDHAT_NETWORK=sepolia npm run deploy:vendor-registration
```

### 3. Test the System

```bash
# Test the payment system
npm run test:vendor-registration
```

## 🏗️ Architecture

### Components

- **Smart Contract**: `VendorRegistration.sol` - Handles token burning and registration
- **Frontend Components**: React components for payment UI
- **API Endpoint**: `/api/vendors/register` - Backend registration logic
- **Database**: Supabase with payment tracking fields
- **Hook**: `useVendorRegistration` - React hook for registration logic

### Data Flow

1. User fills vendor registration form
2. Frontend checks token balance and approval
3. Smart contract burns 50 $BATTLE tokens
4. API verifies payment and creates vendor record
5. Database stores vendor with payment information

## 📋 Requirements

### Prerequisites

- Hardhat development environment
- Deployed BattleToken contract
- Supabase database with proper permissions
- Environment variables configured

### Environment Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
BATTLE_TOKEN_CONTRACT_ADDRESS=0x...

# After deployment
NEXT_PUBLIC_VENDOR_REGISTRATION_CONTRACT_ADDRESS=0x...
```

## 🗄️ Database Schema

### New Fields Added

```sql
-- Payment and ownership fields
owner_address TEXT                    -- Ethereum address of vendor owner
payment_amount TEXT                   -- Amount of tokens paid
payment_status TEXT DEFAULT 'pending' -- Payment status
delegation TEXT                       -- Delegation name
```

### Indexes

```sql
-- Performance optimization
CREATE INDEX idx_vendors_owner_address ON vendors(owner_address);
CREATE INDEX idx_vendors_payment_status ON vendors(payment_status);
CREATE INDEX idx_vendors_delegation ON vendors(delegation);
```

## 🔧 Smart Contract

### Key Functions

```solidity
// Register vendor and burn tokens
function registerVendor(
    string memory vendorId,
    address userAddress,
    uint256 amount
) external returns (bool)

// Get registration cost
function getVendorRegistrationCost() external view returns (uint256)

// Check registration status
function isVendorRegistered(string memory vendorId) external view returns (bool)
```

### Events

```solidity
event VendorRegistered(
    string indexed vendorId,
    address indexed userAddress,
    uint256 amount,
    uint256 timestamp
);
```

## 🎨 Frontend Components

### Available Components

- `VendorRegistrationPaymentInfo` - Shows payment cost and user balance
- `VendorRegistrationTransactionStatus` - Displays transaction status
- `VendorRegistrationProgress` - Shows registration progress steps

### Usage Example

```tsx
import { useVendorRegistration } from '@/hooks/useVendorRegistration'

function VendorRegistrationForm() {
  const {
    paymentInfo,
    canProceed,
    processRegistration,
    registrationState
  } = useVendorRegistration()

  const handleSubmit = async (formData) => {
    const result = await processRegistration({
      ...formData,
      userAddress: userAddress,
      paymentAmount: '50',
      vendorId: generateVendorId()
    })
    
    if (result.success) {
      // Handle success
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <VendorRegistrationPaymentInfo />
      <VendorRegistrationProgress />
      <button type="submit" disabled={!canProceed}>
        Register Vendor
      </button>
    </form>
  )
}
```

## 🔌 API Integration

### Registration Endpoint

**POST** `/api/vendors/register`

#### Request Body

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

#### Response

```json
{
  "success": true,
  "data": {
    "id": "vendor_uuid",
    "name": "Vendor Name",
    "payment_status": "completed",
    "owner_address": "0x...",
    "payment_amount": "50"
  },
  "message": "Vendor registered successfully in delegation_name delegation"
}
```

### Payment Verification

The API verifies:
- Payment amount (must be 50 $BATTLE tokens)
- User address validity
- Vendor ID uniqueness
- Delegation existence

## 🧪 Testing

### Test Commands

```bash
# Test payment system
npm run test:vendor-registration

# Run comprehensive tests
npm run test:comprehensive

# Test specific components
npm run test:vendor-registration-components
```

### Test Scenarios

1. **Successful Registration**
   - User has sufficient tokens
   - Payment transaction succeeds
   - Vendor record created

2. **Insufficient Balance**
   - User has less than 50 tokens
   - Error message displayed
   - No vendor record created

3. **Network Issues**
   - Transaction fails
   - Error handling works
   - User informed of issue

## 🚨 Error Handling

### Common Errors

- **Insufficient Balance**: User needs at least 50 $BATTLE tokens
- **Contract Not Found**: Verify contract address in environment
- **Transaction Failed**: Check gas settings and network status
- **Database Error**: Ensure migration applied and permissions correct

### Error Recovery

- Implement retry mechanisms for failed transactions
- Provide clear error messages to users
- Log errors for debugging
- Graceful fallbacks for non-critical failures

## 🔒 Security

### Access Control

- Only authenticated users can register vendors
- Payment verification prevents double-spending
- Vendor ID uniqueness enforced
- Delegation validation required

### Token Security

- Tokens burned during registration (no refunds)
- Secure approval and transfer mechanisms
- Contract-level validation
- Event logging for audit trail

## 📊 Monitoring

### Metrics to Track

- Registration success rate
- Token burning events
- Gas usage per registration
- Failed transaction count
- User balance distribution

### Alerts

- High failure rate
- Contract balance low
- Gas price spikes
- Database connection issues

## 🚀 Deployment

### Local Development

```bash
# Start Hardhat node
npx hardhat node

# Deploy contracts
npm run deploy:vendor-registration

# Test locally
npm run test:vendor-registration
```

### Testnet Deployment

```bash
# Deploy to Sepolia
HARDHAT_NETWORK=sepolia npm run deploy:vendor-registration

# Update environment variables
# Test with real tokens
```

### Production Deployment

```bash
# Deploy to mainnet
HARDHAT_NETWORK=mainnet npm run deploy:vendor-registration

# Verify contract on Etherscan
# Update production environment
# Monitor system health
```

## 🔄 Maintenance

### Regular Tasks

- Monitor contract events
- Check database performance
- Update gas price recommendations
- Review error logs
- Backup critical data

### Updates

- Smart contract upgrades
- Frontend component updates
- API endpoint improvements
- Database schema changes

## 📚 Additional Resources

- [Vendor Registration Setup Guide](./VENDOR_REGISTRATION_SETUP.md)
- [Smart Contract Documentation](./contracts/VendorRegistration.sol)
- [API Documentation](./src/app/api/vendors/register/route.ts)
- [Component Library](./src/components/)
- [Hook Documentation](./src/hooks/useVendorRegistration.ts)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

For issues or questions:
1. Check the documentation
2. Review error logs
3. Test with provided scripts
4. Open an issue on GitHub
5. Contact the development team
