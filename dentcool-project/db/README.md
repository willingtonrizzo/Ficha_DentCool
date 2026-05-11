# SQLite Base

Este directorio deja preparada la base estructural para la futura persistencia en `SQLite`.

Archivos:

- `schema.sql`: esquema inicial de pacientes, ficha clinica, odontograma, tratamientos, evolucion, historial, documentos y citas

Reglas de esta fase:

- `SQLite` aun no esta integrada en runtime
- el esquema debe servir como contrato inicial del modelo
- la app sigue usando persistencia local con `localStorage`
