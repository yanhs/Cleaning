require("dotenv/config");
const { PrismaClient } = require(".prisma/client");
const p = new PrismaClient();
p.cleaner.count().then(c => {
  console.log("Cleaner count:", c);
  return p.$disconnect();
}).catch(e => {
  console.error("Error:", e.message);
  process.exit(1);
});
