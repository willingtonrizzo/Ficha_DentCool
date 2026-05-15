# FICHA-DENTCOOL-BASELINE

## Nombre

Desde este punto el proyecto se refiere como `Ficha-DentCool`.

## Alcance evaluado

Se evaluo el prototipo actual en `dentcool-project` usando como criterio las skills:

- `dentcool-arquitectura`
- `dentcool-odontologia`
- `dentcool-ux-ui`
- `dentcool-testing`

## Estado actual

- La app ya corre sobre `Vite + React`.
- El punto de entrada actual es `src/main.jsx`.
- Los componentes principales ya viven en `src/`.
- Existe un bloque inicial de pacientes dentro de la UI principal.
- Existe una vista `Inicio` operativa conectada a la navegacion principal.
- El odontograma tiene seleccion de pieza y superficie.
- Existe persistencia local del odontograma y del contexto UI con `localStorage`.
- Existe persistencia local del directorio de pacientes y del paciente activo.
- Existe persistencia local de `Motivo y diagnostico` por `patientId`.
- Existe persistencia local de `Evolucion clinica` por `patientId`.
- Existe persistencia local de `Historial` por `patientId`.
- Existe persistencia local de `Presupuesto` y tratamientos por `patientId`.
- Existe persistencia local de `Documentos` por `patientId`.
- Existe persistencia local del odontograma por `patientId`.
- Existe validacion base para alta y edicion de pacientes.
- `Antecedentes` ya refleja datos reales del paciente activo en la tab principal.
- `Inicio` es la pantalla inicial y `Pacientes` funciona como directorio general en filas.
- Desde el directorio ya se puede abrir `Ver ficha` para la pagina clinica o `Editar ficha` para la hoja lateral.
- `Inicio` ya incorpora seguimiento visible por cercania de cita con semaforo clinico y texto de preparacion.
- El saludo principal de `Inicio` usa acento visual del logo para reforzar identidad.
- Existe un motor base de pricing y finanzas en `src/pricing.js`.
- `Presupuesto` ya muestra una lectura financiera estimada para tratamientos compatibles con el catalogo base.
- `PricingSettings` ya se cargan y guardan en `localStorage`.
- El catalogo de pricing ya se carga y guarda en `localStorage`.
- Los snapshots financieros ya se guardan dentro del `clinicalRecord` por paciente.
- Existe una vista general financiera alimentada por snapshots `accepted`.
- El objetivo financiero mensual ya puede editarse desde la vista general y queda persistido.
- Ya existe exportacion CSV para snapshots aceptados y resumen financiero general.
- Los snapshots financieros ya soportan estados intermedios y de cierre: `sent`, `accepted`, `rejected`, `expired`.
- La vista financiera general ya soporta filtros por rango y estado.
- La vista financiera general ya soporta filtros por paciente y tratamiento.
- Ya existe exportacion Excel con hojas separadas para snapshots aceptados y resumen financiero.
- `xlsx` ya se carga de forma diferida para no inflar el bundle principal al abrir la app.
- La vista financiera general ya compara periodo actual vs periodo anterior segun el rango activo.
- La vista financiera general ya muestra totales por paciente y por tratamiento.
- La vista financiera general ya muestra una tabla detallada de snapshots segun filtros activos.
- La vista financiera general ya cruza snapshots con tratamientos reales para leer valor planificado, en curso, realizado, cobrado, cobertura y saldo.
- La vista financiera general ya usa citas visibles del paciente para mostrar proximas atenciones segun filtros.
- La vista financiera general ya muestra cobranza pendiente por paciente y pipeline clinico operativo.
- El puente temporal actual usa `nextVisit` y `paid` como datos operativos de apoyo; no deben quedarse como modelo definitivo.
- La agenda y los cobros ya tienen entidades separadas en el `clinicalRecord`, con compatibilidad hacia atras desde `nextVisit` y `paid`.
- El catalogo de pricing ahora muestra un resumen calculado por tratamiento con `Costos`, `Gastos`, `Impuestos`, `Mano de obra` y `Utilidad neta`.
- Cada tratamiento del catalogo tiene una accion de `Restaurar` a su valor base original.
- La ayuda contextual de `Gestion interna` ya abre explicacion clicable en la tarjeta.
- Los valores canonicos del catalogo base ya no deben arrastrarse entre tratamientos.
- El bloque de pricing y finanzas ya fue verificado otra vez con `npm test` y `npm run build`.
- El MVP chico de insumos ya tiene motor puro, seeds locales, storage local y tests automatizados.
- El modulo de insumos ya puede entregar un `supplySnapshotId` al motor financiero como puente minimo.
- El modulo de insumos ya tiene UI minima integrada en la ficha para agregar materiales nuevos y mostrar el catalogo solo bajo demanda.
- Existen pruebas automatizadas base del odontograma y de persistencia local.
- Existe un modelo clinico base y un esquema inicial de `SQLite`.

## Hallazgos por skill

### Arquitectura

- La fase actual es post-migracion inicial.
- El mayor cuello de botella tecnico ya no es `window.*` en runtime, sino cerrar la limpieza de archivos legacy y seguir separando dominio, persistencia y UI.
- La siguiente migracion correcta es cerrar el flujo de pacientes y luego preparar `SQLite`.
- El pricing ya puede vivir como dominio separado sin mezclar aun `SQLite`, `Tauri` ni `TypeScript`.

### Odontologia

- El modelo de superficies base es correcto: `O`, `M`, `D`, `V`, `L`.
- La numeracion FDI ya esta implementada.
- El odontograma ya guarda y restaura estado local.
- Estados de pieza completa como `ausente`, `extr` e `implante` estan renderizados como convenciones visuales, no como reglas de dominio separadas.

### UX/UI

- La jerarquia general es buena para escritorio: header de paciente, odontograma central, panel lateral y tabs.
- La nueva vista `Inicio` sirve como puerta de entrada operativa sin desplazar el flujo clinico principal.
- El directorio de pacientes ahora esta separado en filas y no abre una ficha especifica por defecto.
- El nuevo bloque de pacientes se integra sin quitar protagonismo al odontograma.
- El odontograma ya es el foco visual principal.
- Hay buena base para adaptar referencias externas sin copiar interfaces sobrecargadas.
- Falta trabajar feedback funcional: guardado, error, exito, cambios pendientes.
- `Inicio` ya usa datos reales para directorio y seguimientos visibles, pero todavia combina eso con KPIs mock.
- `Inicio` ya usa seguimientos visibles por cercania de cita, pero todavia combina eso con KPIs mock.
- `Antecedentes` ya no depende de contenido fijo hardcodeado.

### Funcionalidades

- Ya existe seleccion de paciente activo.
- Ya existe edicion local de datos administrativos del paciente.
- Ya existe una separacion basica entre `Inicio` y `Pacientes` a nivel de vista.
- Ya existe un primer bloque clinico real por paciente: `Motivo y diagnostico`.
- `Evolucion clinica` ya es editable y persistente por paciente.
- `Historial` ya es editable y persistente por paciente.
- `Presupuesto` y tratamientos ya son editables y persistentes por paciente.
- `Documentos` ya es editable y persistente por paciente.
- La ficha lateral ya concentra la edicion administrativa y clinica principal por paciente.
- El odontograma ya se guarda por paciente junto con su contexto clinico principal.
- El formulario administrativo del paciente ya valida nombre, RUT y duplicidad basica.
- La vista de `Antecedentes` ya dejo de depender de contenido fijo hardcodeado.
- El presupuesto ya empieza a separarse entre dato clinico y lectura financiera estimada.
- La configuracion financiera base ya no depende solo de codigo; puede ajustarse desde la UI local.
- El catalogo de tratamientos financieros ya puede editarse desde la UI local sin tocar el modulo base.
- El flujo financiero ya puede congelar calculos historicos por paciente sin recalcularlos despues.
- La gestion general ya puede ver consolidado diario, semanal y mensual sin tocar la ficha clinica.
- El objetivo financiero ya no depende de un valor fijo interno.
- La gestion general ya puede sacar reportes CSV sin tocar la ficha del paciente.
- El flujo financiero ya distingue mejor entre presupuesto enviado, aceptado, rechazado o vencido.
- La gestion financiera ya puede filtrar lectura y exportacion CSV por subconjuntos operativos.
- La gestion financiera ya puede comparar periodos y agrupar resultados por paciente y por tratamiento.
- La gestion financiera ya puede revisar detalle filtrado sin salir de la vista general.
- La exportacion Excel ya existe y no penaliza el arranque porque `xlsx` se carga bajo demanda.
- La gestion financiera ya puede leer operacion local real desde `treatments.cost`, `treatments.paid`, `treatments.coveragePercent`, `treatments.status` y `patient.nextVisit` sin abrir otra capa paralela.

### Testing

- Ya existe cobertura automatizada base para:
  - odontograma
  - persistencia local
  - helpers de pacientes
  - modelo clinico inicial
  - pricing financiero base
- Los primeros tests utiles no son visuales; deben cubrir:
  - cambio de estado por superficie
  - seleccion de pieza
  - serializacion del odontograma
  - restauracion de estado persistido

## Riesgos actuales

- Si se sigue agregando logica sobre `window.*`, la migracion se encarece.
- Si se mete persistencia sin separar datos de UI, luego costara normalizar el modelo.
- Si se rediseña demasiado antes de migrar, se mezclaran problemas de UI y arquitectura.
- Si no se limpia pronto el `uiContext` global residual, puede seguir habiendo solapamientos de navegacion con el contexto por paciente.
- Si se mete snapshot financiero historico sin definir bien su relacion con paciente y presupuesto, luego costara migrarlo a `SQLite`.
- Si los reportes financieros avanzados siguen alimentandose solo de snapshots manuales, la lectura gerencial puede quedar desconectada de cobros, agenda y caja real.
- Si se sigue usando `nextVisit` como agenda y `paid` incrustado en tratamientos como pseudo-cobro por demasiado tiempo, despues costara separar agenda real y libro de caja.
- Si no se revisa el `md` financiero y se documentan las decisiones tomadas y por que, el siguiente bloque puede repetir criterios ya resueltos.
- Si se vuelve a mezclar valores manuales entre tratamientos del catalogo, los reportes financieros pierden confianza operativa.
- Si se intenta cerrar UI de insumos antes de validar motor y persistencia, se corre el riesgo de mezclar una capa visual con una base que todavia esta madurando.

## Siguiente paso recomendado

1. Separar entidad real de citas y entidad real de cobros-abonos.
2. Revisar `dentcool_pricing_codex_skill.md` y dejar cerradas las decisiones financieras con su justificacion.
3. Limpiar el rol residual de `uiContext` global frente al contexto por paciente.
4. Recién despues preparar persistencia `SQLite` runtime para pacientes y fichas.
5. Evaluar conciliacion futura entre snapshots aceptados, agenda y caja real.

## Archivos revisados

- `dentcool-project/index.html`
- `dentcool-project/src/data.js`
- `dentcool-project/src/root.jsx`
- `dentcool-project/src/app.jsx`
- `dentcool-project/src/tabs.jsx`
- `dentcool-project/src/tooth.jsx`
- `dentcool-project/src/storage.js`
- `dentcool-project/src/pricing.js`
- `dentcool-project/src/clinical-model.js`
- `dentcool-project/src/tabs.jsx`
- `dentcool-project/src/root.jsx`
- `dentcool-project/src/patients.js`
- `dentcool-project/src/__tests__/pricing.test.js`
- `dentcool-project/src/__tests__/storage.test.js`
- `dentcool-project/db/schema.sql`
