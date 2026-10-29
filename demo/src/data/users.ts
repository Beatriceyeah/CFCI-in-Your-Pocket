import type { RegisteredUser } from "../types";

// Students registered through Duke NetID. Emails are placeholders for the demo.
export const REGISTERED_STUDENTS: RegisteredUser[] = [
  { id: "u-kylie", name: "Student founder 1", email: "founder1@example.edu" },
  { id: "u-brian", name: "Student founder 2", email: "founder2@example.edu" },
  { id: "u-maya", name: "Maya Chen", email: "maya.chen@example.edu" },
  { id: "u-luis", name: "Luis Ortega", email: "luis.ortega@example.edu" },
  { id: "u-ananya", name: "Ananya Rao", email: "ananya.rao@example.edu" },
  { id: "u-tom", name: "Tom Becker", email: "tom.becker@example.edu" },
];

export const DEFAULT_STUDENT_ID = "u-kylie";
export const NO_PRODUCT_STUDENT_ID = "u-maya";

export const CFCI_CONTACT = { name: "Ibrahim Mohedas", email: "ibrahim.mohedas@duke.edu" };

// CFCI staff share one portfolio. Names are placeholders for the demo.
export const CFCI_STAFF: RegisteredUser[] = [
  { id: "u-staff-dana", name: "Dana Reyes", email: "dana.reyes@example.edu" },
  { id: "u-staff-marcus", name: "Marcus Lee", email: "marcus.lee@example.edu" },
];
export const DEFAULT_STAFF_ID = "u-staff-dana";
