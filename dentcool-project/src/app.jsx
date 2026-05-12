import { useEffect, useState } from 'react';
import logoUrl from '../logo.png';
import {
  STATES,
  UPPER_RIGHT,
  UPPER_LEFT,
  LOWER_RIGHT,
  LOWER_LEFT,
  toothName,
} from './data';
import { createPatientDraft, getPatientDisplayName } from './patients';
import { Tooth } from './tooth';

export const Icon = {
  search: (p) => <svg className={p?.cls || "icon"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>,
  bell: (p) => <svg className={p?.cls || "icon"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10 21a2 2 0 0 0 4 0" /></svg>,
  msg: (p) => <svg className={p?.cls || "icon"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  home: (p) => <svg className={p?.cls || "ic"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 9-8 9 8v10a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z" /></svg>,
  users: (p) => <svg className={p?.cls || "ic"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  cal: (p) => <svg className={p?.cls || "ic"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
  tooth: (p) => <svg className={p?.cls || "ic"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5.5C8 2 3 4 3 9c0 3 1.5 5 2 8s1 5 2.5 5 1.5-3 2-5 1.5-3 2.5-3 2 1 2.5 3 .5 5 2.5 5 1.5-2 2-5 2-5 2-8c0-5-5-7-9-3.5z" /></svg>,
  chart: (p) => <svg className={p?.cls || "ic"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M7 16l4-4 3 3 5-7" /></svg>,
  cash: (p) => <svg className={p?.cls || "ic"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="3" /><path d="M6 12h.01M18 12h.01" /></svg>,
  doc: (p) => <svg className={p?.cls || "ic"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h6M9 9h2" /></svg>,
  cog: (p) => <svg className={p?.cls || "ic"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  plus: (p) => <svg className={p?.cls || "icon"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>,
  print: (p) => <svg className={p?.cls || "icon"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>,
  more: (p) => <svg className={p?.cls || "icon"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>,
  edit: (p) => <svg className={p?.cls || "icon"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>,
  trash: (p) => <svg className={p?.cls || "icon"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
  check: (p) => <svg className={p?.cls || "icon"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  download: (p) => <svg className={p?.cls || "icon"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>,
  upload: (p) => <svg className={p?.cls || "icon"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>,
  alert: (p) => <svg className={p?.cls || "icon"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><path d="M12 9v4M12 17h.01" /></svg>,
  phone: (p) => <svg className={p?.cls || "icon"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
  film: (p) => <svg className={p?.cls || "icon"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /></svg>,
  clock: (p) => <svg className={p?.cls || "icon"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
};

export function Sidebar({ activeView = 'patients', onNavigate, patientCount = 0, agendaCount = 0 }) {
  const items1 = [
    { ic: 'home', label: 'Inicio', view: 'home' },
    { ic: 'users', label: 'Pacientes', badge: patientCount > 0 ? String(patientCount) : null, view: 'patients' },
    { ic: 'cal', label: 'Agenda', badge: agendaCount > 0 ? String(agendaCount) : null },
    { ic: 'tooth', label: 'Tratamientos' },
  ];
  const items2 = [
    { ic: 'chart', label: 'Reportes' },
    { ic: 'cash', label: 'Facturacion' },
    { ic: 'doc', label: 'Documentos' },
    { ic: 'cog', label: 'Configuracion' },
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-stack">
          <div className="brand-mark">
            <img src={logoUrl} alt="DentCool" className="brand-logo" />
          </div>
        </div>
      </div>
      <div className="brand-clinic">Clinica Providencia</div>
      <div className="nav-section">Clinico</div>
      {items1.map((it, i) => {
        const I = Icon[it.ic];
        return (
          <button
            key={i}
            className={`nav-item ${it.view === activeView ? 'active' : ''}`}
            onClick={() => it.view && onNavigate?.(it.view)}
          >
            <I cls="ic" />
            <span>{it.label}</span>
            {it.badge && <span className="badge">{it.badge}</span>}
          </button>
        );
      })}
      <div className="nav-section">Gestion</div>
      {items2.map((it, i) => {
        const I = Icon[it.ic];
        return (
          <button key={i} className="nav-item">
            <I cls="ic" />
            <span>{it.label}</span>
          </button>
        );
      })}
      <div className="sidebar-foot">
        <div className="user-card">
          <div className="avatar">CN</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="user-name">Dra. F. Khorramian</div>
            <div className="user-role">Odontologa · jefe</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function Topbar() {
  return <TopbarInner patientName="" />;
}

export function TopbarInner({ patientName, activeView = 'patients' }) {
  return (
    <div className="topbar">
      <div className="crumbs">
        {activeView === 'home' ? (
          <>
            <span>Inicio</span>
            <span className="sep">/</span>
            <strong>Resumen operativo</strong>
          </>
        ) : (
          <>
            <span>Pacientes</span>
            <span className="sep">/</span>
            <strong>{patientName}</strong>
            <span className="sep">/</span>
            <span>Ficha clinica</span>
          </>
        )}
      </div>
      <div className="search">
        <Icon.search />
        <input placeholder="Buscar paciente, ficha o tratamiento…" />
        <kbd>⌘K</kbd>
      </div>
      <button className="topbar-btn"><Icon.msg /></button>
      <button className="topbar-btn"><Icon.bell /><span className="dot" /></button>
    </div>
  );
}

export function HomeDashboard({ patients, activePatient }) {
  const pendingAlerts = patients.reduce((total, patient) => total + patient.alerts.length, 0);
  const upcoming = patients.filter(
    (patient) => patient.nextVisit && patient.nextVisit !== 'Sin cita' && patient.nextVisit !== 'Sin agendar'
  ).length;
  const visibleFollowUps = patients
    .filter((patient) => patient.nextVisit && patient.nextVisit !== 'Sin cita' && patient.nextVisit !== 'Sin agendar')
    .slice(0, 4)
    .map((patient) => ({
      id: patient.id,
      patient: getPatientDisplayName(patient),
      schedule: patient.nextVisit,
      detail: `${patient.recordNumber} · ${patient.phone || 'Sin telefono registrado'}`,
    }));
  const quickActions = ['Nuevo paciente', 'Nueva cita', 'Abrir ficha activa', 'Registrar pago'];
  const alerts = [
    { tone: 'danger', title: 'Alergias activas', detail: `${pendingAlerts} alertas clinicas requieren visibilidad en atencion.` },
    { tone: 'warn', title: 'Controles por confirmar', detail: `${upcoming} pacientes tienen seguimiento cercano o cita proxima.` },
    { tone: 'info', title: 'Presupuestos abiertos', detail: '3 planes preventivos siguen pendientes de cierre financiero.' },
  ];
  const kpis = [
    { label: 'Pacientes hoy', value: '12', detail: '4 ya atendidos', tone: 'teal' },
    { label: 'Pagos recibidos', value: '$184.000', detail: '2 abonos + 1 cierre', tone: 'blue' },
    { label: 'Pendientes por confirmar', value: '5', detail: 'agenda vespertina', tone: 'amber' },
    { label: 'Controles post-op', value: '3', detail: 'requieren seguimiento', tone: 'violet' },
  ];
  const finance = [
    { label: 'Presupuesto activo', value: '$1.240.000' },
    { label: 'Abonado', value: '$410.000' },
    { label: 'Saldo pendiente', value: '$830.000' },
  ];

  return (
    <div className="home-dashboard">
      <div className="home-hero card">
        <div className="home-hero-copy">
          <div className="patients-eyebrow">Inicio</div>
          <h2>Panel operativo de la clinica</h2>
          <p>Vista rapida para abrir la jornada, revisar agenda, detectar alertas y volver a la ficha clinica sin perder el hilo.</p>
          <div className="home-hero-tags">
            <span className="patient-chip">{patients.length} pacientes locales</span>
            <span className="patient-chip">{upcoming} citas proximas</span>
            <span className="patient-chip">{pendingAlerts} alertas registradas</span>
          </div>
        </div>
        <div className="home-hero-side">
          <div className="home-focus-card">
            <div className="home-focus-label">Turno en foco</div>
            <div className="home-focus-name">{getPatientDisplayName(activePatient, 'Sin paciente')}</div>
            <div className="home-focus-meta">{activePatient?.recordNumber ?? 'Sin ficha'} · {activePatient?.nextVisit || 'Sin cita agendada'}</div>
            <div className="home-focus-divider" />
            <div className="home-focus-mini">Proxima accion: abrir antecedentes, confirmar motivo y revisar presupuesto.</div>
          </div>
        </div>
      </div>

      <div className="home-kpi-grid">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`card home-kpi-card ${kpi.tone}`}>
            <div className="home-kpi-label">{kpi.label}</div>
            <div className="home-kpi-value">{kpi.value}</div>
            <div className="home-kpi-detail">{kpi.detail}</div>
          </div>
        ))}
      </div>

      <div className="home-main-grid">
        <div className="home-main-column">
          <div className="card home-agenda-card">
            <div className="card-head">
              <h3>Seguimientos visibles</h3>
              <span className="muted" style={{ fontSize: 12 }}>{visibleFollowUps.length} citas con fecha registrada</span>
            </div>
            <div className="home-agenda-list">
              {visibleFollowUps.length > 0 ? visibleFollowUps.map((item) => (
                <div key={item.id} className="home-agenda-row neutral">
                  <div className="home-agenda-time">{item.schedule}</div>
                  <div className="home-agenda-copy">
                    <div className="home-agenda-title">{item.patient}</div>
                    <div className="home-agenda-meta">{item.detail}</div>
                  </div>
                </div>
              )) : (
                <div className="home-agenda-empty">
                  Aun no hay citas reales cargadas para mostrar en Inicio.
                </div>
              )}
            </div>
          </div>

          <div className="home-grid">
            <div className="card home-list-card">
              <div className="card-head">
                <h3>Pacientes recientes</h3>
              </div>
              <div className="home-list">
                {patients.slice(0, 4).map((patient) => (
                  <div key={patient.id} className="home-list-row">
                    <div className="patient-directory-avatar">{patient.initials}</div>
                    <div className="home-list-copy">
                      <div className="home-list-title">{getPatientDisplayName(patient)}</div>
                      <div className="home-list-meta">{patient.rut || 'Sin RUT'} · {patient.nextVisit || 'Sin cita'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card home-actions-card">
              <div className="card-head">
                <h3>Acciones rapidas</h3>
              </div>
              <div className="home-actions-list">
                {quickActions.map((action) => (
                  <button key={action} className="home-action-chip">{action}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="home-side-column">
          <div className="card home-alerts-card">
            <div className="card-head">
              <h3>Alertas clinicas</h3>
            </div>
            <div className="home-alerts-list">
              {alerts.map((alert) => (
                <div key={alert.title} className={`home-alert-item ${alert.tone}`}>
                  <div className="home-alert-title">{alert.title}</div>
                  <div className="home-alert-detail">{alert.detail}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card home-finance-card">
            <div className="card-head">
              <h3>Estado financiero</h3>
            </div>
            <div className="home-finance-summary">
              {finance.map((item) => (
                <div key={item.label} className="home-finance-row">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="card home-stats-card">
            <div className="card-head">
              <h3>Estado rapido</h3>
            </div>
            <div className="home-stats">
              <div className="home-stat">
                <span className="home-stat-value">{patients.length}</span>
                <span className="home-stat-label">Pacientes en directorio</span>
              </div>
              <div className="home-stat">
                <span className="home-stat-value">{upcoming}</span>
                <span className="home-stat-label">Citas visibles</span>
              </div>
              <div className="home-stat">
                <span className="home-stat-value">{pendingAlerts}</span>
                <span className="home-stat-label">Alertas medicas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PatientHeader({ patient, onEditPatient, onOpenDirectory }) {
  const p = patient;
  return (
    <div className="patient-card">
      <div className="patient-card-topline">
        <div>
          <div className="patients-eyebrow">Pacientes</div>
          <div className="patient-card-title">Ficha clinica activa</div>
        </div>
        <button className="btn btn-secondary patient-directory-btn" onClick={onOpenDirectory}><Icon.users />Directorio de pacientes</button>
      </div>
      <div className="patient-card-body">
        <div className="patient-photo">{p.initials}</div>
        <div className="patient-info">
          <div className="patient-line">
            <div className="patient-name">{getPatientDisplayName(p)}</div>
            <span className="patient-tag active-tag">Activo</span>
            <span className="patient-tag">Ficha #{p.recordNumber}</span>
          </div>
          <div className="patient-subline">
            <span className="patient-chip">RUT {p.rut}</span>
            <span className="patient-chip">Edad {p.age ?? '—'} anos</span>
            <span className="patient-chip">Nac. {p.birthDateLabel}</span>
            <span className="patient-chip">Tel. {p.phone}</span>
          </div>
          <div className="alert-pills">
            {p.alerts.map((a, i) => (
              <span key={i} className={`alert-pill ${a.severity}`}>
                <span className="dot"></span>{a.text}
              </span>
            ))}
          </div>
        </div>
        <div className="patient-actions">
          <button className="btn btn-ghost"><Icon.print /></button>
          <button className="btn btn-secondary" onClick={onEditPatient}><Icon.edit />Editar ficha</button>
          <button className="btn btn-primary"><Icon.plus />Atencion</button>
        </div>
      </div>
    </div>
  );
}

export function FloatingNewPatientButton({ onClick }) {
  return (
    <button className="floating-patient-btn" onClick={onClick}>
      <Icon.plus cls="icon" />
      <span>Nuevo paciente</span>
    </button>
  );
}

function PatientGeneralSection({ draft, activePatient, validationErrors = {}, onChange, onSubmit }) {
  const summaryItems = [
    activePatient?.age != null ? `Edad ${activePatient.age} anos` : 'Edad no registrada',
    activePatient?.registeredAt ? `Registro ${activePatient.registeredAt}` : 'Registro sin fecha',
    activePatient?.lastVisit ? `Ultima visita ${activePatient.lastVisit}` : 'Ultima visita sin registro',
    activePatient?.nextVisit && activePatient.nextVisit !== 'Sin cita' ? `Proxima cita ${activePatient.nextVisit}` : 'Proxima cita sin agendar',
  ];

  return (
    <form className="patient-section-body" onSubmit={onSubmit}>
      <div className="patient-section-intro">
        <h4>Datos generales del paciente</h4>
        <p>Alta administrativa base antes de pasar a antecedentes y luego a la ficha clinica completa.</p>
      </div>
      <div className="patients-form-grid">
        <label className="patient-field patient-field-full">
          <span>Nombre completo</span>
          <input
            className={validationErrors.fullName ? 'field-error' : ''}
            value={draft.fullName}
            onChange={(event) => onChange('fullName', event.target.value)}
            placeholder="Ej. Maria Fernanda Soto Perez"
          />
          {validationErrors.fullName && <small className="patient-field-error">{validationErrors.fullName}</small>}
        </label>
        <label className="patient-field">
          <span>RUT</span>
          <input
            className={validationErrors.rut ? 'field-error' : ''}
            value={draft.rut}
            onChange={(event) => onChange('rut', event.target.value)}
            placeholder="12345678-9"
          />
          {validationErrors.rut && <small className="patient-field-error">{validationErrors.rut}</small>}
        </label>
        <label className="patient-field">
          <span>Fecha de nacimiento</span>
          <input type="date" value={draft.birthDate} onChange={(event) => onChange('birthDate', event.target.value)} />
        </label>
        <label className="patient-field">
          <span>Genero</span>
          <select value={draft.gender} onChange={(event) => onChange('gender', event.target.value)}>
            <option value="">Sin definir</option>
            <option value="Femenino">Femenino</option>
            <option value="Masculino">Masculino</option>
            <option value="Otro">Otro</option>
          </select>
        </label>
        <label className="patient-field">
          <span>Telefono</span>
          <input value={draft.phone} onChange={(event) => onChange('phone', event.target.value)} placeholder="+56912345678" />
        </label>
        <label className="patient-field">
          <span>Email</span>
          <input
            type="email"
            className={validationErrors.email ? 'field-error' : ''}
            value={draft.email}
            onChange={(event) => onChange('email', event.target.value)}
          />
          {validationErrors.email && <small className="patient-field-error">{validationErrors.email}</small>}
        </label>
        <label className="patient-field patient-field-full">
          <span>Direccion</span>
          <input value={draft.address} onChange={(event) => onChange('address', event.target.value)} />
        </label>
        <label className="patient-field patient-field-full">
          <span>Prevision o seguro</span>
          <input value={draft.insurance} onChange={(event) => onChange('insurance', event.target.value)} />
        </label>
      </div>
      <div className="patients-form-footer">
        <div className="patients-inline-summary">
          {summaryItems.map((item) => (
            <span key={item} className="patient-summary-pill">{item}</span>
          ))}
        </div>
        <button className="btn btn-primary" type="submit"><Icon.check />Guardar paciente</button>
      </div>
    </form>
  );
}

function BackgroundCategoryEditor({
  title,
  items,
  tone = 'default',
  blockComment,
  itemPlaceholder,
  onToggle,
  onAddItem,
  onLabelChange,
  onBlockCommentChange,
}) {
  return (
    <div className="patient-history-card editable">
      <div className="patient-history-head">
        <h5>{title}</h5>
        <button className="btn btn-secondary patient-mini-btn" type="button" onClick={onAddItem}>
          <Icon.plus />
          Agregar
        </button>
      </div>
      <div className="patient-history-list editable">
        {items.map((item) => (
          <div key={item.id} className={`patient-history-edit-row ${item.active ? 'active' : ''} ${tone}`}>
            <label className="patient-history-mainline">
              <input type="checkbox" checked={item.active} onChange={() => onToggle(item.id)} />
              <input
                className="patient-inline-input"
                value={item.label}
                onChange={(event) => onLabelChange(item.id, event.target.value)}
                placeholder={itemPlaceholder}
              />
            </label>
          </div>
        ))}
      </div>
      <textarea
        className="patient-block-comment"
        value={blockComment}
        onChange={(event) => onBlockCommentChange(event.target.value)}
        placeholder="Comentario"
      />
    </div>
  );
}

function PatientBackgroundSection({ draft, activePatient, onCollectionChange, onSubmit }) {
  const summaryItems = [
    activePatient?.age != null ? `Edad ${activePatient.age} anos` : 'Edad no registrada',
    activePatient?.registeredAt ? `Registro ${activePatient.registeredAt}` : 'Registro sin fecha',
    activePatient?.lastVisit ? `Ultima visita ${activePatient.lastVisit}` : 'Ultima visita sin registro',
    activePatient?.nextVisit && activePatient.nextVisit !== 'Sin cita' ? `Proxima cita ${activePatient.nextVisit}` : 'Proxima cita sin agendar',
  ];

  const updateItem = (collectionKey, itemId, updater) => {
    onCollectionChange(
      collectionKey,
      draft[collectionKey].map((item) => (item.id === itemId ? updater(item) : item))
    );
  };

  const addItem = (collectionKey, baseLabel) => {
    onCollectionChange(collectionKey, [
      ...draft[collectionKey],
      {
        id: `${collectionKey}-${Date.now()}-${draft[collectionKey].length + 1}`,
        label: '',
        active: false,
      },
    ]);
  };

  return (
    <form className="patient-section-body" onSubmit={onSubmit}>
      <div className="patient-section-intro">
        <h4>Antecedentes del paciente</h4>
        <p>Este bloque ya es editable. Puedes marcar, comentar y agregar antecedentes, alergias, medicamentos o habitos desde aqui.</p>
      </div>
      <div className="patient-history-grid">
        <BackgroundCategoryEditor
          title="Antecedentes medicos"
          items={draft.medicalBackground}
          blockComment={draft.medicalBackgroundComment}
          itemPlaceholder="Nuevo antecedente medico"
          onToggle={(itemId) => updateItem('medicalBackground', itemId, (item) => ({ ...item, active: !item.active }))}
          onLabelChange={(itemId, value) => updateItem('medicalBackground', itemId, (item) => ({ ...item, label: value }))}
          onAddItem={() => addItem('medicalBackground', 'Nuevo antecedente medico')}
          onBlockCommentChange={(value) => onCollectionChange('medicalBackgroundComment', value)}
        />
        <BackgroundCategoryEditor
          title="Alergias y medicamentos"
          items={draft.allergies}
          tone="danger"
          blockComment={draft.allergiesComment}
          itemPlaceholder="Nueva alergia o medicamento"
          onToggle={(itemId) => updateItem('allergies', itemId, (item) => ({ ...item, active: !item.active }))}
          onLabelChange={(itemId, value) => updateItem('allergies', itemId, (item) => ({ ...item, label: value }))}
          onAddItem={() => addItem('allergies', 'Nueva alergia o medicamento')}
          onBlockCommentChange={(value) => onCollectionChange('allergiesComment', value)}
        />
        <BackgroundCategoryEditor
          title="Habitos y antecedentes dentales"
          items={draft.dentalHabits}
          tone="info"
          blockComment={draft.dentalHabitsComment}
          itemPlaceholder="Nuevo habito o antecedente"
          onToggle={(itemId) => updateItem('dentalHabits', itemId, (item) => ({ ...item, active: !item.active }))}
          onLabelChange={(itemId, value) => updateItem('dentalHabits', itemId, (item) => ({ ...item, label: value }))}
          onAddItem={() => addItem('dentalHabits', 'Nuevo habito o antecedente')}
          onBlockCommentChange={(value) => onCollectionChange('dentalHabitsComment', value)}
        />
      </div>
      <div className="patients-form-footer">
        <div className="patients-inline-summary">
          {summaryItems.map((item) => (
            <span key={item} className="patient-summary-pill">{item}</span>
          ))}
        </div>
        <button className="btn btn-primary" type="submit"><Icon.check />Guardar antecedentes</button>
      </div>
    </form>
  );
}

export function PatientsSheet({
  open,
  patients,
  activePatientId,
  activeSection,
  saveState,
  lastSavedAt,
  onSelectPatient,
  onCreatePatient,
  onSavePatient,
  onDraftChange,
  onDeletePatient,
  onSectionChange,
  renderClinicalSection,
  onClose,
}) {
  if (!open) return null;

  const [query, setQuery] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const activePatient = patients.find((patient) => patient.id === activePatientId) ?? patients[0] ?? null;
  const [draft, setDraft] = useState(() => createPatientDraft(activePatient));
  const sectionItems = [
    { id: 'datos', label: 'Datos generales', status: 'ready' },
    { id: 'antecedentes', label: 'Antecedentes', status: 'ready' },
    { id: 'motivo', label: 'Motivo y diagnostico', status: 'ready' },
    { id: 'evolucion', label: 'Evolucion clinica', status: 'ready' },
    { id: 'presupuesto', label: 'Presupuesto', status: 'ready' },
    { id: 'documentos', label: 'Documentos', status: 'ready' },
    { id: 'historial', label: 'Historial', status: 'ready' },
  ];
  const filteredPatients = patients.filter((patient) => {
    const search = query.trim().toLowerCase();
    if (!search) return true;

    return [getPatientDisplayName(patient), patient.rut, patient.phone]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(search));
  });

  const isEmptyDraftPatient = (patient) =>
    patient.id.startsWith('patient-new-') &&
    patient.fullName === 'Paciente nuevo' &&
    !patient.rut &&
    !patient.birthDate &&
    !patient.phone &&
    !patient.email &&
    !patient.address &&
    !patient.insurance;

  useEffect(() => {
    setDraft(createPatientDraft(activePatient));
    setValidationErrors({});
  }, [activePatient?.id]);

  const handleDraftChange = (key, value) => {
    const nextDraft = {
      ...draft,
      [key]: value,
    };
    setValidationErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
    setDraft(nextDraft);
    onDraftChange?.(nextDraft);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!activePatient) return;
    const result = onSavePatient({
      ...draft,
      id: activePatient.id,
    });
    setValidationErrors(result?.errors ?? {});
  };

  const saveLabel = {
    loaded: 'Directorio cargado desde almacenamiento local o datos base.',
    dirty: 'Guardando cambios del paciente…',
    saved: `Ficha de paciente guardada localmente${lastSavedAt ? ` · ${lastSavedAt.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}` : ''}`,
    created: 'Nuevo paciente agregado al directorio local.',
    error: 'Corrige los campos marcados antes de guardar la ficha.',
  }[saveState] ?? 'Bloque de pacientes listo.';

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="card patients-sheet" onClick={(event) => event.stopPropagation()}>
        <div className="card-head">
          <h3>Directorio y ficha de paciente</h3>
          <span className="muted" style={{ fontSize: 12 }}>{patients.length} registros locales</span>
          <div className="spacer" />
          <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
        <div className="patients-status-row">
          <div className={`patients-status-copy ${saveState === 'error' ? 'error' : ''}`}>{saveLabel}</div>
        </div>
        <div className="patients-body">
          <div className="patients-directory">
            <div className="patients-directory-head">
              <div>
                <div className="patients-eyebrow">Directorio activo</div>
                <div className="patients-directory-title">Selecciona un paciente para abrir y editar su ficha</div>
              </div>
              <div className="patients-total">{filteredPatients.length}</div>
            </div>
            <div className="search patients-search">
              <Icon.search />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filtrar por nombre, RUT o telefono"
              />
            </div>
            <div className="patients-list">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  className={`patient-directory-item ${patient.id === activePatientId ? 'active' : ''}`}
                  onClick={() => onSelectPatient(patient.id)}
                >
                  <div className="patient-directory-avatar">{patient.initials}</div>
                  <div className="patient-directory-copy">
                    <div className="patient-directory-main">
                      <span>{getPatientDisplayName(patient)}</span>
                      {isEmptyDraftPatient(patient) && (
                        <button
                          className="patient-directory-clear"
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDeletePatient?.(patient.id);
                          }}
                        >
                          Limpiar
                        </button>
                      )}
                    </div>
                    <div className="patient-directory-record">{patient.recordNumber}</div>
                    <div className="patient-directory-meta">{patient.rut || 'Sin RUT'} · {patient.phone || 'Sin telefono'}</div>
                    <div className="patient-directory-meta">Proxima cita: {patient.nextVisit || 'Sin agendar'}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="patients-form">
            <div className="patients-form-head">
              <div>
                <div className="patients-eyebrow">Ficha administrativa</div>
                <div className="patients-directory-title">Secciones internas del paciente</div>
              </div>
              <div className="patients-form-badge">#{activePatient?.recordNumber ?? 'Sin ficha'}</div>
            </div>
            <div className="patient-sheet-nav">
              {sectionItems.map((section) => (
                <button
                  key={section.id}
                  className={`patient-sheet-nav-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => onSectionChange?.(section.id)}
                  type="button"
                >
                  <span>{section.label}</span>
                  <small>Disponible</small>
                </button>
              ))}
            </div>

            {activeSection === 'datos' && (
              <PatientGeneralSection
                draft={draft}
                activePatient={activePatient}
                validationErrors={validationErrors}
                onChange={handleDraftChange}
                onSubmit={handleSubmit}
              />
            )}

            {activeSection === 'antecedentes' && (
              <PatientBackgroundSection
                draft={draft}
                activePatient={activePatient}
                onCollectionChange={handleDraftChange}
                onSubmit={handleSubmit}
              />
            )}

            {!['datos', 'antecedentes'].includes(activeSection) && (
              <div className="patient-clinical-panel">
                {renderClinicalSection?.(activeSection)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Odontogram({ teeth, selected, selectedSurface, onSelect, onSelectSurface }) {
  const [view, setView] = useState('adulto');
  const selectedMeta = toothName(selected);
  const selectedState = STATES[teeth[selected]?.[selectedSurface] ?? 'sano'];
  return (
    <div className="card odontogram-card">
      <div className="card-head">
        <h3>Odontograma</h3>
        <span className="muted" style={{ fontSize: 12 }}>Numeracion FDI · clic en superficie para registrar</span>
        <div className="spacer" />
        <div className="odo-tabs">
          <button className={`odo-tab ${view === 'adulto' ? 'active' : ''}`} onClick={() => setView('adulto')}>Adulto</button>
          <button className={`odo-tab ${view === 'infantil' ? 'active' : ''}`} onClick={() => setView('infantil')}>Infantil</button>
          <button className={`odo-tab ${view === 'periodontal' ? 'active' : ''}`} onClick={() => setView('periodontal')}>Periodontal</button>
        </div>
        <button className="btn btn-ghost" title="Imprimir"><Icon.print /></button>
      </div>
      <div className="odo-canvas">
        <div className="odo-canvas-head">
          <div className="odo-stage-label">Vista clinica principal</div>
          <div className="odo-summary-rail">
            <div className="odo-summary-pill strong">Pieza {selected}</div>
            <div className="odo-summary-pill">{selectedMeta.tipo}</div>
            <div className="odo-summary-pill">Superficie {selectedSurface}</div>
            <div className="odo-summary-pill state">
              <span className="odo-summary-dot" style={{ background: selectedState.hex }} />
              {selectedState.label}
            </div>
          </div>
        </div>
        <div className="odo-scroll" role="region" aria-label="Odontograma desplazable">
          <div className="odo-layout">
            <div className="odo-quadrant-row top">
              <span>Superior derecho</span>
              <span>Superior izquierdo</span>
            </div>
            <div className="odo-arch upper">
              {UPPER_RIGHT.map((n) => <Tooth key={n} fdi={n} surfaces={teeth[n]} selected={selected === n} selectedSurface={selectedSurface} onSelect={onSelect} onSelectSurface={onSelectSurface} />)}
              <div className="midline" />
              {UPPER_LEFT.map((n) => <Tooth key={n} fdi={n} surfaces={teeth[n]} selected={selected === n} selectedSurface={selectedSurface} onSelect={onSelect} onSelectSurface={onSelectSurface} />)}
            </div>
            <div className="arch-divider" />
            <div className="odo-quadrant-row bottom">
              <span>Inferior derecho</span>
              <span>Inferior izquierdo</span>
            </div>
            <div className="odo-arch lower">
              {LOWER_RIGHT.map((n) => <Tooth key={n} fdi={n} surfaces={teeth[n]} selected={selected === n} selectedSurface={selectedSurface} onSelect={onSelect} onSelectSurface={onSelectSurface} />)}
              <div className="midline" />
              {LOWER_LEFT.map((n) => <Tooth key={n} fdi={n} surfaces={teeth[n]} selected={selected === n} selectedSurface={selectedSurface} onSelect={onSelect} onSelectSurface={onSelectSurface} />)}
            </div>
          </div>
        </div>
      </div>
      <div className="odo-legend">
        {Object.entries(STATES).map(([k, s]) => (
          <span key={k} className="legend-item">
            <span className="legend-swatch" style={{ background: s.hex }} />{s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ToothPanel({ fdi, surfaces, selectedSurface, onSelectSurface, onSetState }) {
  const meta = toothName(fdi);
  const surfaceList = [
    { k: 'O', label: 'Oclusal / Incisal' },
    { k: 'M', label: 'Mesial' },
    { k: 'D', label: 'Distal' },
    { k: 'V', label: 'Vestibular' },
    { k: 'L', label: 'Lingual / Palatino' },
  ];
  const states = Object.entries(STATES);
  const current = surfaces[selectedSurface];
  const currentState = STATES[current];
  const selectedSurfaceMeta = surfaceList.find((s) => s.k === selectedSurface);

  return (
    <div className="card tooth-panel">
      <div className="tp-hero">
        <div className="tp-num">{fdi}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="tp-name">{meta.tipo}</div>
          <div className="tp-sub">{meta.cuadrante} · FDI {fdi}</div>
        </div>
        <div className="tp-badge">Pieza activa</div>
      </div>

      <div className="tp-overview">
        <div className="tp-overview-card">
          <div className="tp-overview-label">Superficie seleccionada</div>
          <div className="tp-overview-value">{selectedSurfaceMeta?.label || 'Sin seleccion'}</div>
          <div className="tp-overview-code">Codigo {selectedSurface}</div>
        </div>
        <div className="tp-overview-card state">
          <div className="tp-overview-label">Estado actual</div>
          <div className="tp-overview-state">
            <span className="surface-dot large" style={{ background: currentState.hex, border: '1px solid rgba(0,0,0,0.1)' }} />
            <span>{currentState.label}</span>
          </div>
          <div className="tp-overview-code">Registro listo para actualizar</div>
        </div>
      </div>

      <div className="tp-section">
          <div className="tp-label">Diagrama del diente</div>
          <ToothDiagram surfaces={surfaces} fdi={fdi} selectedSurface={selectedSurface} onSelectSurface={onSelectSurface} />
        <div className="tp-help">Selecciona una superficie</div>
      </div>

      <div className="tp-section">
        <div className="tp-label">Superficies</div>
        <div className="surface-grid">
          {surfaceList.map((s) => {
            const st = STATES[surfaces[s.k]];
            const active = selectedSurface === s.k;
            return (
              <div key={s.k} className={`surface-row ${active ? 'active' : ''}`} onClick={() => onSelectSurface(s.k)}>
                <span className="surface-dot" style={{ background: st.hex, border: '1px solid rgba(0,0,0,0.1)' }} />
                <div className="surface-copy">
                  <span className="surface-name">{s.label}</span>
                  <span className="surface-code">Cara {s.k}</span>
                </div>
                <span className="surface-state-text">{st.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="tp-section">
        <div className="tp-label">Asignar estado a {selectedSurfaceMeta ? selectedSurfaceMeta.label : '—'}</div>
        <div className="state-grid">
          {states.map(([k, s]) => (
            <button key={k} className={`state-btn ${current === k ? 'active' : ''}`} onClick={() => onSetState(k)}>
              <span className="sw" style={{ background: s.hex }} />{s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="tp-section">
        <div className="tp-label">Notas del diente</div>
        <textarea className="tp-notes" placeholder="Agregar observacion clinica..." />
        <div className="tp-actions">
          <button className="btn btn-secondary tp-action-btn">Cancelar</button>
          <button className="btn btn-primary tp-action-btn"><Icon.check />Guardar</button>
        </div>
      </div>
    </div>
  );
}

function ToothDiagram({ surfaces, fdi, selectedSurface, onSelectSurface }) {
  const isUpper = Math.floor(fdi / 10) <= 2;
  const quad = Math.floor(fdi / 10);
  const mesialSide = quad === 1 || quad === 4 ? 'right' : 'left';
  const top = isUpper ? 'L' : 'V';
  const bot = isUpper ? 'V' : 'L';
  const left = mesialSide === 'left' ? 'M' : 'D';
  const right = mesialSide === 'right' ? 'M' : 'D';

  const cells = [
    { sk: null, cls: 'empty' }, { sk: top }, { sk: null, cls: 'empty' },
    { sk: left }, { sk: 'O', cls: 'center' }, { sk: right },
    { sk: null, cls: 'empty' }, { sk: bot }, { sk: null, cls: 'empty' },
  ];

  return (
    <div className="tooth-diagram">
      {cells.map((c, i) => {
        if (c.cls === 'empty') return <div key={i} className="td-cell empty" />;
        const st = STATES[surfaces[c.sk]];
        const sel = selectedSurface === c.sk;
        return (
          <div
            key={i}
            className={`td-cell ${c.cls || ''} ${c.sk === 'O' ? 'center-fixed' : 'side-fixed'}${sel ? ' selected' : ''}`}
            style={{
              background: surfaces[c.sk] === 'sano' ? 'white' : st.hex,
              color: surfaces[c.sk] === 'sano' ? 'var(--muted)' : 'white',
            }}
            onClick={() => onSelectSurface(c.sk)}
          >
            {c.sk}
          </div>
        );
      })}
    </div>
  );
}
