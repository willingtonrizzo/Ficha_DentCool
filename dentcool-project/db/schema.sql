PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  rut TEXT UNIQUE,
  full_name TEXT NOT NULL,
  birth_date_label TEXT,
  age INTEGER,
  gender TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  insurance TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS patient_alerts (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  severity TEXT NOT NULL,
  text TEXT NOT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS clinical_records (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  status TEXT NOT NULL,
  active_tab TEXT,
  selected_tooth INTEGER,
  selected_surface TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS odontogram_surface_states (
  record_id TEXT NOT NULL,
  tooth_fdi INTEGER NOT NULL,
  surface_code TEXT NOT NULL,
  state_code TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (record_id, tooth_fdi, surface_code),
  FOREIGN KEY (record_id) REFERENCES clinical_records(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS treatment_items (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  record_id TEXT,
  tooth_fdi INTEGER,
  surfaces_json TEXT NOT NULL,
  procedure_name TEXT NOT NULL,
  clinician_name TEXT,
  status TEXT NOT NULL,
  priority TEXT,
  date_label TEXT,
  cost INTEGER NOT NULL DEFAULT 0,
  paid INTEGER NOT NULL DEFAULT 0,
  coverage_percent INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (record_id) REFERENCES clinical_records(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS evolution_notes (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  record_id TEXT,
  date_label TEXT NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  text TEXT NOT NULL,
  tags_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (record_id) REFERENCES clinical_records(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS history_entries (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  record_id TEXT,
  date_label TEXT NOT NULL,
  title TEXT NOT NULL,
  clinician_name TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (record_id) REFERENCES clinical_records(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  record_id TEXT,
  name TEXT NOT NULL,
  file_path TEXT,
  mime_type TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (record_id) REFERENCES clinical_records(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  record_id TEXT,
  title TEXT NOT NULL,
  starts_at TEXT,
  duration_minutes INTEGER,
  clinician_name TEXT,
  location TEXT,
  status TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (record_id) REFERENCES clinical_records(id) ON DELETE SET NULL
);
