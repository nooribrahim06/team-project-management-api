import { PROJECT_IDS } from "./projects.seed.js";
import { USER_IDS } from "./users.seed.js";

const projectMembers = [
  ["30000000-0000-4000-8000-000000000001", PROJECT_IDS.raceCar, USER_IDS.salma],
  ["30000000-0000-4000-8000-000000000002", PROJECT_IDS.raceCar, USER_IDS.omar],
  ["30000000-0000-4000-8000-000000000003", PROJECT_IDS.raceCar, USER_IDS.mariam],
  ["30000000-0000-4000-8000-000000000004", PROJECT_IDS.sponsorship, USER_IDS.development],
  ["30000000-0000-4000-8000-000000000005", PROJECT_IDS.sponsorship, USER_IDS.youssef],
  ["30000000-0000-4000-8000-000000000006", PROJECT_IDS.telemetry, USER_IDS.development],
  ["30000000-0000-4000-8000-000000000007", PROJECT_IDS.telemetry, USER_IDS.mariam],
  ["30000000-0000-4000-8000-000000000008", PROJECT_IDS.telemetry, USER_IDS.hana],
  ["30000000-0000-4000-8000-000000000009", PROJECT_IDS.logistics, USER_IDS.salma],
  ["30000000-0000-4000-8000-000000000010", PROJECT_IDS.logistics, USER_IDS.youssef],
].map(([id, projectId, userId]) => ({ id, projectId, userId }));

export async function seedProjectMembers(db) {
  for (const member of projectMembers) {
    await db.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId: member.projectId,
          userId: member.userId,
        },
      },
      update: {},
      create: member,
    });
  }
}
