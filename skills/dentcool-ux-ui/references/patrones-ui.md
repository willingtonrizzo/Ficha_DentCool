# Patrones UX/UI DentCool

## Objetivo

Mantener una interfaz clinica clara, rapida y orientada a escritorio sin perder legibilidad.

## Layout recomendado

- Header superior con identidad del paciente y alertas.
- Navegacion secundaria por modulos.
- Panel lateral para presupuesto, resumen o acciones rapidas.
- Area central dominante para odontograma.
- Zona inferior o lateral para prestaciones, historial y evolucion.

## Prioridades visuales

1. Paciente y alertas.
2. Odontograma.
3. Acciones clinicas.
4. Presupuesto y pagos.
5. Historial complementario.

## Reglas de interfaz

- Mostrar mucha informacion sin perder aire visual.
- Usar color con disciplina; el odontograma no debe competir con toda la pantalla.
- Mantener tablas y cards simples, con bordes, espaciado y contraste altos.
- Reservar acentos fuertes para alertas, seleccion, CTA y estados.
- Evitar modales innecesarios para acciones frecuentes.

## Reglas para odontograma

- El canvas principal debe ser el foco visual.
- La seleccion de pieza debe ser evidente.
- La seleccion de superficie debe poder entenderse sin tooltip.
- Incluir leyenda si hay mas de cuatro estados clinicos visibles.
- No mezclar demasiados iconos decorativos cerca de la arcada.

## Escritorio primero

- Base de trabajo: `1366x768` y `1440x900`.
- Mantener uso comodo tambien en `1280px`.
- En pantallas pequenas, priorizar scroll vertical antes que reducir demasiado el odontograma.

## Calidad de interaccion

- Los controles clinicos de alta frecuencia deben quedar a 1 o 2 clics.
- La UI debe sentirse estable; evitar animaciones innecesarias.
- El foco visual debe cambiar con seleccion, no con ruido grafico.
