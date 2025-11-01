const mongoose = require("mongoose");
require("dotenv").config();
const Simulation = require("./models/Simulation");

// ✅ Slug Generator (same logic as in model)
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}

// ✅ MongoDB Connection
mongoose
  .connect(
    "mongodb+srv://rishithagaddam79_db_user:7sx6QmPJUuneTZCm@cluster0.fmqlhht.mongodb.net/"
  )
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ Connection Error:", err));

// ✅ Data to Seed
const simulations = [
  {
    title: "Wave Interference",
    subject: "Physics",
    category: "WAVES & SOUND",
    iframeUrl:
      "https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_en.html",
    downloadUrl:
      "https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_en.html",
    description:
      "An interactive PhET simulation exploring the concepts of Wave Interference.",
    tags: [],
    difficulty: "Beginner",
    createdAt: new Date("2025-09-10T18:11:31.303Z"),
  },
  {
    title: "Sound",
    subject: "Physics",
    category: "WAVES & SOUND",
    iframeUrl:
      "https://phet.colorado.edu/sims/html/sound/latest/sound_en.html",
    downloadUrl:
      "https://phet.colorado.edu/sims/html/sound/latest/sound_en.html",
    description:
      "An interactive PhET simulation exploring the concepts of Sound.",
    tags: [],
    difficulty: "Beginner",
    createdAt: new Date("2025-09-10T18:11:31.303Z"),
  },
  {
    title: "Fourier: Making Waves",
    subject: "Physics",
    category: "WAVES & SOUND",
    iframeUrl:
      "https://phet.colorado.edu/sims/html/fourier-making-waves/latest/fourier-making-waves_en.html",
    downloadUrl:
      "https://phet.colorado.edu/sims/html/fourier-making-waves/latest/fourier-making-waves_en.html",
    description:
      "An interactive PhET simulation exploring the concepts of Fourier: Making Waves.",
    tags: [],
    difficulty: "Beginner",
    createdAt: new Date("2025-09-10T18:11:31.303Z"),
  },
  {
    title: "Circuit Construction Kit: DC",
    subject: "Physics",
    category: "ELECTRICITY & MAGNETISM",
    iframeUrl:
      "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html",
    downloadUrl:
      "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html",
    description:
      "An interactive PhET simulation exploring the concepts of Circuit Construction Kit: DC.",
    tags: [],
    difficulty: "Beginner",
    createdAt: new Date("2025-09-10T18:11:31.303Z"),
  },
];

// ✅ Add slugs manually
simulations.forEach((sim) => {
  sim.slug = generateSlug(sim.title);
});

// ✅ Seed Function
const seedDB = async () => {
  try {
    await Simulation.deleteMany({});
    await Simulation.insertMany(simulations);
    console.log("🌱 Database Seeded Successfully!");
  } catch (error) {
    console.error("❌ Error Seeding Data:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Run Seeder
seedDB();
