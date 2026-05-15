# CHECKLIST-FICHA-DENTCOOL

## Hecho

- [x] Definir nombre de trabajo `Ficha-DentCool`
- [x] Descomprimir y revisar el proyecto base
- [x] Crear `AGENTS.md`
- [x] Crear carpeta de referencias visuales
- [x] Crear skill `dentcool-odontologia`
- [x] Crear skill `dentcool-ux-ui`
- [x] Crear skill `dentcool-arquitectura`
- [x] Crear skill `dentcool-datos`
- [x] Crear skill `dentcool-excel`
- [x] Crear skill `dentcool-desktop`
- [x] Crear skill `dentcool-testing`
- [x] Instalar skills globales en `~/.codex/skills`
- [x] Migrar la app a `Vite + React`
- [x] Mover la app nueva a `src/`
- [x] Agregar persistencia local del odontograma
- [x] Persistir tab activo, pieza seleccionada y superficie seleccionada
- [x] Limpiar archivos legacy que quedaron en la raiz de `dentcool-project/`
- [x] Agregar tests del odontograma
- [x] Definir modelo de datos base para ficha clinica
- [x] Preparar base inicial para `SQLite`
- [x] Conectar el modelo clinico a mas partes de la app
- [x] Abrir bloque de diseno UX/UI y primera iteracion visual
- [x] Abrir primer bloque funcional de pacientes con persistencia local
- [x] Crear y estabilizar la vista `Inicio` como maqueta operativa conectada a la navegacion principal
- [x] Conectar `Motivo y diagnostico` al paciente activo con persistencia local
- [x] Volver editable `Evolucion clinica` por paciente activo
- [x] Llevar `Historial` al paciente activo
- [x] Llevar `Presupuesto` al paciente activo
- [x] Llevar `Documentos` al paciente activo
- [x] Consolidar la ficha lateral como editor principal de secciones internas
- [x] Limpiar y controlar borradores vacios `Paciente nuevo`
- [x] Llevar el odontograma al paciente activo
- [x] Validar alta y edicion de paciente con reglas base
- [x] Volver real el tab `Antecedentes` por paciente activo
- [x] Dejar `Inicio` como pantalla de entrada
- [x] Convertir `Pacientes` en directorio general en filas
- [x] Separar `Ver ficha` de `Editar ficha`
- [x] Refinar `Inicio` con seguimiento visible por cercania de cita y acento visual del saludo
- [x] Abrir base de pricing y finanzas dentro de `Presupuesto`
- [x] Crear `PricingSettings` persistente
- [x] Crear catalogo editable de tratamientos de pricing
- [x] Persistir snapshots financieros por paciente
- [x] Crear vista financiera general por dia, semana y mes
- [x] Volver editable el objetivo financiero general
- [x] Preparar exportacion y reportes financieros
- [x] Refinar estados financieros (`sent`, `rejected`, `expired`)
- [x] Agregar filtros financieros por rango y estado
- [x] Agregar filtros financieros por paciente y tratamiento
- [x] Revisar columnas finales del reporte financiero
- [x] Preparar exportacion Excel financiera
- [x] Optimizar carga de `xlsx` con importacion diferida
- [x] Refinar reportes financieros avanzados
- [x] Conectar reportes financieros a tratamientos reales y citas visibles
- [x] Separar entidad formal de citas
- [x] Separar entidad formal de cobros y abonos
- [x] Revisar `dentcool_pricing_codex_skill.md` y dejar registradas las decisiones financieras y su motivo
- [x] Iniciar el MVP chico de insumos con motor puro, storage local y tests
- [x] Conectar el puente minimo de insumos hacia pricing con `supplySnapshotId`
- [x] Agregar UI minima de alta de materiales dentro de la ficha
- [x] Permitir mostrar el catalogo local de insumos bajo demanda
- [x] Agregar ayudas contextuales para cantidad por unidad y origen del costo unitario

## En curso / siguiente

- [ ] Refinar el flujo real de uso del modulo de insumos con la doctora
- [ ] Decidir e implementar primera integracion real de `SQLite`
- [ ] Profundizar reportes financieros con datos mas operativos
- [ ] Refinar componentes UX/UI uno por uno
- [ ] Ajustar funcionalidades de negocio vivas
- [ ] Preparar deploy demo en `Vercel`
- [ ] Preparar deploy demo en `Render`
- [ ] Subir el estado actual para prueba de la doctora
- [x] Push a GitHub realizado para disparar despliegue en Render si esta conectado a `main`

## Mas adelante

- [ ] Importacion y exportacion Excel
- [ ] CRUD de pacientes completo
- [ ] Citas persistentes
- [ ] Empaquetado desktop con `Tauri`
- [ ] Suite de tests `Vitest + Playwright`
