import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearAuthSession,
  getRolePermissions,
  loadAuthSession,
  saveAuthSession,
  validateLocalLogin,
} from '../auth';

describe('local auth', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('validates local role passwords', () => {
    expect(validateLocalLogin('admin', 'admin123')?.roleId).toBe('admin');
    expect(validateLocalLogin('dr', 'dr123')?.roleId).toBe('dr');
    expect(validateLocalLogin('staff', 'staff123')?.roleId).toBe('staff');
    expect(validateLocalLogin('staff', 'wrong')).toBeNull();
  });

  it('persists and clears the local session', () => {
    const session = validateLocalLogin('staff', 'staff123');
    saveAuthSession(session);

    expect(loadAuthSession().roleId).toBe('staff');

    clearAuthSession();
    expect(loadAuthSession()).toBeNull();
  });

  it('keeps staff away from internal finance views', () => {
    const staffPermissions = getRolePermissions('staff');
    const drPermissions = getRolePermissions('dr');
    const adminPermissions = getRolePermissions('admin');

    expect(staffPermissions.views).toContain('priceList');
    expect(staffPermissions.views).not.toContain('finance');
    expect(staffPermissions.views).not.toContain('inventory');
    expect(staffPermissions.patientTabs).not.toContain('presupuesto');
    expect(staffPermissions.patientTabs).not.toContain('insumos');
    expect(drPermissions.patientTabs).toContain('presupuesto');
    expect(drPermissions.patientTabs).not.toContain('insumos');
    expect(drPermissions.views).not.toContain('inventory');
    expect(adminPermissions.views).toContain('inventory');
    expect(drPermissions.canManagePricing).toBe(false);
  });
});
