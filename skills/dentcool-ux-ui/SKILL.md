---
name: dentcool-ux-ui
description: Criterios de UX/UI para DentCool y aplicaciones clinicas dentales de escritorio, con foco en odontograma, paneles de paciente, resumen clinico, presupuesto y navegacion de alta densidad. Usar cuando Codex deba redisenar pantallas, refinar layout, mejorar jerarquia visual, adaptar referencias de otros sistemas o implementar interfaces coherentes con un flujo odontologico real.
---

# Dentcool Ux Ui

## Overview

Usar esta skill para mantener una interfaz clinica clara y util en escritorio. Priorizar rapidez operativa, legibilidad y una jerarquia visual centrada en el paciente y el odontograma.

## Quick Start

1. Leer `references/patrones-ui.md`.
2. Identificar el flujo principal de la pantalla: paciente, odontograma, tratamiento o pagos.
3. Mantener un layout escritorio primero.
4. Conservar el odontograma como foco visual cuando la tarea sea clinica.

## Workflow

### Evaluar referencia visual

1. Separar lo util de lo decorativo.
2. Extraer layout, jerarquia, patron de acciones y uso del espacio.
3. No copiar ruido visual, iconografia excesiva o decisiones pobres de contraste.

### Disenar pantalla clinica

1. Fijar header de paciente y alertas.
2. Definir area principal para odontograma.
3. Ubicar presupuesto, acciones o resumen en panel lateral.
4. Resolver tablas y tabs sin quitar protagonismo a la ficha.

### Ajustar interaccion

1. Reducir clics en tareas frecuentes.
2. Dar estados visibles a seleccion y hover.
3. Evitar saturacion de colores.
4. Mantener consistencia entre cards, tablas, tabs y toolbar.

## Guardrails

- No esconder informacion critica dentro de tooltips.
- No usar interfaces genericas tipo dashboard financiero.
- No sacrificar legibilidad por imitacion literal de referencias externas.
- No compactar el odontograma al punto de perder seleccion clara.

## Examples

- "Adapta esta captura de software dental a un layout mas limpio para DentCool."
- "Reorganiza la ficha para priorizar odontograma y alertas."
- "Refina la tabla de prestaciones sin que parezca ERP."
- "Propone una version desktop-first del panel lateral de presupuesto."

## Assets y referencias

- Guardar capturas o mockups en `assets/` si quieres asociarlos a esta skill.
- Leer `references/patrones-ui.md` para reglas base de layout y densidad visual.
