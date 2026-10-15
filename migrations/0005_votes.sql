-- At most one vote per person per outing (#11, BR-01, BR-02). The attendance foreign key
-- makes a vote without an answer impossible; the app allows it only while Going and deletes
-- it on Not going (BR-11). The venue must be one of the outing's venues.
CREATE TABLE votes (
  outing_id uuid NOT NULL,
  participant_id uuid NOT NULL,
  venue_id uuid NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (outing_id, participant_id),
  FOREIGN KEY (outing_id, venue_id) REFERENCES outing_venues (outing_id, venue_id),
  FOREIGN KEY (outing_id, participant_id) REFERENCES attendance (outing_id, participant_id)
);
