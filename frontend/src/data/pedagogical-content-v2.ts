import {
  GuidedQuestion,
  SubSectionContent,
  StepPedagogicalContent,
} from './pedagogical-content';

export const STEP_PEDAGOGICAL_CONTENT_V2: Record<number, StepPedagogicalContent> = {
  1: {
    stepNumber: 1,
    title: "Esquisser l'idée d'entreprise",
    objective: "Définir les contours de votre projet en clarifiant l'idée, le secteur d'activité et l'inspiration qui vous anime.",
    whyImportant: "Une idée bien esquissée est le socle de tout le parcours entrepreneurial. Prendre le temps de la clarifier maintenant vous évitera des erreurs stratégiques coûteuses plus tard.",
    keyConcepts: [
      { term: "Idée d'entreprise", definition: "Le concept de base de ce que vous voulez créer, sans être encore un business model détaillé." },
      { term: "Secteur d'activité", definition: "Le domaine économique dans lequel vous allez exercer (ex: agriculture, numérique, services)." },
      { term: "Proposition de valeur", definition: "La promesse de valeur que vous ferez à vos futurs clients." },
    ],
    estimatedMinutes: 40,
    subSections: [
      {
        key: 'nom_provisoire', label: 'Nom provisoire du projet', objective: 'Trouver un nom temporaire pour votre projet',
        whyImportant: 'Le nom est la première identité de votre projet. Même provisoire, il vous aide à incarner votre idée et à en parler autour de vous.',
        tips: ['Choisissez un nom simple, facile à retenir et à prononcer', 'Évitez les noms trop génériques ou déjà utilisés', 'Testez-le verbalement auprès de votre entourage'],
        examples: ['« EcoVoyage » pour un projet de tourisme durable', '« SantéConnect » pour une plateforme de téléconsultation'],
        guidedQuestions: [
          { question: 'Quel nom provisoire donnez-vous à votre projet ?', hint: 'Vous pourrez le changer plus tard', placeholder: 'ex: MonProjet', type: 'text' },
          { question: 'Pourquoi ce nom vous semble-t-il approprié ?', placeholder: 'expliquez votre choix...', type: 'text' },
        ],
        estimatedMinutes: 5,
      },
      {
        key: 'description_idee', label: "Description de l'idée", objective: "Décrire votre idée de façon claire et concise",
        whyImportant: "Une description claire vous permet de partager votre vision facilement et d'obtenir des retours utiles.",
        tips: ['Commencez par le problème que vous voulez résoudre', 'Expliquez votre solution en une phrase', 'Terminez par l\'impact que vous souhaitez avoir'],
        examples: ['Mon projet est une plateforme web qui connecte les producteurs locaux avec les consommateurs pour réduire le gaspillage alimentaire.'],
        guidedQuestions: [
          { question: "Décrivez votre idée en 5 à 10 lignes", hint: 'Imaginez que vous la présentez à un inconnu', placeholder: "Mon idée consiste à...", type: 'textarea' },
          { question: "Quel est le concept central en une phrase ?", placeholder: "ex: Une plateforme de...", type: 'text' },
        ],
        estimatedMinutes: 10,
      },
      {
        key: 'inspiration', label: 'Inspiration et origine du projet', objective: "Expliquer ce qui vous a poussé à créer ce projet",
        whyImportant: "Votre histoire personnelle donne du sens à votre projet et constitue un moteur puissant dans les moments difficiles.",
        tips: ['Racontez une expérience personnelle qui a déclenché l\'idée', 'Citez des personnes ou des situations qui vous ont inspiré', 'Soyez authentique : les histoires vraies touchent les gens'],
        examples: ['Après avoir vu un documentaire sur la pollution plastique, j\'ai eu envie de créer une alternative aux emballages jetables.'],
        guidedQuestions: [
          { question: "Qu'est-ce qui vous a inspiré à créer ce projet ?", placeholder: "Mon inspiration vient de...", type: 'textarea' },
          { question: "Y a-t-il une expérience personnelle à l'origine de cette idée ?", placeholder: "racontez votre histoire...", type: 'textarea' },
        ],
        estimatedMinutes: 10,
      },
      {
        key: 'secteur_activite', label: "Secteur d'activité", objective: "Identifier le ou les secteurs d'activité de votre projet",
        whyImportant: "Le secteur d'activité détermine les règles, les obligations légales et les opportunités de votre projet.",
        tips: ['Identifiez le secteur principal (ex: agriculture, numérique, services)', 'Certains projets sont transverses : notez tous les secteurs concernés', 'Renseignez-vous sur les spécificités réglementaires de votre secteur'],
        examples: ['Secteur principal : tourisme. Sous-secteur : hébergement écoresponsable.'],
        guidedQuestions: [
          { question: "Dans quel(s) secteur(s) d'activité vous situez-vous ?", placeholder: "ex: agriculture, numérique, artisanat, services...", type: 'text' },
          { question: "Y a-t-il des réglementations spécifiques à connaître dans ce secteur ?", hint: 'Agréments, diplômes, normes...', placeholder: "ex: certification bio, agrément sanitaire...", type: 'textarea' },
        ],
        estimatedMinutes: 15,
      },
    ],
    checklist: ["J'ai un nom provisoire pour mon projet", "Je peux décrire mon idée en 5 lignes", "J'ai identifié l'origine et l'inspiration de mon projet", "J'ai défini mon secteur d'activité"],
  },

  2: {
    stepNumber: 2,
    title: "Identifier les problèmes et les besoins",
    objective: "Analyser en profondeur les problèmes, besoins et frustrations de vos futurs clients pour construire une solution pertinente.",
    whyImportant: "Les projets qui échouent le plus souvent sont ceux qui résolvent un problème que personne n'a. Une bonne identification des besoins réduit considérablement ce risque.",
    keyConcepts: [
      { term: "Problème douloureux", definition: "Un besoin non satisfait ou une difficulté réelle qui pousse à chercher une solution." },
      { term: "Besoin utilisateur", definition: "Ce dont le client a réellement besoin, pas nécessairement ce qu'il dit vouloir." },
      { term: "Alternative existante", definition: "Comment vos clients potentiels résolvent leur problème aujourd'hui, avant votre solution." },
    ],
    estimatedMinutes: 50,
    subSections: [
      {
        key: 'probleme_principal', label: 'Problème principal identifié', objective: 'Définir le problème central que votre projet résout',
        whyImportant: 'Un problème bien défini est la moitié de la solution. Plus vous êtes précis, plus votre réponse sera pertinente.',
        tips: ['Un bon problème est spécifique et mesurable', 'Distinguer le problème de ses symptômes', 'Validez que ce problème est partagé par plusieurs personnes'],
        examples: ['Les petits producteurs n\'ont pas accès à un réseau de distribution rentable et perdent 30% de leur production.'],
        guidedQuestions: [
          { question: "Quel est le problème principal que vous résolvez ?", placeholder: "Le problème central est...", type: 'textarea' },
          { question: "Depuis combien de temps ce problème existe-t-il ?", hint: "Un problème ancien = un marché mature avec des solutions établies", placeholder: "ex: Depuis toujours / Apparu récemment", type: 'text' },
          { question: "Quelle est la fréquence de ce problème ?", type: 'select', options: [{ label: 'Quotidienne', value: 'daily' }, { label: 'Hebdomadaire', value: 'weekly' }, { label: 'Mensuelle', value: 'monthly' }, { label: 'Occasionnelle', value: 'occasional' }] },
        ],
        estimatedMinutes: 12,
      },
      {
        key: 'besoins_utilisateurs', label: "Besoins des utilisateurs", objective: "Comprendre ce dont vos clients ont réellement besoin",
        whyImportant: "Les clients n'achètent pas un produit, ils achètent la solution à un besoin. Comprendre le vrai besoin est essentiel.",
        tips: ["Distinguer besoin exprimé (ce qu'ils disent) et besoin latent (ce dont ils ont vraiment besoin)", "Posez la question 'Pourquoi ?' plusieurs fois pour creuser", "Observez les comportements, pas seulement les paroles"],
        examples: ["Les clients disent vouloir 'des produits bio' mais leur vrai besoin est 'manger sainement sans y consacrer trop de temps'."],
        guidedQuestions: [
          { question: "Quels sont les principaux besoins de vos futurs clients ?", placeholder: "Besoins identifiés...", type: 'textarea' },
          { question: "Comment ces besoins sont-ils exprimés par vos clients ?", hint: "Ce qu'ils disent vs ce dont ils ont vraiment besoin", placeholder: "Besoins exprimés et besoins latents...", type: 'textarea' },
        ],
        estimatedMinutes: 13,
      },
      {
        key: 'douleur_client', label: "Douleur du client", objective: "Identifier les frustrations et difficultés rencontrées par vos clients",
        whyImportant: "La 'douleur' est ce qui motive le changement. Plus elle est forte, plus vos clients seront prêts à adopter votre solution.",
        tips: ['Quantifiez la douleur : en temps perdu, en argent, en frustration', 'Plus la douleur est forte, plus le client est prêt à payer', 'Une douleur quotidienne est plus motivante qu\'une douleur annuelle'],
        examples: ['Perte de 2h par jour à chercher des produits locaux = frustration quotidienne forte.'],
        guidedQuestions: [
          { question: "Quelles sont les principales frustrations de vos clients ?", placeholder: "Frustrations identifiées...", type: 'textarea' },
          { question: "Que coûte ce problème à vos clients (temps, argent, stress) ?", placeholder: "Coût estimé...", type: 'textarea' },
        ],
        estimatedMinutes: 13,
      },
      {
        key: 'alternatives_actuelles', label: "Alternatives actuelles", objective: "Analyser comment le problème est résolu aujourd'hui",
        whyImportant: "Vos clients potentiels ne vivent pas dans le vide : ils ont déjà des solutions, même imparfaites. Les connaître vous permet de vous différencier.",
        tips: ['Listez toutes les alternatives : solutions payantes, gratuites, artisanales', 'Identifiez ce qui manque à chaque alternative', 'Votre opportunité est dans ce qu\'elles ne résolvent pas'],
        examples: ["Alternative 1 : Aller au marché (chronophage). Alternative 2 : Supermarché (pas local). Alternative 3 : Drive fermier (choix limité)."],
        guidedQuestions: [
          { question: "Comment vos clients résolvent-ils leur problème aujourd'hui ?", placeholder: "Solutions actuelles...", type: 'textarea' },
          { question: "Qu'est-ce qui manque ou ne satisfait pas dans ces alternatives ?", placeholder: "Insatisfactions...", type: 'textarea' },
        ],
        estimatedMinutes: 12,
      },
    ],
    checklist: ["J'ai identifié un problème principal clair", "J'ai compris les besoins profonds de mes clients", "J'ai listé les frustrations de mes clients", "J'ai analysé les alternatives existantes"],
  },

  3: {
    stepNumber: 3,
    title: "Comprendre le contexte",
    objective: "Analyser l'environnement interne et externe de votre projet pour anticiper les opportunités et les menaces.",
    whyImportant: "Un projet ne naît pas dans le vide. Comprendre le contexte (marché, tendances, concurrence) est essentiel pour positionner votre offre et anticiper les risques.",
    keyConcepts: [
      { term: "SWOT", definition: "Analyse des Forces (Strengths), Faiblesses (Weaknesses), Opportunités (Opportunities) et Menaces (Threats)." },
      { term: "PESTEL", definition: "Analyse macro-environnementale couvrant les dimensions Politique, Économique, Social, Technologique, Environnemental et Légal." },
      { term: "Environnement concurrentiel", definition: "L'ensemble des acteurs qui proposent des solutions alternatives à la vôtre sur le marché." },
    ],
    estimatedMinutes: 70,
    subSections: [
      {
        key: 'swot_v2', label: 'Analyse SWOT', objective: 'Évaluer les forces, faiblesses, opportunités et menaces de votre projet',
        whyImportant: "Le SWOT est l'outil stratégique le plus utilisé. Il offre une vision synthétique de votre positionnement.",
        tips: ["Soyez honnête sur vos faiblesses : c'est le seul moyen de les corriger", "Les opportunités et menaces sont externes (hors de votre contrôle)", "Utilisez le SWOT pour prendre des décisions concrètes"],
        examples: ["Force : équipe passionnée et expérimentée. Faiblesse : manque de trésorerie. Opportunité : forte demande pour le bio. Menace : inflation alimentaire."],
        guidedQuestions: [
          {
            question: 'Forces', hint: "Quels sont vos atouts internes ?", placeholder: "Nos forces...",
            type: 'swot', subQuestions: [
              { question: "Quelles compétences clés possédez-vous ?", type: 'text' },
              { question: "Quelles ressources uniques avez-vous ?", type: 'text' },
              { question: "Qu'est-ce que vous faites mieux que les autres ?", type: 'text' },
            ]
          },
          {
            question: 'Faiblesses', hint: "Soyez honnête pour progresser", placeholder: "Nos faiblesses...",
            type: 'swot', subQuestions: [
              { question: "Quelles compétences vous manquent ?", type: 'text' },
              { question: "Quelles ressources sont insuffisantes ?", type: 'text' },
              { question: "Que font mieux vos concurrents que vous ?", type: 'text' },
            ]
          },
          {
            question: 'Opportunités', hint: "Facteurs externes positifs", placeholder: "Opportunités...",
            type: 'swot', subQuestions: [
              { question: "Quelles tendances du marché pouvez-vous exploiter ?", type: 'text' },
              { question: "Y a-t-il des évolutions réglementaires favorables ?", type: 'text' },
              { question: "Quels segments de clientèle sont mal desservis ?", type: 'text' },
            ]
          },
          {
            question: 'Menaces', hint: "Facteurs externes négatifs", placeholder: "Menaces...",
            type: 'swot', subQuestions: [
              { question: "Quels concurrents représentent une menace ?", type: 'text' },
              { question: "Quelles évolutions du marché pourraient vous nuire ?", type: 'text' },
              { question: "Y a-t-il des risques réglementaires ou économiques ?", type: 'text' },
            ]
          },
        ],
        estimatedMinutes: 20,
      },
      {
        key: 'pestel_v2', label: 'Analyse PESTEL', objective: "Analyser les facteurs macro-environnementaux qui impactent votre projet",
        whyImportant: "L'environnement macro-économique influence directement ou indirectement votre projet. Un bon entrepreneur anticipe ces changements.",
        tips: ["Chaque dimension compte : ne négligez aucune", "Un même facteur peut être une opportunité ET une menace", "Restez factuel : appuyez-vous sur des sources fiables"],
        examples: ["Politique : plan de relance pour la transition écologique. Économique : inflation impactant le pouvoir d'achat. Social : demande croissante de sens au travail."],
        guidedQuestions: [
          {
            question: 'Politique', hint: "Lois, réglementations, subventions",
            type: 'pestel', subQuestions: [
              { question: "Quelles politiques publiques impactent votre secteur ?", type: 'text' },
              { question: "Y a-t-il des aides ou subventions disponibles ?", type: 'text' },
              { question: "La stabilité politique est-elle un facteur clé ?", type: 'text' },
            ]
          },
          {
            question: 'Économique', hint: "Croissance, inflation, emploi",
            type: 'pestel', subQuestions: [
              { question: "Quelle est la conjoncture économique actuelle ?", type: 'text' },
              { question: "Comment évolue le pouvoir d'achat de vos clients ?", type: 'text' },
              { question: "Les taux d'intérêt affectent-ils votre financement ?", type: 'text' },
            ]
          },
          {
            question: 'Socioculturel', hint: "Tendances sociales, démographie, valeurs",
            type: 'pestel', subQuestions: [
              { question: "Quelles tendances sociétales sont favorables à votre projet ?", type: 'text' },
              { question: "Les comportements de consommation évoluent-ils dans votre sens ?", type: 'text' },
              { question: "Quels facteurs démographiques sont importants ?", type: 'text' },
            ]
          },
          {
            question: 'Technologique', hint: "Innovations, digitalisation, R&D",
            type: 'pestel', subQuestions: [
              { question: "Quelles technologies impactent votre secteur ?", type: 'text' },
              { question: "L'innovation est-elle rapide dans votre domaine ?", type: 'text' },
              { question: "Avez-vous des besoins technologiques spécifiques ?", type: 'text' },
            ]
          },
          {
            question: 'Environnemental', hint: "Écologie, réglementation verte, RSE",
            type: 'pestel', subQuestions: [
              { question: "Quel est l'impact environnemental de votre activité ?", type: 'text' },
              { question: "Les réglementations écologiques vous impactent-elles ?", type: 'text' },
              { question: "Pouvez-vous faire de l'écologie un avantage concurrentiel ?", type: 'text' },
            ]
          },
          {
            question: 'Légal', hint: "Droit des affaires, propriété intellectuelle",
            type: 'pestel', subQuestions: [
              { question: "Quelles sont les obligations légales de votre secteur ?", type: 'text' },
              { question: "Avez-vous besoin de protéger votre propriété intellectuelle ?", type: 'text' },
              { question: "Quelles normes devez-vous respecter ?", type: 'text' },
            ]
          },
        ],
        estimatedMinutes: 20,
      },
      {
        key: 'tendances_marche', label: "Tendances du marché", objective: "Identifier les grandes tendances qui influencent votre secteur",
        whyImportant: "Surfer sur une tendance portante peut considérablement accélérer votre croissance. À l'inverse, un projet contre-tendance aura du mal à décoller.",
        tips: ['Distinguer les tendances durables des effets de mode', 'Utilisez Google Trends, les rapports sectoriels', 'Une tendance forte = un marché qui grandit'],
        examples: ["Tendance 1 : consommation locale et circuits courts. Tendance 2 : digitalisation des services. Tendance 3 : quête de sens et RSE."],
        guidedQuestions: [
          { question: "Quelles sont les 3 grandes tendances de votre marché ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
          { question: "Comment votre projet s'inscrit-il dans ces tendances ?", placeholder: "Mon projet capitalise sur...", type: 'textarea' },
        ],
        estimatedMinutes: 15,
      },
      {
        key: 'environnement_concurrentiel', label: "Environnement concurrentiel", objective: "Cartographier vos concurrents directs et indirects",
        whyImportant: "Connaître ses concurrents permet de se différencier efficacement et d'éviter leurs erreurs.",
        tips: ['Analysez 3 à 5 concurrents minimum', 'Ne vous limitez pas aux concurrents directs', 'Identifiez leur avantage concurrentiel et leurs faiblesses'],
        examples: ["Concurrent direct : une autre plateforme de mise en relation. Concurrent indirect : les marchés physiques. Substitut : la vente directe à la ferme."],
        guidedQuestions: [
          { question: "Qui sont vos 3 principaux concurrents ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
          { question: "Quels sont leurs points forts et leurs points faibles ?", placeholder: "Concurrent 1 : forces... faiblesses...", type: 'textarea' },
          { question: "Quelle sera votre différence concurrentielle ?", placeholder: "Notre différence...", type: 'textarea' },
        ],
        estimatedMinutes: 15,
      },
    ],
    checklist: ["J'ai réalisé une analyse SWOT complète", "J'ai réalisé une analyse PESTEL détaillée", "J'ai identifié les tendances clés du marché", "J'ai cartographié mon environnement concurrentiel"],
  },

  4: {
    stepNumber: 4,
    title: "Définir les objectifs",
    objective: "Fixer des objectifs clairs et mesurables à court, moyen et long terme pour guider votre projet.",
    whyImportant: "Des objectifs bien définis sont votre boussole. Ils vous permettent de rester focus, de mesurer votre progression et de communiquer votre vision.",
    keyConcepts: [
      { term: "Objectif SMART", definition: "Spécifique, Mesurable, Atteignable, Réaliste et Temporellement défini." },
      { term: "Court terme", definition: "Objectifs à 3-6 mois, les premières étapes concrètes de votre projet." },
      { term: "Long terme", definition: "Vision à 3-5 ans, la destination finale que vous visez." },
    ],
    estimatedMinutes: 45,
    subSections: [
      {
        key: 'objectifs_court_terme', label: "Objectifs à court terme (3-6 mois)", objective: "Définir les premières étapes concrètes de votre projet",
        whyImportant: "Les objectifs court terme transforment votre vision en actions immédiates. Sans eux, on remet toujours à demain.",
        tips: ["Fixez-vous des objectifs que vous pouvez atteindre dans les 3-6 mois", "Priorisez : qu'est-ce qui est VRAIMENT important maintenant ?", "Chaque objectif doit avoir une date butoir précise"],
        examples: ["Dans 3 mois : finaliser le prototype et le tester auprès de 10 utilisateurs. Dans 6 mois : premier client payant."],
        guidedQuestions: [
          { question: "Quel est votre objectif principal à 3 mois ?", placeholder: "ex: Finaliser le MVP", type: 'text' },
          { question: "Quel est votre objectif principal à 6 mois ?", placeholder: "ex: Premier client payant", type: 'text' },
          { question: "Quels sont les jalons intermédiaires pour y arriver ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
        ],
        estimatedMinutes: 12,
      },
      {
        key: 'objectifs_moyen_terme', label: "Objectifs à moyen terme (1-2 ans)", objective: "Planifier votre développement à horizon 1-2 ans",
        whyImportant: "Les objectifs moyen terme sont le pont entre le démarrage et la maturité. Ils structurent votre développement.",
        tips: ["Pensez en termes de croissance : clients, revenus, équipe", "Anticipez les besoins en financement", "Prévoyez des objectifs qualitatifs ET quantitatifs"],
        examples: ["À 1 an : 500 clients actifs et 50 000€ de CA. À 2 ans : 2000 clients, équipe de 5 personnes, rentabilité."],
        guidedQuestions: [
          { question: "Où voyez-vous votre projet dans 1 an ?", placeholder: "Dans 1 an...", type: 'textarea' },
          { question: "Où voyez-vous votre projet dans 2 ans ?", placeholder: "Dans 2 ans...", type: 'textarea' },
          { question: "Quels seront les indicateurs de succès à ces étapes ?", placeholder: "Indicateurs : CA, clients, impact...", type: 'textarea' },
        ],
        estimatedMinutes: 12,
      },
      {
        key: 'objectifs_long_terme', label: "Objectifs à long terme (3-5 ans)", objective: "Définir la vision à long terme de votre projet",
        whyImportant: "La vision long terme donne du sens à vos actions quotidiennes. C'est elle qui motive et fédère.",
        tips: ["Soyez ambitieux mais crédible", "Imaginez l'impact que vous voulez avoir sur le monde", "Votre vision long terme peut évoluer, mais elle doit exister"],
        examples: ["Devenir la référence européenne de la distribution alimentaire locale, avec 10 000 producteurs partenaires et 1 million d'utilisateurs."],
        guidedQuestions: [
          { question: "Où voyez-vous votre projet dans 3 à 5 ans ?", placeholder: "Dans 5 ans...", type: 'textarea' },
          { question: "Quel impact souhaitez-vous avoir à long terme ?", placeholder: "Impact visé...", type: 'textarea' },
        ],
        estimatedMinutes: 10,
      },
      {
        key: 'criteres_succes', label: "Critères de succès", objective: "Définir comment vous mesurerez la réussite de votre projet",
        whyImportant: "Ce qui ne se mesure pas ne s'améliore pas. Des critères de succès clairs vous permettent de savoir si vous êtes sur la bonne voie.",
        tips: ['Choisissez 3 à 5 critères principaux', 'Mélangez indicateurs quantitatifs et qualitatifs', "Revoyez vos critères régulièrement pour les ajuster"],
        examples: ["Critères : 1) Satisfaction client > 4.5/5 2) Croissance mensuelle > 20% 3) Impact carbone négatif 4) Équipe stable et motivée"],
        guidedQuestions: [
          { question: "Quels seront vos 3 à 5 critères de succès principaux ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
          { question: "Comment mesurerez-vous chacun de ces critères ?", placeholder: "ex: enquête NPS pour la satisfaction", type: 'textarea' },
        ],
        estimatedMinutes: 11,
      },
    ],
    checklist: ["J'ai défini mes objectifs court terme (3-6 mois)", "J'ai défini mes objectifs moyen terme (1-2 ans)", "J'ai une vision long terme (3-5 ans)", "J'ai identifié mes critères de succès"],
  },

  5: {
    stepNumber: 5,
    title: "Définir la mission et la vision",
    objective: "Formuler la mission, la vision et les valeurs de votre projet pour lui donner du sens et une direction claire.",
    whyImportant: "Mission, vision et valeurs sont le cœur de votre projet. Elles guident vos décisions, inspirent votre équipe et rassurent vos partenaires.",
    keyConcepts: [
      { term: "Mission", definition: "Votre raison d'être : ce que vous faites, pour qui et pourquoi. Elle répond à la question 'Pourquoi existons-nous ?'." },
      { term: "Vision", definition: "Votre ambition à long terme : le monde idéal que vous voulez créer. Elle répond à 'Où allons-nous ?'." },
      { term: "Valeurs", definition: "Les principes qui guident vos actions et décisions. Elles définissent votre culture." },
    ],
    estimatedMinutes: 50,
    subSections: [
      {
        key: 'mission', label: "Mission", objective: "Formuler votre raison d'être en une phrase claire",
        whyImportant: "Une mission claire est votre cap. Elle vous aide à prendre des décisions cohérentes et à communiquer votre projet efficacement.",
        tips: ['Une bonne mission est : courte, claire, mémorisable', "Elle répond à : qui, quoi, pourquoi", 'Évitez le jargon et les formules vagues'],
        examples: ["Notre mission est de rendre l'alimentation locale accessible à tous, en connectant producteurs et consommateurs."],
        guidedQuestions: [
          { question: "Quelle est la raison d'être de votre projet ?", hint: "Pourquoi existe-t-il ?", placeholder: "Notre mission est de...", type: 'textarea' },
          { question: "À qui profitez-vous concrètement ?", placeholder: "ex: aux producteurs locaux, aux consommateurs...", type: 'text' },
        ],
        estimatedMinutes: 12,
      },
      {
        key: 'vision', label: "Vision", objective: "Décrire le futur idéal que vous voulez créer",
        whyImportant: "La vision est votre North Star. Elle inspire et motive au-delà des difficultés quotidiennes.",
        tips: ['Une vision doit être ambitieuse mais crédible', 'Elle décrit un futur désirable dans 5 à 10 ans', 'Elle doit donner envie de vous rejoindre'],
        examples: ["Un monde où 100% des foyers ont accès à des produits locaux et de saison, et où les producteurs vivent dignement de leur travail."],
        guidedQuestions: [
          { question: "Quel est le monde idéal que vous voulez créer ?", placeholder: "Dans 10 ans, je veux que...", type: 'textarea' },
          { question: "Quel sera l'impact de votre projet à son apogée ?", placeholder: "Impact maximal...", type: 'textarea' },
        ],
        estimatedMinutes: 15,
      },
      {
        key: 'valeurs', label: "Valeurs", objective: "Définir les principes qui guideront vos actions",
        whyImportant: "Les valeurs sont votre ADN. Elles vous aident à recruter les bonnes personnes et à prendre des décisions cohérentes.",
        tips: ['Choisissez 3 à 5 valeurs maximum', 'Chaque valeur doit avoir une signification concrète', 'Vos valeurs doivent se traduire en actions'],
        examples: ["1) Authenticité : nous faisons ce que nous disons. 2) Solidarité : nous priorisons les petits producteurs. 3) Transparence : nous publions nos données d'impact."],
        guidedQuestions: [
          { question: "Quelles sont les 3 à 5 valeurs fondamentales de votre projet ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
          { question: "Que signifie chaque valeur concrètement dans votre quotidien ?", placeholder: "ex: Transparence = nous publions nos comptes", type: 'textarea' },
        ],
        estimatedMinutes: 13,
      },
      {
        key: 'impact_souhaite', label: "Impact souhaité", objective: "Identifier l'impact positif que vous voulez avoir",
        whyImportant: "Au-delà du profit, tout projet a un impact sur la société et l'environnement. Le définir vous permet de maximiser votre contribution positive.",
        tips: ['Pensez impact social, environnemental ET économique', "Identifiez les indicateurs d'impact concrets", "L'impact positif est un avantage concurrentiel de plus en plus important"],
        examples: ["Impact social : 500 emplois locaux créés. Impact environnemental : 1000 tonnes de CO2 évitées. Impact économique : 10M€ reversés aux producteurs."],
        guidedQuestions: [
          { question: "Quel impact positif souhaitez-vous avoir sur la société ?", placeholder: "Impact social...", type: 'textarea' },
          { question: "Quel impact positif souhaitez-vous avoir sur l'environnement ?", placeholder: "Impact environnemental...", type: 'textarea' },
          { question: "Comment mesurerez-vous ces impacts ?", placeholder: "Indicateurs d'impact...", type: 'textarea' },
        ],
        estimatedMinutes: 10,
      },
    ],
    checklist: ["J'ai formulé ma mission clairement", "J'ai une vision inspirante pour mon projet", "J'ai défini mes 3-5 valeurs fondamentales", "J'ai identifié l'impact positif que je veux avoir"],
  },

  6: {
    stepNumber: 6,
    title: "Résumé du contexte et des objectifs",
    objective: "Synthétiser votre analyse de contexte et vos objectifs pour vérifier la cohérence globale de votre projet.",
    whyImportant: "Cette étape de synthèse est cruciale : elle vous permet de prendre du recul et de vérifier que tous les éléments de votre projet sont alignés avant de passer à la construction.",
    keyConcepts: [
      { term: "Cohérence stratégique", definition: "L'alignement entre votre contexte (marché, concurrence), vos objectifs et votre mission." },
      { term: "Synthèse", definition: "La capacité à résumer l'essentiel en quelques points clés, signe d'une compréhension profonde." },
    ],
    estimatedMinutes: 30,
    subSections: [
      {
        key: 'synthese_contexte', label: "Synthèse du contexte", objective: "Résumer les éléments clés de votre analyse de contexte",
        whyImportant: "Une synthèse claire vous permet d'avoir une vision d'ensemble et d'identifier rapidement les points d'attention.",
        tips: ['Reprenez les points essentiels du SWOT et PESTEL', 'Identifiez les 3 opportunités les plus prometteuses', "Listez les 3 risques principaux à ne pas négliger"],
        examples: ["Opportunités clés : tendance locale, digitalisation, aides publiques. Risques : concurrence des géants, inflation, contraintes réglementaires."],
        guidedQuestions: [
          { question: "Quels sont les 3 enseignements clés de votre analyse de contexte ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
          { question: "Quels sont les principaux risques à anticiper ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
        ],
        estimatedMinutes: 10,
      },
      {
        key: 'synthese_objectifs', label: "Synthèse des objectifs", objective: "Résumer vos objectifs à toutes les échéances",
        whyImportant: "Des objectifs synthétiques sont plus faciles à communiquer et à mémoriser pour votre équipe et vos partenaires.",
        tips: ["Un objectif par horizon : 3 mois, 1 an, 5 ans", 'Chaque objectif doit être mesurable', 'Vérifiez que vos objectifs sont cohérents entre eux'],
        examples: ["3 mois : 10 clients testeurs. 1 an : 500 clients. 5 ans : leader régional avec 50 000 clients."],
        guidedQuestions: [
          { question: "Quel est votre objectif prioritaire à 3 mois ?", placeholder: "Objectif court terme...", type: 'text' },
          { question: "Vos objectifs à 1 an et 5 ans sont-ils alignés ?", placeholder: "Expliquez la cohérence...", type: 'textarea' },
        ],
        estimatedMinutes: 10,
      },
      {
        key: 'coherence_globale', label: "Cohérence globale", objective: "Vérifier l'alignement entre contexte, mission, vision et objectifs",
        whyImportant: "Un projet cohérent a plus de chances de réussir. Les incohérences entre le contexte et les objectifs sont des signaux d'alerte.",
        tips: ["Votre mission doit répondre à une opportunité du marché", "Vos objectifs doivent être réalistes compte tenu du contexte", "Vos valeurs doivent se refléter dans votre vision"],
        examples: ["Constat : marché local en croissance. Mission : rendre le local accessible. Objectif : 50 producteurs en 1 an. Cohérence : OK."],
        guidedQuestions: [
          { question: "Votre projet est-il cohérent dans son ensemble ?", type: 'select', options: [{ label: 'Oui, tout est aligné', value: 'yes' }, { label: 'Partiellement, quelques ajustements nécessaires', value: 'partial' }, { label: 'Non, je dois retravailler certains éléments', value: 'no' }] },
          { question: "Quels ajustements devez-vous apporter pour améliorer la cohérence ?", placeholder: "Ajustements nécessaires...", type: 'textarea' },
        ],
        estimatedMinutes: 10,
      },
    ],
    checklist: ["J'ai synthétisé mon analyse de contexte", "J'ai résumé mes objectifs par horizon", "J'ai vérifié la cohérence globale de mon projet", "J'ai identifié les ajustements nécessaires"],
  },

  7: {
    stepNumber: 7,
    title: "Identifier, cartographier et analyser les parties prenantes",
    objective: "Lister, cartographier et analyser toutes les personnes et organisations qui ont un intérêt dans votre projet.",
    whyImportant: "Les parties prenantes peuvent vous aider ou vous freiner. Les identifier tôt et comprendre leurs relations de pouvoir permet de construire des relations de confiance et d'éviter des blocages.",
    keyConcepts: [
      { term: "Partie prenante", definition: "Toute personne, groupe ou organisation qui influence ou est influencé par votre projet." },
      { term: "Matrice pouvoir-intérêt", definition: "Outil de priorisation qui classe les parties prenantes selon leur pouvoir et leur intérêt pour le projet." },
      { term: "Cartographie", definition: "Représentation visuelle des relations entre les parties prenantes et le projet." },
    ],
    estimatedMinutes: 85,
    subSections: [
      {
        key: 'parties_prenantes_directes', label: "Parties prenantes directes", objective: "Identifier les acteurs directement liés à votre projet",
        whyImportant: "Vos parties prenantes directes sont vos premiers alliés. Leur satisfaction est essentielle à votre réussite.",
        tips: ['Listez : clients, équipe, fournisseurs, partenaires, investisseurs', "Pour chacun, notez leurs attentes et leur influence", "Hiérarchisez-les par ordre d'importance"],
        examples: ["Clients : attendent un service fiable. Équipe : attend un salaire et du sens. Fournisseurs : attendent des paiements réguliers."],
        guidedQuestions: [
          { question: "Qui sont vos parties prenantes directes ?", placeholder: "ex: clients, équipe, fournisseurs, partenaires, investisseurs", type: 'textarea' },
          { question: "Quelles sont leurs attentes principales ?", placeholder: "Partie prenante A : attentes...", type: 'textarea' },
        ],
        estimatedMinutes: 13,
      },
      {
        key: 'parties_prenantes_indirectes', label: "Parties prenantes indirectes", objective: "Identifier les acteurs indirectement concernés",
        whyImportant: "Négliger les parties prenantes indirectes peut créer des oppositions imprévues qui freinent votre projet.",
        tips: ['Pensez : collectivités locales, associations, riverains, médias', "Certaines parties prenantes indirectes peuvent devenir des alliés précieux", "Anticipez leurs préoccupations"],
        examples: ["Mairie : attend des retombées économiques locales. Association environnementale : attend un engagement écologique."],
        guidedQuestions: [
          { question: "Qui sont vos parties prenantes indirectes ?", placeholder: "ex: mairie, associations, riverains...", type: 'textarea' },
          { question: "Quelles peuvent être leurs préoccupations vis-à-vis de votre projet ?", placeholder: "Préoccupations...", type: 'textarea' },
        ],
        estimatedMinutes: 12,
      },
      {
        key: 'influence_interet', label: "Influence et intérêt", objective: "Évaluer le niveau d'influence et d'intérêt de chaque partie prenante",
        whyImportant: "Cette analyse vous permet de prioriser vos efforts de communication et de gestion des relations.",
        tips: ['Utilisez une matrice influence/intérêt', 'Les parties prenantes à forte influence et fort intérêt sont à gérer en priorité', "Adaptez votre communication à chaque groupe"],
        examples: ["Les investisseurs ont une forte influence et un fort intérêt : à impliquer étroitement. Les riverains ont un faible intérêt mais peuvent avoir une influence via des recours."],
        guidedQuestions: [
          { question: "Quelles parties prenantes ont le plus d'influence sur votre projet ?", placeholder: "Influence forte...", type: 'textarea' },
          { question: "Quelles parties prenantes ont le plus d'intérêt dans votre projet ?", placeholder: "Intérêt fort...", type: 'textarea' },
          { question: "Comment allez-vous gérer les relations avec chaque groupe ?", placeholder: "Stratégie de gestion...", type: 'textarea' },
        ],
        estimatedMinutes: 15,
      },
      {
        key: 'carte_influence', label: "Carte d'influence", objective: "Visualiser qui a du pouvoir sur votre projet",
        whyImportant: "Comprendre les dynamiques d'influence vous permet d'anticiper les soutiens et les oppositions.",
        tips: ["Placez chaque partie prenante sur une échelle d'influence", "Identifiez les relations d'influence entre parties prenantes", "Repérez les 'influenceurs cachés' souvent négligés"],
        examples: ["Les investisseurs ont une influence décisionnelle. Les médias ont une influence d'opinion. Les associations ont une influence de réputation."],
        guidedQuestions: [
          { question: "Qui a le plus de pouvoir de décision sur votre projet ?", placeholder: "Décideurs clés...", type: 'textarea' },
          { question: "Qui a du pouvoir d'influence sans décider directement ?", placeholder: "Influenceurs...", type: 'textarea' },
          { question: "Comment ces influences s'exercent-elles ?", placeholder: "ex: décision, opinion, régulation...", type: 'textarea' },
        ],
        estimatedMinutes: 13,
      },
      {
        key: 'carte_interet', label: "Carte d'intérêt", objective: "Visualiser le niveau d'intérêt de chaque partie prenante",
        whyImportant: "L'intérêt détermine l'engagement. Une partie prenante intéressée sera proactive, une autre devra être stimulée.",
        tips: ["L'intérêt peut être positif (soutien) ou négatif (opposition)", "Un intérêt faible n'est pas un problème si l'influence est faible", "Un intérêt négatif nécessite une stratégie de gestion spécifique"],
        examples: ["Les clients ont un intérêt fort et positif. Un concurrent a un intérêt fort mais négatif. La mairie peut avoir un intérêt modéré."],
        guidedQuestions: [
          { question: "Quelles parties prenantes ont le plus d'intérêt pour votre projet ?", placeholder: "Intérêt fort...", type: 'textarea' },
          { question: "Y a-t-il des parties prenantes qui pourraient s'opposer à votre projet ?", placeholder: "Oppositions potentielles...", type: 'textarea' },
        ],
        estimatedMinutes: 13,
      },
      {
        key: 'matrice_pouvoir', label: "Matrice pouvoir-intérêt", objective: "Croiser pouvoir et intérêt pour prioriser vos actions",
        whyImportant: "La matrice pouvoir-intérêt est l'outil de référence pour gérer ses parties prenantes de façon stratégique.",
        tips: ["Quadrant 1 (fort pouvoir, fort intérêt) : à impliquer étroitement", "Quadrant 2 (fort pouvoir, faible intérêt) : à tenir satisfaits", "Quadrant 3 (faible pouvoir, fort intérêt) : à informer", "Quadrant 4 (faible pouvoir, faible intérêt) : à surveiller"],
        examples: ["Investisseurs : Q1 → implication régulière. Mairie : Q2 → reporting trimestriel. Clients : Q3 → newsletter. Riverains : Q4 → information ponctuelle."],
        guidedQuestions: [
          { question: "Classez vos parties prenantes dans la matrice pouvoir-intérêt", placeholder: "Q1 (fort pouvoir, fort intérêt) : ... Q2 : ... Q3 : ... Q4 : ...", type: 'textarea' },
          { question: "Quelle stratégie de gestion pour chaque quadrant ?", placeholder: "Q1 : impliquer, Q2 : satisfaire, Q3 : informer, Q4 : surveiller", type: 'textarea' },
        ],
        estimatedMinutes: 14,
      },
    ],
    checklist: ["J'ai identifié mes parties prenantes directes et indirectes", "J'ai créé une carte d'influence", "J'ai créé une carte d'intérêt", "J'ai construit ma matrice pouvoir-intérêt", "J'ai une stratégie pour chaque quadrant"],
  },

  8: {
    stepNumber: 8,
    title: "Segments de clientèle",
    objective: "Définir précisément qui sont vos clients, les segmenter par profils et identifier vos premiers adoptants.",
    whyImportant: "Viser 'tout le monde' est l'erreur la plus fréquente. Des segments clients bien définis permettent un marketing ciblé et une offre adaptée.",
    keyConcepts: [
      { term: "Segmentation", definition: "Division du marché en groupes homogènes de clients partageant des caractéristiques et besoins similaires." },
      { term: "Early adopters", definition: "Premiers utilisateurs, prêts à essayer votre produit malgré ses imperfections." },
      { term: "Marché cible", definition: "Le segment de clients que vous décidez de servir en priorité." },
    ],
    estimatedMinutes: 55,
    subSections: [
      {
        key: 'segments_principaux', label: "Segments de clientèle principaux", objective: "Identifier vos 2-3 segments de clientèle principaux",
        whyImportant: "Chaque segment a des besoins spécifiques. Les traiter séparément permet une offre plus pertinente.",
        tips: ['Segmentez par : âge, revenu, localisation, comportement, besoin', "Un bon segment est : identifiable, accessible, rentable, suffisamment grand", "Commencez par 2-3 segments maximum"],
        examples: ["Segment 1 : jeunes actifs urbains (25-35 ans) sensibles à l'écologie. Segment 2 : familles (35-50 ans) cherchant des produits sains."],
        guidedQuestions: [
          { question: "Quels sont vos 2 à 3 segments de clientèle principaux ?", placeholder: "Segment 1 : ... Segment 2 : ... Segment 3 : ...", type: 'textarea' },
          { question: "Quelles sont les caractéristiques distinctives de chaque segment ?", placeholder: "ex: âge, revenu, comportement d'achat...", type: 'textarea' },
        ],
        estimatedMinutes: 14,
      },
      {
        key: 'profils_acheteurs', label: "Profils d'acheteurs", objective: "Détailler le profil type de chaque segment",
        whyImportant: "Un profil d'acheteur détaillé rend votre client réel. Vous pouvez alors concevoir une offre qui lui parle vraiment.",
        tips: ["Donnez un prénom à chaque profil pour le rendre concret", "Décrivez son quotidien, ses frustrations, ses aspirations", "Un bon profil est basé sur des observations réelles, pas des suppositions"],
        examples: ["Sophie, 28 ans, chargée de marketing à Paris, cherche des produits locaux mais n'a pas le temps d'aller au marché."],
        guidedQuestions: [
          { question: "Décrivez le profil type de votre client principal (âge, profession, mode de vie)", placeholder: "Profil client...", type: 'textarea' },
          { question: "Quels sont ses objectifs et ses frustrations dans sa vie quotidienne ?", placeholder: "Objectifs : ... Frustrations : ...", type: 'textarea' },
        ],
        estimatedMinutes: 14,
      },
      {
        key: 'early_adopters', label: "Early adopters", objective: "Identifier vos premiers utilisateurs, prêts à vous faire confiance",
        whyImportant: "Les early adopters sont vos meilleurs alliés : ils testent, donnent leur avis et font le bouche-à-oreille.",
        tips: ["Les early adopters sont souvent des passionnés du secteur", "Ils acceptent les imperfections si la vision est forte", "Identifiez où ils se rassemblent (forums, groupes, événements)"],
        examples: ["Les early adopters de notre plateforme : les producteurs locaux déjà engagés dans des AMAP et les consommateurs membres de groupes Facebook 'locavores'."],
        guidedQuestions: [
          { question: "Qui seront vos 10 premiers clients idéaux ?", placeholder: "Profil des 10 premiers clients...", type: 'textarea' },
          { question: "Où pouvez-vous les trouver concrètement ?", placeholder: "ex: groupes Facebook, forums, salons, associations...", type: 'textarea' },
          { question: "Comment allez-vous les convaincre d'essayer votre solution ?", placeholder: "Stratégie d'acquisition initiale...", type: 'textarea' },
        ],
        estimatedMinutes: 14,
      },
      {
        key: 'marche_cible_v2', label: "Marché cible prioritaire", objective: "Choisir le segment à attaquer en premier",
        whyImportant: "Concentrer vos ressources limitées sur un seul segment maximise vos chances de réussite au démarrage.",
        tips: ["Choisissez le segment le plus accessible et le plus rentable", "Un petit segment conquis vaut mieux qu'un grand segment effleuré", "Vous pourrez vous étendre à d'autres segments plus tard"],
        examples: ["Cible prioritaire : les jeunes actifs urbains (25-35 ans) car ils sont déjà sensibles à l'écologie, utilisent le digital et ont un pouvoir d'achat suffisant."],
        guidedQuestions: [
          { question: "Quel segment ciblez-vous en priorité ? Pourquoi ?", placeholder: "Segment prioritaire et justification...", type: 'textarea' },
          { question: "Quelle est la taille estimée de ce segment ?", placeholder: "ex: 500 000 personnes en France", type: 'text' },
        ],
        estimatedMinutes: 13,
      },
    ],
    checklist: ["J'ai identifié 2-3 segments de clientèle", "J'ai détaillé le profil de mes clients", "J'ai identifié mes early adopters", "J'ai choisi mon marché cible prioritaire"],
  },

  9: {
    stepNumber: 9,
    title: "Proposition de valeur",
    objective: "Définir la valeur unique que vous apportez à vos clients, sur les plans fonctionnel, émotionnel et social.",
    whyImportant: "Votre proposition de valeur est la raison pour laquelle un client vous choisit plutôt qu'un concurrent. C'est le cœur de votre avantage concurrentiel.",
    keyConcepts: [
      { term: "Valeur fonctionnelle", definition: "L'utilité concrète de votre produit : il fait gagner du temps, de l'argent, ou résout un problème spécifique." },
      { term: "Valeur émotionnelle", definition: "Le sentiment positif que votre produit procure : plaisir, fierté, sérénité." },
      { term: "Valeur sociale", definition: "L'impact social ou environnemental positif de votre produit, valorisé par la communauté." },
    ],
    estimatedMinutes: 50,
    subSections: [
      {
        key: 'valeur_fonctionnelle', label: "Valeur fonctionnelle", objective: "Définir l'utilité concrète de votre solution",
        whyImportant: "La valeur fonctionnelle est le minimum attendu par vos clients. Sans elle, rien d'autre ne compte.",
        tips: ["Listez les bénéfices concrets : gain de temps, d'argent, simplicité, qualité", "Quantifiez la valeur : 'fait gagner 2h par semaine' plutôt que 'fait gagner du temps'", "Comparez à l'existant : en quoi c'est mieux ?"],
        examples: ["Notre plateforme fait gagner 30 minutes par jour aux consommateurs en regroupant tous les producteurs locaux au même endroit."],
        guidedQuestions: [
          { question: "Quels bénéfices concrets apportez-vous à vos clients ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
          { question: "Quel problème spécifique résolvez-vous mieux que les alternatives ?", placeholder: "Notre avantage fonctionnel...", type: 'textarea' },
        ],
        estimatedMinutes: 12,
      },
      {
        key: 'valeur_emotionnelle', label: "Valeur émotionnelle", objective: "Identifier l'émotion positive que votre produit procure",
        whyImportant: "Les gens achètent avec leurs émotions et justifient avec leur raison. La valeur émotionnelle est souvent le vrai moteur d'achat.",
        tips: ["Quel sentiment votre client a-t-il en utilisant votre produit ?", "Fierté, soulagement, plaisir, sécurité, appartenance ?", "Racontez une histoire qui évoque cette émotion"],
        examples: ["Nos clients ressentent de la fierté de contribuer à une alimentation plus durable, et de la sérénité de savoir ce qu'ils mangent."],
        guidedQuestions: [
          { question: "Quelle émotion vos clients ressentiront-ils en utilisant votre solution ?", placeholder: "ex: fierté, sérénité, plaisir...", type: 'text' },
          { question: "Comment renforcez-vous cette émotion dans votre expérience client ?", placeholder: "ex: storytelling, design, service personnalisé...", type: 'textarea' },
        ],
        estimatedMinutes: 13,
      },
      {
        key: 'valeur_sociale', label: "Valeur sociale et environnementale", objective: "Définir l'impact positif de votre projet",
        whyImportant: "De plus en plus de clients choisissent des marques qui ont un impact positif. C'est un puissant facteur de différenciation.",
        tips: ["Identifiez votre contribution sociale concrète", "Mesurez votre impact environnemental", "Communiquez de façon transparente sur votre impact"],
        examples: ["Chaque commande permet de soutenir un producteur local. Nos clients font partie d'une communauté qui agit pour la planète."],
        guidedQuestions: [
          { question: "Quel est l'impact social positif de votre projet ?", placeholder: "Impact social...", type: 'textarea' },
          { question: "Quel est l'impact environnemental positif ?", placeholder: "Impact environnemental...", type: 'textarea' },
          { question: "Comment communiquerez-vous sur ces impacts ?", placeholder: "ex: rapport d'impact, labels, certifications...", type: 'textarea' },
        ],
        estimatedMinutes: 13,
      },
      {
        key: 'differenciation', label: "Différenciation", objective: "Identifier ce qui vous rend unique par rapport à la concurrence",
        whyImportant: "Sans différenciation claire, vous êtes un concurrent parmi d'autres. Votre différence est votre raison d'être choisie.",
        tips: ["Votre différence doit être perceptible par le client", "Un bon positionnement se résume en une phrase", "Évitez les différences trop faciles à copier"],
        examples: ["Nous sommes la seule plateforme qui garantit l'origine locale à 100% et qui reverse 90% du prix au producteur."],
        guidedQuestions: [
          { question: "Qu'est-ce qui vous rend vraiment différent de vos concurrents ?", placeholder: "Notre différence fondamentale...", type: 'textarea' },
          { question: "Pourquoi un client vous choisirait-il plutôt qu'un concurrent ?", placeholder: "Raison du choix...", type: 'textarea' },
        ],
        estimatedMinutes: 12,
      },
    ],
    checklist: ["J'ai défini ma valeur fonctionnelle", "J'ai identifié la valeur émotionnelle", "J'ai défini ma valeur sociale/environnementale", "J'ai formalisé ma différenciation"],
  },

  10: {
    stepNumber: 10,
    title: "Tester la proposition de valeur",
    objective: "Confronter votre proposition de valeur à la réalité du terrain en recueillant les retours de vrais clients.",
    whyImportant: "Une proposition de valeur qui n'a pas été testée n'est qu'une hypothèse. Les tests clients révèlent ce qui marche vraiment et ce qui doit être ajusté.",
    keyConcepts: [
      { term: "Test client", definition: "Mise en situation réelle de votre proposition de valeur auprès de clients potentiels." },
      { term: "Feedback", definition: "Retour d'expérience du client sur votre proposition de valeur." },
      { term: "Ajustement", definition: "Modification de votre offre basée sur les retours terrain." },
    ],
    estimatedMinutes: 60,
    subSections: [
      {
        key: 'tests_clients', label: "Tests clients", objective: "Organiser des sessions de test de votre proposition de valeur",
        whyImportant: "Un test bien conçu vous donne des informations fiables pour améliorer votre offre avant le lancement.",
        tips: ["Testez auprès de 5 à 10 personnes de votre segment cible", "Préparez un script pour chaque test", "Observez les réactions, pas seulement les réponses"],
        examples: ["Test : présenter une maquette de l'application à 10 utilisateurs cibles et observer leur navigation. Questions : 'Que cherchez-vous ?', 'Qu'est-ce qui vous paraît clair ou confus ?'"],
        guidedQuestions: [
          { question: "Comment allez-vous tester votre proposition de valeur ?", placeholder: "Méthode de test...", type: 'textarea' },
          { question: "Auprès de combien de personnes allez-vous tester ?", placeholder: "ex: 10 à 15 personnes", type: 'text' },
          { question: "Quel est votre script ou protocole de test ?", placeholder: "Déroulé du test...", type: 'textarea' },
        ],
        estimatedMinutes: 20,
      },
      {
        key: 'feedback_recolte', label: "Récolte des feedbacks", objective: "Collecter et organiser les retours des tests",
        whyImportant: "Les feedbacks sont une mine d'or. Bien organisés, ils révèlent des tendances et des priorités d'amélioration.",
        tips: ["Prenez des notes pendant chaque test", "Classez les feedbacks par thème", "Distinguez les problèmes bloquants des simples suggestions"],
        examples: ["Feedback 1 : 'Je ne comprends pas comment fonctionne la livraison' → problème de clarté. Feedback 2 : 'J'aimerais pouvoir filtrer par distance' → suggestion d'amélioration."],
        guidedQuestions: [
          { question: "Quels sont les principaux retours que vous avez reçus ?", placeholder: "Retours positifs... Retours négatifs...", type: 'textarea' },
          { question: "Quels sont les problèmes récurrents identifiés ?", placeholder: "Problèmes récurrents...", type: 'textarea' },
        ],
        estimatedMinutes: 20,
      },
      {
        key: 'ajustements', label: "Ajustements de la proposition de valeur", objective: "Modifier votre offre en fonction des retours clients",
        whyImportant: "Un projet qui s'adapte aux retours terrain a bien plus de chances de réussir. La flexibilité est une force entrepreneuriale.",
        tips: ["Priorisez les ajustements qui ont le plus d'impact perçu", "Ne changez pas tout : conservez ce qui fonctionne", "Testez à nouveau après ajustements"],
        examples: ["Suite aux tests, nous avons simplifié le processus de commande de 5 à 3 étapes et ajouté un indicateur de distance clair."],
        guidedQuestions: [
          { question: "Quels ajustements allez-vous apporter suite aux tests ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
          { question: "Comment allez-vous valider que ces ajustements sont les bons ?", placeholder: "ex: nouveau test, enquête de suivi...", type: 'textarea' },
        ],
        estimatedMinutes: 20,
      },
    ],
    checklist: ["J'ai organisé des tests clients", "J'ai collecté les feedbacks", "J'ai analysé les retours", "J'ai défini les ajustements nécessaires"],
  },

  11: {
    stepNumber: 11,
    title: "Faire évoluer la proposition de valeur",
    objective: "Savoir quand et comment faire pivoter votre proposition de valeur pour rester alignée avec les besoins du marché.",
    whyImportant: "Parfois, les tests révèlent que votre proposition de valeur initiale n'est pas la bonne. Savoir pivoter est une compétence entrepreneuriale clé.",
    keyConcepts: [
      { term: "Pivot", definition: "Changement stratégique de votre proposition de valeur ou de votre modèle économique basé sur les apprentissages du terrain." },
      { term: "Validation", definition: "Confirmation par des données que votre nouvelle proposition de valeur répond mieux aux besoins." },
      { term: "Itération", definition: "Processus d'amélioration continue par cycles de test-apprentissage-ajustement." },
    ],
    estimatedMinutes: 45,
    subSections: [
      {
        key: 'pivot_necessite', label: "Nécessité d'un pivot", objective: "Évaluer si un pivot est nécessaire",
        whyImportant: "Pivoter trop tôt peut être une erreur, mais pivoter trop tard peut être fatal. Savoir reconnaître les signaux est crucial.",
        tips: ["Signaux de pivot : feedbacks négatifs récurrents, faible engagement, aucun revenu", "Un pivot n'est pas un échec, c'est un apprentissage", "Différenciez un ajustement mineur d'un vrai pivot stratégique"],
        examples: ["Après 20 entretiens, nous avons constaté que le problème principal n'était pas le prix mais le manque de confiance dans la qualité des produits. Nous avons donc pivoté vers un système de certification."],
        guidedQuestions: [
          { question: "Votre proposition de valeur actuelle est-elle validée par le terrain ?", type: 'select', options: [{ label: 'Oui, pleinement', value: 'yes' }, { label: 'Partiellement, besoin d\'ajustements', value: 'partial' }, { label: 'Non, un pivot est nécessaire', value: 'pivot' }] },
          { question: "Quels signaux vous indiquent qu'un changement est nécessaire ?", placeholder: "Signaux observés...", type: 'textarea' },
        ],
        estimatedMinutes: 15,
      },
      {
        key: 'nouvelle_proposition', label: "Nouvelle proposition de valeur", objective: "Formuler une proposition de valeur révisée",
        whyImportant: "Une nouvelle proposition de valeur doit intégrer les apprentissages du terrain tout en restant cohérente avec votre mission.",
        tips: ["Repartez des besoins non satisfaits identifiés lors des tests", "Conservez ce qui fonctionne dans votre proposition actuelle", "Assurez-vous que la nouvelle proposition est testable rapidement"],
        examples: ["Ancienne proposition : 'Des produits locaux livrés chez vous'. Nouvelle proposition : 'Des produits locaux certifiés qualité, avec traçabilité complète, livrés chez vous'."],
        guidedQuestions: [
          { question: "Quelle est votre nouvelle proposition de valeur ?", placeholder: "Nouvelle proposition...", type: 'textarea' },
          { question: "En quoi est-elle différente de la précédente ?", placeholder: "Différences clés...", type: 'textarea' },
        ],
        estimatedMinutes: 15,
      },
      {
        key: 'validation_pivot', label: "Validation du pivot", objective: "Tester et valider votre nouvelle proposition de valeur",
        whyImportant: "Un pivot non validé est juste une nouvelle hypothèse. Il doit être testé avec la même rigueur que la proposition initiale.",
        tips: ["Testez rapidement avec un petit groupe", "Définissez des critères de succès clairs pour le pivot", "Soyez prêt à pivoter à nouveau si nécessaire"],
        examples: ["Nous avons testé la nouvelle proposition auprès de 15 clients : 80% étaient intéressés contre 30% pour l'ancienne. Le pivot est validé."],
        guidedQuestions: [
          { question: "Comment allez-vous tester votre nouvelle proposition ?", placeholder: "Plan de test...", type: 'textarea' },
          { question: "Quels sont vos critères pour valider le pivot ?", placeholder: "ex: taux d'intérêt > 50%", type: 'text' },
          { question: "Quel est votre plan si le pivot n'est pas validé ?", placeholder: "Plan B...", type: 'textarea' },
        ],
        estimatedMinutes: 15,
      },
    ],
    checklist: ["J'ai évalué la nécessité d'un pivot", "J'ai formulé une nouvelle proposition de valeur si nécessaire", "J'ai défini un plan de validation du pivot", "J'ai un plan B si le pivot échoue"],
  },

  12: {
    stepNumber: 12,
    title: "Relations clients, canaux et parcours client",
    objective: "Définir comment vous allez interagir avec vos clients, par quels canaux, et cartographier leur parcours complet.",
    whyImportant: "Le choix des canaux, du type de relation client et du parcours détermine votre budget marketing, votre image de marque et l'expérience client. Un parcours bien conçu augmente la conversion et la fidélisation.",
    keyConcepts: [
      { term: "Canal d'acquisition", definition: "Le moyen par lequel vous attirez de nouveaux clients (SEO, réseaux sociaux, bouche-à-oreille)." },
      { term: "Parcours client", definition: "L'ensemble des étapes et interactions qu'un client traverse avec votre marque, de la découverte à la fidélisation." },
      { term: "Point de contact", definition: "Chaque interaction entre le client et votre marque (site web, email, appel, réseau social)." },
    ],
    estimatedMinutes: 100,
    subSections: [
      {
        key: 'type_relation', label: "Type de relation client", objective: "Définir la nature de la relation avec vos clients",
        whyImportant: "Le type de relation impacte votre image, la fidélisation et vos coûts de service client.",
        tips: ["Relation personnalisée = coûteuse mais forte fidélisation", "Relation automatisée = économique mais moins chaleureuse", "Relation communautaire = engageante mais nécessite de l'animation"],
        examples: ["Nous optons pour une relation personnalisée avec un suivi dédié pour les producteurs (compte clé) et une relation automatisée pour les consommateurs (chatbot, FAQ)."],
        guidedQuestions: [
          { question: "Quel type de relation souhaitez-vous avec vos clients ?", type: 'select', options: [{ label: 'Personnalisée (suivi dédié)', value: 'personalized' }, { label: 'Automatisée (self-service)', value: 'automated' }, { label: 'Communautaire (entraide entre clients)', value: 'community' }, { label: 'Mixte', value: 'mixed' }] },
          { question: "Pourquoi ce choix correspond à votre proposition de valeur ?", placeholder: "Justification...", type: 'textarea' },
        ],
        estimatedMinutes: 12,
      },
      {
        key: 'canaux_acquisition', label: "Canaux d'acquisition", objective: "Identifier comment vous allez attirer de nouveaux clients",
        whyImportant: "Choisir les bons canaux d'acquisition est essentiel pour optimiser votre budget marketing.",
        tips: ["Testez 3 canaux en parallèle, gardez les 2 plus performants", "Le SEO est un investissement long terme", "Le bouche-à-oreille est le canal le plus efficace et le moins cher"],
        examples: ["Canaux d'acquisition : 1) SEO/blog (40% du budget), 2) Réseaux sociaux/Instagram (30%), 3) Partenariats avec des influenceurs (30%)"],
        guidedQuestions: [
          { question: "Quels sont vos 3 canaux d'acquisition principaux ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
          { question: "Quel est le coût estimé par canal ?", placeholder: "ex: SEO = 1000€/mois, Instagram = 500€/mois...", type: 'textarea' },
        ],
        estimatedMinutes: 12,
      },
      {
        key: 'canaux_distribution', label: "Canaux de distribution", objective: "Définir comment votre produit arrive chez le client",
        whyImportant: "Le canal de distribution impacte votre marge, votre expérience client et votre capacité à livrer.",
        tips: ["Direct (propre site) = meilleure marge mais nécessite du trafic", "Indirect (marketplaces) = volume mais marge réduite", "Le choix du canal dépend de votre produit et de vos clients"],
        examples: ["Distribution : vente directe via notre site web (70%) et distribution via des marketplaces partenaires (30%)"],
        guidedQuestions: [
          { question: "Comment votre produit ou service sera-t-il distribué ?", placeholder: "ex: site web, application, boutique physique, revendeurs...", type: 'textarea' },
          { question: "Quel sera le modèle de distribution principal ?", type: 'select', options: [{ label: 'Direct (vente propre)', value: 'direct' }, { label: 'Indirect (revendeurs)', value: 'indirect' }, { label: 'Mixte', value: 'mixed' }] },
        ],
        estimatedMinutes: 12,
      },
      {
        key: 'canaux_communication', label: "Canaux de communication", objective: "Définir comment vous communiquez avec vos clients",
        whyImportant: "Une communication cohérente sur tous les canaux renforce votre marque et votre relation client.",
        tips: ["Choisissez les canaux où sont vos clients", "Adaptez votre message à chaque canal", "Gardez une cohérence de ton et d'image"],
        examples: ["Communication : emailing (newsletter hebdomadaire), Instagram (contenu quotidien), blog (articles hebdomadaires), application (notifications push)."],
        guidedQuestions: [
          { question: "Par quels canaux communiquerez-vous avec vos clients ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
          { question: "À quelle fréquence communiquerez-vous sur chaque canal ?", placeholder: "ex: newsletter hebdo, Instagram quotidien...", type: 'textarea' },
        ],
        estimatedMinutes: 12,
      },
      {
        key: 'parcours_decouverte', label: "Parcours de découverte", objective: "Cartographier comment les clients découvrent votre projet",
        whyImportant: "La première impression est cruciale. Un parcours de découverte fluide augmente significativement les taux de conversion.",
        tips: ["Identifiez tous les points de contact possibles", "Simplifiez au maximum la première interaction", "Mesurez le taux de conversion à chaque étape"],
        examples: ["Découverte : publicité Instagram → atterrissage sur la page d'accueil → consultation des offres → inscription newsletter."],
        guidedQuestions: [
          { question: "Comment vos clients vous découvrent-ils ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
          { question: "Quelle est la première action que vous voulez qu'ils fassent ?", placeholder: "ex: s'inscrire, télécharger, acheter...", type: 'text' },
        ],
        estimatedMinutes: 13,
      },
      {
        key: 'parcours_achat', label: "Parcours d'achat", objective: "Optimiser le chemin jusqu'à l'achat",
        whyImportant: "Chaque étape superflue entre la décision et l'achat fait perdre des clients. Un tunnel d'achat fluide maximise les conversions.",
        tips: ["Limitez le nombre d'étapes (3-4 maximum)", "Proposez le guest checkout pour les nouveaux clients", "Rassurez : garanties, avis, politique de retour visibles"],
        examples: ["Achat : sélection du produit → panier → informations livraison → paiement → confirmation. Objectif : < 3 minutes."],
        guidedQuestions: [
          { question: "Quelles sont les étapes du parcours d'achat ?", placeholder: "1. ... 2. ... 3. ... 4. ...", type: 'textarea' },
          { question: "Où se situent les principaux freins à l'achat ?", placeholder: "Freins identifiés...", type: 'textarea' },
        ],
        estimatedMinutes: 13,
      },
      {
        key: 'parcours_fidelisation', label: "Parcours de fidélisation", objective: "Mettre en place des mécanismes de fidélisation",
        whyImportant: "Fidéliser un client coûte 5 à 10 fois moins cher que d'en acquérir un nouveau. La fidélisation est le moteur de la croissance durable.",
        tips: ["Mettez en place un programme de fidélité", "Sollicitez régulièrement les avis et feedbacks", "Créez une communauté autour de votre marque"],
        examples: ["Fidélisation : programme de points (1€ = 10 points), parrainage (5€ offerts), newsletter personnalisée, accès VIP aux nouveautés."],
        guidedQuestions: [
          { question: "Comment allez-vous fidéliser vos clients après l'achat ?", placeholder: "Stratégie de fidélisation...", type: 'textarea' },
          { question: "Quels avantages offrirez-vous aux clients fidèles ?", placeholder: "ex: programme de points, réduction, accès exclusif...", type: 'textarea' },
        ],
        estimatedMinutes: 12,
      },
      {
        key: 'points_contact', label: "Points de contact", objective: "Lister tous les points de contact avec vos clients",
        whyImportant: "Chaque point de contact est une opportunité de renforcer votre relation client. Une expérience cohérente sur tous les points de contact est essentielle.",
        tips: ["Listez tous les points de contact, même les plus petits", "Évaluez l'importance et la satisfaction pour chacun", "Assurez la cohérence entre tous les points de contact"],
        examples: ["Points de contact : site web, application, email, téléphone, réseaux sociaux, point de vente, service après-vente, facture, emballage."],
        guidedQuestions: [
          { question: "Listez tous les points de contact avec vos clients", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
          { question: "Comment assurez-vous une expérience cohérente sur tous ces points ?", placeholder: "Stratégie de cohérence...", type: 'textarea' },
        ],
        estimatedMinutes: 12,
      },
    ],
    checklist: ["J'ai défini le type de relation client", "J'ai choisi mes canaux d'acquisition, de distribution et de communication", "J'ai cartographié le parcours client complet", "J'ai listé tous les points de contact"],
  },

  13: {
    stepNumber: 13,
    title: "Activités clés et ressources clés",
    objective: "Identifier les activités et ressources indispensables au fonctionnement de votre projet.",
    whyImportant: "Sans les bonnes activités et ressources, même la meilleure proposition de valeur reste lettre morte. C'est le squelette opérationnel de votre projet.",
    keyConcepts: [
      { term: "Activités clés", definition: "Les actions les plus importantes que vous devez faire pour créer et délivrer votre valeur." },
      { term: "Ressources clés", definition: "Les actifs (humains, financiers, matériels, intellectuels) nécessaires à votre activité." },
      { term: "Compétences requises", definition: "Les savoir-faire indispensables au sein de votre équipe." },
    ],
    estimatedMinutes: 45,
    subSections: [
      {
        key: 'activites_cles', label: "Activités clés", objective: "Lister les 5 à 7 activités les plus importantes de votre projet",
        whyImportant: "Se concentrer sur l'essentiel est la clé de l'efficacité entrepreneuriale. Les activités clés sont celles qui créent le plus de valeur.",
        tips: ["Identifiez les activités qui créent directement de la valeur pour le client", "Distinguez les activités quotidiennes des activités stratégiques", "Priorisez : tout ne peut pas être prioritaire"],
        examples: ["1) Développement de la plateforme, 2) Acquisition de producteurs partenaires, 3) Marketing digital, 4) Service client, 5) Logistique et livraison."],
        guidedQuestions: [
          { question: "Quelles sont vos 5 à 7 activités clés ?", placeholder: "1. ... 2. ... 3. ... 4. ... 5. ...", type: 'textarea' },
          { question: "Lesquelles de ces activités créent le plus de valeur ?", placeholder: "Activités à plus forte valeur...", type: 'textarea' },
        ],
        estimatedMinutes: 12,
      },
      {
        key: 'ressources_cles', label: "Ressources clés", objective: "Identifier les ressources indispensables à votre activité",
        whyImportant: "Sans les bonnes ressources, même les meilleures activités sont impossibles à réaliser.",
        tips: ["Distinguer ressources humaines, financières, matérielles et intellectuelles", "Ce que vous avez déjà vs ce qu'il vous manque", "Certaines ressources peuvent être mutualisées ou louées"],
        examples: ["Ressources : 1) développeur full-stack, 2) 50 000€ de trésorerie, 3) serveurs cloud, 4) marque déposée, 5) base de données producteurs."],
        guidedQuestions: [
          { question: "Quelles sont les ressources clés dont vous avez besoin ?", placeholder: "Humaines : ... Financières : ... Matérielles : ... Intellectuelles : ...", type: 'textarea' },
          { question: "Quelles ressources possédez-vous déjà ?", placeholder: "Ressources actuelles...", type: 'textarea' },
        ],
        estimatedMinutes: 12,
      },
      {
        key: 'competences_requises', label: "Compétences requises", objective: "Lister les compétences nécessaires au sein de l'équipe",
        whyImportant: "Les compétences de votre équipe sont votre ressource la plus précieuse. Identifier les lacunes permet de recruter ou se former.",
        tips: ["Listez les compétences techniques et non techniques", "Évaluez le niveau de maîtrise actuel (1-5)", "Priorisez les compétences critiques à acquérir en premier"],
        examples: ["Compétences : développement web (niveau 3/5), marketing digital (niveau 4/5), gestion financière (niveau 2/5), relation commerciale (niveau 4/5)."],
        guidedQuestions: [
          { question: "Quelles sont les compétences clés pour votre projet ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
          { question: "Quelles compétences maîtrisez-vous déjà bien ?", placeholder: "Points forts...", type: 'textarea' },
        ],
        estimatedMinutes: 11,
      },
      {
        key: 'besoins_technologiques', label: "Besoins technologiques", objective: "Identifier vos besoins en technologies et outils",
        whyImportant: "Les bons outils technologiques peuvent décupler votre productivité. À l'inverse, une technologie inadaptée peut freiner votre croissance.",
        tips: ["Distinguez les besoins immédiats des besoins futurs", "Préférez des solutions SaaS pour commencer (moins d'investissement)", "Anticipez les besoins d'intégration entre outils"],
        examples: ["Besoins tech : site web (WordPress/Wix), CRM (HubSpot), outil emailing (Mailchimp), solution de paiement (Stripe), logiciel comptable."],
        guidedQuestions: [
          { question: "Quels sont vos besoins technologiques principaux ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
          { question: "Quels outils allez-vous utiliser pour chaque besoin ?", placeholder: "ex: CRM = HubSpot, site = Webflow...", type: 'textarea' },
        ],
        estimatedMinutes: 10,
      },
    ],
    checklist: ["J'ai listé mes activités clés", "J'ai identifié mes ressources clés", "J'ai évalué les compétences nécessaires", "J'ai défini mes besoins technologiques"],
  },

  14: {
    stepNumber: 14,
    title: "Écoconception et résultats environnementaux",
    objective: "Intégrer les principes d'écoconception dans votre projet, mesurer leurs résultats et planifier les améliorations.",
    whyImportant: "L'écoconception est un avantage concurrentiel et une responsabilité. 73% des consommateurs français déclarent vouloir consommer plus responsable. Mesurer vos résultats permet de communiquer de façon transparente.",
    keyConcepts: [
      { term: "Écoconception", definition: "Intégration des critères environnementaux dès la conception d'un produit ou service." },
      { term: "Analyse de cycle de vie (ACV)", definition: "Méthode qui évalue l'impact environnemental d'un produit de l'extraction des matières premières à sa fin de vie." },
      { term: "Bilan carbone", definition: "Mesure des émissions de gaz à effet de serre générées par votre activité, exprimée en tonnes équivalent CO2." },
    ],
    estimatedMinutes: 90,
    subSections: [
      {
        key: 'impact_environnemental', label: "Impact environnemental", objective: "Identifier les impacts environnementaux de votre projet",
        whyImportant: "On ne peut réduire que ce que l'on mesure. Identifier vos impacts est la première étape pour les réduire.",
        tips: ["Pensez à toutes les étapes : matières premières, production, transport, usage, fin de vie", "Identifiez les 3 impacts les plus significatifs", "Impliquez votre équipe dans cette réflexion"],
        examples: ["Impact 1 : émissions liées au transport des produits. Impact 2 : emballages plastiques. Impact 3 : consommation énergétique des serveurs."],
        guidedQuestions: [
          { question: "Quels sont les principaux impacts environnementaux de votre projet ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
          { question: "À quelle étape du cycle de vie se situent les plus gros impacts ?", placeholder: "ex: production, transport, usage...", type: 'textarea' },
        ],
        estimatedMinutes: 14,
      },
      {
        key: 'ecoconception_produit', label: "Écoconception du produit", objective: "Concevoir votre produit ou service de façon écologique",
        whyImportant: "L'écoconception réduit vos coûts (matières, énergie) et améliore votre image. C'est un cercle vertueux.",
        tips: ["Privilégiez des matériaux durables et recyclés", "Concevez pour la réparabilité et la durabilité", "Optimisez la logistique pour réduire les transports"],
        examples: ["Écoconception : emballages 100% recyclables et réutilisables, livraison en vélo électrique en ville, serveurs alimentés en énergie verte."],
        guidedQuestions: [
          { question: "Comment pouvez-vous concevoir votre produit de façon plus écologique ?", placeholder: "Actions d'écoconception...", type: 'textarea' },
          { question: "Quels matériaux ou processus plus durables pouvez-vous utiliser ?", placeholder: "Alternatives durables...", type: 'textarea' },
        ],
        estimatedMinutes: 14,
      },
      {
        key: 'analyse_cycle_vie', label: "Analyse de cycle de vie (ACV)", objective: "Évaluer l'impact environnemental sur tout le cycle de vie",
        whyImportant: "L'ACV évite les déplacements de pollution : réduire un impact en augmenter un autre. C'est une vision systémique.",
        tips: ["L'ACV complète nécessite un expert, mais vous pouvez faire une première évaluation simplifiée", "Concentrez-vous sur les phases à plus fort impact", "L'ACV aide à prioriser les actions d'écoconception"],
        examples: ["ACV simplifiée : extraction (10% impact) → fabrication (30%) → transport (25%) → usage (20%) → fin de vie (15%). Priorité : fabrication et transport."],
        guidedQuestions: [
          { question: "Quelles sont les étapes du cycle de vie de votre produit ?", placeholder: "1. ... 2. ... 3. ... 4. ... 5. ...", type: 'textarea' },
          { question: "À quelle étape l'impact environnemental est-il le plus fort ?", placeholder: "Étape à plus fort impact...", type: 'text' },
        ],
        estimatedMinutes: 14,
      },
      {
        key: 'bilan_carbone', label: "Bilan carbone", objective: "Calculer votre bilan carbone prévisionnel",
        whyImportant: "Le bilan carbone est un indicateur clé pour mesurer et communiquer votre engagement environnemental.",
        tips: ["Utilisez des outils gratuits comme le simulateur ADEME", "Distinguez scope 1 (direct), 2 (énergie), 3 (indirect)", "Actualisez votre bilan régulièrement"],
        examples: ["Bilan carbone prévisionnel : 50 tonnes CO2eq/an. Scope 1 : 5t (véhicules). Scope 2 : 10t (électricité). Scope 3 : 35t (transport fournisseurs, déplacements clients)."],
        guidedQuestions: [
          { question: "Quel est votre bilan carbone prévisionnel estimé ?", placeholder: "Tonnes CO2eq...", type: 'text' },
          { question: "Quels sont les principaux postes d'émissions ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
        ],
        estimatedMinutes: 14,
      },
      {
        key: 'ameliorations_identifiees', label: "Améliorations identifiées", objective: "Lister les opportunités d'amélioration environnementale",
        whyImportant: "Chaque amélioration, même petite, contribue à réduire votre impact. L'écoconception est un chemin, pas une destination.",
        tips: ["Classez les améliorations par impact et facilité de mise en œuvre", "Commencez par les actions à fort impact et faciles à mettre en place", "Impliquez vos parties prenantes dans cette démarche"],
        examples: ["Améliorations : 1) Passer aux emballages 100% recyclés (fort impact, facile). 2) Optimiser les tournées de livraison (fort impact, moyen). 3) Certifier les fournisseurs (impact moyen, complexe)."],
        guidedQuestions: [
          { question: "Quelles améliorations environnementales avez-vous identifiées ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
          { question: "Quelles sont les plus faciles à mettre en œuvre ?", placeholder: "Actions rapides...", type: 'textarea' },
        ],
        estimatedMinutes: 13,
      },
      {
        key: 'plan_ecoconception', label: "Plan d'écoconception", objective: "Établir une feuille de route pour réduire votre impact environnemental",
        whyImportant: "Un plan structuré transforme vos intentions en actions concrètes avec des échéances et des responsables.",
        tips: ["Fixez des objectifs chiffrés (ex: -30% d'émissions en 3 ans)", "Planifiez des actions par trimestre", "Désignez un responsable pour chaque action"],
        examples: ["T1 2026 : audit emballages (responsable : Marie). T2 2026 : test emballages recyclés (Marie). T3 2026 : déploiement (équipe). Objectif : -50% plastique vierge."],
        guidedQuestions: [
          { question: "Quel est votre plan d'écoconception sur 12 mois ?", placeholder: "T1 : ... T2 : ... T3 : ... T4 : ...", type: 'textarea' },
          { question: "Quels sont vos objectifs chiffrés de réduction d'impact ?", placeholder: "ex: -30% CO2, -50% plastique...", type: 'textarea' },
        ],
        estimatedMinutes: 13,
      },
    ],
    checklist: ["J'ai identifié les impacts environnementaux de mon projet", "J'ai intégré des principes d'écoconception", "J'ai réalisé une ACV simplifiée", "J'ai estimé mon bilan carbone", "J'ai un plan d'écoconception chiffré"],
  },

  15: {
    stepNumber: 15,
    title: "Résumé des activités, ressources, canaux et relations",
    objective: "Synthétiser l'ensemble des éléments opérationnels de votre projet pour vérifier leur cohérence.",
    whyImportant: "Cette synthèse opérationnelle est le pont entre votre stratégie et votre exécution. Elle garantit que tous les éléments sont alignés et cohérents.",
    keyConcepts: [
      { term: "Cohérence opérationnelle", definition: "L'alignement entre vos ressources, vos activités et votre proposition de valeur." },
      { term: "Synthèse stratégique", definition: "La capacité à résumer l'essentiel de votre modèle opérationnel en quelques points clés." },
    ],
    estimatedMinutes: 30,
    subSections: [
      {
        key: 'synthese_activites', label: "Synthèse des activités", objective: "Résumer les activités clés de votre projet",
        whyImportant: "Une vision claire de vos activités permet de prioriser et de communiquer efficacement.",
        tips: ["Listez les 5 activités qui créent le plus de valeur", "Vérifiez que chaque activité est liée à votre proposition de valeur", "Identifiez les activités critiques à ne pas déléguer"],
        examples: ["Activités clés : 1) Développement plateforme, 2) Recrutement producteurs, 3) Marketing, 4) Service client, 5) Logistique."],
        guidedQuestions: [
          { question: "Quelles sont vos activités clés résumées ?", placeholder: "1. ... 2. ... 3. ... 4. ... 5. ...", type: 'textarea' },
          { question: "Ces activités sont-elles alignées avec votre proposition de valeur ?", placeholder: "Analyse d'alignement...", type: 'textarea' },
        ],
        estimatedMinutes: 10,
      },
      {
        key: 'synthese_ressources', label: "Synthèse des ressources", objective: "Résumer les ressources nécessaires à votre projet",
        whyImportant: "Connaître précisément vos besoins en ressources vous aide à planifier vos recrutements et vos investissements.",
        tips: ["Distinguez les ressources déjà acquises de celles à obtenir", "Estimez le budget nécessaire pour chaque ressource manquante", "Priorisez les ressources critiques"],
        examples: ["Ressources : équipe de 3 personnes, 80 000€ de financement, plateforme technique, réseau de 50 producteurs."],
        guidedQuestions: [
          { question: "Quelles sont vos ressources clés résumées ?", placeholder: "Humaines : ... Financières : ... Matérielles : ...", type: 'textarea' },
          { question: "Quelles ressources vous manquent encore ?", placeholder: "Ressources à acquérir...", type: 'textarea' },
        ],
        estimatedMinutes: 10,
      },
      {
        key: 'synthese_canaux', label: "Synthèse des canaux et relations", objective: "Résumer vos canaux et votre stratégie relationnelle",
        whyImportant: "Une stratégie de canaux et de relations cohérente garantit une expérience client harmonieuse.",
        tips: ["Vérifiez que vos canaux sont adaptés à votre cible", "Assurez la cohérence entre vos canaux de communication et de distribution", "Votre stratégie relationnelle doit refléter vos valeurs"],
        examples: ["Canaux : acquisition via SEO/réseaux sociaux, distribution directe, communication multicanal. Relation : personnalisée pour les producteurs, automatisée pour les consommateurs."],
        guidedQuestions: [
          { question: "Résumez votre stratégie de canaux et de relations", placeholder: "Synthèse...", type: 'textarea' },
          { question: "Vos canaux sont-ils cohérents avec votre marché cible ?", placeholder: "Analyse de cohérence...", type: 'textarea' },
        ],
        estimatedMinutes: 10,
      },
    ],
    checklist: ["J'ai synthétisé mes activités clés", "J'ai résumé mes besoins en ressources", "J'ai vérifié la cohérence de mes canaux", "L'ensemble opérationnel est cohérent avec ma stratégie"],
  },

  16: {
    stepNumber: 16,
    title: "Structure des coûts",
    objective: "Identifier et estimer tous les coûts nécessaires au fonctionnement de votre projet.",
    whyImportant: "Maîtriser ses coûts est aussi important que générer des revenus. 29% des startups échouent parce qu'elles manquent de trésorerie.",
    keyConcepts: [
      { term: "Coûts fixes", definition: "Charges qui ne varient pas avec le volume d'activité (loyer, salaires, assurances)." },
      { term: "Coûts variables", definition: "Charges qui augmentent avec le volume d'activité (matières premières, commissions)." },
      { term: "Seuil de rentabilité", definition: "Le chiffre d'affaires minimum à atteindre pour couvrir toutes les charges, sans perte ni bénéfice." },
    ],
    estimatedMinutes: 55,
    subSections: [
      {
        key: 'couts_fixes', label: "Coûts fixes", objective: "Lister et estimer vos charges fixes mensuelles",
        whyImportant: "Les coûts fixes sont à payer quoi qu'il arrive. Les sous-estimer est l'une des principales causes de défaillance.",
        tips: ["Listez TOUT : loyer, salaires, assurances, abonnements, services", "Ajoutez 20% de marge de sécurité", "Identifiez les coûts fixes que vous pourriez réduire en cas de besoin"],
        examples: ["Coûts fixes mensuels : loyer 1500€, salaires 8000€, assurances 200€, abonnements 300€, services 500€ = 10 500€/mois."],
        guidedQuestions: [
          { question: "Quels sont vos coûts fixes mensuels estimés ?", placeholder: "Loyer : ... Salaires : ... Assurances : ... Abonnements : ... Autres : ...", type: 'textarea' },
          { question: "Quel est le total de vos charges fixes mensuelles ?", placeholder: "ex: 10 500€/mois", type: 'text' },
        ],
        estimatedMinutes: 15,
      },
      {
        key: 'couts_variables', label: "Coûts variables", objective: "Estimer vos coûts variables par unité vendue",
        whyImportant: "Les coûts variables déterminent votre marge brute. Plus ils sont faibles, plus chaque vente est rentable.",
        tips: ["Calculez le coût variable unitaire de votre produit", "Identifiez les coûts variables qui augmentent avec la croissance", "Négociez avec vos fournisseurs pour réduire les coûts variables"],
        examples: ["Coûts variables par commande : commission producteur 15%, emballage 2€, transport 5€, frais plateforme 3€ = 25% du prix de vente."],
        guidedQuestions: [
          { question: "Quels sont vos coûts variables par unité vendue ?", placeholder: "Commission : ... Emballage : ... Transport : ... Autres : ...", type: 'textarea' },
          { question: "Quel est votre coût variable total en pourcentage du prix de vente ?", placeholder: "ex: 30% du prix de vente", type: 'text' },
        ],
        estimatedMinutes: 15,
      },
      {
        key: 'investissements_initial', label: "Investissements initiaux", objective: "Lister les investissements nécessaires au démarrage",
        whyImportant: "Les investissements initiaux sont votre ticket d'entrée. Les sous-estimer peut bloquer votre démarrage.",
        tips: ["Distinguez investissements obligatoires (matériel, dépôt de garantie) et optionnels", "Prévoyez une réserve pour imprévus", "Étalez les investissements si possible"],
        examples: ["Investissements : développement site (15 000€), matériel bureau (3000€), dépôt de garantie (3000€), stock initial (5000€), trésorerie de départ (10 000€) = 36 000€."],
        guidedQuestions: [
          { question: "Quels sont les investissements nécessaires au lancement ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
          { question: "Quel est le montant total des investissements ?", placeholder: "ex: 50 000€", type: 'text' },
        ],
        estimatedMinutes: 15,
      },
      {
        key: 'seuil_rentabilite', label: "Seuil de rentabilité", objective: "Calculer le seuil de rentabilité de votre projet",
        whyImportant: "Le seuil de rentabilité répond à la question cruciale : 'À partir de combien de ventes suis-je rentable ?'",
        tips: ["Formule : charges fixes / (prix de vente - coût variable unitaire)", "Calculez aussi le nombre de clients nécessaires pour l'atteindre", "Un seuil bas signifie un risque plus faible"],
        examples: ["Charges fixes annuelles : 126 000€. Marge unitaire : 15€. Seuil : 8400 ventes/an = 700/mois = 23/jour."],
        guidedQuestions: [
          { question: "Quel est votre seuil de rentabilité mensuel estimé ?", placeholder: "ex: 700 ventes/mois ou 50 000€ CA/mois", type: 'text' },
          { question: "Combien de clients cela représente-t-il par mois ?", placeholder: "Nombre de clients nécessaire...", type: 'text' },
        ],
        estimatedMinutes: 10,
      },
    ],
    checklist: ["J'ai listé mes coûts fixes mensuels", "J'ai estimé mes coûts variables", "J'ai listé mes investissements initiaux", "J'ai calculé mon seuil de rentabilité"],
  },

  17: {
    stepNumber: 17,
    title: "Flux de revenus",
    objective: "Identifier et structurer vos sources de revenus pour assurer la viabilité financière de votre projet.",
    whyImportant: "Sans revenus, pas d'entreprise. Diversifier vos sources de revenus réduit les risques et augmente la résilience de votre projet.",
    keyConcepts: [
      { term: "Flux de revenus", definition: "Les différentes sources de revenus de votre entreprise (vente, abonnement, commission, publicité)." },
      { term: "Modèle de tarification", definition: "Comment vous fixez vos prix : coût + marge, prix de marché, valeur perçue, abonnement." },
      { term: "Projection de revenus", definition: "Estimation chiffrée de vos revenus futurs sur 3 ans." },
    ],
    estimatedMinutes: 50,
    subSections: [
      {
        key: 'sources_revenus', label: "Sources de revenus", objective: "Identifier toutes vos sources de revenus potentielles",
        whyImportant: "Des sources de revenus diversifiées réduisent la dépendance à un seul canal et sécurisent votre trésorerie.",
        tips: ["Listez les sources directes (vente) et indirectes (commission, publicité)", "Un modèle freemium peut convertir des utilisateurs gratuits en payants", "Testez différents modèles pour trouver le plus rentable"],
        examples: ["Sources : 1) Commission de 15% sur chaque transaction, 2) Abonnement premium producteurs (29€/mois), 3) Publicité ciblée, 4) Vente de données anonymisées."],
        guidedQuestions: [
          { question: "Quelles sont vos sources de revenus potentielles ?", placeholder: "1. ... 2. ... 3. ... 4. ...", type: 'textarea' },
          { question: "Quelle sera votre source de revenus principale ?", placeholder: "Source principale...", type: 'text' },
        ],
        estimatedMinutes: 15,
      },
      {
        key: 'modele_tarification', label: "Modèle de tarification", objective: "Définir votre stratégie de prix",
        whyImportant: "Le prix est le signal de votre valeur. Un prix trop bas peut dévaloriser votre offre, un prix trop haut peut freiner l'adoption.",
        tips: ["Étudiez les prix pratiqués par vos concurrents", "Testez différents prix auprès de clients potentiels", "Un prix juste = le client est satisfait ET vous dégagez une marge"],
        examples: ["Tarification : commission de 15% sur chaque transaction (prix du marché). Abonnement premium à 29€/mois (vs 39€ chez le concurrent direct)."],
        guidedQuestions: [
          { question: "Quel est votre modèle de tarification ?", type: 'select', options: [{ label: 'Prix unique', value: 'fixed' }, { label: 'Abonnement', value: 'subscription' }, { label: 'Commission', value: 'commission' }, { label: 'Freemium', value: 'freemium' }, { label: 'Mixte', value: 'mixed' }] },
          { question: "Comment avez-vous déterminé ce prix ?", placeholder: "Justification du prix...", type: 'textarea' },
        ],
        estimatedMinutes: 15,
      },
      {
        key: 'projection_revenus', label: "Projection de revenus", objective: "Estimer vos revenus prévisionnels sur 3 ans",
        whyImportant: "Les projections de revenus sont essentielles pour planifier votre croissance et rassurer vos investisseurs.",
        tips: ["Faites 3 scénarios : pessimiste, réaliste, optimiste", "Basez-vous sur des hypothèses réalistes et justifiées", "Actualisez vos projections régulièrement"],
        examples: ["Scénario réaliste : Année 1 : 50 000€ (500 clients), Année 2 : 200 000€ (2000 clients), Année 3 : 500 000€ (5000 clients)."],
        guidedQuestions: [
          { question: "Quel est votre chiffre d'affaires prévisionnel année 1 ?", placeholder: "CA année 1...", type: 'text' },
          { question: "Quel est votre chiffre d'affaires prévisionnel année 2 ?", placeholder: "CA année 2...", type: 'text' },
          { question: "Quel est votre chiffre d'affaires prévisionnel année 3 ?", placeholder: "CA année 3...", type: 'text' },
          { question: "Quelles sont les hypothèses derrière ces projections ?", placeholder: "Hypothèses : nombre clients, prix, croissance...", type: 'textarea' },
        ],
        estimatedMinutes: 20,
      },
    ],
    checklist: ["J'ai identifié mes sources de revenus", "J'ai défini mon modèle de tarification", "J'ai établi mes projections de revenus", "J'ai documenté mes hypothèses"],
  },

  18: {
    stepNumber: 18,
    title: "Résumé financier du modèle économique",
    objective: "Synthétiser la structure financière de votre projet et vérifier sa viabilité économique.",
    whyImportant: "Un résumé financier clair vous permet d'avoir une vision d'ensemble de votre santé financière et de communiquer avec des investisseurs ou banquiers.",
    keyConcepts: [
      { term: "Rentabilité", definition: "Capacité à dégager un bénéfice, lorsque les revenus dépassent les coûts." },
      { term: "Plan de trésorerie", definition: "Prévision des entrées et sorties d'argent mois par mois." },
    ],
    estimatedMinutes: 35,
    subSections: [
      {
        key: 'synthese_couts', label: "Synthèse des coûts", objective: "Résumer l'ensemble des coûts de votre projet",
        whyImportant: "Une vision synthétique de vos coûts vous permet de prendre des décisions éclairées et d'identifier les économies possibles.",
        tips: ["Reprenez les totaux de vos coûts fixes, variables et investissements", "Calculez le coût de revient unitaire de votre produit", "Identifiez les 3 plus gros postes de dépenses"],
        examples: ["Coûts fixes : 10 500€/mois (126 000€/an). Coûts variables : 25% du prix. Investissement initial : 36 000€. Coût revient unitaire : 8€."],
        guidedQuestions: [
          { question: "Quel est le total de vos coûts fixes annuels ?", placeholder: "ex: 126 000€/an", type: 'text' },
          { question: "Quels sont vos 3 plus gros postes de dépenses ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
        ],
        estimatedMinutes: 12,
      },
      {
        key: 'synthese_revenus', label: "Synthèse des revenus", objective: "Résumer vos prévisions de revenus",
        whyImportant: "La confrontation de vos revenus à vos coûts vous dit si votre modèle économique est viable.",
        tips: ["Comparez vos revenus prévisionnels à vos coûts totaux", "Calculez votre marge brute et votre marge nette", "Identifiez le poids de chaque source de revenus"],
        examples: ["CA annuel cible : 200 000€. Marge brute : 150 000€ (75%). Marge nette : 24 000€ (12%). Source principale : commission (60%)."],
        guidedQuestions: [
          { question: "Quel est votre chiffre d'affaires total cible ?", placeholder: "ex: 200 000€/an", type: 'text' },
          { question: "Quelle est la part de chaque source de revenus ?", placeholder: "Source A : ...% Source B : ...% Source C : ...%", type: 'textarea' },
        ],
        estimatedMinutes: 12,
      },
      {
        key: 'rentabilite_previsionnelle', label: "Rentabilité prévisionnelle", objective: "Évaluer quand votre projet deviendra rentable",
        whyImportant: "Connaître votre point de rentabilité vous aide à gérer votre trésorerie et à savoir combien de temps vous devez tenir avant d'être rentable.",
        tips: ["Calculez votre résultat net prévisionnel année par année", "Estimez votre besoin en fonds de roulement", "Préparez un plan de trésorerie sur 12 mois minimum"],
        examples: ["Année 1 : -15 000€ (démarrage). Année 2 : -5000€ (quasi-équilibre). Année 3 : +30 000€ (rentabilité). Seuil de rentabilité : 18 mois."],
        guidedQuestions: [
          { question: "Quel est votre résultat net prévisionnel année 1 ?", placeholder: "ex: -15 000€", type: 'text' },
          { question: "À quel horizon atteignez-vous la rentabilité ?", placeholder: "ex: 18 à 24 mois", type: 'text' },
        ],
        estimatedMinutes: 11,
      },
    ],
    checklist: ["J'ai synthétisé mes coûts totaux", "J'ai résumé mes prévisions de revenus", "J'ai évalué ma rentabilité prévisionnelle", "J'ai identifié mon besoin de trésorerie"],
  },

  19: {
    stepNumber: 19,
    title: "Préparer et réaliser les tests terrain",
    objective: "Concevoir et mener des tests auprès de vrais clients pour valider vos hypothèses sur le terrain.",
    whyImportant: "Les tests terrain sont le seul moyen de savoir si votre projet répond réellement aux besoins. 70% des startups qui échouent le font parce qu'elles n'ont pas validé leurs hypothèses auprès de vrais clients.",
    keyConcepts: [
      { term: "Test terrain", definition: "Validation de vos hypothèses entrepreneuriales auprès de clients réels dans leur environnement naturel." },
      { term: "Hypothèse", definition: "Affirmation provisoire sur votre marché, vos clients ou votre produit que vous devez valider ou infirmer." },
      { term: "Découverte client", definition: "Processus structuré d'entretiens et d'observations pour comprendre en profondeur vos clients." },
    ],
    estimatedMinutes: 120,
    subSections: [
      {
        key: 'interviews_clients', label: "Interviews clients", objective: "Mener des entretiens individuels pour comprendre les besoins profonds",
        whyImportant: "Les interviews sont l'outil de validation le plus puissant. Elles révèlent des insights que les questionnaires ne captent pas.",
        tips: ["Menez au moins 10 entretiens par segment de clientèle", "Ne parlez pas de votre solution : concentrez-vous sur le problème", "Écoutez 80% du temps, parlez 20%"],
        examples: ["Question d'interview : 'Racontez-moi la dernière fois que vous avez cherché à acheter local. Qu'est-ce qui s'est passé ?'"],
        guidedQuestions: [
          { question: "Combien d'entretiens prévoyez-vous de réaliser ?", placeholder: "ex: 15 entretiens", type: 'text' },
          { question: "Quelles sont les questions clés de votre guide d'entretien ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
          { question: "Comment recruterez-vous les personnes à interroger ?", placeholder: "ex: via des groupes Facebook, réseau personnel, salons...", type: 'textarea' },
        ],
        estimatedMinutes: 30,
      },
      {
        key: 'observations_terrain', label: "Observations terrain", objective: "Observer vos clients potentiels dans leur environnement réel",
        whyImportant: "L'observation révèle des comportements que les gens n'expriment pas verbalement. C'est une source d'insights complémentaire aux interviews.",
        tips: ["Observez sans intervenir pour ne pas influencer", "Prenez des notes détaillées sur les comportements", "Cherchez les écarts entre ce que les gens disent et ce qu'ils font"],
        examples: ["Observation : passer une matinée au marché local pour voir comment les clients choisissent leurs produits et interagissent avec les producteurs."],
        guidedQuestions: [
          { question: "Quels contextes d'observation sont pertinents pour votre projet ?", placeholder: "ex: marché, supermarché, salon, espace de coworking...", type: 'textarea' },
          { question: "Quels comportements spécifiques souhaitez-vous observer ?", placeholder: "ex: comment ils comparent les prix, comment ils choisissent...", type: 'textarea' },
        ],
        estimatedMinutes: 25,
      },
      {
        key: 'questionnaires_sondages', label: "Questionnaires et sondages", objective: "Concevoir et diffuser un questionnaire pour collecter des données chiffrées",
        whyImportant: "Les questionnaires permettent d'obtenir des données quantitatives sur un échantillon large pour valider statistiquement vos hypothèses.",
        tips: ["Maximum 10 questions", "Utilisez Google Forms ou Typeform (gratuit)", "Diffusez sur les réseaux sociaux et forums spécialisés"],
        examples: ["Question : 'Seriez-vous prêt à payer 5€/mois pour un service qui livre des produits locaux chez vous ?'"],
        guidedQuestions: [
          { question: "Quelles sont les 5 à 8 questions clés de votre sondage ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
          { question: "Auprès de qui allez-vous diffuser ce questionnaire ?", placeholder: "ex: Groupes Facebook, Linkedin, forums, emailing...", type: 'textarea' },
          { question: "Quel est votre objectif de réponses ?", hint: "100+ réponses pour des données significatives", placeholder: "ex: 200 réponses", type: 'text' },
        ],
        estimatedMinutes: 25,
      },
      {
        key: 'validation_hypotheses', label: "Validation des hypothèses", objective: "Confronter vos hypothèses initiales aux données collectées",
        whyImportant: "La validation terrain transforme vos suppositions en certitudes (ou vous force à revoir votre copie).",
        tips: ["Listez toutes vos hypothèses de départ avant les tests", "Pour chaque hypothèse, notez si elle est validée ou non", "Soyez honnête : une hypothèse invalidée est un apprentissage précieux"],
        examples: ["Hypothèse 1 : 'Les gens veulent des produits locaux' → validée (85% des répondants). Hypothèse 2 : 'Ils sont prêts à payer plus cher' → invalidée (prix max = prix supermarché)."],
        guidedQuestions: [
          { question: "Quelles étaient vos hypothèses de départ ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
          { question: "Les données collectées valident-elles ces hypothèses ?", placeholder: "Hypothèse 1 : validée/invalidée parce que...", type: 'textarea' },
        ],
        estimatedMinutes: 20,
      },
      {
        key: 'fiches_decouverte', label: "Fiches de découverte client", objective: "Synthétiser vos apprentissages terrain par fiche client",
        whyImportant: "Les fiches de découverte client sont un outil structurant qui résume tout ce que vous avez appris sur vos segments de clientèle.",
        tips: ["Créez une fiche par profil de client rencontré", "Incluez : besoins, frustrations, comportements, citations", "Partagez ces fiches avec votre équipe pour aligner tout le monde"],
        examples: ["Fiche Sophie : 28 ans, urbaine, cherche gain de temps, frustrée par le manque d'offres locales fiables, citation : 'Je voudrais pouvoir commander en 2 clics'."],
        guidedQuestions: [
          { question: "Quels sont les profils clients types que vous avez découverts ?", placeholder: "Profil 1 : ... Profil 2 : ...", type: 'textarea' },
          { question: "Quels sont les enseignements clés de chaque fiche ?", placeholder: "Enseignements...", type: 'textarea' },
        ],
        estimatedMinutes: 20,
      },
    ],
    checklist: ["J'ai mené des entretiens clients approfondis", "J'ai réalisé des observations terrain", "J'ai diffusé un questionnaire et obtenu des réponses", "J'ai validé ou invalidé mes hypothèses", "J'ai rédigé des fiches de découverte client"],
  },

  20: {
    stepNumber: 20,
    title: "Plans de mise en œuvre",
    objective: "Élaborer les plans opérationnels, marketing, commercial et financier pour concrétiser votre projet.",
    whyImportant: "Un projet sans plan de mise en œuvre reste une intention. Des plans concrets, avec des échéances et des responsables, transforment votre vision en réalité.",
    keyConcepts: [
      { term: "Plan opérationnel", definition: "Planning détaillé des actions à mener, avec des jalons et des responsables." },
      { term: "Plan marketing", definition: "Stratégie et actions pour faire connaître votre offre et acquérir des clients." },
      { term: "Plan financier", definition: "Budget prévisionnel incluant les investissements, les charges et les revenus attendus." },
    ],
    estimatedMinutes: 120,
    subSections: [
      {
        key: 'plan_operationnel', label: "Plan opérationnel", objective: "Définir les actions concrètes et leur calendrier",
        whyImportant: "Un plan opérationnel détaillé est votre feuille de route quotidienne. Il transforme la stratégie en actions.",
        tips: ["Découpez par phases : préparation, lancement, croissance", "Assignez un responsable et une date butoir à chaque action", "Prévoyez des points de revue réguliers"],
        examples: ["Phase 1 (Mois 1-2) : développement MVP (responsable : CTO). Phase 2 (Mois 3) : test bêta (responsable : PM). Phase 3 (Mois 4) : lancement (toute l'équipe)."],
        guidedQuestions: [
          { question: "Quelles sont les grandes phases de votre mise en œuvre ?", placeholder: "Phase 1 : ... Phase 2 : ... Phase 3 : ...", type: 'textarea' },
          { question: "Quel est le calendrier prévisionnel pour chaque phase ?", placeholder: "Mois 1-2 : ... Mois 3-4 : ... Mois 5-6 : ...", type: 'textarea' },
          { question: "Qui est responsable de chaque action clé ?", placeholder: "Action : ... Responsable : ...", type: 'textarea' },
        ],
        estimatedMinutes: 25,
      },
      {
        key: 'plan_marketing', label: "Plan marketing et acquisition", objective: "Définir votre stratégie pour attirer et convaincre vos clients",
        whyImportant: "Le meilleur produit du monde ne sert à rien si personne ne le connaît. Un plan marketing structuré est indispensable.",
        tips: ["Définissez vos objectifs d'acquisition par canal", "Calculez votre budget marketing mensuel", "Prévoyez des actions avant, pendant et après le lancement"],
        examples: ["Objectifs : 1000 visiteurs/mois via SEO, 500 via Instagram, 200 via partenariats. Budget : 2000€/mois. Actions : 2 articles blog/semaine, 5 posts Instagram/jour."],
        guidedQuestions: [
          { question: "Quels sont vos objectifs marketing chiffrés ?", placeholder: "ex: 1000 visiteurs/mois, 100 leads/mois...", type: 'textarea' },
          { question: "Quelles actions marketing prévoyez-vous ?", placeholder: "Action 1 : ... Action 2 : ... Action 3 : ...", type: 'textarea' },
          { question: "Quel est votre budget marketing mensuel ?", placeholder: "ex: 3000€/mois", type: 'text' },
        ],
        estimatedMinutes: 20,
      },
      {
        key: 'plan_commercial', label: "Plan commercial et vente", objective: "Structurer votre processus de vente pour convertir les prospects en clients",
        whyImportant: "Sans processus de vente, vous laissez vos prospects s'échapper. Un plan commercial structuré augmente votre taux de conversion.",
        tips: ["Définissez votre tunnel de vente (étapes de la découverte à l'achat)", "Formez-vous à la vente si ce n'est pas votre point fort", "Mesurez votre taux de conversion à chaque étape"],
        examples: ["Tunnel : prospect intéressé → démo gratuite → proposition commerciale → signature → onboarding. Taux de conversion cible : 20%."],
        guidedQuestions: [
          { question: "Quelles sont les étapes de votre processus de vente ?", placeholder: "1. ... 2. ... 3. ... 4. ...", type: 'textarea' },
          { question: "Quel est votre objectif de ventes mensuel ?", placeholder: "ex: 50 nouveaux clients/mois", type: 'text' },
          { question: "Quels outils utiliserez-vous pour suivre vos ventes ?", placeholder: "ex: CRM HubSpot, tableau de bord...", type: 'textarea' },
        ],
        estimatedMinutes: 20,
      },
      {
        key: 'plan_financier', label: "Plan financier et budget", objective: "Établir un budget prévisionnel détaillé pour les 12 à 18 prochains mois",
        whyImportant: "Un plan financier solide vous permet d'anticiper vos besoins de trésorerie et d'éviter les mauvaises surprises.",
        tips: ["Distinguez les dépenses une fois (investissements) et récurrentes", "Prévoyez un scénario pessimiste avec 20% de marge", "Suivez votre trésorerie chaque semaine"],
        examples: ["Budget mensuel : salaires 10 000€, marketing 2000€, outils 500€, loyer 1500€ = 14 000€. Trésorerie disponible : 50 000€ = 3,5 mois d'autonomie."],
        guidedQuestions: [
          { question: "Quel est votre budget mensuel prévisionnel ?", placeholder: "Poste 1 : ... Poste 2 : ... Poste 3 : ...", type: 'textarea' },
          { question: "Quelle est votre autonomie de trésorerie estimée ?", placeholder: "ex: 6 mois", type: 'text' },
        ],
        estimatedMinutes: 20,
      },
      {
        key: 'recherche_financement', label: "Recherche de financement", objective: "Identifier et contacter les sources de financement adaptées",
        whyImportant: "La recherche de financement prend du temps. Anticiper les démarches augmente vos chances d'obtenir les fonds nécessaires.",
        tips: ["Préparez un pitch deck de 10 slides", "Identifiez 20 investisseurs potentiels et personnalisez votre approche", "Les aides publiques (BPI, France Active) sont accessibles sans dilution"],
        examples: ["Plan de financement : apport personnel 20%, love money 10%, BPI subvention 30%, prêt bancaire 40%. Échéancier : obtention dans 3-6 mois."],
        guidedQuestions: [
          { question: "Quelles sources de financement ciblez-vous ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
          { question: "Quel montant total devez-vous lever ?", placeholder: "ex: 80 000€", type: 'text' },
          { question: "À quel horizon ?", placeholder: "ex: D'ici 6 mois", type: 'text' },
        ],
        estimatedMinutes: 20,
      },
      {
        key: 'gestion_ressources', label: "Gestion des ressources et recrutements", objective: "Planifier vos besoins en ressources humaines et matérielles",
        whyImportant: "Les bonnes personnes au bon moment font la différence. Une planification des ressources évite les goulots d'étranglement.",
        tips: ["Identifiez les compétences critiques à recruter en priorité", "Prévoyez un budget recrutement", "Envisagez le recours à des freelances pour les besoins ponctuels"],
        examples: ["Recrutements : Mois 3 : développeur full-stack (CDI). Mois 6 : commercial (CDI). Mois 9 : community manager (freelance). Budget salaires : 15 000€/mois."],
        guidedQuestions: [
          { question: "Quels postes devez-vous recruter et quand ?", placeholder: "Poste : ... Quand : ...", type: 'textarea' },
          { question: "Quels sont vos besoins en équipement et locaux ?", placeholder: "Besoins matériels...", type: 'textarea' },
        ],
        estimatedMinutes: 15,
      },
    ],
    checklist: ["J'ai un plan opérationnel détaillé avec calendrier", "J'ai défini mon plan marketing et acquisition", "J'ai structuré mon processus de vente", "J'ai établi un budget prévisionnel", "J'ai identifié mes sources de financement", "J'ai planifié mes besoins en ressources"],
  },

  21: {
    stepNumber: 21,
    title: "Définition et suivi des indicateurs",
    objective: "Définir et mettre en place les indicateurs clés de performance (KPI) pour suivre et améliorer votre projet.",
    whyImportant: "Ce qui ne se mesure pas ne s'améliore pas. Les KPI sont votre tableau de bord de pilotage. Ils vous permettent de prendre des décisions éclairées et de corriger le cap rapidement.",
    keyConcepts: [
      { term: "KPI", definition: "Indicateur Clé de Performance. Une métrique quantifiable qui mesure l'efficacité d'une action ou l'atteinte d'un objectif." },
      { term: "Tableau de bord", definition: "Outil de pilotage qui regroupe vos KPI principaux pour une vue d'ensemble de votre performance." },
      { term: "Benchmark", definition: "Comparaison de vos indicateurs avec ceux de votre secteur ou de vos concurrents." },
    ],
    estimatedMinutes: 60,
    subSections: [
      {
        key: 'kpi_financiers', label: "KPI financiers", objective: "Définir les indicateurs financiers clés de votre projet",
        whyImportant: "Les KPI financiers sont la traduction chiffrée de votre santé économique. Ils sont indispensables pour piloter votre entreprise.",
        tips: ["Suivez au minimum : CA mensuel, marge brute, trésorerie", "Comparez vos chiffres à vos prévisions", "Un KPI financier doit être suivi au moins une fois par mois"],
        examples: ["KPI : CA mensuel (objectif : 15 000€), Marge brute (objectif : > 60%), Trésorerie disponible (alerte : < 3 mois), Coût d'acquisition client (objectif : < 20€)."],
        guidedQuestions: [
          { question: "Quels sont vos KPI financiers principaux ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
          { question: "Quels sont vos objectifs pour chaque KPI ?", placeholder: "KPI 1 : objectif X...", type: 'textarea' },
          { question: "À quelle fréquence les suivrez-vous ?", placeholder: "ex: chaque semaine, chaque mois...", type: 'text' },
        ],
        estimatedMinutes: 12,
      },
      {
        key: 'kpi_commerciaux', label: "KPI commerciaux et clients", objective: "Définir les indicateurs de performance commerciale et de satisfaction client",
        whyImportant: "La satisfaction et la fidélisation client sont les meilleurs prédicteurs de la croissance à long terme.",
        tips: ["Suivez le NPS (Net Promoter Score) pour mesurer la satisfaction", "Le taux de rétention est plus important que le nombre de nouveaux clients", "Un client satisfait en amène d'autres"],
        examples: ["KPI : NPS (objectif : > 50), Taux de rétention mensuel (objectif : > 90%), Nombre de nouveaux clients/mois (objectif : 100), Taux de conversion (objectif : 5%)."],
        guidedQuestions: [
          { question: "Quels sont vos KPI commerciaux et clients ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
          { question: "Comment mesurez-vous la satisfaction client ?", placeholder: "ex: enquête NPS après chaque achat", type: 'textarea' },
        ],
        estimatedMinutes: 12,
      },
      {
        key: 'kpi_environnementaux', label: "KPI environnementaux", objective: "Mesurer l'impact environnemental de votre activité",
        whyImportant: "Si votre projet a une dimension environnementale, ces KPI sont essentiels pour mesurer votre contribution et communiquer de façon transparente.",
        tips: ["Mesurez votre bilan carbone régulièrement", "Suivez votre consommation de ressources (eau, énergie, matières)", "Un impact positif mesuré est un avantage concurrentiel"],
        examples: ["KPI : Empreinte carbone par produit (objectif : -10%/an), % d'emballages recyclés (objectif : 100%), Déchets évités (objectif : 1 tonne/an), Part des fournisseurs éco-certifiés (objectif : 80%)."],
        guidedQuestions: [
          { question: "Quels sont vos KPI environnementaux ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
          { question: "Comment collectez-vous les données pour ces indicateurs ?", placeholder: "ex: factures, relevés, enquêtes fournisseurs...", type: 'textarea' },
        ],
        estimatedMinutes: 12,
      },
      {
        key: 'kpi_sociaux', label: "KPI sociaux", objective: "Mesurer l'impact social et la performance RH de votre projet",
        whyImportant: "La performance sociale est aussi importante que la performance financière pour un projet durable et responsable.",
        tips: ["Suivez la satisfaction et le turnover de votre équipe", "Mesurez votre contribution sociale (emplois créés, diversité)", "Des KPI sociaux positifs renforcent votre marque employeur"],
        examples: ["KPI : Taux de turnover (objectif : < 10%), Satisfaction équipe (objectif : > 4/5), Nombre d'emplois créés (objectif : 5 en année 1), Part de femmes dans l'équipe (objectif : 50%)."],
        guidedQuestions: [
          { question: "Quels sont vos KPI sociaux ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
          { question: "Comment mesurerez-vous l'impact social de votre projet ?", placeholder: "ex: nombre de bénéficiaires, emplois créés...", type: 'textarea' },
        ],
        estimatedMinutes: 12,
      },
      {
        key: 'kpi_impact', label: "KPI d'impact global", objective: "Définir les indicateurs qui mesurent l'impact global de votre projet",
        whyImportant: "Au-delà des KPI individuels, des indicateurs d'impact global vous donnent une vision d'ensemble de votre contribution.",
        tips: ["Définissez 2-3 indicateurs d'impact global qui résument votre mission", "Un indicateur d'impact doit être simple à comprendre et à communiquer", "Utilisez ces indicateurs dans vos rapports et communications"],
        examples: ["KPI impact : Nombre de producteurs locaux soutenus (objectif : 100), Tonnes de CO2 évitées (objectif : 500t), Taux de satisfaction des producteurs partenaires (objectif : > 90%)."],
        guidedQuestions: [
          { question: "Quels indicateurs mesurent le mieux l'impact global de votre projet ?", placeholder: "1. ... 2. ... 3. ...", type: 'textarea' },
          { question: "Comment communiquerez-vous ces indicateurs à vos parties prenantes ?", placeholder: "ex: rapport d'impact annuel, page web dédiée...", type: 'textarea' },
        ],
        estimatedMinutes: 12,
      },
    ],
    checklist: ["J'ai défini mes KPI financiers avec objectifs", "J'ai défini mes KPI commerciaux et clients", "J'ai défini mes KPI environnementaux", "J'ai défini mes KPI sociaux", "J'ai défini mes KPI d'impact global"],
  },
};
