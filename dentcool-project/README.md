# Ficha-DentCool — Ficha Clinica Digital

App migrada a `Vite + React` a partir del prototipo original. Sin backend todavia.

## Como abrir localmente

Necesitas `Node.js` instalado. En la carpeta del proyecto:

```bash
npm install
npm run dev
```

Luego abre:

```txt
http://127.0.0.1:5173/
```

## Tests

Ejecutar:

```bash
npm test
```

## Base de datos

La app aun no usa `SQLite` en runtime, pero ya existe una base de esquema inicial en:

```txt
db/schema.sql
```

## Estructura

```
.
├── index.html
├── package.json
├── styles.css
├── logo.png
├── src/
│   ├── main.jsx
│   ├── root.jsx
│   ├── app.jsx
│   ├── tabs.jsx
│   ├── tooth.jsx
│   └── data.js
└── assets/
```

## Proximos pasos sugeridos para hacerlo funcional

1. **Agregar persistencia** con IndexedDB (Dexie.js) o SQLite (mejor para producción).
2. **Listado y CRUD de pacientes** (hoy solo muestra a Maria Soto).
3. **Login simple** con clave maestra cifrada.
4. **Backup cifrado** a Google Drive o disco externo.
5. **Empaquetar como app de escritorio** con Tauri.

## Paleta de marca

- Teal: `#2DD4BF`
- Cyan: `#38BDF8`
- Blue: `#2F80ED`
- Violet: `#8B5CF6`
- Fondo: `#F7FAFC`

## Tipografía

- Títulos: Poppins
- Texto: Inter

---

Nombre de trabajo actual: `Ficha-DentCool`
