# CONTEXTO ACTIVO FICHA DENTCOOL

## Fecha de referencia

`2026-05-11`

## Estado resumido

`Ficha-DentCool` ya funciona como app local en `Vite + React` con persistencia local base y tests automatizados verdes.

Ruta activa del proyecto:

- `/Users/usuario/Ficha_DentCool/dentcool-project`

## Foco actual

- consolidar la ficha por paciente
- enlazar odontograma al paciente activo
- dejar la operacion local mas real
- mantener documentacion viva para retomar sesiones sin perder contexto

## Lo ultimo verificado

- `npm test` pasa
- `17` tests verdes
- ya existen persistencias locales por paciente para:
  - `Motivo y diagnostico`
  - `Evolucion clinica`
  - `Historial`
  - `Presupuesto`
- la vista `Inicio` existe pero aun mezcla datos reales con mocks

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

1. enlazar odontograma por `patientId`
2. mover `Documentos` a estructuras por paciente
3. agregar validaciones de alta y edicion de paciente
4. seguir refinando la operacion local antes de `SQLite runtime`

## Riesgos abiertos

- `Inicio` todavia no es panel 100% real
- parte del flujo clinico sigue compartiendo mocks
- aun no hay runtime real de `SQLite`
- falta protocolo de backup local antes de escalar uso real

## Instruccion de retoma

Cuando se retome este proyecto en una sesion nueva, pedir:

`Revisa AGENTS.md y CONTEXTO-ACTIVO-FICHA-DENTCOOL.md en /Users/usuario/Ficha_DentCool y dime donde quedamos`
