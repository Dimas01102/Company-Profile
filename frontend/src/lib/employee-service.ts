// ----------------------------------------------------------------------------
// MOCK EMPLOYEE / MANAGEMENT PROFILE SERVICE
// Public personnel profiles only — no HR features. Replace bodies with Laravel
// API calls later; keep signatures identical.
// ----------------------------------------------------------------------------

import team1 from "@/assets/team-1.jpg";
import team2 from "@/assets/team-2.jpg";
import team3 from "@/assets/team-3.jpg";
import team4 from "@/assets/team-4.jpg";

export type EmployeeStatus = "Active" | "Inactive";

export type Employee = {
  id: string;
  employeeId: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  photo: string;
  shortBio: string;
  fullBio: string;
  responsibilities: string[];
  experience: string[];
  linkedin: string;
  order: number;
  status: EmployeeStatus;
};

export const departments = [
  "Board of Directors",
  "Engineering",
  "Operations",
  "Sales & Marketing",
  "Quality & HSE",
] as const;

const seed: Employee[] = [
  {
    id: "e-1",
    employeeId: "BKJ-0001",
    name: "Ir. Suryadi Wijaya, M.Eng.",
    position: "President Director",
    department: "Board of Directors",
    email: "suryadi.wijaya@batamkonektra.co.id",
    phone: "+62 811 7000 201",
    photo: team1,
    shortBio:
      "Over 28 years leading transformer manufacturing and substation engineering across Southeast Asia.",
    fullBio:
      "Suryadi founded the company's transformer division and has led Konektra since 2004. He holds a master's degree in power engineering and has overseen more than 400 substation projects across Indonesia, Malaysia, and Vietnam.",
    responsibilities: [
      "Set company strategy and long-term investment direction",
      "Represent the company with utilities, regulators, and principals",
      "Chair the engineering and quality review board",
    ],
    experience: [
      "2004 – present · President Director, PT Batam Konektra Jaya",
      "1998 – 2004 · Substation Engineering Manager, regional EPC contractor",
      "1994 – 1998 · Design Engineer, transformer manufacturer",
    ],
    linkedin: "https://linkedin.com/in/suryadiwijaya",
    order: 1,
    status: "Active",
  },
  {
    id: "e-2",
    employeeId: "BKJ-0002",
    name: "Linda Hartono, M.B.A.",
    position: "Director of Operations",
    department: "Operations",
    email: "linda.hartono@batamkonektra.co.id",
    phone: "+62 811 7000 202",
    photo: team2,
    shortBio:
      "Drives manufacturing excellence, quality systems, and supply chain reliability across all sites.",
    fullBio:
      "Linda oversees production planning, procurement, and logistics for the Batam facility and the Jakarta and Surabaya service centers. She led the ISO 9001 and ISO 45001 certification programs.",
    responsibilities: [
      "Own production capacity, scheduling, and on-time delivery",
      "Manage supplier qualification and inventory strategy",
      "Maintain integrated management system certifications",
    ],
    experience: [
      "2011 – present · Director of Operations, PT Batam Konektra Jaya",
      "2006 – 2011 · Plant Manager, electronics manufacturer, Batamindo",
    ],
    linkedin: "https://linkedin.com/in/lindahartono",
    order: 2,
    status: "Active",
  },
  {
    id: "e-3",
    employeeId: "BKJ-0003",
    name: "Ir. Bambang Setiawan",
    position: "Director of Engineering",
    department: "Engineering",
    email: "bambang.setiawan@batamkonektra.co.id",
    phone: "+62 811 7000 203",
    photo: team3,
    shortBio:
      "Leads the engineering team behind custom power equipment and turnkey substation projects.",
    fullBio:
      "Bambang heads product design, type testing, and project engineering. His team develops cast-resin transformer designs and IEC 61850 substation automation packages.",
    responsibilities: [
      "Approve electrical and mechanical design packages",
      "Lead factory acceptance testing and type-test programs",
      "Guide substation automation and SCADA development",
    ],
    experience: [
      "2013 – present · Director of Engineering, PT Batam Konektra Jaya",
      "2003 – 2013 · Lead Design Engineer, switchgear manufacturer",
    ],
    linkedin: "https://linkedin.com/in/bambangsetiawan",
    order: 3,
    status: "Active",
  },
  {
    id: "e-4",
    employeeId: "BKJ-0004",
    name: "Dewi Kartika, S.T.",
    position: "Head of Sales & Customer Solutions",
    department: "Sales & Marketing",
    email: "dewi.kartika@batamkonektra.co.id",
    phone: "+62 811 7000 220",
    photo: team4,
    shortBio:
      "Partners with utilities and EPC contractors to deliver tailored industrial power solutions.",
    fullBio:
      "Dewi leads the sales engineering team, handling technical clarification, quotation, and long-term account management for utility and industrial customers.",
    responsibilities: [
      "Manage key accounts and tender submissions",
      "Coordinate technical proposals with engineering",
      "Oversee inquiry response and customer communication",
    ],
    experience: [
      "2016 – present · Head of Sales & Customer Solutions, PT Batam Konektra Jaya",
      "2011 – 2016 · Sales Engineer, industrial equipment distributor",
    ],
    linkedin: "https://linkedin.com/in/dewikartika",
    order: 4,
    status: "Active",
  },
  {
    id: "e-5",
    employeeId: "BKJ-0011",
    name: "Rizky Ananda, S.T.",
    position: "Quality Assurance Manager",
    department: "Quality & HSE",
    email: "rizky.ananda@batamkonektra.co.id",
    phone: "+62 811 7000 211",
    photo: team3,
    shortBio: "Responsible for inspection, testing records, and compliance documentation.",
    fullBio:
      "Rizky manages incoming inspection, in-process quality control, and the issuance of factory test reports for every delivered unit.",
    responsibilities: [
      "Maintain inspection and test plans",
      "Issue and archive factory acceptance test reports",
      "Coordinate external audits and certification renewals",
    ],
    experience: [
      "2019 – present · QA Manager, PT Batam Konektra Jaya",
      "2014 – 2019 · QC Engineer, marine fabrication yard",
    ],
    linkedin: "https://linkedin.com/in/rizkyananda",
    order: 5,
    status: "Active",
  },
  {
    id: "e-6",
    employeeId: "BKJ-0014",
    name: "Fitriani Salma, S.T.",
    position: "Project Engineer",
    department: "Engineering",
    email: "fitriani.salma@batamkonektra.co.id",
    phone: "+62 811 7000 214",
    photo: team2,
    shortBio: "Coordinates substation installation and commissioning schedules on site.",
    fullBio:
      "Fitriani manages project execution for substation packages, from site survey through energization and handover documentation.",
    responsibilities: [
      "Prepare project schedules and site readiness reports",
      "Supervise installation and commissioning teams",
      "Compile as-built and handover documentation",
    ],
    experience: ["2021 – present · Project Engineer, PT Batam Konektra Jaya"],
    linkedin: "",
    order: 6,
    status: "Inactive",
  },
  {
    id: "e-7",
    employeeId: "BKJ-0017",
    name: "Andre Kurniawan",
    position: "Service Center Supervisor",
    department: "Operations",
    email: "andre.kurniawan@batamkonektra.co.id",
    phone: "+62 811 7000 217",
    photo: team1,
    shortBio: "Leads the Jakarta service hub for maintenance and emergency response.",
    fullBio:
      "Andre supervises preventive maintenance contracts and emergency repair mobilization from the Jakarta service center.",
    responsibilities: [
      "Schedule preventive maintenance visits",
      "Mobilize emergency repair teams",
      "Manage spare parts stock for the Jakarta hub",
    ],
    experience: ["2018 – present · Service Supervisor, PT Batam Konektra Jaya"],
    linkedin: "",
    order: 7,
    status: "Active",
  },
];

let store: Employee[] = structuredClone(seed);
const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

/** TODO: GET /api/admin/employees */
export async function getEmployees(): Promise<Employee[]> {
  await delay();
  return structuredClone(store).sort((a, b) => a.order - b.order);
}

/** TODO: POST /api/admin/employees */
export async function createEmployee(input: Omit<Employee, "id">): Promise<Employee> {
  await delay(600);
  const created: Employee = { ...input, id: `e-${Date.now()}` };
  store = [...store, created];
  return structuredClone(created);
}

/** TODO: PUT /api/admin/employees/:id */
export async function updateEmployee(id: string, patch: Partial<Employee>): Promise<Employee> {
  await delay(600);
  store = store.map((e) => (e.id === id ? { ...e, ...patch } : e));
  const updated = store.find((e) => e.id === id);
  if (!updated) throw new Error("Employee not found");
  return structuredClone(updated);
}

/** TODO: DELETE /api/admin/employees/:id */
export async function deleteEmployee(id: string): Promise<{ ok: true }> {
  await delay(450);
  store = store.filter((e) => e.id !== id);
  return { ok: true };
}

export function emptyEmployee(nextOrder: number): Omit<Employee, "id"> {
  return {
    employeeId: "",
    name: "",
    position: "",
    department: "Engineering",
    email: "",
    phone: "",
    photo: "",
    shortBio: "",
    fullBio: "",
    responsibilities: [],
    experience: [],
    linkedin: "",
    order: nextOrder,
    status: "Active",
  };
}
