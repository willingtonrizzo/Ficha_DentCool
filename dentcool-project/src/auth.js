import { STORAGE_KEYS } from './data';

export const USER_ROLES = {
  admin: {
    id: 'admin',
    label: 'Admin',
    name: 'Administracion',
    initials: 'AD',
    password: 'admin123',
    help: 'Acceso completo a pacientes, clinica, precios, insumos y reportes.',
  },
  dr: {
    id: 'dr',
    label: 'Dr',
    name: 'Doctor',
    initials: 'DR',
    password: 'dr123',
    help: 'Acceso clinico para ficha, tratamientos, presupuesto e insumos.',
  },
  staff: {
    id: 'staff',
    label: 'Staff',
    name: 'Recepcion',
    initials: 'ST',
    password: 'staff123',
    help: 'Acceso a pacientes, agenda y lista de precios sin costos internos.',
  },
};

export const ROLE_PERMISSIONS = {
  admin: {
    views: ['home', 'patients', 'patient', 'priceList', 'inventory', 'finance'],
    patientTabs: ['antecedentes', 'motivo', 'evolucion', 'presupuesto', 'insumos', 'documentos', 'historial'],
    sheetSections: ['datos', 'antecedentes', 'motivo', 'evolucion', 'agenda', 'cobros', 'presupuesto', 'documentos', 'historial'],
    canManagePricing: true,
    canSeeFinance: true,
  },
  dr: {
    views: ['home', 'patients', 'patient', 'priceList'],
    patientTabs: ['antecedentes', 'motivo', 'evolucion', 'presupuesto', 'documentos', 'historial'],
    sheetSections: ['datos', 'antecedentes', 'motivo', 'evolucion', 'agenda', 'presupuesto', 'documentos', 'historial'],
    canManagePricing: false,
    canSeeFinance: false,
  },
  staff: {
    views: ['home', 'patients', 'patient', 'priceList'],
    patientTabs: ['antecedentes', 'documentos'],
    sheetSections: ['datos', 'antecedentes', 'agenda', 'documentos'],
    canManagePricing: false,
    canSeeFinance: false,
  },
};

export function getRolePermissions(roleId) {
  return ROLE_PERMISSIONS[roleId] ?? ROLE_PERMISSIONS.staff;
}

export function loadAuthSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.authSession);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.roleId || !USER_ROLES[parsed.roleId]) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAuthSession(session) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEYS.authSession, JSON.stringify(session));
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEYS.authSession);
}

export function validateLocalLogin(roleId, password) {
  const role = USER_ROLES[roleId];
  if (!role) return null;
  if ((password ?? '').trim() !== role.password) return null;

  return {
    roleId,
    roleLabel: role.label,
    name: role.name,
    initials: role.initials,
    loggedAt: new Date().toISOString(),
  };
}
