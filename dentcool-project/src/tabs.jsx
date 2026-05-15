import { useEffect, useState } from 'react';
import { fmtCLP } from './data';
import { Icon } from './app';
import {
  DEFAULT_PRICING_SETTINGS,
  calculatePricingResult,
  findPricingTreatmentForProcedure,
} from './pricing';
import {
  calculatePatientSupplyUsageCost,
  checkAgendaSupplyNeeds,
  checkLowStock,
  createSupplySnapshot,
} from './modules/supplies/suppliesCalculator';
import {
  loadSupplyState,
  resetSupplyCatalog,
  resetSupplyState,
  saveSupplyState,
} from './modules/supplies/suppliesStorage';

function fmtPercent(value) {
  return `${new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)}%`;
}

function getPricingTone(status) {
  if (status === 'Peligroso' || status === 'No soporta boleta') return 'danger';
  if (status === 'Bajo' || status === 'Ajustado') return 'warn';
  if (status === 'Aceptable inicio' || status === 'Sano con boleta') return 'ok';
  return 'good';
}

function PricingHelpButton({ label, text, compact = false, open, onToggle, placement = 'right' }) {
  return (
    <div className={`pricing-help-wrap${compact ? ' compact' : ''} placement-${placement}`}>
      <button
        type="button"
        className="pricing-help-button"
        aria-expanded={open}
        aria-label={`Ayuda sobre ${label}`}
        title={`Ayuda sobre ${label}`}
        onClick={onToggle}
      >
        ?
      </button>
      {open && <div className="pricing-help-popover">{text}</div>}
    </div>
  );
}

export function Tabs({ active, onChange, counts }) {
  const tabs = [
    { k: 'antecedentes', label: 'Antecedentes', count: counts.ant },
    { k: 'motivo', label: 'Motivo y diagnostico' },
    { k: 'evolucion', label: 'Evolucion clinica', count: counts.evol },
    { k: 'presupuesto', label: 'Presupuesto', count: counts.tx },
    { k: 'insumos', label: 'Insumos' },
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
  const medicalBackgroundComment = patient?.medicalBackgroundComment ?? '';
  const allergiesComment = patient?.allergiesComment ?? '';
  const dentalHabitsComment = patient?.dentalHabitsComment ?? '';

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
          <div className="ant-comment">
            <span className="ant-comment-label">Comentario</span>
            <p>{medicalBackgroundComment || 'Sin comentario registrado.'}</p>
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
          <div className="ant-comment">
            <span className="ant-comment-label">Comentario</span>
            <p>{allergiesComment || 'Sin comentario registrado.'}</p>
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
          <div className="ant-comment">
            <span className="ant-comment-label">Comentario</span>
            <p>{dentalHabitsComment || 'Sin comentario registrado.'}</p>
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
  pricingSettings,
  pricingCatalog,
  pricingBudgets,
  saveState = 'loaded',
  lastSavedAt,
  onBudgetFieldChange,
  onTreatmentChange,
  onAddTreatment,
  onRemoveTreatment,
  onPricingSettingChange,
  onResetPricingSettings,
  onPricingCatalogChange,
  onAddPricingTreatment,
  onResetPricingTreatment,
  onRemovePricingTreatment,
  onResetPricingCatalog,
  onSavePricingSnapshot,
  onAcceptPricingSnapshot,
  onSetPricingSnapshotStatus,
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
  const editablePricingCatalog = pricingCatalog ?? [];
  const pricingReferenceTreatment =
    treatments.find((item) => item.id === budget?.pricingReferenceTreatmentId) ??
    treatments.find((item) => item.procedure && item.cost > 0 && findPricingTreatmentForProcedure(item.procedure, editablePricingCatalog)) ??
    treatments.find((item) => item.procedure && findPricingTreatmentForProcedure(item.procedure, editablePricingCatalog)) ??
    null;
  const pricingCatalogTreatment = pricingReferenceTreatment
    ? findPricingTreatmentForProcedure(pricingReferenceTreatment.procedure, editablePricingCatalog)
    : null;
  const pricingReferenceSuppliesCostByTreatmentId = budget?.pricingReferenceSuppliesCostByTreatmentId ?? {};
  const pricingReferenceMarketingCostByTreatmentId = budget?.pricingReferenceMarketingCostByTreatmentId ?? {};
  const pricingReferencePaymentFeePercentByTreatmentId = budget?.pricingReferencePaymentFeePercentByTreatmentId ?? {};
  const pricingReferenceId = pricingReferenceTreatment?.id ?? budget?.pricingReferenceTreatmentId ?? '';
  const pricingReferenceSuppliesCost =
    pricingReferenceId && pricingReferenceSuppliesCostByTreatmentId[pricingReferenceId] != null
      ? pricingReferenceSuppliesCostByTreatmentId[pricingReferenceId]
      : pricingCatalogTreatment?.suppliesCost ?? pricingReferenceTreatment?.cost ?? 0;
  const pricingReferenceMarketingCost =
    pricingReferenceId && pricingReferenceMarketingCostByTreatmentId[pricingReferenceId] != null
      ? pricingReferenceMarketingCostByTreatmentId[pricingReferenceId]
      : pricingCatalogTreatment?.marketingCost ?? DEFAULT_PRICING_SETTINGS.defaultMarketingCost;
  const pricingReferencePaymentFeePercent =
    pricingReferenceId && pricingReferencePaymentFeePercentByTreatmentId[pricingReferenceId] != null
      ? pricingReferencePaymentFeePercentByTreatmentId[pricingReferenceId]
      : pricingCatalogTreatment?.paymentFeePercent ?? DEFAULT_PRICING_SETTINGS.paymentFeePercent;
  useEffect(() => {
    if (mirror || !pricingReferenceId) return;

    if (pricingReferenceSuppliesCostByTreatmentId[pricingReferenceId] == null) {
      onBudgetFieldChange?.('pricingReferenceSuppliesCostByTreatmentId', {
        ...pricingReferenceSuppliesCostByTreatmentId,
        [pricingReferenceId]: pricingCatalogTreatment?.suppliesCost ?? pricingReferenceTreatment?.cost ?? 0,
      });
    }

    if (pricingReferenceMarketingCostByTreatmentId[pricingReferenceId] == null) {
      onBudgetFieldChange?.('pricingReferenceMarketingCostByTreatmentId', {
        ...pricingReferenceMarketingCostByTreatmentId,
        [pricingReferenceId]: pricingCatalogTreatment?.marketingCost ?? DEFAULT_PRICING_SETTINGS.defaultMarketingCost,
      });
    }

    if (pricingReferencePaymentFeePercentByTreatmentId[pricingReferenceId] == null) {
      onBudgetFieldChange?.('pricingReferencePaymentFeePercentByTreatmentId', {
        ...pricingReferencePaymentFeePercentByTreatmentId,
        [pricingReferenceId]: pricingCatalogTreatment?.paymentFeePercent ?? DEFAULT_PRICING_SETTINGS.paymentFeePercent,
      });
    }
  }, [
    mirror,
    pricingReferenceId,
    pricingReferenceTreatment,
    pricingCatalogTreatment,
    pricingReferenceSuppliesCostByTreatmentId,
    pricingReferenceMarketingCostByTreatmentId,
    pricingReferencePaymentFeePercentByTreatmentId,
    onBudgetFieldChange,
  ]);
  const pricingResult = pricingCatalogTreatment
    ? calculatePricingResult({
        treatment: pricingCatalogTreatment,
        settings: pricingSettings ?? DEFAULT_PRICING_SETTINGS,
        input: {
          customPrice: pricingReferenceTreatment.cost > 0 ? pricingReferenceTreatment.cost : pricingCatalogTreatment.basePrice,
          customSuppliesCost: pricingReferenceSuppliesCost,
          customMarketingCost: pricingReferenceMarketingCost,
          customPaymentFeePercent: pricingReferencePaymentFeePercent,
          customAdminCost: pricingCatalogTreatment.adminCost,
          customTransportCost: pricingCatalogTreatment.transportCost,
          customReservePercent: pricingCatalogTreatment.reservePercent,
          paymentMethod: 'card',
          applyPaymentFee: true,
          applyTax: true,
          applyReserve: true,
          laborCostMode: 'fixed',
          laborCostValue: pricingCatalogTreatment.defaultLaborCost,
        },
      })
    : null;
  const [openPricingHelp, setOpenPricingHelp] = useState(null);
  const buildPlanItemPricing = (item) => {
    const catalogItem = findPricingTreatmentForProcedure(item.procedure, editablePricingCatalog);
    if (!catalogItem) return null;

    return calculatePricingResult({
        treatment: catalogItem,
        settings: pricingSettings ?? DEFAULT_PRICING_SETTINGS,
        input: {
          customPrice: catalogItem.basePrice,
          customSuppliesCost: catalogItem.suppliesCost,
          customMarketingCost: catalogItem.marketingCost,
          customAdminCost: catalogItem.adminCost,
          customTransportCost: catalogItem.transportCost,
          customPaymentFeePercent: catalogItem.paymentFeePercent,
          customReservePercent: catalogItem.reservePercent,
          paymentMethod: 'card',
          applyPaymentFee: true,
          applyTax: true,
        applyReserve: true,
        laborCostMode: 'fixed',
        laborCostValue: catalogItem.defaultLaborCost,
      },
    });
  };
  const buildCatalogPreview = (item) =>
    calculatePricingResult({
      treatment: item,
      settings: pricingSettings ?? DEFAULT_PRICING_SETTINGS,
      input: {
        customPrice: item.basePrice,
        customSuppliesCost: item.suppliesCost,
        customMarketingCost: item.marketingCost,
        customAdminCost: item.adminCost,
        customTransportCost: item.transportCost,
        customPaymentFeePercent: item.paymentFeePercent,
        customReservePercent: item.reservePercent,
        paymentMethod: 'card',
        applyPaymentFee: true,
        applyTax: true,
        applyReserve: true,
        laborCostMode: 'fixed',
        laborCostValue: item.defaultLaborCost,
      },
    });
  const getCatalogSummaryCards = (preview) => [
    {
      key: 'directCosts',
      label: 'Costos',
      value: preview ? preview.boxCost + preview.suppliesCost : 0,
      percent: preview?.finalPrice > 0 ? ((preview.boxCost + preview.suppliesCost) / preview.finalPrice) * 100 : 0,
      help: pricingHelpText.directCosts,
    },
    {
      key: 'expenses',
      label: 'Gastos',
      value: preview ? preview.marketingCost + preview.adminCost + preview.transportCost + preview.paymentFeeAmount + preview.reserveAmount : 0,
      percent: preview?.finalPrice > 0
        ? ((preview.marketingCost + preview.adminCost + preview.transportCost + preview.paymentFeeAmount + preview.reserveAmount) / preview.finalPrice) * 100
        : 0,
      help: pricingHelpText.expenses,
    },
    {
      key: 'tax',
      label: 'Impuestos',
      value: preview ? preview.taxAmount : 0,
      percent: preview?.finalPrice > 0 ? (preview.taxAmount / preview.finalPrice) * 100 : 0,
      help: pricingHelpText.tax,
      tone: 'warn',
    },
    {
      key: 'labor',
      label: 'Mano de obra',
      value: preview ? preview.laborCost : 0,
      percent: preview?.finalPrice > 0 ? (preview.laborCost / preview.finalPrice) * 100 : 0,
      help: pricingHelpText.labor,
      tone: 'good',
    },
    {
      key: 'netProfit',
      label: 'Utilidad neta',
      value: preview ? preview.clinicProfit : 0,
      percent: preview?.finalPrice > 0 ? (preview.clinicProfit / preview.finalPrice) * 100 : 0,
      help: pricingHelpText.netProfit,
      tone: preview && preview.clinicProfit >= 0 ? 'good' : 'danger',
    },
  ];
  const saveLabel =
    saveState === 'dirty'
      ? 'Guardando presupuesto…'
      : saveState === 'saved'
        ? `Presupuesto guardado${lastSavedAt ? ` · ${lastSavedAt.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}` : ''}`
      : 'Presupuesto listo para edicion por paciente.';
  const pricingHelpText = {
    availableBeforeLabor:
      'Dinero que queda antes de pagar la mano de obra. Se obtiene restando box, insumos, captacion, administracion, traslado, comision, reserva e impuesto al precio final.',
    clinicProfit:
      'Ganancia final de la clinica despues de restar tambien la mano de obra profesional. Es el disponible antes de mano de obra menos la mano de obra.',
    pricingStatus:
      'Semaforo del margen antes de mano de obra. Indica si el precio esta demasiado justo, en zona aceptable o en zona sana.',
    externalClinicianStatus:
      'Indica si este precio sigue siendo rentable cuando la atencion la hace una odontologa externa con boleta.',
    box:
      'Costo del uso de silla o box clinico por el tiempo que ocupa este tratamiento. Se calcula como horas del tratamiento por tarifa por hora. No incluye pasaje del paciente. Ejemplo: 0.75 h x $10.000 = $7.500.',
    supplies:
      'Materiales que se consumen en el tratamiento y no se reutilizan: anestesia, resina, adhesivos, guantes, etc.',
    marketing:
      'Gasto para traer ese paciente o ese tratamiento: publicidad, anuncios, promociones, referidos pagados o campañas.',
    admin:
      'Tiempo operativo de la doctora o del consultorio: hacer presupuesto, registrar el caso, confirmar agenda, cobrar, cerrar caja y hacer seguimiento. Se separa como costo porque no está produciendo tratamiento directo.',
    transport:
      'Costo por mover al profesional o al material entre lugares cuando este caso lo necesita. No es el pasaje del paciente.',
    fee:
      'Comisión del medio de pago, por ejemplo Transbank o Mercado Pago. Se calcula sobre el precio final.',
    reserve:
      'Parte del precio que se deja aparte para imprevistos, meses bajos o reposición.',
    tax:
      'Retención o impuesto estimado. Hoy está configurado en 15,25% y se aplica sobre el precio final.',
    directCosts:
      'Suma de costos directos del tratamiento: uso de box y materiales/insumos clínicos.',
    expenses:
      'Suma de gastos operativos del caso: marketing, administración interna, comisión de pago, reserva y traslado.',
    netProfit:
      'Utilidad neta estimada después de costos, gastos, impuestos y mano de obra profesional.',
    labor:
      'Pago o costo profesional del tratamiento. Solo aparece cuando existe atención que requiere trabajo clínico.',
  };
  const pricingLineLabelMap = {
    Box: 'Box / silla',
    Insumos: 'Insumos clinicos',
    Marketing: 'Captacion por paciente',
    Administracion: 'Gestion interna',
    Traslado: 'Traslado profesional',
    Comision: 'Comision de pago',
    Reserva: 'Reserva operativa',
    'Impuesto o retencion': 'Impuesto / retencion',
  };
  const pricingLineHelpKeyMap = {
    'Box / silla': 'box',
    'Insumos clinicos': 'supplies',
    'Captacion por paciente': 'marketing',
    'Gestion interna': 'admin',
    'Traslado profesional': 'transport',
    'Comision de pago': 'fee',
    'Reserva operativa': 'reserve',
    'Impuesto / retencion': 'tax',
  };
  const referenceOptions = treatments.filter((item) => item.procedure || item.cost > 0);
  const operationalFiscalLoad =
    (pricingResult?.adminCost ?? 0) +
    (pricingResult?.reserveAmount ?? 0) +
    (pricingResult?.taxAmount ?? 0);
  const operationalFiscalLoadPercent =
    pricingResult && pricingResult.finalPrice > 0
      ? Math.round((operationalFiscalLoad / pricingResult.finalPrice) * 1000) / 10
      : 0;
  const softGreenLineLabels = new Set(['Insumos clinicos', 'Administracion', 'Reserva', 'Impuesto o retencion']);
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
            {topItems.map((item) => {
              const itemPricing = buildPlanItemPricing(item);
              const itemPriceLabel = itemPricing ? fmtCLP(itemPricing.finalPrice) : fmtCLP(item.cost);

              return (
                <div key={item.id} className="budget-plan-item">
                  <div className="budget-plan-item-main">
                    <input
                      className="budget-inline-input"
                      value={item.procedure}
                      onChange={(event) => onTreatmentChange(item.id, 'procedure', event.target.value)}
                      placeholder="Procedimiento"
                    />
                    <span className={`status ${legacyStatusClass(item.status)}`}>
                      <span className="dot" />
                      {labelForStatus(item.status)}
                    </span>
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
                    <span
                      className="budget-plan-price-chip"
                      title={itemPricing ? 'Precio coordinado con pricing' : 'Sin tratamiento mapeado a pricing'}
                    >
                      {itemPriceLabel}
                    </span>
                    <button className="btn btn-ghost" onClick={() => onRemoveTreatment(item.id)}>
                      <Icon.trash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
      <div className="budget-summary">
        <div className="bs-card"><div className="bs-label">Total presupuesto</div><div className="bs-value">{fmtCLP(total)}</div><div className="bs-sub">{treatments.length} tratamientos</div></div>
        <div className="bs-card g"><div className="bs-label">Pagado</div><div className="bs-value">{fmtCLP(pagado)}</div><div className="bs-sub">2 cuotas</div></div>
        <div className="bs-card a"><div className="bs-label">Saldo paciente</div><div className="bs-value">{fmtCLP(Math.round(aPagar))}</div><input className="bs-edit-input" value={budget.dueDateLabel} onChange={(event) => onBudgetFieldChange('dueDateLabel', event.target.value)} /></div>
      </div>
      <div className="budget-pricing-panel">
        <div className="budget-pricing-head">
          <div>
            <div className="bs-label">Lectura financiera estimada</div>
            <div className="budget-pricing-title">
              {pricingReferenceTreatment?.procedure ?? 'Sin tratamiento mapeado a pricing'}
            </div>
            <div className="budget-pricing-mapped">
              <span>Tratamiento de referencia</span>
              <strong>{pricingReferenceTreatment?.procedure ?? 'Sin referencia'}</strong>
              <span>Mapeado a pricing</span>
              <strong>{pricingCatalogTreatment?.name ?? 'Sin tratamiento mapeado'}</strong>
            </div>
            {!mirror && (
              <label className="budget-pricing-reference">
                <span>Referencia manual del calculo</span>
                <select
                  value={budget?.pricingReferenceTreatmentId ?? ''}
                  onChange={(event) => onBudgetFieldChange('pricingReferenceTreatmentId', event.target.value)}
                >
                  <option value="">Automatico</option>
                  {referenceOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.procedure || 'Sin procedimiento'}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          {pricingCatalogTreatment ? (
            <span className="budget-pricing-note">Base financiera local DentCool</span>
          ) : (
            <span className="budget-pricing-note">Pendiente de mapear catalogo</span>
          )}
        </div>

        {!mirror && pricingSettings && (
          <div className="budget-pricing-settings">
            <div className="budget-pricing-settings-head">
              <div className="bs-label">PricingSettings persistente</div>
              <button className="btn btn-secondary" type="button" onClick={onResetPricingSettings}>
                Reiniciar valores
              </button>
            </div>
            <div className="budget-pricing-settings-grid">
              <PricingSettingField
                label="Box por hora"
                value={pricingSettings.boxHourlyCost}
                onChange={(value) => onPricingSettingChange?.('boxHourlyCost', value)}
              />
              <PricingSettingField
                label="Traslado por sesion"
                value={pricingSettings.transportCostPerSession}
                onChange={(value) => onPricingSettingChange?.('transportCostPerSession', value)}
              />
              <PricingSettingField
                label="Comision pago %"
                value={pricingReferencePaymentFeePercent}
                step="0.01"
                onChange={(value) =>
                  onBudgetFieldChange(
                    'pricingReferencePaymentFeePercentByTreatmentId',
                    {
                      ...pricingReferencePaymentFeePercentByTreatmentId,
                      [pricingReferenceId]: Number(value) || 0,
                    }
                  )
                }
              />
              <PricingSettingField
                label="Retencion estimada %"
                value={pricingSettings.taxPercent}
                step="0.01"
                onChange={(value) => onPricingSettingChange?.('taxPercent', value)}
              />
              <PricingSettingField
                label="Insumos por paciente"
                value={pricingReferenceSuppliesCost}
                onChange={(value) =>
                  onBudgetFieldChange(
                    'pricingReferenceSuppliesCostByTreatmentId',
                    {
                      ...pricingReferenceSuppliesCostByTreatmentId,
                      [pricingReferenceId]: Number(value) || 0,
                    }
                  )
                }
              />
              <PricingSettingField
                label="Marketing por paciente"
                value={pricingReferenceMarketingCost}
                onChange={(value) =>
                  onBudgetFieldChange(
                    'pricingReferenceMarketingCostByTreatmentId',
                    {
                      ...pricingReferenceMarketingCostByTreatmentId,
                      [pricingReferenceId]: Number(value) || 0,
                    }
                  )
                }
              />
              <PricingSettingField
                label="Administracion"
                value={pricingSettings.defaultAdminCost}
                onChange={(value) => onPricingSettingChange?.('defaultAdminCost', value)}
              />
              <PricingSettingField
                label="Reserva %"
                value={pricingSettings.defaultReservePercent}
                step="0.01"
                onChange={(value) => onPricingSettingChange?.('defaultReservePercent', value)}
              />
            </div>
          </div>
        )}

        {!mirror && (
          <div className="budget-pricing-settings budget-pricing-catalog">
            <div className="budget-pricing-settings-head">
              <div>
                <div className="bs-label">Catalogo editable de pricing</div>
                <div className="budget-catalog-caption">
                  Ajusta nombres, alias, precios base y margenes sin tocar `pricing.js`.
                </div>
              </div>
              <div className="budget-catalog-actions">
                <button className="btn btn-secondary" type="button" onClick={onResetPricingCatalog}>
                  Reiniciar catalogo
                </button>
                <button className="btn btn-primary" type="button" onClick={onAddPricingTreatment}>
                  <Icon.plus />
                  Agregar item
                </button>
              </div>
            </div>
            <div className="budget-catalog-list">
              {editablePricingCatalog.map((item) => {
                const catalogPreview = buildCatalogPreview(item);

                return (
                  <div key={item.id} className="budget-catalog-card">
                  <div className="budget-catalog-card-head">
                    <div className="budget-catalog-title">
                      <strong>{item.name || 'Tratamiento sin nombre'}</strong>
                      <span>{item.category || 'otro'}</span>
                    </div>
                    <label className="budget-catalog-toggle">
                      <input
                        type="checkbox"
                        checked={Boolean(item.active)}
                        onChange={(event) => onPricingCatalogChange?.(item.id, 'active', event.target.checked)}
                      />
                      <span title="Mantiene este tratamiento disponible dentro del catalogo de pricing">Activo</span>
                    </label>
                    <button
                      className="btn btn-secondary budget-catalog-reset"
                      type="button"
                      onClick={() => onResetPricingTreatment?.(item.id)}
                      title="Restaurar este tratamiento a su valor base original"
                    >
                      Restaurar
                    </button>
                    <button className="btn btn-ghost" type="button" onClick={() => onRemovePricingTreatment?.(item.id)}>
                      <Icon.trash />
                    </button>
                  </div>
                  <div className="budget-catalog-summary">
                    {getCatalogSummaryCards(catalogPreview).map((metric, index) => (
                      <div key={metric.key} className={`budget-catalog-metric${metric.tone ? ` tone-${metric.tone}` : ''}`}>
                        <div className="budget-catalog-metric-head">
                          <span>{metric.label}</span>
                          <PricingHelpButton
                            label={metric.label}
                            text={metric.help}
                            compact
                            open={openPricingHelp === `catalog-${item.id}-${metric.key}`}
                            placement={index < 2 ? 'right' : 'left'}
                            onToggle={() =>
                              setOpenPricingHelp((current) =>
                                current === `catalog-${item.id}-${metric.key}` ? null : `catalog-${item.id}-${metric.key}`
                              )
                            }
                          />
                        </div>
                        <strong>{fmtCLP(metric.value)}</strong>
                        <small>{fmtPercent(metric.percent)}</small>
                      </div>
                    ))}
                  </div>
                  <div className="budget-catalog-grid">
                    <PricingCatalogField
                      label="Nombre"
                      value={item.name}
                      onChange={(value) => onPricingCatalogChange?.(item.id, 'name', value)}
                    />
                    <PricingCatalogField
                      label="Categoria"
                      value={item.category}
                      onChange={(value) => onPricingCatalogChange?.(item.id, 'category', value)}
                    />
                    <PricingCatalogField
                      label="Alias"
                      value={item.aliases.join(', ')}
                      onChange={(value) => onPricingCatalogChange?.(item.id, 'aliases', value)}
                    />
                    <PricingCatalogField
                      label="Precio base"
                      type="number"
                      value={item.basePrice}
                      onChange={(value) => onPricingCatalogChange?.(item.id, 'basePrice', value)}
                    />
                    <PricingCatalogField
                      label="Horas"
                      type="number"
                      step="0.01"
                      value={item.durationHours}
                      onChange={(value) => onPricingCatalogChange?.(item.id, 'durationHours', value)}
                    />
                    <PricingCatalogField
                      label="Insumos"
                      type="number"
                      value={item.suppliesCost}
                      onChange={(value) => onPricingCatalogChange?.(item.id, 'suppliesCost', value)}
                    />
                    <PricingCatalogField
                      label="Marketing por paciente"
                      type="number"
                      value={item.marketingCost}
                      onChange={(value) => onPricingCatalogChange?.(item.id, 'marketingCost', value)}
                    />
                    <PricingCatalogField
                      label="Gestion interna"
                      helpText={pricingHelpText.admin}
                      helpOpen={openPricingHelp === `catalog-${item.id}-admin`}
                      onHelpToggle={() =>
                        setOpenPricingHelp((current) => (current === `catalog-${item.id}-admin` ? null : `catalog-${item.id}-admin`))
                      }
                      type="number"
                      value={item.adminCost}
                      onChange={(value) => onPricingCatalogChange?.(item.id, 'adminCost', value)}
                    />
                    <PricingCatalogField
                      label="Traslado por sesion"
                      type="number"
                      value={item.transportCost}
                      onChange={(value) => onPricingCatalogChange?.(item.id, 'transportCost', value)}
                    />
                    <PricingCatalogField
                      label="Comision pago %"
                      type="number"
                      step="0.01"
                      value={item.paymentFeePercent}
                      onChange={(value) => onPricingCatalogChange?.(item.id, 'paymentFeePercent', value)}
                    />
                    <PricingCatalogField
                      label="Reserva %"
                      type="number"
                      step="0.01"
                      value={item.reservePercent}
                      onChange={(value) => onPricingCatalogChange?.(item.id, 'reservePercent', value)}
                    />
                    <PricingCatalogField
                      label="Precio minimo"
                      type="number"
                      value={item.minPrice}
                      onChange={(value) => onPricingCatalogChange?.(item.id, 'minPrice', value)}
                    />
                    <PricingCatalogField
                      label="Precio sano"
                      type="number"
                      value={item.healthyPrice}
                      onChange={(value) => onPricingCatalogChange?.(item.id, 'healthyPrice', value)}
                    />
                    <PricingCatalogField
                      label="Precio ideal"
                      type="number"
                      value={item.idealPrice}
                      onChange={(value) => onPricingCatalogChange?.(item.id, 'idealPrice', value)}
                    />
                    <PricingCatalogField
                      label="Descuento max %"
                      type="number"
                      step="0.01"
                      value={item.maxRecommendedDiscountPercent}
                      onChange={(value) => onPricingCatalogChange?.(item.id, 'maxRecommendedDiscountPercent', value)}
                    />
                    <PricingCatalogField
                      label="Mano de obra"
                      type="number"
                      value={item.defaultLaborCost}
                      onChange={(value) => onPricingCatalogChange?.(item.id, 'defaultLaborCost', value)}
                    />
                    <PricingCatalogField
                      label="Nota"
                      value={item.notes}
                      onChange={(value) => onPricingCatalogChange?.(item.id, 'notes', value)}
                    />
                  </div>
                  </div>
                );
              })}
              {editablePricingCatalog.length === 0 && (
                <div className="budget-pricing-empty">
                  No hay tratamientos en el catalogo persistente. Agrega uno nuevo para volver a mapear pricing.
                </div>
              )}
            </div>
          </div>
        )}

        {pricingResult ? (
          <>
            {!mirror && (
              <div className="budget-pricing-history-head">
                <div>
                  <div className="bs-label">Registro financiero por paciente</div>
                  <div className="budget-catalog-caption">
                    Guarda un registro historico del calculo actual antes de que cambien costos o settings.
                  </div>
                </div>
                <button className="btn btn-primary" type="button" onClick={onSavePricingSnapshot}>
                  <Icon.plus />
                  Guardar registro
                </button>
              </div>
            )}

            <div className="budget-pricing-grid">
              <div className="budget-pricing-kpi budget-pricing-kpi-wide tone-good">
                <div className="budget-pricing-kpi-head">
                  <span>Gestion + reserva + fiscal</span>
                  <PricingHelpButton
                    label="Gestion + reserva + fiscal"
                    text="Suma de gestion interna, reserva operativa e impuesto estimado para este tratamiento."
                    open={openPricingHelp === 'operationalFiscalLoad'}
                    placement="right"
                    onToggle={() => setOpenPricingHelp((current) => (current === 'operationalFiscalLoad' ? null : 'operationalFiscalLoad'))}
                  />
                </div>
                <strong>{fmtCLP(operationalFiscalLoad)}</strong>
                <small>{fmtPercent(operationalFiscalLoadPercent)}</small>
              </div>
              <div className="budget-pricing-kpi budget-pricing-kpi-small">
                <div className="budget-pricing-kpi-head">
                  <span>Disponible profesional + clinica</span>
                  <PricingHelpButton
                    label="Disponible profesional + clinica"
                    text={pricingHelpText.availableBeforeLabor}
                    open={openPricingHelp === 'availableBeforeLabor'}
                    placement="right"
                    onToggle={() => setOpenPricingHelp((current) => (current === 'availableBeforeLabor' ? null : 'availableBeforeLabor'))}
                  />
                </div>
                <strong>{fmtCLP(pricingResult.availableBeforeLabor)}</strong>
                <small>{fmtPercent(pricingResult.availableBeforeLaborPercent)}</small>
              </div>
              <div className="budget-pricing-kpi budget-pricing-kpi-small">
                <div className="budget-pricing-kpi-head">
                  <span>Utilidad clinica</span>
                  <PricingHelpButton
                    label="Utilidad clinica"
                    text={pricingHelpText.clinicProfit}
                    open={openPricingHelp === 'clinicProfit'}
                    placement="right"
                    onToggle={() => setOpenPricingHelp((current) => (current === 'clinicProfit' ? null : 'clinicProfit'))}
                  />
                </div>
                <strong>{fmtCLP(pricingResult.clinicProfit)}</strong>
                <small>{fmtPercent(pricingResult.clinicProfitPercent)}</small>
              </div>
              <div className={`budget-pricing-kpi budget-pricing-kpi-small tone-${getPricingTone(pricingResult.pricingStatus)}`}>
                <div className="budget-pricing-kpi-head">
                  <span>Estado pricing</span>
                  <PricingHelpButton
                    label="Estado pricing"
                    text={pricingHelpText.pricingStatus}
                    open={openPricingHelp === 'pricingStatus'}
                    placement="left"
                    onToggle={() => setOpenPricingHelp((current) => (current === 'pricingStatus' ? null : 'pricingStatus'))}
                  />
                </div>
                <strong>{pricingResult.pricingStatus}</strong>
                <small>Meta sana desde 45%</small>
              </div>
              <div className={`budget-pricing-kpi budget-pricing-kpi-small tone-${getPricingTone(pricingResult.externalClinicianStatus)}`}>
                <div className="budget-pricing-kpi-head">
                  <span>Escala con boleta</span>
                  <PricingHelpButton
                    label="Escala con boleta"
                    text={pricingHelpText.externalClinicianStatus}
                    open={openPricingHelp === 'externalClinicianStatus'}
                    placement="left"
                    onToggle={() => setOpenPricingHelp((current) => (current === 'externalClinicianStatus' ? null : 'externalClinicianStatus'))}
                  />
                </div>
                <strong>{pricingResult.externalClinicianStatus}</strong>
                <small>Despues de mano de obra</small>
              </div>
            </div>

            <div className="budget-pricing-lines">
              {pricingResult.lines.slice(1, 9).map((line) => (
                <div key={line.label} className={`budget-pricing-line ${softGreenLineLabels.has(line.label) ? 'tone-green' : ''}`}>
                  <div className="budget-pricing-line-label">
                    <span>{pricingLineLabelMap[line.label] ?? line.label}</span>
                    {pricingLineHelpKeyMap[pricingLineLabelMap[line.label] ?? line.label] && (
                      <PricingHelpButton
                        label={pricingLineLabelMap[line.label] ?? line.label}
                        text={pricingHelpText[pricingLineHelpKeyMap[pricingLineLabelMap[line.label] ?? line.label]]}
                        compact
                        open={openPricingHelp === `line-${line.label}`}
                        placement="right"
                        onToggle={() => setOpenPricingHelp((current) => (current === `line-${line.label}` ? null : `line-${line.label}`))}
                      />
                    )}
                  </div>
                  <span>{fmtCLP(line.amount)}</span>
                  <span>{fmtPercent(line.percentOfFinalPrice)}</span>
                </div>
              ))}
            </div>

            <div className="budget-pricing-targets">
              <span>Meta 40: {pricingResult.recommendedPriceFor40 ? fmtCLP(pricingResult.recommendedPriceFor40) : 'No aplica'}</span>
              <span>Meta 45: {pricingResult.recommendedPriceFor45 ? fmtCLP(pricingResult.recommendedPriceFor45) : 'No aplica'}</span>
              <span>Meta 50: {pricingResult.recommendedPriceFor50 ? fmtCLP(pricingResult.recommendedPriceFor50) : 'No aplica'}</span>
            </div>

            {pricingResult.warnings.length > 0 && (
              <div className="budget-pricing-alerts">
                {pricingResult.warnings.slice(0, 3).map((warning) => (
                  <div key={warning} className="budget-pricing-alert">
                    <Icon.alert />
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="budget-snapshot-list">
              {(pricingBudgets ?? []).length > 0 ? (
                (pricingBudgets ?? []).map((snapshot) => (
                  <div key={snapshot.id} className="budget-snapshot-card">
                    <div className="budget-snapshot-head">
                      <div>
                        <strong>{snapshot.treatmentNameSnapshot || 'Registro sin tratamiento'}</strong>
                        <div className="budget-snapshot-meta">
                          Estado: {snapshot.status} ·
                          {' '}
                          {snapshot.createdAt
                            ? new Date(snapshot.createdAt).toLocaleString('es-CL', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Sin fecha'}
                        </div>
                      </div>
                      <span className={`budget-snapshot-status tone-${snapshot.status}`}>{snapshot.status}</span>
                    </div>
                    <div className="budget-snapshot-grid">
                      <div><span>Precio final</span><strong>{fmtCLP(snapshot.calculationSnapshot?.finalPrice ?? 0)}</strong></div>
                      <div><span>Disponible</span><strong>{fmtCLP(snapshot.calculationSnapshot?.availableBeforeLabor ?? 0)}</strong></div>
                      <div><span>Utilidad clinica</span><strong>{fmtCLP(snapshot.calculationSnapshot?.clinicProfit ?? 0)}</strong></div>
                      <div><span>Estado</span><strong>{snapshot.calculationSnapshot?.pricingStatus ?? 'Sin estado'}</strong></div>
                    </div>
                    {!mirror && snapshot.status !== 'accepted' && (
                      <div className="budget-snapshot-actions">
                        {snapshot.status !== 'sent' && (
                          <button className="btn btn-secondary" type="button" onClick={() => onSetPricingSnapshotStatus?.(snapshot.id, 'sent')}>
                            Enviar
                          </button>
                        )}
                        <button className="btn btn-secondary" type="button" onClick={() => onAcceptPricingSnapshot?.(snapshot.id)}>
                          <Icon.check />
                          Aceptar
                        </button>
                        {snapshot.status !== 'rejected' && (
                          <button className="btn btn-secondary" type="button" onClick={() => onSetPricingSnapshotStatus?.(snapshot.id, 'rejected')}>
                            Rechazar
                          </button>
                        )}
                        {snapshot.status !== 'expired' && (
                          <button className="btn btn-secondary" type="button" onClick={() => onSetPricingSnapshotStatus?.(snapshot.id, 'expired')}>
                            Vencer
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="budget-pricing-empty">
                  Aun no hay registros financieros guardados para este paciente.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="budget-pricing-empty">
            Aun no hay un tratamiento del plan que coincida con el catalogo base de pricing. El siguiente paso es
            mapear o normalizar nombres como limpieza, blanqueamiento, restauracion o sellantes.
          </div>
        )}
      </div>
      <div className="budget-edit-list">
        <div className="budget-edit-header">
          <span>Procedimiento</span>
          <span>Profesional</span>
          <span>Estado</span>
          <span>Costo</span>
          <span>Pagado</span>
          <span>% cobertura</span>
        </div>
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

function PricingSettingField({ label, value, onChange, step = '1' }) {
  return (
    <label className="pricing-setting-field">
      <span>{label}</span>
      <input type="number" inputMode="decimal" step={step} value={value} onChange={(event) => onChange?.(event.target.value)} />
    </label>
  );
}

function PricingCatalogField({
  label,
  value,
  onChange,
  type = 'text',
  step = '1',
  helpText = null,
  helpOpen = false,
  onHelpToggle = null,
}) {
  return (
    <label className="pricing-setting-field">
      <span className="pricing-setting-label-row">
        <span className="pricing-setting-label-text">{label}</span>
        {helpText && (
          <PricingHelpButton
            label={label}
            text={helpText}
            compact
            open={helpOpen}
            placement="right"
            onToggle={onHelpToggle}
          />
        )}
      </span>
      <input
        type={type}
        inputMode={type === 'number' ? 'decimal' : undefined}
        step={type === 'number' ? step : undefined}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </label>
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

export function AgendaClinica({
  appointments,
  saveState = 'loaded',
  lastSavedAt,
  onAppointmentChange,
  onAddAppointment,
  onRemoveAppointment,
  mirror = false,
  onOpenSection,
}) {
  const saveLabel =
    saveState === 'dirty'
      ? 'Guardando agenda clinica…'
      : saveState === 'saved'
        ? `Agenda clinica guardada${lastSavedAt ? ` · ${lastSavedAt.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}` : ''}`
        : 'Citas listas para edicion por paciente.';

  return (
    <div className="documents-editor">
      <div className="documents-toolbar">
        <div>
          <div className="muted" style={{ fontSize: 12.5 }}>{appointments.length} citas registradas</div>
          <div className="documents-save-note">{saveLabel}</div>
        </div>
        {mirror ? (
          <button className="btn btn-secondary" type="button" onClick={() => onOpenSection?.('agenda')}>
            <Icon.edit />
            Editar ficha
          </button>
        ) : (
          <button className="btn btn-primary" onClick={onAddAppointment}><Icon.plus />Nueva cita</button>
        )}
      </div>
      <div className="documents-list">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="document-row">
            <div className="document-main">
              <div className="document-head">
                <div className="document-title">{appointment.reason || 'Seguimiento clinico'}</div>
                {!mirror && <button className="btn btn-ghost" onClick={() => onRemoveAppointment(appointment.id)}><Icon.trash /></button>}
              </div>
              {mirror ? (
                <>
                  <div className="document-fields">
                    <div className="document-field">
                      <span>Fecha</span>
                      <div className="document-value">{appointment.dateLabel || 'Sin fecha'}</div>
                    </div>
                    <div className="document-field">
                      <span>Hora</span>
                      <div className="document-value">{appointment.timeLabel || 'Sin hora'}</div>
                    </div>
                    <div className="document-field">
                      <span>Estado</span>
                      <div className="document-value">{appointment.status || 'scheduled'}</div>
                    </div>
                  </div>
                  <div className="document-meta-line">
                    <span className="document-kind">{appointment.clinician || 'Sin profesional'}</span>
                    <span>{appointment.notes || 'Sin notas registradas.'}</span>
                  </div>
                </>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
                    <label className="document-field">
                      <span>Fecha</span>
                      <input value={appointment.dateLabel} onChange={(event) => onAppointmentChange(appointment.id, 'dateLabel', event.target.value)} placeholder="14 may 2026" />
                    </label>
                    <label className="document-field">
                      <span>Hora</span>
                      <input value={appointment.timeLabel} onChange={(event) => onAppointmentChange(appointment.id, 'timeLabel', event.target.value)} placeholder="10:00" />
                    </label>
                    <label className="document-field">
                      <span>Estado</span>
                      <select value={appointment.status} onChange={(event) => onAppointmentChange(appointment.id, 'status', event.target.value)}>
                        <option value="scheduled">Programada</option>
                        <option value="confirmed">Confirmada</option>
                        <option value="completed">Realizada</option>
                        <option value="cancelled">Cancelada</option>
                        <option value="no_show">No asiste</option>
                      </select>
                    </label>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <label className="document-field">
                      <span>Profesional</span>
                      <input value={appointment.clinician} onChange={(event) => onAppointmentChange(appointment.id, 'clinician', event.target.value)} placeholder="Dra. responsable" />
                    </label>
                    <label className="document-field">
                      <span>Motivo</span>
                      <input value={appointment.reason} onChange={(event) => onAppointmentChange(appointment.id, 'reason', event.target.value)} placeholder="Control / seguimiento" />
                    </label>
                  </div>
                  <label className="document-field">
                    <span>Notas</span>
                    <textarea value={appointment.notes} onChange={(event) => onAppointmentChange(appointment.id, 'notes', event.target.value)} placeholder="Confirmacion, indicaciones, reagendamiento o contexto." />
                  </label>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {!appointments.length && (
        <div className="finance-empty">Aun no hay citas separadas como entidad formal para este paciente.</div>
      )}
    </div>
  );
}

export function CobrosAbonos({
  payments,
  treatments,
  saveState = 'loaded',
  lastSavedAt,
  onPaymentChange,
  onAddPayment,
  onRemovePayment,
  mirror = false,
  onOpenSection,
}) {
  const treatmentOptions = treatments ?? [];
  const saveLabel =
    saveState === 'dirty'
      ? 'Guardando cobros y abonos…'
      : saveState === 'saved'
        ? `Cobros y abonos guardados${lastSavedAt ? ` · ${lastSavedAt.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}` : ''}`
        : 'Pagos listos para edicion por paciente.';

  return (
    <div className="documents-editor">
      <div className="documents-toolbar">
        <div>
          <div className="muted" style={{ fontSize: 12.5 }}>{payments.length} abonos registrados</div>
          <div className="documents-save-note">{saveLabel}</div>
        </div>
        {mirror ? (
          <button className="btn btn-secondary" type="button" onClick={() => onOpenSection?.('cobros')}>
            <Icon.edit />
            Editar ficha
          </button>
        ) : (
          <button className="btn btn-primary" onClick={onAddPayment}><Icon.plus />Nuevo abono</button>
        )}
      </div>
      <div className="documents-list">
        {payments.map((payment) => (
          <div key={payment.id} className="document-row">
            <div className="document-main">
              <div className="document-head">
                <div className="document-title">{payment.concept || 'Abono'}</div>
                {!mirror && <button className="btn btn-ghost" onClick={() => onRemovePayment(payment.id)}><Icon.trash /></button>}
              </div>
              {mirror ? (
                <>
                  <div className="document-fields">
                    <div className="document-field">
                      <span>Fecha</span>
                      <div className="document-value">{payment.dateLabel || 'Sin fecha'}</div>
                    </div>
                    <div className="document-field">
                      <span>Monto</span>
                      <div className="document-value">{fmtCLP(payment.amount || 0)}</div>
                    </div>
                    <div className="document-field">
                      <span>Metodo</span>
                      <div className="document-value">{payment.method || 'cash'}</div>
                    </div>
                  </div>
                  <div className="document-meta-line">
                    <span className="document-kind">{treatmentOptions.find((item) => item.id === payment.treatmentId)?.procedure || 'Sin tratamiento asociado'}</span>
                    <span>{payment.notes || 'Sin notas registradas.'}</span>
                  </div>
                </>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
                    <label className="document-field">
                      <span>Fecha</span>
                      <input value={payment.dateLabel} onChange={(event) => onPaymentChange(payment.id, 'dateLabel', event.target.value)} placeholder="14 may 2026" />
                    </label>
                    <label className="document-field">
                      <span>Monto</span>
                      <input type="number" inputMode="decimal" value={payment.amount} onChange={(event) => onPaymentChange(payment.id, 'amount', event.target.value)} placeholder="0" />
                    </label>
                    <label className="document-field">
                      <span>Metodo</span>
                      <select value={payment.method} onChange={(event) => onPaymentChange(payment.id, 'method', event.target.value)}>
                        <option value="cash">Efectivo</option>
                        <option value="card">Tarjeta</option>
                        <option value="transfer">Transferencia</option>
                        <option value="mixed">Mixto</option>
                        <option value="other">Otro</option>
                      </select>
                    </label>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <label className="document-field">
                      <span>Tratamiento</span>
                      <select value={payment.treatmentId || ''} onChange={(event) => onPaymentChange(payment.id, 'treatmentId', event.target.value)}>
                        <option value="">Sin asociar</option>
                        {treatmentOptions.map((treatment) => (
                          <option key={treatment.id} value={treatment.id}>{treatment.procedure || treatment.id}</option>
                        ))}
                      </select>
                    </label>
                    <label className="document-field">
                      <span>Concepto</span>
                      <input value={payment.concept} onChange={(event) => onPaymentChange(payment.id, 'concept', event.target.value)} placeholder="Abono inicial / cuota / saldo" />
                    </label>
                  </div>
                  <label className="document-field">
                    <span>Notas</span>
                    <textarea value={payment.notes} onChange={(event) => onPaymentChange(payment.id, 'notes', event.target.value)} placeholder="Medio de pago, referencia o detalle del abono." />
                  </label>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {!payments.length && (
        <div className="finance-empty">Aun no hay cobros o abonos separados como entidad formal para este paciente.</div>
      )}
    </div>
  );
}

export function Insumos({
  patient,
  treatments,
  appointments,
  pricingCatalog,
  budget,
  onBudgetFieldChange,
  onOpenSection,
  mirror = false,
}) {
  const treatmentOptions = treatments ?? [];
  const initialTreatmentId = budget?.pricingReferenceTreatmentId ?? treatmentOptions.find((item) => item.procedure && findPricingTreatmentForProcedure(item.procedure, pricingCatalog ?? []))?.id ?? treatmentOptions[0]?.id ?? '';
  const [moduleState, setModuleState] = useState(() => loadSupplyState());
  const [selectedTreatmentId, setSelectedTreatmentId] = useState(initialTreatmentId);
  const [draftItems, setDraftItems] = useState([]);
  const [extraItemId, setExtraItemId] = useState('');
  const [openInsumosHelp, setOpenInsumosHelp] = useState(null);
  const [newCatalogName, setNewCatalogName] = useState('');
  const [newCatalogUnit, setNewCatalogUnit] = useState('unidad');
  const [newCatalogQuantity, setNewCatalogQuantity] = useState(1);
  const [newCatalogTotalCost, setNewCatalogTotalCost] = useState(0);
  const [showCatalogList, setShowCatalogList] = useState(false);
  const [editingCatalogId, setEditingCatalogId] = useState('');

  useEffect(() => {
    saveSupplyState(moduleState);
  }, [moduleState]);

  useEffect(() => {
    if (!selectedTreatmentId && initialTreatmentId) {
      setSelectedTreatmentId(initialTreatmentId);
      return;
    }
    if (selectedTreatmentId && treatmentOptions.some((item) => item.id === selectedTreatmentId)) return;
    if (initialTreatmentId) setSelectedTreatmentId(initialTreatmentId);
  }, [initialTreatmentId, selectedTreatmentId, treatmentOptions]);

  const selectedTreatment =
    treatmentOptions.find((item) => item.id === selectedTreatmentId) ??
    treatmentOptions.find((item) => item.id === budget?.pricingReferenceTreatmentId) ??
    treatmentOptions.find((item) => item.procedure && findPricingTreatmentForProcedure(item.procedure, pricingCatalog ?? [])) ??
    treatmentOptions[0] ??
    null;
  const mappedPricingTreatment = selectedTreatment
    ? findPricingTreatmentForProcedure(selectedTreatment.procedure, pricingCatalog ?? [])
    : null;
  const selectedRecipe = mappedPricingTreatment
    ? moduleState.recipes.find((recipe) => recipe.treatmentId === mappedPricingTreatment.id)
    : null;

  useEffect(() => {
    if (!selectedRecipe) {
      setDraftItems([]);
      return;
    }

    setDraftItems(
      selectedRecipe.items.map((item) => ({
        ...item,
      }))
    );
  }, [selectedRecipe?.id]);

  const usageResult = calculatePatientSupplyUsageCost(draftItems, moduleState.catalog);
  const agendaNeeds = checkAgendaSupplyNeeds(appointments ?? [], moduleState.recipes, moduleState.catalog);
  const lowStockItems = moduleState.catalog.filter(checkLowStock);
  const patientSnapshots = moduleState.snapshots.filter((snapshot) => snapshot.patientId === patient?.id);

  const handleQtyChange = (itemId, value) => {
    const nextQuantity = Number(value) || 0;
    setDraftItems((current) =>
      current.map((item) => (item.itemId === itemId ? { ...item, quantity: nextQuantity } : item))
    );
  };

  const handleAddExtraItem = () => {
    const item = moduleState.catalog.find((catalogItem) => catalogItem.id === extraItemId);
    if (!item) return;

    setDraftItems((current) => {
      if (current.some((entry) => entry.itemId === item.id)) return current;
      return [
        ...current,
        {
          itemId: item.id,
          quantity: item.defaultUsePerPatient ?? 1,
          editableAtPatientLevel: true,
          isExtra: true,
        },
      ];
    });
    setExtraItemId('');
  };

  const handleRemoveDraftItem = (itemId) => {
    setDraftItems((current) => current.filter((item) => item.itemId !== itemId));
  };

  const handleSaveCatalogItem = () => {
    const nextName = newCatalogName.trim() || 'Nuevo insumo';
    const nextQuantity = Number(newCatalogQuantity) || 0;
    const nextTotalCost = Number(newCatalogTotalCost) || 0;
    const nextUnitCost = nextQuantity > 0 ? Math.round(nextTotalCost / nextQuantity) : 0;

    if (editingCatalogId) {
      setModuleState((current) => ({
        ...current,
        catalog: current.catalog.map((item) => {
          if (item.id !== editingCatalogId) return item;
          return {
            ...item,
            name: nextName,
            unit: newCatalogUnit,
            purchaseQuantity: nextQuantity,
            purchaseTotalCost: nextTotalCost,
            unitCost: nextUnitCost,
          };
        }),
      }));
    } else {
      const nextIndex = moduleState.catalog.length + 1;
      const nextId = `sup_custom_${Date.now()}_${nextIndex}`;
      setModuleState((current) => ({
        ...current,
        catalog: [
          {
            id: nextId,
            name: nextName,
            category: 'Otros',
            itemType: 'consumable',
            unit: newCatalogUnit,
            purchaseQuantity: nextQuantity,
            purchaseTotalCost: nextTotalCost,
            unitCost: nextUnitCost,
            currentStock: 0,
            minimumStock: 0,
            supplierId: '',
            defaultUsePerPatient: 1,
            active: true,
            notes: '',
          },
          ...current.catalog,
        ],
      }));
    }
    setNewCatalogName('');
    setNewCatalogUnit('unidad');
    setNewCatalogQuantity(1);
    setNewCatalogTotalCost(0);
    setEditingCatalogId('');
  };

  const handleRemoveCatalogItem = (itemId) => {
    setModuleState((current) => ({
      ...current,
      catalog: current.catalog.filter((item) => item.id !== itemId),
    }));
  };

  const handleResetCatalog = () => {
    setModuleState((current) => ({
      ...current,
      catalog: resetSupplyCatalog(),
    }));
  };

  const handleEditCatalogItem = (item) => {
    setEditingCatalogId(item.id);
    setNewCatalogName(item.name ?? '');
    setNewCatalogUnit(item.unit ?? 'unidad');
    setNewCatalogQuantity(item.purchaseQuantity ?? 1);
    setNewCatalogTotalCost(item.purchaseTotalCost ?? 0);
    setShowCatalogList(false);
  };

  const handleCancelCatalogEdit = () => {
    setEditingCatalogId('');
    setNewCatalogName('');
    setNewCatalogUnit('unidad');
    setNewCatalogQuantity(1);
    setNewCatalogTotalCost(0);
  };

  const handleResetModule = () => {
    const resetState = resetSupplyState();
    setModuleState(resetState);
    setDraftItems(
      selectedRecipe?.items.map((item) => ({
        ...item,
      })) ?? []
    );
  };

  const handleSaveSnapshot = () => {
    if (!patient?.id || !selectedTreatment || !selectedRecipe) return;

    const snapshot = createSupplySnapshot({
      patientId: patient.id,
      treatmentId: mappedPricingTreatment?.id ?? selectedTreatment.id,
      appointmentId: appointments?.[0]?.id ?? null,
      recipeId: selectedRecipe.id,
      recipeName: selectedRecipe.name,
      usageItems: draftItems,
      catalog: moduleState.catalog,
      notes: `Snapshot de insumos para ${selectedTreatment.procedure}`,
      status: 'confirmed',
      source: 'manual',
    });

    setModuleState((current) => ({
      ...current,
      snapshots: [snapshot, ...current.snapshots],
    }));
    onBudgetFieldChange?.('supplySnapshotId', snapshot.id);
  };

  return (
    <div className="documents-editor">
      <div className="documents-toolbar">
        <div>
          <div className="muted" style={{ fontSize: 12.5 }}>
            {patient?.fullName ?? 'Sin paciente seleccionado'} · {patientSnapshots.length} snapshots locales
          </div>
          <div className="documents-save-note">
            {selectedRecipe ? selectedRecipe.name : 'Selecciona un tratamiento con receta para ver insumos'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" type="button" onClick={handleResetModule}>
            <Icon.edit />
            Restaurar modulo
          </button>
          <button className="btn btn-primary" type="button" onClick={handleSaveSnapshot} disabled={!selectedRecipe}>
            <Icon.plus />
            Guardar snapshot
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 14 }}>
        <div className="budget-pricing-kpi budget-pricing-kpi-small tone-good">
          <div className="budget-pricing-kpi-head"><span>Catalogo</span></div>
          <strong>{moduleState.catalog.length}</strong>
          <small>items cargados</small>
        </div>
        <div className="budget-pricing-kpi budget-pricing-kpi-small tone-good">
          <div className="budget-pricing-kpi-head"><span>Recetas</span></div>
          <strong>{moduleState.recipes.length}</strong>
          <small>tratamientos mapeados</small>
        </div>
        <div className="budget-pricing-kpi budget-pricing-kpi-small tone-warn">
          <div className="budget-pricing-kpi-head"><span>Stock bajo</span></div>
          <strong>{lowStockItems.length}</strong>
          <small>alertas activas</small>
        </div>
        <div className="budget-pricing-kpi budget-pricing-kpi-small tone-good">
          <div className="budget-pricing-kpi-head"><span>Snapshot</span></div>
          <strong>{usageResult.totalCost > 0 ? fmtCLP(usageResult.totalCost) : '$0'}</strong>
          <small>costo de receta actual</small>
        </div>
      </div>

      <div className="budget-pricing-settings" style={{ marginBottom: 14 }}>
        <div className="budget-pricing-settings-head">
          <div>
            <div className="bs-label">{editingCatalogId ? 'Editar material del catalogo' : 'Agregar material al catalogo'}</div>
            <div className="bs-help">{editingCatalogId ? 'Ajusta el material seleccionado y guarda los cambios.' : 'Primera etapa: agregar materiales nuevos sin saturar la pantalla.'}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" type="button" onClick={() => setShowCatalogList((current) => !current)}>
              <Icon.edit />
              {showCatalogList ? 'Ocultar catalogo' : 'Ver catalogo'}
            </button>
            <button className="btn btn-secondary" type="button" onClick={handleResetCatalog}>
              <Icon.edit />
              Restaurar catalogo base
            </button>
          </div>
        </div>
        <div className="budget-pricing-settings-grid">
          <label className="pricing-setting-field" style={{ gridColumn: '1 / span 2' }}>
            <span className="pricing-setting-label-row">
              <span className="pricing-setting-label-text">Nombre del material</span>
            </span>
            <input value={newCatalogName} onChange={(event) => setNewCatalogName(event.target.value)} placeholder="Vaso desechable" />
          </label>
          <label className="pricing-setting-field">
            <span className="pricing-setting-label-row">
              <span className="pricing-setting-label-text">Unidad</span>
            </span>
            <select value={newCatalogUnit} onChange={(event) => setNewCatalogUnit(event.target.value)}>
              {(moduleState.units.length ? moduleState.units : ['unidad']).map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </label>
          <label className="pricing-setting-field">
            <span className="pricing-setting-label-row">
              <span className="pricing-setting-label-text">Cantidad de compra</span>
            </span>
            <input type="number" min="0" step="1" value={newCatalogQuantity} onChange={(event) => setNewCatalogQuantity(event.target.value)} />
          </label>
          <label className="pricing-setting-field">
            <span className="pricing-setting-label-row">
              <span className="pricing-setting-label-text">Costo total compra</span>
            </span>
            <input type="number" min="0" step="1" value={newCatalogTotalCost} onChange={(event) => setNewCatalogTotalCost(event.target.value)} />
          </label>
          <div style={{ display: 'flex', alignItems: 'end', gap: 8 }}>
            <button className="btn btn-primary" type="button" onClick={handleSaveCatalogItem}>
              <Icon.plus />
              {editingCatalogId ? 'Actualizar material' : 'Guardar material'}
            </button>
            {editingCatalogId && (
              <button className="btn btn-secondary" type="button" onClick={handleCancelCatalogEdit}>
                Cancelar
              </button>
            )}
          </div>
        </div>
        {showCatalogList && (
          <div className="documents-list" style={{ marginTop: 14 }}>
            {moduleState.catalog.map((item) => {
              const unitCost = item.purchaseQuantity > 0 ? Math.round((Number(item.purchaseTotalCost) / Number(item.purchaseQuantity)) || 0) : 0;
              return (
                <div key={item.id} className="document-row">
                  <div className="document-main">
                    <div className="document-head">
                      <div className="document-title">{item.name || 'Sin nombre'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="count">{fmtCLP(unitCost)}</span>
                        <button className="row-action" type="button" onClick={() => handleEditCatalogItem(item)} title="Editar insumo">
                          <Icon.edit />
                        </button>
                        <button className="row-action" type="button" onClick={() => handleRemoveCatalogItem(item.id)} title="Eliminar insumo">
                          <Icon.trash />
                        </button>
                      </div>
                    </div>
                    <div className="document-meta-line">
                      <span className="document-kind">{item.unit}</span>
                      <span>{item.purchaseQuantity} comprados · stock {item.currentStock} · minimo {item.minimumStock}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="budget-pricing-settings" style={{ marginBottom: 14 }}>
        <div className="budget-pricing-settings-head">
          <div>
            <div className="bs-label">Referencia de insumos</div>
            <div className="bs-help">Elige un tratamiento del paciente para ver su receta, ajustar cantidades y congelar un snapshot local.</div>
          </div>
        </div>
        <div className="budget-pricing-settings-grid">
          <label className="pricing-setting-field" style={{ gridColumn: '1 / -1' }}>
            <span className="pricing-setting-label-row">
              <span className="pricing-setting-label-text">Tratamiento del paciente</span>
            </span>
            <select value={selectedTreatmentId} onChange={(event) => setSelectedTreatmentId(event.target.value)}>
              {treatmentOptions.map((item) => {
                const mapped = item.procedure ? findPricingTreatmentForProcedure(item.procedure, pricingCatalog ?? []) : null;
                return (
                  <option key={item.id} value={item.id}>
                    {item.procedure || 'Sin procedimiento'}{mapped ? ` · ${mapped.name}` : ' · sin receta'}
                  </option>
                );
              })}
            </select>
          </label>
        </div>
        <div className="budget-pricing-kpi-row" style={{ marginTop: 12 }}>
          <div className="budget-pricing-kpi budget-pricing-kpi-small">
            <div className="budget-pricing-kpi-head"><span>Receta</span></div>
            <strong>{selectedRecipe?.name ?? 'Sin receta'}</strong>
            <small>{mappedPricingTreatment?.name ?? 'Sin mapeo a pricing'}</small>
          </div>
          <div className="budget-pricing-kpi budget-pricing-kpi-small">
            <div className="budget-pricing-kpi-head"><span>Agenda</span></div>
            <strong>{agendaNeeds.lines.length}</strong>
            <small>citas futuras con receta</small>
          </div>
        </div>

        <div className="budget-pricing-settings-head" style={{ marginTop: 14 }}>
          <div>
            <div className="bs-label">Agregar insumo</div>
            <div className="bs-help">Si la receta necesita algo mas, sumalo aqui antes de congelar el snapshot.</div>
          </div>
        </div>
        <div className="budget-pricing-settings-grid">
          <label className="pricing-setting-field" style={{ gridColumn: '1 / span 2' }}>
            <span className="pricing-setting-label-row">
              <span className="pricing-setting-label-text">Insumo extra</span>
            </span>
            <select value={extraItemId} onChange={(event) => setExtraItemId(event.target.value)}>
              <option value="">Selecciona un insumo</option>
              {moduleState.catalog
                .filter((item) => !draftItems.some((entry) => entry.itemId === item.id))
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.unit}
                  </option>
                ))}
            </select>
          </label>
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button className="btn btn-secondary" type="button" onClick={handleAddExtraItem} disabled={!extraItemId}>
              <Icon.plus />
              Agregar insumo
            </button>
          </div>
        </div>
      </div>

      <div className="table-wrap" style={{ marginBottom: 14 }}>
        <table className="tx">
          <thead>
            <tr>
              <th>Insumo</th>
              <th>Unidad</th>
              <th style={{ textAlign: 'right' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Cantidad
                  <PricingHelpButton
                    label="Cantidad por unidad"
                    text="La cantidad se interpreta segun la unidad del insumo. Si la unidad es par, cantidad 1 = 1 par. Si la unidad es unidad, cantidad 1 = 1 unidad."
                    compact
                    open={openInsumosHelp === 'quantity'}
                    onToggle={() => setOpenInsumosHelp((current) => (current === 'quantity' ? null : 'quantity'))}
                    placement="left"
                  />
                </span>
              </th>
              <th style={{ textAlign: 'right' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Costo unitario
                  <PricingHelpButton
                    label="Origen del costo unitario"
                    text="El costo unitario sale de la compra base del insumo: costo total de compra dividido por la cantidad comprada. Por eso no es el mismo valor para todos los insumos."
                    compact
                    open={openInsumosHelp === 'unitCost'}
                    onToggle={() => setOpenInsumosHelp((current) => (current === 'unitCost' ? null : 'unitCost'))}
                    placement="left"
                  />
                </span>
              </th>
              <th style={{ textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {draftItems.map((item) => {
              const line = usageResult.lines.find((entry) => entry.itemId === item.itemId);
              return (
                <tr key={item.itemId}>
                  <td style={{ fontWeight: 600 }}>{line?.itemName ?? item.itemId}</td>
                  <td>{line?.unit ?? 'unidad'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.quantity}
                        onChange={(event) => handleQtyChange(item.itemId, event.target.value)}
                        style={{ width: 92, textAlign: 'right' }}
                      />
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <strong>{fmtCLP(line?.unitCostAtTime ?? 0)}</strong>
                      {(line?.purchaseQuantity ?? 0) > 0 && (line?.purchaseTotalCost ?? 0) > 0 && (
                        <small style={{ color: 'var(--muted)', fontSize: 11 }}>
                          Base: {line.purchaseQuantity} {line.unit} / {fmtCLP(line.purchaseTotalCost)}
                        </small>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <span>{fmtCLP(line?.totalCostAtTime ?? 0)}</span>
                      {item.isExtra && (
                        <button className="row-action" type="button" onClick={() => handleRemoveDraftItem(item.itemId)} title="Quitar insumo">
                          <Icon.trash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!draftItems.length && (
              <tr>
                <td colSpan="5" className="finance-table-empty">No hay receta vinculada a este tratamiento.</td>
              </tr>
            )}
          </tbody>
          {draftItems.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan="4" style={{ textAlign: 'right', color: 'var(--muted)' }}>Total receta</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmtCLP(usageResult.totalCost)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 14 }}>
        <div className="budget-pricing-settings">
          <div className="budget-pricing-settings-head">
            <div>
              <div className="bs-label">Stock bajo</div>
              <div className="bs-help">Insumos que ya quedaron en o bajo el minimo configurado.</div>
            </div>
          </div>
          <div className="documents-list">
            {lowStockItems.slice(0, 5).map((item) => (
              <div key={item.id} className="document-row">
                <div className="document-main">
                  <div className="document-head">
                    <div className="document-title">{item.name}</div>
                    <span className="count">{item.currentStock} / {item.minimumStock}</span>
                  </div>
                  <div className="document-meta-line">
                    <span className="document-kind">{item.category}</span>
                    <span>Reponer a tiempo para no frenar agenda.</span>
                  </div>
                </div>
              </div>
            ))}
            {!lowStockItems.length && <div className="finance-empty">No hay alertas de stock bajo en este momento.</div>}
          </div>
        </div>

        <div className="budget-pricing-settings">
          <div className="budget-pricing-settings-head">
            <div>
              <div className="bs-label">Snapshots locales</div>
              <div className="bs-help">Historico guardado solo para este modulo de prueba local.</div>
            </div>
          </div>
          <div className="documents-list">
            {patientSnapshots.slice(0, 5).map((snapshot) => (
              <div key={snapshot.id} className="document-row">
                <div className="document-main">
                  <div className="document-head">
                    <div className="document-title">{snapshot.recipeName || 'Snapshot'}</div>
                    <span className="count">{fmtCLP(snapshot.totalSupplyCost || 0)}</span>
                  </div>
                  <div className="document-meta-line">
                    <span className="document-kind">{snapshot.status}</span>
                    <span>{snapshot.createdAt ? new Date(snapshot.createdAt).toLocaleString('es-CL') : 'Sin fecha'}</span>
                  </div>
                </div>
              </div>
            ))}
            {!patientSnapshots.length && <div className="finance-empty">Todavia no hay snapshots guardados para este paciente.</div>}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14 }} className="finance-empty">
        Este panel es el MVP chico de insumos: receta, ajuste por paciente, stock bajo y snapshot local. No usa SQLite todavia.
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
              <th>Diente</th><th>Procedimiento</th><th>Profesional</th><th>Estado</th><th>Prioridad</th><th>Fecha</th><th style={{ textAlign: 'right' }}>Cobertura</th><th style={{ textAlign: 'right' }}>Abonado</th><th style={{ textAlign: 'right' }}>Saldo</th><th></th>
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
                  <td style={{ textAlign: 'right' }} className="amount">{fmtCLP(t.paid)}</td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: saldo > 0 ? 'var(--amber)' : 'var(--green)' }} className="amount">{saldo > 0 ? fmtCLP(saldo) : '✓ pagado'}</td>
                  <td><div className="row-actions"><button className="row-action"><Icon.edit /></button><button className="row-action" onClick={() => onRemoveTreatment?.(t.id)}><Icon.trash /></button></div></td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="6" style={{ textAlign: 'right', color: 'var(--muted)' }}>Totales</td>
              <td style={{ textAlign: 'right' }} className="amount">{fmtCLP(total)}</td>
              <td style={{ textAlign: 'right' }} className="amount">{fmtCLP(pagado)}</td>
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
