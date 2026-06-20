import {
  GuidedQuestion,
  SubSectionContent,
  StepPedagogicalContent,
} from "./pedagogical-content";

export const STEP_PEDAGOGICAL_CONTENT_V2: Record<number, StepPedagogicalContent> = {
    1: {
      stepNumber: 1,
      title: "Esquissez votre idée d'entreprise",
      objective: "Définir les contours de votre projet en clarifiant le nom, la description, l'inspiration et le secteur d'activité.",
      whyImportant: "Une idée bien esquissée est le socle de tout le parcours entrepreneurial. Prendre le temps de poser les bases vous évite des erreurs stratégiques coûteuses et vous donne une direction claire.",
      avantDeLire: {
        description: "Dans cette étape, vous allez donner une première forme concrète à votre idée. Ne cherchez pas la perfection : l'objectif est d'écrire ce qui vous vient, même si c'est encore flou. Vous aurez tout le parcours pour affiner.",
        resultatsAttendus: "Un nom provisoire, une description claire de votre idée, l'histoire de son inspiration et le secteur d'activité identifié.",
      },
      etudeDeCas: "Sophie, 32 ans, a eu l'idée de créer une plateforme de mise en relation entre producteurs locaux et consommateurs après avoir vu un documentaire sur le gaspillage alimentaire. Elle a noté son idée dans un carnet : « Relocal » la plateforme qui connecte les producteurs locaux aux consommateurs urbains. Elle a précisé son secteur (agroalimentaire, numérique) et a commencé à en parler autour d'elle pour tester le concept.",
      conseils: [
        "Ne cherchez pas le nom parfait dès le départ : un nom provisoire suffit pour commencer",
        "Parlez de votre idée à 5 personnes de confiance pour recueillir leurs premières réactions",
        "Notez tout, même les idées qui vous semblent farfelues : elles peuvent contenir une pépite",
        "Restez ouvert : votre idée va évoluer tout au long de ce parcours"
      ],
      keyConcepts: [
      { term: "Idée d'entreprise", definition: "Le concept de base de ce que vous voulez créer, sans être encore un business model détaillé." },
      { term: "Secteur d'activité", definition: "Le domaine économique dans lequel vous allez exercer (ex: agriculture, numérique, services)." },
      { term: "Proposition de valeur", definition: "La promesse de valeur que vous ferez à vos futurs clients." }
    ],
      estimatedMinutes: 40,
      subSections: [
      {
        key: "nom_provisoire",
        label: "Nom provisoire du projet",
        objective: "Trouver un nom temporaire pour votre projet",
        whyImportant: "Le nom est la première identité de votre projet. Même provisoire, il vous aide à incarner votre idée et à en parler autour de vous.",
        tips: [
        "Choisissez un nom simple, facile à retenir et à prononcer",
        "Évitez les noms trop génériques ou déjà utilisés",
        "Testez-le verbalement auprès de votre entourage"
      ],
        examples: [
        "« Relocal » pour une plateforme de mise en relation locale",
        "« Vert-Connect » pour un réseau d'entreprises écoresponsables"
      ],
        guidedQuestions: [
            { question: "Quel nom provisoire donnez-vous à votre projet ?", hint: "Vous pourrez le changer plus tard", placeholder: "ex: Relocal", type: "text" },
            { question: "Pourquoi ce nom vous semble-t-il approprié ?", placeholder: "expliquez votre choix...", type: "text" }
          ],
        estimatedMinutes: 5
      },
      {
        key: "description_idee",
        label: "Description de l'idée",
        objective: "Décrire votre idée de façon claire et concise",
        whyImportant: "Une description claire vous permet de partager votre vision facilement et d'obtenir des retours utiles.",
        tips: [
        "Commencez par le problème que vous voulez résoudre",
        "Expliquez votre solution en une phrase",
        "Terminez par l'impact que vous souhaitez avoir"
      ],
        examples: [
        "Relocal est une plateforme web qui connecte les producteurs locaux avec les consommateurs urbains pour réduire le gaspillage alimentaire et soutenir l'économie locale."
      ],
        guidedQuestions: [
            { question: "Décrivez votre idée en 5 à 10 lignes", hint: "Imaginez que vous la présentez à un inconnu", placeholder: "Mon idée consiste à...", type: "textarea" },
            { question: "Quel est le concept central en une phrase ?", placeholder: "ex: Une plateforme de mise en relation entre...", type: "text" }
          ],
        estimatedMinutes: 10
      },
      {
        key: "inspiration",
        label: "Inspiration et origine du projet",
        objective: "Expliquer ce qui vous a poussé à créer ce projet",
        whyImportant: "Votre histoire personnelle donne du sens à votre projet et constitue un moteur puissant dans les moments difficiles.",
        tips: [
        "Racontez une expérience personnelle qui a déclenché l'idée",
        "Citez des personnes ou des situations qui vous ont inspiré",
        "Soyez authentique : les histoires vraies touchent les gens"
      ],
        examples: [
        "Après avoir vu un documentaire sur le gaspillage alimentaire et découvert que 30% de la production locale est perdue faute de distribution, j'ai eu envie d'agir."
      ],
        guidedQuestions: [
            { question: "Qu'est-ce qui vous a inspiré à créer ce projet ?", placeholder: "Mon inspiration vient de...", type: "textarea" },
            { question: "Y a-t-il une expérience personnelle à l'origine de cette idée ?", placeholder: "racontez votre histoire...", type: "textarea" }
          ],
        estimatedMinutes: 10
      },
      {
        key: "secteur_activite",
        label: "Secteur d'activité",
        objective: "Identifier le ou les secteurs d'activité de votre projet",
        whyImportant: "Le secteur d'activité détermine les règles, les obligations légales et les opportunités de votre projet.",
        tips: [
        "Identifiez le secteur principal (ex: agriculture, numérique, services)",
        "Certains projets sont transverses : notez tous les secteurs concernés",
        "Renseignez-vous sur les spécificités réglementaires de votre secteur"
      ],
        examples: [
        "Secteur principal : agroalimentaire. Secondaire : numérique (plateforme SaaS)."
      ],
        guidedQuestions: [
            { question: "Dans quel(s) secteur(s) d'activité vous situez-vous ?", placeholder: "ex: agriculture, numérique, artisanat, services...", type: "text" },
            { question: "Y a-t-il des réglementations spécifiques à connaître dans ce secteur ?", hint: "Agréments, diplômes, normes...", placeholder: "ex: certification bio, agrément sanitaire...", type: "textarea" }
          ],
        estimatedMinutes: 15
      }
    ],
      checklist: [
        "J'ai un nom provisoire pour mon projet",
        "Je peux décrire mon idée en 5 à 10 lignes",
        "J'ai identifié l'origine et l'inspiration de mon projet",
        "J'ai défini mon secteur d'activité"
      ],
      resources: [
        { title: "Comment trouver le bon nom pour votre entreprise", type: "article" },
        { title: "Carte des secteurs d'activité - INSEE", type: "tool" }
      ],
    },
    2: {
      stepNumber: 2,
      title: "Identifier les problèmes et les besoins",
      objective: "Analyser en profondeur les problèmes que rencontre votre cible et les besoins non satisfaits auxquels votre projet pourrait répondre.",
      whyImportant: "Un projet qui résout un problème réel a 5 fois plus de chances de succès. Comprendre les besoins profonds de vos futurs clients est la clé d'une proposition de valeur pertinente.",
      avantDeLire: {
        description: "Avant de construire votre solution, il est essentiel de bien comprendre le problème. Dans cette étape, vous allez explorer les difficultés rencontrées par votre cible, les solutions existantes et identifier les opportunités.",
        resultatsAttendus: "Une liste des problèmes clés identifiés, une cartographie des solutions existantes et une analyse des besoins non satisfaits.",
      },
      etudeDeCas: "Sophie a interrogé 15 consommateurs et 8 producteurs locaux. Elle a découvert que les consommateurs veulent acheter local mais ne savent pas où trouver les producteurs. Les producteurs, eux, n'ont pas les moyens de commercialiser leurs produits en ville. Le vrai problème n'est pas l'offre ou la demande, mais l'absence de connexion entre les deux.",
      conseils: [
        "Ne vous fiez pas à vos seules intuitions : allez parler à des personnes réelles",
        "Écoutez plus que vous ne parlez lors de vos entretiens",
        "Cherchez à comprendre le « pourquoi » derrière chaque problème",
        "Notez les contradictions : elles révèlent souvent des opportunités cachées"
      ],
      keyConcepts: [
      { term: "Problème douloureux", definition: "Une difficulté réelle et persistante rencontrée par votre cible, pour laquelle elle est prête à payer pour une solution." },
      { term: "Besoins non satisfaits", definition: "Des attentes ou désirs que les solutions actuelles ne comblent pas entièrement." },
      { term: "Entretien exploratoire", definition: "Une conversation structurée avec une personne de votre cible pour comprendre ses problèmes et besoins en profondeur." }
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
        examples: [
        "Les consommateurs urbains n'ont pas accès aux produits locaux frais",
        "Les producteurs locaux n'ont pas de canal de distribution vers la ville"
      ],
        guidedQuestions: [
            { question: "Quels sont les principaux problèmes que vous avez identifiés ?", placeholder: "Problème 1 : ...", type: "textarea" },
            { question: "Comment savez-vous que ce sont de vrais problèmes ?", hint: "Quelles preuves avez-vous ? Entretiens, observations, données ?", placeholder: "J'ai interrogé... observé...", type: "textarea" },
            { question: "Quel est le problème le plus urgent à résoudre ?", placeholder: "Le problème prioritaire est...", type: "text" }
          ],
        estimatedMinutes: 15
      },
      {
        key: "solutions_existantes",
        label: "Solutions existantes",
        objective: "Analyser les solutions déjà disponibles sur le marché",
        whyImportant: "Connaître les alternatives de vos futurs clients vous aide à positionner votre solution et à identifier les lacunes du marché.",
        tips: [
        "Ne négligez pas les solutions « low-tech » ou artisanales",
        "Analysez les forces et faiblesses de chaque alternative",
        "Demandez à votre cible ce qui lui manque dans les solutions actuelles"
      ],
        examples: [
        "Les marchés physiques (limitée en heures et en lieux)",
        "Les AMAP (engagement contraignant pour le consommateur)",
        "La vente directe à la ferme (nécessite une voiture)"
      ],
        guidedQuestions: [
            { question: "Comment vos futurs clients résolvent-ils ce problème aujourd'hui ?", placeholder: "Actuellement, ils...", type: "textarea" },
            { question: "Quels sont les inconvénients des solutions actuelles ?", placeholder: "Les solutions existantes ne permettent pas de...", type: "textarea" }
          ],
        estimatedMinutes: 15
      },
      {
        key: "opportunites",
        label: "Opportunités identifiées",
        objective: "Identifier les opportunités là où les besoins ne sont pas satisfaits",
        whyImportant: "Les plus grandes opportunités d'innovation se trouvent là où les solutions actuelles échouent à satisfaire les besoins.",
        tips: [
        "Cherchez les frustrations exprimées par votre cible",
        "Un « j'aimerais bien mais... » est souvent une opportunité",
        "Les compromis que font vos clients sont des signaux forts"
      ],
        examples: [
        "Aucune solution ne permet une connexion directe et en temps réel entre producteurs et consommateurs urbains"
      ],
        guidedQuestions: [
            { question: "Quelles opportunités voyez-vous dans les lacunes identifiées ?", placeholder: "L'opportunité que j'identifie est...", type: "textarea" },
            { question: "Pourquoi personne n'a-t-il encore résolu ce problème ?", hint: "Barrières techniques, financières, réglementaires ?", placeholder: "Peut-être parce que...", type: "textarea" }
          ],
        estimatedMinutes: 20
      }
    ],
      checklist: [
        "J'ai identifié au moins 3 problèmes réels de ma cible",
        "J'ai analysé les solutions existantes sur le marché",
        "J'ai validé mes hypothèses auprès de personnes de ma cible",
        "J'ai repéré des opportunités concrètes"
      ],
      resources: [
        { title: "Comment mener un entretien exploratoire", type: "article" },
        { title: "Guide d'analyse des besoins clients", type: "article" }
      ],
    },
    3: {
      stepNumber: 3,
      title: "Comprendre le contexte (PESTEL)",
      objective: "Analyser les facteurs externes (Politique, Économique, Socioculturel, Technologique, Environnemental, Légal) qui influencent votre projet.",
      whyImportant: "Votre projet n'existe pas en vase clos. Les facteurs externes peuvent créer des opportunités ou des menaces. Les ignorer, c'est prendre le risque d'être surpris par des événements que vous auriez pu anticiper.",
      avantDeLire: {
        description: "L'analyse PESTEL est un outil stratégique qui vous aide à comprendre l'environnement dans lequel votre projet va évoluer. Pour chaque dimension, demandez-vous : quels sont les facteurs clés ? Et quel est leur impact sur mon projet ?",
        resultatsAttendus: "Une analyse complète des 6 dimensions PESTEL avec pour chacune les facteurs identifiés et leur impact potentiel sur votre projet.",
      },
      etudeDeCas: "Sophie a réalisé son PESTEL : Politique (soutien gouvernemental à l'agriculture locale), Économique (inflation qui pousse aux circuits courts), Socioculturel (prise de conscience écologique), Technologique (applications de mise en relation matures), Environnemental (urgence climatique favorable aux circuits courts), Légal (réglementations sur la vente alimentaire). Elle a ainsi identifié que le contexte était très favorable à son projet.",
      conseils: [
        "Ne vous limitez pas à une seule source d'information : croisez les données",
        "Pour chaque facteur, distinguez l'impact à court terme et à long terme",
        "Impliquez des personnes d'horizons différents pour enrichir l'analyse",
        "Mettez à jour votre analyse PESTEL régulièrement (au moins une fois par an)"
      ],
      keyConcepts: [
      { term: "Analyse PESTEL", definition: "Un outil d'analyse macro-environnementale qui examine six catégories de facteurs externes influençant une entreprise." },
      { term: "Facteurs clés", definition: "Les éléments spécifiques dans chaque dimension PESTEL qui ont un impact significatif sur votre projet." },
      { term: "Opportunités et menaces", definition: "Les facteurs externes positifs (opportunités) ou négatifs (menaces) que votre analyse PESTEL révèle." }
    ],
      estimatedMinutes: 55,
      subSections: [
      {
        key: "analyse_pestel",
        label: "Analyse PESTEL complète",
        objective: "Examiner chaque dimension PESTEL et son impact sur votre projet",
        whyImportant: "Une analyse PESTEL approfondie vous permet d'anticiper les évolutions de votre environnement et d'ajuster votre stratégie en conséquence.",
        tips: [
        "Commencez par les dimensions les plus pertinentes pour votre secteur",
        "Utilisez des sources fiables (INSEE, rapports ministériels, études de marché)",
        "Distinguer les tendances lourdes (certaines) des signaux faibles (incertains mais importants)"
      ],
        examples: [
        "Politique : subventions pour l'agriculture locale, objectifs de souveraineté alimentaire",
        "Technologique : démocratisation des plateformes de mise en relation, paiement mobile"
      ],
        guidedQuestions: [
            { question: "Analyse PESTEL de votre projet", hint: "Remplissez les 6 dimensions (Politique, Économique, Socioculturel, Technologique, Environnemental, Légal) avec les facteurs identifiés et leur impact sur votre projet.", type: "pestel_v2", key: "pestel_v2_data" }
          ],
        estimatedMinutes: 40
      },
      {
        key: "synthese_pestel",
        label: "Synthèse de l'analyse PESTEL",
        objective: "Tirer les enseignements principaux de votre analyse",
        whyImportant: "Une analyse sans synthèse n'a pas de valeur opérationnelle. L'objectif est d'identifier les implications concrètes pour votre projet.",
        tips: [
        "Identifiez les 3 facteurs les plus importants pour votre projet",
        "Distinguer les opportunités à saisir des menaces à anticiper",
        "Traduisez chaque conclusion en action concrète"
      ],
        examples: [
        "Opportunité : forte demande sociétale pour le local => argument marketing puissant",
        "Menace : inflation des coûts logistiques => optimiser la chaîne d'approvisionnement"
      ],
        guidedQuestions: [
            { question: "Quels sont les 3 facteurs PESTEL les plus importants pour votre projet ?", placeholder: "1. ... 2. ... 3. ...", type: "textarea" },
            { question: "Quelles opportunités pouvez-vous saisir ?", placeholder: "Je peux saisir l'opportunité de...", type: "textarea" },
            { question: "Quelles menaces devez-vous anticiper ?", placeholder: "Je dois anticiper...", type: "textarea" }
          ],
        estimatedMinutes: 15
      }
    ],
      checklist: [
        "J'ai analysé les 6 dimensions PESTEL",
        "J'ai identifié les facteurs clés pour chaque dimension",
        "J'ai évalué l'impact de chaque facteur sur mon projet",
        "J'ai synthétisé les opportunités et les menaces principales"
      ],
      resources: [
        { title: "Guide complet de l'analyse PESTEL", type: "article" },
        { title: "Sources de données macro-économiques - INSEE", type: "tool" }
      ],
    },
    4: {
      stepNumber: 4,
      title: "Fixez vos objectifs",
      objective: "Définir des objectifs clairs et mesurables pour votre projet, en utilisant la méthode SMART et en les alignant avec votre vision.",
      whyImportant: "Des objectifs bien définis sont votre boussole. Ils vous permettent de prendre des décisions cohérentes, de motiver votre équipe et de mesurer vos progrès. Sans objectifs, vous avancez sans direction.",
      avantDeLire: {
        description: "Fixer des objectifs, c'est transformer votre vision en cibles concrètes. Dans cette étape, vous allez définir des objectifs à court, moyen et long terme en utilisant la méthode SMART (Spécifique, Mesurable, Atteignable, Réaliste, Temporellement défini).",
        resultatsAttendus: "Une liste d'objectifs SMART à différents horizons temporels, alignés avec votre vision globale.",
      },
      etudeDeCas: "Sophie s'est fixé trois objectifs : (1) CT : Tester sa plateforme avec 10 producteurs et 50 consommateurs dans les 3 mois, (2) MT : Atteindre 100 producteurs et 1000 consommateurs en 1 an, (3) LT : Devenir la référence de la distribution locale dans sa région en 3 ans. Chaque objectif est SMART : spécifique, mesurable, atteignable, réaliste et temporellement défini.",
      conseils: [
        "Commencez par des objectifs à court terme : ils sont plus faciles à définir et motivants",
        "Impliquez votre équipe ou vos partenaires dans la définition des objectifs",
        "Révisez vos objectifs régulièrement : ils doivent évoluer avec votre projet",
        "Célébrez les petites victoires : chaque objectif atteint est un pas de plus"
      ],
      keyConcepts: [
      { term: "Objectif SMART", definition: "Un objectif Spécifique, Mesurable, Atteignable, Réaliste et Temporellement défini." },
      { term: "Court / Moyen / Long terme", definition: "Horizons temporels typiques : CT (< 6 mois), MT (6-24 mois), LT (> 24 mois)." },
      { term: "Alignement stratégique", definition: "La cohérence entre vos objectifs quotidiens, votre mission et votre vision à long terme." }
    ],
      estimatedMinutes: 40,
      subSections: [
      {
        key: "objectifs_ct",
        label: "Objectifs à court terme",
        objective: "Définir vos objectifs pour les 6 prochains mois",
        whyImportant: "Les objectifs à court terme créent une dynamique positive et vous permettent de valider rapidement vos hypothèses.",
        tips: [
        "Concentrez-vous sur l'essentiel : moins d'objectifs, mais tenus",
        "Chaque objectif doit avoir un responsable et une date butoir",
        "Prévoyez des indicateurs simples pour mesurer le progrès"
      ],
        examples: [
        "Lancer un MVP avec 10 producteurs partenaires d'ici 3 mois",
        "Réaliser 30 entretiens clients d'ici fin du mois"
      ],
        guidedQuestions: [
            { question: "Quels sont vos objectifs pour les 6 prochains mois ?", hint: "Soyez SMART : Spécifique, Mesurable, Atteignable, Réaliste, Temporel", placeholder: "Objectif 1 : d'ici [date], je veux [chiffre] [action]", type: "textarea" },
            { question: "Comment mesurerez-vous l'atteinte de ces objectifs ?", placeholder: "Je mesurerai par...", type: "textarea" }
          ],
        estimatedMinutes: 12
      },
      {
        key: "objectifs_mt",
        label: "Objectifs à moyen terme",
        objective: "Définir vos objectifs pour les 6 à 24 prochains mois",
        whyImportant: "Les objectifs à moyen terme relient vos actions quotidiennes à votre vision à long terme.",
        tips: [
        "Projetez-vous à 18-24 mois",
        "Ces objectifs doivent être ambitieux mais crédibles",
        "Ils doivent découler logiquement de vos objectifs CT"
      ],
        examples: [
        "Atteindre 100 producteurs et 1000 consommateurs d'ici 1 an",
        "Atteindre la rentabilité d'ici 18 mois"
      ],
        guidedQuestions: [
            { question: "Où voulez-vous être dans 1 à 2 ans ?", placeholder: "Dans 2 ans, j'aurai...", type: "textarea" },
            { question: "Quelles étapes clés devez-vous franchir pour y arriver ?", placeholder: "Les étapes clés sont...", type: "textarea" }
          ],
        estimatedMinutes: 10
      },
      {
        key: "objectifs_lt",
        label: "Objectifs à long terme",
        objective: "Définir votre vision à 3-5 ans",
        whyImportant: "Le long terme donne un cap à votre projet et vous aide à prendre des décisions cohérentes aujourd'hui.",
        tips: [
        "Imaginez l'impact que vous voulez avoir sur le monde",
        "Ces objectifs peuvent être plus qualitatifs",
        "Ils doivent vous motiver et inspirer votre équipe"
      ],
        examples: [
        "Devenir la référence de la distribution locale dans toute la région",
        "Créer un impact mesurable sur la réduction du gaspillage alimentaire"
      ],
        guidedQuestions: [
            { question: "Quelle est votre ambition à 3-5 ans ?", placeholder: "Dans 5 ans, mon projet aura...", type: "textarea" },
            { question: "Quel impact voulez-vous avoir sur le monde ?", placeholder: "Je veux contribuer à...", type: "textarea" }
          ],
        estimatedMinutes: 10
      },
      {
        key: "alignement_objectifs",
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
      objective: "Formuler la mission (ce que vous faites aujourd'hui) et la vision (ce que vous voulez devenir) de votre projet.",
      whyImportant: "Mission et vision sont le cœur de votre projet. Elles communiquent votre raison d'être, inspirent votre équipe, attirent vos partenaires et guident vos décisions stratégiques.",
      avantDeLire: {
        description: "La mission répond à la question « Pourquoi notre entreprise existe-t-elle ? » tandis que la vision répond à « Quel monde voulons-nous créer ? ». Prenez le temps de formuler ces deux énoncés : ils vous accompagneront tout au long de votre aventure entrepreneuriale.",
        resultatsAttendus: "Un énoncé de mission clair et inspirant, et une vision ambitieuse qui définit votre impact à long terme.",
      },
      etudeDeCas: "Sophie a formulé sa mission : « Connecter producteurs locaux et consommateurs urbains pour une alimentation plus durable et accessible. » Sa vision : « Un monde où chaque repas contribue à une économie locale prospère et à une planète en meilleure santé. » Ces énoncés l'aident à communiquer son projet et à prendre des décisions cohérentes.",
      conseils: [
        "Soyez authentique : votre mission doit refléter vos vraies valeurs",
        "Une bonne mission tient en une phrase (parfois deux)",
        "Testez vos énoncés auprès de votre entourage : que comprennent-ils ?",
        "Votre vision doit être ambitieuse mais pas irréaliste"
      ],
      keyConcepts: [
      { term: "Mission", definition: "La raison d'être de votre entreprise aujourd'hui : ce que vous faites, pour qui et pourquoi." },
      { term: "Vision", definition: "La situation idéale que vous voulez créer dans le futur : l'impact que vous souhaitez avoir sur le monde." },
      { term: "Valeurs", definition: "Les principes fondamentaux qui guident vos actions et vos décisions en tant qu'entreprise." }
    ],
      estimatedMinutes: 35,
      subSections: [
      {
        key: "mission",
        label: "Énoncé de mission",
        objective: "Formuler la mission de votre projet",
        whyImportant: "La mission est votre raison d'être. Elle donne du sens à votre travail et attire les personnes qui partagent vos valeurs.",
        tips: [
        "Structure : « Nous existons pour [action] afin de [impact] »",
        "Soyez précis sur ce que vous faites et pour qui",
        "Évitez le jargon : une mission doit être comprise par tous"
      ],
        examples: [
        "« Connecter producteurs locaux et consommateurs urbains pour une alimentation plus durable et accessible. »"
      ],
        guidedQuestions: [
            { question: "Quelle est la raison d'être de votre projet ?", hint: "Pourquoi votre projet existe-t-il ? Quel problème résout-il ?", placeholder: "Mon projet existe pour...", type: "textarea" },
            { question: "À qui profite votre projet ?", placeholder: "Mon projet profite à...", type: "text" },
            { question: "Quelle est votre mission en une phrase ?", placeholder: "Notre mission est de...", type: "text" }
          ],
        estimatedMinutes: 15
      },
      {
        key: "vision",
        label: "Énoncé de vision",
        objective: "Formuler la vision à long terme de votre projet",
        whyImportant: "La vision est votre étoile polaire. Elle vous motive dans les moments difficiles et inspire votre entourage à vous rejoindre.",
        tips: [
        "Imaginez le monde idéal que vous voulez créer",
        "Soyez ambitieux mais concret",
        "Une bonne vision donne envie de participer à l'aventure"
      ],
        examples: [
        "« Un monde où chaque repas contribue à une économie locale prospère et à une planète en meilleure santé. »"
      ],
        guidedQuestions: [
            { question: "Quel est le monde idéal que vous voulez créer ?", placeholder: "J'imagine un monde où...", type: "textarea" },
            { question: "Quel impact voulez-vous avoir sur la société ou l'environnement ?", placeholder: "Je veux avoir un impact sur...", type: "textarea" },
            { question: "Quelle est votre vision en une phrase ?", placeholder: "Ma vision est...", type: "text" }
          ],
        estimatedMinutes: 15
      },
      {
        key: "valeurs",
        label: "Valeurs fondamentales",
        objective: "Identifier les valeurs qui guideront votre projet",
        whyImportant: "Les valeurs sont le cadre de référence pour toutes vos décisions. Elles définissent votre culture d'entreprise et votre identité.",
        tips: [
        "Choisissez 3 à 5 valeurs maximum",
        "Chaque valeur doit se traduire par des comportements concrets",
        "Impliquez votre équipe dans le choix des valeurs"
      ],
        examples: [
        "Authenticité, Durabilité, Proximité, Transparence, Innovation responsable"
      ],
        guidedQuestions: [
            { question: "Quelles sont les valeurs les plus importantes pour votre projet ?", placeholder: "Mes valeurs sont...", type: "text" },
            { question: "Comment ces valeurs se traduiront-elles dans votre quotidien ?", placeholder: "La valeur [X] se traduira par...", type: "textarea" }
          ],
        estimatedMinutes: 5
      }
    ],
      checklist: [
        "J'ai formulé un énoncé de mission clair",
        "J'ai formulé une vision inspirante",
        "J'ai identifié mes valeurs fondamentales",
        "Mes énoncés sont compréhensibles par une personne extérieure"
      ],
      resources: [
        { title: "Comment rédiger une mission et une vision percutantes", type: "article" },
        { title: "Exemples de mission et vision d'entreprises à impact", type: "article" }
      ],
    },
    6: {
      stepNumber: 6,
      title: "Résumé du contexte et des objectifs",
      objective: "Synthétiser l'ensemble des analyses précédentes (problèmes, PESTEL, objectifs, mission, vision) en un résumé cohérent.",
      whyImportant: "Un résumé clair vous permet d'avoir une vue d'ensemble de votre projet et de communiquer efficacement avec vos parties prenantes. C'est aussi un point de référence pour la suite du parcours.",
      avantDeLire: {
        description: "Cette étape de synthèse est cruciale. Vous allez rassembler tout ce que vous avez appris et décidé jusqu'à présent pour créer un document de référence. Ce résumé vous servira de fil conducteur pour les étapes suivantes.",
        resultatsAttendus: "Un document de synthèse reprenant votre contexte, vos objectifs, votre mission et votre vision, prêt à être partagé.",
      },
      etudeDeCas: "Sophie a rédigé une fiche de synthèse : « Relocal connecte producteurs locaux et consommateurs urbains pour réduire le gaspillage alimentaire. Contexte favorable (PESTEL). Objectifs : test 10/50 en 3 mois, 100/1000 en 1 an, référence régionale en 3 ans. Mission et vision définies. » Elle utilise cette fiche pour présenter son projet à des partenaires potentiels.",
      conseils: [
        "Faites relire votre résumé par quelqu'un qui ne connaît pas votre projet",
        "Gardez votre résumé à jour : il évoluera avec votre projet",
        "Utilisez-le comme support de présentation rapide (elevator pitch)",
        "Conservez une copie physique et numérique"
      ],
      keyConcepts: [
      { term: "Synthèse stratégique", definition: "Un document concis qui rassemble les éléments clés de votre analyse et de votre stratégie." },
      { term: "Elevator pitch", definition: "Une présentation ultra-courte (30-60 secondes) de votre projet, comme si vous étiez dans un ascenseur." },
      { term: "Cohérence stratégique", definition: "L'alignement logique entre votre analyse, vos objectifs, votre mission et votre vision." }
    ],
      estimatedMinutes: 30,
      subSections: [
      {
        key: "resume_contexte",
        label: "Résumé du contexte",
        objective: "Synthétiser votre analyse du contexte et des problèmes identifiés",
        whyImportant: "Un résumé clair du contexte permet à toute personne de comprendre rapidement les fondements de votre projet.",
        tips: [
        "Restez concis : 5 à 10 lignes maximum",
        "N'incluez que l'essentiel",
        "Utilisez un langage simple et direct"
      ],
        guidedQuestions: [
            { question: "Résumez le contexte de votre projet en 5 à 10 lignes", hint: "Problème identifié, opportunité, contexte PESTEL", placeholder: "Mon projet s'inscrit dans un contexte où...", type: "textarea" },
            { question: "Quel est le problème principal que vous résolvez ?", placeholder: "Le problème principal est...", type: "text" }
          ],
        estimatedMinutes: 10
      },
      {
        key: "resume_objectifs",
        label: "Résumé des objectifs",
        objective: "Synthétiser vos objectifs SMART",
        whyImportant: "Avoir une vue claire de vos objectifs vous permet de prioriser vos actions et de mesurer vos progrès.",
        tips: [
        "Listez vos objectifs par horizon temporel",
        "Un objectif = une ligne",
        "Ajoutez une date butoir pour chaque objectif"
      ],
        guidedQuestions: [
            { question: "Quels sont vos objectifs clés résumés ?", placeholder: "CT : ... MT : ... LT : ...", type: "textarea" },
            { question: "Comment saurez-vous que vous avez réussi ?", placeholder: "Je saurai que j'ai réussi quand...", type: "textarea" }
          ],
        estimatedMinutes: 10
      },
      {
        key: "resume_mission_vision",
        label: "Mission, vision et valeurs",
        objective: "Rassembler vos énoncés de mission, vision et valeurs",
        whyImportant: "Ces énoncés sont l'identité de votre projet. Les avoir tous au même endroit facilite leur communication.",
        tips: [
        "Mission et vision doivent tenir sur un post-it",
        "Vos valeurs doivent être mémorables",
        "Testez votre pitch auprès de 3 personnes"
      ],
        guidedQuestions: [
            { question: "Quelle est votre mission ?", placeholder: "Notre mission est...", type: "text" },
            { question: "Quelle est votre vision ?", placeholder: "Notre vision est...", type: "text" },
            { question: "Quelles sont vos valeurs ?", placeholder: "Nos valeurs sont...", type: "text" },
            { question: "Rédigez votre elevator pitch", hint: "30 secondes pour convaincre", placeholder: "Imaginez que vous êtes dans un ascenseur avec un investisseur...", type: "textarea" }
          ],
        estimatedMinutes: 10
      }
    ],
      checklist: [
        "J'ai rédigé un résumé clair du contexte de mon projet",
        "J'ai synthétisé mes objectifs par horizon temporel",
        "J'ai rassemblé ma mission, ma vision et mes valeurs",
        "J'ai un elevator pitch prêt à être partagé"
      ],
      resources: [
        { title: "Comment rédiger un elevator pitch percutant", type: "article" }
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
      etudeDeCas: "Sophie a identifié ses parties prenantes : producteurs locaux (influence forte, impact fort), consommateurs urbains (influence moyenne, impact fort), mairies (influence moyenne, impact moyen), associations environnementales (influence faible, impact moyen), investisseurs (influence forte, impact faible). Pour chacune, elle a noté les actions à mener : contacter la mairie pour un partenariat, rencontrer des associations pour des recommandations.",
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
      etudeDeCas: "Sophie a identifié 3 segments : (1) Consommateurs urbains responsables : veulent acheter local mais manquent de temps et d'information, (2) Producteurs locaux : cherchent à commercialiser leurs produits sans intermédiaires coûteux, (3) Restaurants et cantines : veulent sourcer des produits locaux de façon fiable. Chaque segment a des pains, gains et jobs spécifiques.",
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
      etudeDeCas: "Pour son segment prioritaire (consommateurs urbains), Sophie a conçu : Produits (plateforme web + app mobile), Soulagement des douleurs (gain de temps, information centralisée, livraison flexible), Créateurs de gains (produits frais, traçabilité, impact local mesuré). Elle ajoute la valeur environnementale (réduction du gaspillage) et sociale (soutien aux producteurs locaux).",
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
      etudeDeCas: "Sophie a créé une fiche de découverte pour tester l'hypothèse : « Les consommateurs urbains sont prêts à utiliser une plateforme pour acheter des produits locaux. » Elle a réalisé 5 entretiens. Résultat : 4 personnes sur 5 sont très intéressées. Insight : le prix est un facteur clé. Action : inclure une comparaison de prix dans la plateforme.",
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
      etudeDeCas: "Les tests de Sophie ont montré que les consommateurs sont intéressés mais que la livraison est un frein majeur (coût et logistique). Elle a deux options : itérer (trouver un partenariat logistique) ou pivoter (passer d'une plateforme de vente à une plateforme de mise en relation sans transaction). Elle choisit d'itérer en intégrant un service de livraison mutualisée.",
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
      etudeDeCas: "Sophie a défini : Relations clients (acquisition via réseaux sociaux et bouche-à-oreille, fidélisation via newsletter et programme de parrainage, service client via chat intégré), Canaux (plateforme web, application mobile, points de retrait chez les producteurs), Parcours client (découverte via Instagram, inscription sur la plateforme, première commande, livraison ou retrait, évaluation et partage).",
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
      etudeDeCas: "Sophie a identifié ses activités clés : développement et maintenance de la plateforme, gestion des relations producteurs, marketing et acquisition d'utilisateurs, logistique et livraison. Ses ressources principales : développeur web (humain), investissement initial de 50 000€ (financier), locaux partagés (physique), algorithme de matching (intellectuel).",
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
      etudeDeCas: "Sophie a identifié les impacts de sa plateforme : consommation électrique des serveurs, déchets d'emballages, émissions de la livraison. Elle a planifié des actions : serveurs verts (alimentés en énergie renouvelable), emballages recyclables, livraison mutualisée à vélo dans les villes, incitations aux producteurs pour des pratiques durables.",
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
      etudeDeCas: "Sophie a créé une fiche de synthèse : « Relocal - Plateforme connectant producteurs locaux et consommateurs urbains. Segments : consommateurs responsables, producteurs locaux, restaurants. Proposition de valeur : accès simplifié aux produits locaux avec livraison mutualisée. Parties prenantes clés : producteurs, mairies, associations. Activités : développement plateforme, relation producteurs, logistique. Impact environnemental mesuré et plan d'actions défini. »",
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
      etudeDeCas: "Sophie a listé ses coûts : Fixes (développeur 45k€/an, serveurs 3 600€/an, loyer 12 000€/an, assurances 2 400€/an) = 63 000€/an. Variables (commission aux producteurs 30%, frais de livraison 5€/commande, marketing 0,50€/acquisition) à ajuster selon le volume. Coût fixe total : environ 5 250€/mois.",
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
      etudeDeCas: "Sophie a défini ses sources de revenus : Commission de 15% sur chaque vente via la plateforme, Abonnement premium pour les producteurs (29,90€/mois pour des fonctionnalités avancées), Publicité ciblée (produits locaux). Prix : gratuits pour les consommateurs, commission pour les producteurs. Projection : objectif de 500 commandes/mois à 25€ de panier moyen = 1 875€/mois de commission en année 1.",
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
      etudeDeCas: "Sophie a résumé : Coût fixe mensuel : 5 250€. Seuil de rentabilité : 350 commandes/mois (panier moyen 25€, commission 15%). Revenu mensuel à 500 commandes : 1 875€. Besoin de financement initial : 50 000€ (développement + 6 mois de trésorerie). Marge brute : 15% du prix de vente.",
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
      etudeDeCas: "Sophie prépare son test MVP : Objectif : valider que 50 consommateurs utilisent la plateforme pour commander chez 10 producteurs. Méthode : MVP fonctionnel pendant 1 mois. Participants : 10 producteurs partenaires, 50 consommateurs ciblés via Instagram. Critères de succès : 30 commandes minimum, 80% de satisfaction. Calendrier : développement 2 semaines, test 1 mois, analyse 1 semaine.",
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
      etudeDeCas: "Sophie a défini ses KPIs : Financiers (CA mensuel, marge brute, trésorerie), Clients (nombre d'utilisateurs actifs, taux de rétention à 30 jours, NPS), Impact (tonnes de CO2 évitées, producteurs référencés, % de produits locaux), Opérationnels (nombre de commandes/jour, temps de livraison moyen, taux de disponibilité plateforme). Objectifs à 6 mois : 500 utilisateurs actifs, 30 producteurs, NPS > 40.",
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
