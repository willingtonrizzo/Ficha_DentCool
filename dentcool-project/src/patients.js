import { PATIENTS } from './data';

const DEFAULT_MEDICAL_BACKGROUND = [
  { id: 'medical-diabetes', label: 'Diabetes', active: false, comment: '' },
  { id: 'medical-hypertension', label: 'Hipertension', active: false, comment: '' },
  { id: 'medical-pregnancy', label: 'Embarazo', active: true, comment: '22 sem' },
  { id: 'medical-cardiovascular', label: 'Enfermedad cardiovascular', active: false, comment: '' },
];

const DEFAULT_ALLERGIES = [
  { id: 'allergy-penicillin', label: 'Penicilina', active: true, comment: 'anafilaxia' },
  { id: 'allergy-latex', label: 'Latex', active: false, comment: '' },
  { id: 'medication-folic', label: 'Acido folico 5 mg / dia', active: true, comment: 'Medicamento actual' },
  { id: 'medication-iron', label: 'Hierro 100 mg / dia', active: true, comment: 'Medicamento actual' },
];

const DEFAULT_DENTAL_HABITS = [
  { id: 'habit-bruxism', label: 'Bruxismo nocturno', active: true, comment: 'Plano' },
  { id: 'habit-brushing', label: 'Cepillado 3x al dia', active: true, comment: '' },
  { id: 'habit-floss', label: 'Hilo dental', active: true, comment: '' },
  { id: 'habit-smoking', label: 'Tabaquismo', active: false, comment: '' },
];

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildPatientInitials(fullName) {
  const parts = (fullName ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return 'PA';
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function calculateAge(birthDate, referenceDate = new Date()) {
  if (!birthDate) return null;

  const parsed = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;

  let age = referenceDate.getFullYear() - parsed.getFullYear();
  const monthDiff = referenceDate.getMonth() - parsed.getMonth();
  const dayDiff = referenceDate.getDate() - parsed.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
}

export function formatBirthDate(birthDate) {
  if (!birthDate) return 'Sin fecha';

  const parsed = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return birthDate;

  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

function cloneBackgroundItems(items, fallback) {
  const source = Array.isArray(items) && items.length ? items : fallback;
  return source.map((item, index) => ({
    id: item.id ?? `${slugify(item.label ?? 'item') || 'item'}-${index + 1}`,
    label: item.label ?? '',
    active: Boolean(item.active),
    comment: item.comment ?? '',
  }));
}

export function createPatient(input) {
  const fullName = (input.fullName ?? input.name ?? 'Paciente sin nombre').trim() || 'Paciente sin nombre';
  const birthDate = input.birthDate ?? '';
  const id = input.id ?? `patient-${slugify(fullName) || 'sin-nombre'}`;
  const alerts = Array.isArray(input.alerts) ? input.alerts : [];

  return {
    id,
    rut: input.rut ?? '',
    fullName,
    birthDate,
    birthDateLabel: input.birthDateLabel ?? formatBirthDate(birthDate),
    age: input.age ?? calculateAge(birthDate),
    gender: input.gender ?? '',
    phone: input.phone ?? '',
    email: input.email ?? '',
    address: input.address ?? '',
    insurance: input.insurance ?? '',
    initials: input.initials ?? buildPatientInitials(fullName),
    status: input.status ?? 'active',
    recordNumber: input.recordNumber ?? 'DC-2026-0000',
    registeredAt: input.registeredAt ?? '',
    lastVisit: input.lastVisit ?? '',
    nextVisit: input.nextVisit ?? '',
    medicalBackground: cloneBackgroundItems(input.medicalBackground, DEFAULT_MEDICAL_BACKGROUND),
    medicalBackgroundComment: input.medicalBackgroundComment ?? '',
    allergies: cloneBackgroundItems(input.allergies, DEFAULT_ALLERGIES),
    allergiesComment: input.allergiesComment ?? '',
    dentalHabits: cloneBackgroundItems(input.dentalHabits, DEFAULT_DENTAL_HABITS),
    dentalHabitsComment: input.dentalHabitsComment ?? '',
    alerts: alerts.map((alert, index) => ({
      id: alert.id ?? `alert-${index + 1}`,
      severity: alert.severity ?? alert.type ?? 'info',
      text: alert.text ?? '',
    })),
  };
}

export function createPatientDraft(patient) {
  const shouldUseBlankName =
    patient?.id?.startsWith('patient-new-') &&
    patient?.fullName === 'Paciente nuevo';

  return {
    id: patient?.id ?? '',
    fullName: shouldUseBlankName ? '' : (patient?.fullName ?? ''),
    rut: patient?.rut ?? '',
    birthDate: patient?.birthDate ?? '',
    gender: patient?.gender ?? '',
    phone: patient?.phone ?? '',
    email: patient?.email ?? '',
    address: patient?.address ?? '',
    insurance: patient?.insurance ?? '',
    registeredAt: patient?.registeredAt ?? '',
    medicalBackground: cloneBackgroundItems(patient?.medicalBackground, DEFAULT_MEDICAL_BACKGROUND),
    medicalBackgroundComment: patient?.medicalBackgroundComment ?? '',
    allergies: cloneBackgroundItems(patient?.allergies, DEFAULT_ALLERGIES),
    allergiesComment: patient?.allergiesComment ?? '',
    dentalHabits: cloneBackgroundItems(patient?.dentalHabits, DEFAULT_DENTAL_HABITS),
    dentalHabitsComment: patient?.dentalHabitsComment ?? '',
  };
}

export function isEmptyDraftPatient(patient) {
  return Boolean(
    patient?.id?.startsWith('patient-new-') &&
    patient?.fullName === 'Paciente nuevo' &&
    !patient?.rut &&
    !patient?.birthDate &&
    !patient?.phone &&
    !patient?.email &&
    !patient?.address &&
    !patient?.insurance
  );
}

export function createEmptyPatient(sequence = 1) {
  const padded = String(sequence).padStart(4, '0');

  return createPatient({
    id: `patient-new-${Date.now()}`,
    fullName: 'Paciente nuevo',
    recordNumber: `DC-2026-${padded}`,
  });
}

export function createSeedPatients() {
  return PATIENTS.map((patient) => createPatient(patient));
}

export function normalizeRut(value = '') {
  return value.replace(/\./g, '').replace(/\s+/g, '').trim().toUpperCase();
}

export function isValidRutFormat(value = '') {
  const normalized = normalizeRut(value);
  if (!normalized) return true;
  return /^\d{7,8}-[\dK]$/.test(normalized);
}

export function isValidEmailFormat(value = '') {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function validatePatientDraft(draft, patients = []) {
  const errors = {};
  const fullName = (draft?.fullName ?? '').trim();
  const normalizedRut = normalizeRut(draft?.rut ?? '');
  const email = (draft?.email ?? '').trim();

  if (!fullName) {
    errors.fullName = 'Ingresa el nombre completo del paciente.';
  }

  if (normalizedRut && !isValidRutFormat(normalizedRut)) {
    errors.rut = 'El RUT debe tener formato 12345678-9.';
  }

  if (
    normalizedRut &&
    patients.some((patient) => patient.id !== draft?.id && normalizeRut(patient.rut) === normalizedRut)
  ) {
    errors.rut = 'Ya existe otro paciente con ese RUT.';
  }

  if (email && !isValidEmailFormat(email)) {
    errors.email = 'Ingresa un email valido.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
