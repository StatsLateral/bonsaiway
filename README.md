# BonsaiWay

A platform for bonsai enthusiasts and practitioners.

## Description

BonsaiWay is a platform dedicated to the art and practice of bonsai cultivation, built with Next.js and Supabase.

## Getting Started

### Prerequisites

- Node.js 14.x or later
- npm or yarn
- A Supabase account and project

### Installation

1. Clone the repository
   ```
   git clone https://github.com/StatsLateral/bonsaiway.git
   cd bonsaiway
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with your Supabase credentials
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Start the development server
   ```
   npm run dev
   ```

### Connecting to Supabase

This project uses Supabase for backend services including:
- Authentication (email/password and OAuth)
- Database for storing bonsai data
- Storage for images

To connect to your Supabase project:
1. Log in to your Supabase dashboard
2. Go to Project Settings > API
3. Copy the URL and anon/public key
4. Add them to your `.env.local` file

## License

This project is licensed under the MIT License - see the LICENSE file for details.
