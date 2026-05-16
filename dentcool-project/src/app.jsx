import { useEffect, useState } from 'react';
import logoUrl from '../logo.png';
import { USER_ROLES } from './auth';
import {
  STATES,
  UPPER_RIGHT,
  UPPER_LEFT,
  LOWER_RIGHT,
  LOWER_LEFT,
  toothName,
  fmtCLP,
} from './data';
import {
  ACCEPTED_SNAPSHOTS_REPORT_COLUMNS,
  FINANCE_SUMMARY_REPORT_COLUMNS,
} from './pricing';
import { createPatientDraft, getPatientDisplayName } from './patients';
import { Tooth } from './tooth';

const VISIT_MONTHS = {
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

function normalizeText(value) {
  return (value ?? '')
    .toString()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function parseVisitDate(value) {
  const match = normalizeText(value).match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = VISIT_MONTHS[match[2]];
  const year = Number(match[3]);

  if (!month && month !== 0) return null;

  const date = new Date(year, month, day);
  if (Number.isNaN(date.getTime())) return null;

  return date;
}

function getVisitFollowUp(nextVisit) {
  const visitDate = parseVisitDate(nextVisit);
  if (!visitDate) {
    return {
      tone: 'neutral',
      state: 'Seguimiento',
      reminder: 'Confirmar fecha registrada en agenda.',
      daysLabel: '',
      daysUntil: Number.POSITIVE_INFINITY,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const visitDay = new Date(visitDate);
  visitDay.setHours(0, 0, 0, 0);

  const daysUntil = Math.round((visitDay.getTime() - today.getTime()) / 86400000);

  if (daysUntil <= 0) {
    return {
      tone: 'urgent',
      state: daysUntil < 0 ? 'Vencida' : 'En 24 horas',
      reminder: daysUntil < 0 ? 'Llamar y reagendar cuanto antes.' : 'Llamar para confirmar asistencia.',
      daysLabel: daysUntil < 0 ? `Hace ${Math.abs(daysUntil)} dias` : 'En 24 horas',
      daysUntil,
    };
  }

  if (daysUntil <= 1) {
    return {
      tone: 'urgent',
      state: 'En 24 horas',
      reminder: 'Preparar materiales y dar seguimiento.',
      daysLabel: 'En 24 horas',
      daysUntil,
    };
  }

  if (daysUntil <= 3) {
    return {
      tone: 'soon',
      state: `En ${daysUntil} dias`,
      reminder: 'Preparar materiales y dar seguimiento.',
      daysLabel: `En ${daysUntil} dias`,
      daysUntil,
    };
  }

  return {
    tone: 'watch',
    state: `En ${daysUntil} dias`,
    reminder: 'Preparar materiales y dar seguimiento.',
    daysLabel: `En ${daysUntil} dias`,
    daysUntil,
  };
}

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

export function LoginScreen({ onLogin }) {
  const [roleId, setRoleId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!roleId) {
      setError('Selecciona un perfil.');
      return;
    }
    const result = onLogin?.(roleId, password);
    if (!result?.ok) {
      setError('Clave incorrecta para este perfil.');
      return;
    }
    setError('');
  };

  return (
    <main className="login-shell">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-avatar-hero">
          <div className="login-avatar">
            <div className="login-avatar-head" />
            <div className="login-avatar-body" />
          </div>
        </div>
        <div className="login-brand">
          <img src={logoUrl} alt="DentCool" />
          <div>
            <div className="login-eyebrow">Ficha clinica</div>
          </div>
        </div>
        <label className="login-field">
          <select
            value={roleId}
            className={roleId ? '' : 'is-placeholder'}
            onChange={(event) => {
              setRoleId(event.target.value);
              setError('');
            }}
          >
            <option value="" disabled>Seleccionar perfil</option>
            {Object.values(USER_ROLES).map((role) => (
              <option key={role.id} value={role.id}>{role.label}</option>
            ))}
          </select>
        </label>
        <label className="login-field">
          <div className="login-password-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Ingresa la clave"
              autoFocus
            />
            <button
              type="button"
              className="login-password-toggle"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Ocultar clave' : 'Mostrar clave'}
              title={showPassword ? 'Ocultar clave' : 'Mostrar clave'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {showPassword ? (
                  <>
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 4.2A9.8 9.8 0 0 1 12 4c5 0 9 5 9 8a10.9 10.9 0 0 1-3 4.6" />
                    <path d="M6.6 6.6C4.4 8.1 3 10.3 3 12c0 3 4 8 9 8 1.5 0 2.9-.4 4.1-1" />
                  </>
                ) : (
                  <>
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </label>
        {error && <div className="login-error">{error}</div>}
        <button className="btn btn-primary login-submit" type="submit">
          Ingresar
        </button>
      </form>
    </main>
  );
}

export function Sidebar({
  activeView = 'patients',
  onNavigate,
  patientCount = 0,
  agendaCount = 0,
  currentUser,
  permissions,
  onLogout,
}) {
  const items1 = [
    { ic: 'home', label: 'Inicio', view: 'home' },
    { ic: 'users', label: 'Pacientes', badge: patientCount > 0 ? String(patientCount) : null, view: 'patients' },
    { ic: 'cal', label: 'Agenda', badge: agendaCount > 0 ? String(agendaCount) : null },
    { ic: 'tooth', label: 'Tratamientos' },
  ];
  const items2 = [
    { ic: 'doc', label: 'Lista precios', view: 'priceList' },
    { ic: 'cash', label: 'Inventario', view: 'inventory' },
    { ic: 'chart', label: 'Reportes', view: 'finance' },
    { ic: 'cash', label: 'Facturacion', view: 'finance' },
    { ic: 'doc', label: 'Documentos' },
    { ic: 'cog', label: 'Configuracion' },
  ].filter((item) => !item.view || permissions?.views?.includes(item.view));
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
        const isActive = it.view === activeView || (it.view === 'patients' && activeView === 'patient');
        return (
          <button
            key={i}
            className={`nav-item ${isActive ? 'active' : ''}`}
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
        const isActive = it.view === activeView;
        return (
          <button key={i} className={`nav-item ${isActive ? 'active' : ''}`} onClick={() => it.view && onNavigate?.(it.view)}>
            <I cls="ic" />
            <span>{it.label}</span>
          </button>
        );
      })}
      <div className="sidebar-foot">
        <div className="user-card">
          <div className="avatar">{currentUser?.initials ?? 'DC'}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="user-name">{currentUser?.name ?? 'DentCool'}</div>
            <div className="user-role">{currentUser?.roleLabel ?? 'Sesion local'}</div>
          </div>
        </div>
        <button className="sidebar-logout" type="button" onClick={onLogout}>
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}

export function Topbar() {
  return <TopbarInner patientName="" />;
}

export function TopbarInner({ patientName, activeView = 'patients', currentUser }) {
  const welcomeText = getWelcomeText(currentUser);
  return (
    <div className="topbar">
      <div className="crumbs">
        {activeView === 'home' ? (
          <>
            <span>Inicio</span>
            <span className="sep">/</span>
            <strong>{welcomeText}</strong>
          </>
        ) : activeView === 'patients' ? (
          <>
            <span>Pacientes</span>
            <span className="sep">/</span>
            <strong>Directorio general</strong>
          </>
        ) : activeView === 'priceList' ? (
          <>
            <span>Gestion</span>
            <span className="sep">/</span>
            <strong>Lista de precios</strong>
          </>
        ) : activeView === 'inventory' ? (
          <>
            <span>Gestion</span>
            <span className="sep">/</span>
            <strong>Inventario general</strong>
          </>
        ) : activeView === 'finance' ? (
          <>
            <span>Gestion</span>
            <span className="sep">/</span>
            <strong>Finanzas</strong>
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

function getWelcomeText(currentUser) {
  if (currentUser?.roleId === 'dr') return 'Bienvenido Doctor';
  if (currentUser?.roleId === 'staff') return 'Bienvenido Staff';
  if (currentUser?.roleId === 'admin') return 'Bienvenido Admin';
  return 'Bienvenido';
}

export function PriceListView({ pricingCatalog = [] }) {
  const visibleItems = pricingCatalog.filter((item) => item.active !== false);

  return (
    <section className="price-list-view">
      <div className="price-list-header">
        <div>
          <div className="section-eyebrow">Referencia para recepcion</div>
          <h2>Lista de precios</h2>
          <p>Valores visibles sin costos internos, margenes ni reportes financieros.</p>
        </div>
      </div>
      <div className="price-list-table">
        <table className="tx">
          <thead>
            <tr>
              <th>Tratamiento</th>
              <th>Categoria</th>
              <th style={{ textAlign: 'right' }}>Precio lista</th>
              <th style={{ textAlign: 'right' }}>Descuento max.</th>
              <th style={{ textAlign: 'right' }}>Precio minimo</th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item) => (
              <tr key={item.id}>
                <td style={{ fontWeight: 700 }}>{item.name}</td>
                <td>{item.category || 'General'}</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmtCLP(item.basePrice || 0)}</td>
                <td style={{ textAlign: 'right' }}>{item.maxRecommendedDiscountPercent || 0}%</td>
                <td style={{ textAlign: 'right' }}>{fmtCLP(item.minPrice || 0)}</td>
              </tr>
            ))}
            {!visibleItems.length && (
              <tr>
                <td colSpan="5" className="finance-table-empty">No hay precios visibles configurados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function fmtPercentCompact(value) {
  return `${new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)}%`;
}

function labelForOperationalStatus(status) {
  const map = {
    planned: 'Planificado',
    in_progress: 'En curso',
    completed: 'Realizado',
    pending_review: 'Por evaluar',
  };
  return map[status] ?? 'Planificado';
}

export function FinanceDashboard({
  financeDashboard,
  pricingSettings,
  onPricingSettingChange,
  onResetPricingSettings,
  onExportAcceptedSnapshots,
  onExportFinanceSummary,
  onExportFinanceWorkbook,
  onFinanceFilterChange,
}) {
  const filters = financeDashboard?.filters ?? { range: 'all', status: 'all', patientId: 'all', treatmentId: 'all' };
  const filterOptions = financeDashboard?.filterOptions ?? { patients: [], treatments: [] };
  const periods = financeDashboard?.periods ?? {};
  const objectives = financeDashboard?.objectives ?? {};
  const comparison = financeDashboard?.comparison;
  const recentAccepted = financeDashboard?.recentAccepted ?? [];
  const topTreatments = financeDashboard?.topTreatments ?? [];
  const totalsByPatient = financeDashboard?.totalsByPatient ?? [];
  const totalsByTreatment = financeDashboard?.totalsByTreatment ?? [];
  const statusCounts = financeDashboard?.statusCounts ?? {};
  const filteredSnapshots = financeDashboard?.filteredSnapshots ?? [];
  const operationalSummary = financeDashboard?.operationalSummary ?? {};
  const pendingCollectionsByPatient = financeDashboard?.pendingCollectionsByPatient ?? [];
  const operationalTreatments = financeDashboard?.operationalTreatments ?? [];
  const upcomingAppointments = financeDashboard?.upcomingAppointments ?? [];

  const periodCards = [
    { key: 'day', label: 'Hoy', accent: 'day', objective: objectives.dailyAvailableObjective },
    { key: 'week', label: 'Semana', accent: 'week', objective: objectives.weeklyAvailableObjective },
    { key: 'month', label: 'Mes', accent: 'month', objective: objectives.monthlyAvailableObjective },
  ];

  return (
    <section className="finance-shell">
      <div className="finance-hero">
        <div className="finance-hero-copy">
          <div className="finance-kicker">Gestion financiera local</div>
          <h1>Flujo aceptado, margen disponible y objetivo operativo en una sola vista.</h1>
          <p>
            Esta pantalla toma solo snapshots financieros `accepted` para no mezclar proyecciones con montos ya comprometidos.
          </p>
        </div>
        <div className="finance-hero-band">
          <div className="finance-band-card">
            <span>Objetivo mensual disponible</span>
            <strong>{fmtCLP(objectives.monthlyAvailableObjective ?? 0)}</strong>
          </div>
          <div className="finance-band-card">
            <span>Snapshots aceptados</span>
            <strong>{recentAccepted.length}</strong>
          </div>
          <div className="finance-band-card">
            <span>Enviados</span>
            <strong>{statusCounts.sent ?? 0}</strong>
          </div>
          <div className="finance-band-card">
            <span>Borradores</span>
            <strong>{statusCounts.draft ?? 0}</strong>
          </div>
          <div className="finance-band-card">
            <span>Rechazados / vencidos</span>
            <strong>{(statusCounts.rejected ?? 0) + (statusCounts.expired ?? 0)}</strong>
          </div>
          <div className="finance-band-card">
            <span>Cobranza pendiente</span>
            <strong>{fmtCLP(operationalSummary.totalPendingBalance ?? 0)}</strong>
          </div>
          <div className="finance-band-card">
            <span>Citas visibles</span>
            <strong>{operationalSummary.upcomingAppointmentsCount ?? 0}</strong>
          </div>
        </div>
        <div className="finance-objective-panel">
          <div className="finance-objective-copy">
            <div className="finance-panel-kicker">Objetivo financiero</div>
            <h3>Meta mensual editable para disponible profesional + clinica</h3>
            <p>
              La semana y el dia se derivan automaticamente desde este objetivo mensual. El panel general mide avance solo con snapshots aceptados.
            </p>
          </div>
          <div className="finance-objective-controls">
            <label className="finance-objective-field">
              <span>Objetivo mensual</span>
              <input
                type="number"
                inputMode="decimal"
                value={pricingSettings?.monthlyAvailableObjective ?? 0}
                onChange={(event) => onPricingSettingChange?.('monthlyAvailableObjective', event.target.value)}
              />
            </label>
            <button className="btn btn-secondary" type="button" onClick={onResetPricingSettings}>
              Reiniciar objetivos
            </button>
          </div>
        </div>
      </div>

      <div className="finance-filter-bar">
        <label className="finance-filter-field">
          <span>Rango</span>
          <select value={filters.range} onChange={(event) => onFinanceFilterChange?.('range', event.target.value)}>
            <option value="all">Todo</option>
            <option value="today">Hoy</option>
            <option value="week">Semana actual</option>
            <option value="month">Mes actual</option>
          </select>
        </label>
        <label className="finance-filter-field">
          <span>Estado</span>
          <select value={filters.status} onChange={(event) => onFinanceFilterChange?.('status', event.target.value)}>
            <option value="all">Todos</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
        </label>
        <label className="finance-filter-field">
          <span>Paciente</span>
          <select value={filters.patientId} onChange={(event) => onFinanceFilterChange?.('patientId', event.target.value)}>
            <option value="all">Todos</option>
            {filterOptions.patients.map((patient) => (
              <option key={patient.value} value={patient.value}>{patient.label}</option>
            ))}
          </select>
        </label>
        <label className="finance-filter-field">
          <span>Tratamiento</span>
          <select value={filters.treatmentId} onChange={(event) => onFinanceFilterChange?.('treatmentId', event.target.value)}>
            <option value="all">Todos</option>
            {filterOptions.treatments.map((treatment) => (
              <option key={treatment.value} value={treatment.value}>{treatment.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="finance-period-grid">
        {periodCards.map((card) => {
          const period = periods[card.key] ?? {
            acceptedCount: 0,
            finalPrice: 0,
            availableBeforeLabor: 0,
            clinicProfit: 0,
            objectiveProgressPercent: 0,
          };

          return (
            <article key={card.key} className={`finance-period-card accent-${card.accent}`}>
              <div className="finance-period-head">
                <span>{card.label}</span>
                <strong>{fmtPercentCompact(period.objectiveProgressPercent ?? 0)}</strong>
              </div>
              <div className="finance-period-main">{fmtCLP(period.availableBeforeLabor ?? 0)}</div>
              <div className="finance-period-sub">Disponible profesional + clinica</div>
              <div className="finance-period-rail">
                <span style={{ width: `${Math.min(100, Math.max(8, period.objectiveProgressPercent ?? 0))}%` }} />
              </div>
              <div className="finance-period-meta">
                <div>
                  <small>Facturado</small>
                  <strong>{fmtCLP(period.finalPrice ?? 0)}</strong>
                </div>
                <div>
                  <small>Utilidad clinica</small>
                  <strong>{fmtCLP(period.clinicProfit ?? 0)}</strong>
                </div>
                <div>
                  <small>Aceptados</small>
                  <strong>{period.acceptedCount ?? 0}</strong>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="finance-lower-grid">
        <div className="finance-panel">
          <div className="finance-panel-head">
            <div>
              <div className="finance-panel-kicker">Operacion real</div>
              <h3>Agenda visible, cobranza y pipeline clinico</h3>
            </div>
          </div>
          <div className="finance-comparison-grid finance-operational-grid">
            <div className="finance-comparison-card">
              <span>Tratamientos filtrados</span>
              <strong>{fmtCLP(operationalSummary.totalTreatmentValue ?? 0)}</strong>
              <small>{fmtPercentCompact(operationalSummary.collectionRatePercent ?? 0)} recuperado</small>
            </div>
            <div className="finance-comparison-card">
              <span>Cobrado + cobertura</span>
              <strong>{fmtCLP((operationalSummary.totalCollected ?? 0) + (operationalSummary.totalCoverage ?? 0))}</strong>
              <small>{operationalSummary.patientsWithBalance ?? 0} pacientes con saldo</small>
            </div>
            <div className="finance-comparison-card emphasis">
              <span>Cobranza pendiente</span>
              <strong>{fmtCLP(operationalSummary.totalPendingBalance ?? 0)}</strong>
              <small>{operationalSummary.appointmentsNext7Days ?? 0} citas en 7 dias</small>
            </div>
          </div>
          <div className="finance-period-meta finance-operational-meta">
            <div>
              <small>Planificado</small>
              <strong>{fmtCLP(operationalSummary.plannedValue ?? 0)}</strong>
            </div>
            <div>
              <small>En curso</small>
              <strong>{fmtCLP(operationalSummary.inProgressValue ?? 0)}</strong>
            </div>
            <div>
              <small>Realizado</small>
              <strong>{fmtCLP(operationalSummary.completedValue ?? 0)}</strong>
            </div>
          </div>
        </div>

        <div className="finance-panel">
          <div className="finance-panel-head">
            <div>
              <div className="finance-panel-kicker">Citas visibles</div>
              <h3>Proximas atenciones del filtro activo</h3>
            </div>
          </div>
          <div className="finance-accepted-list">
            {upcomingAppointments.length > 0 ? upcomingAppointments.map((appointment) => (
              <div key={`${appointment.patientId}-${appointment.dateLabel}-${appointment.timeLabel ?? ''}`} className="finance-accepted-row">
                <div>
                  <div className="finance-row-title">{appointment.patientName}</div>
                  <div className="finance-row-meta">{appointment.recordNumber || 'Sin ficha'} · {appointment.dateLabel}{appointment.timeLabel ? ` · ${appointment.timeLabel}` : ''}</div>
                </div>
                <div className="finance-row-amounts">
                  <strong>{appointment.visitDate ? appointment.visitDate.toLocaleDateString('es-CL') : appointment.dateLabel || 'Sin fecha'}</strong>
                  <span>Agenda visible</span>
                </div>
              </div>
            )) : (
              <div className="finance-empty">No hay citas visibles para el rango y paciente seleccionado.</div>
            )}
          </div>
        </div>
      </div>

      <div className="finance-lower-grid">
        <div className="finance-panel">
          <div className="finance-panel-head">
            <div>
              <div className="finance-panel-kicker">Comparativo</div>
              <h3>{comparison?.label ?? 'Periodo actual vs anterior'}</h3>
            </div>
          </div>
          <div className="finance-comparison-grid">
            <div className="finance-comparison-card">
              <span>Actual</span>
              <strong>{fmtCLP(comparison?.current?.availableBeforeLabor ?? 0)}</strong>
              <small>{comparison?.current?.acceptedCount ?? 0} aceptados</small>
            </div>
            <div className="finance-comparison-card">
              <span>Anterior</span>
              <strong>{fmtCLP(comparison?.previous?.availableBeforeLabor ?? 0)}</strong>
              <small>{comparison?.previous?.acceptedCount ?? 0} aceptados</small>
            </div>
            <div className="finance-comparison-card emphasis">
              <span>Diferencia</span>
              <strong>{fmtCLP(comparison?.difference ?? 0)}</strong>
              <small>{fmtPercentCompact(comparison?.differencePercent ?? 0)}</small>
            </div>
          </div>
        </div>

        <div className="finance-panel">
          <div className="finance-panel-head">
            <div>
              <div className="finance-panel-kicker">Totales agrupados</div>
              <h3>Pacientes y tratamientos</h3>
            </div>
          </div>
          <div className="finance-dual-stack">
            <div>
              <div className="finance-mini-head">Por paciente</div>
              <div className="finance-mini-list">
                {totalsByPatient.length > 0 ? totalsByPatient.map((item) => (
                  <div key={item.key} className="finance-mini-row">
                    <span>{item.label}</span>
                    <strong>{fmtCLP(item.availableBeforeLabor)}</strong>
                  </div>
                )) : <div className="finance-empty">Sin pacientes para este filtro.</div>}
              </div>
            </div>
            <div>
              <div className="finance-mini-head">Por tratamiento</div>
              <div className="finance-mini-list">
                {totalsByTreatment.length > 0 ? totalsByTreatment.map((item) => (
                  <div key={item.key} className="finance-mini-row">
                    <span>{item.label}</span>
                    <strong>{fmtCLP(item.availableBeforeLabor)}</strong>
                  </div>
                )) : <div className="finance-empty">Sin tratamientos para este filtro.</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="finance-lower-grid">
        <div className="finance-panel">
          <div className="finance-panel-head">
            <div>
              <div className="finance-panel-kicker">Cobranza pendiente</div>
              <h3>Pacientes con saldo operativo</h3>
            </div>
          </div>
          <div className="finance-mini-list">
            {pendingCollectionsByPatient.length > 0 ? pendingCollectionsByPatient.map((item) => (
              <div key={item.key} className="finance-mini-row">
                <span>{item.label} · {item.treatmentCount} items</span>
                <strong>{fmtCLP(item.pendingBalance)}</strong>
              </div>
            )) : <div className="finance-empty">No hay cobranza pendiente para el filtro actual.</div>}
          </div>
        </div>

        <div className="finance-panel">
          <div className="finance-panel-head">
            <div>
              <div className="finance-panel-kicker">Pipeline clinico</div>
              <h3>Tratamientos activos y seguimiento</h3>
            </div>
          </div>
          <div className="finance-mini-list">
            {operationalTreatments.length > 0 ? operationalTreatments.map((item) => (
              <div key={item.id} className={`finance-mini-row finance-treatment-mini-row ${item.isDelayed ? 'is-delayed' : ''}`}>
                <span>{item.patientName} · {item.procedure || 'Sin procedimiento'} · {labelForOperationalStatus(item.status)}</span>
                <strong>{Math.max(0, item.pendingBalance) > 0 ? fmtCLP(item.pendingBalance) : fmtCLP(item.cost)}</strong>
              </div>
            )) : <div className="finance-empty">No hay tratamientos operativos para este filtro.</div>}
          </div>
        </div>
      </div>

      <div className="finance-lower-grid">
        <div className="finance-panel">
          <div className="finance-panel-head">
            <div>
              <div className="finance-panel-kicker">Ultimos aceptados</div>
              <h3>Presupuestos comprometidos</h3>
            </div>
            <button className="btn btn-secondary" type="button" onClick={onExportAcceptedSnapshots}>
              <Icon.download />
              Exportar aceptados
            </button>
          </div>
          <div className="finance-accepted-list">
            {recentAccepted.length > 0 ? recentAccepted.map((snapshot) => (
              <div key={snapshot.id} className="finance-accepted-row">
                <div>
                  <div className="finance-row-title">{snapshot.treatmentNameSnapshot}</div>
                  <div className="finance-row-meta">
                    {snapshot.patientName} · {snapshot.acceptedAt ? new Date(snapshot.acceptedAt).toLocaleDateString('es-CL') : 'Sin fecha'}
                  </div>
                </div>
                <div className="finance-row-amounts">
                  <strong>{fmtCLP(snapshot.calculationSnapshot?.availableBeforeLabor ?? 0)}</strong>
                  <span>{fmtCLP(snapshot.calculationSnapshot?.finalPrice ?? 0)}</span>
                </div>
              </div>
            )) : (
              <div className="finance-empty">Aun no hay snapshots aceptados para consolidar gestion diaria, semanal o mensual.</div>
            )}
          </div>
        </div>

        <div className="finance-panel">
          <div className="finance-panel-head">
            <div>
              <div className="finance-panel-kicker">Mix rentable</div>
              <h3>Tratamientos con mayor aporte</h3>
            </div>
            <div className="finance-panel-actions">
              <button className="btn btn-secondary" type="button" onClick={onExportFinanceSummary}>
                <Icon.download />
                Exportar resumen
              </button>
              <button className="btn btn-primary" type="button" onClick={onExportFinanceWorkbook}>
                <Icon.download />
                Exportar Excel
              </button>
            </div>
          </div>
          <div className="finance-treatment-list">
            {topTreatments.length > 0 ? topTreatments.map((treatment) => (
              <div key={treatment.treatmentName} className="finance-treatment-row">
                <div>
                  <div className="finance-row-title">{treatment.treatmentName}</div>
                  <div className="finance-row-meta">{treatment.count} aceptados</div>
                </div>
                <div className="finance-treatment-metrics">
                  <span>{fmtCLP(treatment.finalPrice)}</span>
                  <strong>{fmtCLP(treatment.availableBeforeLabor)}</strong>
                </div>
              </div>
            )) : (
              <div className="finance-empty">Cuando aceptes snapshots por paciente, aqui apareceran los tratamientos con mejor aporte.</div>
            )}
          </div>
        </div>
      </div>

      <div className="finance-lower-grid">
        <div className="finance-panel">
          <div className="finance-panel-head">
            <div>
              <div className="finance-panel-kicker">Columnas finales</div>
              <h3>Snapshots accepted</h3>
            </div>
          </div>
          <div className="finance-column-list">
            {ACCEPTED_SNAPSHOTS_REPORT_COLUMNS.map((column) => (
              <span key={column.key} className="finance-column-chip">{column.label}</span>
            ))}
          </div>
        </div>

        <div className="finance-panel">
          <div className="finance-panel-head">
            <div>
              <div className="finance-panel-kicker">Columnas finales</div>
              <h3>Finance summary</h3>
            </div>
          </div>
          <div className="finance-column-list">
            {FINANCE_SUMMARY_REPORT_COLUMNS.map((column) => (
              <span key={column.key} className="finance-column-chip">{column.label}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="finance-panel">
        <div className="finance-panel-head">
          <div>
            <div className="finance-panel-kicker">Detalle filtrado</div>
            <h3>Snapshots visibles segun filtros activos</h3>
          </div>
        </div>
        <div className="finance-table-wrap">
          <table className="finance-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Tratamiento</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Precio final</th>
                <th>Disponible</th>
                <th>Utilidad</th>
              </tr>
            </thead>
            <tbody>
              {filteredSnapshots.length > 0 ? filteredSnapshots.map((snapshot) => (
                <tr key={snapshot.id}>
                  <td>{snapshot.patientName}</td>
                  <td>{snapshot.treatmentNameSnapshot || 'Sin tratamiento'}</td>
                  <td>{snapshot.status}</td>
                  <td>{snapshot.snapshotDate ? snapshot.snapshotDate.toLocaleDateString('es-CL') : 'Sin fecha'}</td>
                  <td>{fmtCLP(snapshot.calculationSnapshot?.finalPrice ?? 0)}</td>
                  <td>{fmtCLP(snapshot.calculationSnapshot?.availableBeforeLabor ?? 0)}</td>
                  <td>{fmtCLP(snapshot.calculationSnapshot?.clinicProfit ?? 0)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="finance-table-empty">No hay snapshots que coincidan con los filtros activos.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function HomeDashboard({ patients, activePatient, currentUser }) {
  const [showFinance, setShowFinance] = useState(false);
  const welcomeText = getWelcomeText(currentUser);
  const pendingAlerts = patients.reduce((total, patient) => total + patient.alerts.length, 0);
  const upcomingPatients = patients
    .filter((patient) => patient.nextVisit && patient.nextVisit !== 'Sin cita' && patient.nextVisit !== 'Sin agendar')
    .map((patient) => {
      const followUp = getVisitFollowUp(patient.nextVisit);
      return {
        id: patient.id,
        patient: getPatientDisplayName(patient),
        schedule: patient.nextVisit,
        detail: `${patient.recordNumber} · ${patient.phone || 'Sin telefono registrado'}`,
        tone: followUp.tone,
        state: followUp.state,
        reminder: followUp.reminder,
        daysUntil: followUp.daysUntil,
        daysLabel: followUp.daysLabel,
      };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);
  const upcoming = upcomingPatients.length;
  const visibleFollowUps = upcomingPatients.slice(0, 4).map((patient) => ({
      id: patient.id,
      patient: patient.patient,
      schedule: patient.schedule,
      detail: patient.detail,
      tone: patient.tone,
      state: patient.state,
      reminder: patient.reminder,
      daysLabel: patient.daysLabel,
    }));
  const quickActions = ['Nuevo paciente', 'Nueva cita', 'Abrir ficha activa', 'Registrar pago'];
  const alerts = [
    { tone: 'danger', title: 'Alergias activas', detail: `${pendingAlerts} alertas clinicas requieren visibilidad en atencion.` },
    { tone: 'warn', title: 'Controles por confirmar', detail: `${upcoming} pacientes tienen seguimiento cercano o cita proxima.` },
    { tone: 'info', title: 'Presupuestos abiertos', detail: '3 planes preventivos siguen pendientes de cierre financiero.' },
  ];
  const kpis = [
    { label: 'Pacientes locales', value: String(patients.length), detail: 'directorio activo', tone: 'teal' },
    { label: 'Seguimientos visibles', value: String(visibleFollowUps.length), detail: 'citas con fecha registrada', tone: 'blue' },
    { label: 'Citas proximas', value: String(upcoming), detail: 'agenda visible', tone: 'amber' },
    { label: 'Alertas registradas', value: String(pendingAlerts), detail: 'alertas clinicas activas', tone: 'violet' },
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
          <div className="patients-eyebrow">Bienvenida</div>
          <h2>{welcomeText}</h2>
          <p>Vista rapida para abrir la jornada, revisar agenda, detectar alertas y volver a la ficha clinica sin perder el hilo.</p>
          <div className="home-hero-tags">
            <span className="patient-chip">{patients.length} pacientes locales</span>
            <span className="patient-chip">{upcoming} citas proximas</span>
            <span className="patient-chip">{pendingAlerts} alertas registradas</span>
          </div>
        </div>
        <div className="home-hero-side">
          <div className="home-focus-card">
            <div className="home-focus-label">Paciente activo</div>
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
                <div key={item.id} className={`home-agenda-row ${item.tone}`}>
                  <div className="home-agenda-time">{item.schedule}</div>
                  <div className="home-agenda-copy">
                    <div className="home-agenda-head">
                      <div className="home-agenda-title">{item.patient}</div>
                      <span className={`home-agenda-state ${item.tone}`}>{item.state}</span>
                    </div>
                    <div className="home-agenda-meta">{item.detail}</div>
                    <div className={`home-agenda-note ${item.tone}`}>{item.reminder}</div>
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
              <button
                type="button"
                className="home-finance-toggle"
                onClick={() => setShowFinance((current) => !current)}
              >
                {showFinance ? 'Ocultar' : 'Ver estado financiero'}
              </button>
            </div>
            {showFinance ? (
              <div className="home-finance-summary">
                {finance.map((item) => (
                  <div key={item.label} className="home-finance-row">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="home-finance-locked">
                Resumen financiero oculto por defecto.
              </div>
            )}
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

export function PatientsDirectoryView({ patients, agendaCount = 0, onCreatePatient, onOpenPatient }) {
  return (
    <div className="patients-directory-page">
      <div className="card patients-directory-page-hero">
        <div className="patients-directory-page-copy">
          <div className="patients-eyebrow">Pacientes</div>
          <h2>Directorio general de la clinica</h2>
          <p>Selecciona un paciente para abrir su ficha, revisar su ultima atencion o entrar directo a editarla.</p>
        </div>
        <div className="patients-directory-page-actions">
          <span className="patient-chip">{patients.length} pacientes locales</span>
          <span className="patient-chip">{agendaCount} citas proximas</span>
          <button className="btn btn-primary patient-directory-btn" type="button" onClick={onCreatePatient}>
            <Icon.plus />
            Nuevo paciente
          </button>
        </div>
      </div>
      <div className="patients-directory-grid">
        {patients.map((patient) => (
          <article key={patient.id} className="card patients-directory-row">
            <div className="patient-directory-row-main">
              <div className="patient-directory-avatar">{patient.initials}</div>
              <div className="patient-directory-copy">
                <div className="patient-directory-main">
                  <span>{getPatientDisplayName(patient)}</span>
                </div>
                <div className="patient-directory-record">{patient.recordNumber}</div>
                <div className="patient-directory-meta">{patient.rut || 'Sin RUT'} · {patient.phone || 'Sin telefono'}</div>
              </div>
            </div>
            <div className="patient-directory-row-stats">
              <span><strong>Ultima atencion</strong>{patient.lastVisit || 'Sin registro'}</span>
              <span><strong>Proxima cita</strong>{patient.nextVisit || 'Sin agendar'}</span>
            </div>
              <div className="patient-directory-card-actions">
                <button type="button" className="btn btn-secondary" onClick={() => onOpenPatient?.(patient.id, 'datos')}>
                  Ver ficha
                </button>
                <button type="button" className="btn btn-primary" onClick={() => onOpenPatient?.(patient.id, 'edit')}>
                  Editar ficha
                </button>
              </div>
          </article>
        ))}
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
  onRemoveItem,
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
            <button
              className="btn btn-ghost patient-item-remove"
              type="button"
              onClick={() => onRemoveItem?.(item.id)}
              aria-label={`Eliminar ${item.label || 'item'}`}
              title="Eliminar item"
            >
              <Icon.trash />
            </button>
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

  const removeItem = (collectionKey, itemId) => {
    onCollectionChange(
      collectionKey,
      draft[collectionKey].filter((item) => item.id !== itemId)
    );
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
          onRemoveItem={(itemId) => removeItem('medicalBackground', itemId)}
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
          onRemoveItem={(itemId) => removeItem('allergies', itemId)}
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
          onRemoveItem={(itemId) => removeItem('dentalHabits', itemId)}
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
  allowedSections,
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
    { id: 'agenda', label: 'Agenda', status: 'ready' },
    { id: 'cobros', label: 'Cobros y abonos', status: 'ready' },
    { id: 'presupuesto', label: 'Presupuesto', status: 'ready' },
    { id: 'documentos', label: 'Documentos', status: 'ready' },
    { id: 'historial', label: 'Historial', status: 'ready' },
  ].filter((section) => !allowedSections || allowedSections.includes(section.id));
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
