import { readFileSync, writeFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))

const csv = readFileSync(join(__dirname, "candidates.csv"), "utf-8")
const lines = csv.split("\n").filter((l) => l.trim())
const header = lines[0].split(",").map((h) => h.trim())

// Parse CSV properly handling quoted fields with commas
function parseCSVLine(line) {
  const fields = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim())
      current = ""
    } else {
      current += ch
    }
  }
  fields.push(current.trim())
  return fields
}

const results = []
for (let i = 1; i < lines.length; i++) {
  const fields = parseCSVLine(lines[i])
  if (fields.length >= 3 && fields[0]) {
    // Clean up name: remove newlines that got merged
    const name = fields[0].replace(/\n/g, "").trim()
    const chuc_vu = fields[1].replace(/\n/g, "").trim()
    const don_vi = (fields[2] || "").replace(/\n/g, "").trim()
    if (name) {
      results.push({ name, chuc_vu, don_vi })
    }
  }
}

writeFileSync(
  join(__dirname, "init-candidates.json"),
  JSON.stringify(results, null, 2),
  "utf-8"
)

console.log(`Converted ${results.length} candidates to init-candidates.json`)
