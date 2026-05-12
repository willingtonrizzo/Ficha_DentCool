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
- Existen pruebas automatizadas base del odontograma y de persistencia local.
- Existe un modelo clinico base y un esquema inicial de `SQLite`.

## Hallazgos por skill

### Arquitectura

- La fase actual es post-migracion inicial.
- El mayor cuello de botella tecnico ya no es `window.*` en runtime, sino cerrar la limpieza de archivos legacy y seguir separando dominio, persistencia y UI.
- La siguiente migracion correcta es cerrar el flujo de pacientes y luego preparar `SQLite`.

### Odontologia

- El modelo de superficies base es correcto: `O`, `M`, `D`, `V`, `L`.
- La numeracion FDI ya esta implementada.
- El odontograma ya guarda y restaura estado local.
- Estados de pieza completa como `ausente`, `extr` e `implante` estan renderizados como convenciones visuales, no como reglas de dominio separadas.

### UX/UI

- La jerarquia general es buena para escritorio: header de paciente, odontograma central, panel lateral y tabs.
- La nueva vista `Inicio` sirve como puerta de entrada operativa sin desplazar el flujo clinico principal.
- El nuevo bloque de pacientes se integra sin quitar protagonismo al odontograma.
- El odontograma ya es el foco visual principal.
- Hay buena base para adaptar referencias externas sin copiar interfaces sobrecargadas.
- Falta trabajar feedback funcional: guardado, error, exito, cambios pendientes.
- `Inicio` ya usa datos reales para directorio y seguimientos visibles, pero todavia combina eso con KPIs mock.
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

### Testing

- Ya existe cobertura automatizada base para:
  - odontograma
  - persistencia local
  - helpers de pacientes
  - modelo clinico inicial
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

## Siguiente paso recomendado

1. Revisar y afinar una por una las secciones internas ya persistentes.
2. Limpiar el rol residual de `uiContext` global frente al contexto por paciente.
3. Preparar deploy demo en `Vercel` y `Render`.
4. Recién despues preparar persistencia `SQLite` runtime para pacientes y fichas.

## Archivos revisados

- `dentcool-project/index.html`
- `dentcool-project/src/data.js`
- `dentcool-project/src/root.jsx`
- `dentcool-project/src/app.jsx`
- `dentcool-project/src/tabs.jsx`
- `dentcool-project/src/tooth.jsx`
- `dentcool-project/src/storage.js`
- `dentcool-project/src/clinical-model.js`
- `dentcool-project/src/patients.js`
- `dentcool-project/db/schema.sql`
