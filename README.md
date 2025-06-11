# Trading Journal - Cloud-Enabled

A comprehensive trading journal application with cloud storage and multi-device synchronization.

## Features

- **Cloud Storage**: All data is securely stored in Supabase
- **Multi-device Sync**: Access your data from any device
- **User Authentication**: Secure email/password authentication
- **Trade Management**: Track trades, P&L, and performance
- **Portfolio Analytics**: Comprehensive trading analytics
- **Goal Setting**: Set and track trading goals
- **Asset Management**: Manage your trading assets
- **Risk Management**: Built-in risk management tools

## Setup Instructions

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 2. Database Setup

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Run the migration to create all necessary tables and security policies

### 3. Authentication Setup

1. In Supabase dashboard, go to Authentication > Settings
2. Configure your site URL (e.g., `http://localhost:5173` for development)
3. Disable email confirmations for development (optional)
4. Configure any additional auth providers if needed

### 4. Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Database Schema

The application uses the following main tables:

- **trades**: Store all trading data
- **assets**: Manage trading assets
- **goals**: Track trading goals
- **portfolio_settings**: Portfolio configuration
- **transactions**: Deposits and withdrawals
- **user_settings**: User preferences

All tables include Row Level Security (RLS) to ensure users can only access their own data.

## Security Features

- **Row Level Security**: Database-level security ensuring data isolation
- **Authentication**: Secure email/password authentication via Supabase Auth
- **Data Encryption**: All data encrypted in transit and at rest
- **Session Management**: Automatic session handling and refresh

## Migration from Local Storage

If you have existing data in local storage, you can export it from the old version and manually import key data into the new cloud-based system.

## Deployment

The application can be deployed to any static hosting service:

1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Update your Supabase site URL to match your production domain

## Support

For issues or questions, please check the documentation or create an issue in the repository.