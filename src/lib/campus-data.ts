export const student = {
  name: "Aminata Diallo",
  matricule: "UCAD-2024-1187",
  university: "Université Cheikh Anta Diop",
  faculty: "Faculté des Sciences Économiques",
  program: "Licence Économie & Gestion",
  level: "Licence 2 — Semestre 1",
  avatar: "AD",
  email: "aminata.diallo@ucad.sn",
};

export const announcements = [
  {
    id: 1,
    title: "Ouverture des inscriptions pédagogiques",
    body: "Les inscriptions pédagogiques du semestre 1 sont ouvertes jusqu'au 22 janvier. Rendez-vous sur votre espace scolarité.",
    tag: "Scolarité",
    date: "Il y a 2 heures",
    urgent: true,
    author: "Direction des études",
  },
  {
    id: 2,
    title: "Report du cours de Macroéconomie",
    body: "Le cours du Pr. Ndiaye prévu jeudi est reporté au vendredi 26 janvier à 10h en amphi B.",
    tag: "Cours",
    date: "Hier",
    urgent: false,
    author: "Département Économie",
  },
  {
    id: 3,
    title: "Bourses d'excellence 2025 — Candidatures",
    body: "L'université ouvre les candidatures pour 40 bourses d'excellence destinées aux étudiants les mieux classés.",
    tag: "Bourses",
    date: "Il y a 3 jours",
    urgent: false,
    author: "Service social",
  },
  {
    id: 4,
    title: "Calendrier des examens semestre 1",
    body: "Le calendrier définitif est disponible. Les examens débutent le 5 février.",
    tag: "Examens",
    date: "Il y a 5 jours",
    urgent: true,
    author: "Direction des études",
  },
];

export const events = [
  {
    id: 1,
    title: "Forum Emploi & Stages 2025",
    description: "Rencontrez plus de 60 entreprises panafricaines et internationales. Ateliers CV, simulations d'entretien et opportunités de stage.",
    date: "28 Jan 2025",
    day: "28",
    month: "Jan",
    time: "09h00 — 17h00",
    place: "Campus Central — Amphi A",
    category: "Carrière",
    cover: "linear-gradient(135deg,#0F3D2E 0%,#1F6B4F 60%,#D4A24C 100%)",
    attendees: 842,
  },
  {
    id: 2,
    title: "Conférence : IA & Développement en Afrique",
    description: "Table ronde animée par des chercheurs de Dakar, Nairobi et Abidjan.",
    date: "02 Fév 2025",
    day: "02",
    month: "Fév",
    time: "15h00 — 18h00",
    place: "Amphi Sciences",
    category: "Conférence",
    cover: "linear-gradient(135deg,#7A2E1F 0%,#C56A3E 100%)",
    attendees: 312,
  },
  {
    id: 3,
    title: "Concours d'éloquence inter-facultés",
    description: "Défendez vos idées devant un jury composé de professeurs et de professionnels.",
    date: "10 Fév 2025",
    day: "10",
    month: "Fév",
    time: "18h30",
    place: "Auditorium",
    category: "Concours",
    cover: "linear-gradient(135deg,#1F4B3A 0%,#4A9375 100%)",
    attendees: 156,
  },
  {
    id: 4,
    title: "Formation Excel avancé — Certifiante",
    description: "Session pratique de 3 jours, ouverte aux 40 premiers inscrits.",
    date: "15 Fév 2025",
    day: "15",
    month: "Fév",
    time: "10h00",
    place: "Salle info 2",
    category: "Formation",
    cover: "linear-gradient(135deg,#B8863F 0%,#F0C567 100%)",
    attendees: 40,
  },
];

export type Grade = {
  module: string;
  code: string;
  credits: number;
  note: number | null;
  status: "published" | "pending";
  teacher: string;
};

export const grades: { semester: string; average: number | null; items: Grade[] }[] = [
  {
    semester: "Semestre 1 — Licence 2",
    average: 13.4,
    items: [
      { module: "Microéconomie approfondie", code: "ECO211", credits: 6, note: 14, status: "published", teacher: "Pr. M. Sarr" },
      { module: "Mathématiques financières", code: "MAT201", credits: 4, note: 11, status: "published", teacher: "Dr. F. Ba" },
      { module: "Comptabilité analytique", code: "GES203", credits: 5, note: 15.5, status: "published", teacher: "Pr. A. Fall" },
      { module: "Droit civil", code: "DRT202", credits: 3, note: null, status: "pending", teacher: "Dr. K. Diop" },
      { module: "Anglais des affaires", code: "LAN201", credits: 2, note: 13, status: "published", teacher: "Mme. J. Cissé" },
      { module: "Statistiques descriptives", code: "STA201", credits: 4, note: null, status: "pending", teacher: "Pr. O. Wade" },
    ],
  },
  {
    semester: "Semestre 2 — Licence 1",
    average: 12.8,
    items: [
      { module: "Introduction à l'économie", code: "ECO102", credits: 6, note: 13, status: "published", teacher: "Pr. M. Sarr" },
      { module: "Algèbre linéaire", code: "MAT102", credits: 4, note: 12, status: "published", teacher: "Dr. F. Ba" },
      { module: "Sociologie économique", code: "SOC102", credits: 3, note: 14, status: "published", teacher: "Dr. N. Sy" },
    ],
  },
];
