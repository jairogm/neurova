import { ConvexHttpClient } from "convex/browser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Mocking the api object structure since we don't have the generated code available in this environment
// The structure should match { migrations: { importPatients: "migrations:importPatients", ... } }
// But typically we use the generated `api` object.
// If we can't import `api` from `_generated`, we can construct the function references manually as strings.
// ConvexHttpClient keys off strings like "file:function".

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("Please set CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable.");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function importData() {
  const dataDir = path.join(__dirname, "../data");

  async function loadAndImport(filename, mutationName) {
    const filePath = path.join(dataDir, filename);
    if (fs.existsSync(filePath)) {
      console.log(`Importing ${filename}...`);
      const rawData = fs.readFileSync(filePath, "utf-8");
      let data = JSON.parse(rawData);

      // Helper to remove null values (Convex optional expects undefined, not null)
      const stripNulls = (obj) => {
        if (Array.isArray(obj)) {
          return obj.map(v => stripNulls(v));
        } else if (obj !== null && typeof obj === 'object') {
          return Object.fromEntries(
            Object.entries(obj)
              .map(([k, v]) => [k, stripNulls(v)])
              .filter(([_, v]) => v !== null)
          );
        }
        return obj;
      };

      data = stripNulls(data);
      
      // Call mutation using string path "migrations:importX"
      // Note: "folder/file:function" -> "migrations:importPatients" assuming file is convex/migrations.ts
      try {
        const result = await client.mutation(`migrations:${mutationName}`, { data });
        console.log(`Success: ${result}`);
      } catch (e) {
        console.error(`Error importing ${filename}:`, e);
      }
    } else {
      console.warn(`File ${filename} not found.`);
    }
  }

  await loadAndImport("patients_rows.json", "importPatients");
  await loadAndImport("therapists_rows.json", "importTherapists");
  await loadAndImport("sessions_rows.json", "importSessions");
  await loadAndImport("medical_history_notes_rows.json", "importNotes");
  await loadAndImport("therapist_patients_rows.json", "importTherapistPatients");
}

importData();
