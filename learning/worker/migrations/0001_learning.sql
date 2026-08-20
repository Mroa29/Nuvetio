CREATE TABLE IF NOT EXISTS learning_candidates (
  id TEXT PRIMARY KEY,
  schema_version TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending_review', 'approved', 'rejected', 'expired')),
  category TEXT,
  feedback_signal TEXT,
  rating TEXT NOT NULL CHECK (rating IN ('useful', 'not-useful', 'mixed')),
  safe_text TEXT NOT NULL,
  redactions TEXT NOT NULL,
  policy_version TEXT
);

CREATE TABLE IF NOT EXISTS review_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  candidate_id TEXT NOT NULL,
  action TEXT NOT NULL,
  reviewer_ref TEXT NOT NULL,
  notes TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (candidate_id) REFERENCES learning_candidates(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS learning_candidates_expiry_idx
  ON learning_candidates(status, expires_at);
