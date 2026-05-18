import { describe, expect, it } from 'vitest';
import {
  buildBillingDashboard,
  buildBillingPatientRows,
  buildBillingPendingRows,
  buildBillingVoidedRows,
} from '../app';

describe('billing dashboard', () => {
  it('summarizes payments by day, week and month from patient payment entries', () => {
    const dashboard = buildBillingDashboard(
      {
        'patient-1': {
          treatments: [
            { id: 'tx-1', procedure: 'Limpieza', cost: 50000, paid: 20000 },
          ],
          paymentEntries: [
            {
              id: 'pay-today',
              treatmentId: 'tx-1',
              dateLabel: '18 may 2026',
              amount: 20000,
              method: 'transfer',
              concept: 'Abono inicial',
              reference: 'OP-123',
            },
            {
              id: 'pay-month',
              treatmentId: 'tx-1',
              dateLabel: '10 may 2026',
              amount: 10000,
              method: 'cash',
              concept: 'Abono anterior',
            },
            {
              id: 'pay-old',
              treatmentId: 'tx-1',
              dateLabel: '20 abr 2026',
              amount: 5000,
              method: 'card',
              concept: 'Pago antiguo',
            },
            {
              id: 'pay-void',
              treatmentId: 'tx-1',
              dateLabel: '18 may 2026',
              amount: 15000,
              method: 'cash',
              concept: 'Abono anulado',
              status: 'void',
              voidReason: 'Duplicado',
            },
          ],
        },
      },
      [{ id: 'patient-1', fullName: 'Paciente Test', recordNumber: 'DC-1' }],
      new Date(2026, 4, 18)
    );

    expect(dashboard.periodSummaries.day).toEqual({ total: 20000, count: 1 });
    expect(dashboard.periodSummaries.week).toEqual({ total: 20000, count: 1 });
    expect(dashboard.periodSummaries.month).toEqual({ total: 30000, count: 2 });
    expect(dashboard.periodSummaries.all).toEqual({ total: 35000, count: 3 });
    expect(dashboard.summary.pendingBalance).toBe(30000);
    expect(dashboard.voidedPayments).toHaveLength(1);
    expect(buildBillingVoidedRows(dashboard)[0].MotivoAnulacion).toBe('Duplicado');
    expect(buildBillingPendingRows(dashboard)[0].EstadoPago).toBe('Abono parcial');
    expect(buildBillingPatientRows(dashboard)[0].TotalCobrado).toBe(35000);
  });
});
