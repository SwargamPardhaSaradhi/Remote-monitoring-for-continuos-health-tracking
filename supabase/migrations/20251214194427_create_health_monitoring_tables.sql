/*
  # Health Monitoring System Database Schema

  ## Overview
  Creates tables for storing health metrics and AI analysis results for the remote health monitoring system.

  ## New Tables
  
  ### `health_metrics`
  Stores user health vitals including:
  - `id` (uuid, primary key) - Unique identifier for each health record
  - `user_id` (uuid, foreign key) - References auth.users
  - `heart_rate` (integer) - Heart rate in BPM
  - `systolic_bp` (integer) - Systolic blood pressure
  - `diastolic_bp` (integer) - Diastolic blood pressure
  - `oxygen_saturation` (integer) - SpO₂ percentage
  - `body_temperature` (numeric) - Body temperature in degrees
  - `created_at` (timestamptz) - Timestamp of the measurement

  ### `ai_analyses`
  Stores AI-generated health predictions and recommendations:
  - `id` (uuid, primary key) - Unique identifier for each analysis
  - `user_id` (uuid, foreign key) - References auth.users
  - `health_metric_id` (uuid, foreign key) - References health_metrics
  - `disease_prediction` (text) - AI-generated disease risk prediction
  - `diet_recommendations` (text) - Personalized diet suggestions
  - `created_at` (timestamptz) - Timestamp of the analysis

  ## Security
  
  ### Row Level Security (RLS)
  - Enable RLS on both tables
  - Users can only view their own health metrics and analyses
  - Users can insert their own health metrics
  - Users can view AI analyses related to their data
*/

-- Create health_metrics table
CREATE TABLE IF NOT EXISTS health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  heart_rate integer NOT NULL,
  systolic_bp integer NOT NULL,
  diastolic_bp integer NOT NULL,
  oxygen_saturation integer NOT NULL,
  body_temperature numeric(4,1) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create ai_analyses table
CREATE TABLE IF NOT EXISTS ai_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  health_metric_id uuid REFERENCES health_metrics(id) NOT NULL,
  disease_prediction text NOT NULL,
  diet_recommendations text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;

-- Policies for health_metrics table
CREATE POLICY "Users can view own health metrics"
  ON health_metrics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health metrics"
  ON health_metrics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies for ai_analyses table
CREATE POLICY "Users can view own AI analyses"
  ON ai_analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI analyses"
  ON ai_analyses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_health_metrics_user_id ON health_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_health_metrics_created_at ON health_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_user_id ON ai_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_health_metric_id ON ai_analyses(health_metric_id);