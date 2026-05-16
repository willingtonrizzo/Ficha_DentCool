import { STORAGE_KEYS } from './data';
import {
  createClinicalPatientRecord,
  createMotivoDiagnosticoRecord,
} from './clinical-model';
import { createPatient } from './patients';
import { cloneInitialTeeth } from './odontogram';
import schemaSql from '../db/schema.sql?raw';

const SQLITE_DB_PATH = 'sqlite:ficha-dentcool.db';
const SQLITE_TABLE = 'app_kv';
const SQLITE_PATIENT_PAYLOAD_TABLE = 'patient_payloads';
const SQLITE_MOTIVO_TABLE = 'motivo_diagnostico_records';
const SQLITE_CLINICAL_RECORD_PAYLOAD_TABLE = 'clinical_record_payloads';

let persistenceMode = 'browser';
let sqliteDatabase = null;
let initPromise = null;
let writeChain = Promise.resolve();
const sqliteCache = new Map();

function isBrowserRuntime() {
  return typeof window !== 'undefined';
}

function isPlainObject(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function safeParseJson(raw, fallback) {
  if (typeof raw !== 'string' || raw.trim() === '') return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function queueSqliteTask(task) {
  writeChain = writeChain
    .then(() => task())
    .catch(() => {});
  return writeChain;
}

function readLocalStorageSeed() {
  if (!isBrowserRuntime()) return new Map();

  return new Map(
    Object.values(STORAGE_KEYS)
      .map((key) => [key, window.localStorage.getItem(key)])
      .filter(([, value]) => value != null)
  );
}

async function loadSqlitePlugin() {
  const plugin = await import('@tauri-apps/plugin-sql');
  return plugin.default;
}

async function ensureSqliteTable() {
  if (!sqliteDatabase) return;
  await sqliteDatabase.execute(`
    CREATE TABLE IF NOT EXISTS ${SQLITE_TABLE} (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function normalizePatientDirectoryFromRaw(rawValue) {
  const parsed = typeof rawValue === 'string' ? safeParseJson(rawValue, null) : rawValue;
  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter(isPlainObject)
    .map((patient) => createPatient(patient));
}

function normalizeClinicalRecordFromRaw(record, patientId) {
  if (!isPlainObject(record)) return null;

  const looksLegacyMotivoOnly =
    'consultationReason' in record ||
    'currentIllness' in record ||
    'diagnoses' in record;

  const normalizedInput = looksLegacyMotivoOnly
    ? { motivoDiagnostico: createMotivoDiagnosticoRecord(record) }
    : record;

  const stablePatientId = patientId || normalizedInput.patientId || normalizedInput.id || '';
  const createdAt = typeof normalizedInput.createdAt === 'string' ? normalizedInput.createdAt : nowIso();
  const updatedAt = typeof normalizedInput.updatedAt === 'string' ? normalizedInput.updatedAt : createdAt;

  const normalizedRecord = createClinicalPatientRecord(normalizedInput, { id: stablePatientId });

  if (typeof normalizedInput.activeTab !== 'string') {
    normalizedRecord.activeTab = null;
  }

  normalizedRecord.status = typeof normalizedInput.status === 'string' ? normalizedInput.status : 'active';
  normalizedRecord.createdAt = createdAt;
  normalizedRecord.updatedAt = updatedAt;

  return normalizedRecord;
}

function normalizeClinicalRecordCollectionFromRaw(rawValue) {
  const parsed = typeof rawValue === 'string' ? safeParseJson(rawValue, null) : rawValue;
  if (!isPlainObject(parsed)) return {};

  return Object.fromEntries(
    Object.entries(parsed)
      .filter(([patientId, record]) => typeof patientId === 'string' && isPlainObject(record))
      .map(([patientId, record]) => [patientId, normalizeClinicalRecordFromRaw(record, patientId)])
      .filter(([, record]) => record != null)
  );
}

function parseRowJson(rawValue, fallback = null) {
  if (typeof rawValue !== 'string' || rawValue.trim() === '') return fallback;
  try {
    return JSON.parse(rawValue);
  } catch {
    return fallback;
  }
}

function mapMimeToExt(mimeType) {
  const mapping = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'application/pdf': 'pdf',
  };
  return mapping[mimeType] || 'pdf';
}

function mapExtToMime(ext) {
  const mapping = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    pdf: 'application/pdf',
  };
  return mapping[String(ext || '').toLowerCase()] || null;
}

function patientsByIdLike(payload, patientId) {
  const source = isPlainObject(payload) ? payload : {};
  return createPatient({
    id: source.id || patientId,
    rut: source.rut || '',
    fullName: source.fullName || source.name || 'Paciente sin nombre',
    birthDate: source.birthDate || '',
    birthDateLabel: source.birthDateLabel || '',
    age: Number.isFinite(Number(source.age)) ? Number(source.age) : null,
    gender: source.gender || '',
    phone: source.phone || '',
    email: source.email || '',
    address: source.address || '',
    insurance: source.insurance || '',
    registeredAt: source.registeredAt || source.createdAt || '',
    lastVisit: source.lastVisit || '',
    nextVisit: source.nextVisit || '',
    alerts: Array.isArray(source.alerts) ? source.alerts : [],
    medicalBackground: source.medicalBackground,
    medicalBackgroundComment: source.medicalBackgroundComment,
    allergies: source.allergies,
    allergiesComment: source.allergiesComment,
    dentalHabits: source.dentalHabits,
    dentalHabitsComment: source.dentalHabitsComment,
  });
}

async function selectSqliteRows(query, params = []) {
  if (!sqliteDatabase) return [];
  const rows = await sqliteDatabase.select(query, params);
  return Array.isArray(rows) ? rows : [];
}

function getRecordTimestamp(record) {
  return typeof record?.updatedAt === 'string' ? record.updatedAt : nowIso();
}

function getRecordCreationTimestamp(record) {
  return typeof record?.createdAt === 'string' ? record.createdAt : getRecordTimestamp(record);
}

function buildOdontogramSurfaceRows(recordId, odontogram, updatedAt) {
  const rows = [];
  if (!isPlainObject(odontogram)) return rows;

  for (const [toothKey, toothState] of Object.entries(odontogram)) {
    const toothFdi = Number(toothKey);
    if (!Number.isInteger(toothFdi) || !isPlainObject(toothState)) continue;

    for (const [surfaceCode, stateCode] of Object.entries(toothState)) {
      if (typeof stateCode !== 'string') continue;
      rows.push({
        recordId,
        toothFdi,
        surfaceCode,
        stateCode,
        updatedAt,
      });
    }
  }

  return rows;
}

function buildFallbackRowId(prefix, recordId, index) {
  return `${prefix}-${recordId}-${index + 1}`;
}

function buildTreatmentRows(recordId, patientId, treatments, createdAt, updatedAt) {
  if (!Array.isArray(treatments)) return [];

  return treatments
    .filter(isPlainObject)
    .map((treatment, index) => ({
      id: typeof treatment.id === 'string' && treatment.id ? treatment.id : buildFallbackRowId('tx', recordId, index),
      patientId,
      recordId,
      toothFdi: Number.isFinite(Number(treatment.toothFdi)) ? Number(treatment.toothFdi) : null,
      surfacesJson: JSON.stringify(Array.isArray(treatment.surfaces) ? treatment.surfaces : []),
      procedureName: typeof treatment.procedure === 'string' ? treatment.procedure : '',
      clinicianName: typeof treatment.clinician === 'string' ? treatment.clinician : '',
      status: typeof treatment.status === 'string' ? treatment.status : 'planned',
      priority: typeof treatment.priority === 'string' ? treatment.priority : null,
      dateLabel: typeof treatment.dateLabel === 'string' ? treatment.dateLabel : '',
      cost: Number.isFinite(Number(treatment.cost)) ? Number(treatment.cost) : 0,
      paid: Number.isFinite(Number(treatment.paid)) ? Number(treatment.paid) : 0,
      coveragePercent: Number.isFinite(Number(treatment.coveragePercent)) ? Number(treatment.coveragePercent) : 0,
      saleKind: typeof treatment.saleKind === 'string' ? treatment.saleKind : 'single',
      createdAt,
      updatedAt,
    }));
}

function buildEvolutionRows(recordId, patientId, notes, createdAt, updatedAt) {
  if (!Array.isArray(notes)) return [];

  return notes
    .filter(isPlainObject)
    .map((note, index) => ({
      id: typeof note.id === 'string' && note.id ? note.id : buildFallbackRowId('evo', recordId, index),
      patientId,
      recordId,
      dateLabel: typeof note.dateLabel === 'string' ? note.dateLabel : '',
      title: typeof note.title === 'string' ? note.title : '',
      author: typeof note.author === 'string' ? note.author : '',
      text: typeof note.text === 'string' ? note.text : '',
      tagsJson: JSON.stringify(Array.isArray(note.tags) ? note.tags : []),
      category: typeof note.category === 'string' ? note.category : 'general',
      summary: typeof note.summary === 'string' ? note.summary : '',
      createdAt,
      updatedAt,
    }));
}

function buildHistoryRows(recordId, patientId, entries, createdAt, updatedAt) {
  if (!Array.isArray(entries)) return [];

  return entries
    .filter(isPlainObject)
    .map((entry, index) => ({
      id: typeof entry.id === 'string' && entry.id ? entry.id : buildFallbackRowId('hist', recordId, index),
      patientId,
      recordId,
      dateLabel: typeof entry.dateLabel === 'string' ? entry.dateLabel : '',
      title: typeof entry.title === 'string' ? entry.title : '',
      clinicianName: typeof entry.clinician === 'string' ? entry.clinician : '',
      category: typeof entry.category === 'string' ? entry.category : 'general',
      summary: typeof entry.summary === 'string' ? entry.summary : '',
      createdAt,
      updatedAt,
    }));
}

function buildPaymentRows(recordId, patientId, entries, createdAt, updatedAt) {
  if (!Array.isArray(entries)) return [];

  return entries
    .filter(isPlainObject)
    .map((entry, index) => ({
      id: typeof entry.id === 'string' && entry.id ? entry.id : buildFallbackRowId('pay', recordId, index),
      patientId,
      treatmentId: typeof entry.treatmentId === 'string' ? entry.treatmentId : null,
      recordId,
      dateLabel: typeof entry.dateLabel === 'string' ? entry.dateLabel : '',
      amount: Number.isFinite(Number(entry.amount)) ? Number(entry.amount) : 0,
      method: typeof entry.method === 'string' ? entry.method : 'cash',
      concept: typeof entry.concept === 'string' ? entry.concept : '',
      notes: typeof entry.notes === 'string' ? entry.notes : '',
      status: typeof entry.status === 'string' ? entry.status : 'received',
      source: typeof entry.source === 'string' ? entry.source : 'manual',
      createdAt,
      updatedAt,
    }));
}

function buildDocumentRows(recordId, patientId, documents, createdAt, updatedAt) {
  if (!Array.isArray(documents)) return [];

  return documents
    .filter(isPlainObject)
    .map((document, index) => ({
      id: typeof document.id === 'string' && document.id ? document.id : buildFallbackRowId('doc', recordId, index),
      patientId,
      recordId,
      name: typeof document.name === 'string' ? document.name : '',
      ext: typeof document.ext === 'string' ? document.ext : 'pdf',
      kind: typeof document.kind === 'string' ? document.kind : 'general',
      filePath: typeof document.filePath === 'string' ? document.filePath : null,
      mimeType: typeof document.ext === 'string' ? mapExtToMime(document.ext) : null,
      createdAt,
      updatedAt,
    }));
}

function buildAppointmentRows(recordId, patientId, appointments, createdAt, updatedAt) {
  if (!Array.isArray(appointments)) return [];

  return appointments
    .filter(isPlainObject)
    .map((appointment, index) => ({
      id: typeof appointment.id === 'string' && appointment.id ? appointment.id : buildFallbackRowId('apt', recordId, index),
      patientId,
      recordId,
      title: typeof appointment.reason === 'string' && appointment.reason ? appointment.reason : 'Cita',
      startsAt: [appointment.dateLabel, appointment.timeLabel].filter(Boolean).join(' '),
      durationMinutes: Number.isFinite(Number(appointment.durationMinutes)) ? Number(appointment.durationMinutes) : null,
      clinicianName: typeof appointment.clinician === 'string' ? appointment.clinician : '',
      location: typeof appointment.location === 'string' ? appointment.location : '',
      status: typeof appointment.status === 'string' ? appointment.status : null,
      notes: typeof appointment.notes === 'string' ? appointment.notes : '',
      source: typeof appointment.source === 'string' ? appointment.source : 'manual',
      createdAt,
      updatedAt,
    }));
}

function buildBudgetRow(recordId, patientId, budget, createdAt, updatedAt) {
  if (!isPlainObject(budget)) return null;

  return {
    patientId,
    recordId,
    payloadJson: JSON.stringify(budget),
    createdAt,
    updatedAt,
  };
}

function buildPricingBudgetRows(recordId, patientId, pricingBudgets, createdAt, updatedAt) {
  if (!Array.isArray(pricingBudgets)) return [];

  return pricingBudgets
    .filter(isPlainObject)
    .map((entry, index) => ({
      id: typeof entry.id === 'string' && entry.id ? entry.id : buildFallbackRowId('pb', recordId, index),
      patientId,
      recordId,
      payloadJson: JSON.stringify(entry),
      createdAt,
      updatedAt,
    }));
}

export function normalizePatientCollectionJson(rawValue) {
  return normalizePatientDirectoryFromRaw(rawValue);
}

export function normalizeClinicalRecordCollectionJson(rawValue) {
  return normalizeClinicalRecordCollectionFromRaw(rawValue);
}

async function replacePatientsInSqlite(rawValue) {
  if (!sqliteDatabase) return;

  const patients = normalizePatientDirectoryFromRaw(rawValue);
  const now = nowIso();

  await queueSqliteTask(async () => {
    await sqliteDatabase.execute(`DELETE FROM ${SQLITE_PATIENT_PAYLOAD_TABLE}`);
    await sqliteDatabase.execute('DELETE FROM patient_alerts');
    await sqliteDatabase.execute('DELETE FROM patients');

    for (const patient of patients) {
      const payload = JSON.stringify(patient);
      await sqliteDatabase.execute(
        `
          INSERT INTO patients (
            id, rut, full_name, birth_date_label, age, gender, phone, email, address, insurance, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          patient.id,
          patient.rut || null,
          patient.fullName,
          patient.birthDateLabel || null,
          Number.isFinite(patient.age) ? patient.age : null,
          patient.gender || null,
          patient.phone || null,
          patient.email || null,
          patient.address || null,
          patient.insurance || null,
          patient.registeredAt || now,
          now,
        ]
      );

      await sqliteDatabase.execute(
        `
          INSERT INTO ${SQLITE_PATIENT_PAYLOAD_TABLE} (
            patient_id, payload_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?)
        `,
        [patient.id, payload, patient.registeredAt || now, now]
      );

      for (const [index, alert] of (Array.isArray(patient.alerts) ? patient.alerts : []).entries()) {
        await sqliteDatabase.execute(
          `
            INSERT INTO patient_alerts (
              id, patient_id, severity, text
            ) VALUES (?, ?, ?, ?)
          `,
          [
            `alert-${patient.id}-${index + 1}`,
            patient.id,
            alert?.severity || 'info',
            alert?.text || '',
          ]
        );
      }
    }
  });
}

async function replaceMotivoDiagnosticoInSqlite(records) {
  if (!sqliteDatabase) return;

  await queueSqliteTask(async () => {
    await sqliteDatabase.execute(`DELETE FROM ${SQLITE_MOTIVO_TABLE}`);

    for (const [patientId, record] of Object.entries(records)) {
      const motivo = record?.motivoDiagnostico;
      if (!isPlainObject(motivo)) continue;
      const createdAt = getRecordCreationTimestamp(record);
      const updatedAt = getRecordTimestamp(record);

      await sqliteDatabase.execute(
        `
          INSERT INTO ${SQLITE_MOTIVO_TABLE} (
            patient_id, consultation_reason, current_illness, extraoral_exam, intraoral_exam, periodontal_exam, clinical_impression, diagnoses_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          patientId,
          motivo.consultationReason || null,
          motivo.currentIllness || null,
          motivo.extraoralExam || null,
          motivo.intraoralExam || null,
          motivo.periodontalExam || null,
          motivo.clinicalImpression || null,
          JSON.stringify(Array.isArray(motivo.diagnoses) ? motivo.diagnoses : []),
          createdAt,
          updatedAt,
        ]
      );
    }
  });
}

async function replaceClinicalRecordsInSqlite(rawValue) {
  if (!sqliteDatabase) return;

  const records = normalizeClinicalRecordCollectionFromRaw(rawValue);

  await queueSqliteTask(async () => {
    await sqliteDatabase.execute(`DELETE FROM ${SQLITE_CLINICAL_RECORD_PAYLOAD_TABLE}`);
    await sqliteDatabase.execute(`DELETE FROM ${SQLITE_MOTIVO_TABLE}`);
    await sqliteDatabase.execute('DELETE FROM budget_records');
    await sqliteDatabase.execute('DELETE FROM pricing_budget_entries');
    await sqliteDatabase.execute('DELETE FROM payment_entries');
    await sqliteDatabase.execute('DELETE FROM documents');
    await sqliteDatabase.execute('DELETE FROM appointments');
    await sqliteDatabase.execute('DELETE FROM history_entries');
    await sqliteDatabase.execute('DELETE FROM evolution_notes');
    await sqliteDatabase.execute('DELETE FROM treatment_items');
    await sqliteDatabase.execute('DELETE FROM odontogram_surface_states');
    await sqliteDatabase.execute('DELETE FROM clinical_records');

    for (const [patientId, record] of Object.entries(records)) {
      const createdAt = getRecordCreationTimestamp(record);
      const updatedAt = getRecordTimestamp(record);
      const payload = JSON.stringify(record);

      await sqliteDatabase.execute(
        `
          INSERT INTO clinical_records (
            id, patient_id, status, active_tab, selected_tooth, selected_surface, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          patientId,
          patientId,
          record.status || 'active',
          record.activeTab || null,
          Number.isInteger(record.selectedTooth) ? record.selectedTooth : null,
          typeof record.selectedSurface === 'string' ? record.selectedSurface : null,
          createdAt,
          updatedAt,
        ]
      );

      await sqliteDatabase.execute(
        `
          INSERT INTO ${SQLITE_CLINICAL_RECORD_PAYLOAD_TABLE} (
            patient_id, payload_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?)
        `,
        [patientId, payload, createdAt, updatedAt]
      );

      const motivo = record.motivoDiagnostico;
      if (isPlainObject(motivo)) {
        await sqliteDatabase.execute(
          `
            INSERT INTO ${SQLITE_MOTIVO_TABLE} (
              patient_id, consultation_reason, current_illness, extraoral_exam, intraoral_exam, periodontal_exam, clinical_impression, diagnoses_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            patientId,
            motivo.consultationReason || null,
            motivo.currentIllness || null,
            motivo.extraoralExam || null,
            motivo.intraoralExam || null,
            motivo.periodontalExam || null,
            motivo.clinicalImpression || null,
            JSON.stringify(Array.isArray(motivo.diagnoses) ? motivo.diagnoses : []),
            createdAt,
            updatedAt,
          ]
        );
      }

      for (const row of buildOdontogramSurfaceRows(patientId, record.odontogram, updatedAt)) {
        await sqliteDatabase.execute(
          `
            INSERT INTO odontogram_surface_states (
              record_id, tooth_fdi, surface_code, state_code, updated_at
            ) VALUES (?, ?, ?, ?, ?)
          `,
          [row.recordId, row.toothFdi, row.surfaceCode, row.stateCode, row.updatedAt]
        );
      }

      for (const row of buildTreatmentRows(patientId, patientId, record.treatments, createdAt, updatedAt)) {
        await sqliteDatabase.execute(
          `
            INSERT INTO treatment_items (
              id, patient_id, record_id, tooth_fdi, surfaces_json, procedure_name, clinician_name, status, priority, date_label, cost, paid, coverage_percent, sale_kind, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            row.id,
            row.patientId,
            row.recordId,
            row.toothFdi,
            row.surfacesJson,
            row.procedureName,
            row.clinicianName || null,
            row.status,
            row.priority,
            row.dateLabel || null,
            row.cost,
            row.paid,
            row.coveragePercent,
            row.saleKind || null,
            row.createdAt,
            row.updatedAt,
          ]
        );
      }

      for (const row of buildEvolutionRows(patientId, patientId, record.evolutionNotes, createdAt, updatedAt)) {
        await sqliteDatabase.execute(
          `
            INSERT INTO evolution_notes (
              id, patient_id, record_id, date_label, title, author, text, tags_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            row.id,
            row.patientId,
            row.recordId,
            row.dateLabel,
            row.title,
            row.author || null,
            row.text,
            row.tagsJson,
            row.createdAt,
            row.updatedAt,
          ]
        );
      }

      for (const row of buildHistoryRows(patientId, patientId, record.historyEntries, createdAt, updatedAt)) {
        await sqliteDatabase.execute(
          `
            INSERT INTO history_entries (
              id, patient_id, record_id, date_label, title, clinician_name, category, summary, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            row.id,
            row.patientId,
            row.recordId,
            row.dateLabel,
            row.title,
            row.clinicianName || null,
            row.category || null,
            row.summary || null,
            row.createdAt,
            row.updatedAt,
          ]
        );
      }

      for (const row of buildAppointmentRows(patientId, patientId, record.appointments, createdAt, updatedAt)) {
        await sqliteDatabase.execute(
          `
            INSERT INTO appointments (
              id, patient_id, record_id, title, starts_at, duration_minutes, clinician_name, location, status, notes, source, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            row.id,
            row.patientId,
            row.recordId,
            row.title,
            row.startsAt || null,
            row.durationMinutes,
            row.clinicianName || null,
            row.location || null,
            row.status || null,
            row.notes || null,
            row.source || null,
            row.createdAt,
            row.updatedAt,
          ]
        );
      }

      for (const row of buildPaymentRows(patientId, patientId, record.paymentEntries, createdAt, updatedAt)) {
        await sqliteDatabase.execute(
          `
            INSERT INTO payment_entries (
              id, patient_id, treatment_id, record_id, date_label, amount, method, concept, notes, status, source, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            row.id,
            row.patientId,
            row.treatmentId,
            row.recordId,
            row.dateLabel,
            row.amount,
            row.method,
            row.concept || null,
            row.notes || null,
            row.status || null,
            row.source || null,
            row.createdAt,
            row.updatedAt,
          ]
        );
      }

      const budgetRow = buildBudgetRow(patientId, patientId, record.budget, createdAt, updatedAt);
      if (budgetRow) {
        await sqliteDatabase.execute(
          `
            INSERT INTO budget_records (
              patient_id, payload_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?)
          `,
          [budgetRow.patientId, budgetRow.payloadJson, budgetRow.createdAt, budgetRow.updatedAt]
        );
      }

      for (const row of buildPricingBudgetRows(patientId, patientId, record.pricingBudgets, createdAt, updatedAt)) {
        await sqliteDatabase.execute(
          `
            INSERT INTO pricing_budget_entries (
              id, patient_id, record_id, payload_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?)
          `,
          [row.id, row.patientId, row.recordId, row.payloadJson, row.createdAt, row.updatedAt]
        );
      }

      for (const row of buildDocumentRows(patientId, patientId, record.documents, createdAt, updatedAt)) {
        await sqliteDatabase.execute(
          `
            INSERT INTO documents (
              id, patient_id, record_id, name, ext, kind, file_path, mime_type, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            row.id,
            row.patientId,
            row.recordId,
            row.name,
            row.ext,
            row.kind,
            row.filePath,
            row.mimeType,
            row.createdAt,
            row.updatedAt,
          ]
        );
      }
    }
  });
}

async function hydratePatientsCacheFromSqlite() {
  if (!sqliteDatabase) return false;
  const payloadRows = await selectSqliteRows(`SELECT patient_id, payload_json FROM ${SQLITE_PATIENT_PAYLOAD_TABLE} ORDER BY updated_at ASC`);
  const alertRows = await selectSqliteRows(`SELECT patient_id, severity, text FROM patient_alerts ORDER BY patient_id, id ASC`);
  const patientTableRows = await selectSqliteRows(`SELECT id, rut, full_name, birth_date_label, age, gender, phone, email, address, insurance, created_at, updated_at FROM patients ORDER BY updated_at ASC`);

  if (payloadRows.length === 0 && patientTableRows.length === 0) return false;

  const alertsByPatient = alertRows.reduce((acc, row) => {
    if (!row?.patient_id) return acc;
    const bucket = acc.get(row.patient_id) ?? [];
    bucket.push({
      severity: row.severity || 'info',
      text: row.text || '',
    });
    acc.set(row.patient_id, bucket);
    return acc;
  }, new Map());

  const patientsById = new Map();

  for (const row of payloadRows) {
    const patientId = typeof row?.patient_id === 'string' ? row.patient_id : '';
    const payload = parseRowJson(row?.payload_json, null);
    if (!patientId || !isPlainObject(payload)) continue;
    patientsById.set(patientId, createPatient({
      ...payload,
      alerts: alertsByPatient.get(patientId) ?? payload.alerts ?? [],
    }));
  }

  for (const row of patientTableRows) {
    if (!row?.id || patientsById.has(row.id)) continue;
    patientsById.set(row.id, createPatient({
      id: row.id,
      rut: row.rut ?? '',
      fullName: row.full_name ?? 'Paciente sin nombre',
      birthDate: '',
      birthDateLabel: row.birth_date_label ?? '',
      age: Number.isInteger(row.age) ? row.age : null,
      gender: row.gender ?? '',
      phone: row.phone ?? '',
      email: row.email ?? '',
      address: row.address ?? '',
      insurance: row.insurance ?? '',
      registeredAt: row.created_at ?? '',
      alerts: alertsByPatient.get(row.id) ?? [],
    }));
  }

  const patients = Array.from(patientsById.values());
  if (patients.length === 0) return false;

  if (patients.length === 0) return false;

  sqliteCache.set(STORAGE_KEYS.patients, JSON.stringify(patients));
  return true;
}

async function hydrateClinicalRecordsCacheFromSqlite() {
  if (!sqliteDatabase) return false;
  const payloadRows = await selectSqliteRows(`SELECT patient_id, payload_json FROM ${SQLITE_CLINICAL_RECORD_PAYLOAD_TABLE} ORDER BY updated_at ASC`);
  const recordRows = await selectSqliteRows(`SELECT id, patient_id, status, active_tab, selected_tooth, selected_surface, created_at, updated_at FROM clinical_records ORDER BY updated_at ASC`);
  if (payloadRows.length === 0 && recordRows.length === 0) return false;

  const motivoRows = await selectSqliteRows(`SELECT patient_id, consultation_reason, current_illness, extraoral_exam, intraoral_exam, periodontal_exam, clinical_impression, diagnoses_json, created_at, updated_at FROM motivo_diagnostico_records`);
  const odontogramRows = await selectSqliteRows(`SELECT record_id, tooth_fdi, surface_code, state_code FROM odontogram_surface_states`);
  const treatmentRows = await selectSqliteRows(`SELECT id, patient_id, record_id, tooth_fdi, surfaces_json, procedure_name, clinician_name, status, priority, date_label, cost, paid, coverage_percent, sale_kind, created_at, updated_at FROM treatment_items`);
  const evolutionRows = await selectSqliteRows(`SELECT id, patient_id, record_id, date_label, title, author, text, tags_json, created_at, updated_at FROM evolution_notes`);
  const historyRows = await selectSqliteRows(`SELECT id, patient_id, record_id, date_label, title, clinician_name, category, summary, created_at, updated_at FROM history_entries`);
  const appointmentRows = await selectSqliteRows(`SELECT id, patient_id, record_id, title, starts_at, duration_minutes, clinician_name, location, status, notes, source, created_at, updated_at FROM appointments`);
  const paymentRows = await selectSqliteRows(`SELECT id, patient_id, treatment_id, record_id, date_label, amount, method, concept, notes, status, source, created_at, updated_at FROM payment_entries`);
  const budgetRows = await selectSqliteRows(`SELECT patient_id, payload_json, created_at, updated_at FROM budget_records`);
  const pricingBudgetRows = await selectSqliteRows(`SELECT id, patient_id, record_id, payload_json, created_at, updated_at FROM pricing_budget_entries`);
  const documentRows = await selectSqliteRows(`SELECT id, patient_id, record_id, name, ext, kind, file_path, mime_type, created_at, updated_at FROM documents`);

  const payloadByPatient = new Map();
  for (const row of payloadRows) {
    const patientId = typeof row?.patient_id === 'string' ? row.patient_id : '';
    const parsed = parseRowJson(row?.payload_json, null);
    if (!patientId || !isPlainObject(parsed)) continue;
    payloadByPatient.set(patientId, parsed);
  }

  const recordsByPatient = new Map();
  for (const row of recordRows) {
    if (!row?.patient_id) continue;
    recordsByPatient.set(row.patient_id, {
      id: row.id,
      patientId: row.patient_id,
      status: row.status || 'active',
      selectedTooth: Number.isInteger(row.selected_tooth) ? row.selected_tooth : null,
      selectedSurface: typeof row.selected_surface === 'string' ? row.selected_surface : null,
      activeTab: typeof row.active_tab === 'string' ? row.active_tab : null,
      createdAt: row.created_at || undefined,
      updatedAt: row.updated_at || undefined,
    });
  }

  for (const row of motivoRows) {
    if (!row?.patient_id) continue;
    const current = recordsByPatient.get(row.patient_id) ?? { id: row.patient_id, patientId: row.patient_id };
    current.motivoDiagnostico = {
      consultationReason: row.consultation_reason || '',
      currentIllness: row.current_illness || '',
      extraoralExam: row.extraoral_exam || '',
      intraoralExam: row.intraoral_exam || '',
      periodontalExam: row.periodontal_exam || '',
      clinicalImpression: row.clinical_impression || '',
      diagnoses: Array.isArray(parseRowJson(row.diagnoses_json, []))
        ? parseRowJson(row.diagnoses_json, [])
        : [],
      createdAt: row.created_at || undefined,
      updatedAt: row.updated_at || undefined,
    };
    recordsByPatient.set(row.patient_id, current);
  }

  const byRecordId = new Map();
  for (const [patientId, record] of recordsByPatient.entries()) {
    byRecordId.set(record.id || patientId, record);
  }

  for (const row of odontogramRows) {
    const record = byRecordId.get(row?.record_id);
    if (!record) continue;
    const odontogram = record.odontogram && isPlainObject(record.odontogram) ? record.odontogram : cloneInitialTeeth();
    const toothFdi = Number(row.tooth_fdi);
    if (!Number.isInteger(toothFdi)) continue;
    if (!isPlainObject(odontogram[toothFdi])) {
      odontogram[toothFdi] = { O: 'sano', M: 'sano', D: 'sano', V: 'sano', L: 'sano' };
    }
    odontogram[toothFdi][row.surface_code] = row.state_code;
    record.odontogram = odontogram;
  }

  const treatmentsByPatient = new Map();
  for (const row of treatmentRows) {
    const bucket = treatmentsByPatient.get(row.patient_id) ?? [];
    bucket.push({
      id: row.id,
      patientId: row.patient_id,
      toothFdi: Number.isFinite(Number(row.tooth_fdi)) ? Number(row.tooth_fdi) : 11,
      surfaces: Array.isArray(parseRowJson(row.surfaces_json, [])) ? parseRowJson(row.surfaces_json, []) : [],
      procedure: row.procedure_name || '',
      clinician: row.clinician_name || '',
      status: row.status || 'planned',
      priority: row.priority || 'baja',
      dateLabel: row.date_label || '',
      cost: Number(row.cost) || 0,
      paid: Number(row.paid) || 0,
      coveragePercent: Number(row.coverage_percent) || 0,
      saleKind: row.sale_kind || 'single',
    });
    treatmentsByPatient.set(row.patient_id, bucket);
  }

  const evolutionByPatient = new Map();
  for (const row of evolutionRows) {
    const bucket = evolutionByPatient.get(row.patient_id) ?? [];
    bucket.push({
      id: row.id,
      patientId: row.patient_id,
      dateLabel: row.date_label || '',
      title: row.title || '',
      author: row.author || '',
      text: row.text || '',
      tags: Array.isArray(parseRowJson(row.tags_json, [])) ? parseRowJson(row.tags_json, []) : [],
    });
    evolutionByPatient.set(row.patient_id, bucket);
  }

  const historyByPatient = new Map();
  for (const row of historyRows) {
    const bucket = historyByPatient.get(row.patient_id) ?? [];
    bucket.push({
      id: row.id,
      patientId: row.patient_id,
      dateLabel: row.date_label || '',
      title: row.title || '',
      clinician: row.clinician_name || '',
      category: row.category || 'general',
      summary: row.summary || '',
    });
    historyByPatient.set(row.patient_id, bucket);
  }

  const appointmentsByPatient = new Map();
  for (const row of appointmentRows) {
    const bucket = appointmentsByPatient.get(row.patient_id) ?? [];
    const starts = String(row.starts_at || '').trim();
    const [dateLabel = '', timeLabel = ''] = starts.split(/\s+/);
    bucket.push({
      id: row.id,
      patientId: row.patient_id,
      dateLabel,
      timeLabel,
      reason: row.title || '',
      clinician: row.clinician_name || '',
      status: row.status || 'scheduled',
      notes: row.notes || '',
      source: row.source || 'sqlite',
    });
    appointmentsByPatient.set(row.patient_id, bucket);
  }

  const paymentsByPatient = new Map();
  for (const row of paymentRows) {
    const bucket = paymentsByPatient.get(row.patient_id) ?? [];
    bucket.push({
      id: row.id,
      patientId: row.patient_id,
      treatmentId: row.treatment_id || null,
      dateLabel: row.date_label || '',
      amount: Number(row.amount) || 0,
      method: row.method || 'cash',
      concept: row.concept || '',
      notes: row.notes || '',
      status: row.status || 'received',
      source: row.source || 'manual',
    });
    paymentsByPatient.set(row.patient_id, bucket);
  }

  const budgetByPatient = new Map();
  for (const row of budgetRows) {
    const parsed = parseRowJson(row.payload_json, null);
    if (!row.patient_id || !isPlainObject(parsed)) continue;
    budgetByPatient.set(row.patient_id, parsed);
  }

  const pricingBudgetsByPatient = new Map();
  for (const row of pricingBudgetRows) {
    const bucket = pricingBudgetsByPatient.get(row.patient_id) ?? [];
    const parsed = parseRowJson(row.payload_json, null);
    if (isPlainObject(parsed)) {
      bucket.push(parsed);
    }
    pricingBudgetsByPatient.set(row.patient_id, bucket);
  }

  const documentsByPatient = new Map();
  for (const row of documentRows) {
    const bucket = documentsByPatient.get(row.patient_id) ?? [];
    bucket.push({
      id: row.id,
      patientId: row.patient_id,
      name: row.name || '',
      dateLabel: '',
      ext: row.ext || mapMimeToExt(row.mime_type),
      kind: row.kind || 'general',
      filePath: row.file_path || '',
    });
    documentsByPatient.set(row.patient_id, bucket);
  }

  const records = {};
  for (const [patientId, baseRecord] of recordsByPatient.entries()) {
    const fallback = payloadByPatient.get(patientId) ?? {};
    const merged = {
      ...fallback,
      ...baseRecord,
      odontogram: baseRecord.odontogram ?? fallback.odontogram ?? cloneInitialTeeth(),
      motivoDiagnostico: baseRecord.motivoDiagnostico ?? fallback.motivoDiagnostico,
      treatments: treatmentsByPatient.get(patientId) ?? fallback.treatments,
      evolutionNotes: evolutionByPatient.get(patientId) ?? fallback.evolutionNotes,
      historyEntries: historyByPatient.get(patientId) ?? fallback.historyEntries,
      appointments: appointmentsByPatient.get(patientId) ?? fallback.appointments,
      paymentEntries: paymentsByPatient.get(patientId) ?? fallback.paymentEntries,
      budget: budgetByPatient.get(patientId) ?? fallback.budget,
      pricingBudgets: pricingBudgetsByPatient.get(patientId) ?? fallback.pricingBudgets,
      documents: documentsByPatient.get(patientId) ?? fallback.documents,
    };

    const patient = patientsByIdLike(fallback, patientId);
    const normalized = normalizeClinicalRecordFromRaw(merged, patient);
    if (normalized) {
      records[patientId] = normalized;
    }
  }

  for (const [patientId, payload] of payloadByPatient.entries()) {
    if (records[patientId]) continue;
    const patient = patientsByIdLike(payload, patientId);
    const normalized = normalizeClinicalRecordFromRaw(payload, patient);
    if (normalized) {
      records[patientId] = normalized;
    }
  }

  if (Object.keys(records).length === 0) return false;

  sqliteCache.set(STORAGE_KEYS.clinicalRecords, JSON.stringify(records));
  return true;
}

function splitSqlStatements(sql) {
  return sql
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function ensureSqliteSchema() {
  if (!sqliteDatabase) return;
  await sqliteDatabase.execute('PRAGMA foreign_keys = ON');
  for (const statement of splitSqlStatements(schemaSql)) {
    await sqliteDatabase.execute(statement);
  }
}

async function writeSqliteValue(key, value) {
  if (!sqliteDatabase) return;
  const serializedValue = value ?? '';
  return queueSqliteTask(() =>
    sqliteDatabase.execute(
      `
        INSERT INTO ${SQLITE_TABLE} (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = CURRENT_TIMESTAMP
      `,
      [key, serializedValue]
    )
  );
}

export async function initPersistence() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (!isBrowserRuntime()) {
      persistenceMode = 'browser';
      return persistenceMode;
    }

    const localSeed = readLocalStorageSeed();

    try {
      const Database = await loadSqlitePlugin();
      sqliteDatabase = await Database.load(SQLITE_DB_PATH);
      await ensureSqliteSchema();
      await ensureSqliteTable();

      const rows = await sqliteDatabase.select(`SELECT key, value FROM ${SQLITE_TABLE}`);
      if (Array.isArray(rows)) {
        for (const row of rows) {
          if (typeof row?.key === 'string' && typeof row?.value === 'string') {
            sqliteCache.set(row.key, row.value);
          }
        }
      }

      if (sqliteCache.size === 0 && localSeed.size > 0) {
        for (const [key, value] of localSeed.entries()) {
          sqliteCache.set(key, value);
          await writeSqliteValue(key, value);
        }
      } else {
        for (const [key, value] of localSeed.entries()) {
          if (!sqliteCache.has(key)) {
            sqliteCache.set(key, value);
          }
        }
      }

      const patientsFromSqlite = await hydratePatientsCacheFromSqlite();
      if (!patientsFromSqlite && sqliteCache.has(STORAGE_KEYS.patients)) {
        await replacePatientsInSqlite(sqliteCache.get(STORAGE_KEYS.patients));
      }

      const clinicalRecordsFromSqlite = await hydrateClinicalRecordsCacheFromSqlite();
      if (!clinicalRecordsFromSqlite && sqliteCache.has(STORAGE_KEYS.clinicalRecords)) {
        await replaceClinicalRecordsInSqlite(sqliteCache.get(STORAGE_KEYS.clinicalRecords));
      }

      for (const [key, value] of sqliteCache.entries()) {
        window.localStorage.setItem(key, value);
      }

      persistenceMode = 'sqlite';
      return persistenceMode;
    } catch {
      sqliteDatabase = null;
      sqliteCache.clear();
      persistenceMode = 'browser';
      return persistenceMode;
    }
  })();

  return initPromise;
}

export function getPersistenceMode() {
  return persistenceMode;
}

export function getPersistedItem(key) {
  if (persistenceMode === 'sqlite') {
    return sqliteCache.get(key) ?? null;
  }

  if (!isBrowserRuntime()) {
    return null;
  }

  return window.localStorage.getItem(key);
}

export function setPersistedItem(key, value) {
  const serializedValue = value == null ? '' : String(value);

  if (persistenceMode === 'sqlite') {
    sqliteCache.set(key, serializedValue);
    if (isBrowserRuntime()) {
      window.localStorage.setItem(key, serializedValue);
    }
    void writeSqliteValue(key, serializedValue);
    if (key === STORAGE_KEYS.patients) {
      void replacePatientsInSqlite(serializedValue);
    }
    if (key === STORAGE_KEYS.clinicalRecords) {
      void replaceClinicalRecordsInSqlite(serializedValue);
    }
    return;
  }

  if (isBrowserRuntime()) {
    window.localStorage.setItem(key, serializedValue);
  }
}

export function removePersistedItem(key) {
  if (persistenceMode === 'sqlite') {
    sqliteCache.delete(key);
    if (isBrowserRuntime()) {
      window.localStorage.removeItem(key);
    }
    if (sqliteDatabase) {
      queueSqliteTask(() => sqliteDatabase.execute(`DELETE FROM ${SQLITE_TABLE} WHERE key = ?`, [key]));
      if (key === STORAGE_KEYS.patients) {
        queueSqliteTask(async () => {
          await sqliteDatabase.execute('DELETE FROM patient_alerts');
          await sqliteDatabase.execute(`DELETE FROM ${SQLITE_PATIENT_PAYLOAD_TABLE}`);
          await sqliteDatabase.execute('DELETE FROM patients');
        });
      }
      if (key === STORAGE_KEYS.clinicalRecords) {
        queueSqliteTask(async () => {
          await sqliteDatabase.execute(`DELETE FROM ${SQLITE_MOTIVO_TABLE}`);
          await sqliteDatabase.execute(`DELETE FROM ${SQLITE_CLINICAL_RECORD_PAYLOAD_TABLE}`);
          await sqliteDatabase.execute('DELETE FROM budget_records');
          await sqliteDatabase.execute('DELETE FROM pricing_budget_entries');
          await sqliteDatabase.execute('DELETE FROM payment_entries');
          await sqliteDatabase.execute('DELETE FROM documents');
          await sqliteDatabase.execute('DELETE FROM appointments');
          await sqliteDatabase.execute('DELETE FROM history_entries');
          await sqliteDatabase.execute('DELETE FROM evolution_notes');
          await sqliteDatabase.execute('DELETE FROM treatment_items');
          await sqliteDatabase.execute('DELETE FROM odontogram_surface_states');
          await sqliteDatabase.execute('DELETE FROM clinical_records');
        });
      }
    }
    return;
  }

  if (isBrowserRuntime()) {
    window.localStorage.removeItem(key);
  }
}
