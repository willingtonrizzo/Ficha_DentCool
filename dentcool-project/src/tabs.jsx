import { fmtCLP } from './data';
import { Icon } from './app';

export function Tabs({ active, onChange, counts }) {
  const tabs = [
    { k: 'antecedentes', label: 'Antecedentes', count: counts.ant },
    { k: 'motivo', label: 'Motivo y diagnostico' },
    { k: 'evolucion', label: 'Evolucion clinica', count: counts.evol },
    { k: 'presupuesto', label: 'Presupuesto', count: counts.tx },
    { k: 'documentos', label: 'Documentos', count: counts.docs },
    { k: 'historial', label: 'Historial', count: counts.hist },
  ];
  return (
    <div className="tabs-bar">
      {tabs.map((t) => (
        <button key={t.k} className={`tab ${active === t.k ? 'active' : ''}`} onClick={() => onChange(t.k)}>
          {t.label}
          {t.count != null && <span className="count">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Antecedentes({ patient, onEditPatient }) {
  const medicalBackground = patient?.medicalBackground ?? [];
  const allergies = patient?.allergies ?? [];
  const dentalHabits = patient?.dentalHabits ?? [];

  return (
    <div className="ant-shell">
      <div className="ant-header">
        <div>
          <div className="muted" style={{ fontSize: 12 }}>Antecedentes del paciente activo</div>
          <div className="ant-patient-name">{patient?.fullName ?? 'Sin paciente seleccionado'}</div>
        </div>
        <button className="btn btn-secondary" type="button" onClick={onEditPatient}>
          <Icon.edit />
          Editar antecedentes
        </button>
      </div>
      <div className="ant-grid">
        <div className="ant-block">
          <h4>Antecedentes medicos</h4>
          <div className="ant-list">
            {medicalBackground.length > 0 ? medicalBackground.map((item) => (
              <div key={item.id} className={`ant-row ${item.active ? '' : 'no'}`}>
                <span className="check">{item.active ? <Icon.check /> : null}</span>
                <span>{item.label}</span>
                {item.comment ? <span className="pill">{item.comment}</span> : null}
              </div>
            )) : (
              <div className="ant-row no"><span className="check" /><span>Sin antecedentes medicos registrados</span></div>
            )}
          </div>
        </div>
        <div className="ant-block">
          <h4>Alergias y medicamentos</h4>
          <div className="ant-list">
            {allergies.length > 0 ? allergies.map((item) => (
              <div key={item.id} className={`ant-row ${item.active ? '' : 'no'}`} style={item.active && item.comment ? { color: 'var(--red)' } : undefined}>
                <span className="check" style={item.active ? { background: item.comment ? 'var(--red)' : 'var(--brand-grad)' } : undefined}>
                  {item.active ? <Icon.alert /> : null}
                </span>
                <span>
                  {item.active && item.comment ? <strong>{item.label}</strong> : item.label}
                </span>
                {item.comment ? <span className="pill" style={item.active ? { background: 'var(--red)' } : undefined}>{item.comment}</span> : null}
              </div>
            )) : (
              <div className="ant-row no"><span className="check" /><span>Sin alergias ni medicamentos registrados</span></div>
            )}
          </div>
        </div>
        <div className="ant-block">
          <h4>Habitos y antecedentes dentales</h4>
          <div className="ant-list">
            {dentalHabits.length > 0 ? dentalHabits.map((item) => (
              <div key={item.id} className={`ant-row ${item.active ? '' : 'no'}`}>
                <span className="check">{item.active ? <Icon.check /> : null}</span>
                <span>{item.label}</span>
                {item.comment ? <span className="pill" style={{ background: 'var(--blue)' }}>{item.comment}</span> : null}
              </div>
            )) : (
              <div className="ant-row no"><span className="check" /><span>Sin habitos dentales registrados</span></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Motivo({
  record,
  saveState = 'loaded',
  lastSavedAt,
  onFieldChange,
  onDiagnosisChange,
  onAddDiagnosis,
  onRemoveDiagnosis,
  onOpenSection,
  mirror = false,
}) {
  const saveLabel =
    saveState === 'dirty'
      ? 'Guardando motivo y diagnostico…'
      : saveState === 'saved'
        ? `Motivo y diagnostico guardado${lastSavedAt ? ` · ${lastSavedAt.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}` : ''}`
        : 'Bloque clinico listo para edicion por paciente.';

  return (
    <div className="motivo-layout">
      <div className="motivo-main-column">
        <div className="mirror-toolbar">
          <div className="motivo-save-note">{saveLabel}</div>
          {mirror && (
            <button className="btn btn-secondary" type="button" onClick={() => onOpenSection?.('motivo')}>
              <Icon.edit />
              Editar ficha
            </button>
          )}
        </div>

        {mirror ? (
          <div className="mirror-clinical-grid">
            <div className="mirror-block">
              <h4 style={sectionTitleStyle}>Motivo de consulta</h4>
              <p>{record.consultationReason || 'Sin motivo registrado.'}</p>
            </div>
            <div className="mirror-block">
              <h4 style={sectionTitleStyle}>Historia actual</h4>
              <p>{record.currentIllness || 'Sin historia actual registrada.'}</p>
            </div>
            <div className="mirror-block">
              <h4 style={sectionTitleStyle}>Examen clinico</h4>
              <p><strong>Extraoral:</strong> {record.extraoralExam || 'Sin registro.'}</p>
              <p><strong>Intraoral:</strong> {record.intraoralExam || 'Sin registro.'}</p>
              <p><strong>Periodontal:</strong> {record.periodontalExam || 'Sin registro.'}</p>
              <p><strong>Impresion:</strong> {record.clinicalImpression || 'Sin registro.'}</p>
            </div>
            <div className="mirror-block mirror-block-wide">
              <h4 style={sectionTitleStyle}>Diagnosticos</h4>
              <div className="mirror-chip-list">
                {record.diagnoses.length > 0 ? record.diagnoses.map((diagnosis) => (
                  <span key={diagnosis.id} className="mirror-chip">
                    {diagnosis.code || 'Sin codigo'} · {diagnosis.title || 'Sin titulo'}
                  </span>
                )) : <span className="muted">Sin diagnosticos cargados.</span>}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="motivo-block">
              <h4 style={sectionTitleStyle}>Motivo de consulta</h4>
              <div style={calloutStyle}>
                <textarea
                  className="motivo-callout-input"
                  value={record.consultationReason}
                  onChange={(event) => onFieldChange('consultationReason', event.target.value)}
                  placeholder="Describe el motivo principal referido por el paciente."
                />
              </div>
            </div>

            <div className="motivo-block">
              <h4 style={sectionTitleStyle}>Enfermedad o historia actual</h4>
              <div style={bodyCardStyle}>
                <textarea
                  className="motivo-body-input"
                  value={record.currentIllness}
                  onChange={(event) => onFieldChange('currentIllness', event.target.value)}
                  placeholder="Duracion, desencadenantes, dolor, sensibilidad y antecedentes inmediatos."
                />
              </div>
            </div>

            <div className="motivo-block">
              <h4 style={sectionTitleStyle}>Examen clinico</h4>
              <div className="motivo-exam-grid">
                <MotivoField
                  label="Extraoral"
                  value={record.extraoralExam}
                  placeholder="ATM, simetria facial, apertura, hallazgos extraorales."
                  onChange={(value) => onFieldChange('extraoralExam', value)}
                />
                <MotivoField
                  label="Intraoral"
                  value={record.intraoralExam}
                  placeholder="Mucosas, encia, lesiones, restauraciones, hallazgos por sector."
                  onChange={(value) => onFieldChange('intraoralExam', value)}
                />
                <MotivoField
                  label="Periodontal"
                  value={record.periodontalExam}
                  placeholder="Sondaje, sangrado, placa, movilidad u otros indices."
                  onChange={(value) => onFieldChange('periodontalExam', value)}
                />
                <MotivoField
                  label="Impresion clinica"
                  value={record.clinicalImpression}
                  placeholder="Sintesis clinica y criterio de evaluacion."
                  onChange={(value) => onFieldChange('clinicalImpression', value)}
                />
              </div>
            </div>

            <div className="motivo-side-column">
              <div className="motivo-diagnosis-head">
                <h4 style={sectionTitleStyle}>Diagnostico</h4>
                <button className="btn btn-secondary" onClick={onAddDiagnosis}><Icon.plus />Agregar</button>
              </div>
              <div className="motivo-diagnosis-list">
                {record.diagnoses.map((diagnosis) => (
                  <DiagEditor
                    key={diagnosis.id}
                    diagnosis={diagnosis}
                    onChange={onDiagnosisChange}
                    onRemove={onRemoveDiagnosis}
                  />
                ))}
                {record.diagnoses.length === 0 && (
                  <div className="motivo-empty-state">
                    Aun no hay diagnosticos cargados para este paciente.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MotivoField({ label, value, placeholder, onChange }) {
  return (
    <label className="motivo-field">
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function DiagEditor({ diagnosis, onChange, onRemove }) {
  const sevColor = { alta: 'var(--red)', media: 'var(--amber)', baja: 'var(--green)' }[diagnosis.severity];
  return (
    <div className="motivo-diagnosis-card">
      <div className="motivo-diagnosis-top">
        <input
          className="motivo-code-input"
          value={diagnosis.code}
          onChange={(event) => onChange(diagnosis.id, 'code', event.target.value)}
          placeholder="K02.1"
        />
        <select
          className="motivo-severity-select"
          value={diagnosis.severity}
          onChange={(event) => onChange(diagnosis.id, 'severity', event.target.value)}
          style={{ color: sevColor }}
        >
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
        <button className="btn btn-ghost" onClick={() => onRemove(diagnosis.id)}><Icon.trash /></button>
      </div>
      <div className="motivo-diagnosis-body">
        <input
          className="motivo-title-input"
          value={diagnosis.title}
          onChange={(event) => onChange(diagnosis.id, 'title', event.target.value)}
          placeholder="Nombre del diagnostico"
        />
        <textarea
          className="motivo-detail-input"
          value={diagnosis.detail}
          onChange={(event) => onChange(diagnosis.id, 'detail', event.target.value)}
          placeholder="Detalle clinico, pieza, superficie o contexto diagnostico."
        />
      </div>
    </div>
  );
}

export function Evolucion({
  evolutionNotes,
  saveState = 'loaded',
  lastSavedAt,
  onNoteChange,
  onAddNote,
  onRemoveNote,
  onOpenSection,
  mirror = false,
}) {
  const saveLabel =
    saveState === 'dirty'
      ? 'Guardando evolucion clinica…'
      : saveState === 'saved'
        ? `Evolucion clinica guardada${lastSavedAt ? ` · ${lastSavedAt.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}` : ''}`
        : 'Entradas clinicas listas para edicion por paciente.';

  return (
    <div className="evolution-editor">
      <div className="evolution-toolbar">
        <div>
          <div className="muted" style={{ fontSize: 12.5 }}>{evolutionNotes.length} entradas · ordenadas por fecha</div>
          <div className="evolution-save-note">{saveLabel}</div>
        </div>
        <div className="evolution-toolbar-actions">
          {mirror && (
            <button className="btn btn-secondary" type="button" onClick={() => onOpenSection?.('evolucion')}>
              <Icon.edit />
              Editar ficha
            </button>
          )}
          {!mirror && <button className="btn btn-primary" onClick={onAddNote}><Icon.plus />Nueva nota clinica</button>}
        </div>
      </div>
      <div className="evol-list">
        {evolutionNotes.map((e) => (
          <div key={e.id} className="evol-item editable">
            <div className="evol-date"><strong>{extractDateParts(e.dateLabel).day}</strong>{extractDateParts(e.dateLabel).month} <br />{extractDateParts(e.dateLabel).year}</div>
            <div className="evol-body">
              {mirror ? (
                <>
                  <div className="mirror-note-title">{e.title || 'Sin titulo'}</div>
                  <div className="mirror-note-meta">{e.dateLabel || 'Sin fecha'} · {e.author || 'Sin profesional'}</div>
                  <p className="mirror-note-text">{e.text || 'Sin detalle registrado.'}</p>
                </>
              ) : (
                <>
              <div className="evolution-entry-head">
                <input
                  className="evolution-title-input"
                  value={e.title}
                  onChange={(event) => onNoteChange(e.id, 'title', event.target.value)}
                  placeholder="Titulo de la nota clinica"
                />
                <button className="btn btn-ghost" onClick={() => onRemoveNote(e.id)}><Icon.trash /></button>
              </div>
              <div className="evolution-meta-grid">
                <label className="evolution-meta-field">
                  <span>Fecha</span>
                  <input
                    value={e.dateLabel}
                    onChange={(event) => onNoteChange(e.id, 'dateLabel', event.target.value)}
                    placeholder="11-05-2026"
                  />
                </label>
                <label className="evolution-meta-field">
                  <span>Profesional</span>
                  <input
                    value={e.author}
                    onChange={(event) => onNoteChange(e.id, 'author', event.target.value)}
                    placeholder="Dra. responsable"
                  />
                </label>
              </div>
              <textarea
                className="evolution-text-input"
                value={e.text}
                onChange={(event) => onNoteChange(e.id, 'text', event.target.value)}
                placeholder="Describe procedimiento, hallazgos, respuesta del paciente e indicaciones."
              />
              <div className="evol-tags">
                {e.tags.map((tag, j) => <span key={j} className={`tag ${tag.tone}`}>{tag.label}</span>)}
              </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Presupuesto({
  budget,
  treatments,
  saveState = 'loaded',
  lastSavedAt,
  onBudgetFieldChange,
  onTreatmentChange,
  onAddTreatment,
  onRemoveTreatment,
  onOpenSection,
  mirror = false,
}) {
  const total = treatments.reduce((s, t) => s + t.cost, 0);
  const pagado = treatments.reduce((s, t) => s + t.paid, 0);
  const cobertura = treatments.reduce((s, t) => s + (t.cost * t.coveragePercent) / 100, 0);
  const aPagar = total - pagado - cobertura;
  const planned = treatments.filter((t) => t.status === 'planned').length;
  const completed = treatments.filter((t) => t.status === 'completed').length;
  const topItems = treatments.slice(0, 4);
  const saveLabel =
    saveState === 'dirty'
      ? 'Guardando presupuesto…'
      : saveState === 'saved'
        ? `Presupuesto guardado${lastSavedAt ? ` · ${lastSavedAt.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}` : ''}`
        : 'Presupuesto listo para edicion por paciente.';
  return (
    <div className="budget-layout">
      <div className="budget-plan-card">
        <div className="budget-plan-eyebrow">Plan activo</div>
        <textarea
          className="budget-plan-title-input"
          value={budget.planTitle}
          onChange={(event) => onBudgetFieldChange('planTitle', event.target.value)}
          placeholder="Nombre del plan de tratamiento"
        />
        <div className="budget-plan-meta">
          <span>{planned} planificados</span>
          <span>{completed} realizados</span>
        </div>
        <div className="budget-save-note">{saveLabel}</div>
        <div className="budget-plan-progress">
          <div className="budget-plan-bar">
            <span style={{ width: `${Math.max(18, Math.round((pagado / Math.max(total, 1)) * 100))}%` }} />
          </div>
        <div className="budget-plan-caption">Avance financiero del plan</div>
        </div>
        {mirror ? (
          <div className="budget-plan-mirror">
            {topItems.map((item) => (
              <div key={item.id} className="mirror-plan-row">
                <div>
                  <div className="mirror-plan-title">{item.procedure || 'Sin procedimiento'}</div>
                  <div className="mirror-plan-meta">{item.toothFdi} · {item.clinician || 'Sin profesional'}</div>
                </div>
                <span className={`status ${legacyStatusClass(item.status)}`}><span className="dot" />{labelForStatus(item.status)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="budget-plan-list">
          {topItems.map((item) => (
            <div key={item.id} className="budget-plan-item">
              <div className="budget-plan-item-main">
                <input
                  className="budget-inline-input"
                  value={item.procedure}
                  onChange={(event) => onTreatmentChange(item.id, 'procedure', event.target.value)}
                  placeholder="Procedimiento"
                />
                <span className={`status ${legacyStatusClass(item.status)}`}><span className="dot" />{labelForStatus(item.status)}</span>
              </div>
              <div className="budget-plan-item-sub">
                <input
                  className="budget-inline-mini"
                  value={item.toothFdi}
                  onChange={(event) => onTreatmentChange(item.id, 'toothFdi', event.target.value)}
                />
                <input
                  className="budget-inline-mini amount"
                  value={item.cost}
                  onChange={(event) => onTreatmentChange(item.id, 'cost', event.target.value)}
                />
                <button className="btn btn-ghost" onClick={() => onRemoveTreatment(item.id)}><Icon.trash /></button>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      <div>
      <div className="budget-summary">
        <div className="bs-card"><div className="bs-label">Total presupuesto</div><div className="bs-value">{fmtCLP(total)}</div><div className="bs-sub">{treatments.length} tratamientos</div></div>
        <div className="bs-card t"><div className="bs-label">Cobertura prevision</div><div className="bs-value">{fmtCLP(Math.round(cobertura))}</div><input className="bs-edit-input" value={budget.coverageLabel} onChange={(event) => onBudgetFieldChange('coverageLabel', event.target.value)} /></div>
        <div className="bs-card g"><div className="bs-label">Pagado</div><div className="bs-value">{fmtCLP(pagado)}</div><div className="bs-sub">2 cuotas</div></div>
        <div className="bs-card a"><div className="bs-label">Saldo paciente</div><div className="bs-value">{fmtCLP(Math.round(aPagar))}</div><input className="bs-edit-input" value={budget.dueDateLabel} onChange={(event) => onBudgetFieldChange('dueDateLabel', event.target.value)} /></div>
      </div>
      <div className="budget-edit-list">
        {treatments.map((item) => (
          <div key={item.id} className="budget-edit-row">
            <input value={item.procedure} onChange={(event) => onTreatmentChange(item.id, 'procedure', event.target.value)} placeholder="Procedimiento" />
            <input value={item.clinician} onChange={(event) => onTreatmentChange(item.id, 'clinician', event.target.value)} placeholder="Profesional" />
            <select value={item.status} onChange={(event) => onTreatmentChange(item.id, 'status', event.target.value)}>
              <option value="planned">Planificado</option>
              <option value="in_progress">En curso</option>
              <option value="completed">Realizado</option>
              <option value="pending_review">Por evaluar</option>
            </select>
            <input value={item.cost} onChange={(event) => onTreatmentChange(item.id, 'cost', event.target.value)} placeholder="Costo" />
            <input value={item.paid} onChange={(event) => onTreatmentChange(item.id, 'paid', event.target.value)} placeholder="Pagado" />
            <input value={item.coveragePercent} onChange={(event) => onTreatmentChange(item.id, 'coveragePercent', event.target.value)} placeholder="% cobertura" />
          </div>
        ))}
      </div>
      <div className="budget-actions">
        {mirror && (
          <button className="btn btn-secondary" type="button" onClick={() => onOpenSection?.('presupuesto')}>
            <Icon.edit />
            Editar ficha
          </button>
        )}
        <button className="btn btn-secondary"><Icon.download />Exportar presupuesto PDF</button>
        {!mirror && <button className="btn btn-primary" onClick={onAddTreatment}><Icon.plus />Agregar tratamiento</button>}
      </div>
      </div>
    </div>
  );
}

export function Documentos({
  documents,
  saveState = 'loaded',
  lastSavedAt,
  onDocumentChange,
  onAddDocument,
  onRemoveDocument,
  mirror = false,
  onOpenSection,
}) {
  const saveLabel =
    saveState === 'dirty'
      ? 'Guardando documentos…'
      : saveState === 'saved'
        ? `Documentos guardados${lastSavedAt ? ` · ${lastSavedAt.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}` : ''}`
        : 'Documentos listos para edicion por paciente.';

  const kindLabel = {
    general: 'General',
    radiografia: 'Radiografia',
    foto: 'Foto',
    consentimiento: 'Consentimiento',
    presupuesto: 'Presupuesto',
    informe: 'Informe',
  };

  return (
    <div className="documents-editor">
      <div className="documents-toolbar">
        <div>
          <div className="muted" style={{ fontSize: 12.5 }}>{documents.length} archivos registrados</div>
          <div className="documents-save-note">{saveLabel}</div>
        </div>
        {mirror ? (
          <button className="btn btn-secondary" type="button" onClick={() => onOpenSection?.('documentos')}>
            <Icon.edit />
            Editar ficha
          </button>
        ) : (
          <button className="btn btn-primary" onClick={onAddDocument}><Icon.plus />Nuevo documento</button>
        )}
      </div>
      <div className="documents-list">
        {documents.map((d) => (
          <div key={d.id} className="document-row">
            <div className={`doc-thumb ${d.kind === 'radiografia' ? 'x-ray' : ''}`}>
              {d.kind === 'radiografia' ? <Icon.film cls="icon" /> : <Icon.doc cls="icon" />}
            </div>
            <div className="document-main">
              <div className="document-head">
                <div className="document-title">{d.name}</div>
                {!mirror && <button className="btn btn-ghost" onClick={() => onRemoveDocument(d.id)}><Icon.trash /></button>}
              </div>
              <div className="document-fields">
                <div className="document-field">
                  <span>Fecha</span>
                  <div className="document-value">{d.dateLabel || 'Sin fecha'}</div>
                </div>
                <div className="document-field">
                  <span>Extension</span>
                  <div className="document-value">{d.ext.toUpperCase()}</div>
                </div>
                <div className="document-field">
                  <span>Tipo</span>
                  <div className="document-value">{kindLabel[d.kind] ?? 'General'}</div>
                </div>
              </div>
              <div className="document-meta-line">
                <span className={`ext ${d.ext}`}>{d.ext.toUpperCase()}</span>
                <span>{kindLabel[d.kind] ?? 'General'}</span>
                <span>{d.dateLabel || 'Sin fecha'}</span>
              </div>
            </div>
          </div>
        ))}
        {documents.length === 0 && (
          <div className="documents-empty-state">
            Aun no hay documentos cargados para este paciente.
          </div>
        )}
      </div>
    </div>
  );
}

export function Historial({
  historyEntries,
  saveState = 'loaded',
  lastSavedAt,
  onEntryChange,
  onAddEntry,
  onRemoveEntry,
  onOpenSection,
  mirror = false,
}) {
  const saveLabel =
    saveState === 'dirty'
      ? 'Guardando historial…'
      : saveState === 'saved'
        ? `Historial guardado${lastSavedAt ? ` · ${lastSavedAt.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}` : ''}`
        : 'Historial listo para edicion por paciente.';

  return (
    <div className="history-editor">
      <div className="history-toolbar">
        <div>
          <div className="muted" style={{ fontSize: 12.5 }}>{historyEntries.length} eventos registrados</div>
          <div className="history-save-note">{saveLabel}</div>
        </div>
        <div className="history-toolbar-actions">
          {mirror && (
            <button className="btn btn-secondary" type="button" onClick={() => onOpenSection?.('historial')}>
              <Icon.edit />
              Editar ficha
            </button>
          )}
          {!mirror && <button className="btn btn-primary" onClick={onAddEntry}><Icon.plus />Nuevo evento</button>}
        </div>
      </div>
      <div className="history-list">
        {historyEntries.map((h) => (
          <div key={h.id} className="history-row editable">
            <div className="history-date">
              {mirror ? (
                <span className="mirror-date">{h.dateLabel || 'Sin fecha'}</span>
              ) : (
                <input
                  className="history-date-input"
                  value={h.dateLabel}
                  onChange={(event) => onEntryChange(h.id, 'dateLabel', event.target.value)}
                  placeholder="11-05-2026"
                />
              )}
            </div>
            <div className="history-main">
              {mirror ? (
                <>
                  <div className="history-entry-head">
                    <div className="mirror-note-title">{h.title || 'Sin titulo'}</div>
                    <span className="status plan"><span className="dot" />{(h.category || 'general').toUpperCase()}</span>
                  </div>
                  <div className="mirror-note-meta">{h.clinician || 'Sin profesional'}</div>
                  <p className="mirror-note-text">{h.summary || 'Sin resumen registrado.'}</p>
                </>
              ) : (
                <>
                  <div className="history-entry-head">
                    <input
                      className="history-title-input"
                      value={h.title}
                      onChange={(event) => onEntryChange(h.id, 'title', event.target.value)}
                      placeholder="Titulo del evento"
                    />
                    <select
                      className="history-category-select"
                      value={h.category}
                      onChange={(event) => onEntryChange(h.id, 'category', event.target.value)}
                    >
                      <option value="general">General</option>
                      <option value="control">Control</option>
                      <option value="tratamiento">Tratamiento</option>
                      <option value="protesis">Protesis</option>
                      <option value="prevencion">Prevencion</option>
                      <option value="administrativo">Administrativo</option>
                    </select>
                    <button className="btn btn-ghost" onClick={() => onRemoveEntry(h.id)}><Icon.trash /></button>
                  </div>
                  <input
                    className="history-clinician-input"
                    value={h.clinician}
                    onChange={(event) => onEntryChange(h.id, 'clinician', event.target.value)}
                    placeholder="Profesional responsable"
                  />
                  <textarea
                    className="history-summary-input"
                    value={h.summary}
                    onChange={(event) => onEntryChange(h.id, 'summary', event.target.value)}
                    placeholder="Resumen breve del evento, control, procedimiento o decision clinica."
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TreatmentsTable({ selectedTooth, treatments, onAddTreatment, onRemoveTreatment }) {
  const total = treatments.reduce((s, t) => s + t.cost, 0);
  const pagado = treatments.reduce((s, t) => s + t.paid, 0);
  const categories = [
    'Evaluacion',
    'Limpieza standard',
    'Limpieza VIP',
    'Sellantes',
    'Restauracion simple',
    'Blanqueamiento',
  ];
  return (
    <div className="card treatments-card">
      <div className="card-head">
        <h3>Tratamientos y presupuesto</h3>
        <span className="muted" style={{ fontSize: 12 }}>{treatments.length} items</span>
        <div className="spacer" />
        <button className="btn btn-secondary"><Icon.download />Exportar</button>
        <button className="btn btn-primary" onClick={onAddTreatment}><Icon.plus />Agregar tratamiento</button>
      </div>
      <div className="treatment-toolbar">
        <div className="treatment-toolbar-label">Catalogo sugerido</div>
        <div className="treatment-chip-row">
          {categories.map((category) => (
            <button key={category} className="treatment-chip">{category}</button>
          ))}
        </div>
      </div>
      <div className="table-wrap">
        <table className="tx">
          <thead>
            <tr>
              <th>Diente</th><th>Procedimiento</th><th>Profesional</th><th>Estado</th><th>Prioridad</th><th>Fecha</th><th style={{ textAlign: 'right' }}>Cobertura</th><th style={{ textAlign: 'right' }}>Costo</th><th style={{ textAlign: 'right' }}>Saldo</th><th></th>
            </tr>
          </thead>
          <tbody>
            {treatments.map((t) => {
              const cob = Math.round((t.cost * t.coveragePercent) / 100);
              const saldo = t.cost - t.paid - cob;
              return (
                <tr key={t.id} className={selectedTooth === t.toothFdi ? 'selected' : ''}>
                  <td><span className="tooth-pill">{t.toothFdi}</span>{t.surfaces.map((s) => <span key={s} className="surf-pill">{s}</span>)}</td>
                  <td style={{ fontWeight: 500, color: 'var(--ink)' }}>{t.procedure}</td>
                  <td>{t.clinician}</td>
                  <td><span className={`status ${legacyStatusClass(t.status)}`}><span className="dot" />{labelForStatus(t.status)}</span></td>
                  <td><span className={`priority ${t.priority}`}>● {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}</span></td>
                  <td>{t.dateLabel}</td>
                  <td style={{ textAlign: 'right' }} className="amount">{t.coveragePercent}%</td>
                  <td style={{ textAlign: 'right' }} className="amount">{fmtCLP(t.cost)}</td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: saldo > 0 ? 'var(--amber)' : 'var(--green)' }} className="amount">{saldo > 0 ? fmtCLP(saldo) : '✓ pagado'}</td>
                  <td><div className="row-actions"><button className="row-action"><Icon.edit /></button><button className="row-action" onClick={() => onRemoveTreatment?.(t.id)}><Icon.trash /></button></div></td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="7" style={{ textAlign: 'right', color: 'var(--muted)' }}>Totales</td>
              <td style={{ textAlign: 'right' }} className="amount">{fmtCLP(total)}</td>
              <td style={{ textAlign: 'right', color: 'var(--blue-600)' }} className="amount">{fmtCLP(total - pagado)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export function NextAppointments() {
  return (
    <div className="card">
      <div className="card-head">
        <h3>Proximas citas</h3>
        <div className="spacer" />
        <button className="btn btn-ghost" style={{ fontSize: 12 }}>Ver agenda completa →</button>
      </div>
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="appt-row next">
          <div className="appt-date"><div className="appt-day">JUE</div><div className="appt-num">14</div><div className="appt-mon">MAY</div></div>
          <div className="appt-info"><div className="appt-title">Obturacion composite · 1.6 y 2.4</div><div className="appt-sub"><Icon.clock /> 60 min · Box 3 · Dra. Nunez</div></div>
          <div className="appt-time">10:00<div className="small">en 6 dias</div></div>
        </div>
      </div>
    </div>
  );
}

const sectionTitleStyle = { fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' };
const calloutStyle = { padding: '12px 14px', background: 'var(--bg)', borderRadius: 8, fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-2)', borderLeft: '3px solid var(--teal)' };
const bodyCardStyle = { padding: '12px 14px', background: 'var(--bg)', borderRadius: 8, fontSize: 13, lineHeight: 1.55, color: 'var(--ink-2)' };

function extractDateParts(dateLabel) {
  const [day, month, year] = dateLabel.split('-');
  return { day, month, year };
}

function legacyStatusClass(status) {
  const map = {
    completed: 'done',
    in_progress: 'prog',
    planned: 'plan',
    pending_review: 'pend',
  };
  return map[status] ?? 'plan';
}

function labelForStatus(status) {
  const map = {
    completed: 'Realizado',
    in_progress: 'En curso',
    planned: 'Planificado',
    pending_review: 'Por evaluar',
  };
  return map[status] ?? 'Planificado';
}
