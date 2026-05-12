import { beforeEach, describe, expect, it } from 'vitest';
import {
  loadActivePatientId,
  loadClinicalRecords,
  loadPatientDirectory,
  loadTeethState,
  loadUiContext,
  resetClinicalRecords,
  resetPatientDirectory,
  resetTeethState,
  resetUiContext,
  saveActivePatientId,
  saveClinicalRecords,
  savePatientDirectory,
  saveTeethState,
  saveUiContext,
} from '../storage';
import { STORAGE_KEYS } from '../data';

describe('storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('restores the initial odontogram when there is no saved data', () => {
    const teeth = loadTeethState();

    expect(teeth[16].O).toBe('caries');
    expect(teeth[18].O).toBe('ausente');
  });

  it('persists and restores odontogram changes', () => {
    const teeth = loadTeethState();
    teeth[16].O = 'corona';

    saveTeethState(teeth);

    const restored = loadTeethState();
    expect(restored[16].O).toBe('corona');
  });

  it('falls back safely when odontogram storage is malformed', () => {
    window.localStorage.setItem(STORAGE_KEYS.odontogram, '{bad-json');

    const restored = loadTeethState();
    expect(restored[16].O).toBe('caries');
  });

  it('persists and restores the ui context', () => {
    saveUiContext({
      activeView: 'home',
      selectedTooth: 24,
      selectedSurface: 'D',
      activeTab: 'presupuesto',
    });

    const restored = loadUiContext();
    expect(restored).toEqual({
      activeView: 'home',
      selectedTooth: 24,
      selectedSurface: 'D',
      activeTab: 'presupuesto',
    });
  });

  it('resets odontogram and ui context storage', () => {
    const teeth = loadTeethState();
    teeth[16].O = 'implante';
    saveTeethState(teeth);
    saveUiContext({
      selectedTooth: 36,
      selectedSurface: 'V',
      activeTab: 'documentos',
    });

    const resetTeeth = resetTeethState();
    const resetUi = resetUiContext();

    expect(resetTeeth[16].O).toBe('caries');
    expect(resetUi).toEqual({
      activeView: 'home',
      selectedTooth: 16,
      selectedSurface: 'O',
      activeTab: 'antecedentes',
    });
  });

  it('persists and restores patient directory and active patient', () => {
    const patients = loadPatientDirectory();
    const updated = patients.map((patient) =>
      patient.id === patients[0].id ? { ...patient, phone: '+56 9 0000 1111' } : patient
    );

    savePatientDirectory(updated);
    saveActivePatientId(updated[1].id);

    expect(loadPatientDirectory()[0].phone).toBe('+56 9 0000 1111');
    expect(loadActivePatientId()).toBe(updated[1].id);
  });

  it('preserves deleted draft antecedents on load', () => {
    window.localStorage.setItem(
      STORAGE_KEYS.patients,
      JSON.stringify([
        {
          id: 'patient-new-123',
          fullName: 'Pedro K',
          medicalBackground: [
            { label: 'Neuritica', active: true, comment: '' },
          ],
          allergies: [
            { label: 'Peces', active: true, comment: 'ok' },
          ],
          dentalHabits: [
            { label: 'camina dormido', active: true, comment: 'N/A' },
          ],
        },
      ])
    );

    const restored = loadPatientDirectory();

    expect(restored[0].fullName).toBe('Pedro K');
    expect(restored[0].medicalBackground.some((item) => item.label === 'Embarazo')).toBe(false);
    expect(restored[0].medicalBackground.some((item) => item.label === 'Neuritica')).toBe(true);
    expect(restored[0].allergies.some((item) => item.label === 'Penicilina')).toBe(false);
    expect(restored[0].allergies.some((item) => item.label === 'Peces')).toBe(true);
    expect(restored[0].dentalHabits.some((item) => item.label === 'camina dormido')).toBe(true);
  });

  it('persists and restores clinical records by patient', () => {
    saveClinicalRecords({
      'patient-maria-soto': {
        selectedTooth: 46,
        selectedSurface: 'M',
        activeTab: 'historial',
        odontogram: {
          16: { O: 'corona', M: 'corona', D: 'corona', V: 'corona', L: 'corona' },
        },
        motivoDiagnostico: {
          consultationReason: 'Dolor a la masticacion en 1.6',
          diagnoses: [{ code: 'K02.1', title: 'Caries', detail: '1.6', severity: 'alta' }],
        },
        evolutionNotes: [
          {
            dateLabel: '11-05-2026',
            title: 'Nota control',
            author: 'Dra. Test',
            text: 'Paciente estable.',
            tags: [{ label: 'Control', tone: 't' }],
          },
        ],
        historyEntries: [
          {
            dateLabel: '11-05-2026',
            title: 'Evento control',
            clinician: 'Dra. Test',
            category: 'control',
            summary: 'Resumen corto.',
          },
        ],
        budget: {
          planTitle: 'Plan demo',
          coverageLabel: 'Seguro Demo',
          dueDateLabel: '20-jun',
        },
        treatments: [
          {
            toothFdi: 16,
            surfaces: ['O'],
            procedure: 'Restauracion',
            clinician: 'Dra. Test',
            status: 'planned',
            priority: 'media',
            dateLabel: '11-05-2026',
            cost: 30000,
            paid: 5000,
            coveragePercent: 10,
          },
        ],
        documents: [
          {
            name: 'Rx control',
            dateLabel: '11-05-2026',
            ext: 'jpg',
            kind: 'radiografia',
          },
        ],
      },
    });

    const restored = loadClinicalRecords();

    expect(restored['patient-maria-soto'].selectedTooth).toBe(46);
    expect(restored['patient-maria-soto'].selectedSurface).toBe('M');
    expect(restored['patient-maria-soto'].activeTab).toBe('historial');
    expect(restored['patient-maria-soto'].odontogram[16].O).toBe('corona');
    expect(restored['patient-maria-soto'].motivoDiagnostico.consultationReason).toBe('Dolor a la masticacion en 1.6');
    expect(restored['patient-maria-soto'].motivoDiagnostico.diagnoses[0].severity).toBe('alta');
    expect(restored['patient-maria-soto'].evolutionNotes[0].author).toBe('Dra. Test');
    expect(restored['patient-maria-soto'].historyEntries[0].category).toBe('control');
    expect(restored['patient-maria-soto'].budget.planTitle).toBe('Plan demo');
    expect(restored['patient-maria-soto'].treatments[0].cost).toBe(30000);
    expect(restored['patient-maria-soto'].documents[0].kind).toBe('radiografia');
  });

  it('migrates legacy motivo-only clinical records safely', () => {
    window.localStorage.setItem(
      STORAGE_KEYS.clinicalRecords,
      JSON.stringify({
        'patient-maria-soto': {
          consultationReason: 'Registro legado',
          diagnoses: [{ code: 'K02.1', title: 'Caries', detail: '1.6', severity: 'alta' }],
        },
      })
    );

    const restored = loadClinicalRecords();

    expect(restored['patient-maria-soto'].selectedTooth).toBeNull();
    expect(restored['patient-maria-soto'].selectedSurface).toBeNull();
    expect(restored['patient-maria-soto'].activeTab).toBeNull();
    expect(restored['patient-maria-soto'].odontogram[16].O).toBe('caries');
    expect(restored['patient-maria-soto'].motivoDiagnostico.consultationReason).toBe('Registro legado');
    expect(restored['patient-maria-soto'].evolutionNotes.length).toBeGreaterThan(0);
    expect(restored['patient-maria-soto'].historyEntries.length).toBeGreaterThan(0);
    expect(restored['patient-maria-soto'].budget.planTitle.length).toBeGreaterThan(0);
    expect(restored['patient-maria-soto'].treatments.length).toBeGreaterThan(0);
    expect(restored['patient-maria-soto'].documents.length).toBeGreaterThan(0);
  });

  it('resets stored clinical records', () => {
    saveClinicalRecords({
      'patient-maria-soto': {
        selectedTooth: 16,
        selectedSurface: 'O',
        activeTab: 'antecedentes',
        odontogram: {
          16: { O: 'caries', M: 'caries', D: 'sano', V: 'sano', L: 'sano' },
        },
        motivoDiagnostico: {
          consultationReason: 'Temporal',
          diagnoses: [],
        },
        evolutionNotes: [],
        historyEntries: [],
        budget: {
          planTitle: 'Temporal',
          coverageLabel: 'Temporal',
          dueDateLabel: 'Temporal',
        },
        treatments: [],
        documents: [],
      },
    });

    const reset = resetClinicalRecords();

    expect(reset).toEqual({});
    expect(window.localStorage.getItem(STORAGE_KEYS.clinicalRecords)).toBeNull();
  });

  it('resets patient directory storage to the seeded list', () => {
    const patients = loadPatientDirectory();

    savePatientDirectory([{ ...patients[0], id: 'custom-patient', fullName: 'Temporal' }]);
    saveActivePatientId('custom-patient');

    const reset = resetPatientDirectory();

    expect(reset.patients.length).toBeGreaterThan(1);
    expect(reset.activePatientId).toBe(reset.patients[0].id);
    expect(window.localStorage.getItem(STORAGE_KEYS.patients)).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEYS.activePatientId)).toBeNull();
  });
});
