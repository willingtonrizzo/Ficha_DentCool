# Odontograma DentCool

## Objetivo

Definir reglas minimas y consistentes para representar un odontograma clinico en DentCool.

## Numeracion

- Usar sistema `FDI`.
- Arcada superior visual: `18-11` y `21-28`.
- Arcada inferior visual: `48-41` y `31-38`.
- Cada pieza debe mantener la orientacion clinica consistente en UI, estado y persistencia.

## Superficies

Usar estas superficies por defecto:

- `O`: oclusal o incisal
- `M`: mesial
- `D`: distal
- `V`: vestibular
- `L`: lingual o palatino

Si el codigo necesita distinguir lingual de palatino, hacerlo en capa de presentacion o metadata, no rompiendo la API base.

## Estados clinicos iniciales

Mantener un catalogo controlado de estados:

- `sano`
- `caries`
- `obt`
- `corona`
- `endo`
- `sellante`
- `implante`
- `ausente`
- `extr`

Cada estado debe tener:

- id estable
- label legible
- color UI
- compatibilidad con exportacion

## Reglas de integridad

- No mezclar labels libres con ids internos.
- No guardar estados solo por color.
- La pieza y la superficie deben persistirse por separado.
- Un cambio de superficie debe actualizar UI, historial y capa de persistencia.
- Estados de pieza completa como `ausente`, `implante` o `corona total` pueden afectar todas las superficies, pero deben quedar normalizados.

## Eventos clinicos utiles

- cambio de estado de superficie
- cambio de estado de pieza completa
- observacion clinica libre
- evolucion asociada a pieza
- tratamiento asociado a pieza
- presupuesto asociado a tratamiento

## Modelo minimo sugerido

```js
{
  patientId: "uuid",
  teeth: {
    "16": { O: "caries", M: "caries", D: "sano", V: "sano", L: "sano" }
  },
  notes: [],
  updatedAt: "2026-05-09T00:00:00Z"
}
```

## UX clinica

- El color comunica estado, pero no debe ser el unico canal.
- Mostrar `FDI`, nombre de pieza y superficie activa.
- Permitir seleccionar pieza y superficie con bajo numero de clics.
- Evitar saturar al usuario con demasiados estados visibles a la vez.
