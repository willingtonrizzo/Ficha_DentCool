import { useEffect, useRef, useState } from 'react';
import { EVOLUTION, HISTORY, STORAGE_KEYS, TREATMENTS } from './data';
import { FinanceDashboard, FloatingNewPatientButton, HomeDashboard, LoginScreen, PatientsDirectoryView, PriceListView, Sidebar, TopbarInner, PatientHeader, PatientsSheet, Odontogram, ToothPanel } from './app';
import { Tabs, Antecedentes, Motivo, Evolucion, Presupuesto, Insumos, InventarioInsumos, Documentos, Historial, NotasRapidas, AgendaClinica, CobrosAbonos, TreatmentsTable, NextAppointments } from './tabs';
import { updateToothSurfaceState } from './odontogram';
import {
  buildClinicalRecordFromMocks,
  createAppointmentEntry,
  createClinicalPatientRecord,
  createDiagnosis,
  createDocumentEntry,
  createEvolutionNote,
  createHistoryEntry,
  createPaymentEntry,
  createPricingBudgetEntry,
  createTreatmentEntry,
  syncTreatmentPaidWithPayments,
  TREATMENT_STATUS,
  resolveMotivoDiagnosticoRecord,
} from './clinical-model';
import { createEmptyPatient, createPatient, getPatientDisplayName, isEmptyDraftPatient, normalizeRut, validatePatientDraft } from './patients';
import {
  buildFinanceDashboard,
  buildAcceptedSnapshotsReportRows,
  buildFinanceSummaryReportRows,
  DEFAULT_PRICING_TREATMENTS,
  calculatePricingResult,
  createEmptyPricingTreatment,
  createPricingCatalog,
  exportAcceptedSnapshotsCsv,
  exportFinanceSummaryCsv,
  findPricingTreatmentForProcedure,
} from './pricing';
import {
  loadActivePatientId,
  loadPricingCatalog,
  loadClinicalRecords,
  loadPatientDirectory,
  loadPricingSettings,
  loadTeethState,
  loadUiContext,
  flushStorageWrites,
  saveClinicalRecords,
  resetPatientDirectory,
  resetPricingCatalog,
  resetPricingSettings,
  resetTeethState,
  resetUiContext,
  saveActivePatientId,
  savePatientDirectory,
  savePricingCatalog,
  savePricingSettings,
  saveUiContext,
} from './storage';
import {
  clearAuthSession,
  getRolePermissions,
  loadAuthSession,
  saveAuthSession,
  validateLocalLogin,
} from './auth';

function formatShortDateLabel(date = new Date()) {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function parseVisitDate(value) {
  const months = {
    ene: 0,
    enero: 0,
    feb: 1,
    febrero: 1,
    mar: 2,
    marzo: 2,
    abr: 3,
    abril: 3,
    may: 4,
    mayo: 4,
    jun: 5,
    junio: 5,
    jul: 6,
    julio: 6,
    ago: 7,
    agosto: 7,
    sep: 8,
    sept: 8,
    septiembre: 8,
    oct: 9,
    octubre: 9,
    nov: 10,
    noviembre: 10,
    dic: 11,
    diciembre: 11,
  };
  const match = (value ?? '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = months[match[2]];
  const year = Number(match[3]);
  if (!Number.isInteger(day) || !Number.isInteger(year) || month == null) return null;
  const date = new Date(year, month, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getNextVisitFromAppointments(appointments = []) {
  const next = appointments
    .filter((appointment) => appointment?.status !== 'cancelled' && appointment?.dateLabel && appointment.dateLabel !== 'Sin cita')
    .map((appointment) => ({
      ...appointment,
      visitDate: parseVisitDate(appointment.dateLabel),
    }))
    .filter((appointment) => appointment.visitDate)
    .sort((a, b) => a.visitDate.getTime() - b.visitDate.getTime())[0];

  return next?.dateLabel ?? 'Sin cita';
}

export default function App() {
  const defaultPatientContext = {
    selectedTooth: 16,
    selectedSurface: 'O',
    activeTab: 'antecedentes',
  };
  const initialUiContext = loadUiContext();
  const [patients, setPatients] = useState(() => loadPatientDirectory());
  const [activePatientId, setActivePatientId] = useState(() => loadActivePatientId());
  const [clinicalRecords, setClinicalRecords] = useState(() => loadClinicalRecords());
  const initialActivePatient =
    patients.find((patient) => patient.id === activePatientId) ?? patients[0] ?? null;
  const initialPatientRecord = initialActivePatient
    ? createClinicalPatientRecord(clinicalRecords[initialActivePatient.id], initialActivePatient)
    : null;
  const hasLegacyTeethState =
    typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEYS.odontogram) != null;
  const [activeView, setActiveView] = useState('home');
  const [authSession, setAuthSession] = useState(() => loadAuthSession());
  const [financeFilters, setFinanceFilters] = useState({
    range: 'all',
    status: 'all',
    patientId: 'all',
    treatmentId: 'all',
  });
  const [pricingSettings, setPricingSettings] = useState(() => loadPricingSettings());
  const [pricingCatalog, setPricingCatalog] = useState(() => loadPricingCatalog());
  const [teeth, setTeeth] = useState(() =>
    hasLegacyTeethState ? loadTeethState() : initialPatientRecord?.odontogram ?? loadTeethState()
  );
  const [selected, setSelected] = useState(() =>
    hasLegacyTeethState ? initialUiContext.selectedTooth : initialPatientRecord?.selectedTooth ?? defaultPatientContext.selectedTooth
  );
  const [selectedSurface, setSelectedSurface] = useState(() =>
    hasLegacyTeethState ? initialUiContext.selectedSurface : initialPatientRecord?.selectedSurface ?? defaultPatientContext.selectedSurface
  );
  const [activeTab, setActiveTab] = useState(() =>
    hasLegacyTeethState ? initialUiContext.activeTab : initialPatientRecord?.activeTab ?? defaultPatientContext.activeTab
  );
  const [saveState, setSaveState] = useState('loaded');
  const [patientSaveState, setPatientSaveState] = useState('loaded');
  const [clinicalSaveState, setClinicalSaveState] = useState('loaded');
  const [isPatientSheetOpen, setIsPatientSheetOpen] = useState(false);
  const [patientSheetSection, setPatientSheetSection] = useState('datos');
  const [patientDraftPreview, setPatientDraftPreview] = useState(null);
  const [focusedEvolutionNoteId, setFocusedEvolutionNoteId] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [lastPatientSavedAt, setLastPatientSavedAt] = useState(null);
  const [lastClinicalSavedAt, setLastClinicalSavedAt] = useState(null);
  const didMountTeethRef = useRef(false);
  const didMountUiRef = useRef(false);
  const didMountPatientsRef = useRef(false);
  const didMountClinicalRef = useRef(false);
  const didMountPricingRef = useRef(false);
  const didMountPricingCatalogRef = useRef(false);
  const didMigrateLegacyTeethRef = useRef(false);
  const didHydratePatientOdontogramRef = useRef(false);
  const skipNextOdontogramPersistRef = useRef(false);
  const clinicalPersistTimeoutRef = useRef(null);

  const activePatient = patients.find((patient) => patient.id === activePatientId) ?? patients[0] ?? null;
  const permissions = getRolePermissions(authSession?.roleId ?? 'staff');
  const isStaff = authSession?.roleId === 'staff';
  const visibleActivePatient = patientDraftPreview?.id === activePatientId ? patientDraftPreview : activePatient;
  const agendaCount = patients.filter(
    (patient) => patient.nextVisit && patient.nextVisit !== 'Sin cita' && patient.nextVisit !== 'Sin agendar'
  ).length;

  const handleSetState = (state) => {
    setSaveState('dirty');
    setTeeth((prev) => updateToothSurfaceState(prev, selected, selectedSurface, state));
  };

  const handleLogin = (roleId, password) => {
    const session = validateLocalLogin(roleId, password);
    if (!session) return { ok: false };
    saveAuthSession(session);
    setAuthSession(session);
    setActiveView('home');
    return { ok: true };
  };

  const handleLogout = () => {
    clearAuthSession();
    setAuthSession(null);
    setActiveView('home');
  };

  const handleNavigate = (view) => {
    if (!permissions.views.includes(view)) {
      setActiveView('home');
      return;
    }
    setActiveView(view);
  };

  const handleResetOdontogram = () => {
    const fresh = resetTeethState();
    const freshUi = resetUiContext();
    setTeeth(fresh);
    setSelected(freshUi.selectedTooth);
    setSelectedSurface(freshUi.selectedSurface);
    setActiveTab(freshUi.activeTab);
    setSaveState('reset');
    setLastSavedAt(null);
  };

  const handleCreatePatient = () => {
    const existingDraftPatient = patients.find((patient) => isEmptyDraftPatient(patient));

    if (existingDraftPatient) {
      setActivePatientId(existingDraftPatient.id);
      setIsPatientSheetOpen(true);
      return;
    }

    const nextPatient = createEmptyPatient(patients.length + 473);
    setPatientSaveState('created');
    setPatients((current) => [nextPatient, ...current]);
    setActivePatientId(nextPatient.id);
    setIsPatientSheetOpen(true);
  };

  const handleSavePatient = (draft) => {
    const validation = validatePatientDraft(draft, patients);
    if (!validation.valid) {
      setPatientSaveState('error');
      return validation;
    }

    const today = new Intl.DateTimeFormat('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date());

    setPatientSaveState('dirty');
    setPatients((current) =>
      current.map((patient) =>
        patient.id === draft.id
          ? createPatient({
              ...patient,
              ...draft,
              rut: normalizeRut(draft.rut ?? ''),
              email: (draft.email ?? '').trim(),
              fullName: (draft.fullName ?? '').trim(),
              registeredAt: patient.registeredAt || draft.registeredAt || today,
            })
          : patient
      )
    );
    setPatientDraftPreview(null);
    return { valid: true, errors: {} };
  };

  const handleDraftPatientChange = (draft) => {
    if (!draft?.id) return;
    setPatientDraftPreview(createPatient({
      ...patients.find((patient) => patient.id === draft.id),
      ...draft,
      rut: normalizeRut(draft.rut ?? ''),
    }));
    setPatients((current) =>
      current.map((patient) =>
        patient.id === draft.id
          ? createPatient({
              ...patient,
              ...draft,
              rut: normalizeRut(draft.rut ?? '') || patient.rut,
              email: (draft.email ?? '').trim() || patient.email,
              fullName: (draft.fullName ?? '').trim() || patient.fullName,
              registeredAt: patient.registeredAt || draft.registeredAt || '',
            })
          : patient
      )
    );
  };

  const handleDeletePatient = (patientId) => {
    setPatientSaveState('dirty');
    setPatients((current) => current.filter((patient) => patient.id !== patientId));
    setClinicalRecords((current) => {
      const next = { ...current };
      delete next[patientId];
      return next;
    });
  };

  const handleOpenPatientSheet = (sectionId = 'datos') => {
    setPatientSheetSection(sectionId);
    setIsPatientSheetOpen(true);
  };

  const handleOpenPatientFromDirectory = (patientId) => {
    setActivePatientId(patientId);
    setActiveView('patient');
    setIsPatientSheetOpen(false);
  };

  const handleEditPatientFromDirectory = (patientId, sectionId = 'datos') => {
    setActivePatientId(patientId);
    setActiveView('patient');
    setPatientSheetSection(sectionId);
    setIsPatientSheetOpen(true);
  };

  const handleClosePatientSheet = () => {
    setIsPatientSheetOpen(false);
  };

  useEffect(() => {
    if (!authSession) return;
    if (!permissions.views.includes(activeView)) {
      setActiveView('home');
    }
  }, [activeView, authSession, permissions.views]);

  useEffect(() => {
    if (!permissions.patientTabs.includes(activeTab)) {
      setActiveTab(permissions.patientTabs[0] ?? 'antecedentes');
    }
  }, [activeTab, permissions.patientTabs]);

  useEffect(() => {
    if (!permissions.sheetSections.includes(patientSheetSection)) {
      setPatientSheetSection(permissions.sheetSections[0] ?? 'datos');
    }
  }, [patientSheetSection, permissions.sheetSections]);

  useEffect(() => {
    setPatientDraftPreview(null);
  }, [activePatientId]);

  const updateActiveClinicalRecord = (updater) => {
    if (!activePatient) return;
    setClinicalSaveState('dirty');
    setClinicalRecords((current) => {
      const activeRecord = createClinicalPatientRecord(current[activePatient.id], activePatient);
      return {
        ...current,
        [activePatient.id]: updater(activeRecord),
      };
    });
  };

  const handleMotivoFieldChange = (field, value) => {
    updateActiveClinicalRecord((activeRecord) => ({
      ...activeRecord,
      motivoDiagnostico: {
        ...resolveMotivoDiagnosticoRecord(activePatient, activeRecord.motivoDiagnostico),
        [field]: value,
      },
    }));
  };

  const handleDiagnosisChange = (diagnosisId, field, value) => {
    updateActiveClinicalRecord((activeRecord) => ({
      ...activeRecord,
      motivoDiagnostico: {
        ...resolveMotivoDiagnosticoRecord(activePatient, activeRecord.motivoDiagnostico),
        diagnoses: resolveMotivoDiagnosticoRecord(activePatient, activeRecord.motivoDiagnostico).diagnoses.map((diagnosis) =>
            diagnosis.id === diagnosisId ? { ...diagnosis, [field]: value } : diagnosis
          ),
      },
    }));
  };

  const handleAddDiagnosis = () => {
    updateActiveClinicalRecord((activeRecord) => {
      const motivoRecord = resolveMotivoDiagnosticoRecord(activePatient, activeRecord.motivoDiagnostico);
      return {
        ...activeRecord,
        motivoDiagnostico: {
          ...motivoRecord,
          diagnoses: [
            ...motivoRecord.diagnoses,
            createDiagnosis(
              {
                code: '',
                title: 'Nuevo diagnostico',
                detail: '',
                severity: 'media',
              },
              motivoRecord.diagnoses.length
            ),
          ],
        },
      };
    });
  };

  const handleRemoveDiagnosis = (diagnosisId) => {
    updateActiveClinicalRecord((activeRecord) => {
      const motivoRecord = resolveMotivoDiagnosticoRecord(activePatient, activeRecord.motivoDiagnostico);
      return {
        ...activeRecord,
        motivoDiagnostico: {
          ...motivoRecord,
          diagnoses: motivoRecord.diagnoses.filter((diagnosis) => diagnosis.id !== diagnosisId),
        },
      };
    });
  };

  const handleEvolutionNoteChange = (noteId, field, value) => {
    updateActiveClinicalRecord((activeRecord) => ({
      ...activeRecord,
      evolutionNotes: activeRecord.evolutionNotes.map((note) =>
        note.id === noteId ? { ...note, [field]: value } : note
      ),
    }));
  };

  const handleAddEvolutionNote = () => {
    updateActiveClinicalRecord((activeRecord) => {
      const today = new Intl.DateTimeFormat('en-GB').format(new Date()).replace(/\//g, '-');
      return {
        ...activeRecord,
        evolutionNotes: [
          createEvolutionNote(
            {
              patientId: activePatient?.id ?? null,
              dateLabel: today,
              title: 'Nueva nota clinica',
              author: 'Dra. responsable',
              text: '',
              tags: [{ label: 'Seguimiento', tone: 't' }],
            },
            activeRecord.evolutionNotes.length
          ),
          ...activeRecord.evolutionNotes,
        ],
      };
    });
  };

  const handleRemoveEvolutionNote = (noteId) => {
    updateActiveClinicalRecord((activeRecord) => ({
      ...activeRecord,
      evolutionNotes: activeRecord.evolutionNotes.filter((note) => note.id !== noteId),
    }));
  };

  const handleSaveEvolutionAndOpenHistory = () => {
    setClinicalSaveState('dirty');
    if (!activePatient) return;
    if (clinicalPersistTimeoutRef.current) {
      clearTimeout(clinicalPersistTimeoutRef.current);
      clinicalPersistTimeoutRef.current = null;
    }

    setClinicalRecords((current) => {
      const activeRecord = createClinicalPatientRecord(current[activePatient.id], activePatient);
      const historyByEvolutionId = new Map(
        activeRecord.historyEntries
          .filter((entry) => typeof entry.id === 'string' && entry.id.startsWith('hist-from-evo-'))
          .map((entry) => [entry.id.replace('hist-from-evo-', ''), entry])
      );
      const evolutionHistoryEntries = activeRecord.evolutionNotes
        .filter((note) => note.title || note.text)
        .map((note, index) => {
          const existingHistoryEntry = historyByEvolutionId.get(note.id);
          return createHistoryEntry(
            {
              ...existingHistoryEntry,
              id: `hist-from-evo-${note.id}`,
              patientId: activePatient.id,
              dateLabel: note.dateLabel,
              title: note.title || 'Evolucion clinica',
              clinician: note.author || 'Dra. responsable',
              category: existingHistoryEntry?.category || 'control',
              summary: note.text || 'Evolucion clinica guardada sin detalle adicional.',
            },
            index
          );
        });
      const manualHistoryEntries = activeRecord.historyEntries.filter(
        (entry) => !(typeof entry.id === 'string' && entry.id.startsWith('hist-from-evo-'))
      );
      const nextRecord = {
        ...activeRecord,
        historyEntries: [...evolutionHistoryEntries, ...manualHistoryEntries],
      };
      const nextRecords = {
        ...current,
        [activePatient.id]: nextRecord,
      };

      saveClinicalRecords(nextRecords);
      void flushStorageWrites().then(() => {
        setClinicalSaveState('saved');
        setLastClinicalSavedAt(new Date());
        setPatientSheetSection('historial');
      });

      return nextRecords;
    });
  };

  const handleEditEvolutionFromHistory = (noteId) => {
    setFocusedEvolutionNoteId(noteId);
    setPatientSheetSection('evolucion');
  };

  const handleHistoryEntryChange = (entryId, field, value) => {
    updateActiveClinicalRecord((activeRecord) => ({
      ...activeRecord,
      historyEntries: activeRecord.historyEntries.map((entry) =>
        entry.id === entryId ? { ...entry, [field]: value } : entry
      ),
    }));
  };

  const handleAddHistoryEntry = () => {
    updateActiveClinicalRecord((activeRecord) => {
      const today = new Intl.DateTimeFormat('en-GB').format(new Date()).replace(/\//g, '-');
      return {
        ...activeRecord,
        historyEntries: [
          createHistoryEntry(
            {
              patientId: activePatient?.id ?? null,
              dateLabel: today,
              title: 'Nuevo evento clinico',
              clinician: 'Dra. responsable',
              category: 'general',
              summary: '',
            },
            activeRecord.historyEntries.length
          ),
          ...activeRecord.historyEntries,
        ],
      };
    });
  };

  const handleRemoveHistoryEntry = (entryId) => {
    updateActiveClinicalRecord((activeRecord) => ({
      ...activeRecord,
      historyEntries: activeRecord.historyEntries.filter((entry) => entry.id !== entryId),
    }));
  };

  const handleAppointmentChange = (appointmentId, field, value) => {
    if (!activePatient) return;
    const activeRecord = createClinicalPatientRecord(clinicalRecords[activePatient.id], activePatient);
    const nextAppointments = activeRecord.appointments.map((appointment) =>
      appointment.id === appointmentId
        ? {
            ...appointment,
            [field]: value,
          }
        : appointment
    );
    const nextVisit = getNextVisitFromAppointments(nextAppointments);

    setClinicalSaveState('dirty');
    setClinicalRecords((current) => ({
      ...current,
      [activePatient.id]: {
        ...activeRecord,
        appointments: nextAppointments,
      },
    }));
    setPatients((current) =>
      current.map((patient) =>
        patient.id === activePatient.id
          ? { ...patient, nextVisit }
          : patient
      )
    );
  };

  const handleAddAppointment = () => {
    if (!activePatient) return;
    const activeRecord = createClinicalPatientRecord(clinicalRecords[activePatient.id], activePatient);
    const nextAppointments = [
      createAppointmentEntry(
        {
          patientId: activePatient.id,
          dateLabel: formatShortDateLabel(new Date()),
          timeLabel: '10:00',
          reason: 'Seguimiento clinico',
          clinician: 'Dra. responsable',
          status: 'scheduled',
          notes: '',
          source: 'manual',
        },
        activeRecord.appointments.length
      ),
      ...activeRecord.appointments,
    ];
    const nextVisit = getNextVisitFromAppointments(nextAppointments);

    setClinicalSaveState('dirty');
    setClinicalRecords((current) => ({
      ...current,
      [activePatient.id]: {
        ...activeRecord,
        appointments: nextAppointments,
      },
    }));
    setPatients((current) =>
      current.map((patient) =>
        patient.id === activePatient.id
          ? { ...patient, nextVisit }
          : patient
      )
    );
  };

  const handleRemoveAppointment = (appointmentId) => {
    if (!activePatient) return;
    const activeRecord = createClinicalPatientRecord(clinicalRecords[activePatient.id], activePatient);
    const nextAppointments = activeRecord.appointments.filter((appointment) => appointment.id !== appointmentId);
    const nextVisit = getNextVisitFromAppointments(nextAppointments);

    setClinicalSaveState('dirty');
    setClinicalRecords((current) => ({
      ...current,
      [activePatient.id]: {
        ...activeRecord,
        appointments: nextAppointments,
      },
    }));
    setPatients((current) =>
      current.map((patient) =>
        patient.id === activePatient.id
          ? { ...patient, nextVisit }
          : patient
      )
    );
  };

  const handlePaymentChange = (paymentId, field, value) => {
    if (!activePatient) return;
    const activeRecord = createClinicalPatientRecord(clinicalRecords[activePatient.id], activePatient);
    const nextPayments = activeRecord.paymentEntries.map((payment) =>
      payment.id === paymentId
        ? {
            ...payment,
            [field]: field === 'amount' ? Number(value) || 0 : value,
          }
        : payment
    );
    const nextTreatments = syncTreatmentPaidWithPayments(activeRecord.treatments, nextPayments);

    setClinicalSaveState('dirty');
    setClinicalRecords((current) => ({
      ...current,
      [activePatient.id]: {
        ...activeRecord,
        paymentEntries: nextPayments,
        treatments: nextTreatments,
      },
    }));
  };

  const handleAddPayment = () => {
    if (!activePatient) return;
    const activeRecord = createClinicalPatientRecord(clinicalRecords[activePatient.id], activePatient);
    const nextPayments = [
      createPaymentEntry(
        {
          patientId: activePatient.id,
          treatmentId: activeRecord.treatments[0]?.id ?? null,
          dateLabel: formatShortDateLabel(new Date()),
          amount: 0,
          method: 'cash',
          concept: activeRecord.treatments[0]?.procedure ? `Abono ${activeRecord.treatments[0].procedure}` : 'Nuevo abono',
          notes: '',
          status: 'received',
          source: 'manual',
        },
        activeRecord.paymentEntries.length
      ),
      ...activeRecord.paymentEntries,
    ];
    const nextTreatments = syncTreatmentPaidWithPayments(activeRecord.treatments, nextPayments);

    setClinicalSaveState('dirty');
    setClinicalRecords((current) => ({
      ...current,
      [activePatient.id]: {
        ...activeRecord,
        paymentEntries: nextPayments,
        treatments: nextTreatments,
      },
    }));
  };

  const handleRemovePayment = (paymentId) => {
    if (!activePatient) return;
    const activeRecord = createClinicalPatientRecord(clinicalRecords[activePatient.id], activePatient);
    const nextPayments = activeRecord.paymentEntries.filter((payment) => payment.id !== paymentId);
    const nextTreatments = syncTreatmentPaidWithPayments(activeRecord.treatments, nextPayments);

    setClinicalSaveState('dirty');
    setClinicalRecords((current) => ({
      ...current,
      [activePatient.id]: {
        ...activeRecord,
        paymentEntries: nextPayments,
        treatments: nextTreatments,
      },
    }));
  };

  const handleBudgetFieldChange = (field, value) => {
    updateActiveClinicalRecord((activeRecord) => ({
      ...activeRecord,
      budget: {
        ...activeRecord.budget,
        [field]: value,
      },
    }));
  };

  const handleTreatmentChange = (treatmentId, field, value) => {
    updateActiveClinicalRecord((activeRecord) => ({
      ...activeRecord,
      treatments: activeRecord.treatments.map((treatment) => {
        if (treatment.id !== treatmentId) return treatment;
        const numericFields = ['toothFdi', 'cost', 'coveragePercent'];
        return {
          ...treatment,
          [field]: numericFields.includes(field) ? Number(value) || 0 : value,
        };
      }),
    }));
  };

  const handleAddTreatment = (input = {}) => {
    updateActiveClinicalRecord((activeRecord) => {
      const today = new Intl.DateTimeFormat('en-GB').format(new Date()).replace(/\//g, '-');
      return {
        ...activeRecord,
        treatments: [
          ...activeRecord.treatments,
          createTreatmentEntry(
            {
              patientId: activePatient?.id ?? null,
              toothFdi: selected ?? 11,
              surfaces: selectedSurface ? [selectedSurface] : [],
              procedure: 'Nuevo tratamiento',
              clinician: 'Dra. responsable',
              status: TREATMENT_STATUS.planned,
              priority: 'baja',
              dateLabel: today,
              cost: 0,
              paid: 0,
              coveragePercent: 0,
              ...input,
            },
            activeRecord.treatments.length
          ),
        ],
      };
    });
  };

  const handleRemoveTreatment = (treatmentId) => {
    updateActiveClinicalRecord((activeRecord) => ({
      ...activeRecord,
      treatments: activeRecord.treatments.filter((treatment) => treatment.id !== treatmentId),
      paymentEntries: activeRecord.paymentEntries.filter((payment) => payment.treatmentId !== treatmentId),
    }));
  };

  const handleDocumentChange = (documentId, field, value) => {
    updateActiveClinicalRecord((activeRecord) => ({
      ...activeRecord,
      documents: activeRecord.documents.map((document) =>
        document.id === documentId ? { ...document, [field]: value } : document
      ),
    }));
  };

  const handleAddDocument = () => {
    updateActiveClinicalRecord((activeRecord) => {
      const today = new Intl.DateTimeFormat('en-GB').format(new Date()).replace(/\//g, '-');
      return {
        ...activeRecord,
        documents: [
          createDocumentEntry(
            {
              patientId: activePatient?.id ?? null,
              name: 'Nuevo documento',
              dateLabel: today,
              ext: 'pdf',
              kind: 'general',
            },
            activeRecord.documents.length
          ),
          ...activeRecord.documents,
        ],
      };
    });
  };

  const handleRemoveDocument = (documentId) => {
    updateActiveClinicalRecord((activeRecord) => ({
      ...activeRecord,
      documents: activeRecord.documents.filter((document) => document.id !== documentId),
    }));
  };

  const handleQuickNotesSave = (nextNotes) => {
    if (!activePatient) return;
    setClinicalSaveState('dirty');
    setClinicalRecords((current) => {
      const activeRecord = createClinicalPatientRecord(current[activePatient.id], activePatient);
      const nextRecords = {
        ...current,
        [activePatient.id]: {
          ...activeRecord,
          quickNotes: {
            ...activeRecord.quickNotes,
            ...nextNotes,
          },
        },
      };

      saveClinicalRecords(nextRecords);
      void flushStorageWrites().then(() => {
        setClinicalSaveState('saved');
        setLastClinicalSavedAt(new Date());
      });

      return nextRecords;
    });
  };

  const handlePricingSettingChange = (field, value) => {
    setPricingSettings((current) => ({
      ...current,
      [field]: Number(value) || 0,
    }));
  };

  const handleResetPricingSettings = () => {
    setPricingSettings(resetPricingSettings());
  };

  const handlePricingCatalogChange = (treatmentId, field, value) => {
    setPricingCatalog((current) =>
      current.map((treatment) => {
        if (treatment.id !== treatmentId) return treatment;

        const numericFields = [
          'basePrice',
          'durationHours',
          'suppliesCost',
          'marketingCost',
          'adminCost',
          'transportCost',
          'paymentFeePercent',
          'reservePercent',
          'minPrice',
          'healthyPrice',
          'idealPrice',
          'maxRecommendedDiscountPercent',
          'defaultLaborCost',
          'defaultLaborPercent',
        ];

        const updated = {
          ...treatment,
          pricingSource: 'custom',
          [field]:
            field === 'active'
              ? Boolean(value)
              : numericFields.includes(field)
                ? Number(value) || 0
                : value,
        };

        return createPricingCatalog([updated])[0];
      })
    );
  };

  const handleAddPricingTreatment = () => {
    setPricingCatalog((current) => [
      ...current,
      createEmptyPricingTreatment(current.length),
    ]);
  };

  const handleResetPricingTreatment = (treatmentId) => {
    setPricingCatalog((current) =>
      current.map((treatment, index) => {
        if (treatment.id !== treatmentId) return treatment;

        const defaultTreatment = DEFAULT_PRICING_TREATMENTS.find((item) => item.id === treatmentId);
        if (defaultTreatment) {
          return createPricingCatalog([defaultTreatment])[0];
        }

        return createEmptyPricingTreatment(index);
      })
    );
  };

  const handleRemovePricingTreatment = (treatmentId) => {
    setPricingCatalog((current) => current.filter((treatment) => treatment.id !== treatmentId));
  };

  const handleResetPricingCatalog = () => {
    setPricingCatalog(resetPricingCatalog());
  };

  const handleSavePricingSnapshot = () => {
    if (!activePatient) return;

    updateActiveClinicalRecord((activeRecord) => {
      const selectedReferenceId = activeRecord.budget?.pricingReferenceTreatmentId ?? '';
      const manualSourceTreatment =
        selectedReferenceId && activeRecord.treatments.find((item) => item.id === selectedReferenceId);
      const sourceTreatment =
        manualSourceTreatment ??
        activeRecord.treatments.find(
          (item) => item.procedure && item.cost > 0 && findPricingTreatmentForProcedure(item.procedure, pricingCatalog)
        ) ??
        activeRecord.treatments.find(
          (item) => item.procedure && findPricingTreatmentForProcedure(item.procedure, pricingCatalog)
        ) ??
        null;

      if (!sourceTreatment) {
        return activeRecord;
      }

      const catalogTreatment = findPricingTreatmentForProcedure(sourceTreatment.procedure, pricingCatalog);
      if (!catalogTreatment) {
        return activeRecord;
      }

      const calculationSnapshot = calculatePricingResult({
        treatment: catalogTreatment,
        settings: pricingSettings,
        input: {
          customPrice: sourceTreatment.cost > 0 ? sourceTreatment.cost : catalogTreatment.basePrice,
          paymentMethod: 'card',
          applyPaymentFee: true,
          applyTax: true,
          applyReserve: true,
          laborCostMode: 'fixed',
          laborCostValue: catalogTreatment.defaultLaborCost,
        },
      });

      const now = new Date().toISOString();

      return {
        ...activeRecord,
        pricingBudgets: [
          createPricingBudgetEntry(
            {
              patientId: activePatient.id,
              treatmentId: catalogTreatment.id,
              treatmentNameSnapshot: catalogTreatment.name,
              status: 'draft',
              calculationSnapshot,
              notes: sourceTreatment.procedure ?? '',
              createdAt: now,
              updatedAt: now,
            },
            activeRecord.pricingBudgets.length
          ),
          ...activeRecord.pricingBudgets,
        ],
      };
    });
  };

  const handleAcceptPricingSnapshot = (snapshotId) => {
    handleSetPricingSnapshotStatus(snapshotId, 'accepted');
  };

  const handleSetPricingSnapshotStatus = (snapshotId, nextStatus) => {
    updateActiveClinicalRecord((activeRecord) => {
      const now = new Date().toISOString();
      return {
        ...activeRecord,
        pricingBudgets: activeRecord.pricingBudgets.map((budget) => {
          if (budget.id !== snapshotId) return budget;

          const nextBudget = {
            ...budget,
            status: nextStatus,
            updatedAt: now,
          };

          if (nextStatus === 'sent') nextBudget.sentAt = now;
          if (nextStatus === 'accepted') nextBudget.acceptedAt = now;
          if (nextStatus === 'rejected') nextBudget.rejectedAt = now;
          if (nextStatus === 'expired') nextBudget.expiredAt = now;

          return nextBudget;
        }),
      };
    });
  };

  const downloadCsv = (filename, content) => {
    if (typeof window === 'undefined') return;

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = filename;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExportAcceptedSnapshots = () => {
    const csv = exportAcceptedSnapshotsCsv(financeDashboard);
    downloadCsv('dentcool-snapshots-accepted.csv', csv);
  };

  const handleExportFinanceSummary = () => {
    const csv = exportFinanceSummaryCsv(financeDashboard);
    downloadCsv('dentcool-finance-summary.csv', csv);
  };

  const handleExportFinanceWorkbook = () => {
    import('xlsx').then((XLSX) => {
      const snapshotsRows = buildAcceptedSnapshotsReportRows(financeDashboard);
      const summaryRows = buildFinanceSummaryReportRows(financeDashboard);

      const workbook = XLSX.utils.book_new();
      const snapshotsSheet = XLSX.utils.json_to_sheet(snapshotsRows);
      const summarySheet = XLSX.utils.json_to_sheet(summaryRows);

      XLSX.utils.book_append_sheet(workbook, snapshotsSheet, 'SnapshotsAccepted');
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'FinanceSummary');

      XLSX.writeFile(workbook, 'dentcool-finance-report.xlsx');
    });
  };

  const handleFinanceFilterChange = (field, value) => {
    setFinanceFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (!didMountTeethRef.current) {
      didMountTeethRef.current = true;
      return;
    }
    setSaveState('saved');
    setLastSavedAt(new Date());
  }, [teeth]);

  useEffect(() => {
    if (!didMountUiRef.current) {
      didMountUiRef.current = true;
      return;
    }
    saveUiContext({
      activeView,
      selectedTooth: selected,
      selectedSurface,
      activeTab,
    });
  }, [activeView, selected, selectedSurface, activeTab]);

  useEffect(() => {
    if (didMigrateLegacyTeethRef.current || !activePatient) return;

    didMigrateLegacyTeethRef.current = true;
    if (!hasLegacyTeethState) return;

    updateActiveClinicalRecord((activeRecord) => ({
      ...activeRecord,
      selectedTooth: selected,
      selectedSurface,
      activeTab,
      odontogram: teeth,
    }));
    resetTeethState();
  }, [activePatient, activeTab, hasLegacyTeethState, selected, selectedSurface, teeth]);

  useEffect(() => {
    if (!didMountPatientsRef.current) {
      didMountPatientsRef.current = true;
      return;
    }
    savePatientDirectory(patients);
    setPatientSaveState('saved');
    setLastPatientSavedAt(new Date());
  }, [patients]);

  useEffect(() => {
    if (!didMountClinicalRef.current) {
      didMountClinicalRef.current = true;
      return;
    }
    if (clinicalPersistTimeoutRef.current) clearTimeout(clinicalPersistTimeoutRef.current);
    clinicalPersistTimeoutRef.current = setTimeout(() => {
      saveClinicalRecords(clinicalRecords);
      void flushStorageWrites().then(() => {
        setClinicalSaveState('saved');
        setLastClinicalSavedAt(new Date());
      });
    }, 700);

    return () => {
      if (clinicalPersistTimeoutRef.current) {
        clearTimeout(clinicalPersistTimeoutRef.current);
        clinicalPersistTimeoutRef.current = null;
      }
    };
  }, [clinicalRecords]);

  useEffect(() => {
    if (!didMountPricingRef.current) {
      didMountPricingRef.current = true;
      return;
    }
    savePricingSettings(pricingSettings);
  }, [pricingSettings]);

  useEffect(() => {
    if (!didMountPricingCatalogRef.current) {
      didMountPricingCatalogRef.current = true;
      return;
    }
    savePricingCatalog(pricingCatalog);
  }, [pricingCatalog]);

  useEffect(() => {
    if (!activePatientId) return;
    saveActivePatientId(activePatientId);
  }, [activePatientId]);

  useEffect(() => {
    if (!activePatient) return;
    if (!didHydratePatientOdontogramRef.current) {
      didHydratePatientOdontogramRef.current = true;
      return;
    }

    const patientRecord = createClinicalPatientRecord(clinicalRecords[activePatient.id], activePatient);
    skipNextOdontogramPersistRef.current = true;
    setTeeth(patientRecord.odontogram);
    setSelected(patientRecord.selectedTooth ?? defaultPatientContext.selectedTooth);
    setSelectedSurface(patientRecord.selectedSurface ?? defaultPatientContext.selectedSurface);
    setActiveTab(patientRecord.activeTab ?? defaultPatientContext.activeTab);
    setSaveState('loaded');
  }, [activePatientId]);

  useEffect(() => {
    if (!activePatient) return;
    if (skipNextOdontogramPersistRef.current) {
      skipNextOdontogramPersistRef.current = false;
      return;
    }

    setClinicalSaveState('dirty');
    setClinicalRecords((current) => {
      const activeRecord = createClinicalPatientRecord(current[activePatient.id], activePatient);
      return {
        ...current,
        [activePatient.id]: {
          ...activeRecord,
          selectedTooth: selected,
          selectedSurface,
          activeTab,
          odontogram: teeth,
        },
      };
    });
  }, [activePatient, activePatientId, activeTab, selected, selectedSurface, teeth]);

  useEffect(() => {
    if (!patients.length) {
      const resetDirectory = resetPatientDirectory();
      setPatients(resetDirectory.patients);
      setActivePatientId(resetDirectory.activePatientId);
      return;
    }

    if (!patients.some((patient) => patient.id === activePatientId)) {
      setActivePatientId(patients[0].id);
    }
  }, [patients, activePatientId]);

  useEffect(() => {
    const emptyDrafts = patients.filter((patient) => isEmptyDraftPatient(patient));
    if (emptyDrafts.length <= 1) return;

    const [keep, ...duplicates] = emptyDrafts;
    const duplicateIds = new Set(duplicates.map((patient) => patient.id));
    setPatients((current) => current.filter((patient) => !duplicateIds.has(patient.id)));
    setClinicalRecords((current) => {
      const next = { ...current };
      duplicates.forEach((patient) => {
        delete next[patient.id];
      });
      return next;
    });
    if (activePatientId && duplicateIds.has(activePatientId)) {
      setActivePatientId(keep.id);
    }
  }, [patients, activePatientId]);

  const counts = {
    ant: 6,
    evol: 0,
    tx: 0,
    docs: 0,
    hist: 0,
    agenda: 0,
    cobros: 0,
  };

  const clinicalData = buildClinicalRecordFromMocks({
    patient: visibleActivePatient,
    teeth,
    treatments: TREATMENTS,
    evolution: EVOLUTION,
    history: HISTORY,
    clinicalRecord: visibleActivePatient ? clinicalRecords[visibleActivePatient.id] : undefined,
    uiContext: {
      selectedTooth: selected,
      selectedSurface,
      activeTab,
    },
  });

  const { patient, record } = clinicalData;
  counts.ant = patient
    ? [patient.medicalBackground, patient.allergies, patient.dentalHabits].reduce(
        (total, collection) => total + collection.filter((item) => item.active).length,
        0
      )
    : 0;
  counts.evol = record.evolutionNotes.length;
  counts.tx = record.treatments.length;
  counts.docs = record.documents.length;
  counts.hist = record.historyEntries.length;
  counts.agenda = record.appointments.length;
  counts.cobros = record.paymentEntries.length;
  const financeDashboard = buildFinanceDashboard(clinicalRecords, patients, pricingSettings, financeFilters);

  const renderSheetClinicalSection = (sectionId) => {
    if (!permissions.sheetSections.includes(sectionId)) return null;

    if (sectionId === 'motivo') {
      return (
        <Motivo
          record={record.motivoDiagnostico}
          saveState={clinicalSaveState}
          lastSavedAt={lastClinicalSavedAt}
          onFieldChange={handleMotivoFieldChange}
          onDiagnosisChange={handleDiagnosisChange}
          onAddDiagnosis={handleAddDiagnosis}
          onRemoveDiagnosis={handleRemoveDiagnosis}
          onOpenSection={handleOpenPatientSheet}
        />
      );
    }

    if (sectionId === 'evolucion') {
      return (
        <Evolucion
          evolutionNotes={record.evolutionNotes}
          saveState={clinicalSaveState}
          lastSavedAt={lastClinicalSavedAt}
          onNoteChange={handleEvolutionNoteChange}
          onAddNote={handleAddEvolutionNote}
          onRemoveNote={handleRemoveEvolutionNote}
          onSave={handleSaveEvolutionAndOpenHistory}
          onOpenSection={handleOpenPatientSheet}
          focusedNoteId={focusedEvolutionNoteId}
        />
      );
    }

    if (sectionId === 'presupuesto' && !isStaff) {
      return (
        <Presupuesto
          budget={record.budget}
          treatments={record.treatments}
          pricingSettings={pricingSettings}
          pricingCatalog={pricingCatalog}
          pricingBudgets={record.pricingBudgets}
          saveState={clinicalSaveState}
          lastSavedAt={lastClinicalSavedAt}
          onBudgetFieldChange={handleBudgetFieldChange}
          onTreatmentChange={handleTreatmentChange}
          onAddTreatment={handleAddTreatment}
          onRemoveTreatment={handleRemoveTreatment}
          onPricingSettingChange={handlePricingSettingChange}
          onResetPricingSettings={handleResetPricingSettings}
          onPricingCatalogChange={handlePricingCatalogChange}
          onAddPricingTreatment={handleAddPricingTreatment}
          onResetPricingTreatment={handleResetPricingTreatment}
          onRemovePricingTreatment={handleRemovePricingTreatment}
          onResetPricingCatalog={handleResetPricingCatalog}
          onSavePricingSnapshot={handleSavePricingSnapshot}
          onAcceptPricingSnapshot={handleAcceptPricingSnapshot}
          onSetPricingSnapshotStatus={handleSetPricingSnapshotStatus}
          onOpenSection={handleOpenPatientSheet}
          canManagePricing={permissions.canManagePricing}
        />
      );
    }

    if (sectionId === 'documentos') {
      return (
        <Documentos
          documents={record.documents}
          saveState={clinicalSaveState}
          lastSavedAt={lastClinicalSavedAt}
          onDocumentChange={handleDocumentChange}
          onAddDocument={handleAddDocument}
          onRemoveDocument={handleRemoveDocument}
          onOpenSection={handleOpenPatientSheet}
        />
      );
    }

    if (sectionId === 'historial') {
      return (
        <Historial
          historyEntries={record.historyEntries}
          saveState={clinicalSaveState}
          lastSavedAt={lastClinicalSavedAt}
          onEntryChange={handleHistoryEntryChange}
          onAddEntry={handleAddHistoryEntry}
          onRemoveEntry={handleRemoveHistoryEntry}
          onEditEvolutionEntry={handleEditEvolutionFromHistory}
          onOpenSection={handleOpenPatientSheet}
        />
      );
    }

    if (sectionId === 'notasRapidas') {
      return (
        <NotasRapidas
          notes={record.quickNotes}
          saveState={clinicalSaveState}
          lastSavedAt={lastClinicalSavedAt}
          onSave={handleQuickNotesSave}
        />
      );
    }

    if (sectionId === 'agenda') {
      return (
        <AgendaClinica
          appointments={record.appointments}
          saveState={clinicalSaveState}
          lastSavedAt={lastClinicalSavedAt}
          onAppointmentChange={handleAppointmentChange}
          onAddAppointment={handleAddAppointment}
          onRemoveAppointment={handleRemoveAppointment}
          onOpenSection={handleOpenPatientSheet}
        />
      );
    }

    if (sectionId === 'cobros') {
      return (
        <CobrosAbonos
          payments={record.paymentEntries}
          treatments={record.treatments}
          saveState={clinicalSaveState}
          lastSavedAt={lastClinicalSavedAt}
          onPaymentChange={handlePaymentChange}
          onAddPayment={handleAddPayment}
          onRemovePayment={handleRemovePayment}
          onOpenSection={handleOpenPatientSheet}
        />
      );
    }

    return null;
  };

  if (!authSession) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <Sidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        patientCount={patients.length}
        agendaCount={agendaCount}
        currentUser={authSession}
        permissions={permissions}
        onLogout={handleLogout}
      />
      <div className="main">
        <TopbarInner patientName={getPatientDisplayName(visibleActivePatient, 'Paciente')} activeView={activeView} currentUser={authSession} />
        <div className="content">
          {activeView === 'home' ? (
            <HomeDashboard patients={patients} activePatient={visibleActivePatient} currentUser={authSession} />
          ) : activeView === 'patients' ? (
            <>
              <FloatingNewPatientButton onClick={handleCreatePatient} />
              <PatientsDirectoryView
                patients={patients}
                agendaCount={agendaCount}
                onCreatePatient={handleCreatePatient}
                onOpenPatient={(patientId, actionSection) => (
                  actionSection === 'edit'
                    ? handleEditPatientFromDirectory(patientId, 'datos')
                    : handleOpenPatientFromDirectory(patientId)
                )}
              />
              <PatientsSheet
                open={isPatientSheetOpen}
                patients={patients}
                activePatientId={activePatientId}
                activeSection={patientSheetSection}
                saveState={patientSaveState}
                lastSavedAt={lastPatientSavedAt}
                onSelectPatient={setActivePatientId}
                onCreatePatient={handleCreatePatient}
                onSavePatient={handleSavePatient}
                onDraftChange={handleDraftPatientChange}
                onDeletePatient={handleDeletePatient}
                onSectionChange={setPatientSheetSection}
                renderClinicalSection={renderSheetClinicalSection}
                allowedSections={permissions.sheetSections}
                onClose={handleClosePatientSheet}
              />
            </>
          ) : activeView === 'priceList' ? (
            <PriceListView pricingCatalog={pricingCatalog} />
          ) : activeView === 'inventory' ? (
            <InventarioInsumos pricingCatalog={pricingCatalog} />
          ) : activeView === 'finance' ? (
            <FinanceDashboard
              financeDashboard={financeDashboard}
              pricingSettings={pricingSettings}
              onPricingSettingChange={handlePricingSettingChange}
              onResetPricingSettings={handleResetPricingSettings}
              onExportAcceptedSnapshots={handleExportAcceptedSnapshots}
              onExportFinanceSummary={handleExportFinanceSummary}
              onExportFinanceWorkbook={handleExportFinanceWorkbook}
              onFinanceFilterChange={handleFinanceFilterChange}
            />
          ) : (
            <>
              <FloatingNewPatientButton onClick={handleCreatePatient} />
              <PatientsSheet
                open={isPatientSheetOpen}
                patients={patients}
                activePatientId={activePatientId}
                activeSection={patientSheetSection}
                saveState={patientSaveState}
                lastSavedAt={lastPatientSavedAt}
                onSelectPatient={setActivePatientId}
                onCreatePatient={handleCreatePatient}
                onSavePatient={handleSavePatient}
                onDraftChange={handleDraftPatientChange}
                onDeletePatient={handleDeletePatient}
                onSectionChange={setPatientSheetSection}
                renderClinicalSection={renderSheetClinicalSection}
                allowedSections={permissions.sheetSections}
                onClose={handleClosePatientSheet}
              />
              <PatientHeader patient={visibleActivePatient} onEditPatient={handleOpenPatientSheet} onOpenDirectory={handleOpenPatientSheet} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2px 2px 12px', gap: 12 }}>
                <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                  {saveState === 'loaded' && 'Odontograma cargado desde el estado local o mock inicial.'}
                  {saveState === 'dirty' && 'Guardando cambios del odontograma…'}
                  {saveState === 'saved' && `Cambios guardados localmente${lastSavedAt ? ` · ${lastSavedAt.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}` : ''}`}
                  {saveState === 'reset' && 'Odontograma reiniciado al estado base.'}
                </div>
                <button className="btn btn-secondary" onClick={handleResetOdontogram}>Reiniciar odontograma</button>
              </div>
              <div className="work-grid">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
                  <Odontogram teeth={teeth} selected={selected} selectedSurface={selectedSurface} onSelect={setSelected} onSelectSurface={setSelectedSurface} />
                  <div className="card">
                    <Tabs active={activeTab} onChange={setActiveTab} counts={counts} allowedTabs={permissions.patientTabs} />
                    <div className="tab-content">
                      {activeTab === 'antecedentes' && (
                        <Antecedentes patient={visibleActivePatient} onEditPatient={() => handleOpenPatientSheet('antecedentes')} />
                      )}
                      {activeTab === 'motivo' && (
                        <Motivo
                          record={record.motivoDiagnostico}
                          saveState={clinicalSaveState}
                          lastSavedAt={lastClinicalSavedAt}
                          onFieldChange={handleMotivoFieldChange}
                          onDiagnosisChange={handleDiagnosisChange}
                          onAddDiagnosis={handleAddDiagnosis}
                          onRemoveDiagnosis={handleRemoveDiagnosis}
                          onOpenSection={handleOpenPatientSheet}
                          mirror
                        />
                      )}
                      {activeTab === 'evolucion' && (
                        <Evolucion
                          evolutionNotes={record.evolutionNotes}
                          saveState={clinicalSaveState}
                          lastSavedAt={lastClinicalSavedAt}
                          onNoteChange={handleEvolutionNoteChange}
                          onAddNote={handleAddEvolutionNote}
                          onRemoveNote={handleRemoveEvolutionNote}
                          onOpenSection={handleOpenPatientSheet}
                          mirror
                        />
                      )}
                      {activeTab === 'presupuesto' && !isStaff && (
                        <Presupuesto
                          budget={record.budget}
                          treatments={record.treatments}
                          pricingSettings={pricingSettings}
                          pricingCatalog={pricingCatalog}
                          pricingBudgets={record.pricingBudgets}
                          saveState={clinicalSaveState}
                          lastSavedAt={lastClinicalSavedAt}
                          onBudgetFieldChange={handleBudgetFieldChange}
                          onTreatmentChange={handleTreatmentChange}
                          onAddTreatment={handleAddTreatment}
                          onRemoveTreatment={handleRemoveTreatment}
                          onPricingSettingChange={handlePricingSettingChange}
                          onResetPricingSettings={handleResetPricingSettings}
                          onPricingCatalogChange={handlePricingCatalogChange}
                          onAddPricingTreatment={handleAddPricingTreatment}
                          onResetPricingTreatment={handleResetPricingTreatment}
                          onRemovePricingTreatment={handleRemovePricingTreatment}
                          onResetPricingCatalog={handleResetPricingCatalog}
                          onSavePricingSnapshot={handleSavePricingSnapshot}
                          onAcceptPricingSnapshot={handleAcceptPricingSnapshot}
                          onSetPricingSnapshotStatus={handleSetPricingSnapshotStatus}
                          onOpenSection={handleOpenPatientSheet}
                          canManagePricing={permissions.canManagePricing}
                          mirror
                        />
                      )}
                      {activeTab === 'insumos' && !isStaff && (
                        <Insumos
                          patient={visibleActivePatient}
                          budget={record.budget}
                          treatments={record.treatments}
                          appointments={record.appointments}
                          pricingCatalog={pricingCatalog}
                          onBudgetFieldChange={handleBudgetFieldChange}
                          onOpenSection={handleOpenPatientSheet}
                        />
                      )}
                      {activeTab === 'documentos' && (
                        <Documentos
                          documents={record.documents}
                          saveState={clinicalSaveState}
                          lastSavedAt={lastClinicalSavedAt}
                          onDocumentChange={handleDocumentChange}
                          onAddDocument={handleAddDocument}
                          onRemoveDocument={handleRemoveDocument}
                          mirror
                          onOpenSection={handleOpenPatientSheet}
                        />
                      )}
                      {activeTab === 'historial' && (
                        <Historial
                          historyEntries={record.historyEntries}
                          saveState={clinicalSaveState}
                          lastSavedAt={lastClinicalSavedAt}
                          onEntryChange={handleHistoryEntryChange}
                          onAddEntry={handleAddHistoryEntry}
                          onRemoveEntry={handleRemoveHistoryEntry}
                          onOpenSection={handleOpenPatientSheet}
                          mirror
                        />
                      )}
                    </div>
                  </div>
                  <TreatmentsTable
                    selectedTooth={selected}
                    treatments={record.treatments}
                    onAddTreatment={handleAddTreatment}
                    onRemoveTreatment={handleRemoveTreatment}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <ToothPanel fdi={selected} surfaces={teeth[selected]} selectedSurface={selectedSurface} onSelectSurface={setSelectedSurface} onSetState={handleSetState} />
                  <NextAppointments />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
