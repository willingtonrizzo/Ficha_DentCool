import { describe, expect, it } from 'vitest';
import { PATIENT, INITIAL_TEETH, TREATMENTS, EVOLUTION, HISTORY } from '../data';
import { buildClinicalRecordFromMocks, DIAGNOSIS_SEVERITY, TREATMENT_STATUS } from '../clinical-model';

describe('clinical model', () => {
  it('maps the current mocks into a normalized patient and record structure', () => {
    const result = buildClinicalRecordFromMocks({
      patient: PATIENT,
      teeth: INITIAL_TEETH,
      treatments: TREATMENTS,
      evolution: EVOLUTION,
      history: HISTORY,
      uiContext: {
        selectedTooth: 24,
        selectedSurface: 'D',
        activeTab: 'presupuesto',
      },
    });

    expect(result.patient.id).toBe('patient-maria-soto');
    expect(result.patient.fullName).toBe('Maria Fernanda Soto Perez');
    expect(result.patient.recordNumber).toBe('DC-2026-0473');
    expect(result.record.patientId).toBe(result.patient.id);
    expect(result.record.selectedTooth).toBe(24);
    expect(result.record.selectedSurface).toBe('D');
    expect(result.record.activeTab).toBe('presupuesto');
    expect(result.record.odontogram[16].O).toBe('caries');
    expect(result.record.treatments[0].status).toBe(TREATMENT_STATUS.completed);
    expect(result.record.budget.planTitle.length).toBeGreaterThan(0);
    expect(result.record.evolutionNotes.length).toBeGreaterThan(0);
    expect(result.record.historyEntries.length).toBeGreaterThan(0);
    expect(result.record.documents.length).toBeGreaterThan(0);
    expect(result.record.motivoDiagnostico.consultationReason.length).toBeGreaterThan(0);
    expect(result.record.motivoDiagnostico.diagnoses[0].severity).toBe(DIAGNOSIS_SEVERITY.high);
    expect(result.record.evolutionNotes[0].title.length).toBeGreaterThan(0);
  });

  it('merges a patient specific motivo y diagnostico override', () => {
    const result = buildClinicalRecordFromMocks({
      patient: PATIENT,
      teeth: INITIAL_TEETH,
      treatments: TREATMENTS,
      evolution: EVOLUTION,
      history: HISTORY,
      clinicalRecord: {
        motivoDiagnostico: {
          consultationReason: 'Dolor localizado al masticar en 1.6.',
          diagnoses: [
            {
              code: 'K08.8',
              title: 'Dolor dental inespecifico',
              detail: 'Pendiente de confirmar por test complementarios',
              severity: 'media',
            },
          ],
        },
        evolutionNotes: [
          {
            dateLabel: '11-05-2026',
            title: 'Nueva reevaluacion clinica',
            author: 'Dra. Test',
            text: 'Paciente refiere mejoria posterior a indicaciones.',
            tags: [{ label: 'Seguimiento', tone: 't' }],
          },
        ],
        historyEntries: [
          {
            dateLabel: '11-05-2026',
            title: 'Evento resumido',
            clinician: 'Dra. Test',
            category: 'control',
            summary: 'Resumen de control posterior.',
          },
        ],
        budget: {
          planTitle: 'Plan restaurador acotado',
          coverageLabel: 'Seguro Demo',
          dueDateLabel: '15-jun',
        },
        treatments: [
          {
            toothFdi: 16,
            surfaces: ['O'],
            procedure: 'Restauracion compuesta',
            clinician: 'Dra. Test',
            status: 'planned',
            priority: 'alta',
            dateLabel: '12-05-2026',
            cost: 45000,
            paid: 10000,
            coveragePercent: 10,
          },
        ],
        documents: [
          {
            name: 'Consentimiento informado',
            dateLabel: '11-05-2026',
            ext: 'pdf',
            kind: 'consentimiento',
          },
        ],
      },
    });

    expect(result.record.motivoDiagnostico.consultationReason).toBe('Dolor localizado al masticar en 1.6.');
    expect(result.record.motivoDiagnostico.diagnoses).toHaveLength(1);
    expect(result.record.motivoDiagnostico.diagnoses[0].code).toBe('K08.8');
    expect(result.record.motivoDiagnostico.diagnoses[0].severity).toBe(DIAGNOSIS_SEVERITY.medium);
    expect(result.record.evolutionNotes).toHaveLength(1);
    expect(result.record.evolutionNotes[0].author).toBe('Dra. Test');
    expect(result.record.historyEntries).toHaveLength(1);
    expect(result.record.historyEntries[0].category).toBe('control');
    expect(result.record.budget.planTitle).toBe('Plan restaurador acotado');
    expect(result.record.treatments).toHaveLength(1);
    expect(result.record.treatments[0].cost).toBe(45000);
    expect(result.record.documents).toHaveLength(1);
    expect(result.record.documents[0].kind).toBe('consentimiento');
  });

  it('preserves patient specific odontogram and patient ui context', () => {
    const result = buildClinicalRecordFromMocks({
      patient: PATIENT,
      teeth: INITIAL_TEETH,
      treatments: TREATMENTS,
      evolution: EVOLUTION,
      history: HISTORY,
      clinicalRecord: {
        selectedTooth: 35,
        selectedSurface: 'V',
        activeTab: 'documentos',
        odontogram: {
          16: { O: 'implante', M: 'implante', D: 'implante', V: 'implante', L: 'implante' },
        },
      },
      uiContext: {
        selectedTooth: 24,
        selectedSurface: 'D',
        activeTab: 'presupuesto',
      },
    });

    expect(result.record.selectedTooth).toBe(35);
    expect(result.record.selectedSurface).toBe('V');
    expect(result.record.activeTab).toBe('documentos');
    expect(result.record.odontogram[16].O).toBe('implante');
    expect(result.record.odontogram[16].L).toBe('implante');
    expect(result.record.odontogram[24].D).toBe('caries');
  });
});
