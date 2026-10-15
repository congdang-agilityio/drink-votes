-- Venues (quán) shared by everyone; no owner column (Q-05).
CREATE TABLE venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  maps_url text NULL,
  notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
