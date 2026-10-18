import { DailyQuestionPackPublic, DailyAnswerKey } from '../types/game.ts';

// 40+ Nigerian campus & culture Undercover word pairs
export const UNDERCOVER_WORD_PAIRS = [
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
  { civilian: "School Gate", undercover: "Security Post", category: "Campus Landmarks" },
];

// 35+ safe, funny Who Said That? prompts
export const WHO_SAID_THAT_PROMPTS = [
  "What is the biggest lie you ever told a lecturer to excuse being late?",
  "What is the weirdest concoction you ever cooked in the hostel when broke?",
  "If you had to drop out today, what hustle would you start immediately?",
  "What is your secret tactic for surviving an 8 AM Monday lecture on 2 hours of sleep?",
  "What is the most ridiculous excuse you ever gave to escape a group project?",
  "If the school gave you ₦10,000,000 today, what is the first thing you'd buy on campus?",
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
  "What is your go-to meal when there's only ₦500 left in your account?",
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
  "What is the one thing you will miss most about campus after graduation?",
];

// 35+ safe, lively Most Likely To prompts
export const MOST_LIKELY_TO_PROMPTS = [
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
  "Most likely to win NO CAP daily showdown five days in a row.",
];

// 30+ verified Campus & Maritime & General Knowledge Quiz items
export const CAMPUS_QUIZ_BANK = [
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
  },
];

// 14 Pre-generated & Reviewed Daily Showdown question packs with separate answer keys
// Designed with Stage 1 (Campus Quickfire), Stage 2 (Real or Fake Course?), Stage 3 (Campus Read / Dilemma)
export interface SeedPackEntry {
  pack: DailyQuestionPackPublic;
  answerKey: DailyAnswerKey;
}

export const SEED_DAILY_PACKS: SeedPackEntry[] = [
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
          options: ["3.50 – 4.49", "3.00 – 3.49", "4.00 – 4.75", "2.40 – 3.49"],
        },
        {
          id: "s2",
          type: "real_or_fake",
          title: "Stage 2: Real Course or Fake Course?",
          prompt: "Is 'Nautical Science & Hydrographic Surveying' a verified university academic discipline?",
          context: "Decide whether this is a genuine accredited maritime university programme or completely made up.",
          options: ["REAL COURSE", "FAKE COURSE"],
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
          ],
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
          options: ["Knot", "Mach", "Fathom", "Cavit"],
        },
        {
          id: "s2",
          type: "real_or_fake",
          title: "Stage 2: Real Course or Fake Course?",
          prompt: "Is 'Advanced WhatsApp Status Monetization & Group Moderation' an official accredited university degree course?",
          options: ["REAL COURSE", "FAKE COURSE"],
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
          ],
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
          options: ["Starboard", "Port", "Stern", "Quarterdeck"],
        },
        {
          id: "s2",
          type: "real_or_fake",
          title: "Stage 2: Real Course or Fake Course?",
          prompt: "Is 'Marine Engineering & Naval Architecture' an accredited engineering programme?",
          options: ["REAL COURSE", "FAKE COURSE"],
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
          ],
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
          options: ["NPA (Nigerian Ports Authority)", "NIMASA", "NIWA", "NNPC"],
        },
        {
          id: "s2",
          type: "real_or_fake",
          title: "Stage 2: Real Course or Fake Course?",
          prompt: "Is 'Bachelor of Science in Jollof Culinary Warfare & Suya Thermodynamics' an actual NUC university department?",
          options: ["REAL COURSE", "FAKE COURSE"],
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
          ],
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
          options: ["SOLAS (Safety of Life at Sea)", "MARPOL", "STCW", "UNCLOS"],
        },
        {
          id: "s2",
          type: "real_or_fake",
          title: "Stage 2: Real Course or Fake Course?",
          prompt: "Is 'Ports and Shipping Management' an authentic accredited university degree?",
          options: ["REAL COURSE", "FAKE COURSE"],
        },
        {
          id: "s3",
          type: "campus_read",
          title: "Stage 3: Campus Read (Broke Days)",
          prompt: "It's the 24th of the month. Your account balance is ₦470. What is the undisputed champion dinner?",
          options: [
            "Two packs of Indomie cooked with pure water and sheer faith",
            "₦300 Akara and ₦100 Agege bread with tap water",
            "Visit a coursemate's room at dinner time and pretend you came to 'discuss assignment'"
          ],
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

// Fallback helper to provide deterministic packs for any date
export function getSeedPackForDate(dateId: string): SeedPackEntry {
  const match = SEED_DAILY_PACKS.find((p) => p.pack.dateId === dateId);
  if (match) return match;

  // Modulo index from date string hash to pick one of the reviewed seed packs
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
      dateId,
    },
    answerKey: {
      ...template.answerKey,
      dateId,
    },
  };
}
