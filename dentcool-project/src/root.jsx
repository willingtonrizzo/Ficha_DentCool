import { useEffect, useRef, useState } from 'react';
import { EVOLUTION, HISTORY, STORAGE_KEYS, TREATMENTS } from './data';
import { FloatingNewPatientButton, HomeDashboard, Sidebar, TopbarInner, PatientHeader, PatientsSheet, Odontogram, ToothPanel } from './app';
import { Tabs, Antecedentes, Motivo, Evolucion, Presupuesto, Documentos, Historial, TreatmentsTable, NextAppointments } from './tabs';
import { updateToothSurfaceState } from './odontogram';
import { buildClinicalRecordFromMocks, createClinicalPatientRecord, createDiagnosis, createDocumentEntry, createEvolutionNote, createHistoryEntry, createTreatmentEntry, TREATMENT_STATUS, resolveMotivoDiagnosticoRecord } from './clinical-model';
import { createEmptyPatient, createPatient, getPatientDisplayName, isEmptyDraftPatient, normalizeRut, validatePatientDraft } from './patients';
import {
  loadActivePatientId,
  loadClinicalRecords,
  loadPatientDirectory,
  loadTeethState,
  loadUiContext,
  saveClinicalRecords,
  resetPatientDirectory,
  resetTeethState,
  resetUiContext,
  saveActivePatientId,
  savePatientDirectory,
  saveUiContext,
} from './storage';

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
  const [activeView, setActiveView] = useState(initialUiContext.activeView);
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
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [lastPatientSavedAt, setLastPatientSavedAt] = useState(null);
  const [lastClinicalSavedAt, setLastClinicalSavedAt] = useState(null);
  const didMountTeethRef = useRef(false);
  const didMountUiRef = useRef(false);
  const didMountPatientsRef = useRef(false);
  const didMountClinicalRef = useRef(false);
  const didMigrateLegacyTeethRef = useRef(false);
  const didHydratePatientOdontogramRef = useRef(false);
  const skipNextOdontogramPersistRef = useRef(false);

  const activePatient = patients.find((patient) => patient.id === activePatientId) ?? patients[0] ?? null;
  const visibleActivePatient = patientDraftPreview?.id === activePatientId ? patientDraftPreview : activePatient;
  const agendaCount = patients.filter(
    (patient) => patient.nextVisit && patient.nextVisit !== 'Sin cita' && patient.nextVisit !== 'Sin agendar'
  ).length;

  const handleSetState = (state) => {
    setSaveState('dirty');
    setTeeth((prev) => updateToothSurfaceState(prev, selected, selectedSurface, state));
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

  const handleClosePatientSheet = () => {
    setIsPatientSheetOpen(false);
  };

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
        const numericFields = ['toothFdi', 'cost', 'paid', 'coveragePercent'];
        return {
          ...treatment,
          [field]: numericFields.includes(field) ? Number(value) || 0 : value,
        };
      }),
    }));
  };

  const handleAddTreatment = () => {
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
    saveClinicalRecords(clinicalRecords);
    setClinicalSaveState('saved');
    setLastClinicalSavedAt(new Date());
  }, [clinicalRecords]);

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

  const renderSheetClinicalSection = (sectionId) => {
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
          onOpenSection={handleOpenPatientSheet}
        />
      );
    }

    if (sectionId === 'presupuesto') {
      return (
        <Presupuesto
          budget={record.budget}
          treatments={record.treatments}
          saveState={clinicalSaveState}
          lastSavedAt={lastClinicalSavedAt}
          onBudgetFieldChange={handleBudgetFieldChange}
          onTreatmentChange={handleTreatmentChange}
          onAddTreatment={handleAddTreatment}
          onRemoveTreatment={handleRemoveTreatment}
          onOpenSection={handleOpenPatientSheet}
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
          onOpenSection={handleOpenPatientSheet}
        />
      );
    }

    return null;
  };

  return (
    <div className="app">
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        patientCount={patients.length}
        agendaCount={agendaCount}
      />
      <div className="main">
        <TopbarInner patientName={getPatientDisplayName(visibleActivePatient, 'Paciente')} activeView={activeView} />
        <div className="content">
          {activeView === 'home' ? (
            <HomeDashboard patients={patients} activePatient={visibleActivePatient} />
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
                    <Tabs active={activeTab} onChange={setActiveTab} counts={counts} />
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
                      {activeTab === 'presupuesto' && (
                        <Presupuesto
                          budget={record.budget}
                          treatments={record.treatments}
                          saveState={clinicalSaveState}
                          lastSavedAt={lastClinicalSavedAt}
                          onBudgetFieldChange={handleBudgetFieldChange}
                          onTreatmentChange={handleTreatmentChange}
                          onAddTreatment={handleAddTreatment}
                          onRemoveTreatment={handleRemoveTreatment}
                          onOpenSection={handleOpenPatientSheet}
                          mirror
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
