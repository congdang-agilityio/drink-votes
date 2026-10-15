-- Outings (FR-04, FR-05). Never deleted (R-04); the closing state is M2 and not added here.
CREATE TABLE outings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outing_date date NOT NULL,
  sit_time time NOT NULL,
  close_time time NOT NULL,
  organizer_id uuid NOT NULL REFERENCES participants(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Upcoming outings list (S-11) sorts by date, then sitting time.
CREATE INDEX outings_date_sit_time_idx ON outings (outing_date, sit_time);

-- Venues offered in an outing, in the order the organizer chose them.
CREATE TABLE outing_venues (
  outing_id uuid NOT NULL REFERENCES outings(id),
  venue_id uuid NOT NULL REFERENCES venues(id),
  position int NOT NULL,
  PRIMARY KEY (outing_id, venue_id)
);
