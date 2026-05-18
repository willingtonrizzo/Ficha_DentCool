# CONTEXTO ACTIVO FICHA DENTCOOL

## Fecha de referencia

`2026-05-18`

## Estado resumido

`Ficha-DentCool` ya funciona como app local en `Vite + React` con persistencia local base y tests automatizados verdes.

Ruta activa del proyecto:

- `/Users/usuario/Ficha_DentCool/dentcool-project`

## Foco actual

- consolidar la ficha por paciente
- dejar la operacion local mas real
- sostener el modulo financiero ya operativo sobre snapshots por paciente
- seguir afinando reportes financieros avanzados ya conectados a tratamientos y citas visibles
- cerrar la primera migracion real a `SQLite` para pacientes y ficha clinica sin romper el flujo web actual
- validar lectura relacional completa en Tauri y revisar casos borde de la ficha ya escrita en SQLite
- dejar documentado el estado actual antes de subir para prueba de la doctora
- cerrar y validar fase uno del modulo de insumos antes de escalar a `SQLite`
- mantener documentacion viva para retomar sesiones sin perder contexto
- GitHub queda como fuente de despliegue para Render si el servicio esta conectado a `main` con auto-deploy
- anotar y resolver observaciones de validacion de la doctora sobre notas largas, proveedores, insumos amortizables y lista base vs insumos especificos

## Lo ultimo verificado

- `npm test` pasa
- `77` tests verdes
- `npm run build` pasa
- app Tauri instalada actualizada con `Notas rapidas` por paciente
- backup de SQLite creado en `backups/ficha-dentcool-20260516-184308.db`
- base real de Tauri ubicada en `C:\Users\welli\AppData\Roaming\com.dentcool.app\ficha-dentcool.db`
- instalador nuevo generado en `dentcool-project/src-tauri/target/release/bundle/nsis/DentCool_0.1.0_x64-setup.exe`
- `Notas rapidas` se valido manualmente con perfil `Admin`, cierre de sesion y cierre completo de app
- ya existen persistencias locales por paciente para:
  - `Motivo y diagnostico`
  - `Evolucion clinica`
  - `Historial`
  - `Presupuesto`
  - `Notas rapidas`
- la vista `Inicio` existe pero aun mezcla datos reales con mocks
- existe `src/pricing.js` con formulas base, alertas, margen y precios sugeridos
- `Presupuesto` ya muestra una lectura financiera estimada para tratamientos compatibles con el catalogo base
- `PricingSettings` ya es persistente y editable desde la UI de `Presupuesto`
- el catalogo de pricing ya es persistente y editable desde la UI de `Presupuesto`
- los snapshots financieros ya se guardan por paciente y pueden marcarse como `accepted`
- existe una vista financiera general por dia, semana y mes usando snapshots `accepted`
- el objetivo financiero mensual ya es editable y persistente desde la vista de finanzas
- la vista de finanzas ya exporta CSV de aceptados y CSV de resumen
- el flujo financiero ya soporta `sent`, `accepted`, `rejected` y `expired`
- la vista financiera general ya filtra por rango y estado
- la vista financiera general ya filtra por paciente y tratamiento
- la vista financiera ya exporta `xlsx` con hojas `SnapshotsAccepted` y `FinanceSummary`
- `xlsx` ya se carga de forma diferida y no infla el bundle principal en el arranque
- la vista financiera general ya compara periodo actual vs periodo anterior
- la vista financiera general ya muestra totales por paciente y por tratamiento
- la vista financiera general ya muestra una tabla detallada de snapshots segun filtros activos
- la vista financiera general ya usa tratamientos reales para leer valor planificado, en curso, realizado, cobrado, cobertura y saldo
- la vista financiera general ya usa citas visibles del paciente para mostrar proximas atenciones segun filtros
- la vista financiera general ya muestra cobranza pendiente por paciente y pipeline clinico operativo
- el puente temporal actual usa `nextVisit` para agenda visible y `paid` dentro de tratamientos para lectura operativa de cobros
- ese puente sirve para avanzar sin crear todavia una caja formal, pero ya quedo marcado como deuda tecnica
- la agenda y los cobros ya tienen entidades separadas en el `clinicalRecord`
- la ficha lateral ahora expone secciones propias para `Agenda` y `Cobros y abonos`
- los reportes financieros ya leen primero `appointments` y `paymentEntries`, con fallback legados para no romper datos viejos
- el catalogo de pricing ahora muestra resumen calculado por tratamiento con `Costos`, `Gastos`, `Impuestos`, `Mano de obra` y `Utilidad neta`
- cada tratamiento del catalogo ahora tiene accion de `Restaurar` para volver a su valor base original
- los campos `Gestion interna` y otros costos del catalogo ya tienen ayuda contextual clicable
- los tratamientos de pricing ya cargan valores base canonicos y no deben arrastrar montos cruzados entre cards
- la capa nueva ya paso por `npm test` y `npm run build`
- se inicio el MVP chico de insumos con motor puro, seeds, storage local y tests
- el modulo de insumos ya tiene puente minimo hacia pricing con `supplySnapshotId`
- el modulo de insumos ya paso `npm test` y `npm run build`
- el tab `Insumos` ya permite crear nuevos materiales y mostrar el catalogo local solo cuando se solicita
- el tab `Insumos` ya muestra ayuda contextual para cantidad por unidad y origen del costo unitario
- el tab `Insumos` ya permite registrar compras simples por material
- registrar una compra suma stock, recalcula costo promedio ponderado y persiste historial local de compras
- el historial de compras recientes ya aparece dentro del tab `Insumos`
- la ultima verificacion del bloque de insumos paso con `npm test -- --run` y `npm run build`
- se acordo que `Registrar compra` no corresponde definitivamente a la ficha por paciente; queda ahi solo como puente MVP para demostrar origen de cantidades, stock y precios
- la UI de insumos debe hablar de `lista base de insumos`, no de `receta`, para evitar confusion con receta medica
- el formulario de materiales ya permite configurar `Stock minimo alerta`
- el stock actual de un material se alimenta por compras; no se digita como stock inicial manual
- `minimumStock: 0` queda interpretado como sin alerta configurada
- existe login local MVP con roles `Admin`, `Dr` y `Staff`
- claves temporales locales: `admin123`, `dr123`, `staff123`
- `Staff` ve pacientes, datos/antecedentes/agenda/documentos y una `Lista precios`; no ve finanzas, presupuesto interno ni insumos
- `Dr` no ve insumos, compras/proveedores ni configuracion financiera interna
- `Dr` ve presupuesto simplificado con tratamiento, precio oficial, descuento, precio paciente y honorario doctor
- `Presupuesto` ahora tiene pack simple para `Admin` y `Dr`: hasta 3 tratamientos, modalidad mismo dia/dias separados, descuento maximo ponderado, precio paciente, minimo/sano/ideal, horas/sesiones y honorario doctor
- `Admin` ve ademas costo estimado de box y traslado por sesiones para el pack; `Dr` no ve costos internos
- `Agregar pack al plan` crea una linea comercial `Pack: ...` dentro de tratamientos del paciente
- esa linea queda marcada como `saleKind: pack` para poder distinguir venta de pack sin depender solo del texto
- la compra y el proveedor ya salieron de la ficha del paciente y viven en `Inventario`
- la ficha por paciente conserva solo el consumo clinico, la lista base y el costo guardado
- `Inventario` ahora guarda fecha editable, tipo/numero de documento y una comparacion basica de precios por insumo
- `Inventario` ahora permite filtrar el historial por proveedor e insumo
- `Inventario` ahora muestra el historial reciente mas limpio con fecha, proveedor, documento, costo unitario y nota
- la comparacion historica del inventario ahora incluye minimo, promedio, ultimo costo, maximo y proveedor del ultimo movimiento
- el alta de materiales del catalogo ya quedo movida desde la ficha del paciente al inventario general
- `Inventario` ahora permite capturar `marca` en el alta de materiales y conservarla en el historial de compras
- el historial y la comparacion del inventario ahora se muestran como tabla horizontal con columnas visibles
- `Inventario` ahora permite editar y eliminar compras, ajustando stock y costo promedio sin perder la trazabilidad
- el historial del inventario ahora muestra mas detalle de proveedor dentro de la misma fila horizontal
- `Inventario` ahora permite editar proveedores, exportar a CSV/XLSX y revisar un historial por proveedor mas navegable
- `Lista precios` muestra precio lista, descuento maximo recomendado y precio minimo sin costos internos
- el login local es barrera de uso para demo, no seguridad fuerte definitiva
- el repo local esta limpio y tiene remoto `origin` apuntando a `https://github.com/willingtonrizzo/Ficha_DentCool.git`, por lo que se puede clonar si hay credenciales/acceso
- proveedores ya existe como maestro editable dentro de `Inventario`, pero parte desde una semilla unica `Proveedor Dental X`
- el motor de insumos ya tiene calculo de amortizacion y semillas de equipos amortizables, pero falta una UI clara para explicar/capturar costo de espejo, rotor, aeropulidor u otros materiales reutilizables
- no se encontro `maxLength` explicito en notas clinicas; queda pendiente ubicar la pantalla exacta de `notas rapidas`, `detalle` o `feedback` donde el texto se corta o se pierde
- en la rama `ajustes-validacion-doctora`, `Notas rapidas` ya refresca el borrador cuando cambia cualquier campo de notas y muestra contador de caracteres para nota rapida, detalle y feedback
- la prueba automatica del modelo clinico ahora cubre notas rapidas largas sin truncar
- verificacion actual del bloque de notas largas: `npm test -- --run` paso con `77` tests y `npm run build` paso correctamente
- `Notas rapidas` ahora funciona como historial por control/fecha: vista de lectura primero, boton `Nueva nota rapida`, boton `Editar` por entrada y multiples entradas por paciente
- verificacion actual del bloque multiple: `npm test -- --run` paso con `78` tests y `npm run build` paso correctamente
- servidor local activo para revision en `http://127.0.0.1:5173/`
- se descarto la reubicacion de `Notas rapidas` bajo el odontograma por validacion visual del usuario
- `Notas rapidas` vuelve a vivir dentro de `Editar ficha > Secciones internas del paciente`, conservando multiples entradas por control/fecha
- verificacion actual tras revertir ubicacion: `npm test -- --run` paso con `78` tests y `npm run build` paso correctamente
- en la rama `ajustes-validacion-doctora` se ajustaron solo precios minimos: `Evaluacion` $20.000, `Limpieza standard` $37.990, `Sellantes` $39.990 y `Restauracion simple` $39.990
- el ajuste de precios minimos tambien se aplica al cargar catalogo persistido para que no queden valores antiguos en el navegador local
- verificacion actual de precios minimos: `npm test -- --run` paso con `78` tests y `npm run build` paso correctamente
- `Evolucion clinica` ahora tiene boton explicito `Guardar y ver historial`; guarda la ficha y lleva a la seccion `Historial`
- el textarea de evolucion quedo mas alto para ingresar parrafos clinicos largos con mejor legibilidad
- verificacion actual de evolucion clinica: `npm test -- --run` paso con `78` tests y `npm run build` paso correctamente
- se corrigio el guardado automatico de ficha clinica para que espere brevemente antes de persistir y no escriba por cada tecla
- `Guardar y ver historial` ahora sincroniza las notas de evolucion como eventos visibles en `Historial`
- verificacion actual de persistencia/historial de evolucion: `npm test -- --run` paso con `78` tests y `npm run build` paso correctamente
- `Historial` ahora muestra boton `Editar evolucion` en eventos generados desde evolucion clinica; vuelve a la nota original y la resalta
- las categorias editadas en `Historial` se conservan al resincronizar evolucion
- verificacion actual del enlace historial-evolucion: `npm test -- --run` paso con `78` tests y `npm run build` paso correctamente
- se recupero el diseno de timeline de `Historial` con punto azul y linea clinica
- verificacion actual del estilo de historial: `npm test -- --run` paso con `78` tests y `npm run build` paso correctamente
- la fecha de cada evento de `Historial` quedo arriba de la entrada para que titulo, categoria, acciones y texto tengan mas ancho
- verificacion actual del layout ancho de historial: `npm test -- --run` paso con `78` tests y `npm run build` paso correctamente
- `Inventario` ahora muestra `Agregar proveedor` como formulario visible y no solo detras de `Ver proveedores`
- `Registrar compra` ahora tiene boton directo `Agregar proveedor`, y al guardar proveedor queda seleccionado en la compra
- verificacion actual de proveedores visibles: `npm test -- --run` paso con `78` tests y `npm run build` paso correctamente
- `Registrar compra` ahora despliega un formulario rapido de proveedor dentro del mismo bloque, con `Guardar y seleccionar`
- verificacion actual de proveedor rapido: `npm test -- --run` paso con `78` tests y `npm run build` paso correctamente

## Decision de producto vigente

Separar por ahora:

- `landing publica`
- `ficha clinica local`

Razon:

- privacidad de datos
- menor complejidad tecnica
- menos riesgo de mezclar captacion con ficha clinica
- la ficha todavia esta en fase de consolidacion local

## Siguiente paso recomendado

1. entregar la build actual para prueba de la doctora, validando login, permisos y presupuesto pack simple
2. probar login local con `Admin`, `Dr` y `Staff` antes de entrega, validando que `Dr` no vea insumos ni costos internos
3. probar presupuesto pack simple con ejemplos reales: `Limpieza VIP + Blanqueamiento` y `Evaluacion + Limpieza standard + Blanqueamiento`
4. validar con la doctora si el pack debe quedar como linea unica o desglosar automaticamente tratamientos
5. validar con la doctora la nueva vista `Inventario`: compras, proveedores, fecha, documento y comparacion de precios
6. validar con la doctora el flujo de insumos fase uno: alta de material, lista base y snapshot
7. decidir si fase dos de insumos parte por descuento de stock al confirmar atencion o por editor de listas base
8. seguir limpiando el `uiContext` global residual
9. seguir refinando la operacion local antes de `SQLite runtime` completo
10. preparar la futura transicion a `SQLite` sin mezclar demasiados frentes
11. convertir las observaciones rapidas levantadas el `2026-05-17` en un bloque corto de ajustes de producto antes de ampliar inventario

## Riesgos abiertos

- `Inicio` todavia no es panel 100% real
- parte del flujo clinico sigue compartiendo mocks
- `SQLite` ya existe como runtime parcial; lectura y escritura de las tablas clinicas ya quedaron cubiertas en codigo y tests, falta validar arranque desktop nativo y casos borde
- falta protocolo de backup local antes de escalar uso real
- el pricing ya tiene settings, catalogo, snapshots, estados refinados, vista general, objetivo editable, exportacion CSV, exportacion Excel y filtros/reportes avanzados completos, y ahora cruza tratamientos/citas visibles
- seguir usando `nextVisit` y `paid` como puente por mucho tiempo hara mas costosa la separacion de agenda y caja
- la separacion existe en modelo y UI, pero el puente legado sigue activo para compatibilidad
- el bloque visual del catalogo de pricing ya quedo estabilizado y no debe volver a mezclar valores entre tratamientos
- el modulo de insumos por paciente quedo mas clinico; el alta de materiales vive en inventario y falta validar el flujo real de uso con la doctora
- insumos todavia no descuenta stock automaticamente por atencion confirmada ni tiene editor completo de recetas
- compras y alta de materiales ya viven en una vista general de inventario; falta seguir refinando trazabilidad y comparacion historica
- falta historial analitico de compras para comparar precios por proveedor, fecha e insumo
- login local no reemplaza usuarios reales ni permisos robustos; requiere rediseño al pasar a SQLite/Tauri
- modo `Dr` simplificado debe validarse con flujo real de descuentos y honorarios
- el pack simple hoy agrega una linea comercial unica al plan; falta decidir si en fase siguiente debe desglosar tratamientos y agenda/cobros separados
- el inventario general ahora existe como vista separada; falta validarlo con la doctora y decidir si requiere reglas finales de documento y trazabilidad historica completa
- el despliegue demo conectado a GitHub debe refrescarse desde el push a `main` si Render esta apuntando a ese repo
- los paneles principales de inventario quedaron resaltados visualmente para distinguir mejor cada bloque sin tocar el flujo
- ya existe una primera capa de persistencia pensada para `Tauri + SQLite`; la migracion real de pacientes y ficha clinica ya comenzo
- el arranque desktop ya detecto que faltaba `cargo` en la laptop; se instalo `rustup` y el primer `tauri dev` ya compila y abre la ventana
- el icono provisional de la app desktop ya usa el logo DentCool en formato cuadrado; luego puede reemplazarse por uno final
- la configuracion desktop ya pre-carga SQLite en `tauri.conf.json` y expone permisos explicitos para `load/select/execute`
- el empaquetado `npm run tauri build` ya termino bien y dejo un binario de release en `src-tauri/target/release/dentcool`
- SQLite ya arranca con el esquema real de `db/schema.sql` al abrir Tauri
- la primera migracion real de tablas a SQLite ya esta en marcha para `patients` y `clinicalRecords`
- el resto de tablas clinicas ya quedo escrito y leido desde SQLite en el puente actual; falta validar el arranque desktop nativo y revisar casos borde en Tauri
- el workflow de Windows quedo separado: `tauri-action@v0.6.2` construye y `actions/upload-artifact@v4` sube el instalador a Actions, evitando el problema de publication inputs no soportados
- la fecha de nacimiento en la ficha de paciente paso a un selector dia/mes/anio para evitar el picker nativo cortado en escritorio
- el formulario del paciente quedo mejor contenido verticalmente para que el footer no se recorte en Tauri
- el modal de ficha de paciente quedo mas bajo y centrado para entrar mejor en la ventana desktop
- el modal de ficha de paciente quedo mas compacto en paddings y alturas para que el footer tenga mas chance de aparecer sin scroll extra
- se compactaron tambien el header del directorio, la grilla de secciones y el bloque inicial de datos generales para liberar mas alto util en la ficha
- la edad del paciente ahora aparece tanto en la lista del directorio como en la cabecera de la ficha activa
- la edad ahora se recalcula desde la fecha de nacimiento al guardar
- el correo se valida con presencia de `@` y de punto despues del dominio
- el RUT mantiene validacion basica y unicidad
- ya quedo preparado el workflow de GitHub Actions para sacar el instalador de Windows sin compilarlo a mano en la laptop de la clienta
- si las notas largas se cortan o solo muestran una parte, se pierde informacion clinica/operativa relevante; hay que validar guardado y visualizacion completa
- si proveedores queda escondido detras de `Ver proveedores`, la doctora puede creer que solo existe `Proveedor Dental X`
- si espejo, rotor o aeropulidor se cargan como unidad/dosis sin amortizacion visible, el costo por tratamiento queda poco confiable
- si no queda clara la diferencia entre lista base de insumos del tratamiento e insumos especificos del caso, la ficha puede mezclar costos transversales con excepciones clinicas
- queda pendiente validacion manual en Tauri/navegador con texto largo real y cambio de paciente, aunque la cobertura automatizada y build ya estan verdes
- queda pendiente validar manualmente que una segunda entrada de otro dia no reemplaza la anterior y que la vista de lectura muestra las tres partes completas
- queda pendiente validar manualmente que `Notas rapidas` aparece correctamente dentro de `Editar ficha` en `Admin` y `Dr`
- queda pendiente validar manualmente los nuevos precios minimos en `Lista precios` y `Presupuesto`
- queda pendiente validar manualmente con dos parrafos largos en `Evolucion clinica`
- queda pendiente validar visualmente que la evolucion aparece como evento en `Historial` y que el estado de guardado no parpadea por cada letra
- queda pendiente validar visualmente el boton `Editar evolucion` desde `Historial`
- queda pendiente validar visualmente que el punto azul y la linea del historial se ven bien en la ventana real
- queda pendiente validar visualmente que el nuevo ancho del historial queda comodo en la ventana real
- inventario se esta reordenando para que `Proveedor` quede primero y el resto siga el orden operativo pedido por la doctora
- la ficha de proveedor se simplifico a los campos operativos que pidio: nombre, telefono, web, direccion, despacho y estado
- el formulario inline rapido de proveedor dentro de compras se elimino para evitar duplicidad y confusion
- `Inventario` ahora oculta la lista de proveedores por defecto y la muestra desde el boton `Lista proveedores`, para evitar scroll largo cuando crezca el maestro
- `Inventario` ahora muestra `Historial de costos por insumo` con filtro por insumo, en vez de `Comparacion de precios`, para evitar confundir productos distintos
- `Ver catalogo` ahora muestra los materiales como tabla horizontal compacta
- validacion manual del usuario: proveedor creado, compra registrada, historial por proveedor visible, cierre de sesion y reingreso conservan datos locales de inventario
- verificacion actual del ajuste visual de inventario: `npm test -- --run` paso con `78` tests y `npm run build` paso correctamente
- `Agregar material` ahora distingue `Consumible` y `Amortizable`
- para materiales amortizables, la UI usa unidad `uso`, desactiva stock minimo y permite definir `Usos/pacientes estimados`
- los insumos amortizables se calculan por costo por uso, no por el precio completo del equipo
- la tabla de `Insumos` muestra el origen `Amortizado: X usos / $Y`
- verificacion actual del bloque de amortizacion: `npm test -- --run` paso con `79` tests y `npm run build` paso correctamente
- `Insumos` ahora separa `Estimado antes del tratamiento` y `Real despues del tratamiento`
- el estimado usa lista base + extras planificados; el real posterior suma insumos extra reales, minutos extra y costo de tiempo extra
- el snapshot local de insumos guarda estimado, final real y diferencia para analizar ajustes futuros de listas base y precios
- verificacion actual del comparativo de insumos: `npm test -- --run` paso con `79` tests y `npm run build` paso correctamente
- SQLite de inventario/insumos ya tiene tablas explicitas para catalogo, proveedores, compras, snapshots, listas base, categorias y unidades
- en Tauri, inventario/insumos se hidrata desde esas tablas SQLite y migra desde la persistencia local previa si las tablas estan vacias
- cada guardado de inventario/insumos actualiza tambien la tabla SQLite correspondiente
- verificacion actual de SQLite inventario/insumos: `npm test -- --run` paso con `79` tests y `npm run build` paso correctamente

## Instruccion de retoma

Cuando se retome este proyecto en una sesion nueva, pedir:

`Revisa AGENTS.md y CONTEXTO-ACTIVO-FICHA-DENTCOOL.md en /Users/usuario/Ficha_DentCool y dime donde quedamos`
