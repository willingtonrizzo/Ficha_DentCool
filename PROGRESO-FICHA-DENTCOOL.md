# PROGRESO-FICHA-DENTCOOL

## Donde vamos

Fase actual: `Bloque UX/UI - Inicio operativo y directorio` + `Bloque Funcionalidades - ficha clinica lateral por paciente`

Objetivo inmediato:

- mantener `Ficha-DentCool` estable en `Vite`
- consolidar la nueva vista `Inicio` como entrada operativa sin romper la vista clinica
- abrir el directorio local de pacientes sin romper el flujo clinico
- cerrar la ficha lateral con secciones clinicas reales por `patientId`

## Ultimo avance realizado

Fecha de referencia: `2026-05-11`

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
- se agrego `CONTEXTO-ACTIVO-FICHA-DENTCOOL.md` como handoff persistente de sesion
- se agrego la skill local `dentcool-contexto` para reconstruir estado del proyecto al retomar
- `AGENTS.md` ahora define protocolo obligatorio de retoma y cierre de sesion

## Estado actual del proyecto

- UI: funcional
- UI: en refinamiento activo
- inicio operativo: funcional como maqueta conectada a datos locales parciales
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
- UI conectada parcialmente al modelo clinico: si
- backend: no
- SQLite runtime: no
- Excel: no
- Tauri: no
- tests base odontograma: si

## Siguiente bloque recomendado

1. revisar una por una las secciones internas ya conectadas
2. limpiar el rol residual de `uiContext` global
3. preparar deploy demo para `Vercel` y `Render`
4. despues preparar la transicion a `SQLite` runtime

## Riesgos abiertos

- la persistencia actual cubre directorio, odontograma y ficha clinica lateral por paciente, pero aun convive con un `uiContext` global residual
- la vista `Inicio` todavia mezcla datos reales locales con KPIs mock, por lo que todavia no debe asumirse como panel operativo real
- aunque la ficha lateral ya concentra casi toda la edicion del paciente, el flujo general aun necesita pulido de UX para escritorio clinico
- aun no hay validacion automatica del flujo clinico
- el alta de paciente ya tiene validaciones base, pero todavia faltan reglas de negocio mas profundas para agenda, documentos reales y trazabilidad clinica
- `Antecedentes` ya es real por paciente, pero conviene seguir revisando el resto de tabs una por una para quitar cualquier mock remanente
- aunque ya existe handoff persistente, sigue siendo necesario mantenerlo actualizado al cerrar cada bloque
