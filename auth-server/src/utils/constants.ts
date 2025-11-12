export const budgetCategories = [
  {
    category: "matkakulut",
    title: "Matkakulut",
    description: "Lennot, junat, bussit, kimppakyytit, viisumi",
    icon: "plane",
    items: ["Lennot", "Junat", "Bussit", "Kimppakyytit", "Viisumi"]
  },
  {
    category: "vakuutukset",
    title: "Vakuutukset",
    description: "Matka- ja opiskelija­vakuutukset",
    icon: "shield",
    items: ["Matkavakuutus", "Opiskelija­vakuutus"]
  },
  {
    category: "asuminen",
    title: "Asuminen",
    description: "Vuokra ja -vakuus, muut asuntoon liittyvät laskut",
    icon: "home",
    items: ["Vuokra", "Vakuus", "Sähkölasku", "Internetlasku"]
  },
  {
    category: "ruoka_ja_arki",
    title: "Ruoka ja arki",
    description: "Kaupat ja ravintolat, hygieniä",
    icon: "shopping-cart",
    items: ["Ruokaostokset", "Ravintolat", "Hygieniä"]
  },
  {
    category: "opintovalineet",
    title: "Opintovalineet",
    description: "Kirjat, materiaalit, tietokone",
    icon: "pencil",
    items: ["Kirjat", "Materiaalit", "Tietokone"]
  }
];

export const erasmusGrantTypes = [
  {
    type: "base_grant",
    title: "Erasmus+ apuraha",
    description: "Hae Erasmus+ -apurahaa vaihtoon",
    status: "not_started",
    estimatedAmount: 0,
    requiredDocuments: ["Erasmus+ Grant Agreement", "Learning Agreement"]
  },
  {
    type: "travel_grant",
    title: "Erasmus+ matkatuki",
    description: "Matkakulutuki etäisyyden perusteella",
    status: "not_started",
    estimatedAmount: 0
  },
  {
    type: "green_travel_supplement",
    title: "Vihreän matkustamisen tuki",
    description: "Lisätuki ympäristöystävällisestä matkustamisesta",
    status: "not_started",
    estimatedAmount: 0
  },
  {
    type: "inclusion_support",
    title: "Osallisuustuki",
    description: "Tuki erityistarpeita varten",
    status: "not_started",
    estimatedAmount: 0
  }
];

export const requiredDocuments = {
  esihaku: [
    { type: 'transcript', name: 'Opintosuoritusote' },
    { type: 'motivation_letter', name: 'Motivaatiokirje' },
    { type: 'language_certificate', name: 'Kielitodistus' }
  ],
  nomination: [
    { type: 'nomination_form', name: 'Nomination-lomake' },
    { type: 'learning_agreement', name: 'Learning Agreement' }
  ],
  apurahat: [
    { type: 'grant_application', name: 'Apurahakehakemus' },
    { type: 'budget_plan', name: 'Budjettisuunnitelma' }
  ],
  vaihdon_jalkeen: [
    { type: 'final_report', name: 'Loppuraportti' },
    { type: 'transcript_abroad', name: 'Ulkomainen opintosuoritusote' }
  ]
};

export const platformInstructions = {
  google_drive: {
    name: "Google Drive",
    icon: "📁",
    instructions: [
      "1. Open your file in Google Drive",
      "2. Click the 'Share' button",
      "3. Change access to 'Anyone with the link'",
      "4. Click 'Copy link'",
      "5. Paste the link here"
    ],
    urlPattern: "https://drive.google.com/file/d/...",
    sharingDocs: "https://support.google.com/drive/answer/2494822"
  },
  onedrive: {
    name: "OneDrive",
    icon: "☁️",
    instructions: [
      "1. Right-click your file in OneDrive",
      "2. Click 'Share'",
      "3. Click 'Copy link'",
      "4. Make sure it's set to 'Anyone with the link can view'",
      "5. Paste the link here"
    ],
    urlPattern: "https://1drv.ms/... or https://onedrive.live.com/...",
    sharingDocs: "https://support.microsoft.com/en-us/office/share-onedrive-files-and-folders-9fcc2f7d-de0c-4cec-93b0-a82024800c07"
  },
  dropbox: {
    name: "Dropbox",
    icon: "📦",
    instructions: [
      "1. Right-click your file in Dropbox",
      "2. Click 'Share'",
      "3. Click 'Create link'",
      "4. Click 'Copy link'",
      "5. Paste the link here"
    ],
    urlPattern: "https://www.dropbox.com/...",
    sharingDocs: "https://help.dropbox.com/share/view-only-access"
  },
  icloud: {
    name: "iCloud",
    icon: "☁️",
    instructions: [
      "1. Select your file in iCloud",
      "2. Click the share icon",
      "3. Click 'Copy Link'",
      "4. Paste the link here"
    ],
    urlPattern: "https://www.icloud.com/...",
    sharingDocs: "https://support.apple.com/guide/icloud/share-files-and-folders-mm9945d1f9f7/icloud"
  },
  other_url: {
    name: "Other URL",
    icon: "🔗",
    instructions: [
      "Make sure the URL is:",
      "- Publicly accessible",
      "- A direct link to the document",
      "- From a trusted source",
      "- Not password protected"
    ],
    urlPattern: "https://...",
    sharingDocs: null
  }
};

export const platformPatterns: Record<string, RegExp> = {
  google_drive: /drive\.google\.com\/(file\/d\/|open\?id=)/,
  onedrive: /1drv\.ms\/|onedrive\.live\.com/,
  dropbox: /dropbox\.com\//,
  icloud: /icloud\.com/,
  other_url: /^https?:\/\/.+/
};
