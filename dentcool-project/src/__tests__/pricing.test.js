import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PRICING_SETTINGS,
  DEFAULT_PRICING_TREATMENTS,
  buildFinanceDashboard,
  calculatePricingResult,
  calculateRecommendedPrice,
  calculateSimpleTreatmentPack,
  createPatientPricingBudget,
  exportAcceptedSnapshotsCsv,
  exportFinanceSummaryCsv,
  findPricingTreatmentForProcedure,
} from '../pricing';

describe('pricing', () => {
  it('calculates the base case without discount', () => {
    const treatment = findPricingTreatmentForProcedure('Limpieza VIP', DEFAULT_PRICING_TREATMENTS);
    const result = calculatePricingResult({
      treatment,
      settings: DEFAULT_PRICING_SETTINGS,
      input: {
        customPrice: 60000,
        discountEnabled: false,
        customDurationHours: 1,
        customSuppliesCost: 6000,
        customMarketingCost: 5000,
        customAdminCost: 2000,
        customTransportCost: 2000,
        paymentMethod: 'card',
        applyPaymentFee: true,
        applyReserve: true,
        applyTax: true,
        laborCostMode: 'fixed',
        laborCostValue: 18000,
      },
    });

    expect(result.finalPrice).toBe(60000);
    expect(result.paymentFeeAmount).toBe(1800);
    expect(result.reserveAmount).toBe(3000);
    expect(result.taxAmount).toBe(9150);
    expect(result.totalCostsBeforeLabor).toBe(38950);
    expect(result.availableBeforeLabor).toBe(21050);
    expect(result.availableBeforeLaborPercent).toBeCloseTo(35.08, 2);
    expect(result.clinicProfit).toBe(3050);
    expect(result.clinicProfitPercent).toBeCloseTo(5.08, 2);
    expect(result.pricingStatus).toBe('Bajo');
    expect(result.externalClinicianStatus).toBe('No soporta boleta');
  });

  it('calculates discount values correctly', () => {
    const treatment = findPricingTreatmentForProcedure('Limpieza VIP', DEFAULT_PRICING_TREATMENTS);
    const result = calculatePricingResult({
      treatment,
      settings: DEFAULT_PRICING_SETTINGS,
      input: {
        customPrice: 60000,
        discountEnabled: true,
        discountPercent: 10,
        paymentMethod: 'card',
        applyPaymentFee: true,
        applyReserve: true,
        applyTax: true,
        laborCostMode: 'fixed',
        laborCostValue: 18000,
      },
    });

    expect(result.discountAmount).toBe(6000);
    expect(result.finalPrice).toBe(54000);
    expect(result.paymentFeeAmount).toBe(1620);
    expect(result.reserveAmount).toBe(2700);
    expect(result.taxAmount).toBe(8235);
  });

  it('warns when discount exceeds the treatment threshold', () => {
    const treatment = findPricingTreatmentForProcedure('Limpieza standard', DEFAULT_PRICING_TREATMENTS);
    const result = calculatePricingResult({
      treatment,
      input: {
        customPrice: 45000,
        discountEnabled: true,
        discountPercent: 15,
        laborCostMode: 'fixed',
        laborCostValue: 15000,
      },
    });

    expect(result.warnings).toContain('El descuento supera el maximo recomendado para este tratamiento.');
  });

  it('warns when final price falls below the minimum price', () => {
    const treatment = findPricingTreatmentForProcedure('Limpieza VIP', DEFAULT_PRICING_TREATMENTS);
    const result = calculatePricingResult({
      treatment,
      input: {
        customPrice: 42000,
        discountEnabled: false,
        laborCostMode: 'fixed',
        laborCostValue: 18000,
      },
    });

    expect(result.warnings).toContain('El precio final quedo bajo el minimo sugerido para este tratamiento.');
  });

  it('supports transfer without payment fee', () => {
    const treatment = findPricingTreatmentForProcedure('Restauracion simple', DEFAULT_PRICING_TREATMENTS);
    const result = calculatePricingResult({
      treatment,
      input: {
        customPrice: 60000,
        paymentMethod: 'transfer',
        applyPaymentFee: false,
        laborCostMode: 'fixed',
        laborCostValue: 25000,
      },
    });

    expect(result.paymentFeeAmount).toBe(0);
  });

  it('warns when tax is disabled', () => {
    const treatment = findPricingTreatmentForProcedure('Restauracion simple', DEFAULT_PRICING_TREATMENTS);
    const result = calculatePricingResult({
      treatment,
      input: {
        customPrice: 60000,
        applyTax: false,
        laborCostMode: 'fixed',
        laborCostValue: 25000,
      },
    });

    expect(result.taxAmount).toBe(0);
    expect(result.warnings).toContain('El impuesto o retencion esta desactivado. El calculo es parcial.');
  });

  it('supports percentage labor mode', () => {
    const treatment = findPricingTreatmentForProcedure('Blanqueamiento', DEFAULT_PRICING_TREATMENTS);
    const result = calculatePricingResult({
      treatment,
      input: {
        customPrice: 100000,
        laborCostMode: 'percent',
        laborCostValue: 30,
        paymentMethod: 'transfer',
        applyPaymentFee: false,
      },
    });

    expect(result.laborCost).toBe(30000);
    expect(result.laborCostPercent).toBe(30);
  });

  it('calculates a simple pack with weighted max discount and reduced doctor labor', () => {
    const result = calculateSimpleTreatmentPack({
      treatmentIds: ['limpieza-vip', 'blanqueamiento-consulta'],
      catalog: DEFAULT_PRICING_TREATMENTS,
      discountPercent: 15,
      scheduleMode: 'same-day',
    });

    expect(result.basePrice).toBe(180000);
    expect(result.minPrice).toBe(145000);
    expect(result.healthyPrice).toBe(190000);
    expect(result.idealPrice).toBe(220000);
    expect(result.durationHours).toBe(2.5);
    expect(result.sessions).toBe(1);
    expect(result.maxRecommendedDiscountPercent).toBeCloseTo(13.33, 2);
    expect(result.discountPercent).toBe(13.33);
    expect(result.finalPrice).toBe(156006);
    expect(result.doctorLaborCost).toBe(41602);
    expect(result.doctorLaborPercent).toBeCloseTo(26.67, 2);
    expect(result.warnings).toContain('El descuento fue ajustado al maximo recomendado del pack.');
  });

  it('limits simple packs to the first three selected treatments', () => {
    const result = calculateSimpleTreatmentPack({
      treatmentIds: ['evaluacion', 'limpieza-standard', 'blanqueamiento-consulta', 'sellantes'],
      catalog: DEFAULT_PRICING_TREATMENTS,
      scheduleMode: 'split-days',
    });

    expect(result.treatmentIds).toEqual(['evaluacion', 'limpieza-standard', 'blanqueamiento-consulta']);
    expect(result.sessions).toBe(3);
    expect(result.warnings).not.toContain('El pack simple permite maximo 3 tratamientos.');
  });

  it('raises recommended price when fixed costs go up', () => {
    const treatment = findPricingTreatmentForProcedure('Limpieza VIP', DEFAULT_PRICING_TREATMENTS);
    const base = calculatePricingResult({
      treatment,
      input: {
        customPrice: 60000,
        customMarketingCost: 5000,
        laborCostMode: 'fixed',
        laborCostValue: 18000,
      },
    });
    const expensive = calculatePricingResult({
      treatment,
      input: {
        customPrice: 60000,
        customMarketingCost: 12000,
        laborCostMode: 'fixed',
        laborCostValue: 18000,
      },
    });

    expect(expensive.recommendedPriceFor45).toBeGreaterThan(base.recommendedPriceFor45);
  });

  it('returns null for invalid recommended price denominators', () => {
    const result = calculateRecommendedPrice({
      fixedCostPerTreatment: 10000,
      variablePercentOfPrice: 70,
      targetMarginPercent: 40,
    });

    expect(result).toBeNull();
  });

  it('stores budget snapshots without recalculating later', () => {
    const treatment = findPricingTreatmentForProcedure('Limpieza VIP', DEFAULT_PRICING_TREATMENTS);
    const calculationSnapshot = calculatePricingResult({
      treatment,
      input: {
        customPrice: 60000,
        laborCostMode: 'fixed',
        laborCostValue: 18000,
      },
    });

    const budget = createPatientPricingBudget({
      id: 'budget-1',
      patientId: 'patient-maria-soto',
      treatmentId: treatment.id,
      treatmentNameSnapshot: treatment.name,
      calculationSnapshot,
      createdAt: '2026-05-14T10:00:00.000Z',
      updatedAt: '2026-05-14T10:00:00.000Z',
    });

    calculationSnapshot.finalPrice = 999999;

    expect(budget.calculationSnapshot.finalPrice).toBe(60000);
    expect(budget.treatmentNameSnapshot).toBe('Limpieza VIP');
  });

  it('builds finance summaries from accepted snapshots', () => {
    const today = new Date().toISOString();
    const dashboard = buildFinanceDashboard(
      {
        'patient-maria-soto': {
          pricingBudgets: [
            {
              id: 'b1',
              status: 'accepted',
              treatmentNameSnapshot: 'Limpieza VIP',
              calculationSnapshot: {
                finalPrice: 60000,
                availableBeforeLabor: 21050,
                clinicProfit: 3050,
              },
              createdAt: today,
              updatedAt: today,
              acceptedAt: today,
            },
          ],
        },
      },
      [{ id: 'patient-maria-soto', fullName: 'Maria Soto' }]
    );

    expect(dashboard.periods.day.acceptedCount).toBe(1);
    expect(dashboard.periods.day.finalPrice).toBe(60000);
    expect(dashboard.periods.day.availableBeforeLabor).toBe(21050);
    expect(dashboard.recentAccepted[0].patientName).toBe('Maria Soto');
    expect(dashboard.topTreatments[0].treatmentName).toBe('Limpieza VIP');
  });

  it('builds operational summaries from separated appointments and payment entries', () => {
    const today = new Date().toISOString();
    const dashboard = buildFinanceDashboard(
      {
        'patient-maria-soto': {
          treatments: [
            {
              id: 'tx-1',
              procedure: 'Limpieza VIP',
              dateLabel: '14 may 2026',
              cost: 60000,
              paid: 0,
              coveragePercent: 0,
              status: 'planned',
            },
          ],
          appointments: [
            {
              id: 'apt-1',
              dateLabel: '17 may 2026',
              timeLabel: '09:00',
              reason: 'Control',
              clinician: 'Dra. Test',
              status: 'confirmed',
              notes: '',
            },
          ],
          paymentEntries: [
            {
              id: 'pay-1',
              treatmentId: 'tx-1',
              dateLabel: '14 may 2026',
              amount: 15000,
              method: 'transfer',
              concept: 'Abono',
              notes: '',
              status: 'received',
            },
          ],
          pricingBudgets: [
            {
              id: 'b1',
              status: 'accepted',
              treatmentNameSnapshot: 'Limpieza VIP',
              calculationSnapshot: {
                finalPrice: 60000,
                availableBeforeLabor: 21050,
                clinicProfit: 3050,
              },
              createdAt: today,
              updatedAt: today,
              acceptedAt: today,
            },
          ],
        },
      },
      [{ id: 'patient-maria-soto', fullName: 'Maria Soto' }]
    );

    expect(dashboard.operationalSummary.totalCollected).toBe(15000);
    expect(dashboard.operationalSummary.upcomingAppointmentsCount).toBe(1);
    expect(dashboard.upcomingAppointments[0].reason).toBe('Control');
    expect(dashboard.operationalTreatments[0].paid).toBe(15000);
  });

  it('ignores non-accepted snapshots in period summaries', () => {
    const today = new Date().toISOString();
    const dashboard = buildFinanceDashboard(
      {
        'patient-a': {
          pricingBudgets: [
            {
              id: 'b1',
              status: 'draft',
              treatmentNameSnapshot: 'Draft',
              calculationSnapshot: {
                finalPrice: 10000,
                availableBeforeLabor: 5000,
                clinicProfit: 2000,
              },
              createdAt: today,
              updatedAt: today,
            },
          ],
        },
      },
      [{ id: 'patient-a', fullName: 'Paciente A' }]
    );

    expect(dashboard.periods.day.acceptedCount).toBe(0);
    expect(dashboard.statusCounts.draft).toBe(1);
  });

  it('filters finance dashboard by status', () => {
    const today = new Date().toISOString();
    const dashboard = buildFinanceDashboard(
      {
        'patient-a': {
          pricingBudgets: [
            {
              id: 'b1',
              status: 'accepted',
              treatmentNameSnapshot: 'Aceptado',
              calculationSnapshot: {
                finalPrice: 60000,
                availableBeforeLabor: 21050,
                clinicProfit: 3050,
              },
              createdAt: today,
              updatedAt: today,
              acceptedAt: today,
            },
            {
              id: 'b2',
              status: 'sent',
              treatmentNameSnapshot: 'Enviado',
              calculationSnapshot: {
                finalPrice: 30000,
                availableBeforeLabor: 10000,
                clinicProfit: 2000,
              },
              createdAt: today,
              updatedAt: today,
              sentAt: today,
            },
          ],
        },
      },
      [{ id: 'patient-a', fullName: 'Paciente A' }],
      {},
      { status: 'sent', range: 'all' }
    );

    expect(dashboard.filteredSnapshots).toHaveLength(1);
    expect(dashboard.statusCounts.sent).toBe(1);
    expect(dashboard.periods.day.acceptedCount).toBe(0);
  });

  it('filters finance dashboard by patient and treatment', () => {
    const today = new Date().toISOString();
    const dashboard = buildFinanceDashboard(
      {
        'patient-a': {
          pricingBudgets: [
            {
              id: 'b1',
              treatmentId: 'limpieza-vip',
              treatmentNameSnapshot: 'Limpieza VIP',
              status: 'accepted',
              calculationSnapshot: {
                finalPrice: 60000,
                availableBeforeLabor: 21050,
                clinicProfit: 3050,
              },
              createdAt: today,
              updatedAt: today,
              acceptedAt: today,
            },
          ],
        },
        'patient-b': {
          pricingBudgets: [
            {
              id: 'b2',
              treatmentId: 'restauracion-simple',
              treatmentNameSnapshot: 'Restauracion simple',
              status: 'accepted',
              calculationSnapshot: {
                finalPrice: 50000,
                availableBeforeLabor: 18000,
                clinicProfit: 4000,
              },
              createdAt: today,
              updatedAt: today,
              acceptedAt: today,
            },
          ],
        },
      },
      [
        { id: 'patient-a', fullName: 'Paciente A' },
        { id: 'patient-b', fullName: 'Paciente B' },
      ],
      {},
      { patientId: 'patient-b', treatmentId: 'restauracion-simple', range: 'all', status: 'all' }
    );

    expect(dashboard.acceptedSnapshots).toHaveLength(1);
    expect(dashboard.acceptedSnapshots[0].patientId).toBe('patient-b');
    expect(dashboard.acceptedSnapshots[0].treatmentId).toBe('restauracion-simple');
    expect(dashboard.filterOptions.patients).toHaveLength(2);
    expect(dashboard.filterOptions.treatments).toHaveLength(2);
  });

  it('builds comparison and totals for advanced reports', () => {
    const now = new Date();
    const today = now.toISOString();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString();
    const dashboard = buildFinanceDashboard(
      {
        'patient-a': {
          pricingBudgets: [
            {
              id: 'b1',
              treatmentId: 'limpieza-vip',
              treatmentNameSnapshot: 'Limpieza VIP',
              status: 'accepted',
              calculationSnapshot: {
                finalPrice: 60000,
                availableBeforeLabor: 21050,
                clinicProfit: 3050,
              },
              createdAt: today,
              updatedAt: today,
              acceptedAt: today,
            },
          ],
        },
        'patient-b': {
          pricingBudgets: [
            {
              id: 'b2',
              treatmentId: 'restauracion-simple',
              treatmentNameSnapshot: 'Restauracion simple',
              status: 'accepted',
              calculationSnapshot: {
                finalPrice: 50000,
                availableBeforeLabor: 18000,
                clinicProfit: 4000,
              },
              createdAt: lastMonth,
              updatedAt: lastMonth,
              acceptedAt: lastMonth,
            },
          ],
        },
      },
      [
        { id: 'patient-a', fullName: 'Paciente A' },
        { id: 'patient-b', fullName: 'Paciente B' },
      ]
    );

    expect(dashboard.comparison.label.length).toBeGreaterThan(0);
    expect(dashboard.totalsByPatient.length).toBeGreaterThan(0);
    expect(dashboard.totalsByTreatment.length).toBeGreaterThan(0);
    expect(dashboard.totalsByPatient[0].label).toBe('Paciente A');
  });

  it('builds operational finance metrics from treatments and upcoming visits', () => {
    const dashboard = buildFinanceDashboard(
      {
        'patient-a': {
          treatments: [
            {
              id: 'tx-1',
              procedure: 'Limpieza VIP',
              status: 'planned',
              dateLabel: '20-05-2026',
              cost: 60000,
              paid: 10000,
              coveragePercent: 20,
            },
            {
              id: 'tx-2',
              procedure: 'Restauracion simple',
              status: 'in_progress',
              dateLabel: '10-05-2026',
              cost: 50000,
              paid: 0,
              coveragePercent: 0,
            },
          ],
        },
      },
      [
        {
          id: 'patient-a',
          fullName: 'Paciente A',
          recordNumber: 'DC-1',
          nextVisit: '17 may 2026',
        },
      ],
      {},
      { patientId: 'patient-a', treatmentId: 'limpieza-vip', range: 'all', status: 'all' }
    );

    expect(dashboard.operationalSummary.totalTreatmentValue).toBe(60000);
    expect(dashboard.operationalSummary.totalCollected).toBe(10000);
    expect(dashboard.operationalSummary.totalCoverage).toBe(12000);
    expect(dashboard.operationalSummary.totalPendingBalance).toBe(38000);
    expect(dashboard.pendingCollectionsByPatient[0].label).toBe('Paciente A');
    expect(dashboard.upcomingAppointments).toHaveLength(1);
    expect(dashboard.operationalTreatments[0].procedure).toBe('Limpieza VIP');
  });

  it('exports accepted snapshots as csv', () => {
    const today = new Date().toISOString();
    const dashboard = buildFinanceDashboard(
      {
        'patient-a': {
          pricingBudgets: [
            {
              id: 'b1',
              treatmentId: 'limpieza-vip',
              treatmentNameSnapshot: 'Limpieza VIP',
              status: 'accepted',
              calculationSnapshot: {
                finalPrice: 60000,
                availableBeforeLabor: 21050,
                clinicProfit: 3050,
                pricingStatus: 'Bajo',
                externalClinicianStatus: 'No soporta boleta',
              },
              createdAt: today,
              updatedAt: today,
              acceptedAt: today,
            },
          ],
        },
      },
      [{ id: 'patient-a', fullName: 'Paciente A' }]
    );

    const csv = exportAcceptedSnapshotsCsv(dashboard);

    expect(csv).toContain('"patientName"');
    expect(csv).toContain('"Paciente A"');
    expect(csv).toContain('"Limpieza VIP"');
  });

  it('exports finance summary as csv', () => {
    const today = new Date().toISOString();
    const dashboard = buildFinanceDashboard(
      {
        'patient-a': {
          pricingBudgets: [
            {
              id: 'b1',
              treatmentId: 'limpieza-vip',
              treatmentNameSnapshot: 'Limpieza VIP',
              status: 'accepted',
              calculationSnapshot: {
                finalPrice: 60000,
                availableBeforeLabor: 21050,
                clinicProfit: 3050,
              },
              createdAt: today,
              updatedAt: today,
              acceptedAt: today,
            },
          ],
        },
      },
      [{ id: 'patient-a', fullName: 'Paciente A' }]
    );

    const csv = exportFinanceSummaryCsv(dashboard);

    expect(csv).toContain('"period"');
    expect(csv).toContain('"month"');
    expect(csv).toContain('"21050"');
  });
});
