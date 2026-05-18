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

CREATE TABLE IF NOT EXISTS patient_payloads (
  patient_id TEXT PRIMARY KEY,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
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

CREATE TABLE IF NOT EXISTS motivo_diagnostico_records (
  patient_id TEXT PRIMARY KEY,
  consultation_reason TEXT,
  current_illness TEXT,
  extraoral_exam TEXT,
  intraoral_exam TEXT,
  periodontal_exam TEXT,
  clinical_impression TEXT,
  diagnoses_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (patient_id) REFERENCES clinical_records(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS clinical_record_payloads (
  patient_id TEXT PRIMARY KEY,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (patient_id) REFERENCES clinical_records(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS budget_records (
  patient_id TEXT PRIMARY KEY,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (patient_id) REFERENCES clinical_records(id) ON DELETE CASCADE,
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
  sale_kind TEXT,
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
  category TEXT,
  summary TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (record_id) REFERENCES clinical_records(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payment_entries (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  treatment_id TEXT,
  record_id TEXT,
  date_label TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  method TEXT NOT NULL,
  concept TEXT,
  notes TEXT,
  status TEXT,
  source TEXT,
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
  ext TEXT,
  kind TEXT,
  file_path TEXT,
  mime_type TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (record_id) REFERENCES clinical_records(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS pricing_budget_entries (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  record_id TEXT,
  payload_json TEXT NOT NULL,
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
  notes TEXT,
  source TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (record_id) REFERENCES clinical_records(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS supply_catalog_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  item_type TEXT NOT NULL,
  unit TEXT NOT NULL,
  purchase_quantity REAL NOT NULL DEFAULT 0,
  purchase_total_cost REAL NOT NULL DEFAULT 0,
  unit_cost REAL NOT NULL DEFAULT 0,
  current_stock REAL NOT NULL DEFAULT 0,
  minimum_stock REAL NOT NULL DEFAULT 0,
  supplier_id TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS supply_suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  address TEXT,
  dispatch TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS supply_purchases (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  supplier_id TEXT,
  quantity_purchased REAL NOT NULL DEFAULT 0,
  total_cost REAL NOT NULL DEFAULT 0,
  unit_cost REAL NOT NULL DEFAULT 0,
  document_type TEXT,
  document_number TEXT,
  purchase_date_label TEXT,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (item_id) REFERENCES supply_catalog_items(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES supply_suppliers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS supply_snapshots (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  treatment_id TEXT,
  recipe_id TEXT,
  total_supply_cost REAL NOT NULL DEFAULT 0,
  estimated_supply_cost REAL,
  final_supply_cost REAL,
  cost_variance REAL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS supply_recipes (
  id TEXT PRIMARY KEY,
  treatment_id TEXT,
  name TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS supply_categories (
  value TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS supply_units (
  value TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
