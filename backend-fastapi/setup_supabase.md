# Supabase Setup Guide for BonsaiWay

## Authentication Setup

1. Go to the Supabase dashboard: https://supabase.com/dashboard
2. Select your BonsaiWay project
3. Navigate to Authentication > Providers
4. Enable Email/Password authentication
5. Configure any OAuth providers you need (Google, GitHub, etc.)

## Database Tables Setup

1. Go to the SQL Editor in your Supabase dashboard
2. Create a new query and paste the following SQL:

```sql
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create bonsais table
CREATE TABLE IF NOT EXISTS bonsais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create bonsai_images table
CREATE TABLE IF NOT EXISTS bonsai_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bonsai_id UUID REFERENCES bonsais(id) ON DELETE CASCADE,
    image_url VARCHAR(512) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create ai_insights table
CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bonsai_id UUID REFERENCES bonsais(id) ON DELETE CASCADE,
    user_question TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Set up Row Level Security (RLS) policies
ALTER TABLE bonsais ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonsai_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- Create policies for bonsais table
CREATE POLICY "Users can view their own bonsais" 
    ON bonsais FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bonsais" 
    ON bonsais FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bonsais" 
    ON bonsais FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bonsais" 
    ON bonsais FOR DELETE 
    USING (auth.uid() = user_id);

-- Create policies for bonsai_images table
CREATE POLICY "Users can view images of their bonsais" 
    ON bonsai_images FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM bonsais 
        WHERE bonsais.id = bonsai_images.bonsai_id 
        AND bonsais.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert images for their bonsais" 
    ON bonsai_images FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM bonsais 
        WHERE bonsais.id = bonsai_images.bonsai_id 
        AND bonsais.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete images of their bonsais" 
    ON bonsai_images FOR DELETE 
    USING (EXISTS (
        SELECT 1 FROM bonsais 
        WHERE bonsais.id = bonsai_images.bonsai_id 
        AND bonsais.user_id = auth.uid()
    ));

-- Create policies for ai_insights table
CREATE POLICY "Users can view insights for their bonsais" 
    ON ai_insights FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM bonsais 
        WHERE bonsais.id = ai_insights.bonsai_id 
        AND bonsais.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert insights for their bonsais" 
    ON ai_insights FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM bonsais 
        WHERE bonsais.id = ai_insights.bonsai_id 
        AND bonsais.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete insights for their bonsais" 
    ON ai_insights FOR DELETE 
    USING (EXISTS (
        SELECT 1 FROM bonsais 
        WHERE bonsais.id = ai_insights.bonsai_id 
        AND bonsais.user_id = auth.uid()
    ));
```

3. Click "Run" to execute the SQL and create the tables with proper security policies

## Storage Setup

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `bonsai-images`
3. Configure the bucket:
   - Set Public Bucket to "Enabled" (allows public reads)
   - Set CORS policy to allow requests from your frontend domain

4. Set up RLS policies for the storage bucket:
   - Go to the SQL Editor
   - Create a new query and paste the following SQL:

```sql
-- Create policy to allow public reads for bonsai-images bucket
CREATE POLICY "Public Access for bonsai-images" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'bonsai-images');

-- Create policy to allow authenticated users to upload to bonsai-images bucket
CREATE POLICY "Authenticated users can upload to bonsai-images" 
    ON storage.objects FOR INSERT 
    WITH CHECK (
        bucket_id = 'bonsai-images' 
        AND auth.role() = 'authenticated'
    );

-- Create policy to allow users to update their own objects
CREATE POLICY "Users can update their own objects in bonsai-images" 
    ON storage.objects FOR UPDATE 
    USING (
        bucket_id = 'bonsai-images' 
        AND auth.uid() = owner
    );

-- Create policy to allow users to delete their own objects
CREATE POLICY "Users can delete their own objects in bonsai-images" 
    ON storage.objects FOR DELETE 
    USING (
        bucket_id = 'bonsai-images' 
        AND auth.uid() = owner
    );
```

5. Click "Run" to execute the SQL and set up the storage policies

## Verify Setup

1. Go to Table Editor to verify that your tables have been created
2. Check Storage to verify that your bucket has been created
3. Test authentication by creating a test user

## Update Environment Variables

Update your backend and frontend environment variables with your Supabase credentials:

### Backend (.env file)
```
SUPABASE_URL=https://rtqkglqmfnllmawduzyr.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

### Frontend (.env.local file)
```
NEXT_PUBLIC_SUPABASE_URL=https://rtqkglqmfnllmawduzyr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Replace `your-supabase-anon-key` with the actual anon key from your Supabase project settings.
