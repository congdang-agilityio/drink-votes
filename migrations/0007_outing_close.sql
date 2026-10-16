-- Close state of an outing (S-13). closed_at NULL means open. No backfill: M1 outings stay
-- open and are closed by the release step. "Waiting for the organizer" is
-- closed_at IS NOT NULL AND NOT cancelled AND winner_venue_id IS NULL.
ALTER TABLE outings
  ADD COLUMN closed_at timestamptz NULL,
  ADD COLUMN cancelled boolean NOT NULL DEFAULT false,
  ADD COLUMN winner_venue_id uuid NULL;

-- The winner must be one of the outing's venues (a NULL winner skips the check).
ALTER TABLE outings
  ADD CONSTRAINT outings_winner_venue_fk
  FOREIGN KEY (id, winner_venue_id) REFERENCES outing_venues (outing_id, venue_id);

-- An open outing is not cancelled and has no winner; a cancelled outing has no winner.
ALTER TABLE outings
  ADD CONSTRAINT outings_open_state_check
  CHECK (closed_at IS NOT NULL OR (NOT cancelled AND winner_venue_id IS NULL)),
  ADD CONSTRAINT outings_cancelled_no_winner_check
  CHECK (NOT cancelled OR winner_venue_id IS NULL);

-- Finding open outings by date and close time.
CREATE INDEX outings_open_idx ON outings (outing_date, close_time) WHERE closed_at IS NULL;
