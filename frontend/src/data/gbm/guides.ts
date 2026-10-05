export interface GbmGuide {
  stepKey: string
  title: string
  objective: string
  why: string
  instructions: string[]
  tips: string[]
  commonMistakes: string[]
  example?: string
  expectedResult: string
  faq: { q: string; a: string }[]
  resources: string[]
}

export const GBM_GUIDES: Record<string, GbmGuide> = {
  gbm_1: {
    stepKey: 'gbm_1',
    title: "Esquissez votre idée d'entreprise",
    objective: "Formuler clairement votre idée d'entreprise, ce que vous allez offrir, à qui, et avec qui.",
    why: "Une idée bien formulée est le socle de tout le Business Model Vert. Les étapes suivantes s'appuieront sur cette esquisse.",
    instructions: [
      "Décrivez votre idée en 3 à 5 phrases : que voulez-vous créer, pour quel besoin ?",
      "Précisez ce que vous allez offrir : produit, service, solution hybride ?",
      "Listez les catégories de clients que vous envisagez de servir.",
      "Identifiez les partenaires potentiels : fournisseurs, distributeurs, institutions.",
    ],
    tips: [
      "Restez simple : une page suffit à ce stade, ne cherchez pas la perfection.",
      "Pensez à la spécificité « verte » : quel bénéfice environnemental ou social ?",
      "Écrivez à la première personne, comme si vous expliquiez votre projet à un ami.",
    ],
    commonMistakes: [
      "Vouloir tout détailler dès le départ : ce n'est qu'une esquisse.",
      "Décrire un produit sans identifier pour qui il est créé.",
      "Oublier les partenaires, essentiels dans l'économie circulaire et solidaire.",
    ],
    example:
      "« Je souhaite créer une épicerie de quartier zéro déchet. J'offrirai des produits en vrac (alimentaire, hygiène, entretien). Mes clients : les habitants du quartier soucieux de l'environnement. Partenaires : producteurs locaux, associations de réemploi, la mairie. »",
    expectedResult: "Une description claire de votre idée, de votre offre, de vos clients cibles et de vos partenaires.",
    faq: [
      { q: "Je n'ai pas encore de nom d'entreprise, est-ce un problème ?", a: "Non, le nom vient plus tard. Concentrez-vous sur le fond de l'idée." },
      { q: "Puis-je modifier mon idée après cette étape ?", a: "Oui. Le GBM est vivant : l'étape 11 (pivot) sert justement à ajuster votre proposition de valeur." },
    ],
    resources: ["Modèle BMC vert", "Exemples d'épiceries coopératives"],
  },
  gbm_2: {
    stepKey: 'gbm_2',
    title: 'Identifier les problèmes et les besoins',
    objective: "Vérifier que votre idée répond à de réels problèmes environnementaux, sociaux et clients.",
    why: "Une entreprise ne survit que si elle résout un problème perçu comme important par ses clients et la société.",
    instructions: [
      "Listez les défis environnementaux que votre idée adresse (pollution, carbone, déchets…).",
      "Listez les défis sociaux (exclusion, inégalités, accès à l'emploi…).",
      "Identifiez les besoins concrets de vos clients potentiels.",
      "Décrivez vos propres motivations : pourquoi vous et votre équipe vous engagez.",
    ],
    tips: [
      "Privilégiez la qualité à la quantité : 2 à 3 problèmes bien identifiés valent mieux que 10 vagues.",
      "Allez vérifier sur le terrain : discutez avec de futurs clients avant de décider.",
      "Différenciez « besoin » (fondamental) de « envie » (superficielle).",
    ],
    commonMistakes: [
      "Inventer des problèmes qui n'existent pas (« solution à la recherche d'un problème »).",
      "Confondre vos motivations personnelles avec un besoin de marché.",
    ],
    example:
      "Problème environnemental : les emballages plastiques des produits de supermarché. Besoin client : acheter sans produire de déchet, à proximité et à prix raisonnable.",
    expectedResult: "Une liste claire des problèmes adressés et des besoins à satisfaire, qui justifie la suite du GBM.",
    faq: [
      { q: "Comment savoir si mon problème est « réel » ?", a: "Interviewez 10 à 15 personnes concernées et observez s'il est assez fort pour déclencher un achat." },
    ],
    resources: ["Méthode du Problem Interview (Lean Startup)"],
  },
  gbm_3: {
    stepKey: 'gbm_3',
    title: 'Comprendre le contexte (PESTEL)',
    objective: "Analyser les facteurs externes (Politique, Économique, Social, Technologique, Environnemental, Légal) qui influencent votre projet.",
    why: "Le contexte externe peut bloquer ou accélérer votre projet. L'anticiper réduit les risques et révèle des opportunités.",
    instructions: [
      "Pour chaque lettre du PESTEL, notez les facteurs qui peuvent influencer votre entreprise.",
      "Pour chaque facteur, précisez l'impact attendu et votre stratégie pour y faire face.",
      "Restez concis : une phrase par facteur suffit, mais couvrez les 6 dimensions.",
    ],
    tips: [
      "Pensez aux subventions vertes (P), à la fiscalité (É), aux tendances de consommation (S).",
      "Les réglementations environnementales (L) sont souvent décisives dans l'économie durable.",
      "Utilisez le PESTEL pour repérer des opportunités : nouvelles aides, marchés en croissance.",
    ],
    commonMistakes: [
      "Se limiter à une seule dimension (souvent l'économique).",
      "Décrire le contexte sans en tirer de conséquences pour le projet.",
    ],
    expectedResult: "Un tableau PESTEL complet : facteurs, impacts et réponses possibles pour chacun.",
    faq: [
      { q: "Dois-je actualiser mon PESTEL souvent ?", a: "Oui, au moins une fois par an ou à chaque grand changement de réglementation ou de marché." },
    ],
    resources: ["Grille PESTEL vierge", "Veille réglementaire environnementale"],
  },
  gbm_4: {
    stepKey: 'gbm_4',
    title: 'Fixez vos objectifs',
    objective: "Transformer les problèmes identifiés en objectifs concrets pour l'environnement, la société, vos clients et votre équipe.",
    why: "Des objectifs clairs permettent de mesurer votre impact et de garder le cap. C'est la base de vos futurs indicateurs (étape 20).",
    instructions: [
      "Reprenez les problèmes de l'étape 2 et transformez chacun en objectif mesurable.",
      "Formulez des objectifs SMART : Spécifiques, Mesurables, Atteignables, Réalistes, Temporels.",
      "Couvrez 4 dimensions : environnement, social, client, équipe.",
    ],
    tips: [
      "Exemple : « réduire de 30 % les déchets d'emballage d'ici 2 ans » plutôt que « être écolo ».",
      "Un objectif par problème prioritaire suffit à ce stade.",
    ],
    commonMistakes: [
      "Des objectifs vagues (« faire du bien à la planète ») impossibles à mesurer.",
      "Ne fixer que des objectifs économiques en oubliant l'impact.",
    ],
    expectedResult: "Des objectifs SMART couvrant l'environnement, le social, les clients et l'équipe.",
    faq: [
      { q: "Qui peut m'aider à fixer mes objectifs ?", a: "Vos incubateurs, coachs, ou l'assistant IA intégré qui peut reformuler vos objectifs en version SMART." },
    ],
    resources: ["Méthode SMART"],
  },
  gbm_5: {
    stepKey: 'gbm_5',
    title: 'Synthétiser une mission et une vision',
    objective: "Écrire votre mission (ce que vous faites, pourquoi) et votre vision (ce que vous voulez accomplir à long terme), ainsi que vos valeurs.",
    why: "Mission, vision et valeurs guident toutes vos décisions et vous différencient. Elles sont aussi très appréciées des investisseurs et partenaires.",
    instructions: [
      "Mission : une phrase qui résume votre raison d'être et votre contribution.",
      "Vision : décrivez le monde dans 5 à 10 ans grâce à votre action.",
      "Valeurs : choisissez 3 à 5 valeurs fondamentales qui guideront vos décisions.",
    ],
    tips: [
      "Testez votre mission : un étranger doit comprendre en une phrase qui vous êtes.",
      "Les valeurs doivent être incarnées : choisissez celles que vous ne trahirez jamais.",
    ],
    commonMistakes: [
      "Une mission trop longue ou trop générique (« être le leader mondial… »).",
      "Des valeurs décoratives qui ne se traduisent pas dans les pratiques.",
    ],
    example:
      "Mission : « Proposer une alimentation saine et zéro déchet aux habitants des quartiers urbains. » Vision : « Un quartier où chaque course se fait sans déchet et au profit des producteurs locaux. »",
    expectedResult: "Une phrase de mission, une phrase de vision, et 3 à 5 valeurs.",
    faq: [
      { q: "La vision doit-elle être réaliste ?", a: "Elle doit être ambitieuse mais crédible : elle donne une direction, pas une promesse chiffrée." },
    ],
    resources: ["Exemples de missions d'entreprises à impact"],
  },
  gbm_6: {
    stepKey: 'gbm_6',
    title: 'Résumé du contexte et des objectifs',
    objective: "Synthétiser les étapes 1 à 5 en un résumé clair, idéalement généré par l'IA.",
    why: "Ce résumé servira de référence pour tout le reste du GBM et pour votre communication (pitch, dossier, chatbot IA).",
    instructions: [
      "Cliquez sur « Générer résumé IA » pour synthétiser automatiquement vos étapes précédentes.",
      "Relisez et ajustez le résumé avec vos propres mots.",
      "Gardez 5 à 10 lignes maximum : percutant et précis.",
    ],
    tips: [
      "L'IA utilise vos réponses des étapes 1 à 5 : plus elles sont riches, meilleur sera le résumé.",
      "Ajoutez un chiffre clé (objectif, segment) pour rendre le résumé concret.",
    ],
    commonMistakes: [
      "Recopier l'intégralité des étapes précédentes au lieu de synthétiser.",
      "Ignorer le résumé IA sans le relire.",
    ],
    expectedResult: "Un résumé de 5 à 10 lignes couvrant le problème, la solution, la cible et les objectifs.",
    faq: [
      { q: "Que faire si l'IA ne répond pas ?", a: "L'IA est optionnelle : rédigez vous-même le résumé. Le service peut être temporairement indisponible." },
    ],
    resources: ["Assistant IA intégré"],
  },
  gbm_7a: {
    stepKey: 'gbm_7a',
    title: 'Parties prenantes',
    objective: "Lister toutes les parties prenantes de votre projet et définir comment les impliquer.",
    why: "Les parties prenantes (fournisseurs, mairie, financeurs, clients, associations) peuvent faire ou défaire votre projet. Les connaître vous permet de les engager efficacement.",
    instructions: [
      "Ajoutez une carte par partie prenante : nom, rôle, intérêt, influence.",
      "Évaluez le degré d'influence (faible, moyen, fort).",
      "Définissez une stratégie d'engagement pour chacune : informer, consulter, impliquer, co-construire.",
    ],
    tips: [
      "Commencez par les 5 à 8 parties prenantes les plus importantes.",
      "La matrice influence × intérêt aide à prioriser votre énergie d'engagement.",
    ],
    commonMistakes: [
      "N'oublier que les parties prenantes « évidentes » (clients, financeurs) au détriment des régulateurs ou de la communauté locale.",
      "Considérer toutes les parties prenantes comme aussi importantes.",
    ],
    example:
      "La mairie a une influence forte et un intérêt moyen (attractivité du quartier) : stratégie « impliquer » via un comité de pilotage local.",
    expectedResult: "Une liste de parties prenantes avec rôle, intérêt, influence et stratégie d'engagement.",
    faq: [
      { q: "Une partie prenante à forte influence et faible intérêt : que faire ?", a: "Gardez-la informée et surveillez-la : elle peut devenir un obstacle ou une alliée." },
    ],
    resources: ["Matrice pouvoir / intérêt"],
  },
  gbm_7b: {
    stepKey: 'gbm_7b',
    title: 'Cartes des parties prenantes',
    objective: "Pour chaque partie prenante clé, définir un échange « donnant-donnant » : ce qu'elle apporte et ce qu'elle reçoit.",
    why: "Un partenariat durable repose sur la réciprocité. Formaliser la contribution et la récompense évite les malentendus.",
    instructions: [
      "Reprenez vos parties prenantes prioritaires de l'étape 7a.",
      "Pour chacune, définissez sa contribution (ce qu'elle apporte).",
      "Définissez la récompense (ce que votre projet lui apporte en retour).",
    ],
    tips: [
      "La récompense n'est pas toujours monétaire : visibilité, sens, réseau, compétences.",
      "Cherchez des échanges équilibrés : chaque partie doit y trouver un gain.",
    ],
    commonMistakes: [
      "Des échanges déséquilibrés où une partie donne tout et ne reçoit rien.",
      "Oublier que certaines parties prenantes (associations) valorisent surtout la reconnaissance et l'impact.",
    ],
    expectedResult: "Des fiches donnant-donnant équilibrées pour vos parties prenantes clés.",
    faq: [
      { q: "Que faire si une partie prenante ne voit pas son intérêt ?", a: "Reformulez ce qu'elle reçoit (retour d'image, accès à un public, données, sens). Si aucun intérêt : changez d'approche ou de partenaire." },
    ],
    resources: ["Méthode de la carte partie prenante"],
  },
  gbm_8: {
    stepKey: 'gbm_8',
    title: 'Segments de clientèle',
    objective: "Définir vos segments de clientèle : qui vous servez, avec quelles souffrances, gains et fonctions attendues.",
    why: "Votre offre doit coller aux besoins réels de clients bien identifiés. Le segment précis rend votre proposition de valeur efficace.",
    instructions: [
      "Ajoutez un segment par carte : nom, description générique.",
      "Pour chaque segment, listez les souffrances (pains), les gains attendus (gains) et les fonctions (jobs to be done).",
      "Priorisez les segments les plus accessibles et rentables pour démarrer.",
    ],
    tips: [
      "Un segment = un groupe homogène qui partage mêmes besoins et moyens.",
      "Utilisez la grille Profil du client : tâches, gains, frustrations.",
      "Commencez par un segment « niche » que vous pouvez atteindre facilement.",
    ],
    commonMistakes: [
      "Définir « tout le monde » comme client : personne ne l'est.",
      "Mélanger plusieurs segments dans une même carte.",
    ],
    example:
      "Segment : ménages urbains de 25-45 ans, sensibles à l'écologie. Gains : réduction des déchets, économies. Souffrances : manque de temps, prix du vrac.",
    expectedResult: "1 à 3 segments de clientèle détaillés avec leurs pains, gains et fonctions.",
    faq: [
      { q: "Combien de segments faut-il ?", a: "Mieux vaut 1 à 3 segments bien compris que 10 segments vagues." },
    ],
    resources: ["Grille du profil client (Value Proposition Canvas)"],
  },
  gbm_9: {
    stepKey: 'gbm_9',
    title: 'Proposition de valeur',
    objective: "Décrire comment votre offre crée de la valeur pour vos clients et pour la société, en lien avec chaque segment.",
    why: "La proposition de valeur est le cœur du Business Model : c'est elle qui justifie que le client achète et que l'écosystème s'engage.",
    instructions: [
      "Décrivez la valeur environnementale et sociale de votre offre.",
      "Montrez comment votre solution soulage les souffrances et crée les gains de vos segments.",
      "Listez produits/services, valeur ajoutée face aux alternatives, et opportunités d'innovation.",
    ],
    tips: [
      "Formulez du point de vue client : « pour qui, quel problème, quelle solution, quel bénéfice ».",
      "Différenciez-vous : votre valeur ajoutée est votre avantage sur les alternatives.",
      "Alimentez les idées avec vos entretiens clients.",
    ],
    commonMistakes: [
      "Décrire les caractéristiques du produit plutôt que les bénéfices client.",
      "Une proposition de valeur identique à celle des concurrents.",
    ],
    example:
      "« Pour les ménages urbains pressés, MonPanierVrac livre des produits en vrac sans emballage en 24h : moins de déchets, économies de 20 %, et une alimentation de producteurs locaux. »",
    expectedResult: "Une proposition de valeur claire, différenciante, alignée sur vos segments.",
    faq: [
      { q: "Comment tester ma proposition de valeur ?", a: "C'est l'objet des étapes 10 et 19 : formuler des hypothèses et les tester auprès de vrais clients." },
    ],
    resources: ["Value Proposition Canvas"],
  },
  gbm_10: {
    stepKey: 'gbm_10',
    title: 'Test de la proposition',
    objective: "Formuler des hypothèses sur votre proposition de valeur et les tester rapidement auprès de clients réels.",
    why: "Mieux vaut échouer tôt et à petit coût. Tester vos hypothèses avant d'investir lourdement évite de construire ce que personne ne veut.",
    instructions: [
      "Pour chaque hypothèse, définissez une méthode de test simple (entretien, page de vente, prototype, précommande).",
      "Réalisez le test et consignez les résultats.",
      "Notez ce que vous avez appris, puis cochez si l'hypothèse est validée.",
    ],
    tips: [
      "Une hypothèse est testable si elle est précise : « 40 % des personnes interrogées précommanderont à 15 € ».",
      "Le plus petit test possible : une page, 5 entretiens, un prototype en carton.",
      "Enregistrez les verbatims clients : ils valent de l'or pour la suite.",
    ],
    commonMistakes: [
      "Tester auprès de ses amis ou de sa famille (biais de complaisance).",
      "Tester trop de choses à la fois.",
      "Interpréter les résultats de manière trop optimiste.",
    ],
    expectedResult: "Des tests réalisés, des résultats consignés et des hypothèses validées ou non.",
    faq: [
      { q: "Quand considérer une hypothèse validée ?", a: "Quand le comportement réel (achat, précommande, engagement) confirme votre prédiction, pas seulement des déclarations d'intention." },
    ],
    resources: ["Méthode du Test rapide (Lean Startup)"],
  },
  gbm_11: {
    stepKey: 'gbm_11',
    title: 'Pivot de la proposition de valeur',
    objective: "Décider, à partir des résultats des tests, si vous persévérez, pivotez ou abandonnez — et documenter la nouvelle orientation.",
    why: "Les meilleures entreprises ajustent leur offre en continu. Un pivot assumé est une force, pas un échec.",
    instructions: [
      "Rappelez vos hypothèses initiales et les résultats des tests.",
      "Prenez une décision explicite : persévérer, pivoter (client, offre, prix, canal…) ou abandonner.",
      "Si pivot : décrivez votre nouvelle proposition de valeur.",
    ],
    tips: [
      "Basez la décision sur des données, pas sur votre attachement émotionnel.",
      "Un pivot peut être partiel : changer uniquement le canal ou le modèle de prix.",
      "Documentez vos apprentissages : ils serviront à convaincre vos financeurs.",
    ],
    commonMistakes: [
      "Persévérer par fierté malgré des tests négatifs.",
      "Pivoter sans nouvelle hypothèse claire à tester.",
    ],
    expectedResult: "Une décision de pivot ou de persévérance argumentée, et si nécessaire une nouvelle proposition de valeur.",
    faq: [
      { q: "Le pivot est-il un échec ?", a: "Non. C'est un apprentissage qui vous rapproche du marché. Les investisseurs valorisent les équipes qui savent pivoter." },
    ],
    resources: ["Le pivot (Eric Ries, Lean Startup)"],
  },
  gbm_12a: {
    stepKey: 'gbm_12a',
    title: 'Relations clients & canaux',
    objective: "Choisir les relations à établir avec vos clients et les canaux pour les atteindre, les séduire et les fidéliser.",
    why: "Votre offre peut être excellente : si le client ne vous trouve pas et ne se sent pas accompagné, elle ne se vendra pas.",
    instructions: [
      "Définissez vos relations clients : assistance, automatisation, communauté, co-création…",
      "Listez vos canaux : site, boutiques, réseaux sociaux, distributeurs, partenaires.",
      "Expliquez votre stratégie de distribution : comment vous acheminerez la valeur.",
    ],
    tips: [
      "Allez là où sont vos clients : le canal choisi doit correspondre à leurs habitudes.",
      "Pensez au parcours complet : découverte, achat, livraison, support.",
      "Les canaux digitaux permettent souvent de réduire l'empreinte carbone (livraison mutualisée, dématérialisation).",
    ],
    commonMistakes: [
      "Trop de canaux au démarrage : impossible à piloter.",
      "Un canal de vente sans stratégie de fidélisation.",
    ],
    expectedResult: "Une stratégie de relation client et des canaux de distribution clairs et réalistes.",
    faq: [
      { q: "Quel canal choisir en premier ?", a: "Celui qui donne le plus de contact direct avec vos clients cibles, même à petite échelle : testez-le avant de vous développer." },
    ],
    resources: ["Grille des canaux du BMC"],
  },
  gbm_12b: {
    stepKey: 'gbm_12b',
    title: 'Parcours du client',
    objective: "Décrire le parcours de vos clients étape par étape et identifier les points à améliorer.",
    why: "Comprendre le parcours réel (avec ses points de friction) vous permet d'améliorer l'expérience et la fidélisation.",
    instructions: [
      "Ajoutez une carte par étape du parcours : découverte, évaluation, achat, usage, fidélisation.",
      "Pour chaque étape : points de contact, émotions ressenties.",
      "Proposez des idées d'amélioration pour chaque étape.",
    ],
    tips: [
      "Parcourez vous-même le parcours en tant que « client mystère ».",
      "Les points de friction créent les meilleures opportunités d'innovation.",
      "N'oubliez pas les étapes après-vente : recommandation et réachat.",
    ],
    commonMistakes: [
      "Se limiter à l'achat en oubliant l'usage et le support.",
      "Décrire un parcours idéal, non le parcours réel.",
    ],
    example:
      "Découverte : article de blog + bouche-à-oreille (émotion : curiosité). Achat : boutique en ligne (émotion : hésitation sur le prix). Amélioration : ajouter un comparateur de prix pour rassurer.",
    expectedResult: "Un parcours client complet avec points de contact, émotions et idées d'amélioration.",
    faq: [
      { q: "Qui doit valider le parcours ?", a: "Vos clients : confrontez votre description à leurs retours réels via entretiens ou observations." },
    ],
    resources: ["Customer Journey Map"],
  },
  gbm_13: {
    stepKey: 'gbm_13',
    title: 'Activités et ressources',
    objective: "Identifier les activités clés de votre entreprise et les ressources nécessaires pour les réaliser.",
    why: "Connaître vos activités et ressources vous aide à organiser votre équipe et à identifier les investissements et partenariats nécessaires.",
    instructions: [
      "Listez vos activités clés : production, R&D, commercial, logistique, maintenance…",
      "Listez les ressources clés : humaines, financières, techniques, physiques.",
      "Identifiez les partenaires stratégiques qui fournissent certaines activités ou ressources.",
    ],
    tips: [
      "Une activité est « clé » si elle crée directement de la valeur pour le client.",
      "Externalisez ce qui n'est pas stratégique pour rester agile.",
      "Dans l'économie durable, comptez les ressources matérielles et l'énergie comme ressources clés.",
    ],
    commonMistakes: [
      "Lister des activités « de confort » sans lien avec la création de valeur.",
      "Sous-estimer les ressources nécessaires (temps, budget, compétences).",
    ],
    expectedResult: "Une liste priorisée d'activités clés, ressources clés et partenaires stratégiques.",
    faq: [
      { q: "Comment prioriser mes activités ?", a: "Gardez celles qui génèrent le plus de valeur ou qui différencient votre offre ; déléguez le reste." },
    ],
    resources: ["Chaîne de valeur"],
  },
  gbm_14a: {
    stepKey: 'gbm_14a',
    title: 'Écoconception',
    objective: "Intégrer les principes d'écoconception dans votre offre : réduire l'impact environnemental sur tout le cycle de vie.",
    why: "L'écoconception est un avantage compétitif et souvent une exigence des financeurs et des clients. Elle réduit aussi vos coûts à terme.",
    instructions: [
      "Décrivez qui pilote la démarche d'écoconception dans votre équipe.",
      "Analysez l'impact sur tout le cycle de vie : matières premières, fabrication, transport, usage, fin de vie.",
      "Précisez le contexte environnemental et votre vision durable.",
    ],
    tips: [
      "Pensez aux 9 R : Refuser, Réduire, Réutiliser, Réparer, Rénover, Refabriquer, Réutiliser, Recycler, Récupérer.",
      "Commencez par le poste d'impact le plus fort (matière, énergie, transport).",
      "Impliquez vos fournisseurs : une grande partie de l'impact se joue en amont.",
    ],
    commonMistakes: [
      "Se limiter au recyclage alors que la réduction à la source est plus efficace.",
      "Négliger l'impact de l'usage du produit chez le client.",
    ],
    example:
      "Un produit textile éco-conçu : matières recyclées, teintures sans eau, livraison groupée, consigne pour le retour et la réparation en fin de vie.",
    expectedResult: "Une analyse du cycle de vie simplifiée et des actions d'écoconception identifiées.",
    faq: [
      { q: "L'écoconception coûte-t-elle plus cher ?", a: "Souvent moins à terme : moins de matière, moins d'énergie, moins de déchets, et une image valorisée." },
    ],
    resources: ["Principes de l'écoconception (ADEME)", "Analyse de cycle de vie (ACV)"],
  },
  gbm_14b: {
    stepKey: 'gbm_14b',
    title: "Résultats de l'écoconception",
    objective: "Mesurer et documenter les résultats de votre démarche d'écoconception et identifier les améliorations.",
    why: "Sans mesure, pas de progrès. Documenter les résultats vous permet de communiquer votre impact et d'alimenter vos indicateurs.",
    instructions: [
      "Rassemblez les résultats concrets de votre démarche (données, bilans, chiffres).",
      "Analysez la performance environnementale obtenue.",
      "Listez les pistes d'amélioration pour la prochaine itération.",
    ],
    tips: [
      "Chiffrez : économies de matière, réduction de CO2, kg de déchets évités.",
      "Conservez des preuves (factures, bilans, calculs) : elles serviront pour vos rapports d'impact.",
    ],
    commonMistakes: [
      "Des déclarations sans données vérifiables (risque de greenwashing).",
      "S'arrêter à la première amélioration sans plan de continuation.",
    ],
    expectedResult: "Un bilan chiffré de vos résultats écoconception et un plan d'amélioration.",
    faq: [
      { q: "Quels indicateurs suivre ?", a: "Consommation d'eau et d'énergie, taux de matière recyclée, déchets évités, taux de réparabilité — en lien avec l'étape 20." },
    ],
    resources: ["Bilan carbone simplifié", "Indicateurs RSE"],
  },
  gbm_15: {
    stepKey: 'gbm_15',
    title: 'Résumé des activités et ressources',
    objective: "Synthétiser les étapes 7 à 14b en un résumé clair de vos activités, ressources et réalisations.",
    why: "Ce résumé structure votre modèle d'exploitation et sert de base à votre dossier et à la partie financière.",
    instructions: [
      "Générez le résumé via l'IA pour synthétiser vos étapes précédentes.",
      "Complétez avec vos réalisations clés et vos prochaines étapes.",
      "Relisez pour vérifier la cohérence avec votre proposition de valeur.",
    ],
    tips: [
      "Le résumé doit montrer comment vos activités créent concrètement de la valeur.",
      "Mettez en avant une réalisation clé qui prouve l'avancement de votre projet.",
    ],
    commonMistakes: [
      "Un résumé trop opérationnel (détails) au détriment de la stratégie.",
      "Ignorer le résumé IA sans le corriger.",
    ],
    expectedResult: "Un résumé des activités, ressources, réalisations clés et prochaines étapes.",
    faq: [
      { q: "Ce résumé sert-il à autre chose ?", a: "Oui : il alimente l'assistant IA et peut être repris dans votre plan d'affaires." },
    ],
    resources: ["Assistant IA intégré"],
  },
  gbm_16: {
    stepKey: 'gbm_16',
    title: 'Structure des coûts',
    objective: "Identifier les coûts fixes, les coûts variables et les facteurs de coûts de votre activité.",
    why: "Comprendre votre structure de coûts est indispensable pour fixer vos prix et calculer votre seuil de rentabilité.",
    instructions: [
      "Listez vos coûts fixes : loyers, salaires, abonnements, assurances…",
      "Listez vos coûts variables : matières, transport, commissions…",
      "Identifiez les facteurs qui font varier ces coûts.",
      "Calculez une première analyse du seuil de rentabilité.",
    ],
    tips: [
      "Séparez strictement fixes et variables : c'est la base de l'analyse.",
      "Le seuil de rentabilité = coûts fixes ÷ marge sur coût variable par unité.",
      "Dans l'économie durable, comptez le coût énergie et la gestion des déchets comme postes réels.",
    ],
    commonMistakes: [
      "Oublier des coûts récurrents (licences, maintenance, assurance).",
      "Confondre coût fixe et coût variable (ex. salaire au temps partiel vs commission).",
    ],
    example:
      "Coûts fixes : loyer 800 €, salaires 4 000 €, assurance 150 €. Coûts variables : matière 6 €/unité, transport 1 €/unité. Seuil de rentabilité à 15 € de marge : 4 950 / 15 = 330 unités/mois.",
    expectedResult: "Une structure de coûts complète (fixes/variables), les facteurs de coûts et un seuil de rentabilité estimé.",
    faq: [
      { q: "Et si je ne connais pas encore tous mes coûts ?", a: "Estimez-les avec des ordres de grandeur du marché et affinez au fil des tests." },
    ],
    resources: ["Méthode du seuil de rentabilité"],
  },
  gbm_17: {
    stepKey: 'gbm_17',
    title: 'Flux de revenus',
    objective: "Définir vos sources de revenus, votre stratégie de prix et vos projections.",
    why: "Les revenus sont la contrepartie de la valeur créée. Un modèle de revenus clair conditionne la viabilité et séduit les financeurs.",
    instructions: [
      "Listez vos sources de revenus : vente, abonnement, location, commission, subvention…",
      "Définissez votre stratégie de prix (coût+, valeur perçue, tarification différenciée).",
      "Estimez des projections de revenus sur 12 mois.",
    ],
    tips: [
      "Diversifiez sans complexifier : 2 à 3 sources de revenus suffisent au démarrage.",
      "Le prix doit refléter la valeur perçue, pas seulement vos coûts.",
      "Les subventions (aides vertes, Europe, collectivités) sont souvent décisives : identifiez-les tôt.",
    ],
    commonMistakes: [
      "Un prix unique sans comprendre ce que le client est prêt à payer.",
      "Compter sur une seule source de revenus fragile.",
    ],
    expectedResult: "Des sources de revenus claires, une stratégie de prix et des projections réalistes.",
    faq: [
      { q: "Comment fixer un prix si le marché est neuf ?", a: "Testez plusieurs niveaux de prix auprès de clients réels (étape 10) et ajustez selon leur disposition à payer." },
    ],
    resources: ["Stratégies de prix", "Aides et subventions à l'innovation durable"],
  },
  gbm_18: {
    stepKey: 'gbm_18',
    title: 'Résumé des coûts et recettes',
    objective: "Synthétiser votre structure de coûts et vos flux de revenus en un bilan de santé financière.",
    why: "Ce résumé permet d'évaluer rapidement la viabilité économique de votre modèle avant de se lancer.",
    instructions: [
      "Générez le résumé via l'IA à partir de vos étapes 16 et 17.",
      "Relisez et ajustez les résumés de coûts, de revenus et la santé financière.",
      "Vérifiez la cohérence : vos prix couvrent-ils vos coûts ?",
    ],
    tips: [
      "Mettez en avant votre seuil de rentabilité : c'est un indicateur que tous les financeurs regardent.",
      "Soyez honnête : une santé financière fragile mais documentée vaut mieux qu'un optimisme non fondé.",
    ],
    commonMistakes: [
      "Des projections trop optimistes (croissance linéaire irréaliste).",
      "Oublier le besoin de fonds de roulement (délais de paiement).",
    ],
    expectedResult: "Un résumé financier cohérent : coûts, revenus, santé financière et seuil de rentabilité.",
    faq: [
      { q: "Ce résumé suffit-il pour un financement ?", a: "Non, mais il alimente le plan financier détaillé de votre plan d'affaires." },
    ],
    resources: ["Assistant IA intégré", "Guide du plan financier"],
  },
  gbm_19: {
    stepKey: 'gbm_19',
    title: 'Préparez le test !',
    objective: "Préparer un test terrain de votre offre : objectifs, méthode, critères de succès, ressources et calendrier.",
    why: "Un test bien préparé vous donne des données fiables pour décider d'accélérer ou d'ajuster avant de lancer.",
    instructions: [
      "Définissez les objectifs du test : que voulez-vous prouver ?",
      "Choisissez la méthode : pilote, précommande, MVP, test de paiement…",
      "Fixez des critères de succès chiffrés.",
      "Listez les ressources nécessaires et planifiez le calendrier.",
    ],
    tips: [
      "Un critère de succès chiffré : « 20 précommandes en 3 semaines ».",
      "Le test doit être le plus petit possible mais représentatif de vos clients réels.",
      "Planifiez aussi la collecte des retours (questionnaire, entretiens).",
    ],
    commonMistakes: [
      "Un test sans critères de réussite : impossible à interpréter.",
      "Un calendrier trop long : mieux vaut un test court et itératif.",
    ],
    expectedResult: "Un plan de test clair : objectifs, méthode, critères, ressources, échéances.",
    faq: [
      { q: "Et si le test échoue ?", a: "C'est une donnée, pas une faute. Revenez à l'étape 11 (pivot) et itérez." },
    ],
    resources: ["Design de tests (Lean Startup)", "Méthode MVP"],
  },
  gbm_20: {
    stepKey: 'gbm_20',
    title: 'Indicateurs',
    objective: "Définir les indicateurs (KPIs) qui vous permettront de mesurer votre impact et vos performances.",
    why: "Ce que vous mesurez, vous pouvez l'améliorer. Les KPIs couvrent l'impact environnemental, social et la santé économique.",
    instructions: [
      "Définissez des KPIs environnementaux : CO2 évité, déchets réduits, ressources économisées.",
      "Définissez des KPIs sociaux : emplois créés, personnes touchées, inclusion.",
      "Définissez des KPIs économiques : chiffre d'affaires, marge, acquisition clients.",
      "Précisez la méthode de mesure et la fréquence de révision.",
    ],
    tips: [
      "Limitez-vous à 5 à 7 KPIs vraiment utiles.",
      "Chaque KPI doit être lié à un objectif de l'étape 4.",
      "Utilisez la fréquence de révision pour ancrer une routine de pilotage.",
    ],
    commonMistakes: [
      "Trop d'indicateurs que personne ne mesure réellement.",
      "Des KPIs non liés aux objectifs de l'étape 4.",
    ],
    example:
      "KPI environnemental : kg de déchets évités/mois. Méthode : pesée des contenants consignés. Fréquence : mensuelle. Objectif lié : -30 % de déchets en 2 ans.",
    expectedResult: "Un tableau de bord de 5 à 7 KPIs avec méthode de mesure et fréquence.",
    faq: [
      { q: "Qui doit suivre ces indicateurs ?", a: "L'équipe projet, avec un point régulier (mensuel ou trimestriel) dédié au pilotage." },
    ],
    resources: ["Référentiels d'impact (B Lab, ISR)", "Tableaux de bord RSE"],
  },
  gbm_21: {
    stepKey: 'gbm_21',
    title: 'Analyse SWOT',
    objective: "Synthétiser votre projet complet en une analyse SWOT : forces, faiblesses, opportunités, menaces.",
    why: "Le SWOT est la synthèse finale du GBM : il prépare votre plan d'affaires et votre pitch en mettant en avant vos atouts et vos risques.",
    instructions: [
      "Générez l'analyse via l'IA à partir de l'ensemble de votre GBM.",
      "Relisez chaque quadrant : forces et faiblesses (interne), opportunités et menaces (externe).",
      "Complétez avec votre propre regard : l'IA ne remplace pas votre connaissance du terrain.",
      "Une fois l'analyse validée, cliquez sur « Valider la révision GBM ».",
    ],
    tips: [
      "Transformez chaque faiblesse en action : que ferez-vous pour la réduire ?",
      "Chaque menace doit avoir une parade identifiée.",
      "Le SWOT se met à jour : revisitez-le après chaque grande étape.",
    ],
    commonMistakes: [
      "Confondre forces (internes) et opportunités (externes).",
      "Un SWOT « fourre-tout » sans priorités.",
    ],
    expectedResult: "Un SWOT équilibré (2 à 4 éléments par quadrant) et la validation finale de votre GBM.",
    faq: [
      { q: "Que se passe-t-il après la validation ?", a: "Votre GBM est marqué comme révisé. Vous pouvez passer à votre plan d'affaires et télécharger le PDF du BMC." },
      { q: "Puis-je revenir modifier des étapes après validation ?", a: "Oui : le GBM reste modifiable, puis vous pouvez à nouveau valider la révision." },
    ],
    resources: ["Méthode SWOT", "Assistant IA intégré"],
  },
}

export function getStepGuide(stepKey: string): GbmGuide | undefined {
  return GBM_GUIDES[stepKey]
}
