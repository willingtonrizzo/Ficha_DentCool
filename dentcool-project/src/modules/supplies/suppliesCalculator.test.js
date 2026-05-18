import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SUPPLY_CATALOG,
  DEFAULT_SUPPLY_RECIPES,
} from './suppliesSeeds';
import {
  applyPurchaseToStock,
  adjustSupplyItemForPurchaseChange,
  buildSupplyPurchaseComparisonRows,
  calculateAmortizedCost,
  calculatePatientSupplyUsageCost,
  calculateRecipeCost,
  calculateSterilizationCostPerPack,
  calculateUnitCost,
  calculateWeightedAverageCost,
  checkAgendaSupplyNeeds,
  checkLowStock,
  createSupplySnapshot,
} from './suppliesCalculator';

describe('supplies calculator', () => {
  it('calculates unit cost from a purchase', () => {
    expect(calculateUnitCost(3000, 100)).toBe(30);
  });

  it('calculates weighted average cost after a new purchase', () => {
    expect(calculateWeightedAverageCost(50, 30, 100, 40)).toBeCloseTo(36.67, 2);
  });

  it('calculates amortized cost by estimated uses', () => {
    expect(calculateAmortizedCost(30000, 60)).toBe(500);
  });

  it('calculates sterilization cost per pack', () => {
    expect(calculateSterilizationCostPerPack(12000, 10)).toBe(1200);
  });

  it('calculates recipe cost from catalog items', () => {
    const recipe = DEFAULT_SUPPLY_RECIPES.find((item) => item.id === 'recipe_limpieza_vip');
    const result = calculateRecipeCost(recipe, DEFAULT_SUPPLY_CATALOG);

    expect(result.totalCost).toBe(4910);
    expect(result.lines).toHaveLength(9);
    expect(result.missingItemIds).toHaveLength(0);
  });

  it('uses patient quantities when they differ from the recipe', () => {
    const result = calculatePatientSupplyUsageCost(
      [
        { itemId: 'sup_gasa_001', quantity: 4 },
        { itemId: 'sup_vaso_001', quantity: 1 },
      ],
      DEFAULT_SUPPLY_CATALOG
    );

    expect(result.totalCost).toBe(190);
    expect(result.lines[0].quantity).toBe(4);
  });

  it('uses amortized unit cost for reusable equipment', () => {
    const result = calculatePatientSupplyUsageCost(
      [
        { itemId: 'eq_contraangulo_test', quantity: 1 },
      ],
      [
        {
          id: 'eq_contraangulo_test',
          name: 'Contraangulo',
          itemType: 'equipment',
          unit: 'uso',
          purchaseQuantity: 100,
          purchaseTotalCost: 100000,
          unitCost: 1000,
          amortizationUses: 100,
        },
      ]
    );

    expect(result.totalCost).toBe(1000);
    expect(result.lines[0].itemType).toBe('equipment');
    expect(result.lines[0].purchaseQuantity).toBe(100);
  });

  it('creates immutable supply snapshots', () => {
    const usageItems = [{ itemId: 'sup_vaso_001', quantity: 2 }];
    const snapshot = createSupplySnapshot({
      patientId: 'patient-maria-soto',
      treatmentId: 'evaluacion',
      usageItems,
      catalog: DEFAULT_SUPPLY_CATALOG,
      notes: 'Demo',
    });

    usageItems[0].quantity = 99;

    expect(snapshot.totalSupplyCost).toBe(60);
    expect(snapshot.items[0].quantity).toBe(2);
    expect(snapshot.patientId).toBe('patient-maria-soto');
  });

  it('flags low stock when the current stock reaches the minimum', () => {
    expect(checkLowStock({ currentStock: 18, minimumStock: 20 })).toBe(true);
    expect(checkLowStock({ currentStock: 21, minimumStock: 20 })).toBe(false);
    expect(checkLowStock({ currentStock: 0, minimumStock: 0 })).toBe(false);
  });

  it('calculates agenda supply needs from upcoming appointments', () => {
    const result = checkAgendaSupplyNeeds(
      [
        { id: 'apt-1', treatmentId: 'limpieza-vip', status: 'confirmed', dateLabel: '18 may 2026' },
        { id: 'apt-2', treatmentId: 'evaluacion', status: 'scheduled', dateLabel: '19 may 2026' },
      ],
      DEFAULT_SUPPLY_RECIPES,
      DEFAULT_SUPPLY_CATALOG
    );

    const vaso = result.totals.find((line) => line.itemId === 'sup_vaso_001');
    const pack = result.totals.find((line) => line.itemId === 'pack_examen_001');

    expect(result.lines).toHaveLength(2);
    expect(vaso.quantity).toBe(2);
    expect(pack.quantity).toBe(2);
  });

  it('applies a purchase to stock using weighted average cost', () => {
    const item = applyPurchaseToStock(
      {
        currentStock: 50,
        unitCost: 30,
        minimumStock: 20,
      },
      {
        quantityPurchased: 100,
        totalCost: 4000,
      }
    );

    expect(item.currentStock).toBe(150);
    expect(item.unitCost).toBeCloseTo(36.67, 2);
  });

  it('adjusts stock and cost when a purchase is edited or removed', () => {
    const baseItem = {
      currentStock: 150,
      unitCost: 36.67,
    };
    const purchase = {
      quantityPurchased: 100,
      unitCost: 40,
    };

    const removed = adjustSupplyItemForPurchaseChange(baseItem, purchase, -1);
    const restored = adjustSupplyItemForPurchaseChange(removed, purchase, 1);

    expect(removed.currentStock).toBe(50);
    expect(removed.unitCost).toBeCloseTo(30, 0);
    expect(restored.currentStock).toBe(150);
    expect(restored.unitCost).toBeCloseTo(36.67, 2);
  });

  it('builds purchase comparison rows with averages and supplier context', () => {
    const rows = buildSupplyPurchaseComparisonRows(
      [
        {
          itemId: 'sup_vaso_001',
          itemName: 'Vaso desechable',
          itemBrand: 'Nitriflex',
          quantityPurchased: 100,
          totalCost: 3000,
          unitCost: 30,
          supplierId: 'prov_dental_001',
          purchaseDateLabel: '15/05/2026',
          createdAt: '2026-05-15T12:00:00.000Z',
        },
        {
          itemId: 'sup_vaso_001',
          itemName: 'Vaso desechable',
          itemBrand: 'Nitriflex',
          quantityPurchased: 50,
          totalCost: 2000,
          unitCost: 40,
          supplierId: 'prov_dental_001',
          purchaseDateLabel: '20/05/2026',
          createdAt: '2026-05-20T12:00:00.000Z',
        },
      ],
      [
        { id: 'prov_dental_001', name: 'Proveedor Dental X' },
      ]
    );

    expect(rows).toHaveLength(1);
    expect(rows[0].minUnitCost).toBe(30);
    expect(rows[0].averageUnitCost).toBeCloseTo(33.33, 2);
    expect(rows[0].lastUnitCost).toBe(40);
    expect(rows[0].lastBrandName).toBe('Nitriflex');
    expect(rows[0].lastSupplierName).toBe('Proveedor Dental X');
    expect(rows[0].supplierCount).toBe(1);
  });
});
