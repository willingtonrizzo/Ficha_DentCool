import { describe, expect, it } from 'vitest';
import {
  normalizeClinicalRecordCollectionJson,
  normalizePatientCollectionJson,
} from '../persistence';

describe('persistence normalization', () => {
  it('normalizes patient collections for sqlite payloads', () => {
    const restored = normalizePatientCollectionJson(
      JSON.stringify([
        {
          id: 'patient-test',
          fullName: 'Ana Test',
          rut: '11.111.111-1',
          alerts: [{ severity: 'warn', text: 'Control' }],
        },
      ])
    );

    expect(restored).toHaveLength(1);
    expect(restored[0].id).toBe('patient-test');
    expect(restored[0].fullName).toBe('Ana Test');
    expect(restored[0].alerts[0].text).toBe('Control');
  });

  it('normalizes legacy clinical record payloads for sqlite payloads', () => {
    const restored = normalizeClinicalRecordCollectionJson(
      JSON.stringify({
        'patient-test': {
          consultationReason: 'Dolor al masticar',
          diagnoses: [{ code: 'K02.1', title: 'Caries', detail: '1.6', severity: 'alta' }],
        },
      })
    );

    expect(restored['patient-test']).toBeTruthy();
    expect(restored['patient-test'].motivoDiagnostico.consultationReason).toBe('Dolor al masticar');
    expect(restored['patient-test'].motivoDiagnostico.diagnoses[0].severity).toBe('alta');
  });
});
