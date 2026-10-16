-- Organizer's visit answer for an outing (S-14). NULL = not answered, true = went, false = did
-- not go. Only an outing with a winner can have an answer. The visit date is the outing date.
ALTER TABLE outings
  ADD COLUMN visited boolean NULL;

ALTER TABLE outings
  ADD CONSTRAINT outings_visited_needs_winner_check
  CHECK (visited IS NULL OR winner_venue_id IS NOT NULL);
