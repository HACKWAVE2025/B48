// const mongoose = require("mongoose");
// require("dotenv").config();
// const Simulation = require("./models/Simulation");

// // ✅ Slug Generator (same logic as in model)
// function generateSlug(title) {
//   return title
//     .toLowerCase()
//     .replace(/[^a-z0-9\s-]/g, "")
//     .replace(/\s+/g, "-")
//     .replace(/-+/g, "-")
//     .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
// }

// // ✅ MongoDB Connection
// mongoose
//   .connect(
//     "mongodb+srv://rishithagaddam79_db_user:7sx6QmPJUuneTZCm@cluster0.fmqlhht.mongodb.net/"
//   )
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => console.error("❌ Connection Error:", err));

// // ✅ Data to Seed
// const simulations = [
//   {
//     title: "Wave Interference",
//     subject: "Physics",
//     category: "WAVES & SOUND",
//     iframeUrl:
//       "https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_en.html",
//     downloadUrl:
//       "https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_en.html",
//     description:
//       "An interactive PhET simulation exploring the concepts of Wave Interference.",
//     tags: [],
//     difficulty: "Beginner",
//     createdAt: new Date("2025-09-10T18:11:31.303Z"),
//   },
//   {
//     title: "Sound",
//     subject: "Physics",
//     category: "WAVES & SOUND",
//     iframeUrl:
//       "https://phet.colorado.edu/sims/html/sound/latest/sound_en.html",
//     downloadUrl:
//       "https://phet.colorado.edu/sims/html/sound/latest/sound_en.html",
//     description:
//       "An interactive PhET simulation exploring the concepts of Sound.",
//     tags: [],
//     difficulty: "Beginner",
//     createdAt: new Date("2025-09-10T18:11:31.303Z"),
//   },
//   {
//     title: "Fourier: Making Waves",
//     subject: "Physics",
//     category: "WAVES & SOUND",
//     iframeUrl:
//       "https://phet.colorado.edu/sims/html/fourier-making-waves/latest/fourier-making-waves_en.html",
//     downloadUrl:
//       "https://phet.colorado.edu/sims/html/fourier-making-waves/latest/fourier-making-waves_en.html",
//     description:
//       "An interactive PhET simulation exploring the concepts of Fourier: Making Waves.",
//     tags: [],
//     difficulty: "Beginner",
//     createdAt: new Date("2025-09-10T18:11:31.303Z"),
//   },
//   {
//     title: "Circuit Construction Kit: DC",
//     subject: "Physics",
//     category: "ELECTRICITY & MAGNETISM",
//     iframeUrl:
//       "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html",
//     downloadUrl:
//       "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html",
//     description:
//       "An interactive PhET simulation exploring the concepts of Circuit Construction Kit: DC.",
//     tags: [],
//     difficulty: "Beginner",
//     createdAt: new Date("2025-09-10T18:11:31.303Z"),
//   },
//     {
//     title: "Wave Interference",
//     subject: "Physics",
//     category: "WAVES & SOUND",
//     iframeUrl:
//       "https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_en.html",
//     downloadUrl:
//       "https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_en.html",
//     description:
//       "An interactive PhET simulation exploring the concepts of Wave Interference.",
//     tags: [],
//     difficulty: "Beginner",
//     createdAt: new Date("2025-09-10T18:11:31.303Z"),
//   },
//   {
//     title: "Sound",
//     subject: "Physics",
//     category: "WAVES & SOUND",
//     iframeUrl:
//       "https://phet.colorado.edu/sims/html/sound/latest/sound_en.html",
//     downloadUrl:
//       "https://phet.colorado.edu/sims/html/sound/latest/sound_en.html",
//     description:
//       "An interactive PhET simulation exploring the concepts of Sound.",
//     tags: [],
//     difficulty: "Beginner",
//     createdAt: new Date("2025-09-10T18:11:31.303Z"),
//   },
//   {
//     title: "Fourier: Making Waves",
//     subject: "Physics",
//     category: "WAVES & SOUND",
//     iframeUrl:
//       "https://phet.colorado.edu/sims/html/fourier-making-waves/latest/fourier-making-waves_en.html",
//     downloadUrl:
//       "https://phet.colorado.edu/sims/html/fourier-making-waves/latest/fourier-making-waves_en.html",
//     description:
//       "An interactive PhET simulation exploring the concepts of Fourier: Making Waves.",
//     tags: [],
//     difficulty: "Beginner",
//     createdAt: new Date("2025-09-10T18:11:31.303Z"),
//   },
//   {
//     title: "Circuit Construction Kit: DC",
//     subject: "Physics",
//     category: "ELECTRICITY & MAGNETISM",
//     iframeUrl:
//       "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html",
//     downloadUrl:
//       "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html",
//     description:
//       "An interactive PhET simulation exploring the concepts of Circuit Construction Kit: DC.",
//     tags: [],
//     difficulty: "Beginner",
//     createdAt: new Date("2025-09-10T18:11:31.303Z"),
//   },

//   // --- New Additions ---
//   {
//     title: "Pathfinding Visualizer",
//     subject: "Computer Science",
//     category: "ALGORITHMS & DATA STRUCTURES",
//     iframeUrl: "https://pathfinding-visualizer-nu.vercel.app/",
//     downloadUrl: "https://pathfinding-visualizer-nu.vercel.app/",
//     description:
//       "An interactive visualization tool for exploring pathfinding algorithms such as Dijkstra, A*, BFS, and DFS.",
//     tags: ["algorithms", "visualization", "pathfinding"],
//     difficulty: "Intermediate",
//   },
//   {
//     title: "CircuitLab Editor",
//     subject: "Physics",
//     category: "ELECTRICITY & MAGNETISM",
//     iframeUrl: "https://www.circuitlab.com/editor/",
//     downloadUrl: "https://www.circuitlab.com/editor/",
//     description:
//       "An online circuit editor and simulator for designing and testing electrical circuits.",
//     tags: ["electronics", "simulation", "circuit"],
//     difficulty: "Intermediate",
//   },
//   {
//     title: "Balancing Act",
//     subject: "Physics",
//     category: "FORCES & MOTION",
//     iframeUrl:
//       "https://phet.colorado.edu/sims/html/balancing-act/latest/balancing-act_en.html",
//     downloadUrl:
//       "https://phet.colorado.edu/sims/html/balancing-act/latest/balancing-act_en.html",
//     description:
//       "Explore the physics of balance and torque using an interactive PhET simulation.",
//     tags: ["balance", "torque", "forces"],
//     difficulty: "Beginner",
//   },
//   {
//     title: "CPU Scheduling Visualizer",
//     subject: "Computer Science",
//     category: "OPERATING SYSTEMS",
//     iframeUrl: "https://cpu-scheduling-algorithm-visualiser.netlify.app/",
//     downloadUrl: "https://cpu-scheduling-algorithm-visualiser.netlify.app/",
//     description:
//       "A web app to visualize CPU scheduling algorithms such as FCFS, SJF, Round Robin, and Priority Scheduling.",
//     tags: ["cpu", "scheduling", "os"],
//     difficulty: "Intermediate",
//   },
//   {
//     title: "Structural Analyser",
//     subject: "Physics",
//     category: "MECHANICS",
//     iframeUrl: "https://structural-analyser.com/",
//     downloadUrl: "https://structural-analyser.com/",
//     description:
//       "A simulator for analyzing structural behavior and stresses in beams and trusses.",
//     tags: ["mechanics", "structures", "engineering"],
//     difficulty: "Advanced",
//   },
//   {
//     title: "GAN Lab",
//     subject: "Computer Science",
//     category: "MACHINE LEARNING",
//     iframeUrl: "https://poloclub.github.io/ganlab/",
//     downloadUrl: "https://poloclub.github.io/ganlab/",
//     description:
//       "An interactive visualization tool to understand Generative Adversarial Networks (GANs).",
//     tags: ["ml", "gan", "ai"],
//     difficulty: "Intermediate",
//   },
//   {
//     title: "TensorFlow Playground",
//     subject: "Computer Science",
//     category: "MACHINE LEARNING",
//     iframeUrl: "https://playground.tensorflow.org/",
//     downloadUrl: "https://playground.tensorflow.org/",
//     description:
//       "A neural network playground to experiment with layers, activations, and learning rates.",
//     tags: ["neural networks", "tensorflow", "ai"],
//     difficulty: "Intermediate",
//   },
//   {
//     title: "VisuAlgo - Sorting Visualizer",
//     subject: "Computer Science",
//     category: "ALGORITHMS & DATA STRUCTURES",
//     iframeUrl: "https://visualgo.net/en/sorting",
//     downloadUrl: "https://visualgo.net/en/sorting",
//     description:
//       "An educational tool to visualize various sorting algorithms step-by-step.",
//     tags: ["sorting", "algorithms", "visualization"],
//     difficulty: "Beginner",
//   },
// ];

// // ✅ Add slugs manually
// simulations.forEach((sim) => {
//   sim.slug = generateSlug(sim.title);
// });

// // ✅ Seed Function
// const seedDB = async () => {
//   try {
//     await Simulation.deleteMany({});
//     await Simulation.insertMany(simulations);
//     console.log("🌱 Database Seeded Successfully!");
//   } catch (error) {
//     console.error("❌ Error Seeding Data:", error);
//   } finally {
//     mongoose.connection.close();
//   }
// };

// // Run Seeder
// seedDB();


const mongoose = require("mongoose");
require("dotenv").config();
const Simulation = require("./models/Simulation");

// ✅ Slug Generator
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ✅ MongoDB Connection
mongoose
  .connect("mongodb+srv://rishithagaddam79_db_user:7sx6QmPJUuneTZCm@cluster0.fmqlhht.mongodb.net/")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ Connection Error:", err));

// ✅ Simulations Data
const simulations = [
  {
    title: "Wave Interference",
    subject: "Physics",
    category: "WAVES & SOUND",
    iframeUrl: "https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_en.html",
    downloadUrl: "https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_en.html",
    description: "An interactive PhET simulation exploring the concepts of Wave Interference.",
    tags: [],
    difficulty: "Beginner",
  },
  {
    title: "Sound",
    subject: "Physics",
    category: "WAVES & SOUND",
    iframeUrl: "https://phet.colorado.edu/sims/html/sound/latest/sound_en.html",
    downloadUrl: "https://phet.colorado.edu/sims/html/sound/latest/sound_en.html",
    description: "An interactive PhET simulation exploring the concepts of Sound.",
    tags: [],
    difficulty: "Beginner",
  },
  {
    title: "Fourier: Making Waves",
    subject: "Physics",
    category: "WAVES & SOUND",
    iframeUrl: "https://phet.colorado.edu/sims/html/fourier-making-waves/latest/fourier-making-waves_en.html",
    downloadUrl: "https://phet.colorado.edu/sims/html/fourier-making-waves/latest/fourier-making-waves_en.html",
    description: "An interactive PhET simulation exploring the concepts of Fourier: Making Waves.",
    tags: [],
    difficulty: "Beginner",
  },
  {
    title: "Circuit Construction Kit: DC",
    subject: "Physics",
    category: "ELECTRICITY & MAGNETISM",
    iframeUrl: "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html",
    downloadUrl: "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html",
    description: "An interactive PhET simulation exploring the concepts of Circuit Construction Kit: DC.",
    tags: [],
    difficulty: "Beginner",
  },
  {
    title: "Pathfinding Visualizer",
    subject: "Computer Science",
    category: "ALGORITHMS & DATA STRUCTURES",
    iframeUrl: "https://pathfinding-visualizer-nu.vercel.app/",
    downloadUrl: "https://pathfinding-visualizer-nu.vercel.app/",
    description: "An interactive visualization tool for exploring pathfinding algorithms such as Dijkstra, A*, BFS, and DFS.",
    tags: ["algorithms", "visualization", "pathfinding"],
    difficulty: "Intermediate",
  },
  {
    title: "CircuitLab Editor",
    subject: "Physics",
    category: "ELECTRICITY & MAGNETISM",
    iframeUrl: "https://www.circuitlab.com/editor/",
    downloadUrl: "https://www.circuitlab.com/editor/",
    description: "An online circuit editor and simulator for designing and testing electrical circuits.",
    tags: ["electronics", "simulation", "circuit"],
    difficulty: "Intermediate",
  },
  {
    title: "Balancing Act",
    subject: "Physics",
    category: "FORCES & MOTION",
    iframeUrl: "https://phet.colorado.edu/sims/html/balancing-act/latest/balancing-act_en.html",
    downloadUrl: "https://phet.colorado.edu/sims/html/balancing-act/latest/balancing-act_en.html",
    description: "Explore the physics of balance and torque using an interactive PhET simulation.",
    tags: ["balance", "torque", "forces"],
    difficulty: "Beginner",
  },
  {
    title: "CPU Scheduling Visualizer",
    subject: "Computer Science",
    category: "OPERATING SYSTEMS",
    iframeUrl: "https://cpu-scheduling-algorithm-visualiser.netlify.app/",
    downloadUrl: "https://cpu-scheduling-algorithm-visualiser.netlify.app/",
    description: "A web app to visualize CPU scheduling algorithms such as FCFS, SJF, Round Robin, and Priority Scheduling.",
    tags: ["cpu", "scheduling", "os"],
    difficulty: "Intermediate",
  },
  {
    title: "Structural Analyser",
    subject: "Physics",
    category: "MECHANICS",
    iframeUrl: "https://structural-analyser.com/",
    downloadUrl: "https://structural-analyser.com/",
    description: "A simulator for analyzing structural behavior and stresses in beams and trusses.",
    tags: ["mechanics", "structures", "engineering"],
    difficulty: "Advanced",
  },
  {
    title: "GAN Lab",
    subject: "Computer Science",
    category: "MACHINE LEARNING",
    iframeUrl: "https://poloclub.github.io/ganlab/",
    downloadUrl: "https://poloclub.github.io/ganlab/",
    description: "An interactive visualization tool to understand Generative Adversarial Networks (GANs).",
    tags: ["ml", "gan", "ai"],
    difficulty: "Intermediate",
  },
  {
    title: "TensorFlow Playground",
    subject: "Computer Science",
    category: "MACHINE LEARNING",
    iframeUrl: "https://playground.tensorflow.org/",
    downloadUrl: "https://playground.tensorflow.org/",
    description: "A neural network playground to experiment with layers, activations, and learning rates.",
    tags: ["neural networks", "tensorflow", "ai"],
    difficulty: "Intermediate",
  },
  {
    title: "VisuAlgo - Sorting Visualizer",
    subject: "Computer Science",
    category: "ALGORITHMS & DATA STRUCTURES",
    iframeUrl: "https://visualgo.net/en/sorting",
    downloadUrl: "https://visualgo.net/en/sorting",
    description: "An educational tool to visualize various sorting algorithms step-by-step.",
    tags: ["sorting", "algorithms", "visualization"],
    difficulty: "Beginner",
  },
];

// ✅ Add Slugs
simulations.forEach((sim) => (sim.slug = generateSlug(sim.title)));

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
