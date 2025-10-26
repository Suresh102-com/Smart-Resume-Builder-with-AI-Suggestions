/*
  # Smart Resume Builder Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `resumes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text) - Resume title/name
      - `template` (text) - Template style
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `resume_sections`
      - `id` (uuid, primary key)
      - `resume_id` (uuid, references resumes)
      - `section_type` (text) - personal_info, summary, experience, education, skills, projects, certifications
      - `content` (jsonb) - Flexible JSON structure for different section types
      - `order_index` (integer) - For ordering sections
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `ai_suggestions`
      - `id` (uuid, primary key)
      - `resume_id` (uuid, references resumes)
      - `section_id` (uuid, references resume_sections, nullable)
      - `suggestion_type` (text) - improve_content, add_keywords, grammar_check
      - `original_content` (text)
      - `suggested_content` (text)
      - `applied` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Profiles are tied to auth.users
    - Resumes and related data can only be accessed by the owner
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled Resume',
  template text DEFAULT 'modern',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resumes"
  ON resumes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes"
  ON resumes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes"
  ON resumes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes"
  ON resumes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create resume_sections table
CREATE TABLE IF NOT EXISTS resume_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id uuid NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  section_type text NOT NULL,
  content jsonb DEFAULT '{}'::jsonb,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE resume_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resume sections"
  ON resume_sections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM resumes
      WHERE resumes.id = resume_sections.resume_id
      AND resumes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own resume sections"
  ON resume_sections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM resumes
      WHERE resumes.id = resume_sections.resume_id
      AND resumes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own resume sections"
  ON resume_sections FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM resumes
      WHERE resumes.id = resume_sections.resume_id
      AND resumes.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM resumes
      WHERE resumes.id = resume_sections.resume_id
      AND resumes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own resume sections"
  ON resume_sections FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM resumes
      WHERE resumes.id = resume_sections.resume_id
      AND resumes.user_id = auth.uid()
    )
  );

-- Create ai_suggestions table
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id uuid NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  section_id uuid REFERENCES resume_sections(id) ON DELETE CASCADE,
  suggestion_type text NOT NULL,
  original_content text DEFAULT '',
  suggested_content text DEFAULT '',
  applied boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI suggestions"
  ON ai_suggestions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM resumes
      WHERE resumes.id = ai_suggestions.resume_id
      AND resumes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own AI suggestions"
  ON ai_suggestions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM resumes
      WHERE resumes.id = ai_suggestions.resume_id
      AND resumes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own AI suggestions"
  ON ai_suggestions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM resumes
      WHERE resumes.id = ai_suggestions.resume_id
      AND resumes.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM resumes
      WHERE resumes.id = ai_suggestions.resume_id
      AND resumes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own AI suggestions"
  ON ai_suggestions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM resumes
      WHERE resumes.id = ai_suggestions.resume_id
      AND resumes.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_sections_resume_id ON resume_sections(resume_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_resume_id ON ai_suggestions(resume_id);
