# Vendor Wars - Farcaster MiniApp

A competitive vendor battle platform built for the Farcaster ecosystem, focused on preserving and celebrating LATAM food culture. Transform your pupusa purchases into territorial battles, support local vendors, and earn $BATTLE tokens while participating in neighborhood-based competition.

## 🚀 Features

- **Territorial Battles**: Five battle zones in CDMX where vendors compete for dominance
- **LATAM Food Focus**: Traditional categories like pupusas, tacos, tamales, quesadillas, and more
- **Purchase Verification**: Photo attestation for real purchases with 3x token rewards
- **$BATTLE Token Economy**: Earn tokens for supporting local vendors
- **Farcaster Integration**: Seamless authentication and social sharing
- **Community-Driven**: Preserve local food culture through economic support
- **Modern UI**: Beautiful, responsive design with Tailwind CSS and Shadcn UI

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn UI + Radix UI
- **Authentication**: Farcaster Auth Kit
- **API Integration**: Neynar API for Farcaster data
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form + Zod validation
- **Animations**: Framer Motion

## 📋 Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Farcaster account
- Neynar API key (for production)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vendor-wars
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Add your configuration:
   ```env
   # Farcaster Configuration
   NEXT_PUBLIC_HUB_URL=https://nemes.farcaster.xyz:2283
   NEYNAR_API_KEY=your_neynar_api_key_here
   SIGNER_UUID=your_signer_uuid_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── battles/       # Battle management
│   │   ├── vendors/       # Vendor CRUD operations
│   │   └── leaderboard/   # Leaderboard data
│   ├── battles/           # Battles page
│   ├── leaderboard/       # Leaderboard page
│   ├── vendors/           # Vendors directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   └── ui/               # Shadcn UI components
├── config/               # Configuration files
│   └── farcaster.ts      # Farcaster-specific config
├── lib/                  # Utility functions
│   └── utils.ts          # Common utilities
├── services/             # Business logic services
│   ├── farcaster.ts      # Farcaster API integration
│   ├── vendors.ts        # Vendor management
│   └── battles.ts        # Battle system
└── types/                # TypeScript type definitions
    └── index.ts          # Main type definitions
```

## 🎮 How It Works

### Battle Zones
- **Zona Centro**: Historic center of CDMX
- **Zona Norte**: Northern neighborhoods  
- **Zona Sur**: Southern districts
- **Zona Este**: Eastern areas
- **Zona Oeste**: Western neighborhoods

### Food Categories
- **Pupusas**: Traditional Salvadoran pupusas
- **Tacos**: Authentic Mexican tacos
- **Tamales**: Traditional tamales
- **Quesadillas**: Cheese quesadillas
- **Tortas**: Mexican sandwiches
- **Bebidas**: Traditional drinks
- **Postres**: Traditional desserts
- **Otros**: Other local specialties

### Token Economics
- **Base Vote**: 10 $BATTLE tokens per vote
- **Verified Purchase**: 3x multiplier (30 tokens) for photo attestation
- **Territory Defense**: 20 tokens for maintaining #1 for 24h
- **Territory Conquest**: 50 tokens for taking #1 from another vendor
- **Weekly Caps**: 200 tokens from voting, 100 from territory bonuses

### Purchase Verification
- **Photo Capture**: Upload photos of food/receipt
- **GPS Verification**: Confirm location within 50m of vendor
- **Timestamp Validation**: Photo must match vote time (±30 min)
- **Anti-Fraud**: Duplicate detection and pattern flagging

## 🔧 Configuration

### Farcaster Setup

1. **Get a Neynar API Key**
   - Visit [Neynar](https://neynar.com/)
   - Sign up and get your API key
   - Add it to your `.env.local` file

2. **Set up Farcaster Authentication**
   - Configure your signer UUID
   - Set up your Farcaster Hub URL

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_HUB_URL` | Farcaster Hub URL | No | `https://nemes.farcaster.xyz:2283` |
| `NEYNAR_API_KEY` | Neynar API key | Yes | - |
| `SIGNER_UUID` | Farcaster signer UUID | Yes | - |

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically on push

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔒 Security Considerations

- All API endpoints validate input data with Zod
- User authentication is handled through Farcaster
- Purchase verification includes GPS and timestamp validation
- Rate limiting should be implemented for production
- Environment variables are properly secured

## 📊 Success Metrics

### MVP Success (Month 1)
- 300+ registered users completing onboarding
- 25+ active vendors across 3 zones
- 1,000+ votes processed successfully
- 25% 7-day retention rate

### Growth Success (Month 3)
- 1,500+ monthly active users
- 75+ vendors across CDMX
- 35% 7-day retention rate
- 15%+ weekly organic growth rate

### Scale Success (Month 6)
- 5,000+ monthly active users
- 200+ vendors across 3+ cities
- 45% 7-day retention rate
- Break-even on operational costs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Farcaster](https://farcaster.xyz/) for the social protocol
- [Neynar](https://neynar.com/) for the API services
- [Shadcn UI](https://ui.shadcn.com/) for the beautiful components
- [Next.js](https://nextjs.org/) for the amazing framework
- LATAM food culture and local vendors for inspiration

## 📞 Support

If you have any questions or need help:
- Open an issue on GitHub
- Join our Discord community
- Check the documentation

---

**¡Lucha por tu tienda local! ⚔️**
