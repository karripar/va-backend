import ApplicationStage from '../models/ApplicationStageModel';

export const seedApplicationStages = async () => {
  try {
    // Checking if stages already exist
    const existingStages = await ApplicationStage.countDocuments();

    if (existingStages > 0) {
      console.log('Application stages already seeded');
      return;
    }

    const stages = [
      {
        id: "esihaku-1",
        phase: "esihaku",
        title: "Sisäinen esihaku",
        description: "Hae oman korkeakoulun sisällä vaihto-ohjelmaan",
        requiredDocuments: [
          "Vapaamuotoinen hakemus",
          "Motivaatiokirje",
          "Opintosuoritusote",
          "Kielitaitotodistus"
        ],
        optionalDocuments: [],
        externalLinks: [],
        deadline: new Date("2025-12-28"),
        order: 1
      },
      {
        id: "nomination-1",
        phase: "nomination",
        title: "Nomination partneriyliopistoon",
        description: "Kotikorkeakoulu ilmoittaa sinut kohdeyliopistoon",
        requiredDocuments: [
          "Passikopio",
          "Virallinen opintosuoritusote (englanniksi)",
          "Final Learning Agreement"
        ],
        optionalDocuments: [
          "Asumishakemus",
          "Vakuutustodistus"
        ],
        externalLinks: [],
        order: 2
      },
      {
        id: "apurahat-1",
        phase: "apurahat",
        title: "Erasmus+ apuraha",
        description: "Hae Erasmus+ -apurahaa vaihtoon",
        requiredDocuments: [
          "Erasmus+ Grant Agreement",
          "Learning Agreement"
        ],
        optionalDocuments: [],
        externalLinks: [
          {
            title: "Erasmus+ hakuportaali",
            url: "https://erasmus-plus.ec.europa.eu/opportunities/opportunities-for-individuals/students/studying-abroad?pk_source=website&pk_medium=link&pk_campaign=self&pk_content=self-student-exchange",
            description: "Virallinen Erasmus+ hakuportaali"
          }
        ],
        order: 3
      },
      {
        id: "apurahat-2",
        phase: "apurahat",
        title: "Kela-tuki",
        description: "Hae opintotukea ulkomaille Kelasta",
        requiredDocuments: [
          "Todistus opiskelusta ulkomailla",
          "Kela-hakemus"
        ],
        optionalDocuments: [],
        externalLinks: [
          {
            title: "Kela",
            url: "https://www.kela.fi/henkiloasiakkaat",
            description: "Hae opintotukea ulkomaille"
          }
        ],
        order: 4
      },
      {
        id: "vaihdon-jalkeen-1",
        phase: "vaihdon_jalkeen",
        title: "Opintojen hyväksiluku",
        description: "Suorita vaihdon jälkeiset tehtävät",
        requiredDocuments: [
          "Transcript of Records (virallinen)",
          "Vaihdon loppuraportti",
          "Hyväksilukuhakemus"
        ],
        optionalDocuments: [],
        externalLinks: [],
        order: 5
      }
    ];

    await ApplicationStage.insertMany(stages);
    console.log('✅ Application stages seeded successfully');
  } catch (error) {
    console.error('Error seeding application stages:', error);
  }
};
