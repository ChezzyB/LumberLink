const mongoose = require("mongoose");
require("dotenv").config();
const Mill = require("../models/Mill");
const fs = require("fs");
const csv = require("csv-parse/lib/sync");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  const input = fs.readFileSync("mill_bc_list.csv");
  const rows = csv(input, { columns: true, skip_empty_lines: true });
  await Mill.deleteMany({});
  for (const r of rows) {
    await Mill.create({
      millNumber: r.millNumber,
      name: r.name,
      location: { city: r.city, province: "BC", latitude: +r.latitude, longitude: +r.longitude },
      contact: {},
      owner: mongoose.Types.ObjectId("000000000000000000000000")
    });
  }
  console.log("Inserted", rows.length, "mills");
  process.exit();
}

seed();