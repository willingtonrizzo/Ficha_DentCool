export const PRICING_STATUS = {
  dangerous: 'Peligroso',
  low: 'Bajo',
  acceptable: 'Aceptable inicio',
  healthy: 'Sano',
  ideal: 'Ideal',
};

export const EXTERNAL_CLINICIAN_STATUS = {
  weak: 'No soporta boleta',
  tight: 'Ajustado',
  healthy: 'Sano con boleta',
  veryGood: 'Muy bueno',
};

export const DEFAULT_PRICING_SETTINGS = {
  boxHourlyCost: 10000,
  transportCostPerSession: 2000,
  paymentFeePercent: 3,
  taxPercent: 15.25,
  defaultSuppliesCost: 0,
  defaultMarketingCost: 5000,
  defaultAdminCost: 2000,
  defaultReservePercent: 5,
  monthlyAvailableObjective: 800000,
  initialMinimumMarginPercent: 40,
  healthyMarginPercent: 45,
  idealMarginPercent: 60,
  externalClinicianMinProfitPercent: 20,
  externalClinicianHealthyProfitPercent: 35,
};

export const DEFAULT_PRICING_TREATMENTS = [
  {
    id: 'evaluacion',
    name: 'Evaluacion',
    category: 'evaluacion',
    aliases: ['evaluacion preventiva', 'control implante', 'control'],
    basePrice: 20000,
    durationHours: 0.75,
    suppliesCost: 2000,
    marketingCost: 5000,
    adminCost: 2000,
    transportCost: 2000,
    paymentFeePercent: 3,
    reservePercent: 5,
    minPrice: 18000,
    healthyPrice: 22000,
    idealPrice: 28000,
    maxRecommendedDiscountPercent: 0,
    defaultLaborCost: 8000,
    active: true,
    notes: 'Usar como puerta de entrada. No forzar descuentos si ya es ticket bajo.',
  },
  {
    id: 'limpieza-standard',
    name: 'Limpieza standard',
    category: 'limpieza',
    aliases: ['limpieza simple', 'profilaxis'],
    basePrice: 45000,
    durationHours: 1,
    suppliesCost: 3500,
    marketingCost: 5000,
    adminCost: 2000,
    transportCost: 2000,
    paymentFeePercent: 3,
    reservePercent: 5,
    minPrice: 35000,
    healthyPrice: 45000,
    idealPrice: 50000,
    maxRecommendedDiscountPercent: 5,
    defaultLaborCost: 15000,
    active: true,
    notes: 'Tratamiento de entrada. Descuentos altos destruyen margen con rapidez.',
  },
  {
    id: 'limpieza-vip',
    name: 'Limpieza VIP',
    category: 'limpieza',
    aliases: ['limpieza vip + aeropulidor + fluor'],
    basePrice: 60000,
    durationHours: 1,
    suppliesCost: 6000,
    marketingCost: 5000,
    adminCost: 2000,
    transportCost: 2000,
    paymentFeePercent: 3,
    reservePercent: 5,
    minPrice: 45000,
    healthyPrice: 60000,
    idealPrice: 70000,
    maxRecommendedDiscountPercent: 10,
    defaultLaborCost: 18000,
    active: true,
    notes: 'Producto premium inicial con mejor espacio para captacion controlada.',
  },
  {
    id: 'blanqueamiento-consulta',
    name: 'Blanqueamiento en consulta',
    category: 'blanqueamiento',
    aliases: ['blanqueamiento'],
    basePrice: 120000,
    durationHours: 1.5,
    suppliesCost: 25000,
    marketingCost: 5000,
    adminCost: 2000,
    transportCost: 2000,
    paymentFeePercent: 3,
    reservePercent: 5,
    minPrice: 100000,
    healthyPrice: 130000,
    idealPrice: 150000,
    maxRecommendedDiscountPercent: 15,
    defaultLaborCost: 30000,
    active: true,
    notes: 'Mayor ticket. Soporta mejor descuentos moderados si la captacion esta controlada.',
  },
  {
    id: 'restauracion-simple',
    name: 'Restauracion simple',
    category: 'restauracion',
    aliases: ['restauracion'],
    basePrice: 60000,
    durationHours: 1.25,
    suppliesCost: 8000,
    marketingCost: 5000,
    adminCost: 2000,
    transportCost: 2000,
    paymentFeePercent: 3,
    reservePercent: 5,
    minPrice: 45000,
    healthyPrice: 60000,
    idealPrice: 75000,
    maxRecommendedDiscountPercent: 10,
    defaultLaborCost: 25000,
    active: true,
    notes: 'El tiempo clinico puede variar segun complejidad del caso.',
  },
  {
    id: 'sellantes',
    name: 'Sellantes',
    category: 'sellante',
    aliases: ['sellante'],
    basePrice: 45000,
    durationHours: 1,
    suppliesCost: 5000,
    marketingCost: 5000,
    adminCost: 2000,
    transportCost: 2000,
    paymentFeePercent: 3,
    reservePercent: 5,
    minPrice: 35000,
    healthyPrice: 45000,
    idealPrice: 55000,
    maxRecommendedDiscountPercent: 5,
    defaultLaborCost: 18000,
    active: true,
    notes: 'Preventivo. El ticket bajo exige cuidar descuentos y tiempos.',
  },
];

const DEFAULT_CATALOG_FINANCE_OVERRIDES = Object.fromEntries(
  DEFAULT_PRICING_TREATMENTS.map((item) => [
    item.id,
    {
      marketingCost: DEFAULT_PRICING_SETTINGS.defaultMarketingCost,
      adminCost: DEFAULT_PRICING_SETTINGS.defaultAdminCost,
      transportCost: DEFAULT_PRICING_SETTINGS.transportCostPerSession,
      paymentFeePercent: DEFAULT_PRICING_SETTINGS.paymentFeePercent,
      reservePercent: DEFAULT_PRICING_SETTINGS.defaultReservePercent,
    },
  ])
);

const HUMAN_MONTHS = {
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

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeText(value) {
  return (value ?? '')
    .toString()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function slugify(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildTreatmentFilterKey(idValue, nameValue) {
  return slugify(idValue || nameValue || 'sin-tratamiento');
}

function roundCurrency(value) {
  return Math.round(toNumber(value, 0));
}

function roundPercent(value) {
  return Math.round(toNumber(value, 0) * 100) / 100;
}

function createMoneyPercentLine(label, amount, finalPrice) {
  const safeAmount = roundCurrency(amount);
  return {
    label,
    amount: safeAmount,
    percentOfFinalPrice: finalPrice > 0 ? roundPercent((safeAmount / finalPrice) * 100) : 0,
  };
}

function uniqueMessages(items) {
  return [...new Set(items.filter(Boolean))];
}

function escapeCsvValue(value) {
  const text = `${value ?? ''}`.replace(/"/g, '""');
  return `"${text}"`;
}

function buildCsv(rows) {
  return rows
    .map((row) => row.map((value) => escapeCsvValue(value)).join(','))
    .join('\n');
}

export const ACCEPTED_SNAPSHOTS_REPORT_COLUMNS = [
  { key: 'patientId', label: 'patientId' },
  { key: 'patientName', label: 'patientName' },
  { key: 'treatmentId', label: 'treatmentId' },
  { key: 'treatmentNameSnapshot', label: 'treatmentName' },
  { key: 'status', label: 'status' },
  { key: 'acceptedAt', label: 'acceptedAt' },
  { key: 'finalPrice', label: 'finalPrice' },
  { key: 'availableBeforeLabor', label: 'availableBeforeLabor' },
  { key: 'clinicProfit', label: 'clinicProfit' },
  { key: 'pricingStatus', label: 'pricingStatus' },
  { key: 'externalClinicianStatus', label: 'externalClinicianStatus' },
];

export const FINANCE_SUMMARY_REPORT_COLUMNS = [
  { key: 'period', label: 'period' },
  { key: 'acceptedCount', label: 'acceptedCount' },
  { key: 'finalPrice', label: 'finalPrice' },
  { key: 'availableBeforeLabor', label: 'availableBeforeLabor' },
  { key: 'clinicProfit', label: 'clinicProfit' },
  { key: 'objectiveAmount', label: 'objectiveAmount' },
  { key: 'objectiveProgressPercent', label: 'objectiveProgressPercent' },
];

export function createPricingSettings(input = {}) {
  return {
    boxHourlyCost: toNumber(input.boxHourlyCost, DEFAULT_PRICING_SETTINGS.boxHourlyCost),
    transportCostPerSession: toNumber(input.transportCostPerSession, DEFAULT_PRICING_SETTINGS.transportCostPerSession),
    paymentFeePercent: toNumber(input.paymentFeePercent, DEFAULT_PRICING_SETTINGS.paymentFeePercent),
    taxPercent: toNumber(input.taxPercent, DEFAULT_PRICING_SETTINGS.taxPercent),
    defaultSuppliesCost: toNumber(input.defaultSuppliesCost, DEFAULT_PRICING_SETTINGS.defaultSuppliesCost),
    defaultMarketingCost: toNumber(input.defaultMarketingCost, DEFAULT_PRICING_SETTINGS.defaultMarketingCost),
    defaultAdminCost: toNumber(input.defaultAdminCost, DEFAULT_PRICING_SETTINGS.defaultAdminCost),
    defaultReservePercent: toNumber(input.defaultReservePercent, DEFAULT_PRICING_SETTINGS.defaultReservePercent),
    monthlyAvailableObjective: toNumber(input.monthlyAvailableObjective, DEFAULT_PRICING_SETTINGS.monthlyAvailableObjective),
    initialMinimumMarginPercent: toNumber(input.initialMinimumMarginPercent, DEFAULT_PRICING_SETTINGS.initialMinimumMarginPercent),
    healthyMarginPercent: toNumber(input.healthyMarginPercent, DEFAULT_PRICING_SETTINGS.healthyMarginPercent),
    idealMarginPercent: toNumber(input.idealMarginPercent, DEFAULT_PRICING_SETTINGS.idealMarginPercent),
    externalClinicianMinProfitPercent: toNumber(
      input.externalClinicianMinProfitPercent,
      DEFAULT_PRICING_SETTINGS.externalClinicianMinProfitPercent
    ),
    externalClinicianHealthyProfitPercent: toNumber(
      input.externalClinicianHealthyProfitPercent,
      DEFAULT_PRICING_SETTINGS.externalClinicianHealthyProfitPercent
    ),
  };
}

export function createPricingTreatment(input = {}) {
  const name = input.name ?? 'Tratamiento';
  const aliases = Array.isArray(input.aliases)
    ? input.aliases.filter(Boolean)
    : typeof input.aliases === 'string'
      ? input.aliases.split(',').map((item) => item.trim()).filter(Boolean)
      : [];
  const seedDefaults = DEFAULT_CATALOG_FINANCE_OVERRIDES[input.id] ?? null;
  const isSeedCatalogItem = Boolean(seedDefaults) && input.pricingSource !== 'custom';

  return {
    id: input.id ?? `pricing-${slugify(name) || 'treatment'}`,
    name,
    category: input.category ?? 'otro',
    aliases,
    basePrice: toNumber(input.basePrice, 0),
    durationHours: toNumber(input.durationHours, 1),
    suppliesCost: toNumber(input.suppliesCost, 0),
    marketingCost: toNumber(
      input.marketingCost,
      seedDefaults?.marketingCost ?? DEFAULT_PRICING_SETTINGS.defaultMarketingCost
    ),
    adminCost: toNumber(input.adminCost, seedDefaults?.adminCost ?? DEFAULT_PRICING_SETTINGS.defaultAdminCost),
    transportCost: toNumber(
      input.transportCost,
      seedDefaults?.transportCost ?? DEFAULT_PRICING_SETTINGS.transportCostPerSession
    ),
    paymentFeePercent: toNumber(
      input.paymentFeePercent,
      seedDefaults?.paymentFeePercent ?? DEFAULT_PRICING_SETTINGS.paymentFeePercent
    ),
    reservePercent: toNumber(
      input.reservePercent,
      seedDefaults?.reservePercent ?? DEFAULT_PRICING_SETTINGS.defaultReservePercent
    ),
    minPrice: toNumber(input.minPrice, 0),
    healthyPrice: toNumber(input.healthyPrice, 0),
    idealPrice: toNumber(input.idealPrice, 0),
    maxRecommendedDiscountPercent: toNumber(input.maxRecommendedDiscountPercent, 0),
    defaultLaborCost: toNumber(input.defaultLaborCost, 0),
    defaultLaborPercent: input.defaultLaborPercent == null ? null : toNumber(input.defaultLaborPercent, 0),
    active: input.active !== false,
    notes: input.notes ?? '',
    pricingSource: input.pricingSource ?? (isSeedCatalogItem ? 'seed' : 'custom'),
  };
}

export function createPricingCatalog(items = DEFAULT_PRICING_TREATMENTS) {
  return items.map((item) => createPricingTreatment(item));
}

export function createEmptyPricingTreatment(index = 0) {
  return createPricingTreatment({
    id: `pricing-custom-${index + 1}`,
    name: 'Nuevo tratamiento',
    category: 'otro',
    aliases: [],
    basePrice: 0,
    durationHours: 1,
    suppliesCost: 0,
    marketingCost: DEFAULT_PRICING_SETTINGS.defaultMarketingCost,
    adminCost: DEFAULT_PRICING_SETTINGS.defaultAdminCost,
    transportCost: DEFAULT_PRICING_SETTINGS.transportCostPerSession,
    paymentFeePercent: DEFAULT_PRICING_SETTINGS.paymentFeePercent,
    reservePercent: DEFAULT_PRICING_SETTINGS.defaultReservePercent,
    minPrice: 0,
    healthyPrice: 0,
    idealPrice: 0,
    maxRecommendedDiscountPercent: 0,
    defaultLaborCost: 0,
    defaultLaborPercent: null,
    active: true,
    notes: '',
    pricingSource: 'custom',
  });
}

export function getPricingStatus(marginPercent) {
  if (marginPercent < 35) return PRICING_STATUS.dangerous;
  if (marginPercent < 40) return PRICING_STATUS.low;
  if (marginPercent < 45) return PRICING_STATUS.acceptable;
  if (marginPercent < 60) return PRICING_STATUS.healthy;
  return PRICING_STATUS.ideal;
}

export function getExternalClinicianStatus(clinicProfitPercent) {
  if (clinicProfitPercent < 10) return EXTERNAL_CLINICIAN_STATUS.weak;
  if (clinicProfitPercent < 20) return EXTERNAL_CLINICIAN_STATUS.tight;
  if (clinicProfitPercent <= 35) return EXTERNAL_CLINICIAN_STATUS.healthy;
  return EXTERNAL_CLINICIAN_STATUS.veryGood;
}

export function calculateRecommendedPrice({
  fixedCostPerTreatment,
  variablePercentOfPrice,
  targetMarginPercent,
}) {
  const denominator = 1 - targetMarginPercent / 100 - variablePercentOfPrice / 100;

  if (denominator <= 0) {
    return null;
  }

  return roundCurrency(fixedCostPerTreatment / denominator);
}

export function findPricingTreatmentForProcedure(procedure, catalog = DEFAULT_PRICING_TREATMENTS) {
  const normalizedProcedure = normalizeText(procedure);
  if (!normalizedProcedure) return null;

  return createPricingCatalog(catalog).find((item) => {
    const candidates = [item.id, item.name, ...(item.aliases ?? [])].map((value) => normalizeText(value));
    return candidates.some(
      (candidate) =>
        candidate &&
        (normalizedProcedure === candidate ||
          normalizedProcedure.includes(candidate) ||
          candidate.includes(normalizedProcedure))
    );
  }) ?? null;
}

export function calculatePricingResult({
  treatment,
  settings = DEFAULT_PRICING_SETTINGS,
  input = {},
}) {
  const safeSettings = createPricingSettings(settings);
  const safeTreatment = createPricingTreatment(treatment);

  const listPrice = roundCurrency(input.customPrice ?? safeTreatment.basePrice);
  const discountEnabled = Boolean(input.discountEnabled);
  const discountPercent = discountEnabled ? toNumber(input.discountPercent, 0) : 0;
  const discountAmount = roundCurrency(discountEnabled ? listPrice * (discountPercent / 100) : 0);
  const finalPrice = roundCurrency(Math.max(0, listPrice - discountAmount));

  const durationHours = toNumber(input.customDurationHours, safeTreatment.durationHours);
  const suppliesCost = roundCurrency(
    input.customSuppliesCost ?? (safeTreatment.suppliesCost > 0 ? safeTreatment.suppliesCost : safeSettings.defaultSuppliesCost)
  );
  const marketingCost = roundCurrency(
    input.customMarketingCost ?? (safeTreatment.marketingCost > 0 ? safeTreatment.marketingCost : safeSettings.defaultMarketingCost)
  );
  const adminCost = roundCurrency(
    input.customAdminCost ?? (safeTreatment.adminCost > 0 ? safeTreatment.adminCost : safeSettings.defaultAdminCost)
  );
  const transportCost = roundCurrency(
    input.customTransportCost ?? (safeTreatment.transportCost > 0 ? safeTreatment.transportCost : safeSettings.transportCostPerSession)
  );

  const applyPaymentFee = input.applyPaymentFee ?? input.paymentMethod === 'card';
  const applyTax = input.applyTax ?? true;
  const applyReserve = input.applyReserve ?? true;
  const paymentFeePercent = toNumber(
    input.customPaymentFeePercent ?? (safeTreatment.paymentFeePercent ?? safeSettings.paymentFeePercent),
    safeSettings.paymentFeePercent
  );

  const boxCost = roundCurrency(durationHours * safeSettings.boxHourlyCost);
  const paymentFeeAmount = roundCurrency(applyPaymentFee ? finalPrice * (paymentFeePercent / 100) : 0);
  const reservePercent = toNumber(
    input.customReservePercent ?? (safeTreatment.reservePercent ?? safeSettings.defaultReservePercent),
    safeSettings.defaultReservePercent
  );
  const reserveAmount = roundCurrency(applyReserve ? finalPrice * (reservePercent / 100) : 0);
  const taxAmount = roundCurrency(applyTax ? finalPrice * (safeSettings.taxPercent / 100) : 0);

  const totalCostsBeforeLabor = roundCurrency(
    boxCost +
      suppliesCost +
      marketingCost +
      adminCost +
      transportCost +
      paymentFeeAmount +
      reserveAmount +
      taxAmount
  );

  const availableBeforeLabor = roundCurrency(finalPrice - totalCostsBeforeLabor);
  const availableBeforeLaborPercent = finalPrice > 0 ? roundPercent((availableBeforeLabor / finalPrice) * 100) : 0;

  const laborCostMode = input.laborCostMode ?? 'fixed';
  const laborCostValue =
    input.laborCostValue ??
    (safeTreatment.defaultLaborPercent != null ? safeTreatment.defaultLaborPercent : safeTreatment.defaultLaborCost);
  const laborCost = roundCurrency(
    laborCostMode === 'percent' ? finalPrice * (toNumber(laborCostValue, 0) / 100) : laborCostValue
  );
  const laborCostPercent = finalPrice > 0 ? roundPercent((laborCost / finalPrice) * 100) : 0;

  const clinicProfit = roundCurrency(availableBeforeLabor - laborCost);
  const clinicProfitPercent = finalPrice > 0 ? roundPercent((clinicProfit / finalPrice) * 100) : 0;

  const fixedCostPerTreatment = roundCurrency(boxCost + suppliesCost + marketingCost + adminCost + transportCost);
  const variablePercentOfPrice =
    (applyPaymentFee ? paymentFeePercent : 0) +
    (applyReserve ? reservePercent : 0) +
    (applyTax ? safeSettings.taxPercent : 0);

  const recommendedPriceFor40 = calculateRecommendedPrice({
    fixedCostPerTreatment,
    variablePercentOfPrice,
    targetMarginPercent: 40,
  });
  const recommendedPriceFor45 = calculateRecommendedPrice({
    fixedCostPerTreatment,
    variablePercentOfPrice,
    targetMarginPercent: 45,
  });
  const recommendedPriceFor50 = calculateRecommendedPrice({
    fixedCostPerTreatment,
    variablePercentOfPrice,
    targetMarginPercent: 50,
  });
  const recommendedPriceFor60 = calculateRecommendedPrice({
    fixedCostPerTreatment,
    variablePercentOfPrice,
    targetMarginPercent: 60,
  });

  const warnings = [];
  if (finalPrice < safeTreatment.minPrice) {
    warnings.push('El precio final quedo bajo el minimo sugerido para este tratamiento.');
  }
  if (discountEnabled && discountPercent > safeTreatment.maxRecommendedDiscountPercent) {
    warnings.push('El descuento supera el maximo recomendado para este tratamiento.');
  }
  if (availableBeforeLaborPercent < safeSettings.initialMinimumMarginPercent) {
    warnings.push('El margen disponible esta bajo 40%. Puede ser peligroso salvo promocion puntual.');
  } else if (availableBeforeLaborPercent < safeSettings.healthyMarginPercent) {
    warnings.push('El margen disponible esta en zona aceptable solo para inicio o captacion.');
  }
  if (clinicProfitPercent < safeSettings.externalClinicianMinProfitPercent) {
    warnings.push('La utilidad clinica no soporta bien una odontologa externa con boleta.');
  }
  if (recommendedPriceFor45 != null && recommendedPriceFor45 > listPrice) {
    warnings.push('El precio lista actual queda corto frente al precio sugerido para margen sano.');
  }
  if (!applyPaymentFee) {
    warnings.push('La comision de pago esta desactivada. El calculo es parcial si el paciente paga con tarjeta.');
  }
  if (!applyTax) {
    warnings.push('El impuesto o retencion esta desactivado. El calculo es parcial.');
  }
  if (!applyReserve) {
    warnings.push('La reserva operativa esta desactivada. El calculo es mas optimista de lo real.');
  }

  const recommendations = [];
  if (discountEnabled && discountPercent > 0) {
    recommendations.push('Revisa si el descuento puede bajarse antes de tocar el precio base.');
  }
  if (availableBeforeLaborPercent < safeSettings.healthyMarginPercent) {
    recommendations.push('Sube precio o acorta tiempo de box para acercarte al rango sano.');
  }
  if (marketingCost > safeSettings.defaultMarketingCost) {
    recommendations.push('Controla el costo de captacion por paciente para recuperar margen.');
  }
  if (clinicProfitPercent < safeSettings.externalClinicianMinProfitPercent) {
    recommendations.push('Usa este precio solo como entrada o lanzamiento si aun no soporta reemplazo clinico.');
  }
  if (safeTreatment.notes) {
    recommendations.push(safeTreatment.notes);
  }

  return {
    treatmentId: safeTreatment.id,
    supplySnapshotId: input.supplySnapshotId ?? null,
    listPrice,
    discountAmount,
    finalPrice,
    lines: [
      createMoneyPercentLine('Precio final paciente', finalPrice, finalPrice),
      createMoneyPercentLine('Box', boxCost, finalPrice),
      createMoneyPercentLine('Insumos', suppliesCost, finalPrice),
      createMoneyPercentLine('Marketing', marketingCost, finalPrice),
      createMoneyPercentLine('Administracion', adminCost, finalPrice),
      createMoneyPercentLine('Traslado', transportCost, finalPrice),
      createMoneyPercentLine('Comision', paymentFeeAmount, finalPrice),
      createMoneyPercentLine('Reserva', reserveAmount, finalPrice),
      createMoneyPercentLine('Impuesto o retencion', taxAmount, finalPrice),
      createMoneyPercentLine('Disponible profesional + clinica', availableBeforeLabor, finalPrice),
    ],
    boxCost,
    suppliesCost,
    marketingCost,
    adminCost,
    transportCost,
    paymentFeeAmount,
    reserveAmount,
    taxAmount,
    totalCostsBeforeLabor,
    availableBeforeLabor,
    availableBeforeLaborPercent,
    laborCost,
    laborCostPercent,
    clinicProfit,
    clinicProfitPercent,
    pricingStatus: getPricingStatus(availableBeforeLaborPercent),
    externalClinicianStatus: getExternalClinicianStatus(clinicProfitPercent),
    warnings: uniqueMessages(warnings),
    recommendations: uniqueMessages(recommendations),
    recommendedPriceFor40,
    recommendedPriceFor45,
    recommendedPriceFor50,
    recommendedPriceFor60,
  };
}

export function createPatientPricingBudget(input = {}) {
  const snapshot = input.calculationSnapshot ? cloneValue(input.calculationSnapshot) : null;
  return {
    id: input.id ?? 'budget-snapshot',
    patientId: input.patientId ?? null,
    treatmentId: input.treatmentId ?? null,
    treatmentNameSnapshot: input.treatmentNameSnapshot ?? '',
    status: input.status ?? 'draft',
    calculationSnapshot: snapshot,
    notes: input.notes ?? '',
    createdAt: input.createdAt ?? null,
    updatedAt: input.updatedAt ?? null,
    sentAt: input.sentAt ?? null,
    acceptedAt: input.acceptedAt ?? null,
    rejectedAt: input.rejectedAt ?? null,
    expiredAt: input.expiredAt ?? null,
  };
}

function getSnapshotDate(snapshot) {
  const source = snapshot.acceptedAt ?? snapshot.updatedAt ?? snapshot.createdAt ?? null;
  if (!source) return null;
  const parsed = new Date(source);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfWeek(date) {
  const next = startOfDay(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function resolveRangeStart(range, now) {
  if (range === 'today') return startOfDay(now);
  if (range === 'week') return startOfWeek(now);
  if (range === 'month') return startOfMonth(now);
  return null;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function parseHumanDateLabel(value) {
  const match = normalizeText(value).match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = HUMAN_MONTHS[match[2]];
  const year = Number(match[3]);

  if (!Number.isInteger(day) || !Number.isInteger(year) || month == null) {
    return null;
  }

  const date = new Date(year, month, day);
  return Number.isNaN(date.getTime()) ? null : startOfDay(date);
}

function parseDashedDateLabel(value) {
  const match = `${value ?? ''}`.trim().match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]) - 1;
  const year = Number(match[3]);
  const date = new Date(year, month, day);
  return Number.isNaN(date.getTime()) ? null : startOfDay(date);
}

function parseOperationalDate(value) {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : startOfDay(value);
  }

  const iso = new Date(value);
  if (!Number.isNaN(iso.getTime())) {
    return startOfDay(iso);
  }

  return parseDashedDateLabel(value) ?? parseHumanDateLabel(value);
}

function buildAggregateRows(entries, keyField, labelField) {
  const aggregateMap = new Map();

  entries.forEach((entry) => {
    const key = entry[keyField] ?? 'sin-clave';
    const label = entry[labelField] ?? 'Sin dato';
    const current = aggregateMap.get(key) ?? {
      key,
      label,
      count: 0,
      finalPrice: 0,
      availableBeforeLabor: 0,
      clinicProfit: 0,
    };

    current.count += 1;
    current.finalPrice += entry.calculationSnapshot?.finalPrice ?? 0;
    current.availableBeforeLabor += entry.calculationSnapshot?.availableBeforeLabor ?? 0;
    current.clinicProfit += entry.calculationSnapshot?.clinicProfit ?? 0;
    aggregateMap.set(key, current);
  });

  return [...aggregateMap.values()]
    .map((item) => ({
      ...item,
      finalPrice: roundCurrency(item.finalPrice),
      availableBeforeLabor: roundCurrency(item.availableBeforeLabor),
      clinicProfit: roundCurrency(item.clinicProfit),
    }))
    .sort((a, b) => b.availableBeforeLabor - a.availableBeforeLabor);
}

function buildComparison(range, entries, now, objectiveAmount) {
  let currentStart;
  let previousStart;
  let previousEnd;
  let label;

  if (range === 'today') {
    currentStart = startOfDay(now);
    previousStart = addDays(currentStart, -1);
    previousEnd = currentStart;
    label = 'Hoy vs ayer';
  } else if (range === 'week') {
    currentStart = startOfWeek(now);
    previousStart = addDays(currentStart, -7);
    previousEnd = currentStart;
    label = 'Semana actual vs anterior';
  } else {
    currentStart = startOfMonth(now);
    previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    previousEnd = currentStart;
    label = range === 'month' ? 'Mes actual vs anterior' : 'Mes actual vs anterior';
  }

  const currentEntries = entries.filter((item) => item.snapshotDate && item.snapshotDate >= currentStart);
  const previousEntries = entries.filter(
    (item) => item.snapshotDate && item.snapshotDate >= previousStart && item.snapshotDate < previousEnd
  );

  const current = buildPeriodSummary(currentEntries, objectiveAmount);
  const previous = buildPeriodSummary(previousEntries, objectiveAmount);
  const difference = roundCurrency(current.availableBeforeLabor - previous.availableBeforeLabor);
  const differencePercent =
    previous.availableBeforeLabor > 0
      ? roundPercent((difference / previous.availableBeforeLabor) * 100)
      : current.availableBeforeLabor > 0
        ? 100
        : 0;

  return {
    label,
    current,
    previous,
    difference,
    differencePercent,
  };
}

function buildPeriodSummary(entries, objectiveAmount) {
  const acceptedCount = entries.length;
  const finalPrice = roundCurrency(entries.reduce((sum, item) => sum + (item.calculationSnapshot?.finalPrice ?? 0), 0));
  const availableBeforeLabor = roundCurrency(entries.reduce((sum, item) => sum + (item.calculationSnapshot?.availableBeforeLabor ?? 0), 0));
  const clinicProfit = roundCurrency(entries.reduce((sum, item) => sum + (item.calculationSnapshot?.clinicProfit ?? 0), 0));
  const objectiveProgressPercent = objectiveAmount > 0 ? roundPercent((availableBeforeLabor / objectiveAmount) * 100) : 0;

  return {
    acceptedCount,
    finalPrice,
    availableBeforeLabor,
    clinicProfit,
    objectiveAmount,
    objectiveProgressPercent,
  };
}

export function flattenPricingBudgetsByPatient(recordsByPatient = {}, patients = []) {
  const patientNameById = new Map(
    patients.map((patient) => [patient.id, patient.fullName ?? patient.name ?? 'Paciente'])
  );

  return Object.entries(recordsByPatient).flatMap(([patientId, record]) =>
    (record?.pricingBudgets ?? []).map((snapshot) => ({
      ...snapshot,
      patientId,
      patientName: patientNameById.get(patientId) ?? 'Paciente',
    }))
  );
}

export function flattenTreatmentsByPatient(recordsByPatient = {}, patients = []) {
  const patientNameById = new Map(
    patients.map((patient) => [patient.id, patient.fullName ?? patient.name ?? 'Paciente'])
  );

  const paymentTotalsByTreatment = new Map();

  Object.values(recordsByPatient).forEach((record) => {
    (record?.paymentEntries ?? []).forEach((payment) => {
      if (!payment?.treatmentId) return;
      paymentTotalsByTreatment.set(
        payment.treatmentId,
        roundCurrency((paymentTotalsByTreatment.get(payment.treatmentId) ?? 0) + toNumber(payment.amount, 0))
      );
    });
  });

  return Object.entries(recordsByPatient).flatMap(([patientId, record]) =>
    (record?.treatments ?? []).map((treatment) => {
      const paidFromPayments = paymentTotalsByTreatment.get(treatment.id);
      const paid = paidFromPayments != null ? paidFromPayments : toNumber(treatment.paid, 0);
      return {
        ...treatment,
        paid,
        patientId,
        patientName: patientNameById.get(patientId) ?? 'Paciente',
        treatmentFilterKey: buildTreatmentFilterKey('', treatment.procedure || treatment.id),
        treatmentDate: parseOperationalDate(treatment.dateLabel),
        coverageAmount: roundCurrency((toNumber(treatment.cost, 0) * toNumber(treatment.coveragePercent, 0)) / 100),
        pendingBalance: roundCurrency(
          toNumber(treatment.cost, 0) -
          paid -
          (toNumber(treatment.cost, 0) * toNumber(treatment.coveragePercent, 0)) / 100
        ),
      };
    })
  );
}

export function flattenAppointmentsByPatient(recordsByPatient = {}, patients = []) {
  const patientById = new Map(patients.map((patient) => [patient.id, patient]));

  return Object.entries(recordsByPatient).flatMap(([patientId, record]) => {
    const patient = patientById.get(patientId);
    const storedAppointments = Array.isArray(record?.appointments) ? record.appointments : [];
    const appointments = storedAppointments.length > 0
      ? storedAppointments
      : patient?.nextVisit && patient.nextVisit !== 'Sin cita' && patient.nextVisit !== 'Sin agendar'
        ? [{
            id: `legacy-appointment-${patientId}`,
            patientId,
            dateLabel: patient.nextVisit,
            reason: 'Seguimiento clinico',
            clinician: '',
            status: 'scheduled',
            notes: '',
          }]
        : [];

    return appointments
      .map((appointment) => {
        const dateLabel = appointment.dateLabel ?? '';
        const visitDate = parseOperationalDate(dateLabel);
        return {
          id: appointment.id ?? `appointment-${patientId}`,
          patientId,
          patientName: patient?.fullName ?? patient?.name ?? 'Paciente',
          recordNumber: patient?.recordNumber ?? '',
          dateLabel,
          timeLabel: appointment.timeLabel ?? '',
          reason: appointment.reason ?? '',
          clinician: appointment.clinician ?? '',
          status: appointment.status ?? 'scheduled',
          notes: appointment.notes ?? '',
          visitDate,
        };
      })
      .filter((item) => item.visitDate && item.dateLabel && item.status !== 'cancelled');
  }).sort((a, b) => a.visitDate.getTime() - b.visitDate.getTime());
}

export function flattenPaymentsByPatient(recordsByPatient = {}, patients = []) {
  const patientNameById = new Map(
    patients.map((patient) => [patient.id, patient.fullName ?? patient.name ?? 'Paciente'])
  );

  return Object.entries(recordsByPatient).flatMap(([patientId, record]) => {
    const explicitPayments = Array.isArray(record?.paymentEntries) ? record.paymentEntries : [];
    const legacyPayments = explicitPayments.length > 0
      ? []
      : (record?.treatments ?? [])
          .filter((treatment) => toNumber(treatment.paid, 0) > 0)
          .map((treatment, index) => ({
            id: `legacy-payment-${patientId}-${treatment.id ?? index + 1}`,
            patientId,
            treatmentId: treatment.id ?? null,
            dateLabel: treatment.dateLabel ?? '',
            amount: toNumber(treatment.paid, 0),
            method: 'other',
            concept: treatment.procedure ?? 'Abono legado',
            notes: 'Migrado desde treatment.paid',
            status: 'received',
          }));

    return [...explicitPayments, ...legacyPayments].map((payment) => ({
      ...payment,
      patientId,
      patientName: patientNameById.get(patientId) ?? 'Paciente',
      paymentDate: parseOperationalDate(payment.dateLabel),
      amount: roundCurrency(payment.amount),
    }));
  });
}

function buildOperationalSummary(treatments = [], appointments = [], paymentEntries = [], now = new Date()) {
  const today = startOfDay(now);
  const nextWeek = addDays(today, 7);
  const totalTreatmentValue = roundCurrency(treatments.reduce((sum, item) => sum + toNumber(item.cost, 0), 0));
  const totalCollected = roundCurrency(paymentEntries.reduce((sum, item) => sum + toNumber(item.amount, 0), 0));
  const totalCoverage = roundCurrency(treatments.reduce((sum, item) => sum + toNumber(item.coverageAmount, 0), 0));
  const totalPendingBalance = roundCurrency(
    treatments.reduce((sum, item) => sum + Math.max(0, toNumber(item.pendingBalance, 0)), 0)
  );
  const plannedValue = roundCurrency(
    treatments
      .filter((item) => item.status === 'planned')
      .reduce((sum, item) => sum + toNumber(item.cost, 0), 0)
  );
  const inProgressValue = roundCurrency(
    treatments
      .filter((item) => item.status === 'in_progress')
      .reduce((sum, item) => sum + toNumber(item.cost, 0), 0)
  );
  const completedValue = roundCurrency(
    treatments
      .filter((item) => item.status === 'completed')
      .reduce((sum, item) => sum + toNumber(item.cost, 0), 0)
  );
  const patientsWithBalance = new Set(
    treatments.filter((item) => Math.max(0, toNumber(item.pendingBalance, 0)) > 0).map((item) => item.patientId)
  ).size;
  const appointmentsNext7Days = appointments.filter(
    (item) => item.visitDate && item.visitDate >= today && item.visitDate <= nextWeek
  ).length;
  const collectionRatePercent =
    totalTreatmentValue > 0 ? roundPercent(((totalCollected + totalCoverage) / totalTreatmentValue) * 100) : 0;

  return {
    totalTreatmentValue,
    totalCollected,
    totalCoverage,
    totalPendingBalance,
    plannedValue,
    inProgressValue,
    completedValue,
    plannedCount: treatments.filter((item) => item.status === 'planned').length,
    inProgressCount: treatments.filter((item) => item.status === 'in_progress').length,
    completedCount: treatments.filter((item) => item.status === 'completed').length,
    upcomingAppointmentsCount: appointments.length,
    appointmentsNext7Days,
    patientsWithBalance,
    collectionRatePercent,
  };
}

function buildPendingCollectionRows(treatments = []) {
  const collectionMap = new Map();

  treatments
    .filter((item) => Math.max(0, toNumber(item.pendingBalance, 0)) > 0)
    .forEach((item) => {
      const current = collectionMap.get(item.patientId) ?? {
        key: item.patientId ?? 'sin-paciente',
        label: item.patientName ?? 'Paciente',
        pendingBalance: 0,
        treatmentCount: 0,
      };

      current.pendingBalance += Math.max(0, toNumber(item.pendingBalance, 0));
      current.treatmentCount += 1;
      collectionMap.set(item.patientId, current);
    });

  return [...collectionMap.values()]
    .map((item) => ({
      ...item,
      pendingBalance: roundCurrency(item.pendingBalance),
    }))
    .sort((a, b) => b.pendingBalance - a.pendingBalance)
    .slice(0, 6);
}

function buildOperationalTreatmentRows(treatments = [], now = new Date()) {
  const today = startOfDay(now);

  return treatments
    .filter((item) => item.status !== 'completed' || Math.max(0, toNumber(item.pendingBalance, 0)) > 0)
    .sort((a, b) => {
      const aTime = a.treatmentDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bTime = b.treatmentDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
      if (aTime !== bTime) return aTime - bTime;
      return Math.max(0, toNumber(b.pendingBalance, 0)) - Math.max(0, toNumber(a.pendingBalance, 0));
    })
    .slice(0, 8)
    .map((item) => ({
      ...item,
      isDelayed:
        item.treatmentDate != null &&
        item.treatmentDate < today &&
        item.status !== 'completed',
    }));
}

export function buildFinanceDashboard(recordsByPatient = {}, patients = [], objectiveSettings = {}, filters = {}) {
  const now = new Date();
  const range = filters.range ?? 'all';
  const status = filters.status ?? 'all';
  const patientId = filters.patientId ?? 'all';
  const treatmentId = filters.treatmentId ?? 'all';
  const rangeStart = resolveRangeStart(range, now);

  const allSnapshots = flattenPricingBudgetsByPatient(recordsByPatient, patients)
    .map((snapshot) => ({
      ...snapshot,
      snapshotDate: getSnapshotDate(snapshot),
      treatmentFilterKey: buildTreatmentFilterKey(snapshot.treatmentId, snapshot.treatmentNameSnapshot),
    }));
  const allPayments = flattenPaymentsByPatient(recordsByPatient, patients);
  const allTreatments = flattenTreatmentsByPatient(recordsByPatient, patients);
  const allAppointments = flattenAppointmentsByPatient(recordsByPatient, patients);

  const patientOptions = [...new Map(
    [
      ...allSnapshots.map((snapshot) => [snapshot.patientId, { value: snapshot.patientId, label: snapshot.patientName }]),
      ...allTreatments.map((treatment) => [treatment.patientId, { value: treatment.patientId, label: treatment.patientName }]),
      ...allAppointments.map((appointment) => [appointment.patientId, { value: appointment.patientId, label: appointment.patientName }]),
    ]
  ).values()].sort((a, b) => a.label.localeCompare(b.label));

  const treatmentOptions = [...new Map(
    [
      ...allSnapshots.map((snapshot) => [snapshot.treatmentFilterKey, {
        value: snapshot.treatmentFilterKey,
        label: snapshot.treatmentNameSnapshot || snapshot.treatmentId || 'Sin tratamiento',
      }]),
      ...allTreatments.map((treatment) => [treatment.treatmentFilterKey, {
        value: treatment.treatmentFilterKey,
        label: treatment.procedure || treatment.id || 'Sin tratamiento',
      }]),
    ]
  ).values()].sort((a, b) => a.label.localeCompare(b.label));

  const filteredSnapshots = allSnapshots
    .filter((snapshot) => {
      const snapshotMatchesStatus = status === 'all' ? true : snapshot.status === status;
      const snapshotMatchesPatient = patientId === 'all' ? true : snapshot.patientId === patientId;
      const snapshotMatchesTreatment =
        treatmentId === 'all'
          ? true
          : snapshot.treatmentFilterKey === treatmentId;
      const snapshotMatchesRange =
        rangeStart == null
          ? true
          : snapshot.snapshotDate != null && snapshot.snapshotDate >= rangeStart;

      return snapshotMatchesStatus && snapshotMatchesPatient && snapshotMatchesTreatment && snapshotMatchesRange;
    })
    .sort((a, b) => {
      const aTime = a.snapshotDate?.getTime() ?? 0;
      const bTime = b.snapshotDate?.getTime() ?? 0;
      return bTime - aTime;
    });

  const acceptedSnapshots = filteredSnapshots
    .filter((snapshot) => snapshot.status === 'accepted' && snapshot.snapshotDate)
    .sort((a, b) => b.snapshotDate.getTime() - a.snapshotDate.getTime());

  const comparableAcceptedSnapshots = allSnapshots
    .filter((snapshot) => {
      const snapshotMatchesPatient = patientId === 'all' ? true : snapshot.patientId === patientId;
      const snapshotMatchesTreatment =
        treatmentId === 'all'
          ? true
          : snapshot.treatmentFilterKey === treatmentId;
      return snapshot.status === 'accepted' && snapshot.snapshotDate && snapshotMatchesPatient && snapshotMatchesTreatment;
    })
    .sort((a, b) => b.snapshotDate.getTime() - a.snapshotDate.getTime());

  const filteredTreatments = allTreatments
    .filter((treatment) => {
      const treatmentMatchesPatient = patientId === 'all' ? true : treatment.patientId === patientId;
      const treatmentMatchesFilter = treatmentId === 'all' ? true : treatment.treatmentFilterKey === treatmentId;
      const treatmentMatchesRange =
        rangeStart == null
          ? true
          : treatment.treatmentDate != null && treatment.treatmentDate >= rangeStart;

      return treatmentMatchesPatient && treatmentMatchesFilter && treatmentMatchesRange;
    });

  const filteredAppointments = allAppointments.filter((appointment) => {
    const appointmentMatchesPatient = patientId === 'all' ? true : appointment.patientId === patientId;
    const appointmentMatchesRange =
      rangeStart == null
        ? true
        : appointment.visitDate != null && appointment.visitDate >= rangeStart;

    return appointmentMatchesPatient && appointmentMatchesRange;
  });

  const filteredPayments = allPayments.filter((payment) => {
    const paymentMatchesPatient = patientId === 'all' ? true : payment.patientId === patientId;
    const paymentMatchesRange =
      rangeStart == null
        ? true
        : payment.paymentDate != null && payment.paymentDate >= rangeStart;

    return paymentMatchesPatient && paymentMatchesRange;
  });

  const monthlyAvailableObjective = toNumber(objectiveSettings.monthlyAvailableObjective, 800000);
  const weeklyAvailableObjective = roundCurrency(monthlyAvailableObjective / 4);
  const dailyAvailableObjective = roundCurrency(monthlyAvailableObjective / 22);

  const dayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  const dayEntries = acceptedSnapshots.filter((item) => item.snapshotDate >= dayStart);
  const weekEntries = acceptedSnapshots.filter((item) => item.snapshotDate >= weekStart);
  const monthEntries = acceptedSnapshots.filter((item) => item.snapshotDate >= monthStart);

  const treatmentMap = new Map();
  acceptedSnapshots.forEach((snapshot) => {
    const key = snapshot.treatmentNameSnapshot || 'Sin tratamiento';
    const current = treatmentMap.get(key) ?? {
      treatmentName: key,
      count: 0,
      finalPrice: 0,
      availableBeforeLabor: 0,
      clinicProfit: 0,
    };

    current.count += 1;
    current.finalPrice += snapshot.calculationSnapshot?.finalPrice ?? 0;
    current.availableBeforeLabor += snapshot.calculationSnapshot?.availableBeforeLabor ?? 0;
    current.clinicProfit += snapshot.calculationSnapshot?.clinicProfit ?? 0;
    treatmentMap.set(key, current);
  });

  const topTreatments = [...treatmentMap.values()]
    .map((item) => ({
      ...item,
      finalPrice: roundCurrency(item.finalPrice),
      availableBeforeLabor: roundCurrency(item.availableBeforeLabor),
      clinicProfit: roundCurrency(item.clinicProfit),
    }))
    .sort((a, b) => b.availableBeforeLabor - a.availableBeforeLabor)
    .slice(0, 5);

  const totalsByPatient = buildAggregateRows(acceptedSnapshots, 'patientId', 'patientName').slice(0, 8);
  const totalsByTreatment = buildAggregateRows(acceptedSnapshots, 'treatmentId', 'treatmentNameSnapshot').slice(0, 8);

  const statusCounts = filteredSnapshots.reduce((acc, snapshot) => {
    acc[snapshot.status] = (acc[snapshot.status] ?? 0) + 1;
    return acc;
  }, {});

  return {
    filters: {
      range,
      status,
      patientId,
      treatmentId,
    },
    filterOptions: {
      patients: patientOptions,
      treatments: treatmentOptions,
    },
    periods: {
      day: buildPeriodSummary(dayEntries, dailyAvailableObjective),
      week: buildPeriodSummary(weekEntries, weeklyAvailableObjective),
      month: buildPeriodSummary(monthEntries, monthlyAvailableObjective),
    },
    objectives: {
      dailyAvailableObjective,
      weeklyAvailableObjective,
      monthlyAvailableObjective,
    },
    comparison: buildComparison(
      range === 'today' || range === 'week' || range === 'month' ? range : 'month',
      comparableAcceptedSnapshots,
      now,
      range === 'today'
        ? dailyAvailableObjective
        : range === 'week'
          ? weeklyAvailableObjective
          : monthlyAvailableObjective
    ),
    acceptedSnapshots,
    recentAccepted: acceptedSnapshots.slice(0, 6),
    topTreatments,
    totalsByPatient,
    totalsByTreatment,
    statusCounts,
    filteredSnapshots,
    operationalSummary: buildOperationalSummary(filteredTreatments, filteredAppointments, filteredPayments, now),
    pendingCollectionsByPatient: buildPendingCollectionRows(filteredTreatments),
    operationalTreatments: buildOperationalTreatmentRows(filteredTreatments, now),
    upcomingAppointments: filteredAppointments.slice(0, 6),
  };
}

export function exportAcceptedSnapshotsCsv(financeDashboard) {
  const reportRows = buildAcceptedSnapshotsReportRows(financeDashboard);
  const rows = [
    ACCEPTED_SNAPSHOTS_REPORT_COLUMNS.map((column) => column.label),
    ...reportRows.map((row) => ACCEPTED_SNAPSHOTS_REPORT_COLUMNS.map((column) => row[column.key] ?? '')),
  ];

  return buildCsv(rows);
}

export function exportFinanceSummaryCsv(financeDashboard) {
  const reportRows = buildFinanceSummaryReportRows(financeDashboard);
  const rows = [
    FINANCE_SUMMARY_REPORT_COLUMNS.map((column) => column.label),
    ...reportRows.map((row) => FINANCE_SUMMARY_REPORT_COLUMNS.map((column) => row[column.key] ?? '')),
  ];

  return buildCsv(rows);
}

export function buildAcceptedSnapshotsReportRows(financeDashboard) {
  const acceptedSnapshots = financeDashboard?.acceptedSnapshots ?? [];
  return acceptedSnapshots.map((snapshot) => ({
    patientId: snapshot.patientId ?? '',
    patientName: snapshot.patientName ?? '',
    treatmentId: snapshot.treatmentId ?? '',
    treatmentNameSnapshot: snapshot.treatmentNameSnapshot ?? '',
    status: snapshot.status ?? '',
    acceptedAt: snapshot.acceptedAt ?? '',
    finalPrice: snapshot.calculationSnapshot?.finalPrice ?? 0,
    availableBeforeLabor: snapshot.calculationSnapshot?.availableBeforeLabor ?? 0,
    clinicProfit: snapshot.calculationSnapshot?.clinicProfit ?? 0,
    pricingStatus: snapshot.calculationSnapshot?.pricingStatus ?? '',
    externalClinicianStatus: snapshot.calculationSnapshot?.externalClinicianStatus ?? '',
  }));
}

export function buildFinanceSummaryReportRows(financeDashboard) {
  const periods = financeDashboard?.periods ?? {};
  const objectives = financeDashboard?.objectives ?? {};

  return [
    {
      period: 'day',
      acceptedCount: periods.day?.acceptedCount ?? 0,
      finalPrice: periods.day?.finalPrice ?? 0,
      availableBeforeLabor: periods.day?.availableBeforeLabor ?? 0,
      clinicProfit: periods.day?.clinicProfit ?? 0,
      objectiveAmount: objectives.dailyAvailableObjective ?? 0,
      objectiveProgressPercent: periods.day?.objectiveProgressPercent ?? 0,
    },
    {
      period: 'week',
      acceptedCount: periods.week?.acceptedCount ?? 0,
      finalPrice: periods.week?.finalPrice ?? 0,
      availableBeforeLabor: periods.week?.availableBeforeLabor ?? 0,
      clinicProfit: periods.week?.clinicProfit ?? 0,
      objectiveAmount: objectives.weeklyAvailableObjective ?? 0,
      objectiveProgressPercent: periods.week?.objectiveProgressPercent ?? 0,
    },
    {
      period: 'month',
      acceptedCount: periods.month?.acceptedCount ?? 0,
      finalPrice: periods.month?.finalPrice ?? 0,
      availableBeforeLabor: periods.month?.availableBeforeLabor ?? 0,
      clinicProfit: periods.month?.clinicProfit ?? 0,
      objectiveAmount: objectives.monthlyAvailableObjective ?? 0,
      objectiveProgressPercent: periods.month?.objectiveProgressPercent ?? 0,
    },
  ];
}
