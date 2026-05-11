---
name: dentcool-contexto
description: Usar cuando se retome trabajo en Ficha-DentCool y se necesite recuperar rapido el estado del proyecto, el ultimo foco activo, las decisiones vigentes y el siguiente paso recomendado. Leer AGENTS.md, CONTEXTO-ACTIVO-FICHA-DENTCOOL.md, PROGRESO-FICHA-DENTCOOL.md y CHECKLIST-FICHA-DENTCOOL.md antes de proponer cambios.
---

# DentCool Contexto

Usa esta skill al inicio de cualquier sesion nueva sobre `Ficha-DentCool`.

## Orden de lectura

1. `AGENTS.md`
2. `CONTEXTO-ACTIVO-FICHA-DENTCOOL.md`
3. `PROGRESO-FICHA-DENTCOOL.md`
4. `CHECKLIST-FICHA-DENTCOOL.md`
5. `FICHA-DENTCOOL-BASELINE.md` si hace falta validar arquitectura o riesgos

## Objetivo

Reconstruir rapido:

- donde va el proyecto
- que ya funciona
- que es real y que aun es mock
- que sigue
- que no se debe mezclar

## Regla de retoma

Antes de proponer cambios, resumir:

- estado actual
- ultimo bloque completado
- siguiente bloque recomendado
- riesgos abiertos

## Regla de cierre

Si hubo cambios relevantes en producto, arquitectura o flujo:

- actualizar `PROGRESO-FICHA-DENTCOOL.md`
- actualizar `CHECKLIST-FICHA-DENTCOOL.md` si cambia el estado de tareas
- actualizar `CONTEXTO-ACTIVO-FICHA-DENTCOOL.md`

## Regla de separacion

Mantener separadas:

- `landing y captacion`
- `ficha clinica local`

No conectar datos clinicos a internet en esta fase salvo que el usuario lo pida y se defina una arquitectura explicita de privacidad, permisos y persistencia.
