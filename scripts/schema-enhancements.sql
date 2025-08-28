-- Database Schema Enhancements for HydraPool
-- Run these to enhance the existing schema for better friends and splits functionality

-- 1. Enhance Users table with profile fields
ALTER TABLE users 
ADD COLUMN display_name VARCHAR(255),
ADD COLUMN bio TEXT,
ADD COLUMN profile_picture_url TEXT,
ADD COLUMN status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 2. Enhance Friends table with request status
ALTER TABLE friends 
ADD COLUMN status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
ADD COLUMN requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN accepted_at TIMESTAMP WITH TIME ZONE;

-- Add trigger to set accepted_at when status changes to accepted
CREATE OR REPLACE FUNCTION set_friend_accepted_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        NEW.accepted_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_friends_accepted_at 
    BEFORE UPDATE ON friends 
    FOR EACH ROW 
    EXECUTE FUNCTION set_friend_accepted_at();

-- 3. Enhance Splits table with more details
ALTER TABLE splits 
ADD COLUMN description TEXT,
ADD COLUMN status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
ADD COLUMN currency VARCHAR(10) DEFAULT 'USDC',
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE TRIGGER update_splits_updated_at 
    BEFORE UPDATE ON splits 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Enhance Split_participants table with payment tracking
ALTER TABLE split_participants 
ADD COLUMN amount_owed DECIMAL(10,2),
ADD COLUMN paid_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN payment_transaction_id VARCHAR(255),
ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'confirmed', 'failed'));

-- Add trigger to set paid_at when payment is confirmed
CREATE OR REPLACE FUNCTION set_payment_confirmed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_status = 'confirmed' AND OLD.payment_status != 'confirmed' THEN
        NEW.paid_at = NOW();
        NEW.paid = TRUE;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_split_participants_paid_at 
    BEFORE UPDATE ON split_participants 
    FOR EACH ROW 
    EXECUTE FUNCTION set_payment_confirmed_at();

-- 5. Add additional indexes for better performance
CREATE INDEX idx_users_display_name ON users(display_name);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_friends_status ON friends(status);
CREATE INDEX idx_friends_requested_at ON friends(requested_at);
CREATE INDEX idx_splits_status ON splits(status);
CREATE INDEX idx_splits_updated_at ON splits(updated_at);
CREATE INDEX idx_split_participants_payment_status ON split_participants(payment_status);
CREATE INDEX idx_split_participants_amount_owed ON split_participants(amount_owed);

-- 6. Update existing friends to be 'accepted' (since current ones are implicit friendships)
UPDATE friends SET status = 'accepted', accepted_at = created_at WHERE status = 'pending';

-- 7. Enhanced RLS policies for new fields

-- Friends: Only show accepted friends in general friend lists
DROP POLICY IF EXISTS "Users can read their friends" ON friends;
CREATE POLICY "Users can read their friends" ON friends FOR SELECT USING (
  (auth.uid()::text = user_id::text OR auth.uid()::text = friend_id::text) AND status = 'accepted'
);

-- Friends: Allow users to see their own sent/received friend requests
CREATE POLICY "Users can read their friend requests" ON friends FOR SELECT USING (
  auth.uid()::text = user_id::text OR auth.uid()::text = friend_id::text
);

-- Users: Allow reading profile fields for search and display
DROP POLICY IF EXISTS "Users can read all users" ON users;
CREATE POLICY "Users can read user profiles" ON users FOR SELECT USING (
  status = 'active'
);

-- Split participants: Allow reading payment details for involved users
CREATE POLICY "Users can read payment details" ON split_participants FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM splits s 
    WHERE s.id = split_participants.split_id AND 
    (s.creator_id::text = auth.uid()::text OR split_participants.user_id::text = auth.uid()::text)
  )
);
