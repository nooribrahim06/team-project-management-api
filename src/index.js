import "dotenv/config";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

const host = env.HOST;
const port = env.PORT;

async function startServer() {
  try {
    await prisma.$connect();

    app.listen(port, host, () => {
      console.log(`Server running on http://${host}:${port}`);
    });
  } catch (error) {
    console.error("Could not start server:", error.message);
    process.exit(1);
  }
}

startServer();
