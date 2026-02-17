// Prisma v7 seed script - uses Node.js native ESM support
// Run with: node --experimental-strip-types prisma/seed.js

const dotenv = require("dotenv");
dotenv.config();

// Use dynamic import for ESM Prisma client
async function run() {
  const { faker } = await import("@faker-js/faker");

  // Direct require of the runtime to build PrismaClient manually
  const runtime = require("@prisma/client/runtime/client");
  const classModule = await import("./seed-prisma-helper.mjs");
  const PrismaClient = classModule.PrismaClient;

  const prisma = new PrismaClient();

  faker.seed(42);

  console.log("Testing connection...");
  await prisma.$connect();
  console.log("Connected!");
  await prisma.$disconnect();
}

run().catch(console.error);
