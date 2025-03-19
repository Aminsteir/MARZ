import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csvParser from "csv-parser";
import stripBom from "strip-bom-stream";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read CSV
async function readCSV(filePath: string) {
  return new Promise<any[]>((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(stripBom()) // BYTE ORDER MARK (BOM) CAUSING PROBLEMS
      .pipe(csvParser())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
}

// Seed Database
async function seedDatabase() {
  try {
    console.log("Seeding database...");

    const users = await readCSV(path.join(__dirname, "../data/Users.csv"));

    const salt = await bcrypt.genSalt(10)
    console.log("Salt (for all users): " + salt)

    console.log("Inserting Users...");
    for (const user of users) {
        await prisma.user.create({
            data: {
                email: user.email,
                password: await bcrypt.hash(user.password.trim(), salt),
            },
        });
    }

    console.log("Database successfully seeded.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding function
seedDatabase();
