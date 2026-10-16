-- Venues still tied when an outing closes without a winner (S-15). The organizer's choice
-- sets the winner among them. Rows are written once at close and never changed.
CREATE TABLE outing_tied_venues (
  outing_id uuid NOT NULL,
  venue_id uuid NOT NULL,
  PRIMARY KEY (outing_id, venue_id),
  FOREIGN KEY (outing_id, venue_id) REFERENCES outing_venues (outing_id, venue_id)
);
