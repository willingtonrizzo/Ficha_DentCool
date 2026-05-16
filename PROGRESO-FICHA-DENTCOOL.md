# PROGRESO-FICHA-DENTCOOL

## Donde vamos

Fase actual: `Bloque UX/UI - Inicio operativo y directorio` + `Bloque Funcionalidades - ficha clinica lateral por paciente` + `Bloque Funcionalidades - SQLite parcial para pacientes y ficha clinica`

Objetivo inmediato:

- mantener `Ficha-DentCool` estable en `Vite`
- consolidar la nueva vista `Inicio` como entrada operativa sin romper la vista clinica
- abrir el directorio local de pacientes sin romper el flujo clinico
- cerrar la ficha lateral con secciones clinicas reales por `patientId`
- afinar `Inicio` para que los seguimientos visibles funcionen como recordatorio clinico por cercania de cita

## Ultimo avance realizado

Fecha de referencia: `2026-05-16`

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
- se inicio una migracion real a `SQLite` para `patients` y `clinicalRecords`
- se agregaron tablas de payload para guardar el paciente completo y la ficha completa sin perder el puente `app_kv`
- se completo la lectura y escritura relacional de la ficha clinica en SQLite, manteniendo payload de respaldo para compatibilidad
- `storage.js` ahora usa la misma normalizacion para navegador y desktop
- se agregaron tests de persistencia para el nuevo puente de `SQLite`
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
- se cerro una capa mas de fase uno del modulo de insumos con registro simple de compras
- registrar una compra ahora suma stock real al material, recalcula costo promedio ponderado y guarda historial local en `purchases`
- el tab `Insumos` ya muestra ultimas compras registradas dentro del modulo local
- se amplio la cobertura de storage de insumos para persistir compras
- se verifico el bloque con `npm test -- --run`: `65` tests verdes
- se verifico el bloque con `npm run build`: build correcto
- se aclaro la nomenclatura del modulo: `receta` pasa a mostrarse como `lista base de insumos`
- se decidio sacar `Registrar compra` de la ficha del paciente y moverlo a un modulo general de inventario
- la vista `Inventario` ya registra compras, proveedores, fecha y documento, y muestra una comparacion basica de precios por insumo
- el formulario de material ahora permite configurar `Stock minimo alerta`
- el stock actual no se configura manualmente: se alimenta con compras registradas
- `minimumStock: 0` ahora significa sin alerta configurada y no dispara stock bajo con stock `0`
- se agrego login local MVP con roles `Admin`, `Dr` y `Staff`
- `Staff` puede entrar a pacientes, datos/antecedentes/agenda/documentos y lista de precios sin ver finanzas, presupuesto interno ni insumos
- se agrego vista `Lista precios` para recepcion con precio lista, descuento maximo recomendado y precio minimo sin mostrar costos internos
- se agrego cierre de sesion local
- se agregaron tests de auth local; verificacion actual: `68` tests verdes y `npm run build` correcto
- se ajusto rol `Dr` para no ver `Insumos`, compras, proveedores ni configuracion financiera interna
- `Dr` conserva presupuesto en vista simplificada: tratamiento, precio oficial, descuento, precio paciente y honorario doctor
- se agrego `Bloque Funcionalidades - presupuesto pack simple`
- `Presupuesto` ahora permite armar un pack de hasta 3 tratamientos desde el catalogo de pricing
- el pack calcula precio base, precio paciente con descuento, minimo/sano/ideal, horas clinicas, sesiones y honorario doctor
- el descuento del pack se limita por un maximo ponderado segun los tratamientos seleccionados
- `Admin` ve una referencia interna de box y traslado estimado por sesiones; `Dr` solo ve referencia comercial sin costos internos
- el boton `Agregar pack al plan` crea una linea de tratamiento tipo `Pack: ...` en el presupuesto del paciente
- esa linea ahora queda marcada como `saleKind: pack` para poder contar packs vendidos sin depender solo del texto
- la seleccion del pack queda persistida dentro del presupuesto local por paciente
- se verifico el bloque con `npm test -- --run`: `70` tests verdes
- se verifico el bloque con `npm run build`: build correcto
- estado actual listo para prueba de la doctora en navegador local o despliegue GitHub/Render si esta conectado
- se inicio la separacion de compras/proveedores fuera de la ficha del paciente
- `Insumos` por paciente ahora queda solo con lista base, ajustes clinicos, stock bajo y costo guardado
- se agrego la vista general `Inventario` para registrar compras, revisar proveedores, dar de alta materiales y ver historico de compras
- la vista `Inventario` ya queda disponible para `Admin` y `Dr`, no para `Staff`
- la compra ya no vive en la ficha del paciente; ahora vive en el inventario general
- la vista `Inventario` ahora guarda fecha editable, tipo/numero de documento y una comparacion basica de precios por insumo
- la vista `Inventario` ahora permite filtrar el historial por proveedor e insumo
- la vista `Inventario` ahora muestra historial mas limpio con fecha, proveedor, documento, costo unitario y nota
- la comparacion historica del inventario ahora resume minimo, promedio, ultimo costo, maximo y proveedor del ultimo movimiento
- el alta de materiales del catalogo quedo movida desde la ficha del paciente al inventario general
- la vista `Inventario` ahora permite registrar `marca` del material y la conserva en el historial de compras
- el historial y la comparacion del inventario quedaron como tabla horizontal con columnas visibles por insumo
- el inventario general ahora permite editar y eliminar compras sin romper stock ni costo promedio
- el inventario general ahora permite editar proveedores desde la misma vista
- el inventario general ahora exporta compras, comparacion y proveedores a CSV/XLSX
- el historial por proveedor ahora es navegable desde una vista resumen del propio inventario
- el historial del inventario ahora muestra mas trazabilidad del proveedor en la misma fila horizontal
- se verifico la separacion con `npm test -- --run`: `72` tests verdes
- se verifico la separacion con `npm run build`: build correcto

## Como se hizo este bloque

- se extendio `src/pricing.js` como motor puro para armar el panel financiero y sus reportes
- se reutilizaron snapshots `accepted` como base historica, sin recalcular presupuestos ya cerrados
- se derivaron lecturas operativas reales desde tratamientos existentes con `cost`, `paid`, `coveragePercent` y `status`
- se reutilizo `patient.nextVisit` como agenda visible temporal, solo para lectura operativa
- se conecto la UI en `src/app.jsx` para mostrar comparativo de periodos, totales por paciente, totales por tratamiento y detalle filtrado
- se ajustaron estilos en `styles.css` para sostener la nueva vista sin romper la navegacion actual
- se agregaron pruebas en `src/__tests__/pricing.test.js` para cubrir reportes, snapshots y exportaciones
- en el bloque de insumos se reutilizo `applyPurchaseToStock` para no duplicar la regla de costo promedio ponderado dentro de la UI
- se mantuvo la persistencia en `localStorage` mediante `saveSupplyState`, sin introducir `SQLite` todavia
- se mantuvo la compra dentro de la ficha solo por demostracion del flujo completo de fase uno
- se ajusto `checkLowStock` para ignorar alertas cuando el minimo es `0`
- se creo `src/auth.js` para login local, permisos por rol y sesion persistida en `localStorage`
- se agrego una pantalla de login visual en `src/app.jsx`
- se filtro navegacion, tabs de paciente y secciones internas segun rol
- se separo `Presupuesto` en modo completo para `Admin` y modo simple para `Dr`
- se agrego `calculateSimpleTreatmentPack` en `src/pricing.js` como motor puro para paquetes simples
- se extendio `createBudgetRecord` para persistir seleccion, modalidad y descuento del pack
- se permitio que `handleAddTreatment` reciba datos iniciales para agregar el pack como linea del plan
- se agregaron tests unitarios para descuento ponderado, limite de 3 tratamientos y persistencia del pack
- se movio el flujo de compra/proveedor a un inventario general con estado local propio
- se simplifico `Insumos` por paciente quitando compra/proveedor y dejando solo consumo clinico
- se agrego `InventarioInsumos` como nueva vista general con registro de compra, historial y proveedores
- se actualizo el login/permisos para que `Admin` y `Dr` vean inventario, pero `Staff` no

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
- un MVP de insumos fase uno con catalogo local, recetas, snapshots, stock bajo, alta/edicion simple de materiales y registro de compras persistente
- las compras de insumos actualizan stock y costo unitario promedio sin tocar aun caja contable ni proveedores avanzados
- la UI ya evita llamar `receta` a la lista clinica de materiales para no confundirla con receta medica
- cada material puede definir un minimo para alertas; el stock real sigue entrando por compras
- acceso local por rol para demo: `Admin`, `Dr` y `Staff`
- lista de precios visible para recepcion sin exponer costos internos
- presupuesto simplificado para `Dr` sin costos internos, pricing avanzado ni gestion de insumos
- presupuesto pack simple para `Admin` y `Dr`, con maximo 3 tratamientos, modalidad por sesiones y descuento controlado
- inventario general separado de la ficha del paciente, con compras y proveedores fuera del flujo clinico
- inventario general con historial mas legible y comparacion historica mas util por insumo

## Que falta antes de seguir

- validar con la doctora si el pack debe crear una sola linea comercial o tambien desglosar automaticamente cada tratamiento dentro del plan
- definir si el descuento de pack requiere aprobacion explicita de `Admin` cuando lo aplica `Dr`
- validar con la doctora si el inventario general necesita proveedor obligatorio, numero de boleta/factura, fecha editable o solo registro rapido
- decidir si el siguiente paso de insumos es descuento de stock al confirmar atencion o editor de recetas por tratamiento
- mover `Registrar compra` a inventario general cuando exista la vista global de insumos
- fase dos de inventario debe permitir fecha editable, proveedor, direccion/contacto del proveedor, documento/boleta y analisis historico de compras por insumo
- ejemplo esperado fase dos: Dental X compro `sombrilla` el `2026-05-10`, 50 unidades por $5.000; luego otra compra en otra fecha para comparar evolucion de precios
- preparar la siguiente capa de persistencia para que esto deje de vivir solo en `localStorage`
- seguir afinando la sincronizacion entre agenda, cobros, tratamientos y resumen financiero
- preparar la migracion de esta capa separada a `SQLite`
- reemplazar claves locales temporales por usuarios reales cuando exista persistencia segura

## Como se va a proceder

1. validar el flujo real de insumos con la doctora usando alta de material, compra, receta y snapshot
2. decidir si fase dos parte por descuento de stock por atencion o por editor de recetas
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
- insumos catalogo local: funcional
- insumos compras y stock: funcional en fase uno local
- insumos snapshots por paciente: funcional
- login local MVP: funcional
- lista de precios para staff: funcional
- presupuesto doctor simplificado: funcional
- UI conectada parcialmente al modelo clinico: si
- backend: no
- SQLite runtime: no
- Excel exportacion financiera: si
- Tauri: no
- tests base odontograma: si

## Siguiente bloque recomendado

1. probar con la doctora el flujo `Agregar material` -> `Registrar compra` -> `Guardar snapshot`
2. probar login con `Admin`, `Dr` y `Staff` antes de entregar demo, especialmente restricciones de presupuesto e insumos
3. decidir si insumos fase dos sera descuento de stock por atencion confirmada o editor de recetas
4. limpiar el rol residual de `uiContext` global
5. preparar la entrada de `Tauri + SQLite` con una primera capa de persistencia local
6. evaluar cierre de caja, abonos y conciliacion con snapshots aceptados

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
- insumos ya registra compras y actualiza stock, pero todavia no descuenta stock automaticamente al cerrar una atencion
- insumos todavia no tiene editor completo de recetas por tratamiento ni control avanzado de proveedores/documentos de compra
- `Registrar compra` no debe quedarse definitivamente dentro de la ficha por paciente; queda ahi temporalmente para probar fase uno
- falta historial analitico de compras para ver variacion de precios por proveedor, fecha e insumo
- el login actual es una barrera local de MVP, no seguridad fuerte; no usar como seguridad real hasta tener usuarios/permisos persistidos de forma robusta
- el modo `Dr` aun requiere validacion de negocio fina sobre descuentos y honorarios antes de uso real con doctores externos
- inventario general: paneles principales resaltados visualmente para distinguir mejor `Agregar material`, `Registrar compra`, `Ultimas compras`, `Comparacion de precios`, `Proveedores` e `Historial por proveedor`
- base de `Tauri + SQLite` ya iniciada con capa de persistencia y scaffold desktop, pendiente validar el arranque nativo
- arranque desktop en progreso: `cargo` no estaba instalado en la laptop y ya se instalo `rustup` para poder correr `npm run tauri dev`
- icono desktop provisional de Tauri ya usa el logo DentCool en un cuadrado, pendiente revisar si luego se reemplaza por uno final
- SQLite desktop ya queda pre-cargado desde `tauri.conf.json` y con permisos explicitos para `load/select/execute`
- `npm run tauri build` ya termino bien y dejo el binario de release en `src-tauri/target/release/dentcool`
- SQLite desktop ya inicializa el esquema real desde `db/schema.sql` al arrancar Tauri
- la primera migracion real de pacientes y ficha clinica a SQLite ya pasa `npm test -- --run` y `npm run build`
- se completo la escritura de las tablas clinicas hijas en SQLite: odontograma, tratamientos, evoluciones, historial, agenda, cobros, documentos, presupuesto y snapshots de presupuesto
- se completo tambien la lectura de esas tablas clinicas desde SQLite en el puente actual
- el workflow de GitHub Actions para Windows ya paso a `tauri-action@v1` para volver a probar la publicacion del instalador con la version actual de la accion
- la verificacion actual sigue en verde con `npm test -- --run`: `74` tests y `npm run build`
- la fecha de nacimiento en la ficha de paciente paso a un selector dia/mes/anio para evitar el picker nativo recortado en Tauri
- el formulario del paciente quedo con mejor distribucion vertical para que el footer no se corte en escritorio
- el modal de ficha de paciente quedo mas bajo y mas centrado para que el bloque entre mejor en la ventana de Tauri
- el modal de ficha de paciente quedo mas compacto en paddings y alturas para que entren mejor los controles y el footer
- se compactaron tambien el encabezado del directorio, la grilla de secciones y el bloque inicial de datos generales para abrir espacio visible hacia abajo
- la edad del paciente ahora se muestra en la lista general y en la cabecera de la ficha activa
- la edad del paciente ahora se recalcula desde la fecha de nacimiento al guardar para evitar valores viejos como `0`
- el correo del paciente ahora se rechaza si no tiene `@` o si no tiene punto despues del `@`
- la validacion de RUT sigue activa con formato basico y control de duplicados
- se preparo el workflow de GitHub Actions para generar un instalador de Windows desde `dentcool-project`
