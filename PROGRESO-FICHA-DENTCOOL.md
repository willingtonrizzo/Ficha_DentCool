# PROGRESO-FICHA-DENTCOOL

## Donde vamos

Fase actual: `Bloque UX/UI - Inicio operativo y directorio` + `Bloque Funcionalidades - ficha clinica lateral por paciente`

Objetivo inmediato:

- mantener `Ficha-DentCool` estable en `Vite`
- consolidar la nueva vista `Inicio` como entrada operativa sin romper la vista clinica
- abrir el directorio local de pacientes sin romper el flujo clinico
- cerrar la ficha lateral con secciones clinicas reales por `patientId`
- afinar `Inicio` para que los seguimientos visibles funcionen como recordatorio clinico por cercania de cita

## Ultimo avance realizado

Fecha de referencia: `2026-05-15`

Hecho:

- se renombro el proyecto de trabajo a `Ficha-DentCool`
- se creo `AGENTS.md`
- se crearon e instalaron las skills DentCool
- se migro el prototipo a `Vite + React`
- se movio la app nueva a `dentcool-project/src/`
- se agrego persistencia local del odontograma con `localStorage`
- se agrego opcion para reiniciar el odontograma al estado base
- se agrego persistencia de contexto UI: tab activo, pieza seleccionada y superficie activa
- se eliminaron archivos legacy de la raiz de `dentcool-project/`
- se agrego base de tests con `Vitest`
- se cubrio cambio de superficie y persistencia/restauracion local
- se agrego un modelo clinico normalizado inicial
- se dejo esquema base de `SQLite` en `db/schema.sql`
- se conecto la UI principal a partes del modelo clinico normalizado
- se abrio el bloque UX/UI
- se hizo una primera pasada sobre marca, header, odontograma y panel derecho
- se abrio el `Bloque Funcionalidades` de pacientes
- se agrego un directorio local de pacientes con seleccion de paciente activo
- se agrego formulario base para editar datos administrativos del paciente
- se agrego persistencia local del directorio y del paciente activo
- se alineo el header clinico al modelo normalizado de paciente
- se agregaron tests para helpers y persistencia de pacientes
- se movio la ficha administrativa de pacientes fuera del lienzo del odontograma
- la ficha de paciente ahora se abre como panel flotante desde `Nuevo paciente` o `Editar ficha`
- `Nuevo paciente` ahora existe como accion flotante fija en la vista clinica
- la ficha del paciente ya tiene menu interno con `Datos generales` y `Antecedentes`
- `Motivo y diagnostico`, `Evolucion clinica`, `Presupuesto`, `Documentos` e `Historial` quedaron marcados como siguiente fase dentro del flujo del paciente
- se corrigio el scroll interno de la ficha de paciente para que campos largos como `Direccion` no queden ocultos
- `Antecedentes medicos`, `Alergias y medicamentos` y `Habitos y antecedentes dentales` ahora son editables y guardables por paciente
- se abrio un `Bloque UX/UI` para la vista `Inicio`
- `Inicio` ahora tiene cabecera operativa, KPIs, agenda del dia, pacientes recientes, acciones rapidas, alertas clinicas, estado financiero y estado rapido
- se conecto la navegacion lateral para alternar entre `Inicio` y `Pacientes`
- se verifico estabilidad del bloque `Inicio` con `npm run build` y `npm test -- --run`
- se conecto `Motivo y diagnostico` al paciente activo como primer bloque clinico real
- `Motivo y diagnostico` ahora tiene persistencia local propia por `patientId`
- se agrego submodelo clinico editable para motivo, historia actual, examen clinico e impresion diagnostica
- los diagnosticos del tab ahora son editables, agregables y eliminables por paciente
- se agregaron tests del nuevo contrato clinico y de su persistencia local
- se conecto `Evolucion clinica` al paciente activo dentro del mismo registro clinico local
- `Evolucion clinica` ahora permite crear, editar y eliminar notas clinicas por paciente
- se migro `clinicalRecords` a una estructura mas amplia con compatibilidad hacia atras para los datos ya guardados de `Motivo y diagnostico`
- se agregaron tests de migracion y de contrato para la nueva estructura clinica
- se conecto `Historial` al paciente activo como registro resumido editable y persistente
- `Historial` ahora permite crear, editar y eliminar eventos clinicos o administrativos por paciente
- el registro clinico local ya cubre `Motivo y diagnostico`, `Evolucion clinica` e `Historial`
- se conecto `Presupuesto` al paciente activo con plan editable y tratamientos persistentes
- la tabla `Tratamientos y presupuesto` ahora consume tratamientos del paciente activo en vez de un mock compartido
- el registro clinico local ya cubre `Motivo y diagnostico`, `Evolucion clinica`, `Historial`, `Presupuesto` y tratamientos
- se conecto `Documentos` al paciente activo con persistencia local por `patientId`
- `Documentos` ahora permite crear, editar y eliminar registros documentales por paciente
- la ficha lateral del paciente ya edita `Motivo y diagnostico`, `Evolucion clinica`, `Presupuesto`, `Documentos` e `Historial` dentro del mismo flujo
- `Inicio` y la barra lateral ya no usan conteos fijos para pacientes y agenda
- el directorio ahora permite limpiar borradores vacios `Paciente nuevo`
- se agrego limpieza automatica para evitar acumulacion de borradores vacios duplicados
- el odontograma ya se separo por `patientId` dentro del mismo `clinicalRecord`
- al cambiar de paciente ahora se hidratan su odontograma, su pieza activa, su superficie activa y su tab clinico
- se migro el odontograma global legado al paciente activo inicial para no perder el estado previo
- el alta y la edicion de paciente ahora validan nombre obligatorio, RUT con formato basico y RUT no duplicado
- la ficha lateral ahora muestra errores de validacion visibles antes de guardar
- el primer guardado de un paciente nuevo ya completa automaticamente la fecha de registro si estaba vacia
- `Antecedentes` dejo de ser una maqueta fija y ahora refleja el paciente activo real
- el tab `Antecedentes` ahora muestra antecedentes medicos, alergias/medicamentos y habitos dentales reales por paciente
- el contador de `Antecedentes` ahora se calcula desde items activos reales del paciente
- la app ahora abre en `Inicio` como pantalla inicial
- `Pacientes` paso a ser un directorio general en filas
- desde el directorio se puede entrar a `Ver ficha` para abrir odontograma y tabs clinicos, o `Editar ficha` para abrir la hoja lateral
- `Inicio` ahora muestra seguimientos visibles con semaforo clinico y texto de preparacion segun cercania de la cita
- el saludo principal de `Inicio` quedo con acento visual del logo para reforzar identidad
- se agrego `CONTEXTO-ACTIVO-FICHA-DENTCOOL.md` como handoff persistente de sesion
- se agrego la skill local `dentcool-contexto` para reconstruir estado del proyecto al retomar
- `AGENTS.md` ahora define protocolo obligatorio de retoma y cierre de sesion
- se abrio un nuevo `Bloque Funcionalidades` para pricing y finanzas dentro de `Presupuesto`
- se creo el motor financiero puro en `src/pricing.js` con formulas de margen, mano de obra, alertas y precios sugeridos
- se agrego un catalogo base de pricing local para evaluacion, limpiezas, blanqueamiento, restauracion y sellantes
- se agregaron tests unitarios del modulo de pricing para casos base, descuento, alertas, mano de obra, precio recomendado y snapshot
- `Presupuesto` ahora muestra una lectura financiera estimada para tratamientos mapeados al catalogo base
- `PricingSettings` ya carga y guarda en `localStorage`
- `Presupuesto` ahora permite editar costos base de pricing desde la UI y reiniciarlos al valor por defecto
- el catalogo de tratamientos de pricing ya carga y guarda en `localStorage`
- `Presupuesto` ahora permite editar alias, precios, tiempos, descuentos y mano de obra del catalogo sin tocar `pricing.js`
- el `clinicalRecord` ya guarda `pricingBudgets` por paciente
- `Presupuesto` ahora puede guardar snapshots financieros historicos del paciente activo y marcar uno como `accepted`
- la navegacion lateral ahora abre una vista general de finanzas desde `Facturacion` y `Reportes`
- la nueva vista financiera agrega snapshots `accepted` por dia, semana y mes
- la vista financiera ya muestra objetivo operativo mensual, recientes aceptados y tratamientos con mayor aporte
- el objetivo financiero mensual ya es editable y persistente desde la vista general
- la vista financiera ya exporta CSV de snapshots `accepted`
- la vista financiera ya exporta CSV de resumen dia/semana/mes
- los snapshots financieros ahora soportan estados `sent`, `accepted`, `rejected` y `expired`
- `Presupuesto` ya permite cambiar estado del snapshot desde la ficha del paciente
- la vista general ya refleja conteos de `sent`, `draft`, `rejected` y `expired`
- la vista financiera general ahora filtra por rango (`todo`, `hoy`, `semana`, `mes`)
- la vista financiera general ahora filtra por estado (`all`, `draft`, `sent`, `accepted`, `rejected`, `expired`)
- la vista financiera general ahora filtra por paciente
- la vista financiera general ahora filtra por tratamiento
- se definieron columnas finales para reporte `SnapshotsAccepted` y `FinanceSummary`
- la vista financiera ya exporta un archivo `xlsx` con hojas `SnapshotsAccepted` y `FinanceSummary`
- `xlsx` ahora se carga de forma diferida solo al exportar Excel para no inflar el bundle principal
- la vista financiera general ahora compara periodo actual vs periodo anterior segun rango activo
- la vista financiera general ahora muestra totales agrupados por paciente
- la vista financiera general ahora muestra totales agrupados por tratamiento
- la vista financiera general ahora muestra una tabla detallada de snapshots segun filtros activos
- la vista financiera general ahora cruza snapshots con tratamientos reales y citas visibles del paciente
- la vista financiera general ahora muestra cobranza pendiente por paciente, pipeline clinico operativo y proximas atenciones segun filtros
- se verifico este bloque con `npm test` y `npm run build`
- se separaron entidades reales de `agenda` y `cobros/abonos` dentro del `clinicalRecord`
- `nextVisit` y `paid` quedaron como puente de compatibilidad, no como fuente final
- la ficha del paciente ahora tiene secciones propias para `Agenda` y `Cobros y abonos`
- los reportes financieros ahora priorizan `appointments` y `paymentEntries`, con fallback a datos legados
- se agregaron pruebas para migracion y reporte del nuevo modelo financiero
- el catalogo de pricing ahora muestra 5 tarjetas de lectura por tratamiento: `Costos`, `Gastos`, `Impuestos`, `Mano de obra` y `Utilidad neta`
- cada tarjeta del catalogo de pricing tiene una accion de `Restaurar` por tratamiento
- la ayuda contextual de `Gestion interna` ya abre explicacion clicable en la tarjeta
- los valores canonicos del catalogo base ya no deben arrastrarse entre tratamientos
- se volvio a verificar el bloque completo con `npm test` y `npm run build`
- el commit quedo subido a GitHub y, si Render esta conectado a `main` con auto-deploy, debe refrescar con ese push
- se inicio el `Bloque Funcionalidades - insumos MVP chico`
- se agrego el motor puro de insumos en `src/modules/supplies/suppliesCalculator.js`
- se agregaron seeds locales para catalogo, recetas, proveedores, unidades y compras
- se agrego persistencia local de insumos en `src/modules/supplies/suppliesStorage.js`
- se conecto el puente minimo hacia pricing con `supplySnapshotId`
- se agregaron tests unitarios del motor y de la persistencia de insumos
- el modulo de insumos ya pasa `npm test` y `npm run build`
- el tab `Insumos` ahora se simplifico a alta de nuevos materiales con listado opcional del catalogo
- el tab `Insumos` ahora explica la unidad de cantidad con ayudas `?` y muestra la base de compra del costo unitario

## Como se hizo este bloque

- se extendio `src/pricing.js` como motor puro para armar el panel financiero y sus reportes
- se reutilizaron snapshots `accepted` como base historica, sin recalcular presupuestos ya cerrados
- se derivaron lecturas operativas reales desde tratamientos existentes con `cost`, `paid`, `coveragePercent` y `status`
- se reutilizo `patient.nextVisit` como agenda visible temporal, solo para lectura operativa
- se conecto la UI en `src/app.jsx` para mostrar comparativo de periodos, totales por paciente, totales por tratamiento y detalle filtrado
- se ajustaron estilos en `styles.css` para sostener la nueva vista sin romper la navegacion actual
- se agregaron pruebas en `src/__tests__/pricing.test.js` para cubrir reportes, snapshots y exportaciones

## Que tenemos ahora

- un motor financiero local estable para estimacion, snapshots y reportes avanzados
- una vista financiera general con filtros por rango, estado, paciente y tratamiento
- comparativo entre periodo actual y periodo anterior
- totales agrupados por paciente
- totales agrupados por tratamiento
- tabla detallada de snapshots segun filtros activos
- lectura operativa real apoyada en tratamientos y citas visibles
- entidades separadas para citas y cobros/abonos dentro del modelo local
- cobertura automatizada que valida el bloque financiero sin romper lo anterior

## Que falta antes de seguir

- revisar el `md` financiero `dentcool_pricing_codex_skill.md`
- documentar explicitamente las decisiones tomadas en ese `md` y por que se tomaron
- cerrar el MVP chico de insumos con una UI minima mas adelante, sin mezclarlo aun con `SQLite`
- dejar el editor de catalogo de insumos en la version actual: alta simple de materiales y lista opcional
- preparar la siguiente capa de persistencia para que esto deje de vivir solo en `localStorage`
- seguir afinando la sincronizacion entre agenda, cobros, tratamientos y resumen financiero
- preparar la migracion de esta capa separada a `SQLite`

## Como se va a proceder

1. revisar y cerrar el `md` financiero con las decisiones y su justificacion
2. dejar el MVP chico de insumos en su corte actual: motor puro, tests, persistencia local y alta simple de materiales
3. mantener el puente operativo solo mientras no rompa compatibilidad
4. pasar la persistencia de este flujo a `SQLite` cuando el modelo ya este separado
5. volver a verificar con tests despues de cada cambio relevante

## Estado actual del proyecto

- UI: funcional
- UI: en refinamiento activo
- inicio operativo: funcional como entrada clinica con seguimiento visible por cercania de cita
- pacientes: funcional a nivel local base
- motivo y diagnostico: funcional por paciente con persistencia local
- evolucion clinica: funcional por paciente con persistencia local
- historial: funcional por paciente con persistencia local
- presupuesto y tratamientos: funcionales por paciente con persistencia local
- documentos: funcionales por paciente con persistencia local
- odontograma: funcional
- odontograma por paciente: funcional
- persistencia local: funcional
- modelo clinico base: funcional
- pricing financiero base: funcional en modo estimacion local
- pricing settings persistente: funcional
- pricing catalogo editable persistente: funcional
- snapshots financieros por paciente: funcional
- vista financiera general dia/semana/mes: funcional
- objetivo financiero general persistente: funcional
- exportacion CSV financiera: funcional
- estados financieros refinados: funcional
- filtros financieros por rango y estado: funcional
- filtros financieros por paciente y tratamiento: funcional
- exportacion Excel financiera: funcional
- carga diferida de `xlsx`: funcional
- comparativo financiero entre periodos: funcional
- totales financieros por paciente: funcional
- totales financieros por tratamiento: funcional
- tabla detallada de snapshots filtrados: funcional
- lectura operativa desde tratamientos reales: funcional
- lectura operativa desde citas visibles: funcional
- cobranza pendiente por paciente: funcional
- pipeline clinico operativo: funcional
- UI conectada parcialmente al modelo clinico: si
- backend: no
- SQLite runtime: no
- Excel exportacion financiera: si
- Tauri: no
- tests base odontograma: si

## Siguiente bloque recomendado

1. separar una entidad real de citas y otra de cobros para no depender solo de `nextVisit` y `paid`
2. limpiar el rol residual de `uiContext` global
3. despues preparar la transicion a `SQLite` runtime
4. evaluar cierre de caja, abonos y conciliacion con snapshots aceptados

## Riesgos abiertos

- la persistencia actual cubre directorio, odontograma y ficha clinica lateral por paciente, pero aun convive con un `uiContext` global residual
- la vista `Inicio` todavia mezcla datos reales locales con KPIs mock, por lo que todavia no debe asumirse como panel operativo real
- `Inicio` ya tiene seguimiento por cercania de cita, pero todavia conserva KPIs mock y conviene seguir afinando el peso visual de cada bloque
- aunque la ficha lateral ya concentra casi toda la edicion del paciente, el flujo general aun necesita pulido de UX para escritorio clinico
- el directorio de pacientes ya cambio a filas y aun falta validar ese comportamiento en Render con datos reales del navegador
- aun no hay validacion automatica del flujo clinico
- el alta de paciente ya tiene validaciones base, pero todavia faltan reglas de negocio mas profundas para agenda, documentos reales y trazabilidad clinica
- `Antecedentes` ya es real por paciente, pero conviene seguir revisando el resto de tabs una por una para quitar cualquier mock remanente
- aunque ya existe handoff persistente, sigue siendo necesario mantenerlo actualizado al cerrar cada bloque
- la exportacion Excel ya existe y `xlsx` ya no infla el bundle principal porque se carga bajo demanda, pero el chunk separado sigue siendo pesado al momento de exportar
- la agenda y los cobros ya dejaron de vivir solo en `nextVisit` y `paid`, pero aun conviven con ese puente para no romper los datos anteriores
- el `md` financiero pendiente de revision es `dentcool_pricing_codex_skill.md`, y ahi deben quedar registradas las decisiones tomadas y el motivo de cada una
