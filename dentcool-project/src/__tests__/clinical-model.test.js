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
        pricingBudgets: [
          {
            treatmentId: 'limpieza-vip',
            treatmentNameSnapshot: 'Limpieza VIP',
            status: 'accepted',
            calculationSnapshot: {
              finalPrice: 60000,
              availableBeforeLabor: 21050,
              clinicProfit: 3050,
            },
            createdAt: '2026-05-14T10:00:00.000Z',
            updatedAt: '2026-05-14T10:00:00.000Z',
            acceptedAt: '2026-05-14T10:05:00.000Z',
          },
        ],
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
        appointments: [
          {
            dateLabel: '18 may 2026',
            timeLabel: '09:30',
            reason: 'Control',
            clinician: 'Dra. Test',
            status: 'confirmed',
            notes: 'Confirmada por telefono',
          },
        ],
        paymentEntries: [
          {
            treatmentId: 'tx-1',
            dateLabel: '12-05-2026',
            amount: 10000,
            method: 'transfer',
            concept: 'Abono inicial',
            notes: 'Migrado a entidad de cobros',
            status: 'received',
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
    expect(result.record.pricingBudgets).toHaveLength(1);
    expect(result.record.pricingBudgets[0].status).toBe('accepted');
    expect(result.record.pricingBudgets[0].calculationSnapshot.finalPrice).toBe(60000);
    expect(result.record.treatments).toHaveLength(1);
    expect(result.record.treatments[0].cost).toBe(45000);
    expect(result.record.treatments[0].paid).toBe(10000);
    expect(result.record.appointments).toHaveLength(1);
    expect(result.record.appointments[0].status).toBe('confirmed');
    expect(result.record.paymentEntries).toHaveLength(1);
    expect(result.record.paymentEntries[0].amount).toBe(10000);
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
