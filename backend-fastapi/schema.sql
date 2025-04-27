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
