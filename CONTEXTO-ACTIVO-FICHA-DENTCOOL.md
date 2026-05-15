# CONTEXTO ACTIVO FICHA DENTCOOL

## Fecha de referencia

`2026-05-15`

## Estado resumido

`Ficha-DentCool` ya funciona como app local en `Vite + React` con persistencia local base y tests automatizados verdes.

Ruta activa del proyecto:

- `/Users/usuario/Ficha_DentCool/dentcool-project`

## Foco actual

- consolidar la ficha por paciente
- dejar la operacion local mas real
- sostener el modulo financiero ya operativo sobre snapshots por paciente
- seguir afinando reportes financieros avanzados ya conectados a tratamientos y citas visibles sin mezclar todavia `SQLite`
- dejar documentado el estado actual antes de subir para prueba de la doctora
- revisar `dentcool_pricing_codex_skill.md` y registrar ahi las decisiones tomadas y por que
- mantener documentacion viva para retomar sesiones sin perder contexto

## Lo ultimo verificado

- `npm test` pasa
- `50` tests verdes
- `npm run build` pasa
- ya existen persistencias locales por paciente para:
  - `Motivo y diagnostico`
  - `Evolucion clinica`
  - `Historial`
  - `Presupuesto`
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

1. revisar `dentcool_pricing_codex_skill.md` y dejar documentadas las decisiones tomadas y el motivo de cada una
2. seguir limpiando el `uiContext` global residual
3. seguir refinando la operacion local antes de `SQLite runtime`
4. preparar la futura transicion a `SQLite` sin mezclar demasiados frentes
5. subir el estado actual para prueba de la doctora cuando quede confirmado el bloque financiero

## Riesgos abiertos

- `Inicio` todavia no es panel 100% real
- parte del flujo clinico sigue compartiendo mocks
- aun no hay runtime real de `SQLite`
- falta protocolo de backup local antes de escalar uso real
- el pricing ya tiene settings, catalogo, snapshots, estados refinados, vista general, objetivo editable, exportacion CSV, exportacion Excel y filtros/reportes avanzados completos, y ahora cruza tratamientos/citas visibles, pero aun no existe agenda estructurada ni libro real de cobros-abonos
- seguir usando `nextVisit` y `paid` como puente por mucho tiempo hara mas costosa la separacion de agenda y caja
- la separacion existe en modelo y UI, pero el puente legado sigue activo para compatibilidad
- el bloque visual del catalogo de pricing ya quedo estabilizado y no debe volver a mezclar valores entre tratamientos

## Instruccion de retoma

Cuando se retome este proyecto en una sesion nueva, pedir:

`Revisa AGENTS.md y CONTEXTO-ACTIVO-FICHA-DENTCOOL.md en /Users/usuario/Ficha_DentCool y dime donde quedamos`
