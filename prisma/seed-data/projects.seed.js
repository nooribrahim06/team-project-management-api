import { USER_IDS } from "./users.seed.js";

export const PROJECT_IDS = {
  raceCar: "20000000-0000-4000-8000-000000000001",
  sponsorship: "20000000-0000-4000-8000-000000000002",
  telemetry: "20000000-0000-4000-8000-000000000003",
  logistics: "20000000-0000-4000-8000-000000000004",
};

const projects = [
  {
    id: PROJECT_IDS.raceCar,
    ownerId: USER_IDS.development,
    name: "Race Car Development",
    description:
      "Coordinate the mechanical, electrical, and testing work for the new race car.",
  },
  {
    id: PROJECT_IDS.sponsorship,
    ownerId: USER_IDS.salma,
    name: "Sponsorship Campaign",
    description:
      "Prepare sponsor packages, outreach material, and partnership follow-ups.",
  },
  {
    id: PROJECT_IDS.telemetry,
    ownerId: USER_IDS.omar,
    name: "Telemetry Dashboard",
    description:
      "Build a dashboard for viewing live vehicle data and post-run analysis.",
  },
  {
    id: PROJECT_IDS.logistics,
    ownerId: USER_IDS.mariam,
    name: "Competition Logistics",
    description:
      "Plan transport, equipment, accommodation, and the competition schedule.",
  },
];

export async function seedProjects(db) {
  for (const project of projects) {
    await db.project.upsert({
      where: { id: project.id },
      update: {
        ownerId: project.ownerId,
        name: project.name,
        description: project.description,
      },
      create: project,
    });
  }
}
