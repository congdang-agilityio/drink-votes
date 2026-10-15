-- One Going / Not going answer per person per outing (#10). The organizer gets no row
-- automatically (AC 4). answered_at is the first answer and orders the Going list.
CREATE TABLE attendance (
  outing_id uuid NOT NULL REFERENCES outings(id),
  participant_id uuid NOT NULL REFERENCES participants(id),
  going boolean NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  answered_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (outing_id, participant_id)
);
