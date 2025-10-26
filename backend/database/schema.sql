CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS rounds (
  id SERIAL PRIMARY KEY,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMP NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  draw_numbers INT[] NULL, -- izvuceni pobjednicki brojevi
  CONSTRAINT draw_unique_when_set CHECK (
    draw_numbers IS NULL OR array_length(draw_numbers,1) BETWEEN 6 AND 10
  )
);

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id INT NOT NULL REFERENCES rounds(id),
  id_number VARCHAR(20) NOT NULL,
  numbers INT[] NOT NULL, -- brojevi koje user odabere
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

