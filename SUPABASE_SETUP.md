# 🗄️ Supabase Setup Guide

## 📋 Overview

Este documento te guía a través de la configuración de Supabase para Vendor Wars, incluyendo la creación del proyecto, configuración de la base de datos y migración de datos.

## 🚀 Step 1: Create Supabase Project

1. **Go to [Supabase](https://supabase.com)** and sign up/login
2. **Create a new project**:
   - Click "New Project"
   - Choose your organization
   - Enter project name: `vendor-wars`
   - Enter database password (save it!)
   - Choose region closest to your users
   - Click "Create new project"

## 🔧 Step 2: Get Project Credentials

1. **Go to Project Settings** → **API**
2. **Copy the following values**:
   - Project URL
   - Anon/Public Key

## ⚙️ Step 3: Configure Environment Variables

1. **Create `.env.local` file** in your project root:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Farcaster Configuration (for future use)
NEXT_PUBLIC_FARCASTER_HUB_URL=https://hub.farcaster.standardcrypto.vc
NEXT_PUBLIC_FARCASTER_NETWORK=mainnet

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. **Replace the placeholder values** with your actual Supabase credentials

## 🗃️ Step 4: Create Database Schema

1. **Go to SQL Editor** in your Supabase dashboard
2. **Copy and paste the contents** of `supabase/schema.sql`
3. **Run the SQL script** to create all tables, indexes, and policies

## 📊 Step 5: Migrate Sample Data

1. **Install dependencies** (if not already done):
```bash
npm install
```

2. **Run the migration script**:
```bash
npx tsx scripts/migrate-to-supabase.ts
```

## ✅ Step 6: Verify Setup

1. **Check your tables** in Supabase Dashboard → **Table Editor**
2. **Verify data** was inserted correctly
3. **Test the connection** by running the app:
```bash
npm run dev
```

## 🔐 Step 7: Configure Authentication (Optional)

For future Farcaster integration:

1. **Go to Authentication** → **Settings**
2. **Configure custom auth** if needed
3. **Set up RLS policies** (already included in schema)

## 📁 Project Structure

```
vendor-wars/
├── src/
│   ├── lib/
│   │   └── supabase.ts          # Supabase client configuration
│   └── services/
│       └── vendors.ts           # Updated to use Supabase
├── supabase/
│   └── schema.sql              # Database schema
├── scripts/
│   └── migrate-to-supabase.ts  # Data migration script
└── env.example                 # Environment variables template
```

## 🗂️ Database Tables

### Core Tables
- **`users`** - Farcaster user profiles
- **`vendors`** - Food vendor information
- **`zones`** - Battle zone territories
- **`battles`** - Vendor battles/competitions
- **`votes`** - User votes on battles
- **`attestations`** - Verified vote proofs
- **`verification_proofs`** - Vendor verification documents

### Key Features
- ✅ **Row Level Security (RLS)** enabled
- ✅ **Real-time subscriptions** configured
- ✅ **Automatic timestamps** with triggers
- ✅ **Foreign key constraints** for data integrity
- ✅ **Indexes** for optimal performance

## 🔄 Real-time Features

The database is configured for real-time updates:

```typescript
// Subscribe to vendor updates
const subscription = supabase
  .channel('vendor-updates')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'vendors' },
    (payload) => {
      console.log('Vendor updated:', payload)
    }
  )
  .subscribe()
```

## 🚨 Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Check your `.env.local` file exists
   - Verify variable names are correct
   - Restart your development server

2. **"Permission denied" errors**
   - Check RLS policies in Supabase dashboard
   - Verify user authentication status
   - Check table permissions

3. **"Foreign key constraint" errors**
   - Ensure data is inserted in correct order (users → zones → vendors)
   - Check that referenced IDs exist

4. **"Connection timeout"**
   - Verify your Supabase URL is correct
   - Check your internet connection
   - Try refreshing the page

### Getting Help

- 📖 [Supabase Documentation](https://supabase.com/docs)
- 💬 [Supabase Discord](https://discord.supabase.com)
- 🐛 [GitHub Issues](https://github.com/Disidente87/vendor-wars/issues)

## 🎯 Next Steps

After successful setup:

1. **Update services** to use Supabase instead of mock data
2. **Implement real-time features** for live updates
3. **Add authentication** for Farcaster users
4. **Test all CRUD operations** thoroughly
5. **Deploy to production** with proper environment variables

---

**Happy coding! 🚀** 