import { describe, expect, it } from 'vitest';
import { buildPatientInitials, calculateAge, createEmptyPatient, createPatient, createPatientDraft, validatePatientDraft } from '../patients';

describe('patients helpers', () => {
  it('normalizes patient entities with derived fields', () => {
    const patient = createPatient({
      id: 'patient-test',
      fullName: 'Ana Lucia Torres',
      birthDate: '1990-05-10',
      alerts: [{ type: 'warn', text: 'Hipertension controlada' }],
    });

    expect(patient.initials).toBe('AL');
    expect(patient.birthDateLabel).toContain('1990');
    expect(patient.alerts[0].severity).toBe('warn');
  });

  it('creates an editable draft without derived display fields', () => {
    const draft = createPatientDraft(
      createPatient({
        id: 'patient-draft',
        fullName: 'Luis Herrera',
        birthDate: '1989-02-01',
        phone: '+56 9 5555 4444',
      })
    );

    expect(draft.id).toBe('patient-draft');
    expect(draft.fullName).toBe('Luis Herrera');
    expect(draft.birthDate).toBe('1989-02-01');
    expect(draft.phone).toBe('+56 9 5555 4444');
    expect(draft.medicalBackground.length).toBeGreaterThan(0);
    expect(draft.allergies.length).toBeGreaterThan(0);
    expect(draft.dentalHabits.length).toBeGreaterThan(0);
  });

  it('creates a blank draft for a new patient', () => {
    const draft = createPatientDraft(createEmptyPatient(7));

    expect(draft.fullName).toBe('');
    expect(draft.medicalBackground.every((item) => !item.active && item.comment === '')).toBe(true);
    expect(draft.allergies.every((item) => !item.active && item.comment === '')).toBe(true);
    expect(draft.dentalHabits.every((item) => !item.active && item.comment === '')).toBe(true);
  });

  it('builds initials and age safely', () => {
    expect(buildPatientInitials('')).toBe('PA');
    expect(calculateAge('1990-05-10', new Date('2026-05-10T12:00:00Z'))).toBe(36);
  });

  it('validates required name, unique rut and email format', () => {
    const existingPatients = [
      createPatient({
        id: 'patient-1',
        fullName: 'Ana Torres',
        rut: '12345678-9',
      }),
    ];

    const emptyName = validatePatientDraft({ id: 'patient-2', fullName: '', rut: '', email: '' }, existingPatients);
    const duplicateRut = validatePatientDraft({ id: 'patient-2', fullName: 'Luis Perez', rut: '12.345.678-9', email: '' }, existingPatients);
    const badEmail = validatePatientDraft({ id: 'patient-2', fullName: 'Luis Perez', rut: '', email: 'correo-invalido' }, existingPatients);

    expect(emptyName.valid).toBe(false);
    expect(emptyName.errors.fullName).toBeTruthy();
    expect(duplicateRut.valid).toBe(false);
    expect(duplicateRut.errors.rut).toContain('Ya existe');
    expect(badEmail.valid).toBe(false);
    expect(badEmail.errors.email).toContain('email valido');
  });
});
