# Skill / Spec para Codex — Módulo Finanzas & Pricing Dentcool

## 0. Objetivo

Construir un módulo de escritorio para Dentcool dentro de una app React + Tauri. El módulo debe calcular precios, descuentos, costos, gastos, impuestos/retenciones, mano de obra, margen disponible y utilidad clínica por tratamiento. También debe guardar presupuestos asociados a pacientes y mantener un historial financiero auditable.

Este módulo no debe ser una simple calculadora. Debe actuar como un sistema de apoyo a decisiones para responder preguntas como:

- ¿Este tratamiento deja margen suficiente?
- ¿Este descuento destruye la rentabilidad?
- ¿Este precio sirve solo para lanzamiento o también para escalar?
- ¿El tratamiento podría soportar pagar a una odontóloga externa con boleta?
- ¿Cuánto queda para la profesional y cuánto para la clínica?
- ¿Qué precio mínimo, sano e ideal debería tener cada tratamiento?

## 0.1. Decisiones ya tomadas y por que

- El modulo financiero se construye primero como motor local y no como facturador completo, porque el objetivo inmediato es validar rentabilidad y lectura operativa sin introducir caja formal demasiado pronto.
- `nextVisit` se usa solo como puente temporal para agenda visible, porque ya existe en el modelo local y permite avanzar sin inventar otra capa antes de separar citas reales.
- `paid` se usa solo como puente temporal dentro de tratamientos, porque ya esta disponible y sirve para leer cobranza preliminar mientras no exista una entidad formal de cobros y abonos.
- Los snapshots `accepted` se consideran historicos congelados, porque el reporte necesita una referencia estable y no debe recalcular presupuestos ya cerrados.
- `dentcool_pricing_codex_skill.md` se mantiene como spec vivo, porque el bloque financiero ya llego a una complejidad que necesita trazabilidad de decisiones y motivos, no solo formulas.
- La separacion formal de `appointments` y `paymentEntries` ya empezo en el modelo local; `nextVisit` y `paid` quedan como capa de compatibilidad mientras se migra el resto del flujo.

## 0.2. Estado de implementacion actual

- El catalogo de pricing ya expone lectura calculada por tratamiento con `Costos`, `Gastos`, `Impuestos`, `Mano de obra` y `Utilidad neta`.
- Cada tratamiento del catalogo puede restaurarse a su valor base original sin tocar el catalogo entero.
- `Gestion interna` ya tiene ayuda contextual visible y clicable dentro del catalogo.
- Los tratamientos semilla del catalogo ya cargan sus valores canonicos y no deben arrastrar montos cruzados entre cards.
- El bloque financiero avanzado ya quedo verificado con `npm test` y `npm run build`.
- El siguiente corte natural sigue siendo cerrar la migracion de esta capa a `SQLite` cuando el modelo ya quede totalmente separado.

---

## 1. Contexto del negocio

Dentcool es una consulta dental inicial en Ñuñoa, cerca de Metro Chile España. Durante el primer año, la odontóloga trabajará sola como autoempleada, en horarios limitados:

- Lunes a viernes: 17:00 a 19:30
- Sábado: desde 09:30, jornada principal
- Domingo: solo excepcional

El box dental se arrienda por hora. Valor inicial configurable: $10.000 CLP/hora.

El objetivo financiero inicial no es escalar como clínica grande, sino validar precios y demanda sin quemar dinero en marketing. La meta progresiva razonable es llegar a $670.000–$900.000 CLP mensuales netos para la profesional + clínica, después de una etapa de validación y ajuste.

---

## 2. Principios financieros del módulo

### 2.1. Venta no es ganancia

El precio cobrado al paciente no representa utilidad. Primero se deben descontar costos directos, gastos operativos, comisiones, impuestos/retenciones, reserva y mano de obra.

Fórmula conceptual:

```text
Precio final paciente
- costos directos
- gastos operativos/comerciales
- comisiones de pago
- reserva
- impuestos/retenciones estimadas
= disponible para mano de obra + clínica
```

Luego:

```text
Disponible para mano de obra + clínica
- mano de obra profesional
= utilidad clínica estimada
```

### 2.2. Autoempleo no es lo mismo que utilidad empresarial

Durante el primer año, como la odontóloga trabaja sola, lo que queda después de costos puede parecer ganancia. Pero en realidad mezcla dos conceptos:

1. Pago por el trabajo clínico de la odontóloga.
2. Utilidad de la consulta.

El sistema debe mostrar ambas lecturas:

- **Disponible para profesional + clínica**: útil para el primer año.
- **Utilidad clínica después de mano de obra**: útil para saber si el tratamiento podría escalar con una odontóloga externa o reemplazo.

### 2.3. La mano de obra debe calcularse aunque la dueña trabaje sola

El módulo debe permitir configurar mano de obra profesional porque si la odontóloga enferma, viaja o necesita reemplazo, el precio debe soportar pagar a otra profesional con boleta.

Si el precio no incluye una partida de mano de obra, el negocio depende totalmente de que la dueña trabaje siempre. Eso hace que el modelo sea frágil.

### 2.4. Margen inicial aceptable, sano e ideal

Durante el primer año se puede aceptar que algunos tratamientos de entrada queden cerca del 40%, especialmente si sirven para captar pacientes y generar confianza. Pero no todos los tratamientos deben quedar en ese nivel.

Escala recomendada para **disponible antes de mano de obra**:

| Margen disponible | Estado | Uso esperado |
|---:|---|---|
| < 35% | Peligroso | Evitar salvo caso estratégico puntual |
| 35%–39,9% | Bajo | Revisar precio, descuento o costos |
| 40%–44,9% | Aceptable inicio | Puede usarse en primer año para entrada de pacientes |
| 45%–59,9% | Sano | Rango objetivo para operación estable |
| >= 60% | Ideal | Muy buen margen, permite más reserva y crecimiento |

### 2.5. Margen con mano de obra externa

Cuando una odontóloga externa atiende con boleta, el negocio debería quedar idealmente con 20%–35% de utilidad clínica después de pagar mano de obra, costos, gastos y reservas.

Escala recomendada para **utilidad clínica después de mano de obra**:

| Margen clínica | Estado | Interpretación |
|---:|---|---|
| < 10% | Débil | No soporta bien errores, cancelaciones o alzas de costos |
| 10%–19,9% | Ajustado | Puede funcionar, pero no es ideal para escalar |
| 20%–35% | Sano con boleta | Rango razonable para trabajar con profesional externo |
| > 35% | Muy bueno | Buen margen empresarial |

### 2.6. No todos los tratamientos soportan el mismo descuento

Un descuento afecta más a tratamientos de bajo ticket porque el box, insumos, comisión y administración pesan más sobre el precio final.

Ejemplo conceptual:

- Una limpieza simple de $45.000 puede no soportar 15% de descuento.
- Un blanqueamiento de $150.000 puede soportar mejor 10%–15% si sus costos directos están controlados.

Cada tratamiento debe tener:

- precio mínimo sugerido;
- precio sano sugerido;
- precio ideal sugerido;
- descuento máximo recomendado;
- alerta si el descuento supera el máximo recomendado.

---

## 3. Glosario de conceptos

### Precio lista

Precio normal del tratamiento antes de descuentos.

### Descuento activo

Indica si se aplica descuento al precio lista. Debe ser un checkbox o switch.

### Porcentaje de descuento

Porcentaje aplicado sobre el precio lista cuando el descuento está activo.

### Precio final paciente

Monto final que pagará el paciente después del descuento.

```text
Precio final = Precio lista - Descuento
```

### Costo directo

Costo directamente asociado a realizar el tratamiento. Ejemplos:

- box por hora;
- insumos;
- materiales clínicos;
- flúor;
- aeropulidor;
- material de blanqueamiento;
- laboratorio, si aplica.

### Gasto operativo/comercial

Gasto necesario para captar, gestionar o administrar al paciente. Ejemplos:

- marketing por paciente;
- administración;
- software;
- agenda;
- recordatorios;
- comisión de pago;
- traslado.

### Comisión de pago

Porcentaje cobrado por Transbank, Mercado Pago u otro procesador. Debe calcularse sobre el precio final pagado por el paciente.

### Reserva operativa

Porcentaje o monto separado para cubrir imprevistos, cancelaciones, reposición de instrumental, meses malos o futuras necesidades de reemplazo.

### Impuesto / retención estimada

Porcentaje configurable. Para boletas de honorarios en Chile, el valor referencial 2026 es 15,25%, pero debe ser editable porque cambia por año y depende de la forma tributaria.

### Mano de obra profesional

Valor asignado al trabajo clínico. Puede ser monto fijo o porcentaje. Aunque la dueña trabaje sola, debe calcularse para saber si el tratamiento podría pagar un reemplazo.

### Disponible para profesional + clínica

Monto que queda después de costos, gastos, comisiones, impuestos y reserva, antes de descontar mano de obra.

Este indicador es clave durante el primer año de autoempleo.

### Utilidad clínica después de mano de obra

Monto que queda después de descontar también la mano de obra profesional.

Este indicador es clave para saber si el tratamiento puede escalar con alguien contratado por boleta.

### Precio mínimo

Precio que puede cubrir costos y servir como promoción o entrada, pero no debería ser el precio permanente si deja margen bajo.

### Precio sano

Precio que permite cubrir costos, gastos, reservas y dejar un margen razonable para la profesional + clínica.

### Precio ideal

Precio que permite mejor margen, más reserva, mejor experiencia, posibilidad de pagar reemplazo y crecimiento del negocio.

### Validar si la zona soporta el precio

Significa comprobar con pacientes reales si el mercado de Ñuñoa / Chile España acepta el precio. No basta con que el cálculo financiero diga que el precio es correcto; también debe haber demanda real.

---

## 4. Configuración global editable

Crear una sección `PricingSettings` editable desde la UI.

Valores iniciales sugeridos:

```ts
export type PricingSettings = {
  boxHourlyCost: number;              // default: 10000
  transportCostPerSession: number;    // default: 2000
  paymentFeePercent: number;          // default: 3
  taxPercent: number;                 // default: 15.25
  defaultMarketingCost: number;       // default: 5000
  defaultAdminCost: number;           // default: 2000
  defaultReservePercent: number;      // default: 5

  initialMinimumMarginPercent: number; // default: 40
  healthyMarginPercent: number;        // default: 45
  idealMarginPercent: number;          // default: 60

  externalClinicianMinProfitPercent: number;     // default: 20
  externalClinicianHealthyProfitPercent: number; // default: 35
};
```

Todos los valores deben ser editables y persistentes.

---

## 5. Modelo de tratamiento

```ts
export type Treatment = {
  id: string;
  name: string;
  category: "limpieza" | "blanqueamiento" | "restauracion" | "sellante" | "evaluacion" | "otro";

  basePrice: number;
  durationHours: number;
  suppliesCost: number;

  minPrice: number;
  healthyPrice: number;
  idealPrice: number;

  maxRecommendedDiscountPercent: number;

  defaultLaborCost: number;
  defaultLaborPercent?: number;

  active: boolean;
  notes?: string;
};
```

Valores iniciales sugeridos:

```ts
export const defaultTreatments: Treatment[] = [
  {
    id: "limpieza-simple",
    name: "Limpieza simple",
    category: "limpieza",
    basePrice: 45000,
    durationHours: 1,
    suppliesCost: 3500,
    minPrice: 35000,
    healthyPrice: 45000,
    idealPrice: 50000,
    maxRecommendedDiscountPercent: 5,
    defaultLaborCost: 15000,
    active: true,
    notes: "Tratamiento de entrada. Descuentos altos pueden destruir margen."
  },
  {
    id: "limpieza-vip",
    name: "Limpieza VIP + aeropulidor + flúor",
    category: "limpieza",
    basePrice: 60000,
    durationHours: 1,
    suppliesCost: 6000,
    minPrice: 45000,
    healthyPrice: 60000,
    idealPrice: 70000,
    maxRecommendedDiscountPercent: 10,
    defaultLaborCost: 18000,
    active: true,
    notes: "Tratamiento de entrada premium. Puede usarse como producto principal inicial."
  },
  {
    id: "blanqueamiento-consulta",
    name: "Blanqueamiento en consulta",
    category: "blanqueamiento",
    basePrice: 120000,
    durationHours: 1.5,
    suppliesCost: 25000,
    minPrice: 100000,
    healthyPrice: 130000,
    idealPrice: 150000,
    maxRecommendedDiscountPercent: 15,
    defaultLaborCost: 30000,
    active: true,
    notes: "Mayor ticket. Soporta mejor descuentos moderados si se controla costo de captación."
  },
  {
    id: "restauracion-simple",
    name: "Restauración simple",
    category: "restauracion",
    basePrice: 60000,
    durationHours: 1.25,
    suppliesCost: 8000,
    minPrice: 45000,
    healthyPrice: 60000,
    idealPrice: 75000,
    maxRecommendedDiscountPercent: 10,
    defaultLaborCost: 25000,
    active: true,
    notes: "Requiere evaluación previa. El tiempo clínico puede variar por caso."
  },
  {
    id: "sellantes",
    name: "Sellantes",
    category: "sellante",
    basePrice: 45000,
    durationHours: 1,
    suppliesCost: 5000,
    minPrice: 35000,
    healthyPrice: 45000,
    idealPrice: 55000,
    maxRecommendedDiscountPercent: 5,
    defaultLaborCost: 18000,
    active: true,
    notes: "Preventivo. Debe cuidarse el descuento si el ticket es bajo."
  }
];
```

---

## 6. Input de cálculo

```ts
export type LaborCostMode = "fixed" | "percent";

export type PricingInput = {
  treatmentId: string;
  patientId?: string;

  customPrice?: number;

  discountEnabled: boolean;
  discountPercent: number;

  customMarketingCost?: number;
  customSuppliesCost?: number;
  customDurationHours?: number;
  customAdminCost?: number;
  customTransportCost?: number;

  laborCostMode: LaborCostMode;
  laborCostValue: number;

  paymentMethod?: "cash" | "card" | "transfer" | "other";
  applyPaymentFee: boolean;
  applyTax: boolean;
  applyReserve: boolean;
};
```

---

## 7. Resultado de cálculo

```ts
export type PricingStatus =
  | "Peligroso"
  | "Bajo"
  | "Aceptable inicio"
  | "Sano"
  | "Ideal";

export type ExternalClinicianStatus =
  | "No soporta boleta"
  | "Ajustado"
  | "Sano con boleta"
  | "Muy bueno";

export type MoneyPercentLine = {
  label: string;
  amount: number;
  percentOfFinalPrice: number;
};

export type PricingResult = {
  treatmentId: string;

  listPrice: number;
  discountAmount: number;
  finalPrice: number;

  lines: MoneyPercentLine[];

  boxCost: number;
  suppliesCost: number;
  marketingCost: number;
  adminCost: number;
  transportCost: number;
  paymentFeeAmount: number;
  reserveAmount: number;
  taxAmount: number;

  totalCostsBeforeLabor: number;
  availableBeforeLabor: number;
  availableBeforeLaborPercent: number;

  laborCost: number;
  laborCostPercent: number;

  clinicProfit: number;
  clinicProfitPercent: number;

  pricingStatus: PricingStatus;
  externalClinicianStatus: ExternalClinicianStatus;

  warnings: string[];
  recommendations: string[];

  recommendedPriceFor40: number;
  recommendedPriceFor45: number;
  recommendedPriceFor50: number;
  recommendedPriceFor60: number;
};
```

---

## 8. Fórmulas obligatorias

### 8.1. Precio final

```ts
const discountAmount = discountEnabled ? listPrice * (discountPercent / 100) : 0;
const finalPrice = listPrice - discountAmount;
```

### 8.2. Costo de box

```ts
const boxCost = durationHours * settings.boxHourlyCost;
```

### 8.3. Comisión de pago

```ts
const paymentFeeAmount = applyPaymentFee ? finalPrice * (settings.paymentFeePercent / 100) : 0;
```

### 8.4. Reserva

```ts
const reserveAmount = applyReserve ? finalPrice * (settings.defaultReservePercent / 100) : 0;
```

### 8.5. Impuesto/retención estimada

```ts
const taxAmount = applyTax ? finalPrice * (settings.taxPercent / 100) : 0;
```

### 8.6. Total antes de mano de obra

```ts
const totalCostsBeforeLabor =
  boxCost +
  suppliesCost +
  marketingCost +
  adminCost +
  transportCost +
  paymentFeeAmount +
  reserveAmount +
  taxAmount;
```

### 8.7. Disponible antes de mano de obra

```ts
const availableBeforeLabor = finalPrice - totalCostsBeforeLabor;
const availableBeforeLaborPercent = finalPrice > 0
  ? (availableBeforeLabor / finalPrice) * 100
  : 0;
```

### 8.8. Mano de obra

```ts
const laborCost = laborCostMode === "percent"
  ? finalPrice * (laborCostValue / 100)
  : laborCostValue;
```

### 8.9. Utilidad clínica después de mano de obra

```ts
const clinicProfit = availableBeforeLabor - laborCost;
const clinicProfitPercent = finalPrice > 0
  ? (clinicProfit / finalPrice) * 100
  : 0;
```

### 8.10. Precio recomendado para margen objetivo

Para calcular precio recomendado se deben separar costos fijos por atención de porcentajes aplicados al precio.

```ts
const fixedCostPerTreatment =
  boxCost + suppliesCost + marketingCost + adminCost + transportCost;

const variablePercentOfPrice =
  paymentFeePercent + reservePercent + taxPercent;

const recommendedPrice = fixedCostPerTreatment /
  (1 - targetMarginPercent / 100 - variablePercentOfPrice / 100);
```

Validar que el denominador sea mayor a 0. Si es menor o igual a 0, devolver `null` o error controlado.

---

## 9. Reglas de estado

### 9.1. Estado de pricing primer año

```ts
function getPricingStatus(marginPercent: number): PricingStatus {
  if (marginPercent < 35) return "Peligroso";
  if (marginPercent < 40) return "Bajo";
  if (marginPercent < 45) return "Aceptable inicio";
  if (marginPercent < 60) return "Sano";
  return "Ideal";
}
```

### 9.2. Estado con profesional externo

```ts
function getExternalClinicianStatus(clinicProfitPercent: number): ExternalClinicianStatus {
  if (clinicProfitPercent < 10) return "No soporta boleta";
  if (clinicProfitPercent < 20) return "Ajustado";
  if (clinicProfitPercent <= 35) return "Sano con boleta";
  return "Muy bueno";
}
```

---

## 10. Alertas obligatorias

El sistema debe generar alertas cuando:

1. El precio final está bajo el precio mínimo recomendado.
2. El descuento supera el descuento máximo recomendado del tratamiento.
3. El margen disponible antes de mano de obra está bajo 40%.
4. El margen disponible está entre 40% y 45%, indicando que es aceptable solo para inicio o captación.
5. La utilidad clínica después de mano de obra está bajo 20% si se quiere trabajar con profesional externo.
6. El precio recomendado para 45% es mayor al precio lista actual.
7. La comisión, impuesto o reserva están desactivados, para recordar que el cálculo es parcial.

Ejemplos de mensajes:

```text
El margen está bajo 40%. Este precio puede ser peligroso salvo que sea una promoción puntual.
```

```text
El descuento supera el máximo recomendado para este tratamiento. Revisa si el margen sigue siendo sano.
```

```text
Este tratamiento no soporta bien pagar una odontóloga externa con boleta. Úsalo con cuidado si planeas escalar.
```

---

## 11. Recomendaciones automáticas

El sistema debe sugerir acciones cuando el precio queda débil:

- reducir descuento;
- subir precio lista;
- reducir marketing por paciente;
- revisar duración del box;
- usar el tratamiento como promoción limitada;
- empujar tratamientos de mayor ticket;
- evaluar pack o venta cruzada;
- mejorar conversión para bajar costo de captación.

Ejemplo:

```text
Resultado: 41,8% disponible.
Interpretación: aceptable para inicio, pero no ideal para escala.
Recomendación: mantener como precio de lanzamiento o subir a $60.000 para acercarse al margen sano.
```

---

## 12. Presupuestos asociados a pacientes

Cuando se guarda un presupuesto, debe guardarse una foto completa del cálculo, no solo el precio final.

Motivo: si después cambia el arriendo, impuesto o insumos, los presupuestos antiguos no deben recalcularse automáticamente.

```ts
export type PatientBudget = {
  id: string;
  patientId: string;
  treatmentId: string;
  treatmentNameSnapshot: string;

  status: "draft" | "sent" | "accepted" | "rejected" | "expired";

  calculationSnapshot: PricingResult;

  notes?: string;
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
};
```

Al confirmar presupuesto:

- cambiar estado a `accepted`;
- registrar fecha;
- vincularlo al historial financiero;
- dejar visible en ficha del paciente.

---

## 13. UI requerida

### 13.1. Tabs del módulo

```text
Finanzas / Pricing
- Configuración
- Tratamientos
- Calculadora
- Presupuestos
- Manual / Glosario
```

### 13.2. Calculadora

Debe permitir:

- seleccionar paciente opcional;
- seleccionar tratamiento;
- editar precio lista;
- activar/desactivar descuento;
- ingresar % descuento;
- editar duración;
- editar insumos;
- editar marketing;
- elegir método de pago;
- activar/desactivar comisión;
- activar/desactivar impuesto;
- activar/desactivar reserva;
- elegir mano de obra fija o porcentual;
- calcular;
- guardar presupuesto;
- confirmar presupuesto.

### 13.3. Resultados visuales

Mostrar tabla con pesos y porcentajes:

| Concepto | Monto | % del precio final |
|---|---:|---:|
| Precio final | $54.000 | 100% |
| Box | $10.000 | 18,5% |
| Insumos | $6.000 | 11,1% |
| Marketing | $5.000 | 9,3% |
| Comisión | $1.620 | 3% |
| Reserva | $2.700 | 5% |
| Impuesto/retención | $8.235 | 15,25% |
| Disponible profesional + clínica | $18.445 | 34,1% |

También mostrar:

- estado de pricing;
- estado con profesional externo;
- alertas;
- recomendaciones;
- precios recomendados para 40%, 45%, 50% y 60%.

---

## 14. Manual / Glosario dentro de la app

Crear una pantalla o archivo Markdown interno con el siguiente contenido base.

### Título

```text
Manual de lógica financiera Dentcool
```

### Contenido mínimo

#### 1. Por qué este módulo existe

Este módulo existe para evitar fijar precios al ojo. Un tratamiento puede parecer rentable porque entra dinero, pero si no se consideran box, insumos, marketing, comisiones, impuestos, reserva y mano de obra, la consulta puede estar trabajando con margen insuficiente.

#### 2. Por qué venta no es ganancia

La venta es el total cobrado al paciente. La ganancia aparece solo después de descontar todos los costos y gastos necesarios para entregar el servicio.

#### 3. Por qué se calcula mano de obra aunque la odontóloga sea la dueña

Porque el trabajo clínico tiene valor económico. Si la dueña no puede atender, el negocio debería poder pagar a otra profesional. Si no se calcula mano de obra, el precio puede parecer rentable, pero en realidad depende de que la dueña trabaje siempre.

#### 4. Por qué 40% puede ser aceptable al inicio

En el primer año, algunos tratamientos pueden aceptarse con margen disponible cercano al 40% si sirven para captar pacientes, generar reseñas, validar demanda o introducir tratamientos de mayor valor. No debe ser la regla permanente.

#### 5. Por qué 45% o más es sano

Un margen disponible de 45% o más entrega más espacio para cubrir meses malos, descuentos, cancelaciones, reposición de materiales y crecimiento. También permite preparar el negocio para una futura etapa con reemplazos o profesionales externos.

#### 6. Por qué 60% es ideal

Un margen de 60% o más indica que el tratamiento tiene buen espacio económico. Puede sostener reinversión, reserva, mejor experiencia de paciente y crecimiento.

#### 7. Por qué con profesional externo se analiza otro margen

Cuando se paga una odontóloga externa, la mano de obra deja de ser implícita y se convierte en un costo real. Por eso el sistema calcula utilidad clínica después de mano de obra. Un margen de 20%–35% después de pagar a la profesional puede ser sano para escalar.

#### 8. Por qué no todos los descuentos son iguales

Un descuento de 10% no afecta igual a una limpieza de $45.000 que a un blanqueamiento de $150.000. Los tratamientos de menor ticket tienen menos espacio para descuentos porque los costos fijos por atención pesan más.

#### 9. Qué significa validar la zona

Validar la zona significa comprobar si pacientes reales en Ñuñoa / Chile España aceptan el precio. El precio debe ser financieramente sano, pero también comercialmente aceptado.

#### 10. Qué hacer si un tratamiento queda bajo

Opciones:

- reducir descuento;
- subir precio;
- mejorar comunicación de valor;
- reducir costo de captación;
- reducir tiempo de box;
- venderlo como promoción limitada;
- usarlo como entrada hacia otro tratamiento;
- eliminarlo si no aporta.

---

## 15. Unit tests obligatorios

Usar Vitest.

Crear archivo sugerido:

```text
src/modules/pricing/pricingCalculator.test.ts
```

### 15.1. Caso base sin descuento

Input:

- tratamiento: limpieza VIP
- precio: 60.000
- duración: 1 hora
- box: 10.000
- insumos: 6.000
- marketing: 5.000
- admin: 2.000
- transporte: 2.000
- comisión: 3%
- reserva: 5%
- impuesto: 15,25%
- mano de obra fija: 18.000

Esperado:

- precio final: 60.000
- comisión: 1.800
- reserva: 3.000
- impuesto: 9.150
- total antes mano obra: 38.950
- disponible antes mano obra: 21.050
- disponible %: 35,0833%
- utilidad clínica después mano obra: 3.050
- utilidad clínica %: 5,0833%
- estado pricing: Bajo
- estado externo: No soporta boleta

### 15.2. Caso con descuento 10%

Precio lista: 60.000
Descuento: 10%

Esperado:

- descuento: 6.000
- precio final: 54.000
- comisión: 1.620
- reserva: 2.700
- impuesto: 8.235

### 15.3. Alerta por descuento superior al máximo recomendado

Si limpieza simple tiene máximo 5% y se aplica 15%, debe generar warning.

### 15.4. Precio bajo mínimo recomendado

Si limpieza VIP tiene precio mínimo 45.000 y el precio final queda en 42.000, debe generar warning.

### 15.5. Método de pago transferencia sin comisión

Si `applyPaymentFee` es false, comisión debe ser 0.

### 15.6. Impuesto desactivado

Si `applyTax` es false, impuesto debe ser 0 y debe generarse advertencia de cálculo parcial.

### 15.7. Mano de obra porcentual

Si finalPrice = 100.000 y laborCostMode = percent con laborCostValue = 30, laborCost debe ser 30.000.

### 15.8. Precio recomendado

Validar que el precio recomendado para targetMargin 45% sea mayor cuando aumentan costos fijos.

### 15.9. Denominador inválido

Si el denominador de precio recomendado es <= 0, la función debe retornar null o warning controlado, nunca NaN ni Infinity.

### 15.10. Snapshot de presupuesto

Al guardar presupuesto, debe persistir el `calculationSnapshot`. Cambios futuros en settings no deben modificar presupuestos históricos.

---

## 16. Criterios de aceptación

Codex debe considerar terminado el módulo solo si:

1. Existe calculadora funcional.
2. Todos los valores globales son configurables.
3. Cada tratamiento puede tener precio mínimo, sano, ideal y descuento máximo.
4. Cada línea muestra pesos y porcentaje.
5. Se calculan margen disponible y utilidad clínica después de mano de obra.
6. Se generan alertas y recomendaciones.
7. Se puede guardar presupuesto vinculado a paciente.
8. Se puede confirmar presupuesto.
9. Se guarda snapshot histórico.
10. Existen unit tests para los casos principales.
11. El manual/glosario está disponible dentro de la app o como Markdown.
12. No hay valores mágicos hardcodeados sin pasar por configuración.

---

## 17. Indicaciones para Codex

- No cambiar la lógica financiera sin actualizar tests.
- No mezclar componentes UI con lógica de cálculo.
- La lógica debe vivir en funciones puras testeables.
- Usar TypeScript estricto.
- Usar nombres claros en español o inglés, pero mantener consistencia.
- Evitar cálculos duplicados en componentes React.
- Los componentes deben recibir resultados ya calculados desde el módulo de pricing.
- Crear tests antes de refactorizar.
- Cada presupuesto aceptado debe guardar snapshot.
- Separar `availableBeforeLabor` de `clinicProfit`.
- No asumir que el impuesto es IVA; usar nombre configurable `taxPercent` o `withholdingPercent` según UI.

---

## 18. Fuentes conceptuales usadas para justificar la lógica

Este módulo usa conceptos generales de pricing, margen de contribución, punto de equilibrio, costos fijos/variables y overhead odontológico. Las fuentes profesionales consultadas incluyen:

- U.S. Small Business Administration: break-even point.
- Harvard Business Review: contribution margin.
- BDC Canada: cost-plus pricing, competitive pricing y value-based pricing.
- SII Chile: retención de boletas de honorarios 2026 y exención de IVA en prestaciones ambulatorias de salud.
- Referencias de overhead dental: rangos generales de gastos operativos de consultas dentales.

Nota: las cifras tributarias deben revisarse con contador antes de usarse para declaraciones reales. El módulo es una herramienta de estimación y gestión interna, no reemplaza asesoría contable.
