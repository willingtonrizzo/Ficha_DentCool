---
name: dentcool-odontologia
description: Reglas de dominio para ficha clinica dental, odontograma FDI, estados clinicos, evolucion y relacion entre piezas, tratamientos y presupuesto. Usar cuando Codex trabaje en DentCool o en software odontologico similar y necesite modelar datos, validar flujos clinicos, nombrar superficies, disenar persistencia del odontograma o implementar comportamientos clinicos consistentes.
---

# Dentcool Odontologia

## Overview

Usar esta skill para mantener coherencia clinica y de modelado en DentCool. Priorizar ids estables, estructura de datos clara y reglas de odontograma compatibles con UI, persistencia y exportacion.

## Quick Start

1. Leer `references/odontograma.md` si la tarea toca piezas, superficies o estados clinicos.
2. Leer `references/flujo-clinico.md` si la tarea toca ficha, evolucion, tratamientos o presupuesto.
3. Modelar primero entidades y reglas; despues adaptar la UI.
4. Evitar decisiones ambiguas en nombres de superficies, estados o eventos.

## Workflow

### Modelar odontograma

1. Usar numeracion `FDI`.
2. Mantener superficies `O`, `M`, `D`, `V`, `L` como contrato base.
3. Guardar estado por superficie con ids internos controlados.
4. Permitir estados de pieza completa solo si quedan normalizados al mismo modelo.

### Implementar logica clinica

1. Separar datos de UI.
2. Evitar strings libres para estados.
3. Reflejar cambios clinicos en persistencia y en historial cuando corresponda.
4. Vincular tratamiento, evolucion y presupuesto por entidad, no por texto suelto.

### Evaluar decisiones de producto

Elegir estas prioridades:

- `SQLite` como base principal local.
- `Excel` para importacion, exportacion y backup.
- Persistencia inicial temporal con `localStorage` o `IndexedDB` si se necesita avanzar rapido.

## Guardrails

- No usar Excel como fuente clinica principal.
- No codificar reglas clinicas solo en componentes visuales.
- No usar colores como unico significado del estado.
- No cambiar el sistema de numeracion sin migracion explicita.

## Examples

- "Agrega persistencia al odontograma sin romper el modelo por superficies."
- "Define el esquema SQLite para pacientes, tratamientos y evolucion."
- "Valida si `ausente` debe afectar una superficie o la pieza completa."
- "Alinea el nombre de superficies del componente con el modelo clinico."

## References

- `references/odontograma.md`
- `references/flujo-clinico.md`
