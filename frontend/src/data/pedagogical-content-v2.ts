import {
  GuidedQuestion,
  SubSectionContent,
  StepPedagogicalContent,
} from "./pedagogical-content";

export const STEP_PEDAGOGICAL_CONTENT_V2: Record<number, StepPedagogicalContent> = {
    1: {
      stepNumber: 1,
      title: "Esquissez votre idée d'entreprise",
      objective: "Définir les contours de votre projet en décrivant l'idée initiale, l'offre, les clients et les partenaires potentiels.",
      whyImportant: "Chaque entrepreneur a, par définition, une idée d'entreprise en tête. À ce tout premier stade de la méthodologie, nous profilerons les contours de cette idée, en répondant à des questions simples structurées autour de l'ossature de ce qui deviendra le canevas de notre entreprise verte.",
      avantDeLire: {
        description: "Chaque entrepreneur a, par définition, une idée d'entreprise en tête. À ce tout premier stade de la méthodologie, nous profilerons les contours de cette idée, en répondant pour cela à quelques questions simples structurées autour de l'ossature de ce qui deviendra le canevas de notre entreprise verte dans les chapitres qui suivent. Cet exercice vise par conséquent à comprendre les différentes composantes de l'idée, ainsi qu'à préparer le travail à accomplir.",
        resultatsAttendus: "Une description de l'idée d'entreprise initiale, caractérisée autour des produits et/ou services que l'entrepreneur veut offrir, des clients potentiels visés et des partenaires susceptibles de collaborer avec l'entreprise.",
      },
      etudeDeCas: "Pour vous aider, chaque exercice de votre parcours de développement du modèle d'affaires vert est illustré par un cas pratique : Entreprise de services énergétiques dans les zones rurales en Algérie (ESCO).\n\n1. Quelle est votre idée d'entreprise initiale ?\nApprovisionnement des zones rurales en énergie solaire, ce qui contribuera à réduire la pauvreté dans ces zones.\n\n2. Qu'allez-vous offrir (produit, service) ?\nJe proposerai la livraison, l'installation et la maintenance de systèmes photovoltaïques solaires.\n\n3. Qui pourraient être vos clients ?\nMes clients peuvent être les ménages disposant de ressources et les petites entreprises.\n\n4. Et vos partenaires ?\nMes partenaires pourraient être le gouvernement, les communautés locales, les fournisseurs et les techniciens.",
      conseils: [
        "Soyez prêt(e) à modifier votre idée de départ !",
        "Pourquoi voulez-vous créer une entreprise ? Quels sont les moteurs de ce projet ?",
        "Existe-t-il un meilleur moyen d'atteindre mes objectifs ?",
        "Faites preuve d'ouverture d'esprit et modifiez votre idée initiale si nécessaire"
      ],
      keyConcepts: [
      { term: "Idée d'entreprise", definition: "Le concept de base de ce que vous voulez créer, sans être encore un business model détaillé." },
      { term: "Produit/Service", definition: "Ce que vous allez offrir à vos clients pour résoudre leurs problèmes." },
      { term: "Parties prenantes", definition: "Les personnes ou organisations qui interagissent avec votre projet (clients, partenaires, fournisseurs)." }
    ],
      estimatedMinutes: 40,
      subSections: [
      {
        key: "esquisse_idee",
        label: "Esquissez votre idée d'entreprise",
        objective: "Décrire votre idée initiale en répondant aux questions fondamentales",
        whyImportant: "Cet exercice vise à comprendre les différentes composantes de l'idée, ainsi qu'à préparer le travail à accomplir pour la suite du parcours.",
        tips: [
        "Soyez ouvert à modifier votre idée de départ",
        "Ne cherchez pas la perfection, l'objectif est de noter ce qui vous vient",
        "Parlez de votre idée autour de vous pour recueillir les premières réactions"
      ],
        examples: [
        "Une entreprise de services énergétiques solaires dans les zones rurales"
      ],
        guidedQuestions: [
            { question: "Quelle est votre idée d'entreprise initiale ?", hint: "Décrivez brièvement le concept", placeholder: "Mon idée est de...", type: "textarea" },
            { question: "Qu'allez-vous offrir (produit, service) ?", placeholder: "Je vais offrir...", type: "textarea" },
            { question: "Qui peuvent être vos clients ?", placeholder: "Mes clients peuvent être...", type: "textarea" },
            { question: "Qui peuvent être vos partenaires ?", placeholder: "Mes partenaires peuvent être...", type: "textarea" }
          ],
        estimatedMinutes: 30
      }
    ],
      checklist: [
        "J'ai décrit mon idée d'entreprise initiale",
        "J'ai identifié ce que j'offre (produit/service)",
        "J'ai identifié mes clients potentiels",
        "J'ai identifié mes partenaires potentiels"
      ],
      resources: [
        { title: "Guide pour esquisser une idée d'entreprise", type: "article" }
      ],
    },
    2: {
      stepNumber: 2,
      title: "Identifier les problèmes et les besoins",
      objective: "Comprendre le POURQUOI de votre idée d'affaires initiale en identifiant les défis environnementaux, sociaux, les besoins clients et les motivations de l'équipe.",
      whyImportant: "Il n'y a pas de projet isolé, tout est interconnecté. Comprendre les moteurs qui animent le projet constitue une condition préalable pour toute entreprise afin de définir un cap et une raison d'être.",
      avantDeLire: {
        description: "Après avoir décrit votre idée d'entreprise initiale, c'est le moment de vous poser des questions : Pourquoi voudrais-je la développer ? Quels sont les problèmes ou les défis que je veux relever ? Quels sont les besoins des clients potentiels que j'aimerais satisfaire ?",
        resultatsAttendus: "Décrire les facteurs auxquels notre entreprise est soumise, les forces de changement qui l'affectent, ainsi que les moteurs (problèmes et besoins) qui nous poussent à développer l'idée.",
      },
      etudeDeCas: "Identifier les problèmes et les besoins\n\nDéfis environnementaux :\n- Bruit des générateurs.\n- Émissions de gaz provenant de la combustion de carburant et de kérosène.\n- Fuites de pétrole.\n\nDéfis sociaux :\n- Faible accès à l'électricité.\n- Mauvaises conditions de vie des populations rurales.\n- Problèmes de santé liés aux dégâts environnementaux.\n- Faible offre d'emploi en raison de la situation.\n\nBesoins des clients :\nIls ont besoin d'un approvisionnement stable en électricité car la disponibilité du combustible pour faire fonctionner les générateurs d'électricité des ménages est peu fiable et difficile, et les prix du combustible sont très instables.\n\nMotivations personnelles/professionnelles :\n- Améliorer les conditions de vie des proches.\n- Besoin d'un emploi.",
      conseils: [
        "Il est extrêmement important que vous vérifiiez que ces problèmes sont réels. Évitez de perdre du temps à élaborer une solution dont personne n'a besoin.",
        "Apprenez à vous connaître et à identifier vos limites avant de vous lancer",
        "Est-ce que je peux lancer et gérer mon entreprise tout(e) seul(e) ? Il est toujours souhaitable de s'entourer de personnes susceptibles de jeter un regard objectif",
        "Soyez un entrepreneur vert : votre objectif premier est de créer une valeur ajoutée économique en abordant un problème environnemental"
      ],
      keyConcepts: [
      { term: "Moteurs du projet", definition: "Les forces (environnementales, sociales, clients, personnelles) qui poussent à développer l'idée d'entreprise." },
      { term: "Défis environnementaux", definition: "Les problèmes écologiques auxquels votre entreprise verte cherche à s'attaquer." },
      { term: "Besoins du marché", definition: "Les besoins non satisfaits des clients potentiels qui représentent une opportunité." }
    ],
      estimatedMinutes: 50,
      subSections: [
      {
        key: "problemes_identifies",
        label: "Problèmes identifiés",
        objective: "Lister et prioriser les problèmes que vous souhaitez résoudre",
        whyImportant: "Tous les problèmes ne se valent pas : certains sont urgents, d'autres superficiels. Prioriser vous permet de concentrer vos efforts.",
        tips: [
        "Un bon problème est fréquent, urgent et non résolu",
        "Distinguer les symptômes des causes profondes",
        "Validez chaque problème avec au moins 3 personnes de votre cible"
      ],
        guidedQuestions: [
            { question: "Votre idée s'attaque-t-elle à de réels défis environnementaux ? Lesquels ?", placeholder: "Défis environnementaux :...", type: "textarea" },
            { question: "Votre idée s'attaque-t-elle à de véritables défis sociaux ? Lesquels ?", placeholder: "Défis sociaux :...", type: "textarea" },
            { question: "Quels sont les principaux besoins de vos clients potentiels ?", placeholder: "Besoins des clients :...", type: "textarea" },
            { question: "Quels sont les facteurs personnels ou professionnels qui sous-tendent l'idée d'entreprise ?", placeholder: "Motivations personnelles :...", type: "textarea" }
          ],
        estimatedMinutes: 40
      }
    ],
      checklist: [
        "J'ai identifié les défis environnementaux auxquels mon projet s'attaque",
        "J'ai identifié les défis sociaux auxquels mon projet s'attaque",
        "J'ai identifié les besoins de mes clients potentiels",
        "J'ai identifié mes motivations personnelles et professionnelles"
      ],
      resources: [
        { title: "Guide d'analyse des problèmes et besoins", type: "article" }
      ],
    },
    3: {
      stepNumber: 3,
      title: "Comprendre le contexte (PESTEL)",
      objective: "Analyser les facteurs externes (Politique, Économique, Social, Technologique, Environnemental, Légal) qui influencent votre projet.",
      whyImportant: "Les entreprises opèrent dans un contexte particulier façonné par le pays ou la région. Les forces de changement (PESTEL) ont un impact sur une entreprise. Les entreprises qui en tiennent compte sont en mesure d'anticiper des opportunités et d'éviter les menaces.",
      avantDeLire: {
        description: "Faites un brainstorming : Réfléchissez aux conditions, changements et tendances du contexte local, régional et mondial qui peuvent affecter votre entreprise. Établissez des priorités : Sélectionnez les catégories PESTEL les plus pertinentes (cinq au maximum). Décrivez et confrontez : Pour chaque catégorie, décrivez comment elle affectera votre projet et comment vous y ferez face.",
        resultatsAttendus: "Une analyse PESTEL avec pour chaque dimension retenue les facteurs identifiés, leur impact sur le projet et les actions pour y faire face.",
      },
      etudeDeCas: "Analyse PESTEL - ESCO Algérie\n\nAspects environnementaux : réduction de la disponibilité des métaux et accumulation des déchets toxiques.\nComment : La pénurie de tellurure de cadmium, de séléniure de gallium peut affecter la production de panneaux solaires et faire augmenter leurs coûts. Il sera nécessaire de gérer la fin de vie des panneaux solaires.\n\nAspects politiques : politiques d'électrification rurale et planification.\nComment : Il est primordial d'associer le gouvernement au projet dès son élaboration, et d'être attentif aux nouveaux cadres réglementaires.\n\nAspects technologiques : amélioration de l'efficacité des panneaux solaires et déficit de techniciens qualifiés.\nComment : L'augmentation de l'efficacité pourra améliorer la profitabilité, tandis que la pénurie de techniciens exigera d'en former.\n\nAspects économiques : difficultés d'accès au crédit.\nComment : Il sera essentiel de collaborer avec les banques.",
      conseils: [
        "Les aspects environnementaux sont essentiels pour les entreprises vertes - les ressources naturelles limitées peuvent limiter le développement",
        "La disponibilité limitée des ressources : la surexploitation, l'épuisement des combustibles fossiles",
        "La génération croissante de déchets et d'émissions - les composés synthétiques ne peuvent souvent pas être réintégrés dans les cycles de la nature",
        "Certaines des principales tendances : démographie, production et demande d'énergie, changement climatique, biodiversité, accès à l'eau"
      ],
      keyConcepts: [
      { term: "Analyse PESTEL", definition: "Un outil d'analyse macro-environnementale qui examine six catégories de facteurs externes : Politique, Économique, Social, Technologique, Environnemental, Légal." },
      { term: "Forces de changement", definition: "Les facteurs qui ont un impact sur une entreprise et permettent d'anticiper des opportunités et d'éviter des menaces." },
      { term: "Limites environnementales", definition: "Les ressources naturelles limitées qui peuvent restreindre le développement des entreprises (disponibilité des ressources, génération de déchets)." }
    ],
      estimatedMinutes: 55,
      subSections: [
      {
        key: "analyse_pestel",
        label: "Analyse PESTEL",
        objective: "Examiner chaque dimension PESTEL : son impact sur votre projet et comment y faire face",
        whyImportant: "Les entreprises qui tiennent compte des facteurs PESTEL sont en mesure d'anticiper des opportunités et d'éviter les menaces potentielles.",
        tips: [
        "Établissez des priorités : sélectionnez les catégories les plus pertinentes (5 max)",
        "Pour chaque catégorie, décrivez comment elle affectera votre projet et comment vous y ferez face",
        "Les aspects environnementaux sont essentiels pour les entreprises vertes"
      ],
        examples: [
        "Politique : politiques d'électrification rurale",
        "Économique : difficultés d'accès au crédit",
        "Social : accès à l'électricité dans les zones rurales",
        "Technologique : amélioration de l'efficacité des panneaux solaires",
        "Environnemental : réduction de la disponibilité des métaux",
        "Légal : normes environnementales"
      ],
        guidedQuestions: [
            { question: "Analyse PESTEL", hint: "Remplissez les dimensions PESTEL avec ce qui peut affecter votre projet (Quoi ?) et comment vous y ferez face (Comment ?).", type: "pestel_v2", key: "pestel_v2_data" }
          ],
        estimatedMinutes: 40
      }
    ],
      checklist: [
        "J'ai analysé les dimensions PESTEL pertinentes pour mon projet",
        "Pour chaque dimension, j'ai décrit l'impact sur mon projet",
        "J'ai identifié comment faire face à chaque facteur",
        "J'ai priorisé les dimensions les plus importantes"
      ],
      resources: [
        { title: "Guide complet de l'analyse PESTEL", type: "article" }
      ],
    },
    4: {
      stepNumber: 4,
      title: "Fixez vos objectifs",
      objective: "Transformer les problèmes et besoins identifiés en objectifs spécifiques pour chaque conducteur (environnemental, social, client, personnel).",
      whyImportant: "Pour étayer le chemin de notre vision, les moteurs sont traduits en objectifs de l'entreprise. Les objectifs constituent à la fois le résultat concret de l'étape et les porte-étendards du projet.",
      avantDeLire: {
        description: "Révisez le travail de l'exercice 2 décrivant les principaux conducteurs de votre projet. Une fois que vous avez validé la description des conducteurs, fixez des objectifs pour chaque conducteur en recadrant les problèmes et les besoins en objectifs spécifiques pour les résoudre.",
        resultatsAttendus: "Des objectifs définis pour chaque conducteur : défis environnementaux, sociaux, besoins clients, motivations personnelles.",
      },
      etudeDeCas: "Fixez vos objectifs - ESCO Algérie\n\nDéfis sociaux : Peu d'opportunités d'emploi → Objectif : Améliorer le développement socioéconomique dans les zones rurales.\n\nBesoins des clients : Instabilité de l'approvisionnement électrique → Objectif : Fournir de l'électricité aux populations rurales.\n\nDéfis environnementaux : Électricité produite très loin, émissions sonores et de gaz → Objectif : Fournir une électricité propre par le développement de petites infrastructures.\n\nMotivations d'équipe : Conditions de vie précaires → Objectif : Améliorer les conditions de vie de l'entourage et le développement socioéconomique.",
      conseils: [
        "Voyez grand ! Se fixer des objectifs ambitieux peut nous pousser à atteindre des sommets plus élevés",
        "Rappelez-vous du contexte dans lequel vous opérez lors de la définition des objectifs (PESTEL)",
        "Chaque objectif doit découler directement d'un problème ou besoin identifié"
      ],
      keyConcepts: [
      { term: "Objectifs", definition: "Les résultats concrets que l'entreprise cherche à atteindre, découlant directement des moteurs identifiés." },
      { term: "Conducteurs du projet", definition: "Les moteurs (environnementaux, sociaux, clients, personnels) qui poussent à développer l'idée d'entreprise." },
      { term: "Alignement", definition: "La cohérence entre les problèmes identifiés, les objectifs fixés et la mission de l'entreprise." }
    ],
      estimatedMinutes: 40,
      subSections: [
      {
        key: "objectifs_environnementaux",
        label: "Objectifs environnementaux",
        objective: "Transformer les défis environnementaux en objectifs concrets",
        whyImportant: "Les défis environnementaux sont au coeur d'une entreprise verte. Les transformer en objectifs permet de mesurer votre impact.",
        tips: [
        "Reprenez les défis environnementaux identifiés à l'étape 2",
        "Formulez chaque défi comme un objectif à atteindre",
        "Soyez spécifique et mesurable"
      ],
        guidedQuestions: [
            { question: "Quels défis environnementaux votre idée d'entreprise relève-t-elle ?", placeholder: "Problèmes et besoins environnementaux...", type: "textarea" },
            { question: "Pouvez-vous fixer un ou plusieurs objectifs spécifiques pour y faire face ?", placeholder: "Objectifs (Environnement) :...", type: "textarea" }
          ],
        estimatedMinutes: 10
      },
      {
        key: "objectifs_sociaux",
        label: "Objectifs sociaux",
        objective: "Transformer les défis sociaux en objectifs concrets",
        whyImportant: "Les entreprises vertes sont créées pour répondre à des défis sociaux. Des objectifs clairs permettent de mesurer l'impact social.",
        tips: [
        "Reprenez les défis sociaux identifiés à l'étape 2",
        "Imaginez l'impact positif que vous voulez avoir sur la société",
        "Assurez-vous que les objectifs sont alignés avec vos valeurs"
      ],
        guidedQuestions: [
            { question: "Quels défis sociaux votre idée d'entreprise relève-t-elle ?", placeholder: "Problèmes et besoins sociaux...", type: "textarea" },
            { question: "Pouvez-vous fixer un ou plusieurs objectifs spécifiques pour y faire face ?", placeholder: "Objectifs (Social) :...", type: "textarea" }
          ],
        estimatedMinutes: 10
      },
      {
        key: "objectifs_clients",
        label: "Objectifs clients",
        objective: "Transformer les besoins clients en objectifs de satisfaction",
        whyImportant: "Les clients sont les engrenages qui font fonctionner le moteur économique de votre entreprise.",
        tips: [
        "Reprenez les besoins clients identifiés à l'étape 2",
        "Un client satisfait est la meilleure publicité pour votre entreprise",
        "Les objectifs doivent répondre aux besoins réels exprimés"
      ],
        guidedQuestions: [
            { question: "Quels sont les besoins des clients auxquels votre idée d'entreprise répond ?", placeholder: "Problèmes et besoins clients...", type: "textarea" },
            { question: "Pouvez-vous fixer un ou plusieurs objectifs spécifiques pour y faire face ?", placeholder: "Objectifs (Besoins) :...", type: "textarea" }
          ],
        estimatedMinutes: 10
      },
      {
        key: "objectifs_personnels",
        label: "Alignement des objectifs",
        objective: "Vérifier la cohérence entre vos différents objectifs",
        whyImportant: "Des objectifs contradictoires vous dispersent. L'alignement garantit que chaque action vous rapproche de votre vision.",
        tips: [
        "Assurez-vous que chaque objectif CT contribue à un objectif MT",
        "Vérifiez que tous vos objectifs vont dans la même direction",
        "Éliminez les objectifs qui ne servent pas votre vision"
      ],
        examples: [
        "Objectif CT : tester avec 10 producteurs => MT : 100 producteurs => LT : référence régionale"
      ],
        guidedQuestions: [
            { question: "Vos objectifs sont-ils alignés entre eux ?", hint: "Chaque objectif CT doit servir un objectif MT, qui sert un objectif LT", placeholder: "Mes objectifs sont alignés car...", type: "textarea" },
            { question: "Y a-t-il des objectifs à modifier ou supprimer ?", placeholder: "Je dois peut-être revoir...", type: "text" }
          ],
        estimatedMinutes: 8
      }
    ],
      checklist: [
        "J'ai défini des objectifs à court terme (6 mois)",
        "J'ai défini des objectifs à moyen terme (1-2 ans)",
        "J'ai défini des objectifs à long terme (3-5 ans)",
        "Mes objectifs sont alignés entre eux et avec ma vision"
      ],
      resources: [
        { title: "La méthode SMART pour fixer vos objectifs", type: "article" },
        { title: "OKR : une méthode complémentaire pour les startups", type: "article" }
      ],
    },
    5: {
      stepNumber: 5,
      title: "Synthétiser une mission et une vision",
      objective: "Fusionner vos objectifs en une mission globale et définir une vision à long terme pour votre entreprise.",
      whyImportant: "En fusionnant et résumant les objectifs en une déclaration unique, brève et élégante, nous définissons la mission de notre projet, laquelle doit incarner son essence et sa raison d'être. La vision émerge naturellement comme une instance temporelle de la mission.",
      avantDeLire: {
        description: "Dans les cases ci-dessous, synthétisez les objectifs en une mission et envisagez votre entreprise sur le long terme en définissant une vision.",
        resultatsAttendus: "Une déclaration de mission qui incarne l'essence du projet et une vision qui décrit la réalisation à moyen-long terme.",
      },
      etudeDeCas: "ESCO Algérie\n\nÉnoncé de vision : Fournir aux populations rurales une électricité solaire photovoltaïque, durablement et à un prix abordable.\n\nDéclaration de mission : Une Algérie rurale avec de la lumière et de meilleures conditions de vie !",
      conseils: [
        "Assurez-vous que les objectifs environnementaux et sociaux sont inclus dans votre déclaration de mission",
        "Les objectifs environnementaux et sociaux sont les principaux objectifs de votre entreprise verte",
        "Pour atteindre ses objectifs environnementaux et sociaux, votre entreprise doit être financièrement durable et rentable",
        "La vision décrit la manière dont nous envisageons notre projet à moyen et long terme"
      ],
      keyConcepts: [
      { term: "Mission", definition: "La raison d'être de votre entreprise aujourd'hui : ce que vous faites, pour qui et pourquoi." },
      { term: "Vision", definition: "La situation idéale que vous voulez créer dans le futur : l'impact que vous souhaitez avoir sur le monde." },
      { term: "Valeurs", definition: "Les principes fondamentaux qui guident vos actions et vos décisions en tant qu'entreprise." }
    ],
      estimatedMinutes: 35,
      subSections: [
      {
        key: "synthese_mission_vision",
        label: "Mission et vision",
        objective: "Synthétiser les objectifs en une mission et définir une vision long terme",
        whyImportant: "En fusionnant les objectifs en une déclaration unique, nous définissons la mission qui incarne l'essence et la raison d'être du projet.",
        tips: [
        "Assurez-vous que les objectifs environnementaux et sociaux sont inclus",
        "La mission doit être simple et élégante",
        "La vision décrit la réalisation à moyen-long terme"
      ],
        examples: [
        "Mission : Une Algérie rurale avec de la lumière et de meilleures conditions de vie !",
        "Vision : Fournir aux populations rurales une électricité solaire photovoltaïque, durablement et à un prix abordable."
      ],
        guidedQuestions: [
            { question: "Objectifs environnementaux", type: "step_recap", sourceStep: 4, sourceSectionKey: "objectifs_environnementaux" },
            { question: "Objectifs sociaux", type: "step_recap", sourceStep: 4, sourceSectionKey: "objectifs_sociaux" },
            { question: "Besoins des clients", type: "step_recap", sourceStep: 4, sourceSectionKey: "objectifs_clients" },
            { question: "Raisons personnelles", type: "step_recap", sourceStep: 4, sourceSectionKey: "objectifs_personnels" },
            { question: "Mission", hint: "Synthétisez vos objectifs en une phrase globale, simple et élégante", placeholder: "Notre mission est...", type: "textarea" },
            { question: "Vision", hint: "Envisagez vos réalisations à moyen-long terme. Que souhaitez-vous atteindre ?", placeholder: "Notre vision est...", type: "textarea" }
          ],
        estimatedMinutes: 30
      }
    ],
      checklist: [
        "J'ai synthétisé mes objectifs en une mission claire",
        "J'ai défini une vision à long terme",
        "La mission inclut les objectifs environnementaux et sociaux",
        "La mission et la vision sont cohérentes entre elles"
      ],
      resources: [
        { title: "Comment rédiger une mission et une vision percutantes", type: "article" }
      ],
    },
    6: {
      stepNumber: 6,
      title: "Résumé du contexte et des objectifs",
      objective: "Consolider l'ensemble des analyses précédentes en un résumé complet : problèmes, PESTEL, objectifs, mission et vision.",
      whyImportant: "Ce résumé sert de document de référence pour la suite du parcours et permet de communiquer efficacement avec les parties prenantes.",
      avantDeLire: {
        description: "Voici un résumé de votre analyse concernant le contexte et les problèmes et besoins abordés par votre projet, ainsi que les objectifs, la mission et la vision de votre entreprise durable. Revoyez-la et apportez les changements nécessaires.",
        resultatsAttendus: "Un résumé complet reprenant les problèmes, le contexte PESTEL, les objectifs, la mission et la vision.",
      },
      etudeDeCas: "ESCO Algérie - Résumé\n\nProblèmes et besoins :\n- Environnementaux : Bruit des générateurs, émissions de gaz, fuites de carburant.\n- Sociaux : Médiocrité de l'accès à l'électricité, rareté des opportunités d'emploi.\n- Besoins du client : Approvisionnement stable en électricité.\n\nComprendre le contexte :\n1. Environnementaux : réduction de la disponibilité des métaux.\n2. Politiques : politiques d'électrification rurale.\n3. Technologiques : amélioration de l'efficacité des panneaux.\n4. Économiques : difficultés d'accès au crédit.\n\nObjectifs :\n1. Fournir une électricité propre.\n2. Fournir une électricité fiable aux populations rurales.\n3. Améliorer le développement socioéconomique.\n\nDéclaration de vision : Fournir aux populations rurales une électricité solaire photovoltaïque, durablement et à un prix abordable.\n\nDéclaration de mission : Une Algérie rurale avec de la lumière et de meilleures conditions de vie !",
      conseils: [
        "Prenez le temps de relire l'ensemble de votre travail",
        "Identifiez les incohérences ou les points à approfondir",
        "Sollicitez un regard extérieur pour valider votre synthèse",
        "Gardez ce résumé comme document de référence pour la suite"
      ],
      keyConcepts: [
      { term: "Synthèse stratégique", definition: "Un document qui rassemble et articule les éléments clés de votre analyse et de votre stratégie." },
      { term: "Cohérence stratégique", definition: "L'alignement logique entre les problèmes identifiés, les objectifs, la mission et la vision." }
    ],
      estimatedMinutes: 30,
      subSections: [
      {
        key: "resume_complet",
        label: "Résumé du contexte et des objectifs",
        objective: "Consolider tous les éléments en un résumé cohérent",
        whyImportant: "Un résumé clair permet d'avoir une vue d'ensemble et de partager votre projet efficacement.",
        tips: [
        "Restez concis mais complet",
        "N'incluez que l'essentiel",
        "Utilisez un langage simple et direct"
      ],
        guidedQuestions: [
            { question: "Problèmes et besoins (environnementaux)", type: "step_recap", sourceStep: 2, sourceSectionKey: "problemes_environnementaux" },
            { question: "Problèmes et besoins (sociaux)", type: "step_recap", sourceStep: 2, sourceSectionKey: "besoins_sociaux" },
            { question: "Problèmes et besoins (besoins du client)", type: "step_recap", sourceStep: 2, sourceSectionKey: "besoins_clients" },
            { question: "Objectifs du projet (Environnement)", type: "step_recap", sourceStep: 4, sourceSectionKey: "objectifs_environnementaux" },
            { question: "Objectifs du projet (Social)", type: "step_recap", sourceStep: 4, sourceSectionKey: "objectifs_sociaux" },
            { question: "Objectifs du projet (Besoins du client)", type: "step_recap", sourceStep: 4, sourceSectionKey: "objectifs_clients" },
            { question: "PESTEL", type: "step_recap", sourceStep: 3, sourceSectionKey: "analyse_pestel" },
            { question: "Déclaration de vision", type: "step_recap", sourceStep: 5, sourceSectionKey: "synthese_mission_vision" },
            { question: "Déclaration de mission", type: "step_recap", sourceStep: 5, sourceSectionKey: "synthese_mission_vision" }
          ],
        estimatedMinutes: 30
      }
    ],
      checklist: [
        "J'ai résumé les problèmes et besoins (environnementaux, sociaux, clients)",
        "J'ai résumé les objectifs du projet",
        "J'ai résumé l'analyse PESTEL",
        "J'ai inclus ma déclaration de vision et de mission"
      ],
      resources: [
        { title: "Guide de synthèse stratégique", type: "article" }
      ],
    },
    7: {
      stepNumber: 7,
      title: "Identifier et cartographier les parties prenantes",
      objective: "Identifier toutes les personnes, groupes ou organisations qui peuvent influencer ou être influencés par votre projet, et évaluer leur impact.",
      whyImportant: "Ignorer une partie prenante clé peut compromettre votre projet. Une cartographie systématique vous permet d'anticiper les résistances, de mobiliser les soutiens et de construire des relations durables.",
      avantDeLire: {
        description: "Les parties prenantes ne sont pas seulement vos clients. Ce sont toutes les personnes ou organisations qui ont un intérêt dans votre projet : partenaires, fournisseurs, investisseurs, collectivités, associations, etc. Dans cette étape, vous allez les identifier, évaluer leur influence et planifier votre engagement.",
        resultatsAttendus: "Une matrice des parties prenantes avec pour chacune : nom, niveau d'influence, niveau d'impact, effets sur le projet et actions à entreprendre.",
      },
      etudeDeCas: "ESCO Algérie - Parties prenantes : Population rurale (influence faible, impact fort), Gouvernement (influence forte, impact fort), Fournisseurs de panneaux solaires (influence forte, impact moyen), Banques (influence forte, impact moyen), Techniciens/installateurs (influence moyenne, impact fort), Communautés locales (influence moyenne, impact moyen). Actions : associer le gouvernement dès le début, collaborer avec les banques pour le crédit, former des techniciens locaux.",
      conseils: [
        "Ne vous limitez pas aux parties prenantes évidentes",
        "Impliquez tôt les parties prenantes à forte influence",
        "Révisez régulièrement votre cartographie : de nouvelles parties prenantes peuvent apparaître",
        "Pour chaque partie prenante, pensez à ce que vous pouvez lui offrir en retour"
      ],
      keyConcepts: [
      { term: "Partie prenante", definition: "Tout individu, groupe ou organisation qui peut affecter ou être affecté par votre projet." },
      { term: "Matrice d'influence/impact", definition: "Un outil pour évaluer et visualiser le pouvoir et l'intérêt de chaque partie prenante." },
      { term: "Engagement des parties prenantes", definition: "L'ensemble des actions pour communiquer, consulter et collaborer avec vos parties prenantes." }
    ],
      estimatedMinutes: 45,
      subSections: [
      {
        key: "matrice_parties_prenantes",
        label: "Matrice des parties prenantes",
        objective: "Cartographier vos parties prenantes avec leur influence et leur impact",
        whyImportant: "Une cartographie visuelle vous aide à prioriser vos actions auprès de chaque partie prenante.",
        tips: [
        "Commencez par lister TOUTES les parties prenantes possibles",
        "Évaluez objectivement leur influence (1-5) et leur impact (1-5)",
        "Ne sous-estimez pas les parties prenantes à faible influence mais fort impact"
      ],
        guidedQuestions: [
            { question: "Identifiez et évaluez vos parties prenantes", hint: "Ajoutez chaque partie prenante avec son nom, son influence (1-5), son impact (1-5), les effets sur votre projet et les actions à entreprendre.", type: "stakeholder_matrix", key: "stakeholder_matrix_data" }
          ],
        estimatedMinutes: 30
      },
      {
        key: "plan_engagement",
        label: "Plan d'engagement",
        objective: "Planifier vos actions pour chaque partie prenante identifiée",
        whyImportant: "Un plan d'engagement concret transforme votre analyse en actions. Sans plan, la cartographie reste théorique.",
        tips: [
        "Priorisez les parties prenantes à forte influence et fort impact",
        "Pour chaque action, définissez un responsable et une échéance",
        "Prévoyez une communication adaptée à chaque partie prenante"
      ],
        guidedQuestions: [
            { question: "Quelles actions allez-vous mener pour chaque partie prenante ?", placeholder: "Pour [partie prenante], je vais...", type: "textarea" },
            { question: "Quelles sont les 3 actions prioritaires à réaliser cette semaine ?", placeholder: "1. ... 2. ... 3. ...", type: "textarea" }
          ],
        estimatedMinutes: 15
      }
    ],
      checklist: [
        "J'ai identifié toutes les parties prenantes de mon projet",
        "J'ai évalué leur influence et leur impact",
        "J'ai noté les effets de chaque partie prenante sur mon projet",
        "J'ai défini des actions concrètes pour chaque partie prenante"
      ],
      resources: [
        { title: "Guide de cartographie des parties prenantes", type: "article" },
        { title: "Comment construire une matrice d'influence/impact", type: "article" }
      ],
    },
    8: {
      stepNumber: 8,
      title: "Segments de clientèle",
      objective: "Identifier et décrire les différents segments de clients que vous allez servir, en comprenant leurs besoins spécifiques.",
      whyImportant: "Vous ne pouvez pas vendre à tout le monde. Une segmentation précise vous permet d'adapter votre offre, votre communication et votre expérience client à chaque groupe, maximisant ainsi votre efficacité commerciale.",
      avantDeLire: {
        description: "Un segment de clientèle est un groupe de personnes ou d'organisations qui partagent des besoins, des comportements ou des caractéristiques communes. Dans cette étape, vous allez créer des fiches pour chaque segment, détaillant leurs difficultés (pains), leurs bénéfices recherchés (gains) et leurs tâches à accomplir (jobs).",
        resultatsAttendus: "Des fiches segment client complètes avec nom, description, pains, gains, jobs et archétype pour chaque segment identifié.",
      },
      etudeDeCas: "ESCO Algérie a identifié 2 segments : (1) Ménages ruraux disposant de ressources : ont besoin d'électricité fiable, subissent les coupures et le bruit des générateurs, (2) Petites entreprises rurales : cherchent une énergie abordable pour leurs activités. Chaque segment a des pains (coût, fiabilité) et des gains (indépendance énergétique, réduction des coûts) spécifiques.",
      conseils: [
        "Commencez par 2-3 segments maximum, vous pourrez en ajouter plus tard",
        "Un segment est valide si vous pouvez répondre à ses besoins de façon unique",
        "Évitez les segments trop larges (« tout le monde ») ou trop étroits",
        "Validez vos segments auprès de clients potentiels réels"
      ],
      keyConcepts: [
      { term: "Segment de clientèle", definition: "Un groupe distinct de clients partageant des besoins, comportements ou caractéristiques communes." },
      { term: "Pains", definition: "Les difficultés, frustrations et obstacles rencontrés par votre segment cible." },
      { term: "Gains", definition: "Les bénéfices, résultats et avantages recherchés par votre segment cible." },
      { term: "Jobs", definition: "Les tâches fonctionnelles, sociales ou émotionnelles que votre segment cherche à accomplir." }
    ],
      estimatedMinutes: 50,
      subSections: [
      {
        key: "segments_clients",
        label: "Fiches segments client",
        objective: "Créer des fiches détaillées pour chaque segment de clientèle identifié",
        whyImportant: "Des fiches segment bien remplies sont la base de votre proposition de valeur et de votre stratégie marketing.",
        tips: [
        "Un segment = une fiche",
        "Soyez précis dans la description : âge, profession, situation, comportements",
        "Les pains et gains doivent être spécifiques, pas génériques"
      ],
        guidedQuestions: [
            { question: "Créez vos fiches segments client", hint: "Ajoutez un segment par fiche. Pour chaque segment, décrivez le nom, la description, les pains (difficultés), les gains (bénéfices recherchés), les jobs (tâches à accomplir) et l'archétype.", type: "customer_segment", key: "customer_segments_data" }
          ],
        estimatedMinutes: 35
      },
      {
        key: "priorisation_segments",
        label: "Priorisation des segments",
        objective: "Prioriser les segments sur lesquels concentrer vos efforts",
        whyImportant: "Vous n'avez pas les ressources pour servir tous les segments en même temps. La priorisation est essentielle.",
        tips: [
        "Segment le plus porteur = problème le plus urgent + facilité d'accès",
        "Un petit segment très motivé vaut mieux qu'un grand segment indifférent",
        "Vous pouvez changer de priorité plus tard"
      ],
        guidedQuestions: [
            { question: "Quel est votre segment prioritaire et pourquoi ?", placeholder: "Mon segment prioritaire est... car...", type: "textarea" },
            { question: "Quel segment allez-vous adresser en second ?", placeholder: "En second, j'adresserai...", type: "text" }
          ],
        estimatedMinutes: 15
      }
    ],
      checklist: [
        "J'ai identifié au moins 2 segments de clientèle",
        "J'ai rempli une fiche détaillée pour chaque segment",
        "J'ai listé les pains, gains et jobs de chaque segment",
        "J'ai priorisé mes segments"
      ],
      resources: [
        { title: "Guide complet de la segmentation client", type: "article" },
        { title: "Comment créer des buyer personas", type: "article" }
      ],
    },
    9: {
      stepNumber: 9,
      title: "Canevas de propositions de valeur",
      objective: "Concevoir une proposition de valeur pour chaque segment de clientèle, en détaillant comment vos produits et services créent de la valeur.",
      whyImportant: "La proposition de valeur est le cœur de votre business model. C'est la raison pour laquelle un client vous choisit plutôt qu'un concurrent. Une proposition de valeur forte est le meilleur investissement marketing que vous puissiez faire.",
      avantDeLire: {
        description: "Le canevas de proposition de valeur (Value Proposition Canvas) est un outil qui vous aide à concevoir une offre parfaitement adaptée à votre segment client. Il se compose de deux parties : le profil client (pains, gains, jobs) que vous avez déjà créé, et la carte de valeur (produits et services, soulagement des douleurs, créateurs de gains).",
        resultatsAttendus: "Un canevas de proposition de valeur rempli pour votre segment prioritaire, avec les produits/services, le soulagement des douleurs, les créateurs de gains et les valeurs ajoutées environnementale et sociale.",
      },
      etudeDeCas: "ESCO Algérie a conçu pour son segment prioritaire (ménages ruraux) : Produits (livraison, installation et maintenance de systèmes photovoltaïques), Soulagement des douleurs (fin des coupures, silence, absence d'émissions), Créateurs de gains (électricité propre et abordable, autonomie énergétique). Valeur environnementale (réduction des émissions de gaz) et sociale (amélioration des conditions de vie, création d'emplois locaux).",
      conseils: [
        "Une proposition de valeur par segment de clientèle",
        "Assurez-vous que chaque élément de votre offre répond à un pain ou un gain spécifique",
        "Soyez concret : évitez les formulations vagues comme « solution innovante »",
        "Testez votre proposition de valeur auprès de vrais clients potentiels"
      ],
      keyConcepts: [
      { term: "Proposition de valeur", definition: "L'ensemble des produits et services qui créent de la valeur pour un segment de clientèle spécifique." },
      { term: "Soulagement des douleurs", definition: "Comment vos produits et services atténuent les difficultés spécifiques de vos clients." },
      { term: "Créateurs de gains", definition: "Comment vos produits et services produisent les bénéfices attendus par vos clients." }
    ],
      estimatedMinutes: 50,
      subSections: [
      {
        key: "canevas_valeur",
        label: "Canevas de proposition de valeur",
        objective: "Remplir le canevas de proposition de valeur pour votre segment prioritaire",
        whyImportant: "Le canevas vous force à être précis sur la valeur que vous créez et à vérifier l'adéquation avec les besoins de votre segment.",
        tips: [
        "Commencez par lister vos produits et services concrets",
        "Pour chaque pain identifié, demandez-vous comment vous le soulagez",
        "Pour chaque gain, demandez-vous comment vous le créez",
        "Les valeurs environnementale et sociale sont vos différenciateurs"
      ],
        guidedQuestions: [
            { question: "Remplissez le canevas de proposition de valeur", hint: "Détaillez vos produits et services, comment ils soulagent les douleurs et créent des gains pour votre segment prioritaire.", type: "value_proposition", key: "value_proposition_data" }
          ],
        estimatedMinutes: 35
      },
      {
        key: "adéquation",
        label: "Vérification de l'adéquation",
        objective: "Vérifier que votre proposition de valeur répond bien aux besoins de votre segment",
        whyImportant: "Une proposition de valeur qui ne correspond pas aux besoins réels de vos clients est vouée à l'échec, quel que soit son intérêt intrinsèque.",
        tips: [
        "Reprenez les pains et gains de votre segment",
        "Vérifiez que chaque élément de votre offre répond à au moins un besoin",
        "Identifiez les besoins non couverts par votre offre actuelle"
      ],
        guidedQuestions: [
            { question: "Votre proposition de valeur répond-elle aux besoins de votre segment ?", placeholder: "Oui, car... / Non, car...", type: "textarea" },
            { question: "Quels besoins ne sont pas encore couverts par votre offre ?", placeholder: "Les besoins non couverts sont...", type: "textarea" }
          ],
        estimatedMinutes: 15
      }
    ],
      checklist: [
        "J'ai rempli le canevas de proposition de valeur pour mon segment prioritaire",
        "J'ai listé mes produits et services",
        "J'ai décrit comment je soulage les douleurs",
        "J'ai décrit comment je crée des gains",
        "J'ai intégré les valeurs environnementale et sociale"
      ],
      resources: [
        { title: "Guide du Value Proposition Canvas", type: "article" },
        { title: "Exemples de propositions de valeur inspirantes", type: "article" }
      ],
    },
    10: {
      stepNumber: 10,
      title: "Tester la proposition de valeur",
      objective: "Concevoir et réaliser des tests pour valider (ou invalider) votre proposition de valeur auprès de vrais clients potentiels.",
      whyImportant: "Tester tôt et souvent est le secret des projets qui réussissent. Un test bien conçu vous évite d'investir du temps et de l'argent dans une solution que personne ne veut. Mieux vaut échouer rapidement et à moindre coût.",
      avantDeLire: {
        description: "Le test de la proposition de valeur est une étape cruciale. Vous allez concevoir des fiches de découverte pour structurer vos entretiens, observations ou sondages. L'objectif est de collecter des preuves que votre proposition de valeur répond réellement aux besoins identifiés.",
        resultatsAttendus: "Des fiches de découverte remplies pour chaque test réalisé, avec les hypothèses testées, les résultats clés, les insights et les actions à mener.",
      },
      etudeDeCas: "ESCO Algérie a créé une fiche de découverte pour tester l'hypothèse : « Les ménages ruraux sont prêts à payer pour l'installation de panneaux solaires. » 5 entretiens réalisés. Résultat : 4 ménages sur 5 sont très intéressés mais le coût initial est un frein. Insight : un système de micocredit ou paiement échelonné est nécessaire. Action : contacter les banques pour un partenariat de financement.",
      conseils: [
        "Testez une hypothèse à la fois pour des résultats clairs",
        "Préparez un guide d'entretien mais restez flexible",
        "Enregistrez les entretiens (avec accord) pour ne rien manquer",
        "Cherchez à être infirmé : si vous cherchez à être confirmé, vous biaiserez vos résultats",
        "Minimum 5 entretiens par segment pour commencer à voir des tendances"
      ],
      keyConcepts: [
      { term: "Hypothèse", definition: "Une affirmation testable sur votre proposition de valeur, vos clients ou votre marché." },
      { term: "Fiche de découverte", definition: "Un outil structuré pour documenter chaque test : hypothèse, méthode, résultats, insights et actions." },
      { term: "Validation client", definition: "Le processus de collecte de preuves que votre proposition de valeur répond à un vrai besoin." }
    ],
      estimatedMinutes: 55,
      subSections: [
      {
        key: "hypotheses_test",
        label: "Hypothèses à tester",
        objective: "Formuler les hypothèses clés que vous devez valider",
        whyImportant: "Sans hypothèses claires, vos tests n'auront pas de direction et vous ne saurez pas quoi conclure des résultats.",
        tips: [
        "Une hypothèse = une affirmation testable et falsifiable",
        "Priorisez les hypothèses les plus risquées (celles dont dépend votre projet)",
        "Formulez vos hypothèses simplement"
      ],
        examples: [
        "« Les consommateurs urbains sont prêts à utiliser une plateforme pour acheter local »",
        "« Les producteurs accepteront une commission de 15% sur les ventes »"
      ],
        guidedQuestions: [
            { question: "Quelles sont les hypothèses les plus importantes à tester ?", hint: "Priorisez les hypothèses sans lesquelles votre projet n'aurait pas de sens", placeholder: "Hypothèse 1 : ...", type: "textarea" },
            { question: "Quelle est votre hypothèse la plus risquée ?", placeholder: "Mon hypothèse la plus risquée est...", type: "text" }
          ],
        estimatedMinutes: 15
      },
      {
        key: "fiches_decouverte",
        label: "Fiches de découverte",
        objective: "Créer et remplir des fiches de découverte pour chaque test",
        whyImportant: "Les fiches de découverte structurent votre apprentissage et vous permettent de capitaliser sur chaque test réalisé.",
        tips: [
        "Une fiche = un test réalisé (entretien, observation ou sondage)",
        "Soyez honnête dans les résultats : ne forcez pas les conclusions",
        "Les insights sont vos interprétations : ce que vous en avez appris"
      ],
        guidedQuestions: [
            { question: "Créez vos fiches de découverte pour tester vos hypothèses", hint: "Ajoutez une fiche par test. Précisez le type (entretien, observation, sondage), la date, la personne rencontrée, l'hypothèse testée, les résultats clés, les insights et les actions à mener.", type: "discovery_card", key: "discovery_cards_data" }
          ],
        estimatedMinutes: 30
      },
      {
        key: "synthese_apprentissages",
        label: "Synthèse des apprentissages",
        objective: "Tirer les enseignements de vos tests",
        whyImportant: "Des tests sans synthèse sont une perte de temps. L'objectif est d'apprendre et d'ajuster votre projet.",
        tips: [
        "Qu'avez-vous appris de surprenant ?",
        "Quelles hypothèses sont validées ? Lesquelles sont invalidées ?",
        "Qu'allez-vous changer dans votre projet suite à ces tests ?"
      ],
        guidedQuestions: [
            { question: "Qu'avez-vous appris de vos tests ?", placeholder: "J'ai appris que...", type: "textarea" },
            { question: "Quelles hypothèses sont validées ou invalidées ?", placeholder: "Hypothèse [X] est validée car...", type: "textarea" },
            { question: "Que devez-vous changer dans votre projet ?", placeholder: "Je dois changer...", type: "textarea" }
          ],
        estimatedMinutes: 10
      }
    ],
      checklist: [
        "J'ai formulé mes hypothèses clés",
        "J'ai créé des fiches de découverte pour mes tests",
        "J'ai réalisé au moins 3 entretiens ou observations",
        "J'ai synthétisé mes apprentissages",
        "J'ai identifié les ajustements à apporter à mon projet"
      ],
      resources: [
        { title: "Guide des entretiens de validation client", type: "article" },
        { title: "Modèle de fiche de découverte", type: "tool" }
      ],
    },
    11: {
      stepNumber: 11,
      title: "Pivoter la proposition de valeur",
      objective: "Analyser les résultats des tests et décider s'il faut ajuster (itérer) ou changer radicalement (pivoter) votre proposition de valeur.",
      whyImportant: "Le pivot est une force, pas un échec. Les projets les plus réussis sont ceux qui savent s'adapter en fonction des retours du terrain. Pivoter au bon moment peut faire la différence entre le succès et l'échec.",
      avantDeLire: {
        description: "Après avoir testé votre proposition de valeur, vous avez des données. Parfois, elles confirment votre direction. Parfois, elles vous montrent que vous devez changer de cap. Dans cette étape, vous allez analyser ces résultats et décider si vous devez itérer (ajuster) ou pivoter (changer) votre proposition de valeur.",
        resultatsAttendus: "Une décision claire : itérer ou pivoter, avec les ajustements concrets à apporter à votre proposition de valeur.",
      },
      etudeDeCas: "Les tests de l'ESCO Algérie ont montré que les ménages sont intéressés mais que le coût initial des panneaux est un frein majeur. Deux options : itérer (mettre en place un système de paiement échelonné) ou pivoter (passer d'un modèle de vente à un modèle de location). L'ESCO choisit d'itérer en proposant un micocredit avec les banques partenaires.",
      conseils: [
        "Ne pivotez pas après un seul test négatif : cherchez des tendances (3+ retours)",
        "Un pivot n'est pas un abandon : c'est une adaptation basée sur des preuves",
        "Documentez vos pivots : ils feront partie de votre histoire entrepreneuriale",
        "Impliquez votre équipe dans la décision de pivoter"
      ],
      keyConcepts: [
      { term: "Itération", definition: "Un ajustement mineur de votre proposition de valeur basé sur les retours clients, sans changer le cœur du projet." },
      { term: "Pivot", definition: "Un changement fondamental dans votre proposition de valeur, votre cible ou votre modèle économique, basé sur les apprentissages du terrain." },
      { term: "Décision data-driven", definition: "Une décision prise sur la base de données et de preuves, plutôt que sur l'intuition seule." }
    ],
      estimatedMinutes: 40,
      subSections: [
      {
        key: "analyse_resultats",
        label: "Analyse des résultats de test",
        objective: "Analyser systématiquement les résultats de vos tests",
        whyImportant: "Une analyse structurée vous permet de prendre une décision éclairée, sans vous laisser guider par vos émotions ou vos biais.",
        tips: [
        "Cherchez des tendances, pas des cas isolés",
        "Distinguez les problèmes résolubles (itération) des problèmes de fond (pivot)",
        "Sollicitez un regard extérieur pour éviter vos biais"
      ],
        guidedQuestions: [
            { question: "Quels sont les résultats globaux de vos tests ?", placeholder: "Dans l'ensemble, mes tests montrent que...", type: "textarea" },
            { question: "Quels sont les problèmes majeurs identifiés par vos tests ?", placeholder: "Les problèmes majeurs sont...", type: "textarea" },
            { question: "Ces problèmes sont-ils résolubles par des ajustements ou nécessitent-ils un changement plus profond ?", placeholder: "Je pense qu'il s'agit de... car...", type: "textarea" }
          ],
        estimatedMinutes: 15
      },
      {
        key: "decision_iterer_pivoter",
        label: "Décision : itérer ou pivoter",
        objective: "Prendre une décision claire sur la suite à donner à votre proposition de valeur",
        whyImportant: "Une décision claire permet à toute votre équipe d'avancer dans la même direction. L'indécision est l'ennemi du progrès.",
        tips: [
        "Itérez si le cœur de votre proposition de valeur est validé",
        "Pivotez si les tests montrent que votre hypothèse de base est invalide",
        "Un pivot partiel (changer un aspect sans tout changer) est souvent la meilleure option"
      ],
        guidedQuestions: [
            { question: "Quelle est votre décision : itérer ou pivoter ?", hint: "Itérer = ajuster, Pivoter = changer fondamentalement", placeholder: "Je décide d'itérer/pivoter parce que...", type: "text" },
            { question: "Quels sont les changements concrets à apporter ?", placeholder: "Je vais changer...", type: "textarea" },
            { question: "Quelles sont les prochaines étapes après ce changement ?", placeholder: "Les prochaines étapes sont...", type: "textarea" }
          ],
        estimatedMinutes: 15
      },
      {
        key: "plan_action_pivot",
        label: "Plan d'action post-décision",
        objective: "Planifier les actions concrètes suite à votre décision",
        whyImportant: "Une décision sans plan d'action reste une intention. Un plan concret transforme votre décision en réalité.",
        tips: [
        "Définissez des actions immédiates (cette semaine)",
        "Fixez une échéance pour la prochaine série de tests",
        "Communiquez votre décision à vos parties prenantes"
      ],
        guidedQuestions: [
            { question: "Quelles sont les actions à réaliser cette semaine ?", placeholder: "Cette semaine, je vais...", type: "textarea" },
            { question: "Quand ferez-vous de nouveaux tests pour valider les changements ?", placeholder: "Je ferai de nouveaux tests le...", type: "text" }
          ],
        estimatedMinutes: 10
      }
    ],
      checklist: [
        "J'ai analysé les résultats de mes tests",
        "J'ai pris une décision claire : itérer ou pivoter",
        "J'ai listé les changements concrets à apporter",
        "J'ai un plan d'action pour la semaine à venir"
      ],
      resources: [
        { title: "Savoir pivoter au bon moment", type: "article" },
        { title: "Exemples de pivots réussis", type: "article" }
      ],
    },
    12: {
      stepNumber: 12,
      title: "Relations clients, canaux et parcours client",
      objective: "Définir comment vous allez interagir avec vos clients (relations), comment vous allez les atteindre (canaux) et cartographier leur expérience complète (parcours client).",
      whyImportant: "Une excellente proposition de valeur échouera si vos clients ne peuvent pas vous trouver, vous comprendre ou interagir facilement avec vous. La cohérence entre votre offre et votre expérience client est cruciale.",
      avantDeLire: {
        description: "Cette étape couvre trois piliers de votre relation client : (1) Les relations clients : comment vous interagissez avec chaque segment (acquisition, fidélisation, service), (2) Les canaux : comment vous atteignez vos clients (site web, magasin, réseau de partenaires), (3) Le parcours client : l'expérience complète de vos clients, de la découverte à l'après-vente.",
        resultatsAttendus: "Une stratégie de relation client définie, les canaux de distribution identifiés et une cartographie du parcours client.",
      },
      etudeDeCas: "ESCO Algérie a défini : Relations clients (acquisition via les communautés locales et les associations, fidélisation via le service après-vente et la maintenance, service client via une équipe technique itinérante), Canaux (équipes commerciales terrain, partenariats avec les collectivités, bouche-à-oreille), Parcours client (sensibilisation via les associations, prise de contact, évaluation des besoins, installation, suivi et maintenance).",
      conseils: [
        "Adaptez vos canaux à vos segments : vos clients sont-ils sur les réseaux sociaux, en magasin, ou les deux ?",
        "Un parcours client simple et fluide est un avantage concurrentiel majeur",
        "Testez vous-même le parcours client comme si vous étiez un client",
        "Recueillez des feedbacks à chaque étape du parcours pour l'améliorer"
      ],
      keyConcepts: [
      { term: "Relation client", definition: "La stratégie d'interaction avec vos clients : acquisition, fidélisation, service et communauté." },
      { term: "Canaux de distribution", definition: "Les moyens par lesquels vous atteignez et servez vos clients (physiques, numériques, partenaires)." },
      { term: "Parcours client", definition: "L'ensemble des étapes et points de contact entre un client et votre entreprise, de la découverte à l'après-vente." }
    ],
      estimatedMinutes: 45,
      subSections: [
      {
        key: "relations_clients",
        label: "Relations clients",
        objective: "Définir votre stratégie de relation client pour chaque segment",
        whyImportant: "La relation client est un facteur clé de différenciation et de fidélisation. Une bonne relation transforme un client satisfait en ambassadeur.",
        tips: [
        "Distinguez acquisition, fidélisation et service client",
        "Choisissez des canaux de relation cohérents avec votre marque",
        "Automatisez ce qui peut l'être, mais gardez une touche humaine"
      ],
        examples: [
        "Acquisition : réseaux sociaux + bouche-à-oreille",
        "Fidélisation : newsletter hebdomadaire + programme de parrainage",
        "Service : chat en ligne + email"
      ],
        guidedQuestions: [
            { question: "Comment allez-vous acquérir vos premiers clients ?", placeholder: "J'acquerrai mes clients via...", type: "textarea" },
            { question: "Comment allez-vous les fidéliser ?", placeholder: "Je fidéliserai mes clients en...", type: "textarea" },
            { question: "Comment assurerez-vous le service client ?", placeholder: "Le service client sera assuré par...", type: "textarea" }
          ],
        estimatedMinutes: 15
      },
      {
        key: "canaux",
        label: "Canaux de distribution",
        objective: "Identifier les canaux par lesquels vous allez atteindre vos clients",
        whyImportant: "Le choix des canaux détermine votre visibilité, votre accessibilité et votre structure de coûts.",
        tips: [
        "Privilégiez les canaux où votre cible est déjà présente",
        "Commencez par 1 ou 2 canaux, maîtrisez-les avant d'en ajouter",
        "Pensez multicanaux mais pas forcément tous les canaux"
      ],
        examples: [
        "Plateforme web (canal principal)",
        "Application mobile",
        "Points de retrait partenaires",
        "Réseaux sociaux (Instagram, Facebook)"
      ],
        guidedQuestions: [
            { question: "Quels canaux allez-vous utiliser pour atteindre vos clients ?", placeholder: "Mes canaux sont...", type: "textarea" },
            { question: "Quel est votre canal principal et pourquoi ?", placeholder: "Mon canal principal est... car...", type: "text" }
          ],
        estimatedMinutes: 15
      },
      {
        key: "parcours_client",
        label: "Parcours client",
        objective: "Cartographier l'expérience complète de vos clients",
        whyImportant: "Un parcours client bien conçu maximise la satisfaction et réduit les abandons. Chaque point de contact est une opportunité de créer de la valeur.",
        tips: [
        "Cartographiez le parcours du point de vue du client, pas du vôtre",
        "Identifiez les moments de vérité (les étapes critiques)",
        "Repérez les points de friction et d'abandon potentiels"
      ],
        guidedQuestions: [
            { question: "Décrivez le parcours typique de votre client, de la découverte à l'après-vente", placeholder: "Étape 1 : Découverte via... Étape 2 : ...", type: "textarea" },
            { question: "Quels sont les points de friction potentiels dans ce parcours ?", placeholder: "Les points de friction pourraient être...", type: "textarea" },
            { question: "Comment allez-vous améliorer l'expérience client à chaque étape ?", placeholder: "Pour améliorer l'étape [X], je vais...", type: "textarea" }
          ],
        estimatedMinutes: 15
      }
    ],
      checklist: [
        "J'ai défini ma stratégie de relation client (acquisition, fidélisation, service)",
        "J'ai identifié mes canaux de distribution",
        "J'ai cartographié le parcours client",
        "J'ai identifié les points de friction potentiels"
      ],
      resources: [
        { title: "Guide des canaux de distribution pour startups", type: "article" },
        { title: "Comment cartographier le parcours client", type: "article" }
      ],
    },
    13: {
      stepNumber: 13,
      title: "Principales activités et ressources",
      objective: "Identifier les activités clés que vous devez réaliser et les ressources nécessaires pour faire fonctionner votre entreprise.",
      whyImportant: "Sans activités et ressources clairement identifiées, vous risquez de sous-estimer ce dont vous avez besoin pour opérer. Cette étape vous prépare à planifier et budgétiser efficacement.",
      avantDeLire: {
        description: "Les activités clés sont les actions les plus importantes que vous devez accomplir pour que votre entreprise fonctionne. Les ressources sont tout ce dont vous avez besoin : humain, financier, matériel, intellectuel. Ensemble, ils forment l'ossature de votre entreprise.",
        resultatsAttendus: "Une liste des activités clés et des ressources nécessaires, avec une identification des ressources critiques et des lacunes potentielles.",
      },
      etudeDeCas: "ESCO Algérie a identifié ses activités clés : approvisionnement et installation de panneaux solaires, maintenance préventive et curative, formation des techniciens locaux, relations avec les collectivités. Ses ressources principales : techniciens qualifiés (humain), investissement initial de 100 000€ (financier), entrepôt de stockage (physique), savoir-faire technique et certifications (intellectuel).",
      conseils: [
        "Distinguer ce qui est critique de ce qui est secondaire",
        "Identifiez ce que vous devez faire en interne et ce que vous pouvez externaliser",
        "Anticipez les ressources dont vous aurez besoin dans 6 mois, pas seulement aujourd'hui",
        "Soyez réaliste sur le temps et l'argent nécessaires"
      ],
      keyConcepts: [
      { term: "Activités clés", definition: "Les actions les plus importantes que votre entreprise doit accomplir pour fonctionner et créer de la valeur." },
      { term: "Ressources", definition: "Les actifs nécessaires au fonctionnement de votre entreprise : humains, financiers, physiques et intellectuels." },
      { term: "Externalisation", definition: "La délégation de certaines activités à des partenaires ou prestataires externes." }
    ],
      estimatedMinutes: 40,
      subSections: [
      {
        key: "activites_cles",
        label: "Activités clés",
        objective: "Lister les activités indispensables au fonctionnement de votre entreprise",
        whyImportant: "Sans activités clés identifiées, vous risquez d'oublier des aspects importants et de faire face à des surprises désagréables.",
        tips: [
        "Classez les activités par catégorie (production, marketing, ventes, administration)",
        "Identifiez les activités que vous devez maîtriser en interne",
        "Estimez le temps nécessaire pour chaque activité"
      ],
        examples: [
        "Développement et maintenance de la plateforme",
        "Gestion des relations avec les producteurs",
        "Marketing et acquisition d'utilisateurs",
        "Gestion des commandes et de la livraison"
      ],
        guidedQuestions: [
            { question: "Quelles sont les activités clés de votre entreprise ?", placeholder: "Mes activités clés sont...", type: "textarea" },
            { question: "Parmi ces activités, lesquelles ferez-vous en interne et lesquelles externaliserez-vous ?", placeholder: "Je ferai en interne... J'externaliserai...", type: "textarea" }
          ],
        estimatedMinutes: 15
      },
      {
        key: "ressources",
        label: "Ressources nécessaires",
        objective: "Identifier toutes les ressources dont vous avez besoin",
        whyImportant: "Les ressources sont le carburant de votre entreprise. Les anticiper vous évite des blocages et des retards.",
        tips: [
        "Distinguez ressources humaines, financières, physiques et intellectuelles",
        "Pour chaque ressource, estimez le coût et la disponibilité",
        "Identifiez les ressources critiques sans lesquelles vous ne pouvez pas opérer"
      ],
        examples: [
        "Humain : 1 développeur, 1 community manager",
        "Financier : 50 000€ d'investissement initial",
        "Physique : locaux partagés, serveurs",
        "Intellectuel : algorithme de matching, bases de données producteurs"
      ],
        guidedQuestions: [
            { question: "De quelles ressources humaines avez-vous besoin ?", placeholder: "J'ai besoin de...", type: "textarea" },
            { question: "De quelles ressources financières avez-vous besoin ?", placeholder: "J'ai besoin de... € pour...", type: "textarea" },
            { question: "De quelles ressources physiques et intellectuelles avez-vous besoin ?", placeholder: "J'ai besoin de...", type: "textarea" },
            { question: "Quelles sont les ressources les plus critiques pour démarrer ?", placeholder: "Les ressources critiques sont...", type: "textarea" }
          ],
        estimatedMinutes: 15
      },
      {
        key: "analyse_lacunes",
        label: "Analyse des lacunes",
        objective: "Identifier ce qui vous manque pour démarrer",
        whyImportant: "Connaître vos lacunes vous permet de planifier comment les combler plutôt que de les subir.",
        tips: [
        "Soyez honnête sur ce qui vous manque",
        "Pour chaque lacune, identifiez une solution possible",
        "Certaines lacunes peuvent être comblées par des partenariats"
      ],
        guidedQuestions: [
            { question: "Quelles sont les ressources ou compétences qui vous manquent actuellement ?", placeholder: "Il me manque...", type: "textarea" },
            { question: "Comment allez-vous combler ces lacunes ?", placeholder: "Je vais combler ces lacunes en...", type: "textarea" }
          ],
        estimatedMinutes: 10
      }
    ],
      checklist: [
        "J'ai listé mes activités clés",
        "J'ai identifié les activités à faire en interne et à externaliser",
        "J'ai listé les ressources nécessaires (humaines, financières, physiques, intellectuelles)",
        "J'ai identifié mes lacunes et un plan pour les combler"
      ],
      resources: [
        { title: "Guide des ressources clés pour startups", type: "article" }
      ],
    },
    14: {
      stepNumber: 14,
      title: "Écoconception de votre entreprise",
      objective: "Intégrer les principes d'écoconception dans votre modèle d'affaires pour minimiser l'impact environnemental de votre entreprise.",
      whyImportant: "L'écoconception n'est plus une option : c'est un avantage concurrentiel et une responsabilité. Les clients, investisseurs et partenaires exigent des entreprises durables. Intégrer l'écoconception dès le départ est bien plus efficace que de corriger après.",
      avantDeLire: {
        description: "L'écoconception consiste à intégrer l'environnement dès la conception de votre produit ou service. Cela concerne tous les aspects : matières premières, fabrication, transport, utilisation, fin de vie. Dans cette étape, vous allez analyser l'impact environnemental de votre projet et identifier des pistes d'amélioration.",
        resultatsAttendus: "Une analyse de l'impact environnemental de votre projet dans les domaines clés (énergie, déchets, transport, etc.) et un plan d'actions pour réduire cet impact.",
      },
      etudeDeCas: "ESCO Algérie a identifié les impacts de son activité : fabrication des panneaux (métaux rares), transport, fin de vie des panneaux. Plan d'actions : choisir des fournisseurs respectueux des normes environnementales, optimiser les tournées d'installation, mettre en place un programme de recyclage des panneaux en fin de vie, former les utilisateurs à l'entretien.",
      conseils: [
        "L'écoconception commence par la mesure : ce qui ne se mesure pas ne s'améliore pas",
        "Cherchez des synergies : ce qui est bon pour la planète peut aussi réduire vos coûts",
        "Impliquez vos fournisseurs et partenaires dans votre démarche",
        "Communiquez transparentement sur vos efforts et vos progrès"
      ],
      keyConcepts: [
      { term: "Écoconception", definition: "L'intégration systématique des aspects environnementaux dès la conception d'un produit ou service." },
      { term: "Analyse de cycle de vie", definition: "Une méthode d'évaluation des impacts environnementaux d'un produit sur l'ensemble de son cycle de vie." },
      { term: "Empreinte carbone", definition: "La mesure des émissions de gaz à effet de serre générées par votre activité." }
    ],
      estimatedMinutes: 45,
      subSections: [
      {
        key: "analyse_impact",
        label: "Analyse d'impact environnemental",
        objective: "Identifier les principaux impacts environnementaux de votre projet",
        whyImportant: "Vous ne pouvez réduire que ce que vous mesurez. Une analyse honnête est le point de départ de toute démarche d'écoconception.",
        tips: [
        "Pensez à tout le cycle de vie : matières premières, fabrication, transport, utilisation, fin de vie",
        "Identifiez les 3 impacts les plus significatifs",
        "Utilisez des outils comme le bilan carbone ou l'ACV simplifiée"
      ],
        guidedQuestions: [
            { question: "Quels sont les principaux impacts environnementaux de votre projet ?", placeholder: "Mes principaux impacts sont...", type: "textarea" },
            { question: "À quelle étape du cycle de vie votre impact est-il le plus fort ?", placeholder: "L'étape la plus impactante est...", type: "textarea" }
          ],
        estimatedMinutes: 15
      },
      {
        key: "actions_ecoconception",
        label: "Actions d'écoconception",
        objective: "Identifier des actions concrètes pour réduire votre impact environnemental",
        whyImportant: "Des actions concrètes transforment votre engagement environnemental en réalité. Chaque action compte.",
        tips: [
        "Commencez par les actions à fort impact et faible effort",
        "Certaines actions d'écoconception réduisent aussi vos coûts",
        "Fixez-vous des objectifs chiffrés (ex: -30% d'émissions en 2 ans)"
      ],
        guidedQuestions: [
            { question: "Quelles actions pouvez-vous mettre en place pour réduire votre impact ?", placeholder: "Je peux...", type: "textarea" },
            { question: "Quelles sont les 3 actions prioritaires à mettre en œuvre ?", placeholder: "1. ... 2. ... 3. ...", type: "textarea" },
            { question: "Comment mesurerez-vous l'efficacité de ces actions ?", placeholder: "Je mesurerai par...", type: "textarea" }
          ],
        estimatedMinutes: 20
      },
      {
        key: "communication_durable",
        label: "Communication et engagement",
        objective: "Définir comment communiquer sur votre démarche d'écoconception",
        whyImportant: "Communiquer sur vos engagements environnementaux renforce votre marque et attire les clients sensibles à ces enjeux. Attention au greenwashing.",
        tips: [
        "Soyez honnête : ne communiquez que sur ce que vous faites réellement",
        "Utilisez des labels reconnus si disponibles",
        "Partagez vos progrès et vos difficultés : la transparence est appréciée"
      ],
        guidedQuestions: [
            { question: "Comment allez-vous communiquer sur votre démarche environnementale ?", placeholder: "Je communiquerai sur...", type: "textarea" },
            { question: "Quels labels ou certifications pourriez-vous viser ?", placeholder: "Je pourrais viser...", type: "text" }
          ],
        estimatedMinutes: 10
      }
    ],
      checklist: [
        "J'ai identifié les impacts environnementaux de mon projet",
        "J'ai défini des actions concrètes pour réduire mon impact",
        "J'ai priorisé 3 actions à mettre en œuvre",
        "J'ai une stratégie de communication sur ma démarche environnementale"
      ],
      resources: [
        { title: "Guide de l'écoconception pour les startups", type: "article" },
        { title: "Calculateur d'empreinte carbone", type: "tool" },
        { title: "Labels et certifications environnementales", type: "article" }
      ],
    },
    15: {
      stepNumber: 15,
      title: "Résumé",
      objective: "Synthétiser l'ensemble des étapes précédentes en un résumé cohérent du modèle d'affaires ébauché jusqu'à présent.",
      whyImportant: "Cette étape de synthèse vous permet de prendre du recul sur l'ensemble de votre projet, d'identifier les incohérences et de préparer la transition vers les aspects financiers.",
      avantDeLire: {
        description: "Vous avez parcouru les premières étapes de votre parcours entrepreneurial. Il est temps de rassembler tout ce que vous avez appris et décidé jusqu'à présent. Ce résumé servira de pont entre la partie stratégique et la partie financière de votre projet.",
        resultatsAttendus: "Un résumé complet de votre modèle d'affaires à ce stade : proposition de valeur, segments clients, parties prenantes, activités clés, ressources et engagements environnementaux.",
      },
      etudeDeCas: "ESCO Algérie - Résumé : Installation de systèmes photovoltaïques solaires pour les zones rurales en Algérie. Segments : ménages ruraux, petites entreprises. Proposition de valeur : électricité propre, fiable et abordable. Parties prenantes clés : gouvernement, banques, fournisseurs, communautés locales. Activités : installation, maintenance, formation. Impact environnemental : réduction des émissions de gaz et du bruit des générateurs.",
      conseils: [
        "Prenez le temps de relire l'ensemble de votre travail",
        "Identifiez les incohérences ou les points à approfondir",
        "Sollicitez un regard extérieur pour valider votre synthèse",
        "Gardez ce résumé comme document de référence pour la suite"
      ],
      keyConcepts: [
      { term: "Synthèse stratégique", definition: "Un document qui rassemble et articule les éléments clés de votre stratégie d'entreprise." },
      { term: "Modèle d'affaires", definition: "La logique par laquelle votre entreprise crée, délivre et capture de la valeur." },
      { term: "Cohérence stratégique", definition: "L'alignement logique entre tous les éléments de votre modèle d'affaires." }
    ],
      estimatedMinutes: 30,
      subSections: [
      {
        key: "resume_modele",
        label: "Résumé du modèle d'affaires",
        objective: "Synthétiser les éléments clés de votre modèle d'affaires",
        whyImportant: "Un résumé clair vous permet de communiquer efficacement votre projet et de vérifier sa cohérence globale.",
        tips: [
        "Structurez votre résumé en sections claires",
        "Soyez concis : l'essentiel en une page",
        "Utilisez ce résumé comme base pour votre pitch"
      ],
        guidedQuestions: [
            { question: "Résumez votre projet en 10 à 15 lignes", hint: "Incluez : problème, solution, segments, proposition de valeur, parties prenantes, activités clés", placeholder: "Mon projet...", type: "textarea" },
            { question: "Quel est le principal avantage concurrentiel de votre projet ?", placeholder: "Mon avantage concurrentiel est...", type: "text" }
          ],
        estimatedMinutes: 15
      },
      {
        key: "points_attention",
        label: "Points d'attention et prochaines étapes",
        objective: "Identifier ce qui reste à approfondir avant la partie financière",
        whyImportant: "Un regard lucide sur les points faibles de votre projet vous permet de les adresser avant qu'ils ne deviennent des problèmes.",
        tips: [
        "Soyez honnête sur ce qui n'est pas encore clair",
        "Priorisez les points à approfondir",
        "Certains points s'éclairciront dans les étapes financières"
      ],
        guidedQuestions: [
            { question: "Quels sont les points qui restent à approfondir ?", placeholder: "Je dois encore approfondir...", type: "textarea" },
            { question: "Quelles sont vos priorités pour les prochaines étapes ?", placeholder: "Mes priorités sont...", type: "textarea" }
          ],
        estimatedMinutes: 15
      }
    ],
      checklist: [
        "J'ai rédigé un résumé complet de mon modèle d'affaires",
        "J'ai identifié mon avantage concurrentiel principal",
        "J'ai listé les points à approfondir",
        "J'ai défini mes priorités pour la suite"
      ],
      resources: [
        { title: "Guide de synthèse stratégique", type: "article" }
      ],
    },
    16: {
      stepNumber: 16,
      title: "Structure des coûts",
      objective: "Identifier et estimer tous les coûts nécessaires au fonctionnement de votre entreprise.",
      whyImportant: "Sans une compréhension claire de vos coûts, vous ne pouvez pas fixer vos prix, gérer votre trésorerie ou atteindre la rentabilité. La structure des coûts est le socle de votre santé financière.",
      avantDeLire: {
        description: "La structure des coûts regroupe toutes les dépenses nécessaires au fonctionnement de votre entreprise. On distingue les coûts fixes (indépendants de votre activité) et les coûts variables (liés à votre volume d'activité). Une bonne estimation vous permet de savoir combien vous devez vendre pour être rentable.",
        resultatsAttendus: "Une liste détaillée de vos coûts fixes et variables, avec des estimations chiffrées et une identification des coûts les plus importants.",
      },
      etudeDeCas: "ESCO Algérie a listé ses coûts : Fixes (salaires techniciens 60 000€/an, location entrepôt 6 000€/an, assurances 3 000€/an, véhicules 9 000€/an) = 78 000€/an. Variables (panneaux solaires 3 000€/installation, onduleurs 500€, câblage 200€, frais de déplacement 100€/installation). Coût fixe total : environ 6 500€/mois.",
      conseils: [
        "Soyez exhaustif : n'oubliez pas les petites dépenses qui s'accumulent",
        "Distinguer clairement coûts fixes et variables",
        "Prévoyez une marge d'erreur de 20% sur vos estimations",
        "Révisez régulièrement vos coûts à mesure que vous avancez"
      ],
      keyConcepts: [
      { term: "Coûts fixes", definition: "Les dépenses qui ne varient pas avec votre volume d'activité (loyer, salaires, assurances)." },
      { term: "Coûts variables", definition: "Les dépenses qui augmentent avec votre volume d'activité (matières premières, commissions, livraison)." },
      { term: "Seuil de rentabilité", definition: "Le niveau d'activité à partir duquel vos revenus couvrent l'ensemble de vos coûts." }
    ],
      estimatedMinutes: 40,
      subSections: [
      {
        key: "couts_fixes",
        label: "Coûts fixes",
        objective: "Lister et estimer vos coûts fixes mensuels et annuels",
        whyImportant: "Les coûts fixes sont votre « ticket d'entrée » mensuel. Les connaître vous permet de savoir combien vous devez générer chaque mois avant de commencer à dégager des bénéfices.",
        tips: [
        "Listez tous les postes de dépenses récurrents",
        "Distinguer coûts fixes de structure et coûts fixes opérationnels",
        "N'oubliez pas les assurances, abonnements, services"
      ],
        examples: [
        "Loyer : 1 000€/mois",
        "Salaire développeur : 3 750€/mois",
        "Serveurs : 300€/mois",
        "Assurances : 200€/mois",
        "Abonnements SaaS : 150€/mois"
      ],
        guidedQuestions: [
            { question: "Quels sont vos coûts fixes mensuels ?", placeholder: "Loyer : ...€, Salaires : ...€, etc.", type: "textarea" },
            { question: "Quel est votre coût fixe mensuel total estimé ?", placeholder: "Mon coût fixe mensuel total est d'environ...€", type: "text" }
          ],
        estimatedMinutes: 15
      },
      {
        key: "couts_variables",
        label: "Coûts variables",
        objective: "Lister et estimer vos coûts variables par unité vendue",
        whyImportant: "Les coûts variables déterminent votre marge sur chaque vente. Plus ils sont faibles, plus chaque vente contribue à couvrir vos coûts fixes.",
        tips: [
        "Estimez le coût variable unitaire (par produit/service vendu)",
        "Identifiez les coûts variables qui augmenteront avec la croissance",
        "Calculez votre marge brute : prix de vente - coûts variables"
      ],
        examples: [
        "Commission producteur : 30% du prix de vente",
        "Frais de livraison : 5€ par commande",
        "Coût d'acquisition client : 2€ par nouveau client"
      ],
        guidedQuestions: [
            { question: "Quels sont vos coûts variables par unité vendue ?", placeholder: "Par unité vendue, j'ai...€ de coûts variables", type: "textarea" },
            { question: "Quel est votre coût variable total pour une vente typique ?", placeholder: "Pour une vente typique de...€, les coûts variables sont de...€", type: "text" }
          ],
        estimatedMinutes: 15
      },
      {
        key: "seuil_rentabilite",
        label: "Seuil de rentabilité",
        objective: "Calculer le nombre de ventes nécessaires pour atteindre la rentabilité",
        whyImportant: "Le seuil de rentabilité est un indicateur clé pour savoir si votre modèle économique est viable et à partir de quand vous générerez des bénéfices.",
        tips: [
        "Seuil = Coûts fixes / (Prix de vente - Coûts variables unitaires)",
        "Testez différents scénarios (optimiste, réaliste, pessimiste)",
        "Plus le seuil est bas, plus votre modèle est résilient"
      ],
        guidedQuestions: [
            { question: "Quel est le prix de vente moyen de votre produit ou service ?", placeholder: "Prix moyen : ...€", type: "text" },
            { question: "Quel est votre seuil de rentabilité mensuel estimé (nombre d'unités à vendre) ?", hint: "Coûts fixes mensuels / (Prix - Coûts variables unitaires)", placeholder: "Je dois vendre environ... unités par mois", type: "text" },
            { question: "Ce seuil vous semble-t-il atteignable ?", placeholder: "Oui, car... / Non, car...", type: "textarea" }
          ],
        estimatedMinutes: 10
      }
    ],
      checklist: [
        "J'ai listé tous mes coûts fixes mensuels",
        "J'ai listé mes coûts variables par unité vendue",
        "J'ai calculé mon seuil de rentabilité",
        "J'ai une vision claire de ma structure de coûts"
      ],
      resources: [
        { title: "Guide de la structure des coûts pour startups", type: "article" },
        { title: "Calculateur de seuil de rentabilité", type: "tool" }
      ],
    },
    17: {
      stepNumber: 17,
      title: "Flux de revenus",
      objective: "Définir comment votre entreprise va générer des revenus : sources de revenus, stratégie de prix et projections financières.",
      whyImportant: "Votre entreprise doit générer plus de revenus que de coûts pour être viable. Comprendre vos sources de revenus et votre stratégie de prix est essentiel pour construire un modèle économique durable.",
      avantDeLire: {
        description: "Les flux de revenus décrivent comment votre entreprise capture de la valeur. Il existe plusieurs types de revenus : vente directe, abonnement, commission, publicité, etc. Dans cette étape, vous allez définir vos sources de revenus, votre stratégie de prix et projeter vos revenus attendus.",
        resultatsAttendus: "Une stratégie de revenus claire avec les sources identifiées, la stratégie de prix définie et des projections de revenus à 1 an.",
      },
      etudeDeCas: "ESCO Algérie a défini ses sources de revenus : Vente de systèmes photovoltaïques (6 000€/installation), Installation (1 500€), Maintenance annuelle (300€/client), Location de systèmes (100€/mois). Prix : vente directe ou location avec option d'achat. Projection : objectif de 10 installations/mois à 7 500€ de revenu moyen = 75 000€/mois de chiffre d'affaires en année 1.",
      conseils: [
        "Diversifiez vos sources de revenus sans les multiplier inutilement",
        "Testez différents prix auprès de vos clients potentiels",
        "La stratégie de prix peut évoluer : commencez simple et ajustez",
        "Projetez vos revenus sur 12 mois avec des hypothèses claires"
      ],
      keyConcepts: [
      { term: "Flux de revenus", definition: "Les différentes sources par lesquelles votre entreprise génère de l'argent." },
      { term: "Stratégie de prix", definition: "La méthode par laquelle vous fixez le prix de vos produits ou services." },
      { term: "Projection financière", definition: "Une estimation de vos revenus futurs basée sur des hypothèses et des données." }
    ],
      estimatedMinutes: 45,
      subSections: [
      {
        key: "sources_revenus",
        label: "Sources de revenus",
        objective: "Identifier toutes vos sources potentielles de revenus",
        whyImportant: "Chaque source de revenus supplémentaire réduit votre dépendance à une seule source et augmente votre résilience financière.",
        tips: [
        "Une source de revenus = une proposition de valeur monétisée",
        "Distinguer revenus récurrents (abonnements) et ponctuels (ventes)",
        "Certaines sources peuvent être accessoires mais rentables"
      ],
        examples: [
        "Commission sur les ventes (15%)",
        "Abonnement premium producteurs (29,90€/mois)",
        "Publicité ciblée",
        "Partenariats avec des marques locales"
      ],
        guidedQuestions: [
            { question: "Quelles sont vos sources de revenus ?", placeholder: "Mes sources de revenus sont...", type: "textarea" },
            { question: "Quelle sera votre source de revenus principale ?", placeholder: "Ma source principale sera...", type: "text" },
            { question: "Y a-t-il d'autres sources de revenus possibles à explorer plus tard ?", placeholder: "Plus tard, je pourrais aussi...", type: "textarea" }
          ],
        estimatedMinutes: 15
      },
      {
        key: "strategie_prix",
        label: "Stratégie de prix",
        objective: "Définir comment vous allez fixer vos prix",
        whyImportant: "Le prix est un signal de valeur. Un prix trop bas peut dévaloriser votre offre, un prix trop haut peut rebuter vos clients.",
        tips: [
        "Basez-vous sur la valeur perçue, pas seulement sur vos coûts",
        "Analysez les prix de vos concurrents",
        "Testez différents niveaux de prix (A/B testing si possible)"
      ],
        guidedQuestions: [
            { question: "Comment allez-vous fixer vos prix ?", placeholder: "Je fixerai mes prix en fonction de...", type: "textarea" },
            { question: "Quel est le prix de votre produit ou service principal ?", placeholder: "Mon prix est de...€", type: "text" },
            { question: "Ce prix est-il cohérent avec votre proposition de valeur ?", placeholder: "Oui, car...", type: "textarea" }
          ],
        estimatedMinutes: 15
      },
      {
        key: "projections_revenus",
        label: "Projections de revenus",
        objective: "Estimer vos revenus attendus sur les 12 prochains mois",
        whyImportant: "Les projections de revenus vous permettent de vérifier la viabilité financière de votre projet et de planifier votre trésorerie.",
        tips: [
        "Basez vos projections sur des hypothèses réalistes",
        "Créez 3 scénarios : pessimiste, réaliste, optimiste",
        "Mettez à jour vos projections chaque mois"
      ],
        guidedQuestions: [
            { question: "Quels sont vos objectifs de revenus pour les 12 prochains mois ?", placeholder: "Mois 1-3 : ...€, Mois 4-6 : ...€, Mois 7-12 : ...€", type: "textarea" },
            { question: "Quelles hypothèses sous-tendent ces projections ?", placeholder: "Mes hypothèses sont...", type: "textarea" },
            { question: "À partir de quand votre entreprise devient-elle rentable ?", placeholder: "Mon entreprise deviendra rentable en mois...", type: "text" }
          ],
        estimatedMinutes: 15
      }
    ],
      checklist: [
        "J'ai identifié mes sources de revenus",
        "J'ai défini ma stratégie de prix",
        "J'ai réalisé des projections de revenus sur 12 mois",
        "J'ai identifié quand mon entreprise deviendra rentable"
      ],
      resources: [
        { title: "Guide des modèles de revenus pour startups", type: "article" },
        { title: "Comment fixer le prix de votre produit", type: "article" }
      ],
    },
    18: {
      stepNumber: 18,
      title: "Résumé financier",
      objective: "Synthétiser les aspects financiers de votre projet : coûts, revenus, besoin de financement et indicateurs clés.",
      whyImportant: "Un résumé financier clair est indispensable pour parler à des investisseurs, des banques ou des partenaires. C'est aussi un outil de pilotage essentiel pour vous-même.",
      avantDeLire: {
        description: "Le résumé financier rassemble les éléments clés de votre analyse financière : structure des coûts, flux de revenus, besoin de financement et principaux indicateurs. Ce document sera crucial si vous cherchez un financement ou un partenariat.",
        resultatsAttendus: "Un résumé financier complet avec le coût fixe mensuel, le seuil de rentabilité, le besoin de financement et les principaux indicateurs financiers.",
      },
      etudeDeCas: "ESCO Algérie a résumé : Coût fixe mensuel : 6 500€. Seuil de rentabilité : 4 installations/mois (prix moyen 7 500€, marge 35%). Revenu mensuel à 10 installations : 75 000€. Besoin de financement initial : 120 000€ (stock + trésorerie). Marge brute : 35% du prix de vente.",
      conseils: [
        "Soyez précis et transparent dans vos chiffres",
        "Préparez-vous à justifier chaque hypothèse",
        "Un besoin de financement réaliste inspire confiance",
        "Gardez vos documents financiers à jour et organisés"
      ],
      keyConcepts: [
      { term: "Besoin de financement", definition: "Le montant d'argent nécessaire pour lancer et faire fonctionner votre entreprise jusqu'à ce qu'elle devienne rentable." },
      { term: "Trésorerie", definition: "La différence entre les entrées et sorties d'argent à un moment donné." },
      { term: "Marge brute", definition: "La différence entre le prix de vente et le coût variable unitaire, exprimée en pourcentage." }
    ],
      estimatedMinutes: 35,
      subSections: [
      {
        key: "synthese_financiere",
        label: "Synthèse financière",
        objective: "Rassembler les chiffres clés de votre analyse financière",
        whyImportant: "Avoir tous vos chiffres clés en un coup d'œil vous permet de prendre des décisions éclairées et de communiquer efficacement.",
        tips: [
        "Un tableau de synthèse avec les 5-10 chiffres les plus importants",
        "Comparez avec des benchmarks du secteur si disponibles",
        "Mettez en évidence les points forts et les points de vigilance"
      ],
        guidedQuestions: [
            { question: "Quels sont vos chiffres financiers clés ?", placeholder: "Coûts fixes mensuels : ...€, Seuil de rentabilité : ... unités, Prix moyen : ...€, Marge brute : ...%", type: "textarea" },
            { question: "Quel est votre besoin de financement estimé ?", placeholder: "J'ai besoin de...€ pour...", type: "text" }
          ],
        estimatedMinutes: 15
      },
      {
        key: "plan_financement",
        label: "Plan de financement",
        objective: "Définir comment vous allez financer votre projet",
        whyImportant: "Un plan de financement clair rassure vos interlocuteurs et vous permet de savoir où vous en êtes dans votre recherche de fonds.",
        tips: [
        "Distinguez les fonds déjà obtenus des fonds à rechercher",
        "Listez les sources potentielles (épargne, prêts, subventions, investisseurs)",
        "Préparez un argumentaire pour chaque source de financement"
      ],
        guidedQuestions: [
            { question: "Comment allez-vous financer votre projet ?", placeholder: "Je vais financer mon projet par...", type: "textarea" },
            { question: "Quelles sources de financement allez-vous solliciter ?", placeholder: "Je vais solliciter...", type: "textarea" }
          ],
        estimatedMinutes: 10
      },
      {
        key: "indicateurs_pilotage",
        label: "Indicateurs de pilotage financier",
        objective: "Définir les indicateurs pour suivre votre santé financière",
        whyImportant: "Ce qui ne se mesure pas ne s'améliore pas. Des indicateurs de pilotage vous permettent de détecter les problèmes avant qu'ils ne deviennent critiques.",
        tips: [
        "Choisissez 3 à 5 indicateurs clés à suivre chaque mois",
        "Automatisez la collecte de données quand c'est possible",
        "Fixez-vous des seuils d'alerte pour chaque indicateur"
      ],
        guidedQuestions: [
            { question: "Quels indicateurs financiers allez-vous suivre mensuellement ?", placeholder: "Je suivrai : chiffre d'affaires, marge brute, trésorerie, nombre de clients...", type: "textarea" },
            { question: "Quels sont vos objectifs pour chaque indicateur à 6 mois ?", placeholder: "CA mensuel : ...€, Marge brute : ...%, Trésorerie : ...€", type: "textarea" }
          ],
        estimatedMinutes: 10
      }
    ],
      checklist: [
        "J'ai rédigé la synthèse financière de mon projet",
        "J'ai estimé mon besoin de financement",
        "J'ai défini mon plan de financement",
        "J'ai identifié les indicateurs clés à suivre"
      ],
      resources: [
        { title: "Guide du résumé financier pour investisseurs", type: "article" },
        { title: "Modèle de tableau de bord financier", type: "tool" }
      ],
    },
    19: {
      stepNumber: 19,
      title: "Préparez le test !",
      objective: "Préparer le test terrain de votre projet en définissant ce que vous allez tester, comment et avec quels critères de succès.",
      whyImportant: "Un test bien préparé est un test qui produit des apprentissages utiles. La préparation est la clé pour tirer le maximum de chaque test et éviter de perdre du temps sur des expériences mal conçues.",
      avantDeLire: {
        description: "Vous êtes presque prêt à tester votre projet sur le terrain. Cette étape vous aide à définir précisément : quoi tester, auprès de qui, comment, et quels sont vos critères de succès. Une bonne préparation décuple la valeur de vos tests.",
        resultatsAttendus: "Un plan de test complet avec les objectifs, la méthode, les participants, les critères de succès et le calendrier.",
      },
      etudeDeCas: "ESCO Algérie prépare son test terrain : Objectif : installer 5 systèmes photovoltaïques dans un village pilote et valider la satisfaction des ménages. Méthode : démonstration, installation test, suivi pendant 2 mois. Participants : 5 ménages sélectionnés avec la communauté locale. Critères de succès : 100% des systèmes fonctionnels, 80% de satisfaction, 3 recommandations. Calendrier : 1 mois de préparation, 2 mois de test, 2 semaines d'analyse.",
      conseils: [
        "Définissez des critères de succès clairs avant le test, pas après",
        "Un test doit avoir une durée limitée dans le temps",
        "Préparez des questions précises pour recueillir des feedbacks structurés",
        "Anticipez les imprévus : que ferez-vous si le test échoue ?"
      ],
      keyConcepts: [
      { term: "Produit Minimum Viable (MVP)", definition: "La version la plus simple de votre produit qui permet de tester votre proposition de valeur avec de vrais utilisateurs." },
      { term: "Critères de succès", definition: "Les conditions mesurables qui déterminent si votre test est réussi ou non." },
      { term: "Plan de test", definition: "Un document qui définit les objectifs, la méthode, les participants et le calendrier d'un test." }
    ],
      estimatedMinutes: 45,
      subSections: [
      {
        key: "objectifs_test",
        label: "Objectifs du test",
        objective: "Définir ce que vous voulez apprendre de votre test",
        whyImportant: "Des objectifs clairs vous permettent de concevoir un test qui produit des résultats utiles et exploitables.",
        tips: [
        "Un test = une question précise à laquelle vous voulez répondre",
        "Priorisez les questions les plus importantes pour votre projet",
        "Évitez de vouloir tester trop de choses à la fois"
      ],
        guidedQuestions: [
            { question: "Quelle est la question principale à laquelle vous voulez répondre avec ce test ?", placeholder: "Je veux savoir si...", type: "text" },
            { question: "Qu'allez-vous tester concrètement ?", placeholder: "Je vais tester...", type: "textarea" },
            { question: "Qu'apprendrez-vous de ce test, quel qu'en soit le résultat ?", placeholder: "Quel que soit le résultat, j'apprendrai...", type: "textarea" }
          ],
        estimatedMinutes: 12
      },
      {
        key: "methode_test",
        label: "Méthode et participants",
        objective: "Définir comment et auprès de qui vous allez tester",
        whyImportant: "La méthode et les participants déterminent la qualité et la fiabilité de vos résultats.",
        tips: [
        "Choisissez une méthode adaptée à votre question (entretien, observation, test produit)",
        "Recrutez des participants qui correspondent à votre cible",
        "5 à 10 participants suffisent pour un premier test qualitatif"
      ],
        guidedQuestions: [
            { question: "Quelle méthode allez-vous utiliser pour ce test ?", placeholder: "Je vais utiliser...", type: "textarea" },
            { question: "Auprès de qui allez-vous tester ?", placeholder: "Je vais tester auprès de...", type: "textarea" },
            { question: "Combien de participants prévoyez-vous ?", placeholder: "Je prévois... participants", type: "text" }
          ],
        estimatedMinutes: 12
      },
      {
        key: "criteres_succes",
        label: "Critères de succès et calendrier",
        objective: "Définir les conditions qui détermineront la réussite de votre test",
        whyImportant: "Des critères de succès prédéfinis évitent les interprétations biaisées des résultats.",
        tips: [
        "Des critères de succès doivent être mesurables et objectifs",
        "Distinguez les critères de validation et les critères d'apprentissage",
        "Fixez une date butoir pour la fin du test"
      ],
        guidedQuestions: [
            { question: "Quels sont vos critères de succès pour ce test ?", placeholder: "Le test sera réussi si...", type: "textarea" },
            { question: "Quel est le calendrier de votre test ?", placeholder: "Préparation : ... Test : ... Analyse : ...", type: "textarea" },
            { question: "Que ferez-vous si le test échoue ?", placeholder: "Si le test échoue, je...", type: "textarea" }
          ],
        estimatedMinutes: 12
      }
    ],
      checklist: [
        "J'ai défini l'objectif principal de mon test",
        "J'ai choisi une méthode de test adaptée",
        "J'ai identifié les participants",
        "J'ai défini mes critères de succès",
        "J'ai un calendrier pour mon test"
      ],
      resources: [
        { title: "Guide du MVP (Produit Minimum Viable)", type: "article" },
        { title: "Comment concevoir un plan de test", type: "article" }
      ],
    },
    20: {
      stepNumber: 20,
      title: "Indicateurs (KPIs)",
      objective: "Définir les indicateurs clés de performance (KPIs) qui vous permettront de mesurer le succès de votre projet et d'ajuster votre stratégie.",
      whyImportant: "Les KPIs sont votre tableau de bord de pilotage. Ils transforment des données brutes en informations actionnables. Sans KPIs, vous pilotez à l'aveugle. Avec des bons KPIs, vous détectez les problèmes tôt et saisissez les opportunités.",
      avantDeLire: {
        description: "Les KPIs (Key Performance Indicators) sont des mesures quantifiables qui vous indiquent si vous atteignez vos objectifs. Ils couvrent différents aspects : performance financière, satisfaction client, impact environnemental, efficacité opérationnelle. Choisissez vos KPIs avec soin : trop, vous vous noyez dans les données ; trop peu, vous manquez des signaux importants.",
        resultatsAttendus: "Une liste de 8 à 12 KPIs couvrant les dimensions financière, client, impact et opérationnelle, avec les objectifs associés.",
      },
      etudeDeCas: "ESCO Algérie a défini ses KPIs : Financiers (CA mensuel, marge brute, trésorerie), Clients (nombre de clients équipés, taux de satisfaction, taux de référencement), Impact (tonnes de CO2 évitées, emplois créés, ménages électrifiés), Opérationnels (nombre d'installations/mois, délai d'installation moyen, taux de panne). Objectifs à 6 mois : 50 clients équipés, 95% de satisfaction, 20 tonnes de CO2 évitées.",
      conseils: [
        "Limitez-vous à 8-12 KPIs maximum pour rester focus",
        "Chaque KPI doit être lié à un objectif spécifique",
        "Automatisez la collecte des données quand c'est possible",
        "Révisez vos KPIs régulièrement : certains deviennent moins pertinents avec le temps",
        "Partagez vos KPIs avec votre équipe pour l'alignement"
      ],
      keyConcepts: [
      { term: "KPI (Key Performance Indicator)", definition: "Un indicateur quantifiable qui mesure la performance d'une activité par rapport à un objectif." },
      { term: "Tableau de bord", definition: "Un outil de visualisation qui regroupe vos KPIs pour un suivi en temps réel." },
      { term: "Objectif vs Réel", definition: "La comparaison entre vos objectifs fixés et les résultats réels, qui permet d'identifier les écarts et d'ajuster votre stratégie." }
    ],
      estimatedMinutes: 40,
      subSections: [
      {
        key: "kpis_financiers",
        label: "KPIs financiers",
        objective: "Définir les indicateurs de performance financière",
        whyImportant: "Les KPIs financiers sont la mesure ultime de la viabilité de votre entreprise. Ils vous alertent rapidement en cas de dérive.",
        tips: [
        "Suivez au minimum : CA, marge brute, trésorerie",
        "Un KPI financier sans objectif n'a pas de sens",
        "Comparez toujours vos résultats à vos prévisions"
      ],
        guidedQuestions: [
            { question: "Quels sont vos KPIs financiers principaux ?", placeholder: "Mes KPIs financiers sont...", type: "textarea" },
            { question: "Quels sont vos objectifs pour chaque KPI financier à 6 mois ?", placeholder: "CA : ...€/mois, Marge : ...%, Trésorerie : ...€", type: "textarea" }
          ],
        estimatedMinutes: 10
      },
      {
        key: "kpis_clients",
        label: "KPIs clients et satisfaction",
        objective: "Définir les indicateurs de satisfaction et de fidélisation client",
        whyImportant: "Des clients satisfaits sont votre meilleur moteur de croissance. La satisfaction client est un indicateur avancé de votre santé future.",
        tips: [
        "Le NPS (Net Promoter Score) est un bon indicateur global",
        "Le taux de rétention est plus important que le nombre d'acquisitions",
        "Un client satisfait mais qui ne revient pas est un signal d'alarme"
      ],
        guidedQuestions: [
            { question: "Comment mesurerez-vous la satisfaction de vos clients ?", placeholder: "Je mesurerai la satisfaction via...", type: "textarea" },
            { question: "Quels sont vos objectifs de satisfaction client à 6 mois ?", placeholder: "NPS : ..., Taux de rétention : ...%", type: "textarea" }
          ],
        estimatedMinutes: 10
      },
      {
        key: "kpis_impact",
        label: "KPIs d'impact",
        objective: "Définir les indicateurs de votre impact environnemental et social",
        whyImportant: "L'impact est au cœur de votre projet. Le mesurer vous permet de prouver votre valeur et d'améliorer continuellement votre contribution positive.",
        tips: [
        "Mesurez ce qui est directement lié à votre activité",
        "Utilisez des référentiels reconnus quand c'est possible",
        "L'impact se mesure dans le temps : comparez année après année"
      ],
        guidedQuestions: [
            { question: "Comment mesurerez-vous votre impact environnemental et social ?", placeholder: "Je mesurerai mon impact par...", type: "textarea" },
            { question: "Quels sont vos objectifs d'impact à 1 an ?", placeholder: "Objectif : réduire de ...% / toucher ... personnes / ...", type: "textarea" }
          ],
        estimatedMinutes: 10
      },
      {
        key: "tableau_bord",
        label: "Tableau de bord",
        objective: "Organiser vos KPIs dans un tableau de bord de pilotage",
        whyImportant: "Un tableau de bord bien conçu vous donne une vue d'ensemble en un coup d'œil et vous permet de réagir rapidement.",
        tips: [
        "Utilisez un outil simple (Google Sheets, Notion) pour commencer",
        "Mettez à jour vos données chaque semaine",
        "Ajoutez des alertes visuelles (feux tricolores) pour les KPIs critiques"
      ],
        guidedQuestions: [
            { question: "Comment allez-vous organiser le suivi de vos KPIs ?", placeholder: "Je vais suivre mes KPIs dans...", type: "textarea" },
            { question: "À quelle fréquence allez-vous revoir vos indicateurs ?", placeholder: "Je vais revoir mes indicateurs...", type: "text" },
            { question: "Qui aura accès à ce tableau de bord ?", placeholder: "Mes KPIs seront partagés avec...", type: "text" }
          ],
        estimatedMinutes: 10
      }
    ],
      checklist: [
        "J'ai défini mes KPIs financiers",
        "J'ai défini mes KPIs clients et satisfaction",
        "J'ai défini mes KPIs d'impact",
        "J'ai organisé mes KPIs dans un tableau de bord",
        "Je sais à quelle fréquence je vais les suivre"
      ],
      resources: [
        { title: "Guide des KPIs essentiels pour startups à impact", type: "article" },
        { title: "Modèle de tableau de bord KPI", type: "tool" },
        { title: "Comment définir des objectifs ambitieux mais réalistes", type: "article" }
      ],
    },
};
