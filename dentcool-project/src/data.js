export const PATIENTS = [
  {
    id: "patient-maria-soto",
    fullName: "Maria Fernanda Soto Perez",
    rut: "16.482.357-9",
    birthDate: "1991-04-12",
    gender: "Femenino",
    phone: "+56 9 5421 8893",
    email: "mf.soto@gmail.com",
    address: "Av. Providencia 1842, Dpto. 504, Providencia",
    insurance: "Banmedica · Plan Premium 350",
    registeredAt: "04 ene 2026",
    lastVisit: "22 abr 2026",
    nextVisit: "14 may 2026",
    initials: "MS",
    recordNumber: "DC-2026-0473",
    alerts: [
      { type: "danger", text: "Alergia a penicilina" },
      { type: "warn", text: "Embarazo · 22 sem" },
      { type: "info", text: "Bruxismo nocturno" },
    ],
    medicalBackground: [
      { label: "Diabetes", active: false, comment: "" },
      { label: "Hipertension", active: false, comment: "" },
      { label: "Embarazo", active: true, comment: "22 sem" },
      { label: "Enfermedad cardiovascular", active: false, comment: "" },
    ],
    medicalBackgroundComment: "",
    allergies: [
      { label: "Penicilina", active: true, comment: "anafilaxia" },
      { label: "Latex", active: false, comment: "" },
      { label: "Acido folico 5 mg / dia", active: true, comment: "Medicamento actual" },
      { label: "Hierro 100 mg / dia", active: true, comment: "Medicamento actual" },
    ],
    allergiesComment: "",
    dentalHabits: [
      { label: "Bruxismo nocturno", active: true, comment: "Plano" },
      { label: "Cepillado 3x al dia", active: true, comment: "" },
      { label: "Hilo dental", active: true, comment: "" },
      { label: "Tabaquismo", active: false, comment: "" },
    ],
    dentalHabitsComment: "",
  },
  {
    id: "patient-diego-rojas",
    fullName: "Diego Alonso Rojas Muñoz",
    rut: "14.203.118-4",
    birthDate: "1987-09-03",
    gender: "Masculino",
    phone: "+56 9 7788 2214",
    email: "drojas@gmail.com",
    address: "Los Leones 1021, Providencia",
    insurance: "Colmena · Preferente",
    registeredAt: "18 feb 2026",
    lastVisit: "03 may 2026",
    nextVisit: "17 may 2026",
    initials: "DR",
    recordNumber: "DC-2026-0474",
    alerts: [
      { type: "info", text: "Control de implante 3.5" },
      { type: "warn", text: "Ansiedad dental moderada" },
    ],
    medicalBackground: [
      { label: "Diabetes", active: false, comment: "" },
      { label: "Hipertension", active: true, comment: "Controlada con losartan" },
    ],
    medicalBackgroundComment: "",
    allergies: [
      { label: "Clindamicina", active: false, comment: "" },
      { label: "Paracetamol 500 mg", active: true, comment: "Uso ocasional" },
    ],
    allergiesComment: "",
    dentalHabits: [
      { label: "Bruxismo nocturno", active: false, comment: "" },
      { label: "Cepillado 2x al dia", active: true, comment: "" },
    ],
    dentalHabitsComment: "",
  },
  {
    id: "patient-camila-navarro",
    fullName: "Camila Paz Navarro Silva",
    rut: "18.992.441-2",
    birthDate: "1996-11-24",
    gender: "Femenino",
    phone: "+56 9 4412 6781",
    email: "camila.navarro@correo.cl",
    address: "Av. Irarrazaval 3210, Ñuñoa",
    insurance: "Fonasa · Tramo C",
    registeredAt: "11 mar 2026",
    lastVisit: "29 abr 2026",
    nextVisit: "Sin cita",
    initials: "CN",
    recordNumber: "DC-2026-0475",
    alerts: [
      { type: "danger", text: "Alergia a latex" },
    ],
    medicalBackground: [
      { label: "Diabetes", active: false, comment: "" },
      { label: "Hipertension", active: false, comment: "" },
    ],
    medicalBackgroundComment: "",
    allergies: [
      { label: "Latex", active: true, comment: "Dermatitis de contacto" },
    ],
    allergiesComment: "",
    dentalHabits: [
      { label: "Hilo dental", active: false, comment: "" },
      { label: "Tabaquismo", active: false, comment: "" },
    ],
    dentalHabitsComment: "",
  },
];

export const PATIENT = PATIENTS[0];

export const STATES = {
  sano: { label: "Sano", color: "var(--st-sano)", hex: "#E2E8F0" },
  caries: { label: "Caries", color: "var(--st-caries)", hex: "#FB7185" },
  obt: { label: "Restauracion", color: "var(--st-obt)", hex: "#60A5FA" },
  corona: { label: "Corona", color: "var(--st-corona)", hex: "#FCD34D" },
  endo: { label: "Endodoncia", color: "var(--st-endo)", hex: "#C4B5FD" },
  sellante: { label: "Sellante", color: "var(--st-sellante)", hex: "#5EEAD4" },
  implante: { label: "Implante", color: "var(--st-implante)", hex: "#94A3B8" },
  ausente: { label: "Ausente", color: "var(--st-ausente)", hex: "#CBD5E1" },
  extr: { label: "Extraccion ind.", color: "var(--st-extr)", hex: "#F87171" },
};

export const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
export const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
export const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
export const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];

export function toothName(fdi) {
  const last = fdi % 10;
  const names = {
    1: "Incisivo central",
    2: "Incisivo lateral",
    3: "Canino",
    4: "1er Premolar",
    5: "2do Premolar",
    6: "1er Molar",
    7: "2do Molar",
    8: "3er Molar (cordal)",
  };
  const quad = Math.floor(fdi / 10);
  const cuadrante = {
    1: "Superior derecho",
    2: "Superior izquierdo",
    3: "Inferior izquierdo",
    4: "Inferior derecho",
  }[quad];
  return { tipo: names[last], cuadrante };
}

export const INITIAL_TEETH = (() => {
  const t = {};
  [...UPPER_RIGHT, ...UPPER_LEFT, ...LOWER_RIGHT, ...LOWER_LEFT].forEach((n) => {
    t[n] = { O: "sano", M: "sano", D: "sano", V: "sano", L: "sano" };
  });
  t[16] = { O: "caries", M: "caries", D: "sano", V: "sano", L: "sano" };
  t[26] = { O: "obt", M: "obt", D: "sano", V: "sano", L: "sano" };
  t[36] = { O: "corona", M: "corona", D: "corona", V: "corona", L: "corona" };
  t[46] = { O: "endo", M: "obt", D: "obt", V: "sano", L: "sano" };
  t[18] = { O: "ausente", M: "ausente", D: "ausente", V: "ausente", L: "ausente" };
  t[28] = { O: "ausente", M: "ausente", D: "ausente", V: "ausente", L: "ausente" };
  t[38] = { O: "extr", M: "extr", D: "extr", V: "extr", L: "extr" };
  t[37] = { O: "sellante", M: "sano", D: "sano", V: "sano", L: "sano" };
  t[47] = { O: "sellante", M: "sano", D: "sano", V: "sano", L: "sano" };
  t[24] = { O: "caries", M: "sano", D: "caries", V: "sano", L: "sano" };
  t[15] = { O: "obt", M: "sano", D: "sano", V: "sano", L: "sano" };
  t[35] = { O: "implante", M: "implante", D: "implante", V: "implante", L: "implante" };
  t[11] = { O: "sano", M: "sano", D: "sano", V: "obt", L: "sano" };
  t[21] = { O: "sano", M: "sano", D: "sano", V: "obt", L: "sano" };
  return t;
})();

export const TREATMENTS = [
  { id: 1, fecha: "22-04-2026", diente: 16, sup: [], proc: "Evaluacion", prof: "Dra. Nunez", estado: "done", prio: "baja", costo: 20000, pagado: 20000, cobertura: 0 },
  { id: 2, fecha: "23-04-2026", diente: 11, sup: [], proc: "Limpieza standard", prof: "Dra. Nunez", estado: "plan", prio: "baja", costo: 35000, pagado: 0, cobertura: 0 },
  { id: 3, fecha: "24-04-2026", diente: 21, sup: [], proc: "Limpieza VIP", prof: "Dra. Nunez", estado: "plan", prio: "baja", costo: 45000, pagado: 0, cobertura: 0 },
  { id: 4, fecha: "25-04-2026", diente: 37, sup: [], proc: "Sellantes", prof: "Dra. Nunez", estado: "plan", prio: "baja", costo: 35000, pagado: 0, cobertura: 0 },
  { id: 5, fecha: "26-04-2026", diente: 24, sup: ["O", "D"], proc: "Restauracion simple", prof: "Dra. Nunez", estado: "prog", prio: "media", costo: 35000, pagado: 0, cobertura: 0 },
  { id: 6, fecha: "27-04-2026", diente: 12, sup: [], proc: "Blanqueamiento", prof: "Dra. Nunez", estado: "plan", prio: "baja", costo: 120000, pagado: 0, cobertura: 0 },
];

export const EVOLUTION = [
  { dia: "22", mes: "ABR", year: "2026", title: "Control trimestral + destartraje supragingival", by: "Dra. Nunez", text: "Paciente acude a control. Se realiza profilaxis y destartraje supragingival con ultrasonido. Se observan lesiones cariosas incipientes en 1.6 y 2.4. Se planifica obturacion con composite en proxima sesion. Se refuerza tecnica de cepillado modificada por el embarazo.", tags: [["Profilaxis", "b"], ["Diagnostico", "t"]] },
  { dia: "15", mes: "ABR", year: "2026", title: "Cementacion corona metal-ceramica · 3.6", by: "Dr. Vega", text: "Se cementa corona metal-ceramica en pieza 3.6 con cemento de ionomero de vidrio. Ajuste oclusal verificado, oclusion fisiologica. Paciente refiere ausencia de molestias. Indicaciones post-tratamiento entregadas.", tags: [["Protesis", "g"], ["Tratamiento finalizado", "g"]] },
  { dia: "08", mes: "ABR", year: "2026", title: "Endodoncia 4.6 — segunda sesion", by: "Dra. Nunez", text: "Se finaliza tratamiento endodontico de pieza 4.6. Obturacion con gutapercha y sellador de Grossman. Reconstruccion coronaria con composite. Se controla con radiografia periapical. Sin complicaciones.", tags: [["Endodoncia", "b"], ["Radiografia", "t"]] },
  { dia: "01", mes: "ABR", year: "2026", title: "Endodoncia 4.6 — primera sesion", by: "Dra. Nunez", text: "Apertura cameral, instrumentacion con sistema rotatorio ProTaper. Irrigacion con hipoclorito de sodio 2.5%. Se medica con hidroxido de calcio y se sella temporalmente con Cavit.", tags: [["Endodoncia", "b"]] },
  { dia: "20", mes: "MAR", year: "2026", title: "Consulta de urgencia · dolor en 4.6", by: "Dra. Nunez", text: "Paciente consulta por dolor espontaneo nocturno en sector posterior derecho inferior. Test termicos positivos prolongados en 4.6. Rx revela lesion cariosa profunda con compromiso pulpar. Se planifica endodoncia.", tags: [["Urgencia", "r"], ["Diagnostico", "t"]] },
];

export const HISTORY = [
  { date: "22-04-2026", title: "Profilaxis y destartraje", doc: "Dra. Nunez" },
  { date: "15-04-2026", title: "Cementacion corona 3.6", doc: "Dr. Vega" },
  { date: "08-04-2026", title: "Endodoncia 4.6 (sesion 2)", doc: "Dra. Nunez" },
  { date: "01-04-2026", title: "Endodoncia 4.6 (sesion 1)", doc: "Dra. Nunez" },
  { date: "20-03-2026", title: "Consulta de urgencia", doc: "Dra. Nunez" },
  { date: "12-02-2026", title: "Control semestral", doc: "Dra. Nunez" },
  { date: "20-08-2025", title: "Blanqueamiento ambulatorio", doc: "Dra. Nunez" },
];

export const fmtCLP = (n) => "$" + n.toLocaleString("es-CL");

export const STORAGE_KEYS = {
  odontogram: 'ficha-dentcool.odontogram.v1',
  progress: 'ficha-dentcool.progress.v1',
  patients: 'ficha-dentcool.patients.v1',
  activePatientId: 'ficha-dentcool.active-patient.v1',
  clinicalRecords: 'ficha-dentcool.clinical-records.v1',
};
