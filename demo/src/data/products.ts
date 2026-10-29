import type { Product } from "../types";
import { CFCI_STAFF } from "./users";

const CONTACT_NOTE = "Contact Ibrahim Mohedas (ibrahim.mohedas@duke.edu) to connect with the team.";

// Sample listings adapted from the IE790 Executive Summaries (Fall 2026).
// Stage, IP and category are summarised from the milestone text, not stated in the source.
const RAW_PRODUCTS: Product[] = [
  {
    id: "circadian-labs",
    ownerIds: ["u-kylie", "u-brian"],
    name: "Circadian Labs",
    tagline: "Programmable transdermal sleep therapy for patients who can't take another pill",
    pitchProblem: "Insomnia patients who can't swallow pills have no safe, well-timed way to take melatonin.",
    pitchSolution: "A wearable controller releases melatonin overnight and caffeine by morning on a set schedule.",
    category: "health",
    stage: "Prototype",
    ip: "Provisional patent filed",
    summary:
      "A wearable controller and microcapsule stickers deliver melatonin overnight and caffeine by morning on a programmed schedule, starting with nursing home residents who have dysphagia.",
    problems: [
      "Insomnia patients with dysphagia cannot safely swallow melatonin pills or tablets",
      "Dosing melatonin at the right time is hard in any currently available form",
      "Complex medication routines leave patients little control and still waking unrested",
    ],
    solution: [
      "Wearable controller thermally activates microcapsule stickers at programmed times",
      "Slow, continuous overnight melatonin delivery with caffeine released by morning",
      "Micropill composite platform built to enable a series of transdermal combination products",
    ],
    edge: [
      "Programmable timed release, unlike passive sleep patches from The Good Patch and Klova",
      "Pill-free alternative to melatonin and prescription hypnotics such as Ambien and trazodone",
      "No FDA-regulated transdermal product exists today for insomnia or circadian regulation",
    ],
    market: [
      { label: "TAM", value: "$6.2B/yr", note: "US insomnia and sleep-aid market; 35M Americans use sleep aids regularly" },
      { label: "Beachhead", value: "$150M+/yr", note: "~150K US nursing home patients with insomnia and dysphagia" },
    ],
    traction: [
      "Filed provisional patent (DU8987PROV) on microcapsule composites and activation platform",
      "Demonstrated microcapsule encapsulation of small-molecule dyes for thermal release in lab",
      "Designed low-power platform for targeted thermal activation and localized bioavailability",
    ],
    next: [
      "Secure IP position with Duke OTC ahead of the October 28 non-provisional deadline",
      "Define FDA combination product pathway, timeline and cost with regulatory consultants",
      "Complete a $150K preclinical study milestone to validate transdermal efficacy",
    ],
    team: [
      { name: "Student founder 1", role: "PhD, Co-founder" },
      { name: "Student founder 2", role: "PhD, Co-founder" },
    ],
    daysSinceUpdate: 6,
    status: "live",
  },
  {
    id: "graphene-hall",
    name: "Graphene Hall Sensors",
    tagline: "Application-specific graphene Hall and quantum Hall modules for precision sensing",
    pitchProblem: "Researchers and robot builders can't measure magnetic fields precisely where heat, cold or size limit today's sensors.",
    pitchSolution: "Calibrated graphene Hall modules that measure fields directly at the sample, built for each application.",
    category: "research",
    stage: "Early research",
    ip: "Prior-art review planned",
    summary:
      "Graphene Hall and quantum Hall modules paired with packaging, calibration and readout, built to solve one well-defined measurement problem at a time.",
    problems: [
      "Cryogenic researchers often infer sample fields from magnet current, adding uncertainty",
      "Existing probes are limited by temperature, sensor-stage heating, size and field range",
      "Metrology labs bear high cost and complexity maintaining quantum resistance standards",
    ],
    solution: [
      "Calibrated graphene Hall probes that measure magnetic fields directly at the sample in cryostats",
      "Rugged graphene Hall modules for custom actuators in defense and high-performance robots",
      "Graphene quantum Hall devices for resistance standards at more accessible fields and temperatures",
    ],
    edge: [
      "Targets lower sensor-stage heat and wider range than InAs/GaAs probes from Lake Shore and SENIS",
      "Graphene quantum Hall standards operate at ≤5 T and up to 4.2 K, less demanding than GaAs",
      "Full application-specific modules vs. Paragraf and Measurements International device offerings",
    ],
    market: [
      { label: "TAM", value: "$47.5M/yr", note: "Global across robotics, cryogenic, metrology and radiotherapy sensing" },
      { label: "SAM", value: "$2.58M/yr", note: "US, led by ~$2.05M/yr in robotics sensing modules (provisional)" },
    ],
    traction: [
      "Hands-on research in graphene heterostructure fabrication, characterization and quantum transport",
      "Mapped three market hypotheses spanning cryogenic sensing, robotics and quantum metrology",
      "Completed discovery interviews with a defense robotics engineer and a radiotherapy leader",
    ],
    next: [
      "Interview actuator suppliers and motor-control engineers to validate eligibility and pricing",
      "Benchmark graphene devices against incumbent probes under identical operating conditions",
      "Complete a prior-art review with Duke OTC to identify a protectable device architecture",
    ],
    team: [{ name: "Student founder 1", role: "Graduate Student" }],
    daysSinceUpdate: 62,
    status: "live",
  },
  {
    id: "ontbi",
    name: "onTBI",
    tagline: "AI decision support for traumatic brain injury care in the emergency department",
    pitchProblem: "ED teams deliver inconsistent TBI care, which drives readmissions and wasted resources.",
    pitchSolution: "An AI decision-support tool that guides TBI care and holds up across different hospitals.",
    category: "software",
    stage: "Early research",
    ip: "Not yet disclosed",
    summary:
      "An AI system for hospital emergency departments that struggle to deliver consistent TBI care. It targets a 50% reduction in TBI-related readmissions and is built to generalize across care environments.",
    problems: [
      "Hospital EDs struggle to deliver consistent TBI care, driving readmissions and excess resource use",
      "Existing clinical tools do not generalize to out-of-distribution or non-standard care environments",
      "Providers hesitate to apply models they do not understand, limiting adoption at the bedside",
    ],
    solution: [
      "AI system that guides TBI care decisions in the emergency department",
      "Targets halving TBI-related readmissions while cutting unnecessary resource use",
      "Trained to generalize across hospital environments rather than a single site",
    ],
    edge: [
      "Robust generalization to varied care environments, unlike existing clinical tools",
      "Transparency about how the model generalizes, built to earn provider trust",
      "Highest value for hospitals with atypical case mix or limited rare-outcome data",
    ],
    market: [],
    traction: [],
    next: [],
    team: [{ name: "Student founder 1", role: "PhD" }],
    daysSinceUpdate: 9,
    status: "draft",
  },
  {
    id: "falcon",
    name: "FALCON",
    tagline: "Low-cost, low-latency radar imaging for small drones, with no GPS needed",
    pitchProblem: "Small drones go blind in smoke, fog and darkness, and today's radar is costly and needs GPS.",
    pitchSolution: "Low-cost reconfigurable radar arrays that image on board, in real time, without GPS.",
    category: "hardware",
    stage: "Prototype",
    ip: "Invention disclosure submitted",
    summary:
      "Reconfigurable metamaterial antenna arrays, radar-based UAV positioning and FPGA-accelerated processing bring all-weather SAR imaging to small drones for defense ISR and disaster response.",
    problems: [
      "Small-UAV operators lose EO, lidar, and IR visibility in smoke, fog, darkness, and camouflage",
      "Tactical SAR sensors are costly and need offboard processing, blocking real-time use",
      "Fixed-antenna UAV SAR can't null jammers, switch modes, or form images without GPS",
    ],
    solution: [
      "Low-cost metamaterial arrays steer beams using a single transmitter and receiver",
      "Reconfigurable aperture switches between stripmap and spotlight modes and nulls jammers",
      "Radar-based odometry and FPGA acceleration enable GPS-free, low-latency on-board imaging",
    ],
    edge: [
      "Targets a sub-$2K price point vs. higher-cost tactical sensors like IMSAR NSP-2 and Insitu NSP-5",
      "On-board, low-latency imaging vs. incumbents' offboard processing requirements",
      "All-weather, long-range sensing where EO/RGB, lidar, and thermal cameras degrade",
    ],
    market: [
      { label: "TAM", value: "$1.7B", note: "Airborne SAR and thermal/IR sensors (2025); UAV SAR hardware alone $0.91B" },
      { label: "SAM", value: "$260M/yr", note: "DoD Class 1/2 UAV ISR and US disaster response agencies" },
      { label: "Beachhead", value: "DoD ISR", note: "Backed by the Army's ~$804M FY26 small-UAS budget request" },
    ],
    traction: [
      "Developed radar-based odometry for UAV positioning in GPS-denied environments",
      "Submitted an invention disclosure on metamaterial-based SAR for small UAVs",
      "Builds on David Smith's metamaterial array research and related patent portfolio",
    ],
    next: [
      "Build a working prototype demonstrating low-cost SAR imaging on a small UAV",
      "Implement FPGA-based acceleration for low-latency on-board SAR image formation",
      "Interview DoD end users, procurement leads, and SAR experts to validate specs and pricing",
    ],
    team: [
      { name: "Student founder 1", role: "PhD Candidate" },
      { name: "Faculty advisor", role: "Faculty" },
    ],
    daysSinceUpdate: 14,
    status: "live",
  },
  {
    id: "cns-immune",
    name: "CNS Immune Clearance Platform",
    tagline: "Immune clearance platform for neurodegeneration (listing still being drafted)",
    pitchProblem: "The team is still drafting the problem statement for this listing.",
    pitchSolution: "The team is still drafting the solution for this listing.",
    category: "research",
    stage: "Early research",
    ip: "Invention disclosure pending",
    summary: "",
    problems: [],
    solution: [],
    edge: [],
    market: [
      { label: "TAM", value: "$9.7B → $19.6B", note: "Alzheimer's therapeutics market, 2024 to 2029" },
      { label: "Beachhead", value: "Pharma BD", note: "Biotech teams evaluating CNS immunotherapy licensing; named targets include Lexeo, Candel and Sangamo" },
    ],
    traction: [],
    next: [
      "Confirm IP position and novelty of the new delivery route with Duke OTC and patent counsel",
      "File invention disclosure ahead of pending manuscript publication",
      "Interview pharma/biotech BD scouts on licensing criteria for a preclinical academic asset",
    ],
    team: [
      { name: "Student founder 1", role: "PhD Candidate" },
      { name: "Faculty advisor", role: "Faculty" },
    ],
    daysSinceUpdate: 20,
    status: "draft",
  },
  {
    id: "hf-digital-twins",
    name: "Heart Failure Digital Twins",
    tagline: "Noninvasive hemodynamic monitoring from patient-specific blood-flow simulation",
    pitchProblem: "Pressure-guided heart failure care cuts hospitalizations by up to 50%, but under 1% of patients get the implant it needs.",
    pitchSolution: "Patient-specific blood-flow simulation that predicts the same pressures without an implant.",
    category: "health",
    stage: "Validating",
    ip: "Copyrighted codebase, licensable",
    summary:
      "Pressure-guided therapy cuts heart failure hospitalizations by up to 50%, yet fewer than 1% of patients get the implantable monitors it needs. Patient-specific CFD predicts the same pressures without an implant.",
    problems: [
      "Pressure-guided therapy cuts HF hospitalizations up to 50%, but <1% of patients get monitors",
      "Implantable monitors are invasive and limited by cost and access to specialized care",
      "Current monitors depend on daily patient compliance to take and transmit readings",
    ],
    solution: [
      "Patient-specific CFD digital twins predict cardiac pressures noninvasively",
      "Adds hemodynamic biomarkers beyond pressure, such as wall shear stress",
      "Flags out-of-range predictions to guide cardiologists' medication decisions",
    ],
    edge: [
      "No implant required, unlike CardioMEMS, Cordella, V-LAP, and FIRE1/NORM",
      "No daily patient compliance or chest-worn sensor, unlike CardioTag",
      "Supplements pressure with CFD-derived fluid biomarkers competitors don't measure",
    ],
    market: [
      { label: "TAM", value: "$6.2B", note: "6.7M US adults with HF at a HeartFlow-comparable $930 per analysis" },
      { label: "SAM", value: "$102M", note: "~110,000 patients/yr across ~220 academic medical centers" },
      { label: "Beachhead", value: "100–120+", note: "Institutions that routinely implant hemodynamic monitors" },
    ],
    traction: [
      "Published two papers on CFD-based noninvasive decompensation prediction; two in preparation",
      "Developed a copyrighted CFD codebase, licensable through Duke",
      "Interviewed HF clinicians and a device-adoption expert on barriers to monitor uptake",
    ],
    next: [
      "Interview HF cardiologists to define which biomarkers aid decisions without data fatigue",
      "Introduce CFD during existing right heart catheterizations to build clinician familiarity",
      "Assess workflow patentability and reimbursement pathways used by CFD devices like HeartFlow",
    ],
    team: [{ name: "Student founder 1", role: "PhD Candidate, Biomedical Engineering" }],
    daysSinceUpdate: 11,
    status: "live",
  },
  {
    id: "clinical-sentinel",
    name: "Clinical Sentinel",
    tagline: "A safety gateway that checks clinical AI agents before they touch the EHR",
    pitchProblem: "Hospitals are rolling out AI agents with no independent check on what they write into the EHR.",
    pitchSolution: "A site-local gateway that approves, revises or blocks each agent action before it reaches the record.",
    category: "software",
    stage: "Prototype",
    ip: "Architecture defined, no filing yet",
    summary:
      "An independent, site-local gateway beside the EHR that checks each proposed agent action against authority, evidence and safety policy before it is committed.",
    problems: [
      "AI governance leaders must oversee agents from Epic, vendors, and in-house teams at once",
      "No vendor-neutral control point checks agent authority before actions reach the EHR",
      "Manual committee review is slow, labor-intensive, and absent from the real-time action path",
    ],
    solution: [
      "Normalizes each proposed agent write into a typed clinical action before any EHR effect",
      "Deterministic identity, authority, and safety gates allow, revise, hold, or deny each action",
      "Governability-by-risk registry sets allowable autonomy and records auditable evidence",
    ],
    edge: [
      "Governs agents where they run, unlike Trase, which imports third-party agents onto Origin",
      "Vendor-neutral authority across Epic, Oracle, Microsoft, and custom-built agents",
      "Clinical action semantics that generic gateways and tools like LangSmith and LiteLLM lack",
    ],
    market: [
      { label: "TAM", value: "~$1.0B/yr", note: "5,121 US community hospitals at $200K per site" },
      { label: "SAM", value: "~$120M", note: "400+ US academic health systems at $300K initial contracts" },
      { label: "SOM", value: "$4.2M ARR", note: "From 12 paying systems within five years" },
    ],
    traction: [
      "Defined typed clinical-action, delegation, and trajectory contract architecture",
      "Demonstrated technical feasibility in local demo and replay testing",
      "Duke Health's CHIO invited input on orchestration-platform requirements after demo",
    ],
    next: [
      "Deliver a governance requirements matrix for Duke's AI orchestration-platform review",
      "Run a site-local shadow-mode study at Duke within the next 12–24 months",
      "Secure a design-partner commitment and an external pilot or LOI with a Triangle system",
    ],
    team: [
      { name: "Student founder 1", role: "PhD Candidate, Computational Biology & Bioinformatics" },
      { name: "Student founder 2", role: "Team member" },
      { name: "Faculty advisor", role: "Faculty" },
    ],
    daysSinceUpdate: 4,
    status: "live",
  },
  {
    id: "cnt-solar",
    name: "Carbon Nanotube Tandem Solar",
    tagline: "Thin, flexible all-carbon solar cells for the LEO satellite boom",
    pitchProblem: "Satellite makers can't get space-grade solar cells that are both light and affordable fast enough.",
    pitchSolution: "Thin, flexible all-carbon tandem solar cells that can be printed from solution.",
    category: "research",
    stage: "Early research",
    ip: "Prior-art search underway",
    summary:
      "Solution-processable, all-carbon tandem nanotube solar cells that are thin, flexible and expected to resist radiation, targeting 20%+ efficiency with the rapid production constellations need.",
    problems: [
      "LEO constellation demand is outpacing production of space-grade solar arrays",
      "Incumbent III-V multi-junction cells are rigid, heavy, and cost ~$40–100+/W",
      "Terrestrial silicon substitutes add mass and are capped near the single-junction limit",
    ],
    solution: [
      "Tandem single-walled carbon nanotube cell with an energy-funnel, multi-junction design",
      "Aqueous two-phase extraction sorts nanotube chiralities for solution-based printing",
      "Active films ~50–200 nm thick, roughly three orders of magnitude thinner than silicon wafers",
    ],
    edge: [
      "Lighter and more flexible than incumbent III-V multi-junction cells",
      "All-carbon design avoids perovskites' lead toxicity and degradation challenges",
      "Solution processing promises faster scale-up than wafer-based space photovoltaics",
    ],
    market: [
      { label: "TAM", value: "~$1.5B", note: "Satellite solar power systems market (2025)" },
      { label: "SAM", value: "$0.1–0.35B/yr", note: "Small-satellite and LEO constellation solar arrays" },
    ],
    traction: [
      "Designed tandem SWCNT architecture extending a 2022 Nano Letters device concept",
      "Developing chirality sorting via aqueous two-phase extraction and a new printing method",
      "Interviewed NASA Glenn's Principal Technologist for Power; referred to S-111 standard lead",
    ],
    next: [
      "Measure bench-scale efficiency against the 20%+ threshold NASA flagged as a minimum",
      "Interview the S-111 update lead to define space qualification benchmarks",
      "Complete prior-art search and disclose design modifications to Duke OTC",
    ],
    team: [{ name: "Student founder 1", role: "Master's Student, Materials Science" }],
    daysSinceUpdate: 33,
    status: "live",
  },
  {
    id: "ai-compliance",
    name: "AI Compliance Tool",
    tagline: "An AI-use passport for every creative asset a game or media studio ships",
    pitchProblem: "Studios using generative AI risk fines and backlash because AI-use records are scattered across Slack and spreadsheets.",
    pitchSolution: "A compliance passport on every asset that flags triggered rules and drafts disclosures for sign-off.",
    category: "software",
    stage: "Prototype",
    ip: "No filing yet",
    summary:
      "Studios adopting generative AI face disclosure rules, platform policies and reputational risk. An asset passport maps AI tool use to triggered rules and drafts disclosures for human sign-off.",
    problems: [
      "Undisclosed AI use exposes studios to regulatory fines, contract penalties and IP risk",
      "AI discoveries late in production risk retracted awards, public backlash and costly rework",
      "AI-use records are scattered across Slack, email and spreadsheets with no audit trail",
    ],
    solution: [
      "Asset passport attaches a compliance record to each creative asset as it moves through pipelines",
      "Deterministic rules engine maps AI tool use to the regulations and platform rules it triggers",
      "LLM drafts disclosures for human approval and exports an audit-ready record",
    ],
    edge: [
      "Rule mapping and disclosures that production trackers like ShotGrid, ftrack and Frame.io lack",
      "Asset-level entertainment workflows missing from AI governance tools like Credo AI and OneTrust",
      "Regulation-to-rule library spanning EU AI Act, state laws, guild terms and platform policies",
    ],
    market: [
      { label: "TAM", value: "~$207M/yr", note: "Game, VFX/animation, film/TV and ad studios worldwide" },
      { label: "SAM", value: "$6–7M/yr", note: "US game and VFX studios with 50+ employees and tracker-based pipelines" },
      { label: "Beachhead", value: "Mid-large US game studios", note: "Using tracking tools and shipping on Steam or to EU/CA" },
    ],
    traction: [
      "Built working prototype with a rules engine covering 4 regulations and human approval workflow",
      "Prototype test scenario: 100% correct flags, ~3 seconds end to end, ~$0.02 per disclosure draft",
      "Mapped seven competitor categories and completed discovery interview with a senior AAA FX artist",
    ],
    next: [
      "Interview heads of production, compliance and pipeline leads to validate buyers and pain",
      "Validate pricing against studios' current legal hours, outside fees and delay costs",
      "Build automatic AI-use detection and evaluate self-hosted deployment for AAA security needs",
    ],
    team: [{ name: "Student founder 1", role: "Master's Student" }],
    daysSinceUpdate: 8,
    status: "live",
  },
  {
    id: "viewport-shield",
    name: "Viewport Faraday Shield",
    tagline: "A fabric shield that cuts ion heating 5–10x in trapped-ion quantum computers",
    pitchProblem: "Electrical noise through the imaging viewport heats ions and eats quantum computer run time.",
    pitchSolution: "A conductive-fabric shield that closes the viewport gap and cuts ion heating 5 to 10 times.",
    category: "hardware",
    stage: "Prototype",
    ip: "Provisional disclosure submitted",
    summary:
      "A compact conductive-fabric Faraday shield seals the imaging viewport of trapped-ion and neutral-atom quantum computers while the high-NA objective lens moves freely.",
    problems: [
      "Qubit heating from electrical noise forces cooling overhead that consumes circuit run time",
      "Large imaging viewports leave a gap in the vacuum chamber's Faraday shielding",
      "Objective lenses must move freely, and space around the chamber is extremely limited",
    ],
    solution: [
      "Flexible conductive-fabric baffle closes the viewport gap around the high-NA objective",
      "Makes the objective part of the Faraday shield while preserving full lens mobility",
      "Fabric and CNC-machined mounting rings adapt to custom, pre-existing chamber designs",
    ],
    edge: [
      "Shields the optical viewport, an entry point DC filtering and mu-metal do not address",
      "Compact subsystem-level fix versus costly full-system metal-panel Faraday enclosures",
      "Low cost (~$2K prototype) and retrofittable alongside existing shielding and filtering",
    ],
    market: [
      { label: "TAM", value: "~$4.2M", note: "~241 trapped-ion and neutral-atom academic groups and companies" },
      { label: "SAM", value: "~$1M", note: "Led by trapped-ion quantum computing companies" },
    ],
    traction: [
      "Built and installed a ~$2K prototype on an operating trapped-ion system",
      "Measured 5–10x reduction in ion heating in injected-noise tests",
      "Submitted a provisional patent disclosure to Duke OTC following a prior-art search",
    ],
    next: [
      "Quantify the heating reduction's effect on cooling overhead and gate fidelity",
      "Interview IonQ, Quantinuum, and neutral-atom builders on error budgets and value",
      "Evaluate IP licensing versus product sales given in-house build capability",
    ],
    team: [{ name: "Student founder 1", role: "PhD Candidate" }],
    daysSinceUpdate: 18,
    status: "live",
  },
  {
    id: "continuous-lhmf",
    name: "Continuous LHMF",
    tagline: "Wearable data driving continuous, patient-specific coronary flow simulation",
    pitchProblem: "Doctors only see coronary blood flow at occasional visits, so changes in between go unnoticed.",
    pitchSolution: "Wearable data drives continuous, patient-specific blood-flow simulations that flag risky changes.",
    category: "health",
    stage: "Early research",
    ip: "Not yet disclosed",
    summary:
      "Cardiovascular care is reactive: coronary blood flow is only seen at discrete visits. Routine wearable data drives patient-specific 3D flow simulations that could flag unfavorable changes between visits.",
    problems: [
      "Blood flow cannot be monitored non-invasively, continuously, or over long periods today",
      "Post-PCI follow-up relies on periodic visits, leaving changes between encounters unseen",
      "Wearables report heart rate and ECG but reveal little about underlying coronary flow",
    ],
    solution: [
      "Wearable physiological data drives continuous, patient-specific coronary flow simulations",
      "Derives spatial and temporal flow biomarkers indicative of cardiovascular risk",
      "Summarizes longitudinal hemodynamic changes for clinicians between follow-up visits",
    ],
    edge: [
      "Only approach combining longitudinal monitoring with patient-specific hemodynamics",
      "Adds high-resolution spatial flow data that Apple Watch, SmartBP, and risk scores lack",
      "Continuous insight vs. population risk estimators and periodic clinical follow-up",
    ],
    market: [
      { label: "Early users", value: "Research hospitals", note: "Academic research hospitals and medical research centers" },
      { label: "End users", value: "Post-intervention", note: "High-risk cardiovascular patients needing monitoring after intervention" },
    ],
    traction: [
      "Established framework that generates continuous 3D blood flow data from wearable inputs",
      "Mapped competitive landscape across wearables, risk estimators, and clinical follow-up",
      "Built customer discovery plan targeting interventional and general cardiologists",
    ],
    next: [
      "Interview interventional cardiologists on post-PCI monitoring gaps",
      "Define validation and accuracy thresholds clinicians need to trust the tool",
      "Identify the purchaser and highest-value patient population for a first use case",
    ],
    team: [{ name: "Student founder 1", role: "Duke University" }],
    daysSinceUpdate: 75,
    status: "live",
  },
  {
    id: "er-guide",
    name: "ER-Guide",
    tagline: "A personalized AI care map that tells ED patients what happens next",
    pitchProblem: "ED patients and caregivers wait hours with no idea where they are in their care or what comes next.",
    pitchSolution: "A personalized care map that forecasts next steps and remaining time from the patient's own EHR data.",
    category: "health",
    stage: "Validating",
    ip: "No filing yet",
    summary:
      "Combines a patient's real-time EHR data with patterns from similar historical patients to forecast next steps, remaining time and disposition, starting with adult TBI patients.",
    problems: [
      "TBI patients and caregivers wait hours in the ED without knowing where they are in their care",
      "Verbal updates are the only information channel, and discharge notes are often misunderstood",
      "Clinicians field repetitive questions they cannot always answer, adding to staff burden",
    ],
    solution: [
      "Personalized ED care map shows patients their current stage in the care pathway",
      "Multimodal AI forecasts disposition, expected remaining time, and next likely step",
      "Delivered via MyChart or a mobile app, updating dynamically as care evolves",
    ],
    edge: [
      "Forecasts the ED trajectory; MyChart Bedside surfaces data but does not predict next steps",
      "Grounded in the patient's EHR, unlike search engines and general-purpose LLM chatbots",
      "Personalized to each patient's condition, unlike generic ED posters and discharge sheets",
    ],
    market: [
      { label: "TAM", value: "$1.1B/yr", note: "~4,500 US emergency departments at $250K per site" },
      { label: "SAM", value: "$54M", note: "216 US Level I trauma center emergency departments" },
      { label: "Beachhead", value: "2.5M visits/yr", note: "Adult TBI patients in US EDs, per CDC data" },
    ],
    traction: [
      "Developing AI model weights and a retrieval context engine on Duke Hospital ED data",
      "Completed 8 ED physician interviews and collected 31 public survey responses",
      "Confirmed with ED physicians that no in-wait information support exists today",
    ],
    next: [
      "Validate hospital willingness to pay and an annual subscription model with Duke leadership",
      "Interview prior TBI patients and caregivers to define information needs and limits",
      "Scope EHR integration, data access, and per-hospital model training with health IT",
    ],
    team: [{ name: "Student founder 1", role: "PhD Candidate" }],
    daysSinceUpdate: 12,
    status: "live",
  },
  {
    id: "kinema",
    name: "Kinema",
    tagline: "An AI surgical headlamp that gives residents data-driven feedback",
    pitchProblem: "Surgery residents get inconsistent, attending-dependent feedback and cannot track their own progress.",
    pitchSolution: "An AI headlamp that records open cases and gives each resident data-driven feedback.",
    category: "health",
    stage: "Prototype",
    ip: "Novel CV algorithm demonstrated",
    summary:
      "A headlamp with stereo cameras and computer vision records open procedures non-intrusively and tracks 3D movement, so residents get personalized feedback and programs can measure progress.",
    problems: [
      "Feedback quality depends on the attending, and attendings receive no training in how to teach",
      "Residents have no way to track their own surgical performance across cases over time",
      "Headlamps cost ~$3,700, about a month's salary, so most junior residents go without one",
    ],
    solution: [
      "Headlamp-mounted stereo cameras record open procedures without disrupting OR workflow",
      "Computer vision tracks 3D movement and efficiency, benchmarked against the resident cohort",
      "Personalized post-case feedback, with on-device processing to limit exposure of patient data",
    ],
    edge: [
      "Standalone at ~$3,000 vs. Univet DHM at $28,000, tethered to a laptop, and cart-bound systems",
      "Captures intraoperative performance data that EHR-based Firefly Lab feedback cannot see",
      "Focused on training intelligence, not just imaging like NuLoupes or Panoculon stereo cameras",
    ],
    market: [
      { label: "TAM", value: "$81.3M", note: "19,361 US surgical residents: $58.1M hardware plus $23.2M/yr software" },
      { label: "SAM", value: "$36.1M", note: "8,602 categorical general surgery residents" },
      { label: "SOM", value: "$2.1M", note: "500 residents across 20 programs by year three" },
    ],
    traction: [
      "Built headlamp-mounted camera prototype and gathered feedback from a surgery resident",
      "Demonstrated novel computer vision algorithm for surgical motion tracking",
      "Completed discovery interviews with surgery residents and discussions with Duke's surgery chair",
    ],
    next: [
      "Interview program directors and attendings to validate the institutional buyer for PGY 1–3",
      "Define headlamp weight budget and test off-head battery placement to reduce neck strain",
      "Validate hardware and subscription pricing by PGY level and explore a Firefly Lab partnership",
    ],
    team: [
      { name: "Student founder 1", role: "PhD Student" },
      { name: "Student founder 2", role: "Team member" },
    ],
    daysSinceUpdate: 7,
    status: "live",
  },
  {
    id: "aisleadvisor",
    name: "AisleAdvisor",
    tagline: "AI-guided over-the-counter product selection for retail pharmacies",
    pitchProblem: "Pharmacists can't counsel on every OTC purchase, so shoppers pick by brand and risk bad interactions.",
    pitchSolution: "A conversational kiosk that recommends in-stock products, points to the aisle and refers hard cases to a pharmacist.",
    category: "software",
    stage: "Validating",
    ip: "No filing yet",
    summary:
      "A customer-facing, LLM-powered kiosk gathers symptoms and health information, recommends pharmacist-informed in-stock products, directs shoppers to the aisle and refers complex cases to a pharmacist.",
    problems: [
      "Pharmacists lack time to counsel every OTC purchase amid dispensing and clinical duties",
      "Unguided self-selection risks drug-drug, drug-food, and drug-disease interactions",
      "Shoppers default to heavily marketed brands, skewing pharmacy OTC sales",
    ],
    solution: [
      "Conversational kiosk collects symptoms, medications, and conditions via natural language",
      "Pharmacist-informed decision rules generate personalized OTC recommendations",
      "Links to store inventory to point to in-stock products and aisles, with pharmacist referral",
    ],
    edge: [
      "Symptom checkers (WebMD, Drugs.com, Symptom Scout) inform but don't link to in-store products",
      "OTC benefit apps (OTC Network, CVS OTCHS) manage purchasing, not clinical product selection",
      "Unlike general LLM chatbots, built on pharmacist-informed criteria and safety referral rules",
    ],
    market: [
      { label: "TAM", value: "$300M", note: "~60,000 US retail pharmacy locations at $5K indicative annual platform revenue" },
      { label: "SAM", value: "$127.5M", note: "~25,500 megastore and chain drugstore locations" },
      { label: "SOM", value: "~4,000 sites", note: "By Year 5, starting with independents and a North Carolina pilot" },
    ],
    traction: [
      "Mapped 11 competing OTC apps, symptom checkers, and AI tools against target capabilities",
      "Completed first pharmacist expert interview, confirming openness to AI-assisted OTC support",
      "Built pharmacist discovery guide covering trust, liability, and workflow integration",
    ],
    next: [
      "Interview pharmacists, pharmacy managers, owners, and patients to validate need",
      "Validate willingness to pay behind the $5K per-location pricing assumption",
      "Launch a North Carolina pharmacy pilot before expanding to additional states",
    ],
    team: [{ name: "Student founder 1", role: "PhD Student" }],
    daysSinceUpdate: 16,
    status: "live",
  },
  {
    id: "in-pixel",
    name: "In-Pixel Sensor",
    tagline: "Compute-in-pixel vision that keeps drones seeing when the datalink is jammed",
    pitchProblem: "Drone cameras burn power and add delay, and go blind when the datalink is jammed.",
    pitchSolution: "Pixels that run the first layer of machine learning in the sensor itself, cutting compute by about 93%.",
    category: "hardware",
    stage: "Early research",
    ip: "Patent disclosure submitted",
    summary:
      "Machine-learning operations run directly inside the camera pixel, filtering irrelevant data at the source to cut compute, latency and energy for autonomous onboard perception.",
    problems: [
      "Smart cameras on drones carry long latency and high energy cost, limiting endurance",
      "Ground-based processing blinds the drone completely when the datalink is jammed",
      "Cameras are blinded by high-intensity lasers and degrade badly in low light",
    ],
    solution: [
      "In-pixel photosensor computes while sensing, cutting downstream data and compute",
      "Optoelectronic pixels perform multiply operations directly on incoming light",
      "Pixel arrays execute reconfigurable convolutions or ViT patching in-sensor",
    ],
    edge: [
      "Eliminates ~93% of compute by running the first convolution in hardware",
      "Jam-proof onboard autonomy vs. ground-processed units like AeroVironment Mantis i45",
      "1000x higher light sensitivity than silicon sensors",
    ],
    market: [
      { label: "Market", value: "$0.8B → $2.7B", note: "AI drone market, 2025 to 2030" },
      { label: "Beachhead", value: "Defense drones", note: "Air Force, Marines and delivery platforms; BVLOS autonomy drives demand" },
    ],
    traction: [
      "One publication and one conference proceeding on compute-while-sensing pixels",
      "Patent disclosure submitted on the pixel structure as the core invention",
      "Demonstrated tunable conductance, memory, and fully resettable pixel operation",
    ],
    next: [
      "Collect pixel performance data to drive circuit design",
      "Simulate ML models using measured pixel behavior",
      "Raise pre-seed funding",
    ],
    team: [
      { name: "Student founder 1", role: "PhD Candidate, Electrical Engineering" },
      { name: "Student founder 2", role: "MEng, Electrical Engineering" },
      { name: "Faculty advisor", role: "Professor, Electrical Engineering" },
    ],
    daysSinceUpdate: 25,
    status: "live",
  },
  {
    id: "fly-surgical",
    name: "Fly Surgical Intelligence",
    tagline: "De-identified, annotated surgical datasets for medical robotics companies",
    pitchProblem: "Medical robotics companies lack diverse annotated surgical data, and privacy rules make it costly to collect.",
    pitchSolution: "A compact OR capture device that de-identifies on board and sells annotated datasets to device makers.",
    category: "software",
    stage: "Validating",
    ip: "No filing yet",
    summary:
      "A compact OR vision-capture device with on-board de-identification builds scalable procedure datasets across hospitals, surgeons and geographies for medical robotics companies.",
    problems: [
      "Medical robotics companies lack annotated surgical data to train and verify new products",
      "Existing datasets cover only certain specialties and a narrow set of surgeons",
      "PHI compliance costs and added OR hardware limit how much procedure data can be collected",
    ],
    solution: [
      "Compact OR vision-capture device records instrument usage and maps full surgical procedures",
      "On-board de-identification lowers PHI compliance cost and expands collectable data",
      "Delivers annotated, de-identified datasets to device makers for training and validation",
    ],
    edge: [
      "De-identified by default, unlike Medtronic Touch Surgery, Theator, and Brainlab Loop-X",
      "Combines instrument tracking with procedure mapping; no listed competitor offers both",
      "Sells directly to device makers and robotics firms, where Theator and others target hospitals",
    ],
    market: [
      { label: "TAM", value: "~$1.0B", note: "Global MedTech spend on third-party datasets and annotation" },
      { label: "SAM", value: "$119.9M", note: "470 MedTech, robotics startup and academic research buyers" },
      { label: "SOM", value: "$17.0M ARR", note: "Within 3–5 years from 81 enterprise and academic accounts" },
    ],
    traction: [
      "Reframed the offering from OR hardware to de-identified surgical intelligence data",
      "Mapped a nine-player landscape spanning surgical video, RFID tracking, and OR sensing",
      "Built a bottom-up market model across four buyer cohorts and 470 target institutions",
    ],
    next: [
      "Resolve primary customer, device manufacturers vs hospitals, through targeted interviews",
      "Establish a clear, testable definition of surgical intelligence for buyers",
      "Test how added OR hardware and surgeon review habits affect adoption",
    ],
    team: [{ name: "Student founder 1", role: "PhD Candidate" }],
    daysSinceUpdate: 10,
    status: "live",
  },
];

export const CONTACT = CONTACT_NOTE;

const DAY_MS = 86_400_000;

export const SEED_PRODUCTS: Product[] = RAW_PRODUCTS.map((p, i) =>
  p.status === "live"
    ? {
        ...p,
        featuredUntil: p.id === "hf-digital-twins" ? new Date(Date.now() + 12 * DAY_MS).toISOString() : undefined,
        uploadedBy: {
          name: CFCI_STAFF[i % CFCI_STAFF.length]?.name ?? "CFCI staff",
          at: new Date(Date.now() - (p.daysSinceUpdate + 20 + i) * DAY_MS).toISOString(),
        },
      }
    : p,
);
