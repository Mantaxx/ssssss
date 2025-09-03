-- Core schema for Columba (PostgreSQL + PostGIS)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Fanciers
CREATE TABLE IF NOT EXISTS fanciers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  pzhgp_id VARCHAR(64),
  club_id VARCHAR(64),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Lofts
CREATE TABLE IF NOT EXISTS lofts (
  id SERIAL PRIMARY KEY,
  fancier_id INTEGER REFERENCES fanciers(id) ON DELETE SET NULL,
  address VARCHAR(255),
  location geography(Point, 4326),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pigeons
CREATE TABLE IF NOT EXISTS pigeons (
  id SERIAL PRIMARY KEY,
  fancier_id INTEGER REFERENCES fanciers(id) ON DELETE SET NULL,
  ring_number VARCHAR(64) UNIQUE,
  year INTEGER,
  sex VARCHAR(16),
  color VARCHAR(64),
  strain VARCHAR(64),
  sire_id INTEGER REFERENCES pigeons(id) ON DELETE SET NULL,
  dam_id INTEGER REFERENCES pigeons(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Release points
CREATE TABLE IF NOT EXISTS release_points (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  location geography(Point, 4326),
  source_document VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Races
CREATE TABLE IF NOT EXISTS races (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  release_point_id INTEGER REFERENCES release_points(id) ON DELETE SET NULL,
  release_datetime_utc TIMESTAMP,
  pzhgp_category VARCHAR(32),
  total_pigeons_basketed INTEGER,
  total_fanciers INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Results
CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  race_id INTEGER REFERENCES races(id) ON DELETE CASCADE,
  pigeon_id INTEGER REFERENCES pigeons(id) ON DELETE CASCADE,
  fancier_id INTEGER REFERENCES fanciers(id) ON DELETE SET NULL,
  arrival_datetime_utc TIMESTAMP,
  clocking_system_id VARCHAR(64),
  position INTEGER,
  speed_m_per_min DECIMAL(10, 2),
  coefficient DECIMAL(10, 4),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

