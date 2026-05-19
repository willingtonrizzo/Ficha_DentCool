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

- Fecha de referencia de ultima verificacion local: `2026-05-18`.
- Rama local activa para trabajo: `ajustes-validacion-doctora`, siguiendo `origin/ajustes-validacion-doctora`.
- La app web pasa `npm test -- --run` con `83` tests verdes y `npm run build`.
- Existe una primera capa Playwright para pruebas tipo usuario; `npm run test:e2e` pasa con `2` tests de login/permisos.
- El modulo `Insumos` permite guardar costos con detalle, ver lista base/extras/tiempo extra, editar o eliminar historiales y restaurar el panel sin borrar snapshots.
- El detalle abierto del historial de insumos usa ancho ampliado en escritorio para revisar mejor tablas y comentarios.
- `Inventario` contiene un editor de listas base por tratamiento que persiste en el storage local de insumos.
- `Inicio` ya no muestra montos financieros de ejemplo ni acciones de relleno; funciona como panel operativo con datos reales disponibles y accesos por permisos.
- La app desktop pasa `npm run desktop:build` y genera `dentcool-project/src-tauri/target/release/bundle/nsis/DentCool_0.1.0_x64-setup.exe`.
- La app desktop fue instalada localmente desde ese instalador, con backup previo `backups/ficha-dentcool-20260518-170706.db`.
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
- Existe una primera capa de persistencia preparada para migrar a `Tauri + SQLite` sin romper el flujo web actual.
- Existe una migracion real parcial a `SQLite` para `patients` y `clinical_records`, con tablas de payload para conservar el objeto completo.
- Existe escritura a SQLite para las tablas hijas de la ficha clinica: odontograma, tratamientos, evoluciones, historial, agenda, cobros, documentos, budget y snapshots de presupuesto.
- Existe lectura desde SQLite para esa misma capa clinica, con respaldo todavia en payload completo para no romper compatibilidad.
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
- El modulo de insumos por paciente ya queda para uso clinico y referencia de costos; el alta de materiales nuevos vive en `Inventario`.
- `Presupuesto` ya tiene pack simple para `Admin` y `Dr` con maximo 3 tratamientos, descuento controlado, horas/sesiones y honorario doctor.
- `Admin` ve la referencia de box y traslado estimado del pack; `Dr` no ve costos internos.
- La linea del pack queda marcada como `saleKind: pack` para trazabilidad comercial.
- `Inventario` ya guarda fecha editable, tipo/numero de documento y una comparacion basica de precios por insumo.
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
- El modulo de insumos ya existe como MVP local con catalogo, recetas, snapshots, stock bajo y persistencia.
- El modulo de insumos ya permite alta/edicion simple de materiales y registro de compras.
- Las compras de insumos actualizan stock y costo promedio ponderado, y quedan guardadas en historial local.
- Existe login local MVP con roles `Admin`, `Dr` y `Staff`.
- `Staff` puede ver pacientes, agenda/documentos basicos y lista de precios sin acceder a costos internos, finanzas, presupuesto interno ni insumos.
- `Admin` y `Dr` pueden armar un pack simple desde el catalogo de pricing y agregarlo al plan del paciente como linea comercial.
- `Inventario` ya existe como vista general separada para compras, proveedores e historico.
- La ficha del paciente ya no contiene compra/proveedor; solo consumo clinico y costo guardado.
- `Inventario` ya puede registrar compras y mostrar proveedores fuera de la ficha clinica.
- `Inventario` ya guarda fecha editable, tipo/numero de documento y una comparacion basica de precios por insumo.
- `Inventario` ya permite filtrar el historial por proveedor e insumo.
- `Inventario` ya incluye alta de materiales al catalogo general para que la ficha no concentre gestion de inventario.
- `Inventario` ya puede capturar marca del material y conservarla en compras y comparacion historica.
- `Inventario` ya puede editar y eliminar compras reajustando stock y costo promedio.
- `Inventario` ya muestra trazabilidad ampliada del proveedor dentro del historial horizontal.
- `Inventario` ya permite editar proveedores, exportar CSV/XLSX y navegar el historial por proveedor.
- En la rama `ajustes-validacion-doctora`, los precios minimos vigentes quedan: `Evaluacion` $20.000, `Limpieza standard` $37.990, `Sellantes` $39.990 y `Restauracion simple` $39.990, sin cambiar precio lista ni costos internos.
- En la rama `ajustes-validacion-doctora`, `Evolucion clinica` tiene guardado explicito con boton `Guardar y ver historial` y un campo de texto mas alto para notas extensas.
- En la rama `ajustes-validacion-doctora`, el guardado automatico de ficha clinica queda diferido para reducir escrituras por tecla, y `Guardar y ver historial` sincroniza la evolucion como eventos visibles en `Historial`.
- En la rama `ajustes-validacion-doctora`, los eventos de historial generados desde evolucion incluyen boton `Editar evolucion` para volver a la nota original, y la categoria del historial se conserva si se edita.
- En la rama `ajustes-validacion-doctora`, `Historial` conserva el diseno de timeline con punto azul y linea clinica.
- En la rama `ajustes-validacion-doctora`, `Historial` muestra la fecha arriba de cada evento para liberar ancho horizontal en los campos.
- En la rama `ajustes-validacion-doctora`, `Inventario` muestra `Agregar proveedor` como formulario visible y selecciona automaticamente el proveedor nuevo para la compra actual.
- En la rama `ajustes-validacion-doctora`, `Registrar compra` ya no duplica el formulario rapido de proveedor; usa el boton `Agregar proveedor` para volver a la ficha principal de proveedor.
- En la rama `ajustes-validacion-doctora`, `Inventario` oculta la lista de proveedores por defecto detras del boton `Lista proveedores`.
- En la rama `ajustes-validacion-doctora`, `Inventario` muestra `Historial de costos por insumo` con filtro por insumo especifico para leer minimo, promedio, ultimo y maximo costo sin comparar productos distintos.
- En la rama `ajustes-validacion-doctora`, `Ver catalogo` en inventario usa tabla horizontal compacta y el usuario ya valido proveedor, compra, historial por proveedor y persistencia local al cerrar sesion.
- En la rama `ajustes-validacion-doctora`, `Agregar material` permite distinguir consumibles de amortizables; los amortizables usan unidad `uso`, desactivan stock minimo y calculan costo por uso/paciente estimado.
- En la rama `ajustes-validacion-doctora`, la tabla de `Insumos` muestra el origen amortizado para evitar que un equipo reutilizable se cargue al paciente por su precio completo.
- En la rama `ajustes-validacion-doctora`, `Insumos` separa `Estimado antes del tratamiento` y `Real despues del tratamiento`; el real posterior permite sumar insumos extra reales y costo de tiempo adicional, guardando diferencia contra estimado en el snapshot local.
- En la rama `ajustes-validacion-doctora`, inventario/insumos ya tiene tablas SQLite explicitas para catalogo, proveedores, compras, snapshots, listas base, categorias y unidades, con migracion desde la persistencia local previa cuando Tauri arranca con tablas vacias.
- En la rama `ajustes-validacion-doctora`, `Facturacion` es una vista propia de caja/cobranza local con cobros del dia, medios de pago, pendientes, historial y exportacion CSV/XLSX, alimentada por `paymentEntries` de pacientes.
- El repositorio local tiene remoto GitHub `https://github.com/willingtonrizzo/Ficha_DentCool.git`; se puede clonar desde ahi si el usuario tiene acceso.
- El inventario parte con un proveedor semilla (`Proveedor Dental X`) y permite crear/editar proveedores, pero la accion esta dentro de `Ver proveedores` y puede quedar poco visible.
- El motor de insumos ya contiene una funcion de costo amortizado y categorias de equipos amortizables, pero la UI aun no explica de forma suficiente como calcular el costo por uso de espejo, rotor, aeropulidor u otros reutilizables.
- `Insumos` por paciente ya distingue lista base del tratamiento e insumos extra agregados al caso, pero queda pendiente validar si esa diferencia es clara para la doctora.
- No se encontro un limite `maxLength` directo en notas clinicas; en la rama `ajustes-validacion-doctora` se agrego contador de caracteres, se corrigio el refresco del borrador y `Notas rapidas` paso a historial por control/fecha con vista de lectura y edicion por entrada dentro de `Editar ficha`.

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
- Si se empieza a descontar stock automaticamente sin definir que evento clinico confirma consumo real, los reportes de insumos pueden divergir de la operacion.
- El login local actual solo es barrera de uso para demo; no debe tratarse como seguridad real hasta tener usuarios/permisos robustos.
- El pack simple hoy no reemplaza agenda/caja real: crea una linea comercial unica y falta decidir si debe desglosar tratamientos, sesiones y cobros en fase posterior.
- El inventario general todavia necesita validacion de flujo: comparacion historica completa y reglas de documento obligatorio.
- `SQLite` ya dejo de ser solo scaffold: falta validar el arranque desktop nativo con datos reales y seguir puliendo casos borde de la lectura relacional.
- Ya quedo preparado un workflow de GitHub Actions para generar el instalador de Windows como release descargable.
- Las notas largas deben validarse de punta a punta para evitar perdida o recorte de contenido en guardado, vista resumida, exportacion o feedback.
- El flujo de proveedores puede percibirse incompleto si la creacion no esta visible al momento de registrar una compra.
- El costo de materiales reutilizables puede quedar mal estimado si no se captura vida util/usos estimados y mantenimiento/esterilizacion cuando aplique.
- Queda pendiente prueba manual con texto largo en Tauri/navegador para confirmar la experiencia real, aunque `npm test -- --run` y `npm run build` ya pasaron.
- Queda pendiente prueba manual de multiples entradas para confirmar que una nueva nota rapida no pisa la anterior.

## Siguiente paso recomendado

1. Probar login local, presupuesto pack simple e inventario general con `Admin`, `Dr` y `Staff`.
2. Validar con la doctora el flujo de insumos fase uno.
3. Decidir si insumos fase dos parte por descuento de stock al confirmar atencion o por editor de recetas.
4. Limpiar el rol residual de `uiContext` global frente al contexto por paciente.
5. Recién despues preparar persistencia `SQLite` runtime para pacientes y fichas.
6. Evaluar conciliacion futura entre snapshots aceptados, agenda y caja real.

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
- `dentcool-project/src/modules/supplies/suppliesCalculator.js`
- `dentcool-project/src/modules/supplies/suppliesStorage.js`
- `dentcool-project/src/modules/supplies/suppliesStorage.test.js`
- `dentcool-project/db/schema.sql`

## Actualizacion 2026-05-19 - Inicio

- La vista `Inicio` mantiene el hero de bienvenida `Bienvenido Admin/Staff`, redisenado con mayor contraste, color de marca y profundidad visual.
- La grilla KPI queda separada como `Seccion KPI`, con fondo de marca y morado en vez de amarillo para la zona de datos pendientes.
- El hero de bienvenida usa logo DentCool, fondo de marca real, chips operativos y tarjeta de paciente activo; se valido visualmente con Playwright tras corregir la interferencia de `.card`.
- La barra superior de la app usa fondo suave de marca, buscador integrado y avatar pequeno basado en la silueta del login.
- La barra lateral izquierda usa fondo de marca, navegacion tipo capsula, activo contrastado, logo en tarjeta y usuario integrado.
- `Seguimientos visibles` prioriza citas reales de `clinicalRecords.appointments`; el texto legacy `nextVisit` queda como compatibilidad.
- Desde Inicio se puede cambiar el estado de una cita real y cerrar pendientes como `Atendida / concluida`, `Cancelada` o `No asistio`.
- El recalculo de `nextVisit` excluye citas completadas, canceladas y no asistidas.

## Actualizacion 2026-05-19 - Inventario

- `Inventario` mantiene sus mismos paneles y datos, pero ahora se navega con tabs superiores visibles para reducir scroll: `Proveedor`, `Registrar compra`, `Agregar material`, `Costos por insumo`, `Ultimas compras`, `Historial proveedores` y `Lista tratamientos`.
- Las acciones internas que llevan a editar o revisar informacion cambian al tab correspondiente sin modificar la persistencia.
- Validacion: revision visual con Playwright, `npm test -- --run`, `npm run build` y `npm run test:e2e`.
