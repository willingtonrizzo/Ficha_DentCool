function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function roundMoney(value) {
  return Math.round(toNumber(value, 0));
}

function roundCost(value) {
  return Math.round(toNumber(value, 0) * 100) / 100;
}

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

export function calculateUnitCost(purchaseTotalCost, purchaseQuantity) {
  const total = toNumber(purchaseTotalCost, 0);
  const quantity = toNumber(purchaseQuantity, 0);
  if (total <= 0 || quantity <= 0) return 0;
  return roundCost(total / quantity);
}

export function calculateWeightedAverageCost(existingStock, existingUnitCost, newQuantity, newUnitCost) {
  const currentStock = toNumber(existingStock, 0);
  const currentUnitCost = toNumber(existingUnitCost, 0);
  const incomingQuantity = toNumber(newQuantity, 0);
  const incomingUnitCost = toNumber(newUnitCost, 0);

  const totalQuantity = currentStock + incomingQuantity;
  if (totalQuantity <= 0) return 0;

  const weightedTotal = (currentStock * currentUnitCost) + (incomingQuantity * incomingUnitCost);
  return roundCost(weightedTotal / totalQuantity);
}

export function calculateAmortizedCost(totalCost, estimatedUses) {
  const cost = toNumber(totalCost, 0);
  const uses = toNumber(estimatedUses, 0);
  if (cost <= 0 || uses <= 0) return 0;
  return roundCost(cost / uses);
}

export function calculateSterilizationCostPerPack(totalBatchCost, packsCount) {
  const cost = toNumber(totalBatchCost, 0);
  const packs = toNumber(packsCount, 0);
  if (cost <= 0 || packs <= 0) return 0;
  return roundCost(cost / packs);
}

function normalizeItemUsage(usageItem = {}) {
  return {
    itemId: usageItem.itemId ?? '',
    quantity: toNumber(usageItem.quantity, 0),
    editableAtPatientLevel: Boolean(usageItem.editableAtPatientLevel),
    unitCostAtTime:
      usageItem.unitCostAtTime == null ? null : roundCost(usageItem.unitCostAtTime),
    totalCostAtTime:
      usageItem.totalCostAtTime == null ? null : roundCost(usageItem.totalCostAtTime),
    note: usageItem.note ?? '',
  };
}

function resolveCatalogItem(catalog = [], itemId) {
  return catalog.find((item) => item?.id === itemId) ?? null;
}

function calculateUsageLine(usageItem, catalog = []) {
  const quantity = toNumber(usageItem.quantity, 0);
  const catalogItem = resolveCatalogItem(catalog, usageItem.itemId);
  const purchaseQuantity = catalogItem ? toNumber(catalogItem.purchaseQuantity ?? 0, 0) : 0;
  const purchaseTotalCost = catalogItem ? toNumber(catalogItem.purchaseTotalCost ?? 0, 0) : 0;
  const unitCost = usageItem.unitCostAtTime != null
    ? toNumber(usageItem.unitCostAtTime, 0)
    : catalogItem
      ? toNumber(catalogItem.unitCost ?? catalogItem.purchaseUnitCost ?? 0, 0)
      : 0;
  const totalCost = usageItem.totalCostAtTime != null
    ? toNumber(usageItem.totalCostAtTime, 0)
    : roundMoney(quantity * unitCost);

  return {
    itemId: usageItem.itemId ?? '',
    itemName: catalogItem?.name ?? usageItem.itemName ?? 'Sin nombre',
    category: catalogItem?.category ?? usageItem.category ?? '',
    itemType: catalogItem?.itemType ?? usageItem.itemType ?? 'consumable',
    unit: catalogItem?.unit ?? usageItem.unit ?? 'unidad',
    purchaseQuantity,
    purchaseTotalCost,
    quantity,
    unitCostAtTime: roundCost(unitCost),
    totalCostAtTime: roundMoney(totalCost),
    editableAtPatientLevel: Boolean(usageItem.editableAtPatientLevel),
    note: usageItem.note ?? '',
  };
}

export function calculateRecipeCost(recipe = {}, catalog = []) {
  const normalizedItems = Array.isArray(recipe.items) ? recipe.items.map(normalizeItemUsage) : [];
  const lines = normalizedItems.map((item) => calculateUsageLine(item, catalog));
  const totalCost = roundMoney(lines.reduce((sum, line) => sum + line.totalCostAtTime, 0));

  return {
    recipeId: recipe.id ?? '',
    recipeName: recipe.name ?? '',
    treatmentId: recipe.treatmentId ?? '',
    includesBaseDisposablePack: Boolean(recipe.includesBaseDisposablePack),
    includesExamPack: Boolean(recipe.includesExamPack),
    lines,
    totalCost,
    missingItemIds: lines
      .filter((line) => line.itemName === 'Sin nombre')
      .map((line) => line.itemId)
      .filter(Boolean),
  };
}

export function calculatePatientSupplyUsageCost(patientUsageItems = [], catalog = []) {
  const lines = Array.isArray(patientUsageItems)
    ? patientUsageItems.map((item) => calculateUsageLine(normalizeItemUsage(item), catalog))
    : [];
  const totalCost = roundMoney(lines.reduce((sum, line) => sum + line.totalCostAtTime, 0));

  return {
    lines,
    totalCost,
  };
}

export function createSupplySnapshot({
  id,
  patientId,
  treatmentId,
  appointmentId = null,
  recipeId = null,
  recipeName = '',
  usageItems = [],
  catalog = [],
  notes = '',
  status = 'confirmed',
  source = 'manual',
  createdAt = new Date().toISOString(),
  updatedAt = createdAt,
} = {}) {
  const usage = calculatePatientSupplyUsageCost(usageItems, catalog);
  const snapshot = {
    id: id ?? `supply-snapshot-${patientId ?? 'patient'}-${treatmentId ?? 'treatment'}-${Date.now()}`,
    patientId: patientId ?? null,
    treatmentId: treatmentId ?? null,
    appointmentId,
    recipeId,
    recipeName,
    status,
    source,
    createdAt,
    updatedAt,
    items: cloneValue(usage.lines),
    totalSupplyCost: usage.totalCost,
    notes,
  };

  return cloneValue(snapshot);
}

export function checkLowStock(item = {}) {
  const currentStock = toNumber(item.currentStock, 0);
  const minimumStock = toNumber(item.minimumStock, 0);
  return currentStock <= minimumStock;
}

function buildRecipeMap(recipes = []) {
  return recipes.reduce((acc, recipe) => {
    if (!recipe?.treatmentId) return acc;
    acc[recipe.treatmentId] = recipe;
    return acc;
  }, {});
}

export function checkAgendaSupplyNeeds(appointments = [], recipes = [], catalog = []) {
  const recipeMap = Array.isArray(recipes) ? buildRecipeMap(recipes) : {};
  const lines = [];
  const totalsByItemId = new Map();
  const missingRecipeIds = [];

  (appointments ?? []).forEach((appointment) => {
    if (!appointment || appointment.status === 'cancelled') return;
    const recipe = recipeMap[appointment.treatmentId];
    if (!recipe) {
      if (appointment.treatmentId) missingRecipeIds.push(appointment.treatmentId);
      return;
    }

    const recipeCost = calculateRecipeCost(recipe, catalog);
    recipeCost.lines.forEach((line) => {
      const current = totalsByItemId.get(line.itemId) ?? {
        itemId: line.itemId,
        itemName: line.itemName,
        category: line.category,
        itemType: line.itemType,
        unit: line.unit,
        quantity: 0,
        totalCostAtTime: 0,
      };
      current.quantity += line.quantity;
      current.totalCostAtTime += line.totalCostAtTime;
      totalsByItemId.set(line.itemId, current);
    });

    lines.push({
      appointmentId: appointment.id ?? null,
      treatmentId: appointment.treatmentId,
      dateLabel: appointment.dateLabel ?? '',
      recipeId: recipe.id,
      recipeName: recipe.name ?? '',
      totalCost: recipeCost.totalCost,
    });
  });

  return {
    lines,
    totals: Array.from(totalsByItemId.values()),
    missingRecipeIds: [...new Set(missingRecipeIds)],
  };
}

export function applyPurchaseToStock(item = {}, purchaseEntry = {}) {
  const currentStock = toNumber(item.currentStock, 0);
  const minimumStock = toNumber(item.minimumStock, 0);
  const purchaseQuantity = toNumber(purchaseEntry.quantityPurchased, purchaseEntry.quantity ?? 0);
  const totalCost = toNumber(purchaseEntry.totalCost, 0);
  const purchaseUnitCost = purchaseEntry.unitCost != null
    ? toNumber(purchaseEntry.unitCost, 0)
    : calculateUnitCost(totalCost, purchaseQuantity);

  return {
    ...item,
    currentStock: currentStock + purchaseQuantity,
    minimumStock,
    unitCost: calculateWeightedAverageCost(currentStock, item.unitCost, purchaseQuantity, purchaseUnitCost),
    purchaseQuantity: item.purchaseQuantity ?? purchaseQuantity,
    purchaseTotalCost: totalCost,
  };
}
