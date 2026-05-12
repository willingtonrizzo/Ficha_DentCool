import { STORAGE_KEYS } from './data';
import { cloneInitialTeeth } from './odontogram';
import {
  createPatient,
  createSeedPatients,
  DEFAULT_ALLERGIES,
  DEFAULT_DENTAL_HABITS,
  DEFAULT_MEDICAL_BACKGROUND,
  isUntouchedBackgroundCollection,
} from './patients';
import { createClinicalPatientRecord, createMotivoDiagnosticoRecord } from './clinical-model';

function isPlainObject(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

export function loadTeethState() {
  if (typeof window === 'undefined') {
    return cloneInitialTeeth();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.odontogram);
    if (!raw) return cloneInitialTeeth();

    const parsed = JSON.parse(raw);
    if (!isPlainObject(parsed)) return cloneInitialTeeth();

    const base = cloneInitialTeeth();
    for (const toothId of Object.keys(base)) {
      if (!isPlainObject(parsed[toothId])) continue;
      for (const surface of Object.keys(base[toothId])) {
        const value = parsed[toothId][surface];
        if (typeof value === 'string') {
          base[toothId][surface] = value;
        }
      }
    }
    return base;
  } catch {
    return cloneInitialTeeth();
  }
}

export function saveTeethState(teeth) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEYS.odontogram, JSON.stringify(teeth));
}

export function resetTeethState() {
  if (typeof window === 'undefined') return cloneInitialTeeth();
  window.localStorage.removeItem(STORAGE_KEYS.odontogram);
  return cloneInitialTeeth();
}

const DEFAULT_UI_CONTEXT = {
  activeView: 'home',
  selectedTooth: 16,
  selectedSurface: 'O',
  activeTab: 'antecedentes',
};

export function loadUiContext() {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_UI_CONTEXT };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.progress);
    if (!raw) return { ...DEFAULT_UI_CONTEXT };

    const parsed = JSON.parse(raw);
    if (!isPlainObject(parsed)) return { ...DEFAULT_UI_CONTEXT };

    return {
      activeView: typeof parsed.activeView === 'string' ? parsed.activeView : DEFAULT_UI_CONTEXT.activeView,
      selectedTooth: Number.isInteger(parsed.selectedTooth) ? parsed.selectedTooth : DEFAULT_UI_CONTEXT.selectedTooth,
      selectedSurface: typeof parsed.selectedSurface === 'string' ? parsed.selectedSurface : DEFAULT_UI_CONTEXT.selectedSurface,
      activeTab: typeof parsed.activeTab === 'string' ? parsed.activeTab : DEFAULT_UI_CONTEXT.activeTab,
    };
  } catch {
    return { ...DEFAULT_UI_CONTEXT };
  }
}

export function saveUiContext(uiContext) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(uiContext));
}

export function resetUiContext() {
  if (typeof window === 'undefined') return { ...DEFAULT_UI_CONTEXT };
  window.localStorage.removeItem(STORAGE_KEYS.progress);
  return { ...DEFAULT_UI_CONTEXT };
}

export function loadClinicalRecords() {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.clinicalRecords);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!isPlainObject(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([patientId, record]) => typeof patientId === 'string' && isPlainObject(record))
        .map(([patientId, record]) => {
          const looksLegacyMotivoOnly =
            'consultationReason' in record ||
            'currentIllness' in record ||
            'diagnoses' in record;

          if (looksLegacyMotivoOnly) {
            return [
              patientId,
              createClinicalPatientRecord(
                { motivoDiagnostico: createMotivoDiagnosticoRecord(record) },
                { id: patientId }
              ),
            ];
          }

          return [patientId, createClinicalPatientRecord(record, { id: patientId })];
        })
    );
  } catch {
    return {};
  }
}

export function saveClinicalRecords(recordsByPatient) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEYS.clinicalRecords, JSON.stringify(recordsByPatient));
}

export function resetClinicalRecords() {
  if (typeof window === 'undefined') return {};
  window.localStorage.removeItem(STORAGE_KEYS.clinicalRecords);
  return {};
}

export function loadPatientDirectory() {
  const fallback = createSeedPatients();

  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.patients);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return fallback;

    return parsed
      .filter(isPlainObject)
      .map((patient) => createPatient(patient));
  } catch {
    return fallback;
  }
}

export function savePatientDirectory(patients) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEYS.patients, JSON.stringify(patients));
}

export function loadActivePatientId() {
  const fallback = createSeedPatients()[0]?.id ?? null;

  if (typeof window === 'undefined') {
    return fallback;
  }

  const stored = window.localStorage.getItem(STORAGE_KEYS.activePatientId);
  return stored || fallback;
}

export function saveActivePatientId(patientId) {
  if (typeof window === 'undefined' || !patientId) return;
  window.localStorage.setItem(STORAGE_KEYS.activePatientId, patientId);
}

export function resetPatientDirectory() {
  const fallback = createSeedPatients();

  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEYS.patients);
    window.localStorage.removeItem(STORAGE_KEYS.activePatientId);
  }

  return {
    patients: fallback,
    activePatientId: fallback[0]?.id ?? null,
  };
}
