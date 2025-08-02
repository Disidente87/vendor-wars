# Product Requirements Document: Vendor Wars

**Version:** 1.0  
**Date:** January 2025  
**Product Manager:** Isaac Gomez  
**Engineering Lead:** Isaac Gomez  
**Designer:** Isaac Gomez

---

## 1. Product Overview

### Executive Summary

Vendor Wars is a Farcaster Mini App that gamifies local food culture in LATAM by turning vendor purchases into territorial battles. Users support their favorite local vendors through crypto purchases, earning battle tokens and NFT achievements while participating in neighborhood-based competition that preserves and celebrates traditional food culture. MVP uses mocked votes to simulate crypto purchases, with USDC integration in Month 3.

### Unique Value Proposition

*"The only app where buying pupusas can make you a neighborhood hero"*

- **For Customers:** Transform routine food purchases into meaningful community participation with crypto rewards
- **For Vendors:** Identify loyal customers, gain new passionate customer advocates and increased foot traffic through gamified loyalty
- **For Communities:** Preserve local food culture through economic support and social engagement

### Market Positioning

Vendor Wars positions itself as the first social-first loyalty and gamification platform for local commerce in LATAM, using Farcaster as our distribution channel and Base as our economic infrastructure. Unlike delivery apps or directories, our value lies in our community, our expertise, and our on-chain social proof.

#### Direct Competitors

**1. Rappi/Uber Eats Loyalty Programs**
- *Advantages:* Established user base, payment processing, vendor relationships
- *Weaknesses:* Generic approach, no community/gaming elements

**2. Local Loyalty Apps (Yollty, Clip)**
- *Advantages:* Local market knowledge, established vendor partnerships
- *Weaknesses:* Traditional point systems, no social features

**3. WhatsApp Business + Traditional Marketing**
- *Advantages:* Universal adoption, trusted platform, zero learning curve
- *Weaknesses:* No gamification, limited analytics, manual processes

#### Differentiation Strategy

**Core Differentiators:**
1. "Battle Royale for Food" - unique gaming angle
2. Transparent, blockchain-based reputation system
3. Cross-vendor territorial competition
4. Community ownership of platform decisions
5. Cultural celebration integrated with commerce

**Sustainable Moats:**
- Network effects between vendors and customers
- Community-generated content and reviews
- Local market expertise and relationships
- Regulatory compliance for crypto payments
- Cultural authenticity and local partnerships

---

## 2. User Personas & Jobs-to-be-Done

### Persona 1: Brenda, 45 – Pupuseria Owner
- **JTBD:** Increase customer retention, attract new customers, compete with larger businesses, build lasting customer relationships, gain recognition for quality food
- **Pain Points:** Doesn't know how to compete with large chains, has a limited marketing budget

### Persona 2: Kevin, 28 – Farcaster Enthusiast
- **JTBD:** Support his favorite local business and show off his contribution online
- **Pain Points:** Few fun ways to participate in the community from his mobile phone, limited ways to involve non-Web3 friends in fun, social experiences

### Persona 3: Luis, 22 – Non-Farcaster Local
- **JTBD:** Support favorite vendors in a fun, social way, feel part of a community-driven competition
- **Pain Points:** Wants simple, rewarding ways to engage locally, traditional loyalty apps are boring and feel depersonalized

---

## 3. Functional Requirements

### MVP Features (Prioritized)

#### Priority 1: Core Features

**Vendor Map Battles**
- Dynamic map showing predefined "Zonas de Batalla" (e.g., Zona Centro, Zona Norte) with vendors competing for dominance based on vote counts
- Vendor registration via a form (name, zone, logo)
- Use GeoJSON-defined polygons for zones

**Purchase-Based Voting (Mocked)**
- Users vote for vendors via a "Purchase & Vote" button in a Frame, registering intent (no real USDC for MVP)
- Votes update zone/vendor scores and win $BATTLE tokens offchain
- Verified votes (photo attestation) earn 3x tokens (30 $BATTLE)

#### Priority 2: Social Features

**Dynamic Share Pages**
- Auto-generated casts for each vote, e.g., "@Juan voted for @pupusas_maria in Zona Centro! vendorwars.app/vote/123"

**User Profile**
- Displays stats (vote count, token balance), badges, and transaction history

#### Priority 3: Engagement Features

**Social Leaderboard**
- Weekly leaderboard of top zones/vendors, filtered by friends' activity

**FOMO Notifications**
- Social notifications, e.g., "@Tacos_Lupita needs votes in Zona Centro!"

### Hybrid Update System

**Immediate Updates (< 5 seconds)**
- User vote confirmation
- Personal token balance
- Vote counter for specific vendor
- User's personal activity feed

**Batched Updates (30-60 seconds)**
- Territory ownership calculations
- Zone-wide leaderboards
- Battle token multipliers
- Achievement unlocks

**Async Updates (5-10 minutes)**
- Global leaderboards
- Cross-zone competitions
- Weekly/monthly statistics
- NFT metadata updates

### Key User Stories

#### Customer Support Flow
**User Story:** As a customer, I want to support my favorite vendor and see immediate impact on their territory control

**Acceptance Criteria:**
- Users can select vendors from predefined battle zones
- "Purchase & Vote" button records support (no real payment in MVP)
- Territory ownership updates within 30-60 seconds of vote
- Users earn 10 $BATTLE tokens per vote (mock tokens)
- Vote history tracked per user per vendor

#### Territory Visualization
**User Story:** As a user, I want to see which vendors dominate which neighborhoods

**Acceptance Criteria:**
- Home screen displays 3-5 battle zones with current dominant vendor
- Zone detail pages show vendor leaderboards ranked by votes
- Vote counts update in real-time
- Clear visual hierarchy of the users who voted (gold/silver/bronze positioning)

#### Vendor Registration
**User Story:** As a Farcaster user, I want to register a vendor in my neighborhood so that it can start competing for territory

**Acceptance Criteria:**
- Must be authenticated with Farcaster
- Vendor creation form: name, short description, zone, category
- Vendor appears on map & leaderboard immediately after creation
- Creator becomes default admin, can transfer ownership
- Unverified vendors have limited access to rewards or customizations

#### Vendor Verification
**User Story:** As a vendor, I want to register my business and compete for territory

**Acceptance Criteria:**
- Upload 3 forms of proof: business license + location photo + social media
- Verification process takes max 48 hours
- Previous community-created profile transfers to owner
- Owner gets admin rights: edit profile, respond to reviews, access analytics
- Disputed claims handled by community voting + manual review
- False claims result in permanent ban

**Verification Proof Options:**
- Government business license/permit
- Location photo with business name visible
- Social media account (Instagram/Facebook) with consistent posting
- Receipt/invoice with business name
- Community member vouching (verified locals only)

#### Reward System
**User Story:** As a customer, I want to earn and track rewards for supporting vendors

**Acceptance Criteria:**
- Users earn 10 tokens per vote, 20 tokens if voted vendor escalates to Top 10 ranking
- Token balance displayed prominently in user profile
- Vote streaks provide bonus multipliers (starting Day 3: +1.5x on Day 3, +2x on Day 5)
- Leaderboard of top token earners

#### Purchase Verification
**User Story:** As a customer, I want to prove my real purchase at a vendor to earn bonus rewards and increase my vote credibility

**Acceptance Criteria:**
- **Photo Capture:** Users can upload photo of food/receipt during vote process
- **Geolocation Verification:** GPS confirms user is within 50m of vendor location
- **Timestamp Validation:** Photo timestamp matches vote time (±30 min tolerance)
- **Bonus Multiplier:** Verified votes earn 3x battle tokens (30 instead of 10)
- **Credibility Score:** Users build reputation through verified purchases
- **Anti-Fraud:** Duplicate photo detection and suspicious pattern flagging

#### Social Sharing
**User Story:** As a user, I want to share my vendor support and territory victories

**Acceptance Criteria:**
- Auto-generated cast templates: "Just defended @vendor_name in Zona Centro!"
- Custom share images with territory status and user stats
- One-click sharing to Farcaster feed
- Share prompts after significant actions (first vote, territory win)

### Balanced Token Economics

#### Token Earning Structure

**Base Rewards:**
- First vote per vendor per day: 10 BATTLE
- Subsequent votes same vendor: 5 BATTLE (diminishing returns)
- Voting streak bonus: +1 BATTLE per consecutive day (max +10)
- Territory defense: 20 BATTLE (when your vendor maintains #1 for 24h)
- Territory conquest: 50 BATTLE (when your vendor takes #1 from another)

**Weekly Caps:** Prevents farming, encourages consistent engagement
- Max 200 BATTLE per user per week from voting
- Max 100 BATTLE per user per week from territory bonuses

#### Token Burning Mechanisms

**Automatic Burns:**
- 2% of all earned tokens burned weekly (deflationary pressure)
- Failed territory defenses: -10 BATTLE penalty
- Reported fake votes: -50 BATTLE penalty

**Utility Burns:**
- Profile customization: 100 BATTLE
- Vendor boost (2x votes for 1 hour): 200 BATTLE
- Premium features: 500 BATTLE/month
- Achievement NFT minting: 1000 BATTLE

#### Anti-Gaming Measures

**Validation Rules:**
- Max 3 votes per vendor per user per day
- IP-based duplicate detection
- Phone number verification for high-value actions
- Community reporting system with rewards
- Machine learning fraud detection (future)

**Verification Requirements:**
- Photo proof for votes >$50 USDC equivalent
- Social verification for top 10% earners
- Manual review for suspicious patterns

### Technical Integrations

#### Required Integrations
- **Neynar SDK:** User authentication, cast publishing, social graph access
- **Farcaster:** Sign-in (MiniApp/Farcaster Auth)
- **Supabase:** Database operations, real-time subscriptions for territory updates
- **Vercel:** Hosting and serverless functions for API routes

#### Nice-to-Have Integrations
- **Coinbase Wallet:** For future real crypto transactions
- **Base:** Coinbase Smart Wallet SDK for $BATTLE minting (ERC-20)
- **IPFS/Arweave:** For decentralized NFT metadata storage
- **Push Protocol:** Enhanced notification system
- **Mapbox GL JS or MapLibre:** For dynamic map rendering

---

## 4. User Experience

### Primary User Flow

1. **DISCOVERY:** User opens Vendor Wars → Sees battle zones with current leaders
2. **AUTHENTICATION:** Connect Farcaster → Authorize Mini App → Profile created
3. **EXPLORATION:** Browse zones → View vendor leaderboards → Read vendor profiles
4. **ENGAGEMENT:** Select favorite vendor → Click "Purchase & Vote" → Earn battle tokens
5. **IMMEDIATE FEEDBACK:** Territory updates → Token balance increases → Share prompt appears
6. **SOCIAL AMPLIFICATION:** Compose cast → Share achievement → Friends discover app → Share to WhatsApp for non-users
7. **RETENTION LOOP:** Check territory status → See vendor rankings → Vote again tomorrow

### Key Wireframes (Text Format)

#### Welcome Screen
- **Header:** "Vendor Wars: Fight for Your Local Shop!"
- **Button:** "Connect with Farcaster" (Privy SIWF)
- **Image:** Animated map of CDMX zones

#### Map View
- **Top:** Mapbox map with 5 clickable zones, colored by dominant vendor
- **Bottom:** List of vendors per zone (name, logo, vote count)
- **Button:** "Vote for [Vendor]" (Frame)
- **Button:** "Verified Vote" (Photo attestation for verified purchases IRL)

#### Verified Vote
- Photo capture interface
- Geolocation permission requests
- Attestation success/failure states

#### Leaderboard Screen
- **Top:** Tabs for "All Zones" and "Friends' Activity"
- **List:** Top 5 zones/vendors with vote counts and friend contributions

#### Vote Confirmation
- **Modal:** "You voted for @pupusas_dona_maria! +10 $BATTLE"
- **Button:** "Share to Farcaster" (cast) and "Share to WhatsApp" (link)

### Friction Points to Avoid

1. **Complex Onboarding:** Single-tap Farcaster auth, skip lengthy tutorials (Privy's SWIFT)
2. **Unclear Value Prop:** Immediate token rewards + territory impact feedback
3. **Payment Complexity:** MVP uses simple voting, real payments in v2
4. **Geographic Confusion:** Clear zone boundaries, vendor location clarity
5. **Slow Map:** Cache map data with Upstash Redis and limit to 5 zones
6. **Social Pressure:** Optional sharing, never forced viral mechanics
7. **Low Vendor Adoption:** Partner with local markets for initial 10 vendors

---

## 5. Technical Architecture

### Frontend - Farcaster Mini App
- Next.js 14 (App Router) + TypeScript
- @neynar/react SDK (Farcaster integration)
- @coinbase/onchainkit (wallet + transactions)
- Mapbox GL JS (territory visualization)
- Tailwind CSS + Framer Motion (animations)
- Zustand (state management)
- React Query (data fetching)

### Backend APIs
- Next.js API Routes (serverless)
- Supabase (PostgreSQL + real-time subscriptions)
- Upstash Redis (caching + rate limiting)
- Resend (email notifications)

### Blockchain Infrastructure
- Base (Ethereum L2)
- Coinbase Smart Wallet SDK
- USDC (Circle's stablecoin)
- Custom ERC-20 ($BATTLE tokens)
- ERC-721 (achievement NFTs)
- Storage: IPFS or Filebase (para vendor info/media)

### External Services
- Mapbox API (maps + geocoding)
- Neynar API (Farcaster social graph)
- Vercel (deployment + edge functions)
- Upstash QStash (background jobs)

### Database Schema
- **Users:** id, farcaster_id, name, battle_tokens, credibility_score, verified_purchases, credibility_tier
- **Vendors:** id, name, zone, battle_score, owner, category
- **Votes:** id, user_id, vendor_id, timestamp, zone, multiplier, attestation_id, verification_status
- **Attestations:** id, user_id, vendor_id, photo_hash, gps_location, verification_confidence, created_at, status
- **Territories:** zone_id, current_owner, heat_level

### Farcaster/Base Integration Points

#### Phase 1 (MVP): Read-Only Integration
- **Neynar Authentication:** User login via Farcaster
- **Profile Data:** Username, display name, avatar
- **Vendor Profile:** Vendorname, display name, description (story), votes, ranking
- **Cast Publishing:** Share battle results to user feeds

#### Phase 2: Full Web3 Integration
- **Coinbase Smart Wallet:** USDC payment processing
- **Base Network:** $BATTLE token contracts
- **NFT Minting:** Achievement badges and territory crowns
- **Social Graph:** Friend recommendations and battle invites

### Security Considerations

#### Data Protection
- **Data Privacy:** Store minimal user data (fid, address), User FIDs stored securely, no private key handling; logos on Filebase are public
- **Authentication:** Privy's SIWF ensures secure Farcaster login
- **Vote Integrity:** Supabase triggers validate vote uniqueness (userFid + vendorId)
- **SQL injection protection** via Supabase parameterized queries
- **Input validation** on all vendor registration forms
- **Rate Limits:** Use Upstash Redis to cache Neynar API calls and prevent abuse
- **API Keys:** Manage API keys (Neynar, Vercel) securely through environment variables
- Photo storage and privacy (GDPR compliance)
- Geolocation data handling
- Photo metadata scrubbing

#### Smart Contract Security (Future)
- Multi-signature wallet for contract upgrades
- Audit requirements before mainnet deployment
- Emergency pause functionality for critical bugs
- Transparent token economics and vesting schedules

---

## 6. Success Metrics & KPIs

### Activation Metrics (Day 1-7)
- **Primary:** User completes first vote within 24 hours of signup (Target 40%)
- **Secondary:** User votes for 2+ different vendors in first week

### Engagement Metrics (Weekly)
- **Daily Active Voters:** Users who vote at least once per day
- **Vote Frequency:** Average votes per active user per week (Target: 40% users vote 3+ times per week)
- **Zone Participation:** % of zones with active competition (3+ vendors receiving votes)

### Attestation Metrics
- **Attestation adoption rate:** Target 40% by Month 6
- **Fraud detection accuracy:** Target >95%
- **Photo verification processing time:** Target <3 seconds

### Retention Metrics
- **7-Day Retention:** Users who return and vote +2 within 7 days (Target 25%)
- **30-Day Retention:** Users still voting after 30 days (Target 15%)

### Social/Viral Metrics
- **Cast Engagement:** Average likes/recasts on battle-related posts (Target 25%)
- **Organic Discovery:** New users from social referrals vs direct links
- **Invite Success:** % of shared battle results that convert to new users
- **Attestation Rate:** % of votes that include photo verification
- **Non-User Sign-Ups:** % Farcaster registrations from shared links (Target 30%)

### Economic Metrics (Future)
- **Transaction Volume:** Total USDC processed through platform (Target: $10,000+ monthly volume by Month 6)
- **Average Transaction Size:** Trending upward indicates increased engagement
- **Vendor Revenue Impact:** Measurable increase in foot traffic/sales
- **Power-up NFT sales:** Target 100 NFTs in the first month after NFT's implementation

### Product-Market Fit Thresholds

#### Month 1 (Early Traction)
- 100+ DAU
- 500+ votes
- 15+ vendors (CDMX)
- 15% D7 retention
- 20% cast engagement rate

#### Month 3
- 300+ DAU
- 2,000+ votes
- 50+ vendors (+3 cities)
- 20% D7 retention
- 30% cast engagement rate
- 10% weekly organic growth

#### Month 6 (Strong PMF)
- 900+ DAU
- 5,000+ votes
- 100+ vendors (+7 cities)
- 25% D7 retention
- 35% cast engagement rate
- 15% weekly organic growth

---

## 7. Go-to-Market Strategy

### Launch Strategy

#### Phase 1: Stealth Launch (Week 1-2)
- **Audience:** 50 Farcaster power users in CDMX
- **Goal:** Core mechanic validation and bug identification
- **Channels:** Direct DMs to key Farcaster community members
- **Success Criteria:** 80% of invited users complete first vote

#### Phase 2: Community Launch (Week 3-4)
- **Audience:** 500 LATAM Farcaster users + local food enthusiasts
- **Goal:** Social proof and initial viral loops
- **Channels:**
  - Farcaster channel partnerships (/food, /cdmx, /crypto-latam)
  - Local food blogger collaborations
  - University crypto club presentations
- **Tactic:** Launch a Frame in /latam /food /cdmx: "Vote for your favorite vendor to defend your barrio!" Offer a "Pionero" NFT for the first 50 votes
- **Success Criteria:** 200+ active users, 15+ registered vendors

#### Phase 3: Regional Expansion (Month 2-3)
- **Audience:** 2,000+ users across LATAM
- **Goal:** Multi-city competition and cross-border rivalry
- **Channels:**
  - Local media coverage (food + tech angles)
  - Vendor partnership program
  - Community event sponsorships
- **Success Criteria:** 1,000+ active users, 50+ vendors, 3+ cities

### Distribution Channels

#### Primary Channels
1. **Farcaster Native Distribution**
   - Featured in trending Mini Apps
   - Community channel partnerships
   - Power user advocacy program

2. **Local Food Community**
   - Food blogger partnerships
   - Culinary school presentations
   - Traditional media (radio/newspaper food sections)

#### Secondary Channels
- Social media presence (Twitter, Instagram, TikTok)
- Local business association partnerships
- Cultural festival sponsorships
- Tourism board collaborations

### Content Marketing Strategy

#### Content Pillars
1. **Local Food Culture:** Stories about traditional vendors and family recipes
2. **Community Impact:** How app supports small business and preserves culture
3. **Epic Battles:** Dramatic territory changes and vendor comebacks
4. **Local Heroes:** Community champions and vendor supporters
5. **Verified Purchase:** Attestations for IRL purchases
6. **User-Generated Content:** Encourage users to share vote casts, offering bonus $BATTLE for 5+ likes/recasts
7. **Weekly incentives:** $BATTLE for top users

#### Content Calendar
- **Daily:** Battle updates and territory shift announcements, Verified vote of the day
- **Weekly:** Vendor spotlights and community hero features, Weekly WhatsApp share prompts with $BATTLE incentives for Farcaster sign-ups
- **Monthly:** Territory battle recaps and cultural deep dives
- **Quarterly:** Impact reports on vendor support and community growth

---

## 8. Monetization Strategy

### Revenue Models

#### Primary Revenue Stream: Transaction Fees (After Month 3)
- **Model:** 2% fee on USDC purchases through platform
- **Rationale:** Sustainable model that scales with platform success
- **Vendor Incentive:** Significantly lower than credit card fees (3-4%)

#### Phase 1: MVP Monetization (Month 1-3)

**Vendor Pricing:**
- **Basic Premium:** $8/month (enhanced profile + analytics)
- **Pro Premium:** $15/month (includes payment processing)
- **Enterprise:** $25/month (multi-location + advanced features)

### Secondary Revenue Streams

1. **Achievement NFTs** ($0.5-5 each)

2. **Premium Vendor Features** ($8/month)
   - Enhanced profile visibility, Checkmark
   - Custom battle zone positioning
   - Advanced analytics dashboard
   - Priority customer support

3. **Battle Pass Subscriptions** ($3/month)
   - 2x battle token multipliers
   - Exclusive NFT drops
   - Early access to new features
   - Premium territory statistics

4. **Sponsored Battle Events** ($25-100/event)
   - **Event Pricing:**
     - Local event sponsorship: $25-100
     - Festival partnerships: $100-300
     - Municipal collaborations: $200-500

5. **Sponsored Content** ($50-200/post)
   - Vendor spotlights in app
   - Featured placement during peak hours
   - Social media cross-promotion

### Pricing Strategy

#### Freemium Model
- **Free Tier:** Basic voting, leaderboards, social sharing
- **Premium Tier:** Enhanced rewards, exclusive features, advanced stats
- **Vendor Tier:** Business tools, marketing features, analytics

#### Geographic Pricing
- Adjusted pricing for local purchasing power
- **CDMX:** Base pricing
- **LATAM:** +/-20% (based on higher/lower purchasing power)

### Financial Projections (Conservative)

#### Year 1 Targets
- **Users:** 5,000 active monthly users
- **Vendors:** 200 registered vendors
- **Transaction Volume:** $25,000/month by Month 12
- **Revenue:** $500/month transaction fees + $1,000/month subscriptions

#### Year 2 Targets
- **Users:** 20,000 active monthly users
- **Vendors:** 800 registered vendors across 10 cities
- **Transaction Volume:** $100,000/month
- **Revenue:** $2,000/month transaction fees + $4,000/month subscriptions

---

## 9. Technical Milestones

### Phase 1: MVP Foundation (Week 1-4)

#### Sprint 1: Core System (Week 1-2)
**Deliverables:**
- User authentication via Neynar
- Vendor registration system
- Basic voting mechanism
- Territory calculation logic

**Success Criteria:**
- 50+ test votes processed successfully
- Territory updates within 60 seconds
- Zero critical bugs in voting flow

#### Sprint 2: Social Features (Week 3-4)
**Deliverables:**
- Offchain Battle token reward system
- Leaderboards and rankings
- User Profile with basic stats
- Social sharing integration
- Mobile-responsive design

**Success Criteria:**
- Auto-generated casts posting correctly
- Leaderboards updating in real-time
- Mobile experience matches desktop

### Phase 2: Enhanced Features (Month 2-3)

#### Sprint 3: Gamification (Month 2)
**Deliverables:**
- Territory battle events
- Achievement system
- Verified Vote (Attestation) with rewards multiplier
- User profile enhancements
- Advanced analytics
- $BATTLE Tokens on-chain

**Success Criteria:**
- First community battle event with 20+ participants
- First Verified Vote
- User retention improves by 15%
- Analytics dashboard providing actionable insights
- Successful migration of BATTLE tokens onchain

#### Sprint 4: Monetization Prep (Month 3)
**Deliverables:**
- USDC payment integration (this payment counts as verified vote)
- Vendor premium features
- Subscription system foundation
- Smart contract development

**Success Criteria:**
- First real USDC transaction processed
- 5+ vendors upgrade to premium
- Smart contracts pass security audit

### Phase 3: Scale & Optimize (Month 4-6)

#### Sprint 5: Multi-City Expansion (Month 4-5)
**Deliverables:**
- Geographic scaling infrastructure
- City-specific leaderboards
- Regional competition features
- Performance optimizations

**Success Criteria:**
- Support for 3+ cities simultaneously
- <2 second average load times
- Cross-city battles generating engagement

#### Sprint 6: Advanced Features (Month 6)
**Deliverables:**
- NFT achievement system
- Advanced social features
- Vendor analytics dashboard
- Mobile app consideration
- Launch of standalone web app

**Success Criteria:**
- 100+ NFTs minted organically
- Vendor dashboard adoption >50%
- Mobile web experience rated 4.5+/5
- First interactions on web app

---

## 10. Risk Assessment

### Technical Risks

#### High Priority Risks

**Risk:** Farcaster API Rate Limiting During Viral Growth
- **Impact:** Auto-cast failures, user frustration, broken viral loops
- **Probability:** Medium (40%)
- **Mitigation:**
  - Implement exponential backoff and retry logic
  - Queue system for cast publishing during peak usage
  - Graceful degradation to manual sharing options
  - Rate limiting monitoring and alerting

**Risk:** Real-Time Territory Update Performance at Scale
- **Impact:** Delayed leaderboard updates, user confusion, engagement drop
- **Probability:** Medium (35%)
- **Mitigation:**
  - Batch territory calculations every 30-60 seconds vs real-time
  - Implement Redis caching layer for frequently accessed data
  - Database query optimization and indexing strategy
  - Load testing before major user acquisition campaigns

**Risk:** Smart Contract Security Vulnerabilities
- **Impact:** Fund loss, reputation damage, legal liability
- **Probability:** Low (15%)
- **Mitigation:**
  - Comprehensive security audit before mainnet deployment
  - Multi-signature wallet controls for contract upgrades
  - Start with minimal contract functionality, add complexity iteratively
  - Emergency pause functionality built into all contracts

#### Medium Priority Risks

**Risk:** Mobile Performance on Low-End Devices
- **Impact:** Poor user experience, high bounce rates, limited market penetration
- **Probability:** Medium (30%)
- **Mitigation:**
  - Progressive web app approach with offline capabilities
  - Image optimization and lazy loading strategies
  - Performance budgets and monitoring
  - Testing matrix including budget Android devices

### Market Risks

#### High Priority Risks

**Risk:** Vendor Adoption Slower Than Expected
- **Impact:** Limited battle zones, reduced user engagement, weak network effects
- **Probability:** High (60%)
- **Mitigation:**
  - Direct vendor outreach and education program
  - Free onboarding and setup assistance
  - Clear ROI demonstration through pilot programs
  - Partnership with local business associations

**Risk:** Regulatory Changes Affecting Crypto Payments
- **Impact:** Revenue model disruption, feature limitations, market exit
- **Probability:** Medium (25%)
- **Mitigation:**
  - Legal review of regulations in target markets
  - Alternative payment method integration (local banking)
  - Compliance monitoring and government relationship building
  - Revenue diversification beyond transaction fees

#### Medium Priority Risks

**Risk:** Competitor Launch with Superior Resources
- **Impact:** Market share loss, user acquisition costs increase
- **Probability:** Medium (40%)
- **Mitigation:**
  - Focus on community-first approach and cultural authenticity
  - Build strong vendor relationships and exclusive partnerships
  - Rapid feature development and user feedback incorporation
  - Local market knowledge as competitive moat

**Risk:** Economic Downturn Reducing Discretionary Spending
- **Impact:** Lower transaction volumes, vendor churn, revenue decline
- **Probability:** Medium (30%)
- **Mitigation:**
  - Flexible pricing models based on economic conditions
  - Focus on essential food purchases vs luxury dining
  - Community mutual aid features during economic hardship
  - Government and NGO partnership opportunities

### Business Model Risks

**Risk:** Token Economy Inflation or Devaluation
- **Impact:** Reduced user motivation, economic imbalance, platform abandonment
- **Probability:** Medium (35%)
- **Mitigation:**
  - Careful token economics design with deflationary mechanisms
  - Regular economic model review and adjustment capabilities
  - Multiple utility sources for token value beyond speculation
  - Community governance involvement in economic decisions

**Risk:** Platform Dependency on Farcaster Growth
- **Impact:** Limited user acquisition, platform risk, distribution constraints
- **Probability:** High (50%)
- **Mitigation:**
  - Develop standalone web application as distribution alternative
  - Multi-platform social integration strategy
  - Direct user acquisition channels independent of Farcaster
  - Export functionality to reduce user lock-in concerns

---

## Success Criteria by Phase

### MVP Success (Month 1)
- 300+ registered users completing onboarding
- 25+ active vendors across 3 zones
- 1,000+ votes processed successfully
- 25% 7-day retention rate
- Zero critical security vulnerabilities

### Growth Success (Month 3)
- 1,500+ monthly active users
- 75+ vendors across CDMX
- 35% 7-day retention rate
- $5,000+ monthly transaction volume
- 15%+ weekly organic growth rate

### Scale Success (Month 6)
- 5,000+ monthly active users
- 200+ vendors across 3+ cities
- 45% 7-day retention rate
- $20,000+ monthly transaction volume
- Break-even on operational costs

---

*This PRD serves as the foundational document for Vendor Wars development and will be updated quarterly based on user feedback, market conditions, and technical learnings.*