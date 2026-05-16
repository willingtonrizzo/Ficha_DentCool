import { STORAGE_KEYS } from './data';
import { cloneInitialTeeth } from './odontogram';
import { createPricingCatalog, createPricingSettings } from './pricing';
import {
  flushPersistedWrites,
  getPersistedItem,
  normalizeClinicalRecordCollectionJson,
  normalizePatientCollectionJson,
  removePersistedItem,
  setPersistedItem,
} from './persistence';
import {
  createSeedPatients,
  DEFAULT_ALLERGIES,
  DEFAULT_DENTAL_HABITS,
  DEFAULT_MEDICAL_BACKGROUND,
  isUntouchedBackgroundCollection,
} from './patients';

function isPlainObject(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

export function loadTeethState() {
  if (typeof window === 'undefined') {
    return cloneInitialTeeth();
  }

  try {
    const raw = getPersistedItem(STORAGE_KEYS.odontogram);
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
  setPersistedItem(STORAGE_KEYS.odontogram, JSON.stringify(teeth));
}

export function resetTeethState() {
  if (typeof window === 'undefined') return cloneInitialTeeth();
  removePersistedItem(STORAGE_KEYS.odontogram);
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
    const raw = getPersistedItem(STORAGE_KEYS.progress);
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
  setPersistedItem(STORAGE_KEYS.progress, JSON.stringify(uiContext));
}

export function resetUiContext() {
  if (typeof window === 'undefined') return { ...DEFAULT_UI_CONTEXT };
  removePersistedItem(STORAGE_KEYS.progress);
  return { ...DEFAULT_UI_CONTEXT };
}

export function loadClinicalRecords() {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = getPersistedItem(STORAGE_KEYS.clinicalRecords);
    if (!raw) return {};

    return normalizeClinicalRecordCollectionJson(raw);
  } catch {
    return {};
  }
}

export function saveClinicalRecords(recordsByPatient) {
  if (typeof window === 'undefined') return;
  setPersistedItem(STORAGE_KEYS.clinicalRecords, JSON.stringify(recordsByPatient));
}

export function flushStorageWrites() {
  return flushPersistedWrites();
}

export function resetClinicalRecords() {
  if (typeof window === 'undefined') return {};
  removePersistedItem(STORAGE_KEYS.clinicalRecords);
  return {};
}

export function loadPatientDirectory() {
  const fallback = createSeedPatients();

  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = getPersistedItem(STORAGE_KEYS.patients);
    if (!raw) return fallback;

    const parsed = normalizePatientCollectionJson(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return fallback;

    return parsed;
  } catch {
    return fallback;
  }
}

export function savePatientDirectory(patients) {
  if (typeof window === 'undefined') return;
  setPersistedItem(STORAGE_KEYS.patients, JSON.stringify(patients));
}

export function loadActivePatientId() {
  const fallback = createSeedPatients()[0]?.id ?? null;

  if (typeof window === 'undefined') {
    return fallback;
  }

  const stored = getPersistedItem(STORAGE_KEYS.activePatientId);
  return stored || fallback;
}

export function saveActivePatientId(patientId) {
  if (typeof window === 'undefined' || !patientId) return;
  setPersistedItem(STORAGE_KEYS.activePatientId, patientId);
}

export function resetPatientDirectory() {
  const fallback = createSeedPatients();

  if (typeof window !== 'undefined') {
    removePersistedItem(STORAGE_KEYS.patients);
    removePersistedItem(STORAGE_KEYS.activePatientId);
  }

  return {
    patients: fallback,
    activePatientId: fallback[0]?.id ?? null,
  };
}

export function loadPricingSettings() {
  const fallback = createPricingSettings();

  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = getPersistedItem(STORAGE_KEYS.pricingSettings);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    if (!isPlainObject(parsed)) return fallback;

    return createPricingSettings(parsed);
  } catch {
    return fallback;
  }
}

export function savePricingSettings(settings) {
  if (typeof window === 'undefined') return;
  setPersistedItem(STORAGE_KEYS.pricingSettings, JSON.stringify(createPricingSettings(settings)));
}

export function resetPricingSettings() {
  const fallback = createPricingSettings();

  if (typeof window !== 'undefined') {
    removePersistedItem(STORAGE_KEYS.pricingSettings);
  }

  return fallback;
}

export function loadPricingCatalog() {
  const fallback = createPricingCatalog();

  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = getPersistedItem(STORAGE_KEYS.pricingCatalog);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;

    return createPricingCatalog(parsed);
  } catch {
    return fallback;
  }
}

export function savePricingCatalog(catalog) {
  if (typeof window === 'undefined') return;
  setPersistedItem(STORAGE_KEYS.pricingCatalog, JSON.stringify(createPricingCatalog(catalog)));
}

export function resetPricingCatalog() {
  const fallback = createPricingCatalog();

  if (typeof window !== 'undefined') {
    removePersistedItem(STORAGE_KEYS.pricingCatalog);
  }

  return fallback;
}
