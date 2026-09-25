import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js laster .env.local automatisk, Prisma CLI gjør ikke — uten dette er
// alle migrate-kommandoer blinde for DATABASE_URL. Rekkefølgen speiler
// Next.js: første treff vinner, så .env.local overstyrer .env.
loadEnv({ path: [".env.local", ".env"], quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Node 24 kjører TypeScript direkte; ingen tsx eller ts-node trengs.
    seed: "node prisma/seed.mts",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"]!,
  },
});
