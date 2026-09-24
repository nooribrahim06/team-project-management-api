import { USER_IDS } from "./users.seed.js";

const profiles = [
  ["10000000-0000-4000-8000-000000000001", USER_IDS.development, "Level 1 User"],
  ["10000000-0000-4000-8000-000000000002", USER_IDS.salma, "Salma Hassan"],
  ["10000000-0000-4000-8000-000000000003", USER_IDS.omar, "Omar Khaled"],
  ["10000000-0000-4000-8000-000000000004", USER_IDS.mariam, "Mariam Adel"],
  ["10000000-0000-4000-8000-000000000005", USER_IDS.youssef, "Youssef Nabil"],
  ["10000000-0000-4000-8000-000000000006", USER_IDS.hana, "Hana Mostafa"],
].map(([id, userId, name]) => ({ id, userId, name, avatarUrl: null }));

export async function seedProfiles(db) {
  for (const profile of profiles) {
    await db.profile.upsert({
      where: { userId: profile.userId },
      update: {
        name: profile.name,
        avatarUrl: profile.avatarUrl,
      },
      create: profile,
    });
  }
}
