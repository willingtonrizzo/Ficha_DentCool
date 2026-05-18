import { beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEYS } from '../data';

const sqliteState = {
  kv: new Map(),
  executed: [],
};

const mockDatabase = {
  async execute(query, params = []) {
    sqliteState.executed.push({ query, params });
    const compactQuery = query.replace(/\s+/g, ' ').trim();

    if (compactQuery.includes('INSERT INTO app_kv')) {
      sqliteState.kv.set(params[0], params[1]);
    }

    if (compactQuery.includes('DELETE FROM app_kv WHERE key = ?')) {
      sqliteState.kv.delete(params[0]);
    }
  },
  async select(query) {
    const compactQuery = query.replace(/\s+/g, ' ').trim();

    if (compactQuery.includes('FROM app_kv')) {
      return Array.from(sqliteState.kv.entries()).map(([key, value]) => ({ key, value }));
    }

    return [];
  },
};

vi.mock('@tauri-apps/plugin-sql', () => ({
  default: {
    load: vi.fn(async () => mockDatabase),
  },
}));

async function loadPersistenceModule() {
  const persistence = await import('../persistence');
  persistence.__resetPersistenceForTests();
  return persistence;
}

describe('persistence sqlite integration', () => {
  beforeEach(() => {
    window.localStorage.clear();
    sqliteState.kv.clear();
    sqliteState.executed = [];
    vi.resetModules();
  });

  it('initializes sqlite mode and migrates browser seed values into the sqlite key-value layer', async () => {
    window.localStorage.setItem(STORAGE_KEYS.activePatientId, 'patient-api-1');

    const {
      getPersistedItem,
      getPersistenceMode,
      initPersistence,
    } = await loadPersistenceModule();

    await expect(initPersistence()).resolves.toBe('sqlite');

    expect(getPersistenceMode()).toBe('sqlite');
    expect(getPersistedItem(STORAGE_KEYS.activePatientId)).toBe('patient-api-1');
    expect(sqliteState.kv.get(STORAGE_KEYS.activePatientId)).toBe('patient-api-1');
  });

  it('keeps sqlite cache, localStorage and queued writes in sync for API-style storage operations', async () => {
    const {
      flushPersistedWrites,
      getPersistedItem,
      initPersistence,
      removePersistedItem,
      setPersistedItem,
    } = await loadPersistenceModule();

    await initPersistence();

    setPersistedItem(STORAGE_KEYS.progress, JSON.stringify({ activeView: 'patients' }));
    await flushPersistedWrites();

    expect(getPersistedItem(STORAGE_KEYS.progress)).toContain('patients');
    expect(window.localStorage.getItem(STORAGE_KEYS.progress)).toContain('patients');
    expect(sqliteState.kv.get(STORAGE_KEYS.progress)).toContain('patients');

    removePersistedItem(STORAGE_KEYS.progress);
    await flushPersistedWrites();

    expect(getPersistedItem(STORAGE_KEYS.progress)).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEYS.progress)).toBeNull();
    expect(sqliteState.kv.has(STORAGE_KEYS.progress)).toBe(false);
  });

  it('writes clinical records through the relational sqlite tables when the clinical API key changes', async () => {
    const {
      flushPersistedWrites,
      initPersistence,
      setPersistedItem,
    } = await loadPersistenceModule();

    await initPersistence();

    setPersistedItem(STORAGE_KEYS.clinicalRecords, JSON.stringify({
      'patient-api-1': {
        id: 'patient-api-1',
        patientId: 'patient-api-1',
        selectedTooth: 16,
        selectedSurface: 'O',
        motivoDiagnostico: {
          consultationReason: 'Dolor espontaneo',
          diagnoses: [{ code: 'K02', title: 'Caries', severity: 'alta' }],
        },
        evolutionNotes: [
          {
            id: 'evo-api-1',
            dateLabel: '18-05-2026',
            title: 'Control',
            author: 'Dra.',
            text: 'Se controla evolucion.',
            tags: [],
          },
        ],
        paymentEntries: [
          {
            id: 'pay-api-1',
            dateLabel: '18-05-2026',
            amount: 20000,
            method: 'transfer',
            concept: 'Abono',
          },
        ],
      },
    }));

    await flushPersistedWrites();

    const executedSql = sqliteState.executed.map(({ query }) => query);
    expect(executedSql.some((query) => query.includes('INSERT INTO clinical_records'))).toBe(true);
    expect(executedSql.some((query) => query.includes('INSERT INTO motivo_diagnostico_records'))).toBe(true);
    expect(executedSql.some((query) => query.includes('INSERT INTO evolution_notes'))).toBe(true);
    expect(executedSql.some((query) => query.includes('INSERT INTO payment_entries'))).toBe(true);
  });
});
