# Cambio 2026-05-16 - Notas rapidas por paciente

## Resumen

Se agrego una seccion nueva en la ficha interna del paciente: `Notas rapidas`.

La seccion esta disponible para perfiles `Admin` y `Dr` dentro de `Secciones internas del paciente`.

## Funcionalidad agregada

- Botones internos:
  - `Nota rapida`
  - `Nota detallada`
  - `Feedback`
- `Nota rapida` inicia con `1.- `.
- Un `Enter` baja una linea para continuar el mismo punto.
- Dos `Enter` seguidos crean el siguiente punto numerado: `2.-`, `3.-`, etc.
- Cada panel tiene boton propio de guardado.
- `Feedback` incluye asunto para clasificar experiencia o problema:
  - `General`
  - `Agenda / tiempos`
  - `Costo`
  - `Logistica`
  - `Salud`
  - `Consulta / pregunta`
  - `Ventas`
  - `Insumos`

## Persistencia

Las notas se guardan por paciente dentro del `clinicalRecord`.

Se corrigio el flujo de persistencia para Tauri/SQLite:

- El boton `Guardar` de `Notas rapidas` persiste el registro clinico completo.
- Se fuerza espera de la cola de escritura SQLite antes de marcar como guardado.
- Se agrego `flushPersistedWrites()` en `persistence.js`.
- Se agrego `flushStorageWrites()` en `storage.js`.

Validacion manual realizada:

- Guardado con perfil `Admin`.
- Cierre de sesion y reingreso: las notas permanecen.
- Cierre completo de Tauri y reapertura con `npm.cmd run desktop:dev`: las notas permanecen.
- Roxana y Juana siguieron visibles despues del cambio.

## Build e instalador

Se genero instalador NSIS:

```txt
dentcool-project/src-tauri/target/release/bundle/nsis/DentCool_0.1.0_x64-setup.exe
```

Se instalo la nueva version y se verifico que la app instalada contiene la seccion `Notas rapidas`.

## Backup

Antes de instalar se ubico la base real de Tauri:

```txt
C:\Users\welli\AppData\Roaming\com.dentcool.app\ficha-dentcool.db
```

Se creo backup local:

```txt
C:\Users\welli\Proyectos\Ficha_DentCool\backups\ficha-dentcool-20260516-184308.db
```

La carpeta `backups/` queda ignorada por git para no subir datos clinicos.

## Verificacion automatica

Despues del fix de persistencia:

```txt
npm.cmd test
77 tests OK

npm.cmd run build
Build OK
```
