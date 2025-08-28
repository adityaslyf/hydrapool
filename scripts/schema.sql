-- HydraPool Database Schema for Supabase
-- Create tables based on our Prisma schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  wallet VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Friends table (many-to-many relationship)
CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Splits table
CREATE TABLE splits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  per_share DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Split participants table
CREATE TABLE split_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  split_id UUID NOT NULL REFERENCES splits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  paid BOOLEAN DEFAULT FALSE,
  UNIQUE(split_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_wallet ON users(wallet);
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_friends_friend_id ON friends(friend_id);
CREATE INDEX idx_splits_creator_id ON splits(creator_id);
CREATE INDEX idx_split_participants_split_id ON split_participants(split_id);
CREATE INDEX idx_split_participants_user_id ON split_participants(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_participants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies - can be refined later)
-- Users can read all users (for friend search)
CREATE POLICY "Users can read all users" ON users FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Friends policies
CREATE POLICY "Users can read their friends" ON friends FOR SELECT USING (
  auth.uid()::text = user_id::text OR auth.uid()::text = friend_id::text
);

CREATE POLICY "Users can manage their friends" ON friends FOR ALL USING (
  auth.uid()::text = user_id::text
);

-- Splits policies
CREATE POLICY "Users can read splits they're involved in" ON splits FOR SELECT USING (
  auth.uid()::text = creator_id::text OR 
  EXISTS (
    SELECT 1 FROM split_participants sp 
    WHERE sp.split_id = splits.id AND sp.user_id::text = auth.uid()::text
  )
);

CREATE POLICY "Users can create splits" ON splits FOR INSERT WITH CHECK (
  auth.uid()::text = creator_id::text
);

-- Split participants policies
CREATE POLICY "Users can read split participants for their splits" ON split_participants FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM splits s 
    WHERE s.id = split_participants.split_id AND 
    (s.creator_id::text = auth.uid()::text OR split_participants.user_id::text = auth.uid()::text)
  )
);

CREATE POLICY "Split creators can manage participants" ON split_participants FOR ALL USING (
  EXISTS (
    SELECT 1 FROM splits s 
    WHERE s.id = split_participants.split_id AND s.creator_id::text = auth.uid()::text
  )
);

CREATE POLICY "Users can update their own payment status" ON split_participants FOR UPDATE USING (
  auth.uid()::text = user_id::text
) WITH CHECK (
  auth.uid()::text = user_id::text
);
