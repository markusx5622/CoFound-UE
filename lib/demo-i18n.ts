import { isDemoId, OFFICIAL_DEMO_UID } from "@/lib/demo";

interface DemoProjectTranslation {
  title: string;
  description: string;
  profiles: string[];
  creatorName: string;
}

interface DemoProfileTranslation {
  name: string;
  degree: string;
  campus: string;
  bio: string;
  skills: string[];
}

export const OFFICIAL_DEMO_PROFILE_EN: DemoProfileTranslation = {
  name: "CoFound UE Team",
  degree: "Official Account · Reference Showcase",
  campus: "Turia & Alameda Campus (Valencia)",
  bio: [
    "Official CoFound UE account at the European University of Valencia.",
    "",
    "The 6 projects published on this profile are curated reference examples designed to show how to structure a serious initiative on the platform: real problem, MVP proposal, current stage, and complementary profiles across faculties.",
    "",
    "Because these are demonstration models, applications are disabled—but you can use them as a blueprint to publish your own proposal under \"New Project\" or join real student-led projects on the board.",
  ].join("\n"),
  skills: [
    "Student Entrepreneurship",
    "Startups & MVP",
    "Interdisciplinary Thesis",
    "Campus Hackathons",
    "Product & Validation",
    "Turia & Alameda Campus",
  ],
};

export const OFFICIAL_DEMO_PROJECTS_EN: Record<string, DemoProjectTranslation> = {
  "campusbite-uev": {
    title: "CampusBite — Queue-free orders & anti-food-waste packs for UEV cafés",
    creatorName: "CoFound UE Team",
    profiles: [
      "Computer Engineering",
      "UI/UX Design",
      "Business / Operations",
      "Digital Marketing",
    ],
    description: [
      "THE PROBLEM",
      "During 15-minute breaks between classes at Turia and Alameda campuses, long cafeteria queues build up—and at closing time freshly made food often goes unsold and wasted.",
      "",
      "WHAT WE ARE BUILDING (MVP)",
      "A mobile web app to pre-order coffee or lunch with an exact pickup slot (no waiting) and unlock discounted \"surprise packs\" with daily surplus food for students late in the afternoon.",
      "",
      "CURRENT STAGE & NEXT MILESTONES",
      "• Validation completed with 45 student surveys and 2 interviews with local café staff.",
      "• Figma screen flows 60% ready and unit economics defined.",
      "• Semester goal: run a 4-week closed pilot with 2 venues near campus.",
      "",
      "TEAM & COMMITMENT",
      "Looking for committed co-founders with 4–6 h/week availability and one weekly meeting in Valencia (hybrid). Ideal if you want to ship a real product with live users from month one.",
    ].join("\n"),
  },
  "biotrack-sensor-deporte": {
    title: "BioTrack — Wearable muscle fatigue sensor for university athletes",
    creatorName: "CoFound UE Team",
    profiles: [
      "Biomedical Engineering",
      "Mobile Dev (Flutter)",
      "Sports Science (CAFD)",
      "Business / Finance",
    ],
    description: [
      "THE PROBLEM",
      "Many amateur athletes and university teams suffer preventable overload injuries because they train without objective neuromuscular fatigue metrics; clinical sEMG gear costs thousands of euros.",
      "",
      "WHAT WE ARE BUILDING (MVP)",
      "A lightweight, low-cost strap powered by an ESP32 microcontroller with Bluetooth Low Energy paired to a mobile app that translates fatigue signals into a clear recovery and training-load score.",
      "",
      "CURRENT STAGE & NEXT MILESTONES",
      "• Literature review and surface sensor selection completed.",
      "• First breadboard prototype reading raw signals in the lab.",
      "• 3-month target: calibrate the algorithm with 15 volunteer runners in Valencia and apply to student entrepreneurship awards.",
      "",
      "TEAM & COMMITMENT",
      "We want to combine health sciences, hardware, mobile software, and a solid financial plan. Flexible ~5 h/week commitment adapted to exam periods.",
    ].join("\n"),
  },
  "tfg-gemelo-digital-industria": {
    title: "Thesis (TFG): Digital twin for energy efficiency in industrial SMEs",
    creatorName: "CoFound UE Team",
    profiles: [
      "Industrial Eng. (IOI)",
      "Data Science / Python",
      "Electrical Eng. / IoT",
      "Financial Analysis",
    ],
    description: [
      "THESIS FOCUS",
      "A multidisciplinary Final Degree Project aimed at solving a real challenge for manufacturing SMEs in the Valencian Community: cutting electricity demand peaks and machine downtime without heavy capex.",
      "",
      "TECHNICAL & BUSINESS SCOPE",
      "• Production line modeling via discrete-event simulation and simulated/real energy readings per machine.",
      "• Interactive KPI dashboard (OEE, kWh per batch, hourly cost by electricity tariff).",
      "• ROI study (NPV, IRR, and payback period) ready to present to plant operations managers.",
      "",
      "CURRENT STAGE",
      "Academic outline, open industrial energy datasets, and base architecture are already structured. Looking to collaborate on data modeling, dashboards, and economic viability.",
      "",
      "ORGANIZATION",
      "Bi-weekly milestones with clear deliverables to defend a consultancy-grade Final Degree Project.",
    ].join("\n"),
  },
  "skillswap-uev-mentorias": {
    title: "SkillSwap — Time-bank & micro-mentoring between UEV degrees",
    creatorName: "CoFound UE Team",
    profiles: [
      "Full Stack (Next.js)",
      "Product Design",
      "Marketing & Community",
      "Business / Strategy",
    ],
    description: [
      "THE OPPORTUNITY",
      "A Computer Science student masters Python but needs help with finance or design; a Business student excels at financial modeling in Excel but gets stuck building a landing page. Today that swap only happens by luck among friends.",
      "",
      "WHAT WE ARE BUILDING (MVP)",
      "An exclusive platform for verified students where every hour you teach a concrete skill earns 1 credit to receive 1 hour of micro-mentoring in another subject (45-minute 1-on-1 sessions at the library or over video call).",
      "",
      "CURRENT STAGE & ROADMAP",
      "• High-demand subjects mapped across 4 faculties in Valencia.",
      "• Reputation system, booking flow, and scheduling currently in wireframe stage.",
      "• First goal: onboard 60 early adopters ahead of the upcoming midterm exams.",
      "",
      "TEAM & COMMITMENT",
      "Looking for proactive builders who want to ship fast, test with real classmates, and track weekly retention (4 h/week).",
    ].join("\n"),
  },
  "rebranding-comercio-valencia": {
    title: "Digital boost & brand redesign for historic local shops in Valencia",
    creatorName: "CoFound UE Team",
    profiles: [
      "Graphic Design / Branding",
      "Digital Marketing & Social",
      "Web Development",
      "Audiovisual Comms",
    ],
    description: [
      "THE CHALLENGE",
      "Dozens of neighborhood shops in Valencia (bookshops, traditional bakeries, workshops) offer great products but lack an updated visual identity, an optimized Google profile, or an online catalog.",
      "",
      "WHAT WE WILL DELIVER",
      "We will select 2 real local businesses to execute an end-to-end portfolio project:",
      "• Brand audit and new visual guide (logo, color palette, stationery, and signage).",
      "• Fast locally-optimized website + Google Business Profile & local SEO.",
      "• 30-day Instagram/TikTok content plan with photo and video assets shot on site.",
      "",
      "WHY JOIN",
      "Finish the semester with a real case study for your portfolio and LinkedIn, working with actual clients alongside students from other degrees.",
      "",
      "ESTIMATED COMMITMENT",
      "6-week sprint (~4 h/week) combining on-site visits in central Valencia and online coordination.",
    ].join("\n"),
  },
  "hackathon-sostenibilidad-2026": {
    title: "Multidisciplinary team for Sustainable Urban Mobility Hackathon",
    creatorName: "CoFound UE Team",
    profiles: [
      "Rapid Prototyping / Tech",
      "UX/UI & Figma",
      "Business Model & Pitch",
      "Data Analysis",
    ],
    description: [
      "THE GOAL",
      "Build a balanced 4-student cross-faculty team to compete in the upcoming university hackathon on smart mobility, open urban datasets, and emissions reduction in Valencia.",
      "",
      "HOW WE WILL PREPARE",
      "Instead of improvising on the weekend itself, we will run 2 pre-hackathon 90-minute prep sessions to:",
      "• Explore open datasets from Valenbisi, EMT buses, and Valencia traffic.",
      "• Prepare a rapid frontend + interactive map starter kit so we can prototype in hours.",
      "• Assign clear roles: working demo, Figma UI, impact validation, and a crisp 3-minute jury pitch.",
      "",
      "WHO WE ARE LOOKING FOR",
      "Resourceful students who enjoy building under time pressure, learning fast, and pitching on stage. No prior hackathon experience required—just genuine drive to compete and have fun.",
    ].join("\n"),
  },
};

export function localizeDemoProject<
  T extends {
    id: string;
    title: string;
    description: string;
    profiles: string[];
    creator_id?: string;
    creatorName?: string;
  },
>(project: T, language: "es" | "en"): T {
  if (language !== "en") return project;
  const translated = OFFICIAL_DEMO_PROJECTS_EN[project.id];
  if (!translated) return project;

  return {
    ...project,
    title: translated.title,
    description: translated.description,
    profiles: translated.profiles,
    ...(project.creatorName !== undefined ? { creatorName: translated.creatorName } : {}),
  };
}

export function localizeDemoProfile<
  T extends {
    uid?: string;
    name: string;
    degree: string;
    campus: string;
    bio?: string;
    skills?: string[];
  },
>(profile: T, uid: string | undefined, language: "es" | "en"): T {
  if (language !== "en") return profile;
  if (uid !== OFFICIAL_DEMO_UID && !isDemoId(uid)) return profile;

  return {
    ...profile,
    name: OFFICIAL_DEMO_PROFILE_EN.name,
    degree: OFFICIAL_DEMO_PROFILE_EN.degree,
    campus: OFFICIAL_DEMO_PROFILE_EN.campus,
    ...(profile.bio !== undefined ? { bio: OFFICIAL_DEMO_PROFILE_EN.bio } : {}),
    ...(profile.skills !== undefined ? { skills: OFFICIAL_DEMO_PROFILE_EN.skills } : {}),
  };
}

/**
 * Genera un enlace seguro de traducción bajo demanda (sin APIs ni claves externas)
 * con detección automática de idioma origen hacia el idioma activo del usuario.
 */
export function buildExternalTranslateUrl(text: string, targetLanguage: "es" | "en"): string {
  const safeText = text.trim().slice(0, 1650);
  const params = new URLSearchParams({
    sl: "auto",
    tl: targetLanguage,
    text: safeText,
    op: "translate",
  });
  return `https://translate.google.com/?${params.toString()}`;
}
