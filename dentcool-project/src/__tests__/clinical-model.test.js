import { describe, expect, it } from 'vitest';
import { PATIENT, INITIAL_TEETH, TREATMENTS, EVOLUTION, HISTORY } from '../data';
import { buildClinicalRecordFromMocks, createClinicalPatientRecord, DIAGNOSIS_SEVERITY, TREATMENT_STATUS } from '../clinical-model';

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
          doctorDiscountPercent: 15,
          doctorLaborCostByTreatmentId: {
            'tx-1': 30000,
          },
          simplePackTreatmentIds: ['evaluacion', 'limpieza-standard', 'blanqueamiento-consulta'],
          simplePackScheduleMode: 'split-days',
          simplePackDiscountPercent: 10,
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
    expect(result.record.budget.doctorDiscountPercent).toBe(15);
    expect(result.record.budget.doctorLaborCostByTreatmentId['tx-1']).toBe(30000);
    expect(result.record.budget.simplePackTreatmentIds).toEqual(['evaluacion', 'limpieza-standard', 'blanqueamiento-consulta']);
    expect(result.record.budget.simplePackScheduleMode).toBe('split-days');
    expect(result.record.budget.simplePackDiscountPercent).toBe(10);
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
    expect(result.record.quickNotes.feedbackTopic).toBe('general');
    expect(result.record.quickNotes.quickNotes).toBe('');
    expect(result.record.quickNotes.entries).toEqual([]);
  });

  it('normalizes quick notes as part of the patient clinical record', () => {
    const longDescription = [
      'Paciente comenta una evolucion extensa posterior al tratamiento.',
      'Se registran indicaciones clinicas, decisiones conversadas, dudas pendientes y acuerdos administrativos.',
      'Este texto simula una nota larga que debe conservarse completa sin truncarse en el modelo clinico.',
    ].join(' ');
    const longFeedback = [
      'Feedback operativo con detalle amplio.',
      'La atencion tomo mas tiempo por explicacion de costos, preparacion de insumos y coordinacion de agenda.',
      'Debe quedar guardado completo para revisar mejoras del flujo.',
    ].join(' ');

    const record = createClinicalPatientRecord(
      {
        quickNotes: {
          dateLabel: '16-05-2026',
          reason: 'Control de restauracion',
          quickNotes: '1.- mandar correo\n2.- confirmar disponibilidad de insumos antes de la proxima cita',
          description: longDescription,
          feedbackTopic: 'agenda',
          feedbackDetail: longFeedback,
        },
      },
      PATIENT
    );

    expect(record.quickNotes).toMatchObject({
      dateLabel: '16-05-2026',
      reason: 'Control de restauracion',
      quickNotes: '1.- mandar correo\n2.- confirmar disponibilidad de insumos antes de la proxima cita',
      description: longDescription,
      feedbackTopic: 'agenda',
      feedbackDetail: longFeedback,
      updatedAt: '',
    });
    expect(record.quickNotes.entries).toHaveLength(1);
    expect(record.quickNotes.entries[0]).toMatchObject({
      dateLabel: '16-05-2026',
      reason: 'Control de restauracion',
      quickNotes: '1.- mandar correo\n2.- confirmar disponibilidad de insumos antes de la proxima cita',
      description: longDescription,
      feedbackTopic: 'agenda',
      feedbackDetail: longFeedback,
    });
  });

  it('keeps multiple quick note entries by patient control', () => {
    const record = createClinicalPatientRecord(
      {
        quickNotes: {
          entries: [
            {
              id: 'quick-note-control-1',
              dateLabel: '16-05-2026',
              reason: 'Control inicial',
              quickNotes: '1.- primera indicacion',
              description: 'Detalle del primer control.',
              feedbackTopic: 'general',
              feedbackDetail: 'Primer feedback.',
            },
            {
              id: 'quick-note-control-2',
              dateLabel: '20-05-2026',
              reason: 'Segundo control',
              quickNotes: '1.- revisar evolucion',
              description: 'Detalle del segundo control.',
              feedbackTopic: 'agenda',
              feedbackDetail: 'Segundo feedback.',
            },
          ],
        },
      },
      PATIENT
    );

    expect(record.quickNotes.entries).toHaveLength(2);
    expect(record.quickNotes.entries[0].id).toBe('quick-note-control-1');
    expect(record.quickNotes.entries[1].reason).toBe('Segundo control');
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
