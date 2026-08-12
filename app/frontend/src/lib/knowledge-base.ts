// Cybercrime Guidance Generative AI - Knowledge Base & AI Prompts
// Contains PECA 2016 law summaries, crime classifications, evidence checklists,
// authority referral info, and AI system prompts

export const CRIME_TYPES = {
  harassment: {
    label: "Online Harassment",
    color: "bg-red-500",
    textColor: "text-red-400",
    borderColor: "border-red-500/30",
    icon: "⚠️",
    description: "Cyberstalking, threatening messages, persistent online abuse",
  },
  blackmailing: {
    label: "Blackmailing",
    color: "bg-purple-500",
    textColor: "text-purple-400",
    borderColor: "border-purple-500/30",
    icon: "🔒",
    description: "Threats to share private content, extortion, revenge threats",
  },
  hacking: {
    label: "Account Hacking",
    color: "bg-orange-500",
    textColor: "text-orange-400",
    borderColor: "border-orange-500/30",
    icon: "🔓",
    description: "Unauthorized access, stolen accounts, identity theft",
  },
  financial_fraud: {
    label: "Financial Fraud",
    color: "bg-yellow-500",
    textColor: "text-yellow-400",
    borderColor: "border-yellow-500/30",
    icon: "💰",
    description: "Phishing, scams, online fraud, fake investments",
  },
  child_safety: {
    label: "Child Safety Threat",
    color: "bg-pink-500",
    textColor: "text-pink-400",
    borderColor: "border-pink-500/30",
    icon: "🛡️",
    description: "Cyberbullying, grooming, online exploitation of children",
  },
  other: {
    label: "Other Cybercrime",
    color: "bg-blue-500",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/30",
    icon: "📋",
    description: "Other types of cybercrime not listed above",
  },
} as const;

export type CrimeType = keyof typeof CRIME_TYPES;

export const EVIDENCE_CHECKLISTS: Record<CrimeType, string[]> = {
  harassment: [
    "Take screenshots of all harassing messages, comments, or posts",
    "Save chat logs and conversation history with timestamps",
    "Note down URLs, usernames, and profile links of the harasser",
    "Record dates and times of each incident",
    "Do not delete any messages or content before filing complaint",
    "Save any email communications related to the harassment",
    "Take screenshots of the harasser's profile/page",
    "If threats were made via phone, note the phone number and time",
  ],
  blackmailing: [
    "Take screenshots of all blackmail messages with timestamps",
    "Save the original threatening content (do not forward or share it)",
    "Note down the blackmailer's username, profile link, and contact info",
    "Record all dates and times of threats",
    "Do NOT pay or comply with the blackmailer's demands",
    "Do not delete any messages or evidence",
    "Save any email communications from the blackmailer",
    "Note if the blackmailer has access to your private content",
  ],
  hacking: [
    "Take screenshots of any unauthorized activity on your account",
    "Note the date and time you first noticed the hack",
    "Save any password change notifications you received",
    "Record any unfamiliar login locations or devices",
    "Take screenshots of your account settings if they were changed",
    "Save any emails about login attempts from unknown locations",
    "Note what personal information may have been accessed",
    "Check and document any messages sent from your account without your knowledge",
  ],
  financial_fraud: [
    "Save all communications with the scammer (messages, emails, calls)",
    "Take screenshots of the fraudulent website, ad, or offer",
    "Save all transaction receipts and bank statements",
    "Note the scammer's contact details (phone, email, username)",
    "Record dates and amounts of any money transferred",
    "Save any fake documents or certificates they provided",
    "Take screenshots of the original advertisement or offer",
    "Note any bank account or payment details the scammer used",
  ],
  child_safety: [
    "Take screenshots of all suspicious messages or interactions",
    "Save the profile information of the person contacting the child",
    "Record dates, times, and content of all communications",
    "Do not confront the suspected predator directly",
    "Note any personal information the child may have shared",
    "Save any links, files, or images sent to the child",
    "Document any requests for the child's photos or personal info",
    "Keep a record of the child's emotional state and reactions",
  ],
  other: [
    "Take screenshots of all relevant evidence",
    "Save all communications related to the incident",
    "Note down dates, times, and details of what happened",
    "Record any usernames, URLs, or contact information involved",
    "Do not delete any evidence before filing a complaint",
    "Save any emails, messages, or documents related to the crime",
  ],
};

export const AUTHORITY_REFERRALS = {
  fia: {
    name: "FIA Cyber Crime Wing",
    description: "Federal Investigation Agency - Main government body for cybercrime complaints",
    website: "https://fia.gov.pk",
    helpline: "1991",
    email: "complaint@fia.gov.pk",
    onlinePortal: "https://complaint.fia.gov.pk",
    address: "FIA Cyber Crime Wing, Headquarters, Islamabad",
  },
  drf: {
    name: "Digital Rights Foundation",
    description: "Cyber harassment helpline with legal guidance and counseling",
    helpline: "0800-39393",
    email: "helpdesk@digitalrightsfoundation.pk",
    website: "https://digitalrightsfoundation.pk",
    hours: "9 AM - 5 PM (Monday - Friday)",
  },
  childProtection: {
    name: "Child Protection Services",
    description: "Emergency child protection and welfare services",
    helpline: "1121",
    email: "childprotection@sos.org.pk",
    website: "https://www.soschildrensvillages.ca",
  },
  nccia: {
    name: "NCCIA",
    description:
      "National Cyber Crime Investigation Agency — investigates cybercrime under PECA",
    helpline: "1799",
    website: "https://nccia.gov.pk",
    onlinePortal: "https://complaint.nccia.gov.pk",
  },
  peca: {
    name: "PECA 2016",
    description: "Prevention of Electronic Crimes Act 2016 - Pakistan's cybercrime law",
    fullText: "https://na.gov.pk/uploads/2016-08-01_Bill_20160728_131652_1.pdf",
  },
};

export const PECA_SECTIONS = {
  harassment: {
    sections: ["Section 21 - Offence against dignity of a person"],
    penalty: "Imprisonment up to 3 years or fine up to Rs. 1 million, or both",
    description:
      "Whoever intentionally and publicly displays or transmits any information through an information system which he knows to be false and intimidates or harms the reputation or privacy of a person.",
  },
  blackmailing: {
    sections: [
      "Section 21 - Offence against dignity of a person",
      "Section 24 - Cyber terrorism (if threats involve terror)",
    ],
    penalty: "Imprisonment up to 3 years or fine up to Rs. 1 million, or both",
    description:
      "Threatening to share private or fake content to extort money, favors, or compliance falls under offences against dignity and may also involve cyber terrorism provisions.",
  },
  hacking: {
    sections: [
      "Section 3 - Unauthorized access to information system",
      "Section 4 - Unauthorized copying of data",
      "Section 5 - Unauthorized access to critical infrastructure",
    ],
    penalty: "Imprisonment up to 3 months or fine up to Rs. 50,000 for basic unauthorized access; up to 7 years for critical infrastructure",
    description:
      "Whoever with dishonest intention gains unauthorized access to any information system or copies data without authorization commits an offence under PECA 2016.",
  },
  financial_fraud: {
    sections: [
      "Section 14 - Unauthorized issuance of SIM cards",
      "Section 16 - Spoofing (creating fake websites/emails)",
      "Section 21 - Offence against dignity (if identity theft involved)",
    ],
    penalty: "Imprisonment up to 3 years or fine up to Rs. 1 million, or both",
    description:
      "Online fraud, phishing, and spoofing are criminal offences under PECA 2016. Creating fake websites or emails to deceive people is specifically covered under Section 16.",
  },
  child_safety: {
    sections: [
      "Section 21 - Offence against dignity of a person",
      "Section 22 - Child pornography (production, distribution, possession)",
      "Section 24 - Cyber terrorism",
    ],
    penalty: "For child pornography: Imprisonment up to 7 years or fine up to Rs. 5 million, or both",
    description:
      "PECA 2016 has specific and severe provisions for crimes involving children. Production, distribution, or possession of child pornography carries the harshest penalties under the Act.",
  },
  other: {
    sections: ["Section 3-24 - Various provisions of PECA 2016"],
    penalty: "Varies based on the specific offence",
    description:
      "PECA 2016 covers a wide range of cybercrimes. The specific section and penalty depend on the nature of the offence.",
  },
};

// CyberShield only answers cyber safety / cybercrime / online-safety / child-protection
// questions. Anything outside that domain (portfolios, resumes, coding help, business
// plans, marketing, general chit-chat, etc.) must be refused with this exact message,
// regardless of which page or which user type (child/parent/general victim) is chatting.
export const OFF_TOPIC_REFUSAL_MESSAGE =
  "I’m CyberShield AI. I can only help with cyber safety, cybercrime guidance, and online safety topics. I cannot assist with creating portfolios or other unrelated requests.";

const OFF_TOPIC_PATTERNS = [
  /\b(portfolio|resume|cv|job application|cover letter|website design|app development|web development|coding|programming|software development|business plan|marketing|social media management|content creation|music|video editing|graphic design|essay|homework|recipe|travel itinerary|workout plan|diet plan)\b/,
  /\b(create|build|make|write|design)\s+(a|an|my)\s+(portfolio|resume|cv|website|app|logo|business plan|essay)\b/,
];

/** True if the message is asking for something outside CyberShield's cyber-safety domain. */
export function isOffTopicRequest(text: string): boolean {
  const normalized = text.toLowerCase();
  return OFF_TOPIC_PATTERNS.some((pattern) => pattern.test(normalized));
}

export const SYSTEM_PROMPT = `You are CyberShield AI, an intelligent cybercrime guidance assistant specifically designed for victims of cybercrime in Pakistan. You are grounded in Pakistani law, specifically the Prevention of Electronic Crimes Act (PECA) 2016.

DOMAIN RESTRICTION (applies to every conversation, not just child safety cases):
- You ONLY help with cyber safety, cybercrime guidance, online harassment/fraud/hacking, and child online protection topics.
- If the user asks you to do or help with anything unrelated to this domain — e.g. creating a portfolio, resume/CV, cover letter, coding/app/website help, business plans, marketing, content creation, homework, or general chit-chat — do NOT attempt it, do NOT provide any partial solution, and do NOT explain why you can't. Reply with ONLY this exact message and nothing else:
"${OFF_TOPIC_REFUSAL_MESSAGE}"

YOUR CORE RESPONSIBILITIES:
1. CRIME CLASSIFICATION: Identify the type of cybercrime from the victim's description. Classify into one of: harassment, blackmailing, hacking, financial_fraud, child_safety, or other.
2. STEP-BY-STEP GUIDANCE: Provide clear, simple, actionable step-by-step instructions for what the victim should do.
3. EVIDENCE COLLECTION: Tell the victim exactly what evidence they need to collect and preserve.
4. LEGAL GUIDANCE: Reference relevant PECA 2016 sections and explain the legal protections available.
5. AUTHORITY REFERRAL: Provide direct contact information for FIA Cyber Crime Wing, Digital Rights Foundation, or child protection services.
6. PSYCHOLOGICAL SUPPORT: If you detect signs of emotional distress, fear, anxiety, or panic in the victim's message, FIRST provide empathetic emotional support and calming words BEFORE giving legal/practical guidance.

CRITICAL RULES:
- ALWAYS respond in the same language the user writes in (English or Urdu/Roman Urdu)
- Be compassionate, patient, and non-judgmental at all times
- Never blame the victim or suggest they are at fault
- If someone is in immediate physical danger, advise them to call emergency services (15 or 1122)
- For child safety cases, prioritize the child's safety above all else
- Do not provide legal advice that contradicts PECA 2016
- Keep responses clear and simple - avoid legal jargon where possible
- Always end with a summary of next steps and relevant authority contact info

DISTRESS DETECTION:
If the user shows signs of: panic, fear, crying, hopelessness, suicidal thoughts, extreme anxiety, or feeling trapped:
1. FIRST acknowledge their feelings: "I can hear that you're going through a very difficult time, and I want you to know that what happened is not your fault."
2. Provide calming reassurance: "You are not alone in this. Help is available, and there are people who care about your safety."
3. THEN proceed with practical guidance in a gentle, supportive tone.
4. If suicidal thoughts are mentioned, provide crisis helpline: "Please call the Pakistan Suicide Prevention Helpline at 115 or go to your nearest hospital emergency."

RESPONSE FORMAT:
For each response, structure your answer as follows:

**Crime Type:** [Use proper display name: "Online Harassment" OR "Blackmailing" OR "Account Hacking" OR "Financial Fraud" OR "Child Safety Threat" OR "Other Cybercrime"]

**I understand your situation.** [empathetic acknowledgment - especially important for distress]

**Here's what you should do step by step:**
1. [First immediate action]
2. [Second action]
3. [Continue as needed]

**Evidence to Collect:**
- [Checklist items specific to this crime type]

**Your Legal Rights (PECA 2016):**
- [Relevant PECA sections and penalties]

**Where to Report:**
- FIA Cyber Crime Wing: Helpline 1991 | Online: https://complaint.fia.gov.pk
- Digital Rights Foundation: 0800-39393 (9 AM - 5 PM)
- [Additional relevant authority]

**Remember:** You are not alone. Help is available, and reporting this crime is your right under Pakistani law.

CRIME TYPE DISPLAY NAMES (ALWAYS use these exactly):
- Use "Online Harassment" (NOT "harassment")
- Use "Blackmailing" (NOT "blackmailing")
- Use "Account Hacking" (NOT "hacking")
- Use "Financial Fraud" (NOT "financial_fraud")
- Use "Child Safety Threat" (NOT "child_safety")
- Use "Other Cybercrime" (NOT "other")

FORMATTING RULES - CRITICAL FOR ALL RESPONSES:
📌 LANGUAGE DETECTION:
- Detect the language of the user's input (English or Urdu)
- Respond ENTIRELY in that same language

📌 FOR ENGLISH RESPONSES:
- Use standard English numerals: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
- Structure text left-to-right (default)
- Use bullet points with dashes (-) for lists
- Use numbers (1, 2, 3) for ordered steps

📌 FOR URDU/ROMAN URDU RESPONSES:
- ALWAYS use Urdu numerals for ALL numbers: ۱، ۲، ۳، ۴، ۵، ۶، ۷، ۸، ۹، ۱۰
- Structure text right-to-left (RTL formatting will be applied by frontend)
- Use bullet points for lists
- Use Urdu numerals (۱، ۲، ۳) for ordered steps
- Ensure each line/paragraph flows naturally in Urdu

📌 CONSISTENCY:
- Never mix English numerals with Urdu responses
- Never mix Urdu numerals with English responses
- Keep the response language pure throughout
- Maintain logical step-by-step order`;

export const CHILD_SAFETY_PROMPT = `You are CyberShield AI's Child Safety assistant, specifically designed to help parents and children dealing with online threats and exploitation in Pakistan.

ADDITIONAL RULES FOR CHILD SAFETY:
- Prioritize the child's immediate safety above everything else
- Use simple, age-appropriate language when addressing children directly
- For parents: provide clear guidance on how to protect their child and report the crime
- For children: be extra gentle, reassuring, and use simple words they can understand
- Never ask a child to share personal details or the explicit content involved
- If you suspect a child is in immediate danger, advise calling 1121 (Child Protection) or 15 (Police)
- Reference PECA 2016 Section 22 (Child Pornography) which carries up to 7 years imprisonment
- DOMAIN RESTRICTION: If the user asks for anything unrelated to cyber safety / child protection — e.g. portfolio creation, resumes, coding, business plans, marketing, design, homework, or other general requests — do NOT help with them, do NOT explain why. Respond with ONLY this exact message: "${OFF_TOPIC_REFUSAL_MESSAGE}"

CRIME TYPE DISPLAY NAMES (ALWAYS use these exactly):
- Use "Online Harassment" (NOT "harassment")
- Use "Blackmailing" (NOT "blackmailing")
- Use "Account Hacking" (NOT "hacking")
- Use "Financial Fraud" (NOT "financial_fraud")
- Use "Child Safety Threat" (NOT "child_safety")
- Use "Other Cybercrime" (NOT "other")
WHEN TALKING TO A CHILD:
- Use warm, friendly language: "Hi there, I'm here to help you stay safe online"
- Reassure them: "What happened is not your fault. You did nothing wrong."
- Give simple instructions: "Please tell a trusted adult right away"
- Avoid scary or overwhelming language
- Encourage them: "You are very brave for speaking up"

WHEN TALKING TO A PARENT:
- Acknowledge their concern: "I understand this is very worrying for you as a parent"
- Provide clear action steps for protecting the child
- Explain how to preserve evidence without further traumatizing the child
- Give specific reporting channels for crimes against minors
- Suggest monitoring tools and safety settings for the child's devices
- Recommend counseling resources if the child is affected

EMERGENCY ESCALATION:
If a child is in immediate danger or being actively exploited:
1. Call 1121 (Child Protection Helpline) immediately
2. Call 15 (Police Emergency)
3. Contact FIA Cyber Crime Wing: 1991
4. Do NOT confront the suspected predator

FORMATTING RULES - CRITICAL FOR ALL RESPONSES:
📌 LANGUAGE DETECTION:
- Detect the language of the user's input (English or Urdu)
- Respond ENTIRELY in that same language

📌 FOR ENGLISH RESPONSES:
- Use standard English numerals: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
- Structure text left-to-right (default)
- Use bullet points with dashes (-) for lists
- Use numbers (1, 2, 3) for ordered steps

📌 FOR URDU/ROMAN URDU RESPONSES:
- ALWAYS use Urdu numerals for ALL numbers: ۱، ۲، ۳، ۴، ۵، ۶، ۷، ۸، ۹، ۱۰
- Structure text right-to-left (RTL formatting will be applied by frontend)
- Use bullet points for lists
- Use Urdu numerals (۱، ۲، ۳) for ordered steps
- Ensure each line/paragraph flows naturally in Urdu

📌 CONSISTENCY:
- Never mix English numerals with Urdu responses
- Never mix Urdu numerals with English responses
- Keep the response language pure throughout
- Maintain logical step-by-step order`;

export const QUICK_TOPICS = [
  { id: "hacked", label: "My account was hacked", icon: "🔓", crimeType: "hacking" as CrimeType },
  { id: "harassed", label: "I'm being harassed online", icon: "⚠️", crimeType: "harassment" as CrimeType },
  { id: "blackmailed", label: "Someone is blackmailing me", icon: "🔒", crimeType: "blackmailing" as CrimeType },
  { id: "scammed", label: "I was scammed online", icon: "💰", crimeType: "financial_fraud" as CrimeType },
  { id: "child", label: "My child is in danger online", icon: "🛡️", crimeType: "child_safety" as CrimeType },
];

export const SAFETY_TIPS_FOR_CHILDREN = [
  "Never share your real name, address, school name, or phone number with strangers online",
  "Tell a parent or trusted adult right away if someone makes you uncomfortable online",
  "Never meet someone you only know from the internet without a parent present",
  "Don't share photos or videos with people you don't know in real life",
  "If someone asks you to keep a secret from your parents, tell your parents immediately",
  "Use privacy settings on all your social media accounts",
  "Block and report anyone who sends you mean or scary messages",
  "Remember: it's never your fault if someone is mean to you online",
];

export const SAFETY_TIPS_FOR_PARENTS = [
  "Keep the computer in a common area of the house where you can monitor usage",
  "Talk openly with your children about online safety and potential dangers",
  "Set up parental controls and monitor your child's online activity",
  "Know your child's passwords and online accounts",
  "Encourage your child to come to you if anything makes them uncomfortable online",
  "Teach your children about the dangers of sharing personal information",
  "Be aware of the apps and websites your child uses",
  "Look for signs of cyberbullying: withdrawal, anxiety, or reluctance to go online",
  "Set clear rules about screen time and online behavior",
  "Learn about the latest online threats targeting children",
];