import "dotenv/config";
import { app } from "./app.js";
import { prisma } from "./lib/prisma.js";

const host = process.env.HOST ?? "0.0.0.0";
const port = Number(process.env.PORT ?? 3000);

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
