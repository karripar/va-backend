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
