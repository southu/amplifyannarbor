-- Amplify Ann Arbor Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  location TEXT NOT NULL,
  description TEXT,
  ticket_price DECIMAL(10, 2),
  image_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_id UUID REFERENCES auth.users(id),
  published_at TIMESTAMP WITH TIME ZONE,
  featured_image TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sponsors Table
CREATE TABLE IF NOT EXISTS sponsors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('title', 'supporting')),
  logo_url TEXT,
  description TEXT,
  website_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photo Gallery Table
CREATE TABLE IF NOT EXISTS photo_gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  photographer TEXT,
  upload_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donations Table
CREATE TABLE IF NOT EXISTS donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  stripe_payment_id TEXT UNIQUE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  donation_id UUID REFERENCES donations(id) ON DELETE SET NULL,
  qr_code TEXT,
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Messages Table (optional)
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_sponsors_tier ON sponsors(tier);
CREATE INDEX IF NOT EXISTS idx_sponsors_display_order ON sponsors(display_order);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_event_id ON donations(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_photo_gallery_event_id ON photo_gallery(event_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);

-- Row Level Security Policies

-- Events: Public read, authenticated write
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events are viewable by everyone" ON events FOR SELECT USING (true);
CREATE POLICY "Events are editable by authenticated users" ON events FOR ALL USING (auth.role() = 'authenticated');

-- Blog Posts: Public read for published, authenticated write
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published posts are viewable by everyone" ON blog_posts FOR SELECT USING (status = 'published' OR auth.role() = 'authenticated');
CREATE POLICY "Posts are editable by authenticated users" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');

-- Sponsors: Public read, authenticated write
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sponsors are viewable by everyone" ON sponsors FOR SELECT USING (true);
CREATE POLICY "Sponsors are editable by authenticated users" ON sponsors FOR ALL USING (auth.role() = 'authenticated');

-- Photo Gallery: Public read, authenticated write
ALTER TABLE photo_gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gallery is viewable by everyone" ON photo_gallery FOR SELECT USING (true);
CREATE POLICY "Gallery is editable by authenticated users" ON photo_gallery FOR ALL USING (auth.role() = 'authenticated');

-- Donations: Authenticated users can view and create
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Donations are viewable by authenticated users" ON donations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Donations can be created by anyone" ON donations FOR INSERT WITH CHECK (true);

-- Tickets: Authenticated users can view, anyone can create via webhook
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tickets are viewable by authenticated users" ON tickets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Tickets can be created" ON tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Tickets can be updated by authenticated users" ON tickets FOR UPDATE USING (auth.role() = 'authenticated');

-- Contact Messages: Authenticated users only
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Messages can be created by anyone" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Messages are viewable by authenticated users" ON contact_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Messages can be updated by authenticated users" ON contact_messages FOR UPDATE USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sponsors_updated_at BEFORE UPDATE ON sponsors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage Buckets (run these in Storage section of Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('sponsor-logos', 'sponsor-logos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('event-photos', 'event-photos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);

-- Sample data for testing (optional)
-- INSERT INTO events (title, date, time, location, description, status)
-- VALUES ('Amplify Ann Arbor 2026', '2026-07-30', '18:30', 'The Blind Pig, Ann Arbor', 'Annual charity concert benefiting Ann Arbor Meals on Wheels.', 'published');

-- INSERT INTO sponsors (name, tier, description, website_url, display_order)
-- VALUES ('Ready Signal', 'title', 'AI-powered external data enrichment and forecasting.', 'https://readysignal.com', 1);

