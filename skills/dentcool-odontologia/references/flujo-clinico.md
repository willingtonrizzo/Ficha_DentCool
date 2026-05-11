# Flujo Clinico Base

## Uso esperado

Aplicar este flujo cuando se disene o implemente la ficha clinica dental.

## Secuencia

1. Identificar al paciente.
2. Revisar alertas medicas y antecedentes.
3. Abrir ficha clinica y odontograma.
4. Seleccionar pieza y superficie.
5. Registrar hallazgo o tratamiento.
6. Reflejar el cambio en evolucion e historial si corresponde.
7. Vincular tratamiento y presupuesto cuando aplique.
8. Guardar persistencia local antes de salir.

## Datos que no deben perderse

- identificacion del paciente
- alertas medicas
- estado del odontograma
- evolucion clinica
- tratamientos
- pagos o presupuesto si estan vinculados al plan

## Regla de modelado

No guardar solo pantallas. Guardar entidades clinicas y derivar la UI desde esos datos.
