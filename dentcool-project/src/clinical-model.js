import { createPatient } from './patients';
import { cloneInitialTeeth } from './odontogram';

export const RECORD_STATUS = {
  active: 'active',
  archived: 'archived',
};

export const TREATMENT_STATUS = {
  planned: 'planned',
  inProgress: 'in_progress',
  completed: 'completed',
  pendingReview: 'pending_review',
};

export const DIAGNOSIS_SEVERITY = {
  high: 'alta',
  medium: 'media',
  low: 'baja',
};

const DEFAULT_EVOLUTION_BY_PATIENT = {
  'patient-maria-soto': [
    {
      dateLabel: '22-04-2026',
      title: 'Control trimestral + destartraje supragingival',
      author: 'Dra. Nunez',
      text: 'Paciente acude a control. Se realiza profilaxis y destartraje supragingival. Se observan lesiones cariosas en 1.6 y 2.4. Se planifica restauracion con composite en proxima sesion.',
      tags: [
        { label: 'Profilaxis', tone: 'b' },
        { label: 'Diagnostico', tone: 't' },
      ],
    },
    {
      dateLabel: '15-04-2026',
      title: 'Cementacion corona metal-ceramica 3.6',
      author: 'Dr. Vega',
      text: 'Se cementa corona en 3.6. Ajuste oclusal verificado, paciente sin molestias posteriores al control inmediato.',
      tags: [
        { label: 'Protesis', tone: 'g' },
        { label: 'Tratamiento finalizado', tone: 'g' },
      ],
    },
  ],
  'patient-diego-rojas': [
    {
      dateLabel: '03-05-2026',
      title: 'Control implante 3.5',
      author: 'Dra. Nunez',
      text: 'Tejidos periimplantarios estables, sin movilidad ni dolor. Se refuerzan indicaciones de mantencion y control oclusal.',
      tags: [
        { label: 'Implante', tone: 'b' },
        { label: 'Control', tone: 't' },
      ],
    },
  ],
  'patient-camila-navarro': [
    {
      dateLabel: '29-04-2026',
      title: 'Evaluacion preventiva inicial',
      author: 'Dra. Nunez',
      text: 'Se realiza examen clinico general. Se indican medidas de higiene y control preventivo a corto plazo.',
      tags: [
        { label: 'Prevencion', tone: 'g' },
      ],
    },
  ],
};

const DEFAULT_HISTORY_BY_PATIENT = {
  'patient-maria-soto': [
    {
      dateLabel: '22-04-2026',
      title: 'Profilaxis y destartraje',
      clinician: 'Dra. Nunez',
      category: 'tratamiento',
      summary: 'Control preventivo con indicaciones de higiene y reevaluacion restauradora.',
    },
    {
      dateLabel: '15-04-2026',
      title: 'Cementacion corona 3.6',
      clinician: 'Dr. Vega',
      category: 'protesis',
      summary: 'Cierre de procedimiento prostodontico sin incidentes.',
    },
  ],
  'patient-diego-rojas': [
    {
      dateLabel: '03-05-2026',
      title: 'Control implante 3.5',
      clinician: 'Dra. Nunez',
      category: 'control',
      summary: 'Seguimiento implantologico favorable.',
    },
  ],
  'patient-camila-navarro': [
    {
      dateLabel: '29-04-2026',
      title: 'Evaluacion preventiva',
      clinician: 'Dra. Nunez',
      category: 'prevencion',
      summary: 'Ingreso preventivo y educacion de higiene oral.',
    },
  ],
};

const DEFAULT_BUDGET_BY_PATIENT = {
  'patient-maria-soto': {
    planTitle: 'Tratamiento integral preventivo y restaurador',
    coverageLabel: 'Banmedica Premium',
    dueDateLabel: '30-may',
    treatments: [
      { dateLabel: '22-04-2026', toothFdi: 16, surfaces: [], procedure: 'Evaluacion', clinician: 'Dra. Nunez', status: 'completed', priority: 'baja', cost: 20000, paid: 20000, coveragePercent: 0 },
      { dateLabel: '23-04-2026', toothFdi: 11, surfaces: [], procedure: 'Limpieza standard', clinician: 'Dra. Nunez', status: 'planned', priority: 'baja', cost: 35000, paid: 0, coveragePercent: 0 },
      { dateLabel: '24-04-2026', toothFdi: 21, surfaces: [], procedure: 'Limpieza VIP', clinician: 'Dra. Nunez', status: 'planned', priority: 'baja', cost: 45000, paid: 0, coveragePercent: 0 },
      { dateLabel: '25-04-2026', toothFdi: 37, surfaces: [], procedure: 'Sellantes', clinician: 'Dra. Nunez', status: 'planned', priority: 'baja', cost: 35000, paid: 0, coveragePercent: 0 },
      { dateLabel: '26-04-2026', toothFdi: 24, surfaces: ['O', 'D'], procedure: 'Restauracion simple', clinician: 'Dra. Nunez', status: 'in_progress', priority: 'media', cost: 35000, paid: 0, coveragePercent: 0 },
      { dateLabel: '27-04-2026', toothFdi: 12, surfaces: [], procedure: 'Blanqueamiento', clinician: 'Dra. Nunez', status: 'planned', priority: 'baja', cost: 120000, paid: 0, coveragePercent: 0 },
    ],
  },
  'patient-diego-rojas': {
    planTitle: 'Plan de control implantologico y ajuste oclusal',
    coverageLabel: 'Colmena Preferente',
    dueDateLabel: '18-may',
    treatments: [
      { dateLabel: '03-05-2026', toothFdi: 35, surfaces: [], procedure: 'Control implante', clinician: 'Dra. Nunez', status: 'completed', priority: 'media', cost: 28000, paid: 28000, coveragePercent: 20 },
      { dateLabel: '17-05-2026', toothFdi: 46, surfaces: ['O'], procedure: 'Ajuste oclusal', clinician: 'Dra. Nunez', status: 'planned', priority: 'media', cost: 22000, paid: 0, coveragePercent: 20 },
    ],
  },
  'patient-camila-navarro': {
    planTitle: 'Plan preventivo inicial',
    coverageLabel: 'Fonasa Tramo C',
    dueDateLabel: '25-may',
    treatments: [
      { dateLabel: '29-04-2026', toothFdi: 11, surfaces: [], procedure: 'Evaluacion preventiva', clinician: 'Dra. Nunez', status: 'completed', priority: 'baja', cost: 18000, paid: 18000, coveragePercent: 0 },
      { dateLabel: '12-05-2026', toothFdi: 21, surfaces: [], procedure: 'Profilaxis', clinician: 'Dra. Nunez', status: 'planned', priority: 'baja', cost: 25000, paid: 0, coveragePercent: 0 },
    ],
  },
};

const DEFAULT_DOCUMENTS_BY_PATIENT = {
  'patient-maria-soto': [
    { name: 'Rx Panoramica', dateLabel: '22-04-2026', ext: 'dcm', kind: 'radiografia' },
    { name: 'Rx Periapical 4.6', dateLabel: '08-04-2026', ext: 'dcm', kind: 'radiografia' },
    { name: 'Foto intraoral frente', dateLabel: '22-04-2026', ext: 'jpg', kind: 'foto' },
    { name: 'Consentimiento informado', dateLabel: '01-04-2026', ext: 'pdf', kind: 'consentimiento' },
  ],
  'patient-diego-rojas': [
    { name: 'Control implante 3.5', dateLabel: '03-05-2026', ext: 'pdf', kind: 'informe' },
  ],
  'patient-camila-navarro': [
    { name: 'Plan preventivo inicial', dateLabel: '29-04-2026', ext: 'pdf', kind: 'presupuesto' },
  ],
};

const TREATMENT_STATUS_MAP = {
  plan: TREATMENT_STATUS.planned,
  prog: TREATMENT_STATUS.inProgress,
  done: TREATMENT_STATUS.completed,
  pend: TREATMENT_STATUS.pendingReview,
};

const DEFAULT_MOTIVO_BY_PATIENT = {
  'patient-maria-soto': {
    consultationReason:
      'Control trimestral. Refiere sensibilidad al frio en sector superior izquierdo desde hace una semana y solicita revisar la corona del sector inferior.',
    currentIllness:
      'Dolor breve al estimulo frio, sin dolor espontaneo. Refiere aprete nocturno y mayor sensibilidad en los ultimos 7 dias.',
    extraoralExam: 'Sin hallazgos. ATM con apertura normal y sin chasquidos.',
    intraoralExam:
      'Mucosas rosadas e hidratadas. Gingivitis localizada leve en sector anteroinferior. Lesion cariosa ocluso-mesial en 1.6 y ocluso-distal en 2.4.',
    periodontalExam:
      'Sondaje promedio 2 a 3 mm. Sangrado al sondaje 12%. Placa visible 18%.',
    clinicalImpression:
      'Cuadro compatible con caries activa en sector posterior superior y sobrecarga oclusal asociada a bruxismo.',
    diagnoses: [
      { code: 'K02.1', title: 'Caries de la dentina', detail: 'Pieza 1.6, superficies oclusal y mesial', severity: DIAGNOSIS_SEVERITY.high },
      { code: 'K02.0', title: 'Caries del esmalte', detail: 'Pieza 2.4, superficies oclusal y distal', severity: DIAGNOSIS_SEVERITY.medium },
      { code: 'F45.8', title: 'Bruxismo', detail: 'Cronico, nocturno. Plano de relajacion indicado', severity: DIAGNOSIS_SEVERITY.medium },
      { code: 'K05.10', title: 'Gingivitis cronica leve', detail: 'Sector anteroinferior, sin perdida de insercion', severity: DIAGNOSIS_SEVERITY.low },
    ],
  },
  'patient-diego-rojas': {
    consultationReason:
      'Control de implante en 3.5 y evaluacion de molestias intermitentes al masticar en sector posterior inferior derecho.',
    currentIllness:
      'Refiere ansiedad dental moderada. No presenta dolor espontaneo, pero si molestia funcional esporadica.',
    extraoralExam: 'Sin asimetrias faciales. Apertura oral conservada.',
    intraoralExam:
      'Implante 3.5 sin signos inflamatorios periimplantarios. Restauraciones posteriores con desgaste leve. Higiene aceptable.',
    periodontalExam:
      'Sondaje promedio 2 a 4 mm. Sangrado localizado en molares inferiores. Placa visible 22%.',
    clinicalImpression:
      'Control implantologico favorable con necesidad de ajuste oclusal y mantencion preventiva.',
    diagnoses: [
      { code: 'Z09.8', title: 'Control posterior a tratamiento', detail: 'Seguimiento implante 3.5', severity: DIAGNOSIS_SEVERITY.low },
      { code: 'K08.8', title: 'Molestia funcional en oclusion', detail: 'Sector posterior inferior derecho', severity: DIAGNOSIS_SEVERITY.medium },
    ],
  },
  'patient-camila-navarro': {
    consultationReason:
      'Consulta preventiva general y solicitud de plan para mejorar higiene oral.',
    currentIllness:
      'Niega dolor actual. Refiere episodios ocasionales de sensibilidad gingival al cepillado.',
    extraoralExam: 'Sin hallazgos extraorales relevantes.',
    intraoralExam:
      'Mucosas sanas. Biotipo gingival fino. Leve inflamacion marginal en incisivos superiores.',
    periodontalExam:
      'Sondaje promedio 2 a 3 mm. Sangrado al sondaje 8%. Placa visible 20%.',
    clinicalImpression:
      'Riesgo preventivo bajo a moderado con enfasis en refuerzo de higiene y control de sensibilidades.',
    diagnoses: [
      { code: 'K05.10', title: 'Gingivitis cronica leve', detail: 'Inflamacion marginal localizada', severity: DIAGNOSIS_SEVERITY.low },
    ],
  },
};

function buildDiagnosisId(input, index) {
  if (input.id) return input.id;
  const code = (input.code ?? 'diag').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const title = (input.title ?? 'item').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `diag-${code || 'diag'}-${title || 'item'}-${index + 1}`;
}

function normalizeSeverity(value) {
  if (value === DIAGNOSIS_SEVERITY.high || value === DIAGNOSIS_SEVERITY.medium || value === DIAGNOSIS_SEVERITY.low) {
    return value;
  }
  return DIAGNOSIS_SEVERITY.medium;
}

export function createDiagnosis(input = {}, index = 0) {
  return {
    id: buildDiagnosisId(input, index),
    code: input.code ?? '',
    title: input.title ?? '',
    detail: input.detail ?? '',
    severity: normalizeSeverity(input.severity),
  };
}

export function createMotivoDiagnosticoRecord(input = {}) {
  return {
    consultationReason: input.consultationReason ?? '',
    currentIllness: input.currentIllness ?? '',
    extraoralExam: input.extraoralExam ?? '',
    intraoralExam: input.intraoralExam ?? '',
    periodontalExam: input.periodontalExam ?? '',
    clinicalImpression: input.clinicalImpression ?? '',
    diagnoses: Array.isArray(input.diagnoses)
      ? input.diagnoses.map((diagnosis, index) => createDiagnosis(diagnosis, index))
      : [],
    updatedAt: input.updatedAt ?? null,
  };
}

function buildEvolutionId(input, index) {
  if (input.id) return input.id;
  const date = (input.dateLabel ?? 'sin-fecha').replace(/[^0-9a-z]+/gi, '-').toLowerCase();
  const title = (input.title ?? 'nota').replace(/[^0-9a-z]+/gi, '-').toLowerCase();
  return `evo-${date}-${title}-${index + 1}`;
}

export function createEvolutionNote(input = {}, index = 0) {
  return {
    id: buildEvolutionId(input, index),
    patientId: input.patientId ?? null,
    dateLabel: input.dateLabel ?? '',
    title: input.title ?? '',
    author: input.author ?? '',
    text: input.text ?? '',
    tags: Array.isArray(input.tags)
      ? input.tags.map((tag) => ({
          label: tag.label ?? '',
          tone: tag.tone ?? 't',
        }))
      : [],
  };
}

function buildHistoryId(input, index) {
  if (input.id) return input.id;
  const date = (input.dateLabel ?? 'sin-fecha').replace(/[^0-9a-z]+/gi, '-').toLowerCase();
  const title = (input.title ?? 'evento').replace(/[^0-9a-z]+/gi, '-').toLowerCase();
  return `hist-${date}-${title}-${index + 1}`;
}

export function createHistoryEntry(input = {}, index = 0) {
  return {
    id: buildHistoryId(input, index),
    patientId: input.patientId ?? null,
    dateLabel: input.dateLabel ?? '',
    title: input.title ?? '',
    clinician: input.clinician ?? '',
    category: input.category ?? 'general',
    summary: input.summary ?? '',
  };
}

function normalizePriority(value) {
  const allowed = ['baja', 'media', 'alta'];
  return allowed.includes(value) ? value : 'baja';
}

export function createTreatmentEntry(input = {}, index = 0) {
  return {
    id: input.id ?? `tx-${index + 1}`,
    patientId: input.patientId ?? null,
    toothFdi: Number.isFinite(Number(input.toothFdi)) ? Number(input.toothFdi) : 11,
    surfaces: Array.isArray(input.surfaces) ? input.surfaces.filter((surface) => typeof surface === 'string') : [],
    procedure: input.procedure ?? '',
    clinician: input.clinician ?? '',
    status: input.status ?? TREATMENT_STATUS.planned,
    priority: normalizePriority(input.priority),
    dateLabel: input.dateLabel ?? '',
    cost: Number.isFinite(Number(input.cost)) ? Number(input.cost) : 0,
    paid: Number.isFinite(Number(input.paid)) ? Number(input.paid) : 0,
    coveragePercent: Number.isFinite(Number(input.coveragePercent)) ? Number(input.coveragePercent) : 0,
  };
}

export function createBudgetRecord(input = {}) {
  return {
    planTitle: input.planTitle ?? 'Plan sin titulo',
    coverageLabel: input.coverageLabel ?? 'Sin cobertura',
    dueDateLabel: input.dueDateLabel ?? 'Sin vencimiento',
  };
}

function buildDocumentId(input, index) {
  if (input.id) return input.id;
  const name = (input.name ?? 'documento').replace(/[^0-9a-z]+/gi, '-').toLowerCase();
  return `doc-${name}-${index + 1}`;
}

export function createDocumentEntry(input = {}, index = 0) {
  return {
    id: buildDocumentId(input, index),
    patientId: input.patientId ?? null,
    name: input.name ?? '',
    dateLabel: input.dateLabel ?? '',
    ext: input.ext ?? 'pdf',
    kind: input.kind ?? 'general',
  };
}

export function createOdontogramRecord(input) {
  const base = cloneInitialTeeth();

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return base;
  }

  for (const toothId of Object.keys(base)) {
    const toothState = input[toothId];
    if (!toothState || typeof toothState !== 'object' || Array.isArray(toothState)) continue;

    for (const surface of Object.keys(base[toothId])) {
      if (typeof toothState[surface] === 'string') {
        base[toothId][surface] = toothState[surface];
      }
    }
  }

  return base;
}

export function createSeedEvolutionNotes(patient) {
  const seed = (patient?.id && DEFAULT_EVOLUTION_BY_PATIENT[patient.id]) || [];
  return seed.map((note, index) => createEvolutionNote({ ...note, patientId: patient?.id ?? null }, index));
}

export function resolveEvolutionNotes(patient, storedNotes) {
  if (Array.isArray(storedNotes)) {
    return storedNotes.map((note, index) => createEvolutionNote({ ...note, patientId: patient?.id ?? null }, index));
  }
  return createSeedEvolutionNotes(patient);
}

export function createSeedHistoryEntries(patient) {
  const seed = (patient?.id && DEFAULT_HISTORY_BY_PATIENT[patient.id]) || [];
  return seed.map((entry, index) => createHistoryEntry({ ...entry, patientId: patient?.id ?? null }, index));
}

export function resolveHistoryEntries(patient, storedEntries) {
  if (Array.isArray(storedEntries)) {
    return storedEntries.map((entry, index) => createHistoryEntry({ ...entry, patientId: patient?.id ?? null }, index));
  }
  return createSeedHistoryEntries(patient);
}

export function createSeedBudgetRecord(patient) {
  const seed = (patient?.id && DEFAULT_BUDGET_BY_PATIENT[patient.id]) || {};
  return createBudgetRecord(seed);
}

export function resolveBudgetRecord(patient, storedRecord) {
  return createBudgetRecord(storedRecord ?? createSeedBudgetRecord(patient));
}

export function createSeedTreatments(patient) {
  const seed = (patient?.id && DEFAULT_BUDGET_BY_PATIENT[patient.id]?.treatments) || [];
  return seed.map((treatment, index) => createTreatmentEntry({ ...treatment, patientId: patient?.id ?? null }, index));
}

export function resolveTreatments(patient, storedTreatments) {
  if (Array.isArray(storedTreatments)) {
    return storedTreatments.map((treatment, index) => createTreatmentEntry({ ...treatment, patientId: patient?.id ?? null }, index));
  }
  return createSeedTreatments(patient);
}

export function createSeedDocuments(patient) {
  const seed = (patient?.id && DEFAULT_DOCUMENTS_BY_PATIENT[patient.id]) || [];
  return seed.map((document, index) => createDocumentEntry({ ...document, patientId: patient?.id ?? null }, index));
}

export function resolveDocuments(patient, storedDocuments) {
  if (Array.isArray(storedDocuments)) {
    return storedDocuments.map((document, index) => createDocumentEntry({ ...document, patientId: patient?.id ?? null }, index));
  }
  return createSeedDocuments(patient);
}

export function createClinicalPatientRecord(input = {}, patient) {
  return {
    selectedTooth: Number.isInteger(input.selectedTooth) ? input.selectedTooth : null,
    selectedSurface: typeof input.selectedSurface === 'string' ? input.selectedSurface : null,
    activeTab: typeof input.activeTab === 'string' ? input.activeTab : null,
    odontogram: createOdontogramRecord(input.odontogram),
    motivoDiagnostico: resolveMotivoDiagnosticoRecord(patient, input.motivoDiagnostico),
    evolutionNotes: resolveEvolutionNotes(patient, input.evolutionNotes),
    historyEntries: resolveHistoryEntries(patient, input.historyEntries),
    budget: resolveBudgetRecord(patient, input.budget),
    treatments: resolveTreatments(patient, input.treatments),
    documents: resolveDocuments(patient, input.documents),
  };
}

export function createSeedMotivoDiagnosticoRecord(patient) {
  const template =
    (patient?.id && DEFAULT_MOTIVO_BY_PATIENT[patient.id]) ||
    {
      consultationReason: `Primera evaluacion clinica de ${patient?.fullName ?? 'paciente activo'}.`,
      currentIllness: '',
      extraoralExam: '',
      intraoralExam: '',
      periodontalExam: '',
      clinicalImpression: '',
      diagnoses: [],
    };

  return createMotivoDiagnosticoRecord(template);
}

export function resolveMotivoDiagnosticoRecord(patient, storedRecord) {
  return createMotivoDiagnosticoRecord(storedRecord ?? createSeedMotivoDiagnosticoRecord(patient));
}

export function createClinicalRecord(input) {
  return {
    id: input.id,
    patientId: input.patientId,
    status: input.status ?? RECORD_STATUS.active,
    selectedTooth: input.selectedTooth ?? null,
    selectedSurface: input.selectedSurface ?? null,
    activeTab: input.activeTab ?? 'antecedentes',
    odontogram: createOdontogramRecord(input.odontogram),
    treatments: Array.isArray(input.treatments)
      ? input.treatments.map((treatment, index) => createTreatmentEntry(treatment, index))
      : [],
    evolutionNotes: Array.isArray(input.evolutionNotes)
      ? input.evolutionNotes.map((note, index) => createEvolutionNote(note, index))
      : [],
    historyEntries: Array.isArray(input.historyEntries)
      ? input.historyEntries.map((entry, index) => createHistoryEntry(entry, index))
      : [],
    motivoDiagnostico: createMotivoDiagnosticoRecord(input.motivoDiagnostico),
    budget: createBudgetRecord(input.budget),
    documents: Array.isArray(input.documents)
      ? input.documents.map((document, index) => createDocumentEntry(document, index))
      : [],
    appointments: input.appointments ?? [],
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}

export function mapMockPatient(mockPatient) {
  return createPatient({
    id: mockPatient.id,
    rut: mockPatient.rut,
    fullName: mockPatient.fullName ?? mockPatient.name,
    birthDate: mockPatient.birthDate ?? mockPatient.birth,
    age: mockPatient.age,
    gender: mockPatient.gender,
    phone: mockPatient.phone,
    email: mockPatient.email,
    address: mockPatient.address,
    insurance: mockPatient.insurance,
    initials: mockPatient.initials,
    recordNumber: mockPatient.recordNumber,
    lastVisit: mockPatient.lastVisit,
    nextVisit: mockPatient.nextVisit,
    alerts: mockPatient.alerts.map((alert, index) => ({
      id: `alert-${index + 1}`,
      severity: alert.severity ?? alert.type,
      text: alert.text,
    })),
  });
}

export function mapMockTreatments(mockTreatments, patientId) {
  return mockTreatments.map((item, index) =>
    createTreatmentEntry({
      id: `tx-${item.id}`,
      patientId,
      toothFdi: item.diente,
      surfaces: item.sup,
      procedure: item.proc,
      clinician: item.prof,
      status: TREATMENT_STATUS_MAP[item.estado] ?? TREATMENT_STATUS.planned,
      priority: item.prio,
      dateLabel: item.fecha,
      cost: item.costo,
      paid: item.pagado,
      coveragePercent: item.cobertura,
    }, index)
  );
}

export function mapMockEvolution(mockEvolution, patientId) {
  return mockEvolution.map((item, index) =>
    createEvolutionNote({
      id: `evo-${index + 1}`,
      patientId,
      dateLabel: `${item.dia}-${item.mes}-${item.year}`,
      title: item.title,
      author: item.by,
      text: item.text,
      tags: item.tags.map(([label, tone]) => ({ label, tone })),
    }, index)
  );
}

export function mapMockHistory(mockHistory, patientId) {
  return mockHistory.map((item, index) =>
    createHistoryEntry({
      id: `hist-${index + 1}`,
      patientId,
      dateLabel: item.date,
      title: item.title,
      clinician: item.doc,
      category: 'general',
      summary: '',
    }, index)
  );
}

export function buildClinicalRecordFromMocks({
  patient,
  teeth,
  treatments,
  evolution,
  history,
  clinicalRecord,
  uiContext = {},
}) {
  const mappedPatient = mapMockPatient(patient);
  const now = '2026-05-09T00:00:00Z';
  const patientClinicalRecord = createClinicalPatientRecord(clinicalRecord, mappedPatient);

  return {
    patient: mappedPatient,
    record: createClinicalRecord({
      id: 'record-maria-soto',
      patientId: mappedPatient.id,
      status: RECORD_STATUS.active,
      selectedTooth: patientClinicalRecord.selectedTooth ?? uiContext.selectedTooth ?? 16,
      selectedSurface: patientClinicalRecord.selectedSurface ?? uiContext.selectedSurface ?? 'O',
      activeTab: patientClinicalRecord.activeTab ?? uiContext.activeTab ?? 'antecedentes',
      odontogram: patientClinicalRecord.odontogram ?? teeth,
      treatments:
        patientClinicalRecord.treatments.length > 0
          ? patientClinicalRecord.treatments
          : mapMockTreatments(treatments, mappedPatient.id),
      evolutionNotes:
        patientClinicalRecord.evolutionNotes.length > 0
          ? patientClinicalRecord.evolutionNotes
          : mapMockEvolution(evolution, mappedPatient.id),
      historyEntries:
        patientClinicalRecord.historyEntries.length > 0
          ? patientClinicalRecord.historyEntries
          : mapMockHistory(history, mappedPatient.id),
      motivoDiagnostico: resolveMotivoDiagnosticoRecord(mappedPatient, patientClinicalRecord.motivoDiagnostico),
      budget: resolveBudgetRecord(mappedPatient, patientClinicalRecord.budget),
      documents: resolveDocuments(mappedPatient, patientClinicalRecord.documents),
      createdAt: now,
      updatedAt: now,
    }),
  };
}
