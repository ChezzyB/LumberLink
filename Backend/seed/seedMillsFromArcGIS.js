const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();

const Mill = require("../models/Mill");

// 🔐 Replace this with a valid User _id from your database!


// Mongo URI from .env
const MONGO_URI = process.env.MONGO_URI;

const arcgisURL = "https://services.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/Major_Timber_Processing_Facilities/FeatureServer/0/query?where=1%3D1&outFields=FACILITY_NAME,FACILITY_ID,COMMUNITY,LATITUDE,LONGITUDE&outSR=4326&f=json";

async function seedMills() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ Connected to MongoDB");

    const response = await axios.get(arcgisURL);
    const features = response.data.features;

    const mills = features.map((f) => {
      const attrs = f.attributes;

      return {
        millNumber: String(attrs.FACILITY_ID),
        name: attrs.FACILITY_NAME,
        location: {
          city: attrs.COMMUNITY || "",
          province: "BC",
          latitude: f.geometry?.y || attrs.LATITUDE,
          longitude: f.geometry?.x || attrs.LONGITUDE
        },
        contact: {
          phone: "",
          email: ""
        },
      };
    });

    // Remove duplicates by millNumber
    const uniqueMills = mills.filter(
      (mill, index, self) =>
        index === self.findIndex((m) => m.millNumber === mill.millNumber)
    );

    const result = await Mill.insertMany(uniqueMills, { ordered: false });
    console.log(`✅ Inserted ${result.length} mills`);
  } catch (err) {
    if (err.writeErrors) {
      console.warn(`Skipped ${err.writeErrors.length} mills (likely duplicates).`);
    } else {
      console.error("Error:", err);
    }
  } finally {
    mongoose.disconnect();
  }
}

seedMills();