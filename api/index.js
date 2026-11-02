// src/server/app.ts
import express from "express";
import dotenv from "dotenv";

// src/server/storage.ts
import fs from "fs";
import path from "path";

// src/lib/contentSeed.ts
var UNDERCOVER_WORD_PAIRS = [
  { civilian: "Jollof Rice", undercover: "Fried Rice", category: "Food" },
  { civilian: "Keke Napep", undercover: "Okada", category: "Campus Transport" },
  { civilian: "Lecture Hall", undercover: "Library", category: "Campus Places" },
  { civilian: "Hostel", undercover: "Off-Campus Lodge", category: "Accommodation" },
  { civilian: "SUG President", undercover: "Department President", category: "Student Politics" },
  { civilian: "Carryover", undercover: "Spillover", category: "Academics" },
  { civilian: "Generator", undercover: "NEPA", category: "Power" },
  { civilian: "Attendance List", undercover: "Exam Slip", category: "Lectures" },
  { civilian: "Indomie", undercover: "Spaghetti", category: "Hostel Cooking" },
  { civilian: "Buka", undercover: "Cafeteria", category: "Eating Out" },
  { civilian: "Suya", undercover: "Kilishi", category: "Street Food" },
  { civilian: "Course Rep", undercover: "Class Governor", category: "Roles" },
  { civilian: "T-Fare", undercover: "Pocket Money", category: "Finance" },
  { civilian: "Continuous Assessment (CA)", undercover: "Exam", category: "Academics" },
  { civilian: "First Class", undercover: "Second Class Upper (2:1)", category: "Degree" },
  { civilian: "Matriculation", undercover: "Convocation", category: "Ceremonies" },
  { civilian: "Speedboat", undercover: "Ferry", category: "Maritime Transport" },
  { civilian: "Life Jacket", undercover: "Buoy", category: "Maritime Safety" },
  { civilian: "Night Class", undercover: "Night Vigil", category: "All-Nighters" },
  { civilian: "Gala", undercover: "Meat Pie", category: "Snacks" },
  { civilian: "Zobo", undercover: "Kunu", category: "Drinks" },
  { civilian: "Hotspot", undercover: "School Wi-Fi", category: "Internet" },
  { civilian: "Power Bank", undercover: "Extension Box", category: "Gadgets" },
  { civilian: "Slide", undercover: "Textbook", category: "Study Material" },
  { civilian: "Biro", undercover: "Pencil", category: "Stationery" },
  { civilian: "Sign-Out Day", undercover: "FYB Week", category: "Final Year" },
  { civilian: "Project Supervisor", undercover: "Department HOD", category: "Staff" },
  { civilian: "Lab Coat", undercover: "Overall", category: "Practical Gear" },
  { civilian: "Strikers", undercover: "Aluta", category: "Campus Action" },
  { civilian: "Clearance", undercover: "Screening", category: "Admin" },
  { civilian: "Puff Puff", undercover: "Buns", category: "Snacks" },
  { civilian: "Passport Photograph", undercover: "Student ID Card", category: "Documents" },
  { civilian: "Calculator", undercover: "Log Book", category: "Tools" },
  { civilian: "Barge", undercover: "Cargo Ship", category: "Maritime" },
  { civilian: "Harbour", undercover: "Jetty", category: "Maritime" },
  { civilian: "Captain", undercover: "Chief Engineer", category: "Crew" },
  { civilian: "Anchor", undercover: "Propeller", category: "Vessel Parts" },
  { civilian: "Radar", undercover: "Sonar", category: "Navigation" },
  { civilian: "Bole", undercover: "Roasted Corn", category: "Food" },
  { civilian: "WhatsApp Status", undercover: "Broadcast Message", category: "Social" },
  { civilian: "Group Project", undercover: "Assignment", category: "Academics" },
  { civilian: "School Gate", undercover: "Security Post", category: "Campus Landmarks" }
];
var WHO_SAID_THAT_PROMPTS = [
  "What is the biggest lie you ever told a lecturer to excuse being late?",
  "What is the weirdest concoction you ever cooked in the hostel when broke?",
  "If you had to drop out today, what hustle would you start immediately?",
  "What is your secret tactic for surviving an 8 AM Monday lecture on 2 hours of sleep?",
  "What is the most ridiculous excuse you ever gave to escape a group project?",
  "If the school gave you \u20A610,000,000 today, what is the first thing you'd buy on campus?",
  "What is one campus food you secretly think is completely overrated?",
  "What was your most embarrassing moment during 100L matriculation week?",
  "If you were elected SUG President tomorrow, what is the first rule you would change?",
  "What is your ultimate guilty pleasure song when reading for exams?",
  "What is the craziest thing you ever witnessed at the campus jetty or bus park?",
  "If you were stuck on a deserted island with one lecturer, what would you do first?",
  "What is the funniest rumor you ever heard spread about someone on campus?",
  "What is your true reaction when someone shouts 'Quiet in the library!'?",
  "What is the longest time you ever studied without blinking, and did it even help?",
  "If you had to trade your department for any other, which one are you running to?",
  "What is the most dramatic thing that happened in your faculty WhatsApp group?",
  "What is the weirdest place you ever took an accidental nap on campus?",
  "What is the real reason you missed your last class presentation?",
  "If your CGPA had a movie title, what would it be right now?",
  "What is one item in your hostel room that should probably be declared a biohazard?",
  "What is your go-to meal when there's only \u20A6500 left in your account?",
  "What is the fastest excuse you give when a coursemate asks to borrow your charger?",
  "What is the most chaotic thing that happened during a semester exam in your hall?",
  "If you could delete one course code from existence forever, which one is gone?",
  "What is your signature move when the lecturer suddenly says 'Submit your scripts'?",
  "What is the boldest outfit you've ever seen someone wear to a morning test?",
  "What is your honest opinion about 7 AM practical classes?",
  "What is the strangest nickname anyone on campus ever called you?",
  "If you could ban one phrase from campus WhatsApp groups, what is it?",
  "What is your greatest achievement that has nothing to do with your grades?",
  "What is the most awkward elevator or speedboat ride you've ever experienced?",
  "What is one hostel rule that literally nobody has ever followed?",
  "What was your first thought when you saw your 100L first semester timetable?",
  "What is the one thing you will miss most about campus after graduation?"
];
var MOST_LIKELY_TO_PROMPTS = [
  "Most likely to show up 50 minutes late to a 1-hour lecture with a plate of food.",
  "Most likely to argue with the lecturer over 0.5 bonus marks on a quiz.",
  "Most likely to fall asleep sitting straight up in the front row of the lecture hall.",
  "Most likely to have 14 alarms set on their phone and still sleep through every one.",
  "Most likely to volunteer to be Course Rep just to post memes in the announcement group.",
  "Most likely to start reading for a 500-level exam at 3:00 AM on the day of the paper.",
  "Most likely to survive an entire semester on Indomie, bread, and sheer optimism.",
  "Most likely to become a billionaire before their final year clearance.",
  "Most likely to know the secret menu or exact cooking schedule of every campus buka.",
  "Most likely to lose their student ID card twice in the same semester.",
  "Most likely to borrow a pen in 100L and still be holding it in 400L.",
  "Most likely to wear formal corporate attire to an ordinary casual tutorial.",
  "Most likely to drop an accidental voice note in the official faculty announcement chat.",
  "Most likely to know everyone on campus by nickname within two weeks.",
  "Most likely to become a high-flying naval captain or maritime CEO.",
  "Most likely to invent a new campus business out of their hostel wardrobe.",
  "Most likely to say 'Guys, let's read' and then start watching TikTok 4 minutes later.",
  "Most likely to have their power bank stolen by their own best friend.",
  "Most likely to sprint across campus like an Olympic athlete when attendance is called.",
  "Most likely to complain about having no money right before ordering cold drinks for everyone.",
  "Most likely to get into a friendly debate about which campus hostel has better breeze.",
  "Most likely to write an entire 15-page assignment in one frantic hour before submission.",
  "Most likely to show up to the exam hall holding three calculators and four pens.",
  "Most likely to start a viral dance or chant at the campus jetty.",
  "Most likely to be mistaken for a lecturer on their very first day of school.",
  "Most likely to turn a 5-minute study break into a 3-hour philosophical debate.",
  "Most likely to become the alumni president ten years after graduation.",
  "Most likely to bring a full sound system to an impromptu hostel rooftop gathering.",
  "Most likely to memorize an entire textbook table of contents without reading chapter one.",
  "Most likely to be the last person standing at a campus games night.",
  "Most likely to successfully haggle down the price of a speedboat ride.",
  "Most likely to have their phone battery at 2% for 6 consecutive hours.",
  "Most likely to send an assignment to the wrong lecturer's email by accident.",
  "Most likely to give an Oscar-worthy speech when asked an unexpected question in class.",
  "Most likely to win NO CAP daily showdown five days in a row."
];
var CAMPUS_QUIZ_BANK = [
  {
    id: "cq_1",
    prompt: "In maritime navigation, what color is the port (left) side running light on a vessel?",
    options: ["Red", "Green", "White", "Yellow"],
    correctIndex: 0,
    category: "Maritime Knowledge",
    explanation: "Port (left) side navigation lights are always red; starboard (right) lights are green."
  },
  {
    id: "cq_2",
    prompt: "Which unit of speed is equal to one nautical mile per hour?",
    options: ["Knot", "Mach", "Fathom", "Beaufort"],
    correctIndex: 0,
    category: "Maritime Knowledge",
    explanation: "One knot equals one nautical mile per hour (approximately 1.852 km/h)."
  },
  {
    id: "cq_3",
    prompt: "What is the standard nautical unit used to measure water depth?",
    options: ["Fathom", "League", "Chain", "Yard"],
    correctIndex: 0,
    category: "Maritime Knowledge",
    explanation: "One fathom equals 6 feet (about 1.83 meters) and is traditionally used for depth."
  },
  {
    id: "cq_4",
    prompt: "Which international organization governs worldwide maritime safety and pollution prevention?",
    options: ["IMO (International Maritime Organization)", "ICAO", "WHO", "UNCTAD"],
    correctIndex: 0,
    category: "Maritime Affairs",
    explanation: "The IMO is a specialized agency of the United Nations responsible for maritime safety."
  },
  {
    id: "cq_5",
    prompt: "In Nigerian university grading, what minimum CGPA is typically required for a First Class degree?",
    options: ["4.50 on a 5.00 scale", "4.00 on a 5.00 scale", "4.20 on a 5.00 scale", "3.80 on a 5.00 scale"],
    correctIndex: 0,
    category: "Academic System",
    explanation: "Under the standard NUC 5.0 grading system, 4.50 to 5.00 earns First Class Honours."
  },
  {
    id: "cq_6",
    prompt: "What is the primary function of a vessel's bilge pump?",
    options: ["Remove accumulated water from the bottom of the hull", "Pump fuel to the engine", "Cool the radar", "Filter drinking water"],
    correctIndex: 0,
    category: "Marine Engineering",
    explanation: "Bilge pumps remove water collected in the bilge to keep the vessel dry and stable."
  },
  {
    id: "cq_7",
    prompt: "What does the maritime term 'Starboard' refer to?",
    options: ["The right side of a vessel facing forward", "The left side", "The back of the vessel", "The captain's quarters"],
    correctIndex: 0,
    category: "Nautical Terms",
    explanation: "Starboard refers to the right-hand side when looking toward the bow (front)."
  },
  {
    id: "cq_8",
    prompt: "Which body of water borders Nigeria along its southern coastline?",
    options: ["Gulf of Guinea (Atlantic Ocean)", "Indian Ocean", "Mediterranean Sea", "Red Sea"],
    correctIndex: 0,
    category: "Geography",
    explanation: "Nigeria has approximately 853 km of coastline along the Gulf of Guinea in the Atlantic Ocean."
  },
  {
    id: "cq_9",
    prompt: "What does the abbreviation 'TEU' standardly mean in maritime container shipping?",
    options: ["Twenty-foot Equivalent Unit", "Total Export Utility", "Terminal Entry Unit", "Trans-Equatorial Universal"],
    correctIndex: 0,
    category: "Ports & Shipping",
    explanation: "A TEU represents the capacity of a standard 20-foot shipping container."
  },
  {
    id: "cq_10",
    prompt: "In university vocabulary, what does 'SUG' stand for?",
    options: ["Student Union Government", "Senior Undergraduate Guild", "School Unified Group", "State University Graduates"],
    correctIndex: 0,
    category: "Campus Culture",
    explanation: "SUG is the universally recognized acronym for Student Union Government on Nigerian campuses."
  },
  {
    id: "cq_11",
    prompt: "What is the forward-most part of a ship or boat called?",
    options: ["Bow", "Stern", "Keel", "Rudder"],
    correctIndex: 0,
    category: "Vessel Structure",
    explanation: "The bow is the front of the ship; the stern is the back."
  },
  {
    id: "cq_12",
    prompt: "Which agency is responsible for maritime safety administration and security in Nigeria?",
    options: ["NIMASA", "NPA", "NIWA", "NAFDAC"],
    correctIndex: 0,
    category: "Maritime Agencies",
    explanation: "NIMASA (Nigerian Maritime Administration and Safety Agency) oversees maritime safety and security."
  },
  {
    id: "cq_13",
    prompt: "What does 'Mayday' signal when broadcast on maritime radio frequencies?",
    options: ["Life-threatening distress emergency", "Routine weather report", "Approaching port entrance", "Request for fuel"],
    correctIndex: 0,
    category: "Maritime Safety",
    explanation: "'Mayday' is the international radiotelephony distress signal originating from the French 'm'aider'."
  },
  {
    id: "cq_14",
    prompt: "What instrument is used to determine geographic direction using Earth's magnetic field?",
    options: ["Magnetic Compass", "Barometer", "Sextant", "Anemometer"],
    correctIndex: 0,
    category: "Navigation",
    explanation: "A magnetic compass aligns with Earth's magnetic field to point toward magnetic north."
  },
  {
    id: "cq_15",
    prompt: "Which river joins the Benue River at Lokoja to form Nigeria's most famous confluence?",
    options: ["River Niger", "River Kaduna", "River Ogun", "River Osun"],
    correctIndex: 0,
    category: "Inland Waterways",
    explanation: "The Niger and Benue rivers meet at Lokoja, making it an iconic inland waterways junction."
  }
];
var SEED_DAILY_PACKS = [
  {
    pack: {
      dateId: "2026-10-18",
      version: 1,
      timeLimitSeconds: 120,
      maxScore: 30,
      stages: [
        {
          id: "s1",
          type: "quickfire",
          title: "Stage 1: Campus Quickfire",
          prompt: "Under the standard NUC 5.0 grading scale, which CGPA tier earns Second Class Upper (2:1)?",
          options: ["3.50 \u2013 4.49", "3.00 \u2013 3.49", "4.00 \u2013 4.75", "2.40 \u2013 3.49"]
        },
        {
          id: "s2",
          type: "real_or_fake",
          title: "Stage 2: Real Course or Fake Course?",
          prompt: "Is 'Nautical Science & Hydrographic Surveying' a verified university academic discipline?",
          context: "Decide whether this is a genuine accredited maritime university programme or completely made up.",
          options: ["REAL COURSE", "FAKE COURSE"]
        },
        {
          id: "s3",
          type: "campus_read",
          title: "Stage 3: Campus Read (Majority Dilemma)",
          prompt: "It's 7:52 AM. Your 8:00 AM lecturer locks the hall door at 8:01 AM sharp. Your hostel is a 10-minute sprint away. What does the majority do?",
          options: [
            "Sprint without brushing shoes and slide in at 7:59 AM",
            "Accept fate, turn back, and sleep until 10:00 AM",
            "Beg the class rep on WhatsApp to sign your name on the sheet"
          ]
        }
      ]
    },
    answerKey: {
      dateId: "2026-10-18",
      stageAnswers: [
        { stageIndex: 0, correctAnswerIndex: 0, explanation: "3.50 to 4.49 is the verified NUC Second Class Upper bracket." },
        { stageIndex: 1, correctAnswerIndex: 0, explanation: "REAL! Nautical Science is a core degree for deck officers and navigational surveyors." },
        { stageIndex: 2, correctAnswerIndex: 0, explanation: "Campus sprint culture! The legendary 7:59 AM slide-in is the overwhelming student consensus." }
      ]
    }
  },
  {
    pack: {
      dateId: "2026-10-19",
      version: 1,
      timeLimitSeconds: 120,
      maxScore: 30,
      stages: [
        {
          id: "s1",
          type: "quickfire",
          title: "Stage 1: Campus Quickfire",
          prompt: "What is the standard unit of speed equal to one nautical mile per hour?",
          options: ["Knot", "Mach", "Fathom", "Cavit"]
        },
        {
          id: "s2",
          type: "real_or_fake",
          title: "Stage 2: Real Course or Fake Course?",
          prompt: "Is 'Advanced WhatsApp Status Monetization & Group Moderation' an official accredited university degree course?",
          options: ["REAL COURSE", "FAKE COURSE"]
        },
        {
          id: "s3",
          type: "campus_read",
          title: "Stage 3: Campus Read (Hostel Dilemma)",
          prompt: "The electricity just came back at 1:30 AM after 3 days. What is the priority move?",
          options: [
            "Plug phone, power bank, laptop, and rechargeable lamp immediately",
            "Fill every bucket, bottle, and kettle with pump water",
            "Keep sleeping peacefully; let tomorrow handle tomorrow"
          ]
        }
      ]
    },
    answerKey: {
      dateId: "2026-10-19",
      stageAnswers: [
        { stageIndex: 0, correctAnswerIndex: 0, explanation: "1 Knot = 1 nautical mile per hour (1.852 km/h)." },
        { stageIndex: 1, correctAnswerIndex: 1, explanation: "FAKE! While every class rep moderates WhatsApp, it is definitely not an NUC accredited degree." },
        { stageIndex: 2, correctAnswerIndex: 0, explanation: "Electronic survival first! Charging all devices before NEPA strikes again is rule #1." }
      ]
    }
  },
  {
    pack: {
      dateId: "2026-10-20",
      version: 1,
      timeLimitSeconds: 120,
      maxScore: 30,
      stages: [
        {
          id: "s1",
          type: "quickfire",
          title: "Stage 1: Campus Quickfire",
          prompt: "On any marine vessel, what is the right-hand side facing forward officially called?",
          options: ["Starboard", "Port", "Stern", "Quarterdeck"]
        },
        {
          id: "s2",
          type: "real_or_fake",
          title: "Stage 2: Real Course or Fake Course?",
          prompt: "Is 'Marine Engineering & Naval Architecture' an accredited engineering programme?",
          options: ["REAL COURSE", "FAKE COURSE"]
        },
        {
          id: "s3",
          type: "campus_read",
          title: "Stage 3: Campus Read (Group Project)",
          prompt: "You are assigned a 4-person group project due on Friday. How do most campus groups actually function?",
          options: [
            "One person does 90% of the work while the other three provide moral support and print the PDF",
            "All four meet daily in the library with equal contributions",
            "Everyone forgets about it until Thursday 11:30 PM"
          ]
        }
      ]
    },
    answerKey: {
      dateId: "2026-10-20",
      stageAnswers: [
        { stageIndex: 0, correctAnswerIndex: 0, explanation: "Starboard is the right side; Port is the left." },
        { stageIndex: 1, correctAnswerIndex: 0, explanation: "REAL! Marine Engineering designs ship propulsion and mechanical systems." },
        { stageIndex: 2, correctAnswerIndex: 0, explanation: "The universal group project reality: one dedicated MVP carries the squad." }
      ]
    }
  },
  {
    pack: {
      dateId: "2026-10-21",
      version: 1,
      timeLimitSeconds: 120,
      maxScore: 30,
      stages: [
        {
          id: "s1",
          type: "quickfire",
          title: "Stage 1: Campus Quickfire",
          prompt: "Which Nigerian government agency manages the seaports in Lagos, Port Harcourt, Calabar, and Warri?",
          options: ["NPA (Nigerian Ports Authority)", "NIMASA", "NIWA", "NNPC"]
        },
        {
          id: "s2",
          type: "real_or_fake",
          title: "Stage 2: Real Course or Fake Course?",
          prompt: "Is 'Bachelor of Science in Jollof Culinary Warfare & Suya Thermodynamics' an actual NUC university department?",
          options: ["REAL COURSE", "FAKE COURSE"]
        },
        {
          id: "s3",
          type: "campus_read",
          title: "Stage 3: Campus Read (Exam Season)",
          prompt: "You have an exam tomorrow at 9 AM. At 11 PM tonight, you realize you haven't opened module 4. What's the majority plan?",
          options: [
            "Emergency night class (TDB - Till Day Break) with energy drinks",
            "Go to bed early and hope module 4 is an optional question",
            "Beg the smartest coursemate for a 15-minute voice note crash course"
          ]
        }
      ]
    },
    answerKey: {
      dateId: "2026-10-21",
      stageAnswers: [
        { stageIndex: 0, correctAnswerIndex: 0, explanation: "NPA governs port infrastructure and cargo terminals across Nigeria." },
        { stageIndex: 1, correctAnswerIndex: 1, explanation: "FAKE! Though Nigerian Jollof deserves a doctorate, it's not an NUC degree." },
        { stageIndex: 2, correctAnswerIndex: 2, explanation: "The sacred 15-minute peer voice note summary saves more GPAs than all-nighters!" }
      ]
    }
  },
  {
    pack: {
      dateId: "2026-10-22",
      version: 1,
      timeLimitSeconds: 120,
      maxScore: 30,
      stages: [
        {
          id: "s1",
          type: "quickfire",
          title: "Stage 1: Campus Quickfire",
          prompt: "What international maritime treaty establishes safety minimums for ship construction, equipment, and operation?",
          options: ["SOLAS (Safety of Life at Sea)", "MARPOL", "STCW", "UNCLOS"]
        },
        {
          id: "s2",
          type: "real_or_fake",
          title: "Stage 2: Real Course or Fake Course?",
          prompt: "Is 'Ports and Shipping Management' an authentic accredited university degree?",
          options: ["REAL COURSE", "FAKE COURSE"]
        },
        {
          id: "s3",
          type: "campus_read",
          title: "Stage 3: Campus Read (Broke Days)",
          prompt: "It's the 24th of the month. Your account balance is \u20A6470. What is the undisputed champion dinner?",
          options: [
            "Two packs of Indomie cooked with pure water and sheer faith",
            "\u20A6300 Akara and \u20A6100 Agege bread with tap water",
            "Visit a coursemate's room at dinner time and pretend you came to 'discuss assignment'"
          ]
        }
      ]
    },
    answerKey: {
      dateId: "2026-10-22",
      stageAnswers: [
        { stageIndex: 0, correctAnswerIndex: 0, explanation: "SOLAS is the most important international treaty concerning the safety of merchant ships." },
        { stageIndex: 1, correctAnswerIndex: 0, explanation: "REAL! Ports and Shipping Management trains logistics and terminal leaders." },
        { stageIndex: 2, correctAnswerIndex: 1, explanation: "Akara and fresh hot bread is the king of budget sustenance across all Nigerian universities." }
      ]
    }
  }
];
function getSeedPackForDate(dateId) {
  const match = SEED_DAILY_PACKS.find((p) => p.pack.dateId === dateId);
  if (match) return match;
  let hash = 0;
  for (let i = 0; i < dateId.length; i++) {
    hash = (hash << 5) - hash + dateId.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % SEED_DAILY_PACKS.length;
  const template = SEED_DAILY_PACKS[index];
  return {
    pack: {
      ...template.pack,
      dateId
    },
    answerKey: {
      ...template.answerKey,
      dateId
    }
  };
}

// src/lib/dailyTime.ts
var LAGOS_OFFSET_HOURS = 1;
function getLagosDateId(date = /* @__PURE__ */ new Date()) {
  const utcMillis = date.getTime() + date.getTimezoneOffset() * 6e4;
  const lagosTime = new Date(utcMillis + LAGOS_OFFSET_HOURS * 36e5);
  const year = lagosTime.getFullYear();
  const month = String(lagosTime.getMonth() + 1).padStart(2, "0");
  const day = String(lagosTime.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function isConsecutiveLagosDay(prevDateId, currentDateId) {
  if (!prevDateId || !currentDateId) return false;
  const [y1, m1, d1] = prevDateId.split("-").map(Number);
  const [y2, m2, d2] = currentDateId.split("-").map(Number);
  const dA = new Date(Date.UTC(y1, m1 - 1, d1));
  const dB = new Date(Date.UTC(y2, m2 - 1, d2));
  const diffDays = Math.round((dB.getTime() - dA.getTime()) / (1e3 * 60 * 60 * 24));
  return diffDays === 1;
}
function calculateUpdatedStreak(currentStreak, lastCompletedDateId, todayDateId) {
  if (!lastCompletedDateId) {
    return 1;
  }
  if (lastCompletedDateId === todayDateId) {
    return currentStreak > 0 ? currentStreak : 1;
  }
  if (isConsecutiveLagosDay(lastCompletedDateId, todayDateId)) {
    return (currentStreak || 0) + 1;
  }
  return 1;
}

// src/server/storage.ts
var isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
var SEED_DATA_DIR = path.resolve(".data");
var SEED_DB_FILE = path.join(SEED_DATA_DIR, "db.json");
var DATA_DIR = isServerless ? path.join("/tmp", ".data") : SEED_DATA_DIR;
var DB_FILE = isServerless ? path.join("/tmp", ".data", "db.json") : SEED_DB_FILE;
var StorageManager = class {
  constructor() {
    this.ensureDirectory();
    this.db = this.loadDatabase();
    this.initializeDefaults();
  }
  ensureDirectory() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch (err) {
      console.warn("Could not create data directory, using in-memory store:", err);
    }
  }
  loadDatabase() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        return JSON.parse(raw);
      } catch (err) {
        console.error("Failed to parse db.json, creating clean store:", err);
      }
    }
    if (isServerless && fs.existsSync(SEED_DB_FILE)) {
      try {
        const raw = fs.readFileSync(SEED_DB_FILE, "utf-8");
        return JSON.parse(raw);
      } catch (err) {
        console.error("Failed to parse seed db.json:", err);
      }
    }
    return {
      users: {},
      dailyAttempts: {},
      dailyPacks: {},
      circles: {},
      circleInvites: {},
      roomCodes: {},
      rooms: {},
      privateRoomState: {},
      reports: []
    };
  }
  save() {
    try {
      this.ensureDirectory();
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(this.db, null, 2), "utf-8");
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.warn("Error saving db.json (using in-memory store):", err);
    }
  }
  initializeDefaults() {
    const today = getLagosDateId();
    if (!this.db.dailyPacks[today]) {
      this.db.dailyPacks[today] = getSeedPackForDate(today);
      this.save();
    }
  }
  // --- Users ---
  getUser(userId) {
    return this.db.users[userId];
  }
  saveUser(user) {
    this.db.users[user.userId] = user;
    this.save();
  }
  getAllUsers() {
    return Object.values(this.db.users);
  }
  // --- Daily Packs & Attempts ---
  getDailyPack(dateId) {
    if (!this.db.dailyPacks[dateId]) {
      this.db.dailyPacks[dateId] = getSeedPackForDate(dateId);
      this.save();
    }
    return this.db.dailyPacks[dateId];
  }
  setDailyPack(dateId, packEntry) {
    this.db.dailyPacks[dateId] = packEntry;
    this.save();
  }
  getDailyAttempt(dateId, userId) {
    return this.db.dailyAttempts[`${dateId}_${userId}`];
  }
  saveDailyAttempt(attempt) {
    this.db.dailyAttempts[`${attempt.dateId}_${attempt.userId}`] = attempt;
    this.save();
  }
  getDailyAttemptsForDate(dateId) {
    return Object.values(this.db.dailyAttempts).filter((a) => a.dateId === dateId);
  }
  // --- Circles ---
  getCircle(circleId) {
    return this.db.circles[circleId];
  }
  getCircleByCode(code) {
    const circleId = this.db.circleInvites[code.toUpperCase()];
    if (!circleId) return void 0;
    return this.db.circles[circleId];
  }
  saveCircle(circle) {
    this.db.circles[circle.id] = circle;
    this.db.circleInvites[circle.inviteCode.toUpperCase()] = circle.id;
    this.save();
  }
  getAllCircles() {
    return Object.values(this.db.circles);
  }
  // --- Rooms ---
  getRoom(roomId) {
    return this.db.rooms[roomId];
  }
  getRoomByCode(code) {
    const roomId = this.db.roomCodes[code.toUpperCase()];
    if (!roomId) return void 0;
    return this.db.rooms[roomId];
  }
  saveRoom(room) {
    this.db.rooms[room.id] = room;
    this.db.roomCodes[room.code.toUpperCase()] = room.id;
    this.save();
  }
  deleteRoom(roomId) {
    const room = this.db.rooms[roomId];
    if (room) {
      delete this.db.roomCodes[room.code.toUpperCase()];
      delete this.db.rooms[roomId];
      delete this.db.privateRoomState[roomId];
      this.save();
    }
  }
  getPrivateRoomState(roomId) {
    if (!this.db.privateRoomState[roomId]) {
      this.db.privateRoomState[roomId] = { privatePlayers: {} };
    }
    return this.db.privateRoomState[roomId];
  }
  savePrivateRoomState(roomId, state) {
    this.db.privateRoomState[roomId] = state;
    this.save();
  }
  // --- Reports ---
  addReport(report) {
    const item = {
      id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      ...report,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.db.reports.unshift(item);
    this.save();
    return item;
  }
  getReports() {
    return this.db.reports;
  }
};
var storage = new StorageManager();

// src/lib/scoring.ts
function assignUndercoverRoles(playerIds, civilianWord, undercoverWord, randomFn = Math.random) {
  if (playerIds.length < 3) {
    throw new Error("Undercover requires at least 3 players");
  }
  const count = playerIds.length;
  let undercoverCount = 1;
  if (count >= 6 && count <= 9) {
    undercoverCount = 2;
  } else if (count >= 10) {
    undercoverCount = 3;
  }
  const shuffled = [...playerIds].sort(() => randomFn() - 0.5);
  const undercoverPlayerIds = new Set(shuffled.slice(0, undercoverCount));
  return playerIds.map((id) => {
    const isUndercover = undercoverPlayerIds.has(id);
    return {
      playerId: id,
      role: isUndercover ? "undercover" : "civilian",
      secretWord: isUndercover ? undercoverWord : civilianWord
    };
  });
}
function checkUndercoverWinCondition(activePlayers) {
  const civilians = activePlayers.filter((p) => p.role === "civilian");
  const undercovers = activePlayers.filter((p) => p.role === "undercover");
  if (undercovers.length === 0) {
    return {
      isOver: true,
      winner: "civilians",
      reason: "All Undercovers were eliminated! Civilians win!"
    };
  }
  if (undercovers.length >= civilians.length) {
    return {
      isOver: true,
      winner: "undercover",
      reason: "Undercover count equals or exceeds Civilians! Undercovers win!"
    };
  }
  return { isOver: false };
}
function resolveVoteElimination(votes, eligibleTargetIds) {
  const tally = {};
  for (const targetId of eligibleTargetIds) {
    tally[targetId] = 0;
  }
  for (const [, targetId] of Object.entries(votes)) {
    if (eligibleTargetIds.includes(targetId)) {
      tally[targetId] = (tally[targetId] || 0) + 1;
    }
  }
  let highestVotes = -1;
  let topCandidates = [];
  for (const [targetId, count] of Object.entries(tally)) {
    if (count > highestVotes) {
      highestVotes = count;
      topCandidates = [targetId];
    } else if (count === highestVotes && count > 0) {
      topCandidates.push(targetId);
    }
  }
  if (highestVotes <= 0 || topCandidates.length > 1) {
    return {
      eliminatedPlayerId: null,
      tally,
      isTie: topCandidates.length > 1
    };
  }
  return {
    eliminatedPlayerId: topCandidates[0],
    tally,
    isTie: false
  };
}
function scoreWhoSaidThatAnswer(authorPlayerId, guesses, allPlayerIds) {
  const scores = {};
  allPlayerIds.forEach((id) => scores[id] = 0);
  const correctGuessers = [];
  let fooledCount = 0;
  for (const [voterId, guessedAuthor] of Object.entries(guesses)) {
    if (voterId === authorPlayerId) continue;
    if (guessedAuthor === authorPlayerId) {
      scores[voterId] = (scores[voterId] || 0) + 10;
      correctGuessers.push(voterId);
    } else {
      fooledCount += 1;
    }
  }
  scores[authorPlayerId] = (scores[authorPlayerId] || 0) + fooledCount * 5;
  return {
    playerScores: scores,
    correctGuessers,
    fooledCount
  };
}
function calculateDailyStageScore(selectedOptionIndex, correctOptionIndex) {
  const isCorrect = selectedOptionIndex === correctOptionIndex;
  return {
    isCorrect,
    points: isCorrect ? 10 : 0
  };
}

// src/server/geminiService.ts
import { GoogleGenAI } from "@google/genai";
var aiInstance = null;
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}
async function generateDailyCandidatePack(dateId) {
  const ai = getAIClient();
  if (!ai) return null;
  try {
    const prompt = `You are the content editor for "NO CAP", a Nigerian university campus social trivia game.
Create a 3-stage daily challenge pack for date ${dateId}.
Stage 1: Campus Quickfire - 1 objective general knowledge question about Nigerian campus life, university grading (NUC), or general student affairs. 4 options, strictly 1 correct.
Stage 2: Real or Fake Course? - 1 course name that is either a real accredited university programme or an amusing fake one. Options: ["REAL COURSE", "FAKE COURSE"].
Stage 3: Campus Read - 1 common, harmless, relatable campus dilemma or funny student situation with 3 distinct reaction choices.

Guidelines:
- No real student or lecturer names, no offensive or sexual slurs, no politics or tribalism.
- Must return strict valid JSON matching the exact schema.

JSON format:
{
  "pack": {
    "dateId": "${dateId}",
    "version": 1,
    "timeLimitSeconds": 120,
    "maxScore": 30,
    "stages": [
      {
        "id": "s1",
        "type": "quickfire",
        "title": "Stage 1: Campus Quickfire",
        "prompt": "...",
        "options": ["A", "B", "C", "D"]
      },
      {
        "id": "s2",
        "type": "real_or_fake",
        "title": "Stage 2: Real Course or Fake Course?",
        "prompt": "Is '...' a real or fake course?",
        "options": ["REAL COURSE", "FAKE COURSE"]
      },
      {
        "id": "s3",
        "type": "campus_read",
        "title": "Stage 3: Campus Read (Majority Dilemma)",
        "prompt": "...",
        "options": ["Option 1", "Option 2", "Option 3"]
      }
    ]
  },
  "answerKey": {
    "dateId": "${dateId}",
    "stageAnswers": [
      { "stageIndex": 0, "correctAnswerIndex": 0, "explanation": "..." },
      { "stageIndex": 1, "correctAnswerIndex": 0, "explanation": "..." },
      { "stageIndex": 2, "correctAnswerIndex": 0, "explanation": "..." }
    ]
  }
}`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    if (!response.text) return null;
    const data = JSON.parse(response.text);
    if (!data.pack || !data.answerKey || data.pack.stages.length !== 3) {
      return null;
    }
    return data;
  } catch (err) {
    console.error("Gemini daily candidate pack generation error (falling back to seed bank):", err);
    return null;
  }
}
async function generateGameVerdict(score, maxScore, streak) {
  const percentage = Math.round(score / maxScore * 100);
  const ai = getAIClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Write a 1-sentence witty, playful verdict for a Nigerian university student who just scored ${score}/${maxScore} (${percentage}%) on NO CAP Daily Showdown with a streak of ${streak} days. Keep it light, collegiate, encouraging, and stylish without targeting named individuals.`
      });
      if (response.text?.trim()) {
        return response.text.trim();
      }
    } catch {
    }
  }
  if (score === maxScore) {
    return "No cap detected! 30/30 pure campus intellectual dominance.";
  }
  if (score >= 20) {
    return "Solid performance! You definitely attend lectures and listen to announcements.";
  }
  if (score >= 10) {
    return "You survived, but the hostel gossip is distracting your academic focus.";
  }
  return "Omo! The answer sheet gave you heavy side-eye today. Tomorrow is redemption day.";
}

// src/config/appConfig.ts
var APP_CONFIG = {
  name: "NO CAP",
  tagline: "Your people. Your score. Your campus.",
  shortDescription: "Quick daily challenges, private circles, and live multiplayer party games for campus.",
  version: "1.0.0",
  defaultInstitution: {
    id: "nmu",
    name: "Nigerian Maritime University",
    shortName: "NMU",
    location: "Okerenkoko / Kurutie, Delta State"
  },
  supportedInstitutions: [
    { id: "nmu", name: "Nigerian Maritime University (NMU)", shortName: "NMU" },
    { id: "unilag", name: "University of Lagos (UNILAG)", shortName: "UNILAG" },
    { id: "ui", name: "University of Ibadan (UI)", shortName: "UI" },
    { id: "futo", name: "Federal University of Technology Owerri (FUTO)", shortName: "FUTO" },
    { id: "uniben", name: "University of Benin (UNIBEN)", shortName: "UNIBEN" },
    { id: "oau", name: "Obafemi Awolowo University (OAU)", shortName: "OAU" }
  ],
  faculties: [
    "Faculty of Engineering",
    "Faculty of Maritime Transport & Logistics",
    "Faculty of Environmental Management",
    "Faculty of Science",
    "Faculty of Marine Technology"
  ],
  departments: [
    "Marine Engineering",
    "Nautical Science",
    "Ports & Shipping Management",
    "Electrical/Electronics Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Maritime Economics & Finance",
    "Transport & Logistics Management",
    "Computer Science",
    "Meteorology & Climate Science",
    "Fisheries & Aquaculture"
  ],
  levels: ["100L", "200L", "300L", "400L", "500L"],
  avatars: [
    { id: "diver", emoji: "\u{1F93F}", label: "Deep Diver", color: "#78A9FF" },
    { id: "anchor", emoji: "\u2693", label: "Anchor", color: "#C6F36A" },
    { id: "captain", emoji: "\u{1F468}\u200D\u2708\uFE0F", label: "Captain", color: "#F4C56A" },
    { id: "compass", emoji: "\u{1F9ED}", label: "Navigator", color: "#74D7A1" },
    { id: "scholar", emoji: "\u{1F9E0}", label: "Big Brain", color: "#FF7777" },
    { id: "surfer", emoji: "\u{1F3C4}", label: "Wave Rider", color: "#C6F36A" },
    { id: "eagle", emoji: "\u{1F985}", label: "Falcon", color: "#78A9FF" },
    { id: "detective", emoji: "\u{1F575}\uFE0F", label: "Undercover", color: "#A7B0BA" }
  ],
  dailyChallenge: {
    stagesCount: 3,
    maxScore: 30,
    pointsPerStage: 10,
    timeLimitSeconds: 120,
    // 2 minutes
    timezone: "Africa/Lagos"
  },
  roomLimits: {
    minPlayers: 2,
    maxPlayers: 16,
    codeLength: 5
  },
  rankingThresholds: {
    circleMinParticipants: 2,
    departmentMinParticipants: 5,
    // minimum participants before official (otherwise provisional)
    universityMinParticipants: 10
  }
};

// src/server/dailyManager.ts
var DailyManager = class {
  /**
   * Retrieves today's published question pack WITHOUT answer key for client play.
   */
  getPublicDailyPack(dateId) {
    const today = dateId || getLagosDateId();
    const entry = storage.getDailyPack(today);
    return entry.pack;
  }
  /**
   * Starts or resumes today's daily challenge attempt for a user.
   */
  startOrResumeAttempt(userId, dateId) {
    const today = dateId || getLagosDateId();
    const existing = storage.getDailyAttempt(today, userId);
    if (existing) {
      return existing;
    }
    const pack = this.getPublicDailyPack(today);
    const user = storage.getUser(userId);
    const newAttempt = {
      attemptId: `att_${today}_${userId}`,
      userId,
      dateId: today,
      packVersion: pack.version,
      currentStage: 0,
      answers: [],
      totalScore: 0,
      maxScore: pack.maxScore,
      completed: false,
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      streakAfter: user?.streak || 0
    };
    storage.saveDailyAttempt(newAttempt);
    return newAttempt;
  }
  /**
   * Authoritatively submits a stage answer.
   */
  async submitStageAnswer(userId, stageIndex, selectedOptionIndex, dateId) {
    const today = dateId || getLagosDateId();
    let attempt = storage.getDailyAttempt(today, userId);
    if (!attempt) {
      attempt = this.startOrResumeAttempt(userId, today);
    }
    if (attempt.completed) {
      return { attempt };
    }
    const existingAnswer = attempt.answers.find((a) => a.stageIndex === stageIndex);
    if (existingAnswer) {
      return { attempt };
    }
    const packEntry = storage.getDailyPack(today);
    const key = packEntry.answerKey.stageAnswers.find((k) => k.stageIndex === stageIndex);
    const correctOptionIndex = key ? key.correctAnswerIndex : 0;
    const { isCorrect, points } = calculateDailyStageScore(selectedOptionIndex, correctOptionIndex);
    attempt.answers.push({
      stageIndex,
      selectedOptionIndex,
      isCorrect,
      pointsAwarded: points,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    attempt.totalScore = attempt.answers.reduce((acc, a) => acc + a.pointsAwarded, 0);
    attempt.currentStage = attempt.answers.length;
    let verdict;
    if (attempt.answers.length >= packEntry.pack.stages.length) {
      attempt.completed = true;
      attempt.completedAt = (/* @__PURE__ */ new Date()).toISOString();
      const user = storage.getUser(userId);
      if (user) {
        const lastDate = user.lastCompletedDailyDateId;
        const newStreak = calculateUpdatedStreak(user.streak, lastDate, today);
        user.streak = newStreak;
        user.bestStreak = Math.max(user.bestStreak || 0, newStreak);
        user.totalPoints = (user.totalPoints || 0) + attempt.totalScore;
        user.dailyPlayedCount = (user.dailyPlayedCount || 0) + 1;
        user.lastCompletedDailyDateId = today;
        user.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        storage.saveUser(user);
        attempt.streakAfter = newStreak;
      }
      verdict = await generateGameVerdict(attempt.totalScore, attempt.maxScore, attempt.streakAfter);
    }
    storage.saveDailyAttempt(attempt);
    return { attempt, verdict };
  }
  /**
   * Builds leaderboards across scopes with real data and honest sample-size labeling.
   */
  getLeaderboard(dateId, scope, scopeId, currentUserId) {
    const attempts = storage.getDailyAttemptsForDate(dateId).filter((a) => a.completed);
    let eligibleAttempts = attempts;
    let minParticipants = 1;
    if (scope === "circle" && scopeId) {
      const circle = storage.getCircle(scopeId);
      if (circle) {
        const memberIds = new Set(Object.keys(circle.members));
        eligibleAttempts = attempts.filter((a) => memberIds.has(a.userId));
        minParticipants = APP_CONFIG.rankingThresholds.circleMinParticipants;
      } else {
        eligibleAttempts = [];
      }
    } else if (scope === "department" && scopeId) {
      eligibleAttempts = attempts.filter((a) => {
        const u = storage.getUser(a.userId);
        return u?.department === scopeId;
      });
      minParticipants = APP_CONFIG.rankingThresholds.departmentMinParticipants;
    } else if (scope === "level" && scopeId) {
      eligibleAttempts = attempts.filter((a) => {
        const u = storage.getUser(a.userId);
        return u?.level === scopeId;
      });
      minParticipants = APP_CONFIG.rankingThresholds.departmentMinParticipants;
    } else if (scope === "university") {
      minParticipants = APP_CONFIG.rankingThresholds.universityMinParticipants;
    }
    eligibleAttempts.sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      return (a.completedAt || "").localeCompare(b.completedAt || "");
    });
    const isProvisional = eligibleAttempts.length < minParticipants;
    const entries = eligibleAttempts.map((att, idx) => {
      const u = storage.getUser(att.userId);
      return {
        rank: idx + 1,
        id: att.userId,
        name: u?.nickname || `Student ${att.userId.slice(-4)}`,
        avatarKey: u?.avatarKey || "anchor",
        score: att.totalScore,
        playedCount: u?.dailyPlayedCount || 1,
        isProvisional,
        department: u?.department,
        level: u?.level,
        streak: u?.streak || 1
      };
    });
    return {
      scope,
      dateId,
      totalParticipants: eligibleAttempts.length,
      isProvisional,
      entries
    };
  }
};
var dailyManager = new DailyManager();

// src/server/circleManager.ts
function generateCircleInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
var CircleManager = class {
  createCircle(userId, params) {
    const user = storage.getUser(userId);
    if (!user) throw new Error("User not found");
    let inviteCode = generateCircleInviteCode();
    while (storage.getCircleByCode(inviteCode)) {
      inviteCode = generateCircleInviteCode();
    }
    const circleId = `circ_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const ownerMember = {
      userId,
      nickname: user.nickname,
      avatarKey: user.avatarKey,
      role: "owner",
      joinedAt: (/* @__PURE__ */ new Date()).toISOString(),
      department: user.department,
      level: user.level
    };
    const circle = {
      id: circleId,
      name: params.name.trim(),
      type: params.type,
      inviteCode,
      ownerId: userId,
      institutionId: params.institutionId || user.institutionId,
      department: params.department || user.department,
      level: params.level || user.level,
      description: params.description?.trim(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      memberCount: 1,
      members: {
        [userId]: ownerMember
      }
    };
    storage.saveCircle(circle);
    return circle;
  }
  joinCircleByCode(userId, inviteCode) {
    const circle = storage.getCircleByCode(inviteCode.trim().toUpperCase());
    if (!circle) {
      throw new Error("Invalid circle invite code");
    }
    const user = storage.getUser(userId);
    if (!user) throw new Error("User not found");
    if (!circle.members[userId]) {
      circle.members[userId] = {
        userId,
        nickname: user.nickname,
        avatarKey: user.avatarKey,
        role: "member",
        joinedAt: (/* @__PURE__ */ new Date()).toISOString(),
        department: user.department,
        level: user.level
      };
      circle.memberCount = Object.keys(circle.members).length;
      storage.saveCircle(circle);
    }
    return circle;
  }
  getUserCircles(userId) {
    return storage.getAllCircles().filter((c) => c.members && !!c.members[userId]);
  }
  getCircleSummary(circleId) {
    const circle = storage.getCircle(circleId);
    if (!circle) return null;
    const today = getLagosDateId();
    const attempts = storage.getDailyAttemptsForDate(today);
    const memberIds = new Set(Object.keys(circle.members));
    const todayMembersCompleted = attempts.filter((a) => a.completed && memberIds.has(a.userId));
    return {
      circle,
      todayCompletedCount: todayMembersCompleted.length,
      totalMembers: Object.keys(circle.members).length
    };
  }
};
var circleManager = new CircleManager();

// src/server/roomManager.ts
function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
var RoomManager = class {
  constructor() {
    this.sseClients = {};
  }
  // roomId -> SSE response connections
  subscribeSSE(roomId, res) {
    if (!this.sseClients[roomId]) {
      this.sseClients[roomId] = [];
    }
    this.sseClients[roomId].push(res);
    res.on("close", () => {
      this.sseClients[roomId] = (this.sseClients[roomId] || []).filter((client) => client !== res);
    });
  }
  broadcastRoomUpdate(roomId) {
    const clients = this.sseClients[roomId];
    if (!clients || clients.length === 0) return;
    const room = storage.getRoom(roomId);
    if (!room) return;
    const payload = `data: ${JSON.stringify(room)}

`;
    for (const client of clients) {
      try {
        client.write(payload);
      } catch (err) {
      }
    }
  }
  createRoom(hostUserId, params) {
    const hostUser = storage.getUser(hostUserId);
    if (!hostUser) throw new Error("Host user not found");
    let code = generateRoomCode();
    while (storage.getRoomByCode(code)) {
      code = generateRoomCode();
    }
    const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const inviteToken = `inv_${Math.random().toString(36).slice(2, 10)}`;
    const hostPlayer = {
      id: hostUserId,
      nickname: hostUser.nickname,
      avatarKey: hostUser.avatarKey,
      isHost: true,
      isReady: true,
      isConnected: true,
      joinedAt: (/* @__PURE__ */ new Date()).toISOString(),
      score: 0
    };
    const room = {
      id: roomId,
      code,
      inviteToken,
      hostId: hostUserId,
      gameType: params.gameType,
      status: "lobby",
      circleId: params.circleId,
      settings: {
        maxPlayers: params.maxPlayers || 10,
        roundCount: params.roundCount || 3,
        timeLimitSeconds: 60,
        keepItClean: true
      },
      players: {
        [hostUserId]: hostPlayer
      },
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    storage.saveRoom(room);
    storage.savePrivateRoomState(roomId, { privatePlayers: {} });
    return room;
  }
  joinRoom(userId, codeOrToken) {
    const clean = codeOrToken.trim().toUpperCase();
    let room = storage.getRoomByCode(clean);
    if (!room) {
      const allRooms = Object.values(storage.db.rooms);
      room = allRooms.find((r) => r.inviteToken === codeOrToken);
    }
    if (!room) {
      throw new Error("Room not found or invalid code");
    }
    if (room.status === "closed") {
      throw new Error("This room has been closed");
    }
    const user = storage.getUser(userId);
    if (!user) throw new Error("User not found");
    const currentPlayers = Object.keys(room.players);
    if (!room.players[userId] && currentPlayers.length >= room.settings.maxPlayers) {
      throw new Error("Room is at maximum player capacity");
    }
    if (!room.players[userId]) {
      if (room.status === "active") {
        throw new Error("Game is already in progress");
      }
      room.players[userId] = {
        id: userId,
        nickname: user.nickname,
        avatarKey: user.avatarKey,
        isHost: false,
        isReady: false,
        isConnected: true,
        joinedAt: (/* @__PURE__ */ new Date()).toISOString(),
        score: 0
      };
    } else {
      room.players[userId].isConnected = true;
    }
    room.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    storage.saveRoom(room);
    this.broadcastRoomUpdate(room.id);
    return room;
  }
  setReady(roomId, userId, isReady) {
    const room = storage.getRoom(roomId);
    if (!room) throw new Error("Room not found");
    if (!room.players[userId]) throw new Error("Player not in room");
    room.players[userId].isReady = isReady;
    room.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    storage.saveRoom(room);
    this.broadcastRoomUpdate(room.id);
    return room;
  }
  startRoom(roomId, hostUserId) {
    const room = storage.getRoom(roomId);
    if (!room) throw new Error("Room not found");
    if (room.hostId !== hostUserId) throw new Error("Only the host can start the room");
    const playerIds = Object.keys(room.players);
    if (playerIds.length < 2) {
      throw new Error("Need at least 2 players to start a live game");
    }
    room.status = "active";
    room.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    if (room.gameType === "undercover") {
      if (playerIds.length < 3) {
        throw new Error("Undercover requires at least 3 players to play");
      }
      const pair = UNDERCOVER_WORD_PAIRS[Math.floor(Math.random() * UNDERCOVER_WORD_PAIRS.length)];
      const assignments = assignUndercoverRoles(playerIds, pair.civilian, pair.undercover);
      const privateState = storage.getPrivateRoomState(roomId);
      privateState.privatePlayers = {};
      assignments.forEach((a) => {
        privateState.privatePlayers[a.playerId] = {
          role: a.role,
          secretWord: a.secretWord
        };
      });
      storage.savePrivateRoomState(roomId, privateState);
      const civilianCount = assignments.filter((a) => a.role === "civilian").length;
      const undercoverCount = assignments.filter((a) => a.role === "undercover").length;
      const publicState = {
        type: "undercover",
        phase: "briefing",
        roundNumber: 1,
        turnPlayerOrder: [...playerIds].sort(() => Math.random() - 0.5),
        clues: [],
        votes: {},
        eliminatedPlayers: [],
        civilianCountRemaining: civilianCount,
        undercoverCountRemaining: undercoverCount,
        statusMessage: `Roles assigned! Check your secret word. ${civilianCount} Civilians, ${undercoverCount} Undercover.`
      };
      room.publicGameState = publicState;
    } else if (room.gameType === "who_said_that") {
      const prompt = WHO_SAID_THAT_PROMPTS[Math.floor(Math.random() * WHO_SAID_THAT_PROMPTS.length)];
      const publicState = {
        type: "who_said_that",
        prompt,
        phase: "submitting",
        currentAnswerIndex: 0,
        submissionsCount: 0,
        revealedAnswers: [],
        scores: {},
        statusMessage: "Everyone submit your anonymous answer now!"
      };
      playerIds.forEach((id) => publicState.scores[id] = 0);
      room.publicGameState = publicState;
      const priv = storage.getPrivateRoomState(roomId);
      priv.authorMap = {};
      storage.savePrivateRoomState(roomId, priv);
    } else if (room.gameType === "most_likely_to") {
      const prompt = MOST_LIKELY_TO_PROMPTS[Math.floor(Math.random() * MOST_LIKELY_TO_PROMPTS.length)];
      const publicState = {
        type: "most_likely_to",
        prompt,
        promptIndex: 1,
        totalPrompts: 3,
        phase: "voting",
        votes: {},
        voteCounts: {},
        topPlayerIds: [],
        scores: {},
        statusMessage: "Vote for who is most likely!"
      };
      playerIds.forEach((id) => publicState.scores[id] = 0);
      room.publicGameState = publicState;
    } else if (room.gameType === "campus_quiz") {
      const quiz = CAMPUS_QUIZ_BANK[Math.floor(Math.random() * CAMPUS_QUIZ_BANK.length)];
      const publicState = {
        type: "campus_quiz",
        currentQuestionIndex: 0,
        totalQuestions: 3,
        question: {
          id: quiz.id,
          prompt: quiz.prompt,
          options: quiz.options,
          category: quiz.category
        },
        phase: "question",
        timeRemaining: 30,
        answeredPlayerIds: [],
        scores: {},
        statusMessage: "Read the question and lock in your answer!"
      };
      playerIds.forEach((id) => publicState.scores[id] = 0);
      room.publicGameState = publicState;
      const priv = storage.getPrivateRoomState(roomId);
      priv.correctAnswers = { [quiz.id]: { correctIndex: quiz.correctIndex, explanation: quiz.explanation } };
      storage.savePrivateRoomState(roomId, priv);
    }
    storage.saveRoom(room);
    this.broadcastRoomUpdate(room.id);
    return room;
  }
  getPlayerPrivateState(roomId, userId) {
    const priv = storage.getPrivateRoomState(roomId);
    return priv.privatePlayers?.[userId] || null;
  }
  submitAction(roomId, userId, actionType, payload) {
    const room = storage.getRoom(roomId);
    if (!room) throw new Error("Room not found");
    if (room.status !== "active") throw new Error("Room is not currently active");
    const state = room.publicGameState;
    if (!state) throw new Error("No active game state");
    if (state.type === "undercover") {
      if (actionType === "start_clues") {
        state.phase = "clue_round";
        state.activeTurnPlayerId = state.turnPlayerOrder[0];
        state.statusMessage = `${room.players[state.activeTurnPlayerId]?.nickname}'s turn to give a one-sentence clue!`;
      } else if (actionType === "submit_clue") {
        const text = String(payload.text || "").trim();
        if (!text) throw new Error("Clue text cannot be empty");
        const player = room.players[userId];
        state.clues.push({
          playerId: userId,
          nickname: player?.nickname || "Player",
          text
        });
        const nextIndex = state.clues.length;
        if (nextIndex < state.turnPlayerOrder.length) {
          state.activeTurnPlayerId = state.turnPlayerOrder[nextIndex];
          state.statusMessage = `${room.players[state.activeTurnPlayerId]?.nickname}'s turn to give a clue!`;
        } else {
          state.phase = "voting";
          state.statusMessage = "All clues submitted! Discuss and vote for who to eliminate.";
          state.votes = {};
        }
      } else if (actionType === "submit_vote") {
        const targetId = String(payload.targetPlayerId);
        if (!room.players[targetId]) throw new Error("Invalid vote target");
        state.votes[userId] = targetId;
        const activePlayerIds = state.turnPlayerOrder.filter(
          (id) => !state.eliminatedPlayers.some((e) => e.playerId === id)
        );
        const votedCount = Object.keys(state.votes).length;
        if (votedCount >= activePlayerIds.length) {
          const res = resolveVoteElimination(state.votes, activePlayerIds);
          if (res.eliminatedPlayerId) {
            const eliminatedPlayer = room.players[res.eliminatedPlayerId];
            const priv = storage.getPrivateRoomState(roomId);
            const playerPriv = priv.privatePlayers?.[res.eliminatedPlayerId];
            state.eliminatedPlayers.push({
              playerId: res.eliminatedPlayerId,
              nickname: eliminatedPlayer?.nickname || "Player",
              role: playerPriv?.role,
              word: playerPriv?.secretWord
            });
            if (playerPriv?.role === "undercover") {
              state.undercoverCountRemaining -= 1;
            } else {
              state.civilianCountRemaining -= 1;
            }
            const surviving = activePlayerIds.filter((id) => id !== res.eliminatedPlayerId).map((id) => ({
              playerId: id,
              role: priv.privatePlayers?.[id]?.role
            }));
            const winCheck = checkUndercoverWinCondition(surviving);
            if (winCheck.isOver) {
              state.phase = "game_over";
              state.winner = winCheck.winner;
              state.statusMessage = winCheck.reason || "Game over!";
              room.status = "completed";
              surviving.forEach((p) => {
                if (p.role === winCheck.winner || winCheck.winner === "civilians" && p.role === "civilian") {
                  if (room.players[p.playerId]) {
                    room.players[p.playerId].score += 20;
                  }
                }
              });
            } else {
              state.phase = "elimination";
              state.statusMessage = `${eliminatedPlayer?.nickname} was eliminated! They were ${playerPriv?.role === "undercover" ? "an Undercover!" : "a Civilian."}`;
            }
          } else {
            state.phase = "elimination";
            state.statusMessage = "Vote was a tie! No one was eliminated this round.";
          }
        }
      } else if (actionType === "next_round") {
        state.roundNumber += 1;
        state.phase = "clue_round";
        state.votes = {};
        const activePlayerIds = state.turnPlayerOrder.filter(
          (id) => !state.eliminatedPlayers.some((e) => e.playerId === id)
        );
        state.turnPlayerOrder = activePlayerIds;
        state.activeTurnPlayerId = state.turnPlayerOrder[0];
        state.statusMessage = `Round ${state.roundNumber}: ${room.players[state.activeTurnPlayerId]?.nickname}'s turn to give a clue!`;
      }
    } else if (state.type === "who_said_that") {
      const priv = storage.getPrivateRoomState(roomId);
      if (actionType === "submit_answer") {
        const text = String(payload.text || "").trim();
        if (!text) throw new Error("Answer cannot be empty");
        const answerId = `ans_${userId}`;
        priv.authorMap = priv.authorMap || {};
        priv.authorMap[answerId] = userId;
        storage.savePrivateRoomState(roomId, priv);
        const existing = state.revealedAnswers.find((a) => a.answerId === answerId);
        if (!existing) {
          state.revealedAnswers.push({
            answerId,
            text,
            guesses: {}
          });
        }
        state.submissionsCount = state.revealedAnswers.length;
        const totalPlayers = Object.keys(room.players).length;
        if (state.submissionsCount >= totalPlayers) {
          state.revealedAnswers.sort(() => Math.random() - 0.5);
          state.phase = "guessing";
          state.currentAnswerIndex = 0;
          state.statusMessage = "Guess who wrote this answer!";
        }
      } else if (actionType === "submit_guess") {
        const currentAns = state.revealedAnswers[state.currentAnswerIndex];
        if (!currentAns) throw new Error("No answer to guess");
        const guessedAuthorId = String(payload.guessedAuthorPlayerId);
        currentAns.guesses[userId] = guessedAuthorId;
        const totalPlayers = Object.keys(room.players).length;
        if (Object.keys(currentAns.guesses).length >= totalPlayers - 1) {
          const authorId = priv.authorMap?.[currentAns.answerId] || "";
          currentAns.actualAuthorId = authorId;
          currentAns.actualAuthorNickname = room.players[authorId]?.nickname || "Player";
          const scored = scoreWhoSaidThatAnswer(authorId, currentAns.guesses, Object.keys(room.players));
          for (const [pid, pts] of Object.entries(scored.playerScores)) {
            state.scores[pid] = (state.scores[pid] || 0) + pts;
            if (room.players[pid]) {
              room.players[pid].score = state.scores[pid];
            }
          }
          state.phase = "reveal";
          state.statusMessage = `Answer revealed! Written by ${currentAns.actualAuthorNickname}.`;
        }
      } else if (actionType === "next_answer") {
        if (state.currentAnswerIndex + 1 < state.revealedAnswers.length) {
          state.currentAnswerIndex += 1;
          state.phase = "guessing";
          state.statusMessage = "Guess who wrote this answer!";
        } else {
          state.phase = "game_over";
          state.statusMessage = "Game Over! Final scores calculated.";
          room.status = "completed";
        }
      }
    } else if (state.type === "most_likely_to") {
      if (actionType === "submit_vote") {
        const targetId = String(payload.targetPlayerId);
        state.votes[userId] = targetId;
        const totalPlayers = Object.keys(room.players).length;
        if (Object.keys(state.votes).length >= totalPlayers) {
          const counts = {};
          Object.values(state.votes).forEach((target) => {
            counts[target] = (counts[target] || 0) + 1;
          });
          state.voteCounts = counts;
          let maxVotes = 0;
          let tops = [];
          for (const [pid, cnt] of Object.entries(counts)) {
            if (cnt > maxVotes) {
              maxVotes = cnt;
              tops = [pid];
            } else if (cnt === maxVotes && cnt > 0) {
              tops.push(pid);
            }
          }
          state.topPlayerIds = tops;
          state.phase = "reveal";
          const topNames = tops.map((id) => room.players[id]?.nickname || "Someone").join(", ");
          state.statusMessage = `The group voted: ${topNames} with ${maxVotes} votes!`;
        }
      } else if (actionType === "next_prompt") {
        const prompt = MOST_LIKELY_TO_PROMPTS[Math.floor(Math.random() * MOST_LIKELY_TO_PROMPTS.length)];
        state.prompt = prompt;
        state.promptIndex += 1;
        state.votes = {};
        state.voteCounts = {};
        state.topPlayerIds = [];
        if (state.promptIndex > state.totalPrompts) {
          state.phase = "game_over";
          state.statusMessage = "All rounds completed!";
          room.status = "completed";
        } else {
          state.phase = "voting";
          state.statusMessage = "Vote for who is most likely!";
        }
      }
    } else if (state.type === "campus_quiz") {
      const priv = storage.getPrivateRoomState(roomId);
      if (actionType === "submit_answer") {
        const optionIndex = Number(payload.optionIndex);
        if (!state.answeredPlayerIds.includes(userId)) {
          state.answeredPlayerIds.push(userId);
        }
        const qInfo = priv.correctAnswers?.[state.question.id];
        if (qInfo && optionIndex === qInfo.correctIndex) {
          state.scores[userId] = (state.scores[userId] || 0) + 10;
          if (room.players[userId]) {
            room.players[userId].score = state.scores[userId];
          }
        }
        const totalPlayers = Object.keys(room.players).length;
        if (state.answeredPlayerIds.length >= totalPlayers) {
          state.phase = "reveal";
          state.revealData = {
            correctOptionIndex: qInfo?.correctIndex || 0,
            explanation: qInfo?.explanation || ""
          };
          state.statusMessage = "Answer revealed!";
        }
      } else if (actionType === "next_question") {
        state.currentQuestionIndex += 1;
        if (state.currentQuestionIndex >= state.totalQuestions) {
          state.phase = "game_over";
          state.statusMessage = "Quiz finished!";
          room.status = "completed";
        } else {
          const quiz = CAMPUS_QUIZ_BANK[Math.floor(Math.random() * CAMPUS_QUIZ_BANK.length)];
          state.question = {
            id: quiz.id,
            prompt: quiz.prompt,
            options: quiz.options,
            category: quiz.category
          };
          state.answeredPlayerIds = [];
          state.phase = "question";
          state.revealData = void 0;
          state.statusMessage = "Read the question and lock in your answer!";
          priv.correctAnswers = priv.correctAnswers || {};
          priv.correctAnswers[quiz.id] = { correctIndex: quiz.correctIndex, explanation: quiz.explanation };
          storage.savePrivateRoomState(roomId, priv);
        }
      }
    }
    room.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    storage.saveRoom(room);
    this.broadcastRoomUpdate(room.id);
    return room;
  }
  leaveRoom(roomId, userId) {
    const room = storage.getRoom(roomId);
    if (!room) return null;
    delete room.players[userId];
    const remainingPlayerIds = Object.keys(room.players);
    if (remainingPlayerIds.length === 0) {
      storage.deleteRoom(roomId);
      return null;
    }
    if (room.hostId === userId) {
      room.hostId = remainingPlayerIds[0];
      room.players[room.hostId].isHost = true;
    }
    room.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    storage.saveRoom(room);
    this.broadcastRoomUpdate(room.id);
    return room;
  }
};
var roomManager = new RoomManager();

// src/server/app.ts
dotenv.config();
var app = express();
app.use(express.json());
var apiRouter = express.Router();
apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok", serverDateId: getLagosDateId(), timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
apiRouter.post("/auth/guest", (req, res) => {
  try {
    const { userId, nickname, avatarKey, department, level } = req.body;
    if (userId) {
      const existing = storage.getUser(userId);
      if (existing) {
        if (nickname) existing.nickname = nickname.trim();
        if (avatarKey) existing.avatarKey = avatarKey;
        if (department) existing.department = department;
        if (level) existing.level = level;
        existing.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        storage.saveUser(existing);
        return res.json({ user: existing });
      }
    }
    const newId = userId || `guest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const defaultNick = nickname?.trim() || `Player_${Math.floor(1e3 + Math.random() * 9e3)}`;
    const user = {
      userId: newId,
      nickname: defaultNick,
      avatarKey: avatarKey || "anchor",
      isGuest: true,
      institutionId: "nmu",
      department: department || "Marine Engineering",
      level: level || "300L",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      streak: 0,
      bestStreak: 0,
      totalPoints: 0,
      dailyPlayedCount: 0,
      liveWinsCount: 0
    };
    storage.saveUser(user);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to authenticate guest" });
  }
});
apiRouter.get("/profile", (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: "Missing userId" });
  const user = storage.getUser(userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});
apiRouter.post("/profile/update", (req, res) => {
  const { userId, nickname, avatarKey, department, level } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });
  const user = storage.getUser(userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (nickname) user.nickname = nickname.trim();
  if (avatarKey) user.avatarKey = avatarKey;
  if (department !== void 0) user.department = department;
  if (level !== void 0) user.level = level;
  user.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  storage.saveUser(user);
  res.json({ user });
});
apiRouter.get("/daily", (req, res) => {
  try {
    const dateId = req.query.date || getLagosDateId();
    const pack = dailyManager.getPublicDailyPack(dateId);
    res.json({ pack, serverDateId: getLagosDateId() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.get("/daily/attempt", (req, res) => {
  const userId = req.query.userId;
  const dateId = req.query.date || getLagosDateId();
  if (!userId) return res.status(400).json({ error: "Missing userId" });
  const attempt = storage.getDailyAttempt(dateId, userId);
  res.json({ attempt: attempt || null, dateId });
});
apiRouter.post("/daily/attempt/start", (req, res) => {
  const { userId, dateId } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });
  try {
    const attempt = dailyManager.startOrResumeAttempt(userId, dateId);
    res.json({ attempt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.post("/daily/attempt/submit", async (req, res) => {
  const { userId, stageIndex, selectedOptionIndex, dateId } = req.body;
  if (!userId || stageIndex === void 0 || selectedOptionIndex === void 0) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  try {
    const result = await dailyManager.submitStageAnswer(userId, stageIndex, selectedOptionIndex, dateId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.get("/daily/leaderboard", (req, res) => {
  try {
    const dateId = req.query.date || getLagosDateId();
    const scope = req.query.scope || "university";
    const scopeId = req.query.scopeId;
    const userId = req.query.userId;
    const leaderboard = dailyManager.getLeaderboard(dateId, scope, scopeId, userId);
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.get("/circles", (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: "Missing userId" });
  const circles = circleManager.getUserCircles(userId);
  res.json({ circles });
});
apiRouter.post("/circles/create", (req, res) => {
  const { userId, name, type, department, level, description } = req.body;
  if (!userId || !name) return res.status(400).json({ error: "Missing required fields" });
  try {
    const circle = circleManager.createCircle(userId, { name, type: type || "friends", department, level, description });
    res.json({ circle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.post("/circles/join", (req, res) => {
  const { userId, inviteCode } = req.body;
  if (!userId || !inviteCode) return res.status(400).json({ error: "Missing required fields" });
  try {
    const circle = circleManager.joinCircleByCode(userId, inviteCode);
    res.json({ circle });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
apiRouter.get("/circles/:circleId", (req, res) => {
  const circleId = req.params.circleId;
  const summary = circleManager.getCircleSummary(circleId);
  if (!summary) return res.status(404).json({ error: "Circle not found" });
  res.json(summary);
});
apiRouter.post("/rooms/create", (req, res) => {
  const { hostUserId, gameType, circleId, maxPlayers, roundCount } = req.body;
  if (!hostUserId || !gameType) return res.status(400).json({ error: "Missing parameters" });
  try {
    const room = roomManager.createRoom(hostUserId, { gameType, circleId, maxPlayers, roundCount });
    res.json({ room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.post("/rooms/join", (req, res) => {
  const { userId, code } = req.body;
  if (!userId || !code) return res.status(400).json({ error: "Missing parameters" });
  try {
    const room = roomManager.joinRoom(userId, code);
    res.json({ room });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
apiRouter.get("/rooms/:roomCode", (req, res) => {
  const code = req.params.roomCode;
  const room = storage.getRoomByCode(code.toUpperCase());
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json({ room });
});
apiRouter.get("/rooms/:roomId/my-state", (req, res) => {
  const roomId = req.params.roomId;
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: "Missing userId" });
  const privateState = roomManager.getPlayerPrivateState(roomId, userId);
  res.json({ privateState });
});
apiRouter.post("/rooms/:roomId/ready", (req, res) => {
  const roomId = req.params.roomId;
  const { userId, isReady } = req.body;
  try {
    const room = roomManager.setReady(roomId, userId, Boolean(isReady));
    res.json({ room });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
apiRouter.post("/rooms/:roomId/start", (req, res) => {
  const roomId = req.params.roomId;
  const { userId } = req.body;
  try {
    const room = roomManager.startRoom(roomId, userId);
    res.json({ room });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
apiRouter.post("/rooms/:roomId/action", (req, res) => {
  const roomId = req.params.roomId;
  const { userId, actionType, payload } = req.body;
  try {
    const room = roomManager.submitAction(roomId, userId, actionType, payload);
    res.json({ room });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
apiRouter.post("/rooms/:roomId/leave", (req, res) => {
  const roomId = req.params.roomId;
  const { userId } = req.body;
  try {
    const room = roomManager.leaveRoom(roomId, userId);
    res.json({ room });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
apiRouter.get("/rooms/:roomId/events", (req, res) => {
  const roomId = req.params.roomId;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  const room = storage.getRoom(roomId);
  if (room) {
    res.write(`data: ${JSON.stringify(room)}

`);
  }
  roomManager.subscribeSSE(roomId, res);
});
apiRouter.post("/reports", (req, res) => {
  const { reporterId, targetType, targetId, reason, details } = req.body;
  if (!reporterId || !targetType || !targetId || !reason) {
    return res.status(400).json({ error: "Missing report fields" });
  }
  const report = storage.addReport({ reporterId, targetType, targetId, reason, details });
  res.json({ success: true, report });
});
apiRouter.get("/admin/overview", (req, res) => {
  res.json({
    totalUsers: storage.getAllUsers().length,
    totalCircles: storage.getAllCircles().length,
    reports: storage.getReports(),
    todayDateId: getLagosDateId()
  });
});
apiRouter.post("/admin/generate-daily", async (req, res) => {
  const { dateId } = req.body;
  const targetDate = dateId || getLagosDateId();
  try {
    const pack = await generateDailyCandidatePack(targetDate);
    if (!pack) {
      return res.status(500).json({ error: "Could not generate pack with AI; fallback seed pack is in use." });
    }
    storage.setDailyPack(targetDate, pack);
    res.json({ success: true, pack });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.use("/api", apiRouter);
app.use("/", apiRouter);
var app_default = app;
export {
  app,
  app_default as default
};
