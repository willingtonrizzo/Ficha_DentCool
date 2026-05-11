# AGENTS.md

## Objetivo

Convertir `Ficha-DentCool` desde un prototipo React por CDN a una aplicacion local funcional para ficha clinica dental, preservando primero la UI y el flujo del odontograma.

## Regla principal

No rehacer el proyecto desde cero. Avanzar por etapas cortas y verificables.

## Prioridades

1. Mantener la interfaz actual funcionando.
2. Migrar a `Vite + React` sin romper el diseno.
3. Reemplazar `window.*` por modulos e imports.
4. Agregar persistencia local.
5. Integrar `SQLite` como base principal.
6. Agregar importacion y exportacion Excel.
7. Empaquetar con `Tauri` cuando la version web local ya sea estable.

## Stack objetivo

- Frontend: `React + Vite`
- Estilos: `styles.css` actual como base
- Persistencia local inicial: `localStorage` o `IndexedDB`
- Base local final: `SQLite`
- Excel: `SheetJS`
- Desktop: `Tauri`
- Tests: `Vitest` y luego `Playwright`

## Decisiones de producto

- `SQLite` sera la fuente principal de datos.
- `Excel` se usara para importacion, exportacion, reportes y respaldo.
- No migrar a `Tailwind` en la primera fase.
- No introducir `TypeScript`, `SQLite`, `Tauri` y `Excel` al mismo tiempo.

## Flujo GSD

1. Leer el proyecto actual antes de editar.
2. Hacer cambios pequenos y reversibles.
3. Verificar en navegador despues de cada bloque importante.
4. Documentar decisiones si cambian la arquitectura.
5. No mezclar migracion tecnica con rediseno profundo en la misma tarea.
6. Si se toca logica, persistencia o modelo clinico, correr `npm test`.
7. Dejar en `PROGRESO-FICHA-DENTCOOL.md` si los tests pasaron o no.

## Seguimiento obligatorio

Mantener actualizados estos archivos para no perder el hilo:

- `PROGRESO-FICHA-DENTCOOL.md`
- `CHECKLIST-FICHA-DENTCOOL.md`
- `FICHA-DENTCOOL-BASELINE.md`
- `CONTEXTO-ACTIVO-FICHA-DENTCOOL.md`

Cada bloque relevante debe dejar:

- donde vamos
- que se hizo
- que falta
- siguiente paso recomendado
- fecha de referencia
- riesgos abiertos si cambiaron

Cuando empiece un bloque de diseno o de funcionalidades de negocio, marcarlo explicitamente como:

- `Bloque UX/UI`
- `Bloque Funcionalidades`

## Skills locales del proyecto

- `skills/dentcool-odontologia`: reglas de dominio clinico y del odontograma.
- `skills/dentcool-ux-ui`: criterios de diseno UX/UI para la interfaz dental.
- `skills/dentcool-contexto`: protocolo para retomar sesion, leer contexto y actualizar handoff.

## Protocolo de retoma de sesion

Antes de tocar codigo en una sesion nueva:

1. Leer `AGENTS.md`.
2. Leer `CONTEXTO-ACTIVO-FICHA-DENTCOOL.md`.
3. Leer `PROGRESO-FICHA-DENTCOOL.md`.
4. Leer `CHECKLIST-FICHA-DENTCOOL.md`.
5. Si hay dudas sobre arquitectura o estado real, leer `FICHA-DENTCOOL-BASELINE.md`.

Al cerrar cada bloque importante:

1. Actualizar `PROGRESO-FICHA-DENTCOOL.md`.
2. Actualizar `CHECKLIST-FICHA-DENTCOOL.md` si cambia el estado de tareas.
3. Actualizar `CONTEXTO-ACTIVO-FICHA-DENTCOOL.md` con:
   - fecha
   - foco actual
   - ultimo cambio real
   - siguiente paso
   - riesgos

## Regla de producto importante

La landing publica y la ficha clinica local son sistemas distintos.

- La landing sirve para captacion.
- La ficha sirve para operacion clinica local.
- No conectar datos clinicos a internet en esta fase.
- No mezclar marketing publico con ficha clinica sin definir antes privacidad, permisos y arquitectura.

## Referencias visuales

Guardar screenshots, wireframes y capturas de sistemas de referencia en:

- `dentcool-project/assets/referencias/`

## Siguiente ruta recomendada

1. Persistir tambien seleccion y contexto UI.
2. Limpiar archivos legacy.
3. Crear un modelo de paciente y odontograma mas completo.
4. Agregar tests del odontograma.
5. Preparar persistencia con `SQLite`.
