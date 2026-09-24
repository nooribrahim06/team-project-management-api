import { prisma } from "../src/lib/prisma.js";
import { seedProjectMembers } from "./seed-data/project-members.seed.js";
import { seedProfiles } from "./seed-data/profiles.seed.js";
import { seedProjects } from "./seed-data/projects.seed.js";
import { seedTasks } from "./seed-data/tasks.seed.js";
import { seedUsers } from "./seed-data/users.seed.js";

try {
  await prisma.$transaction(async (db) => {
    await seedUsers(db);
    await seedProfiles(db);
    await seedProjects(db);
    await seedProjectMembers(db);
    await seedTasks(db);
  });

  console.log(
    "Seed completed: 6 users, 6 profiles, 4 projects, 10 memberships, and 20 tasks.",
  );
} catch (error) {
  console.error("Database seed failed:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
