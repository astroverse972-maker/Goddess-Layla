-- ====================================================================
-- SUPABASE COMPLETE DATABASE REBUILD SCHEMA
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- This drops old tables cleanly and rebuilds the exact required tables.
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DROP OLD TABLES CLEANLY (Clean Reset)
DROP TABLE IF EXISTS public.content_submissions CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;
DROP TABLE IF EXISTS public.passcode_audit_logs CASCADE;
DROP TABLE IF EXISTS public.soft_deleted_videos CASCADE;
DROP TABLE IF EXISTS public.creator_profile CASCADE;
DROP TABLE IF EXISTS public.payment_settings CASCADE;

-- ====================================================================
-- TABLE 1: CONTENT SUBMISSIONS (Google Drive Links, Videos & Metadata)
-- Stores uploaded content with video links, thumbnails, custom text categories,
-- pricing, description, tags, and timestamps.
-- ====================================================================
CREATE TABLE public.content_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  price TEXT NOT NULL DEFAULT '25.00',
  google_drive_link TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  category TEXT DEFAULT 'Goddess Exclusive', -- Free text category (self-written)
  name TEXT DEFAULT 'Goddess Layla',
  description TEXT,
  tags TEXT[] DEFAULT ARRAY['exclusive', 'goddesslayla'],
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.content_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on content_submissions"
  ON public.content_submissions FOR SELECT USING (true);

CREATE POLICY "Allow public insert on content_submissions"
  ON public.content_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on content_submissions"
  ON public.content_submissions FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on content_submissions"
  ON public.content_submissions FOR DELETE USING (true);


-- ====================================================================
-- TABLE 2: SITE SETTINGS (Dynamic App & Site Customizations)
-- Saves any site configuration changes made by the creator (live stream status,
-- custom media list, admin passcode, creator profile, payment methods).
-- ====================================================================
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on site_settings"
  ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Allow public write on site_settings"
  ON public.site_settings FOR ALL USING (true) WITH CHECK (true);


-- ====================================================================
-- TABLE 3: PASSCODE SECURITY & AUDIT LOGS (Security Verification)
-- Stores history of old passwords, new passwords, verification status,
-- and exact timestamps whenever passcode security verification is passed.
-- ====================================================================
CREATE TABLE public.passcode_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  old_passcode TEXT,
  new_passcode TEXT NOT NULL,
  verified BOOLEAN DEFAULT true,
  action TEXT DEFAULT 'PASSCODE_CHANGED',
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.passcode_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on passcode_audit_logs"
  ON public.passcode_audit_logs FOR SELECT USING (true);

CREATE POLICY "Allow public insert on passcode_audit_logs"
  ON public.passcode_audit_logs FOR INSERT WITH CHECK (true);


-- ====================================================================
-- TABLE 4: SOFT DELETED VIDEOS (Never Delete From Backend)
-- When a video is hidden or removed from the website interface, its ID
-- is logged here. The website stops displaying it, but the video record
-- is NEVER permanently deleted from the database backend.
-- ====================================================================
CREATE TABLE public.soft_deleted_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id TEXT UNIQUE NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.soft_deleted_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on soft_deleted_videos"
  ON public.soft_deleted_videos FOR SELECT USING (true);

CREATE POLICY "Allow public insert on soft_deleted_videos"
  ON public.soft_deleted_videos FOR INSERT WITH CHECK (true);


-- ====================================================================
-- TABLE 5 & 6: CREATOR PROFILE & PAYMENT SETTINGS
-- Dedicated structured tables for profile bio/gallery and payment links.
-- ====================================================================
CREATE TABLE public.creator_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT DEFAULT 'Goddess Layla',
  bio TEXT,
  gallery TEXT[],
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.creator_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on creator_profile"
  ON public.creator_profile FOR ALL USING (true) WITH CHECK (true);


CREATE TABLE public.payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipfunder TEXT,
  throne TEXT,
  telegram TEXT,
  x TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on payment_settings"
  ON public.payment_settings FOR ALL USING (true) WITH CHECK (true);


-- ====================================================================
-- INITIAL SEED DATA
-- Default passcode (1234), profile, and payment settings.
-- ====================================================================
INSERT INTO public.site_settings (key, value)
VALUES 
  ('admin_passcode', '"1234"'::jsonb),
  ('live_stream_status', '{"isLive": false, "title": "GODDESS LAYLA LIVE EXCLUSIVE", "description": "Exclusive live private session", "price": "50.00", "streamUrl": "https://i.imgur.com/m0CSW44.mp4"}'::jsonb),
  ('creator_profile', '{"name": "Goddess Layla", "bio": "Welcome to my official VIP sanctuary.", "gallery": ["https://i.imgur.com/STRpELi.jpg", "https://i.imgur.com/bjTQJK7.jpg", "https://i.imgur.com/tzmLquQ.jpg", "https://i.imgur.com/g5fQwuf.jpg"]}'::jsonb),
  ('payment_settings', '{"tipfunder": "https://www.tipfunder.com/Geldherrinlay9", "throne": "https://throne.com/geldherrinlayla", "telegram": "https://t.me/laylathebest", "x": "https://x.com/Geldherrinlay9"}'::jsonb);
