export const USER_IDS = {
  development: "00000000-0000-4000-8000-000000000001",
  salma: "00000000-0000-4000-8000-000000000002",
  omar: "00000000-0000-4000-8000-000000000003",
  mariam: "00000000-0000-4000-8000-000000000004",
  youssef: "00000000-0000-4000-8000-000000000005",
  hana: "00000000-0000-4000-8000-000000000006",
};

const users = [
  { id: USER_IDS.development, email: "level1@example.com" },
  { id: USER_IDS.salma, email: "salma.hassan@example.com" },
  { id: USER_IDS.omar, email: "omar.khaled@example.com" },
  { id: USER_IDS.mariam, email: "mariam.adel@example.com" },
  { id: USER_IDS.youssef, email: "youssef.nabil@example.com" },
  { id: USER_IDS.hana, email: "hana.mostafa@example.com" },
].map((user) => ({
  ...user,
  passwordHash: "authentication-disabled-for-level-1",
}));

export async function seedUsers(db) {
  for (const user of users) {
    await db.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        passwordHash: user.passwordHash,
      },
      create: user,
    });
  }
}
