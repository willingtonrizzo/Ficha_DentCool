# DentCool — Skill Codex: Módulo de Insumos, Herramientas, Stock, Packs y Esterilización

> Proyecto actual: React + Vite + JavaScript + localStorage.  
> No migrar todavía a SQLite ni Tauri en esta etapa.  
> Este módulo debe integrarse con la ficha del paciente, tratamientos, appointments, presupuestos, paymentEntries y el motor financiero `pricing.js`.

## Estado actual

- ya existe un motor puro inicial para insumos en `src/modules/supplies/`
- ya existe persistencia local para catalogo, recetas, snapshots, categorias, unidades, proveedores y compras
- ya existen seeds iniciales para el MVP chico
- ya existe un puente minimo hacia `pricing.js` mediante `supplySnapshotId`
- ya existen tests unitarios para motor y storage
- ya existe una UI minima integrada en la ficha para alta simple de materiales y mostrar el catalogo bajo demanda
- aun no existe integracion con `SQLite`


---

## 0. Recomendación operativa para Codex

Este módulo debe implementarse en etapas. La prioridad no es construir una interfaz completa desde el primer intento, sino asegurar que la lógica clínica-financiera esté correcta, probada y sea fácil de integrar con el módulo de pricing existente.

### 0.1 Orden obligatorio recomendado

Codex debe seguir este orden:

1. **Motor puro de cálculo** en JavaScript.
2. **Unit tests con Vitest** para cada función crítica.
3. **Persistencia defensiva en localStorage**.
4. **UI mínima para catálogo y recetas**.
5. **Integración en ficha del paciente**.
6. **Conexión controlada con `pricing.js`** usando `customSuppliesCost` y `supplySnapshotId`.
7. **Alertas de stock, esterilización y preparación de agenda**.

No se debe migrar a SQLite, Tauri ni backend mientras este modelo no esté validado con datos reales de la doctora.

### 0.2 MVP recomendado

El primer MVP debe incluir solo:

```txt
Catálogo de insumos/herramientas
+ recetas estándar configurables por tratamiento
+ insumos reales usados por paciente
+ snapshot inmutable
+ costo enviado a pricing
```

Este MVP ya permite mejorar el cálculo financiero y registrar el consumo real sin volver el sistema demasiado complejo.

Después del MVP agregar:

```txt
Compras
+ proveedores
+ stock mínimo
+ pack de examen y esterilización
+ alertas para citas agendadas
+ reportes de consumo
```

### 0.3 Regla de pruebas antes de UI

Codex debe crear primero tests unitarios. No debe construir pantallas antes de probar:

- costo unitario;
- costo promedio ponderado;
- amortización;
- costo por esterilización;
- costo de receta estándar;
- edición de uso real por paciente;
- creación de snapshot;
- inmutabilidad del snapshot;
- stock bajo;
- necesidades de agenda futura;
- integración de costo de insumos hacia pricing.

La UI puede cambiar, pero las reglas de negocio no deben romperse. Por eso los cálculos deben vivir en funciones puras y tener tests.

### 0.4 Principio de integración segura

No modificar masivamente `pricing.js`. Solo permitir que reciba:

```js
customSuppliesCost
supplySnapshotId
```

Si existe un snapshot de insumos del paciente, pricing usa ese costo. Si no existe, usa el costo estándar del tratamiento.

Los presupuestos confirmados y snapshots históricos nunca deben recalcularse automáticamente cuando cambie el precio de compra de un insumo, el proveedor, la receta estándar o el stock.

---

## 1. Objetivo del módulo

Crear un módulo interno para DentCool que permita gestionar:

1. Catálogo de insumos, materiales, herramientas y equipos.
2. Stock disponible y stock mínimo.
3. Compras y proveedores.
4. Costeo por unidad, dosis, uso, pack o paciente estimado.
5. Recetas estándar configurables por tratamiento.
6. Pack básico transversal para toda atención.
7. Pack de examen básico reutilizable y su esterilización semanal.
8. Insumos reales usados en cada paciente.
9. Snapshot de costos al confirmar presupuesto o atención.
10. Alertas de preparación para pacientes agendados.
11. Integración con pricing/finanzas.

El objetivo no es solo calcular costos. También debe ayudar a que la doctora tenga todo listo antes de atender a un paciente y pueda evitar quedarse sin stock.

---

## 2. Principio central

DentCool necesita separar tres conceptos:

### 2.1 Insumos desechables

Son materiales que se consumen con cada paciente y deben descontarse del stock o cargarse como costo directo.

Ejemplos:

- vaso desechable;
- eyector;
- algodón;
- gasa;
- guantes;
- mascarilla;
- pechera;
- enjuague bucal;
- flúor;
- pasta profiláctica;
- anestesia;
- agujas;
- puntas desechables;
- rollos de algodón.

Estos se compran en cantidad y se calcula su costo unitario.

Ejemplo:

```txt
100 vasos cuestan $3.000
Costo unitario = 3.000 / 100 = $30 por vaso
Si se usa 1 vaso por paciente, el costo cargado al paciente es $30
```

### 2.2 Herramientas reutilizables / equipos amortizables

Son artículos que se compran una vez o cada cierto tiempo y se usan en muchos pacientes. No se cargan completamente a un solo paciente, sino que se amortizan.

Ejemplos:

- aeropulidor;
- puntas reutilizables;
- mango porta instrumento;
- lámpara;
- instrumental;
- espejo intraoral reutilizable;
- explorador;
- pinza;
- bandeja;
- instrumental del pack de examen.

Ejemplo:

```txt
Aeropulidor cuesta $30.000
Se estima uso para 60 pacientes
Costo por paciente = 30.000 / 60 = $500
```

### 2.3 Packs clínicos

Son agrupaciones de insumos o instrumentos que se usan juntos.

El sistema debe soportar al menos dos tipos:

1. Pack básico transversal desechable.
2. Pack de examen básico reutilizable + costo de esterilización.

---

## 3. Pack básico transversal desechable

El pack básico transversal representa el mínimo que se usa en casi toda atención, incluso en una evaluación.

Debe ser configurable por la doctora.

Ejemplo inicial sugerido:

| Ítem | Tipo | Unidad | Cantidad estándar | Uso |
|---|---|---|---:|---|
| Vaso desechable | insumo | unidad | 1 | todas las atenciones |
| Guantes | insumo | par | 1 | todas las atenciones |
| Mascarilla | insumo | unidad | 1 | todas las atenciones |
| Pechera | insumo | unidad | 1 | todas las atenciones |
| Eyector | insumo | unidad | 1 | atenciones clínicas |
| Algodón | insumo | unidad/rollo | configurable | según tratamiento |
| Gasa | insumo | unidad | configurable | según tratamiento |
| Enjuague bucal | insumo | ml/dosis | configurable | evaluación o atención |

Regla:

```txt
Todo tratamiento debe poder activar o desactivar el pack básico transversal.
Por defecto, evaluación y tratamientos clínicos lo tienen activo.
```

Motivo:

Aunque una evaluación no use materiales caros, igual consume desechables. Si no se cargan al cálculo, el precio queda artificialmente alto en margen.

---

## 4. Pack de examen básico y esterilización

El pack de examen básico contiene instrumentos reutilizables que se usan en evaluación y en muchos tratamientos.

Ejemplo:

| Ítem | Tipo | Unidad | Reutilizable | Requiere esterilización |
|---|---|---|---|---|
| Espejo intraoral | herramienta | unidad | sí | sí |
| Explorador | herramienta | unidad | sí | sí |
| Pinza algodonera | herramienta | unidad | sí | sí |
| Bandeja | herramienta | unidad | sí | sí |

Este pack se compra una vez, pero genera dos tipos de costo:

1. Amortización del instrumental.
2. Costo de esterilización.

### 4.1 Amortización del pack

Ejemplo:

```txt
Pack examen básico cuesta $40.000
Vida útil estimada: 400 usos
Costo amortizado por uso = $100
```

### 4.2 Esterilización semanal

Si el pack se manda a esterilizar cada semana, el sistema debe registrar:

- fecha de envío;
- fecha de regreso;
- cantidad de packs enviados;
- costo total de esterilización;
- proveedor/centro de esterilización;
- observaciones;
- estado: pendiente, enviado, recibido, vencido/no disponible.

Ejemplo:

```txt
Esterilización semanal: $12.000
Packs enviados: 10
Costo de esterilización por pack = 12.000 / 10 = $1.200
```

Ese costo puede cargarse de dos formas:

1. Costo por uso directo del pack.
2. Costo semanal distribuido entre pacientes atendidos.

Para MVP usar preferentemente costo por uso directo:

```txt
Costo pack examen por paciente = amortización por uso + costo esterilización por uso
```

Ejemplo:

```txt
Amortización: $100
Esterilización por uso: $1.200
Costo pack examen por paciente = $1.300
```

---

## 5. Catálogo de ítems

El catálogo debe permitir registrar insumos, herramientas, equipos, medicamentos, packs y servicios de esterilización.

### 5.1 Campos mínimos

```js
const supplyItem = {
  id: 'sup_vaso_001',
  name: 'Vaso desechable',
  category: 'Desechable',
  itemType: 'consumable',
  unit: 'unidad',
  purchaseQuantity: 100,
  purchaseTotalCost: 3000,
  unitCost: 30,
  currentStock: 100,
  minimumStock: 20,
  supplierId: 'prov_001',
  defaultUsePerPatient: 1,
  active: true,
  notes: 'Uso transversal en evaluaciones y tratamientos'
};
```

### 5.2 Tipos de ítem sugeridos

```js
const itemTypes = [
  'consumable',      // insumo desechable
  'tool',            // herramienta reutilizable
  'equipment',       // equipo amortizable
  'medicine',        // medicamento o anestesia
  'sterilization',   // servicio de esterilización
  'pack'             // agrupación de ítems
];
```

### 5.3 Categorías editables

Las categorías deben ser configurables desde la UI.

Categorías sugeridas iniciales:

```js
const defaultCategories = [
  'Desechables',
  'Bioseguridad',
  'Profilaxis',
  'Blanqueamiento',
  'Restauración',
  'Anestesia',
  'Instrumental reutilizable',
  'Equipos amortizables',
  'Esterilización',
  'Oficina',
  'Otros'
];
```

### 5.4 Unidades editables

Las unidades también deben ser configurables.

Unidades iniciales sugeridas:

```js
const defaultUnits = [
  'unidad',
  'par',
  'caja',
  'pack',
  'ml',
  'mg',
  'g',
  'dosis',
  'rollo',
  'uso',
  'paciente estimado',
  'semana',
  'jornada'
];
```

---

## 6. Compras y proveedores

El módulo debe permitir registrar cuándo se compró cada insumo y a quién.

Esto ayuda a:

- saber costo real histórico;
- comparar proveedores;
- saber cuándo subieron precios;
- controlar stock;
- tener respaldo de compras;
- preparar reposiciones.

### 6.1 Proveedor

```js
const supplier = {
  id: 'prov_001',
  name: 'Proveedor Dental X',
  contactName: '',
  phone: '',
  email: '',
  address: '',
  website: '',
  notes: 'Proveedor de vasos, guantes y eyectores',
  active: true
};
```

### 6.2 Compra

```js
const purchaseEntry = {
  id: 'purchase_001',
  itemId: 'sup_vaso_001',
  supplierId: 'prov_001',
  purchaseDate: '2026-05-15',
  quantityPurchased: 100,
  totalCost: 3000,
  unitCost: 30,
  invoiceNumber: '',
  paymentMethod: 'transferencia',
  notes: 'Compra inicial',
  createdAt: '2026-05-15T10:00:00.000Z'
};
```

Regla:

```txt
Cuando se registra una compra, debe aumentar el stock disponible y actualizar el costo unitario de referencia.
```

Para MVP, se puede usar costo promedio ponderado simple.

Ejemplo:

```txt
Stock actual: 50 vasos a $30
Nueva compra: 100 vasos a $40
Nuevo costo promedio = ((50*30) + (100*40)) / 150 = $36,67
```

---

## 7. Receta estándar por tratamiento

Una receta estándar es la lista de insumos, packs y herramientas que normalmente se usan en un tratamiento.

Debe ser configurable y editable por la doctora.

Ejemplo: Limpieza VIP

```js
const treatmentRecipe = {
  id: 'recipe_limpieza_vip',
  treatmentId: 'treat_limpieza_vip',
  name: 'Receta estándar Limpieza VIP',
  active: true,
  includesBaseDisposablePack: true,
  includesExamPack: true,
  items: [
    { itemId: 'sup_vaso_001', quantity: 1, editableAtPatientLevel: true },
    { itemId: 'sup_gasa_001', quantity: 2, editableAtPatientLevel: true },
    { itemId: 'sup_eyector_001', quantity: 1, editableAtPatientLevel: true },
    { itemId: 'sup_fluor_001', quantity: 1, editableAtPatientLevel: true },
    { itemId: 'eq_aeropulidor_001', quantity: 1, editableAtPatientLevel: true },
    { itemId: 'sup_pasta_profilactica_001', quantity: 1, editableAtPatientLevel: true }
  ],
  notes: 'Receta base editable por la doctora'
};
```

Regla:

```txt
Al seleccionar un tratamiento en la ficha del paciente, el sistema debe cargar automáticamente la receta estándar.
La doctora puede editar cantidades, quitar ítems o agregar ítems extra antes de guardar.
```

---

## 8. Insumos usados por paciente

Dentro de la ficha del paciente debe existir una sección:

```txt
Paciente > Tratamientos / Presupuestos > Insumos usados
```

Nombres posibles de la sección:

- Insumos usados;
- Insumos y herramientas;
- Materiales clínicos;
- Consumo clínico.

Recomendación de nombre para UI:

```txt
Insumos y herramientas
```

### 8.1 Flujo de uso

1. La doctora selecciona el tratamiento.
2. El sistema carga la receta estándar.
3. La doctora revisa la lista.
4. Puede ajustar cantidades.
5. Puede agregar insumos adicionales.
6. Puede marcar si un ítem no se usó.
7. El sistema recalcula el costo real.
8. El costo se conecta al presupuesto/pricing.
9. Al confirmar, se guarda snapshot.

### 8.2 Ejemplo

Tratamiento: Limpieza VIP

| Ítem | Cantidad estándar | Cantidad real | Costo unitario | Costo total |
|---|---:|---:|---:|---:|
| Vaso | 1 | 1 | $30 | $30 |
| Guantes | 1 par | 1 | $120 | $120 |
| Gasa | 2 | 4 | $40 | $160 |
| Eyector | 1 | 1 | $80 | $80 |
| Flúor | 1 dosis | 1 | $1.200 | $1.200 |
| Aeropulidor | 1 uso | 1 | $500 | $500 |
| Pack examen esterilizado | 1 uso | 1 | $1.300 | $1.300 |

Costo real de insumos/herramientas: $3.390

---

## 9. Snapshot de costos

Cuando un presupuesto se confirma o una atención se marca como realizada, se debe guardar una foto del cálculo.

Motivo:

Si hoy un vaso cuesta $30 y en dos meses cuesta $45, los presupuestos antiguos no deben cambiar.

### 9.1 Snapshot por paciente/tratamiento

```js
const patientSupplySnapshot = {
  id: 'snap_supplies_001',
  patientId: 'patient_001',
  appointmentId: 'appt_001',
  treatmentId: 'treat_limpieza_vip',
  pricingSnapshotId: 'pricing_snap_001',
  status: 'confirmed',
  createdAt: '2026-05-15T10:00:00.000Z',
  items: [
    {
      itemId: 'sup_vaso_001',
      itemName: 'Vaso desechable',
      category: 'Desechables',
      itemType: 'consumable',
      unit: 'unidad',
      quantity: 1,
      unitCostAtTime: 30,
      totalCostAtTime: 30,
      supplierIdAtTime: 'prov_001'
    }
  ],
  totalSupplyCost: 3390,
  notes: 'Se usaron 4 gasas en vez de 2'
};
```

Regla:

```txt
El snapshot no debe recalcularse automáticamente cuando cambian precios, proveedores o stock.
```

---

## 10. Stock y alertas

El módulo debe ayudar a preparar citas futuras.

### 10.1 Stock mínimo

Cada ítem debe tener:

```js
minimumStock: 20
```

Si `currentStock <= minimumStock`, mostrar alerta:

```txt
Stock bajo: Vaso desechable. Quedan 18 unidades. Mínimo configurado: 20.
```

### 10.2 Preparación para citas agendadas

El sistema debe poder revisar appointments futuros y calcular qué insumos se necesitan según los tratamientos agendados.

Ejemplo:

```txt
Mañana hay:
- 2 limpiezas VIP
- 1 evaluación

Necesario:
- 3 vasos
- 3 pares de guantes
- 3 mascarillas
- 2 dosis de flúor
- 2 usos de aeropulidor
- 3 packs examen esterilizados
```

Si no hay stock suficiente:

```txt
Alerta: faltan 2 packs de examen esterilizados para la agenda de mañana.
```

### 10.3 Estados de disponibilidad

```js
const stockStatus = [
  'ok',
  'low_stock',
  'out_of_stock',
  'sterilization_pending',
  'not_available'
];
```

---

## 11. Oficina y gastos no clínicos

No todo lo que se compra es insumo clínico directo.

Debe existir categoría de oficina para controlar gastos como:

- hojas;
- tinta;
- carpetas;
- lápices;
- etiquetas;
- agenda física;
- impresión de consentimientos;
- teléfono;
- internet;
- software;
- bolsas;
- elementos administrativos.

Regla:

```txt
Los gastos de oficina no siempre deben cargarse directamente al paciente.
Para MVP, se pueden registrar como gasto general y luego distribuirse como administración por paciente en pricing.
```

Ejemplo:

```txt
Gastos oficina mensuales: $30.000
Pacientes estimados al mes: 30
Costo administrativo por paciente = $1.000
```

Este valor puede alimentar `defaultAdminCost` del módulo pricing.

---

## 12. Integración con pricing.js

El módulo de insumos debe entregar al motor financiero el costo real de insumos del tratamiento.

### 12.1 Input hacia pricing

```js
const pricingInput = {
  treatmentId: 'treat_limpieza_vip',
  customPrice: 60000,
  discountEnabled: true,
  discountPercent: 10,
  customSuppliesCost: 3390,
  supplySnapshotId: 'snap_supplies_001'
};
```

Regla:

```txt
Si existe un snapshot de insumos del paciente, pricing debe usar ese costo real.
Si no existe, pricing puede usar el costo estándar de la receta del tratamiento.
```

---

## 13. Persistencia en localStorage

Usar localStorage por ahora, siguiendo arquitectura actual.

Keys sugeridas:

```js
localStorage.setItem('dentcool_supplies_catalog', JSON.stringify(items));
localStorage.setItem('dentcool_suppliers', JSON.stringify(suppliers));
localStorage.setItem('dentcool_purchase_entries', JSON.stringify(purchases));
localStorage.setItem('dentcool_treatment_recipes', JSON.stringify(recipes));
localStorage.setItem('dentcool_patient_supply_snapshots', JSON.stringify(snapshots));
localStorage.setItem('dentcool_sterilization_batches', JSON.stringify(batches));
localStorage.setItem('dentcool_supply_categories', JSON.stringify(categories));
localStorage.setItem('dentcool_supply_units', JSON.stringify(units));
```

No romper datos existentes.

Implementar migración defensiva:

```txt
Si una key no existe, crear array vacío o seed inicial.
Si faltan campos nuevos, usar valores por defecto.
```

---

## 14. Funciones puras sugeridas

Crear archivo:

```txt
src/modules/supplies/suppliesCalculator.js
```

Funciones mínimas:

```js
calculateUnitCost(purchaseTotalCost, purchaseQuantity)
calculateWeightedAverageCost(existingStock, existingUnitCost, newQuantity, newUnitCost)
calculateAmortizedCost(totalCost, estimatedUses)
calculateSterilizationCostPerPack(totalBatchCost, packsCount)
calculateRecipeCost(recipe, catalog)
calculatePatientSupplyUsageCost(patientUsageItems, catalog)
applyPurchaseToStock(item, purchaseEntry)
checkLowStock(item)
checkAgendaSupplyNeeds(appointments, recipes, catalog)
createSupplySnapshot(patientId, treatmentId, usageItems, catalog)
```

Todas deben tener unit tests.

---

## 15. Unit tests esperados con Vitest

Crear archivo:

```txt
src/modules/supplies/suppliesCalculator.test.js
```

### 15.1 Costo unitario

```js
it('calcula costo unitario de vasos', () => {
  expect(calculateUnitCost(3000, 100)).toBe(30);
});
```

### 15.2 Costo promedio ponderado

```js
it('calcula costo promedio ponderado al comprar nuevo stock', () => {
  const result = calculateWeightedAverageCost(50, 30, 100, 40);
  expect(result).toBeCloseTo(36.67, 2);
});
```

### 15.3 Amortización

```js
it('calcula costo amortizado de aeropulidor', () => {
  expect(calculateAmortizedCost(30000, 60)).toBe(500);
});
```

### 15.4 Esterilización por pack

```js
it('calcula costo de esterilizacion por pack', () => {
  expect(calculateSterilizationCostPerPack(12000, 10)).toBe(1200);
});
```

### 15.5 Receta estándar

```js
it('calcula costo total de receta estándar', () => {
  // Debe sumar pack básico, pack examen y extras del tratamiento.
});
```

### 15.6 Uso real por paciente

```js
it('usa cantidad real del paciente cuando difiere de la receta estándar', () => {
  // Si receta trae 2 gasas pero paciente usó 4, debe calcular 4.
});
```

### 15.7 Snapshot inmutable

```js
it('mantiene costo histórico aunque cambie el precio actual del catálogo', () => {
  // Crear snapshot con vaso a $30.
  // Cambiar catálogo a $45.
  // El snapshot debe seguir mostrando $30.
});
```

### 15.8 Stock bajo

```js
it('alerta stock bajo cuando currentStock es menor o igual al mínimo', () => {
  expect(checkLowStock({ currentStock: 18, minimumStock: 20 })).toBe(true);
});
```

### 15.9 Agenda futura

```js
it('calcula insumos necesarios para citas futuras', () => {
  // 2 limpiezas VIP + 1 evaluación deben requerir 3 packs básicos.
});
```

---

## 16. UI sugerida

### 16.1 Menú principal

```txt
Finanzas
  - Pricing
  - Insumos y herramientas
  - Compras y proveedores
  - Esterilización
  - Reportes
```

### 16.2 Ficha del paciente

Agregar sección interna:

```txt
Ficha paciente
  - Datos personales
  - Tratamientos
  - Presupuestos
  - Pagos
  - Citas
  - Insumos y herramientas
  - Historial
```

### 16.3 Pantalla Insumos y herramientas

Debe tener tabs:

```txt
Catálogo | Recetas por tratamiento | Compras | Proveedores | Esterilización | Alertas de stock
```

### 16.4 En ficha del paciente

Al seleccionar tratamiento:

```txt
Tratamiento: Limpieza VIP
[ Cargar receta estándar ]

Pack básico transversal: activo
Pack examen básico: activo

Lista editable:
- Vaso: 1 unidad
- Guantes: 1 par
- Gasa: 2 unidades
- Eyector: 1 unidad
- Flúor: 1 dosis
- Aeropulidor: 1 uso
- Pack examen esterilizado: 1 uso

[Agregar insumo]
[Guardar insumos usados]
[Enviar costo a presupuesto/pricing]
```

---

## 17. Glosa para manual interno

Agregar al manual de lógica financiera:

### 17.1 Por qué registrar insumos por paciente

Registrar insumos por paciente permite conocer el costo real de cada tratamiento. Dos pacientes con el mismo tratamiento pueden consumir materiales distintos. Si no se mide ese consumo, el margen financiero puede parecer mejor de lo que realmente es.

### 17.2 Por qué existe pack básico transversal

Toda atención consume elementos mínimos de bioseguridad y preparación, incluso una evaluación. Vasos, guantes, mascarillas, pecheras, algodones o enjuagues no son gratis. Aunque el costo unitario parezca pequeño, al multiplicarse por muchos pacientes afecta el margen mensual.

### 17.3 Por qué existe pack de examen básico

El instrumental de examen se compra una vez, pero se usa repetidamente y requiere esterilización. Por eso debe tener costo por uso. Si no se considera, el precio de evaluación y tratamientos queda subestimado.

### 17.4 Por qué separar desechables, herramientas y equipos

Los desechables se consumen en cada atención. Las herramientas y equipos se amortizan en varios usos. Mezclarlos causa errores: un vaso se descuenta del stock, mientras que un aeropulidor debe distribuir su costo entre varios pacientes.

### 17.5 Por qué guardar snapshot

Los costos cambian con el tiempo. Un presupuesto confirmado debe conservar los costos usados en la fecha en que se creó. Esto protege la lectura histórica y evita que cambios futuros alteren márgenes pasados.

### 17.6 Por qué registrar proveedores

Registrar proveedores permite comparar precios, saber dónde se compró cada insumo, detectar aumentos de costo y preparar compras futuras con tiempo.

### 17.7 Por qué controlar stock antes de las citas

La agenda no solo requiere horarios disponibles. También requiere materiales disponibles. El sistema debe advertir si faltan insumos, packs esterilizados o herramientas necesarias antes del día de atención.

---

## 18. Criterios de aceptación para Codex

El módulo se considera listo cuando:

1. Existe catálogo editable de insumos/herramientas.
2. Existen categorías y unidades editables.
3. Se pueden registrar proveedores.
4. Se pueden registrar compras.
5. Las compras actualizan stock y costo unitario.
6. Existe pack básico transversal configurable.
7. Existe pack de examen básico con esterilización.
8. Se pueden registrar lotes de esterilización.
9. Existen recetas estándar configurables por tratamiento.
10. La ficha del paciente carga receta estándar según tratamiento.
11. La doctora puede editar cantidades reales usadas.
12. Se calcula costo total real de insumos por paciente.
13. Se guarda snapshot inmutable al confirmar.
14. El costo real puede alimentar `pricing.js`.
15. Existen alertas de stock bajo.
16. Existen tests unitarios para todos los cálculos principales.
17. Los tests se ejecutan con Vitest y pasan antes de integrar UI.
18. Existe al menos un test de inmutabilidad de snapshot.
19. Existe al menos un test de integración con pricing usando `customSuppliesCost`.
20. No se rompe la arquitectura actual React + Vite + localStorage.
21. No se migra a SQLite todavía.

---

## 19. Instrucción directa para Codex

Usar este prompt:

```txt
Lee docs/codex-skills/dentcool_insumos_stock_codex_skill.md.

Implementa primero el motor puro de insumos en JavaScript, sin UI.
El proyecto actual usa React + Vite + localStorage.
No migres a SQLite ni Tauri todavía.

Crea:
- src/modules/supplies/suppliesCalculator.js
- src/modules/supplies/suppliesStorage.js
- src/modules/supplies/suppliesSeeds.js
- src/modules/supplies/suppliesCalculator.test.js

Primero implementa funciones puras y unit tests con Vitest.
No construyas UI hasta que los tests pasen.
Después integra la UI mínima en ficha del paciente.

Tests obligatorios mínimos:
- calculateUnitCost
- calculateWeightedAverageCost
- calculateAmortizedCost
- calculateSterilizationCostPerPack
- calculateRecipeCost
- calculatePatientSupplyUsageCost
- createSupplySnapshot
- snapshot inmutable aunque cambie el catálogo
- checkLowStock
- checkAgendaSupplyNeeds
- integración con pricing usando customSuppliesCost

No cambies pricing.js salvo para permitir que reciba customSuppliesCost y supplySnapshotId.
No borres ni modifiques snapshots históricos.
No recalcules presupuestos confirmados con costos nuevos.
No migres a SQLite ni Tauri todavía.
```

---

## 20. Orden recomendado de implementación

### Fase 1 — Motor y tests

- calcular costo unitario;
- calcular costo promedio ponderado;
- calcular amortización;
- calcular esterilización por pack;
- calcular costo de receta;
- calcular uso real por paciente;
- crear snapshot;
- validar stock bajo.

### Fase 2 — Persistencia localStorage

- catálogo;
- proveedores;
- compras;
- recetas;
- snapshots;
- esterilización;
- categorías;
- unidades.

### Fase 3 — UI catálogo

- listar ítems;
- crear/editar insumo;
- crear/editar categoría;
- crear/editar unidad;
- registrar compra.

### Fase 4 — UI ficha paciente

- cargar receta por tratamiento;
- editar cantidades reales;
- guardar snapshot;
- enviar costo a pricing.

### Fase 5 — Reportes y alertas

- stock bajo;
- necesidad de insumos para citas próximas;
- costo de insumos por tratamiento;
- proveedores más usados;
- variación de costo unitario.

---

## 21. Nota de alcance

No construir todo perfecto en la primera iteración.

MVP recomendado:

```txt
Catálogo + receta por tratamiento + uso real por paciente + snapshot + conexión con pricing.
```

Luego agregar:

```txt
Compras + proveedores + stock + esterilización + alertas.
```

El objetivo es mejorar costos y preparación clínica sin volver el sistema imposible de usar.
