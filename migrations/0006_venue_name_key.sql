-- Venue names are unique ignoring case and surrounding spaces (#7 AC 3, A-07).
-- The app writes name_key in JavaScript; this backfill only covers rows that already exist.
ALTER TABLE venues ADD COLUMN name_key text;
UPDATE venues SET name_key = lower(btrim(name));
ALTER TABLE venues ALTER COLUMN name_key SET NOT NULL;
CREATE UNIQUE INDEX venues_name_key_idx ON venues (name_key);
