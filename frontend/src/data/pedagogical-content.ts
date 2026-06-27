export interface GuidedQuestion {
  question: string;
  hint?: string;
  placeholder?: string;
  key?: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'swot' | 'pestel' | 'pestel_v2' | 'stakeholder_matrix' | 'customer_segment' | 'value_proposition' | 'discovery_card' | 'bmc' | 'step_recap';
  options?: { label: string; value: string }[];
  subQuestions?: GuidedQuestion[];
  sourceStep?: number;
  sourceSectionKey?: string;
}

export interface SubSectionContent {
  key: string;
  label: string;
  objective: string;
  whyImportant: string;
  tips?: string[];
  examples?: string[];
  guidedQuestions: GuidedQuestion[];
  estimatedMinutes: number;
}

export interface StepPedagogicalContent {
  stepNumber: number;
  title: string;
  objective: string;
  whyImportant: string;
  avantDeLire?: {
    description: string;
    resultatsAttendus: string;
  };
  etudeDeCas?: string;
  conseils?: string[];
  keyConcepts: { term: string; definition: string }[];
  estimatedMinutes: number;
  subSections: SubSectionContent[];
  checklist: string[];
  resources?: { title: string; url?: string; type: 'article' | 'video' | 'tool' }[];
}

export const STEP_PEDAGOGICAL_CONTENT: Record<number, StepPedagogicalContent> = {
  1: {
    stepNumber: 1,
    title: "Identification de l'idée",
    objective: "Définir clairement votre idée de projet en identifiant le problème que vous résolvez, votre solution unique et la valeur que vous apportez.",
    whyImportant: "Une idée bien définie est la fondation de tout projet entrepreneurial. 80% des échecs startups viennent d'un problème mal identifié ou d'une solution qui n'intéresse personne.",
    keyConcepts: [
      { term: "Proposition de valeur", definition: "La raison pour laquelle un client devrait choisir votre solution plutôt qu'une autre." },
      { term: "Problème douloureux", definition: "Un besoin non satisfait ou une difficulté réelle rencontrée par vos futurs clients." },
      { term: "Marché cible", definition: "Le groupe de personnes ou d'entreprises qui ont le problème que vous résolvez." },
    ],
    estimatedMinutes: 45,
    subSections: [
      {
        key: 'nom', label: 'Nom de votre projet', objective: 'Trouver un nom qui reflète votre mission',
        whyImportant: 'Le nom est la première impression. Un bon nom se retient, se prononce facilement et évoque votre activité.',
        tips: ['Choisissez un nom court (2-3 syllabes max)', 'Évitez les noms déjà utilisés (vérifiez sur l\'INPI)', 'Testez-le auprès de vos proches'],
        examples: ['BlaBlaCar = covoiturage + discussion', 'Deezer = musique en streaming facile'],
        guidedQuestions: [{ question: 'Quel est le nom provisoire de votre projet ?', hint: 'Vous pourrez le changer plus tard', placeholder: 'ex: EcoVoyage', type: 'text' }],
        estimatedMinutes: 5,
      },
      {
        key: 'presentation', label: 'Présentation du projet', objective: 'Décrire votre projet en 5-10 lignes',
        whyImportant: 'Une présentation claire permet à n\'importe qui de comprendre rapidement votre projet.',
        tips: ['Commencez par le problème que vous résolvez', 'Expliquez votre solution simplement', 'Terminez par l\'impact attendu'],
        examples: ['EcoVoyage est une plateforme qui connecte les voyageurs soucieux de l\'environnement avec des hébergements écologiques certifiés, permettant de réduire l\'empreinte carbone du tourisme.'],
        guidedQuestions: [{ question: 'Décrivez votre projet en quelques phrases', hint: 'Imaginez que vous expliquez votre projet à un ami', placeholder: 'Mon projet consiste à...', type: 'textarea' }],
        estimatedMinutes: 10,
      },
      {
        key: 'probleme', label: 'Problème identifié', objective: 'Identifier clairement le problème que vous résolvez',
        whyImportant: 'Un projet sans problème réel à résoudre n\'a pas de raison d\'exister. Les investisseurs regardent d\'abord le problème.',
        tips: ['Quel est le quotidien de vos clients sans votre solution ?', 'Combien cela leur coûte-t-il (temps, argent, frustration) ?', 'Pourquoi les solutions actuelles ne suffisent-elles pas ?'],
        examples: ['Les voyageurs veulent voyager écolo mais ne trouvent pas d\'offres fiables et certifiées.' ],
        guidedQuestions: [
          { question: 'Quel problème concret votre projet résout-il ?', placeholder: 'Le problème que j\'identifie est...', type: 'textarea' },
          { question: 'Qui rencontre ce problème ?', placeholder: 'ex: Les voyageurs, les parents, les PME...', type: 'text' },
          { question: 'Depuis combien de temps ce problème existe-t-il ?', hint: 'Un problème ancien = un marché mature', placeholder: 'ex: Depuis toujours / Depuis 5 ans', type: 'text' },
        ],
        estimatedMinutes: 10,
      },
      {
        key: 'solution', label: 'Solution proposée', objective: 'Décrire comment votre solution résout le problème',
        whyImportant: 'Votre solution doit être crédible, réalisable et apporter une réelle amélioration par rapport à l\'existant.',
        tips: ['Une bonne solution est simple à expliquer', 'Concentrez-vous sur l\'ESSENTIEL, pas sur toutes les fonctionnalités possibles', 'Prouvez que votre solution fonctionne déjà (même à petite échelle)'],
        examples: ['Une plateforme web référençant uniquement des hébergements avec une certification écologique vérifiée, avec un système d\'évaluation de l\'impact carbone.'],
        guidedQuestions: [
          { question: 'Quelle est votre solution ?', placeholder: 'Ma solution consiste à...', type: 'textarea' },
          { question: 'En quoi votre solution est-elle différente de ce qui existe déjà ?', placeholder: 'Contrairement à...', type: 'textarea' },
        ],
        estimatedMinutes: 10,
      },
      {
        key: 'valeur_ajoutee', label: 'Valeur ajoutée unique', objective: 'Identifier ce qui rend votre projet spécial',
        whyImportant: 'Votre avantage concurrentiel est ce qui vous protégera des imitateurs.',
        tips: ['La valeur ajoutée peut être : prix, qualité, rapidité, expérience, technologie', 'Un vrai avantage concurrentiel est difficile à copier', 'Posez-vous : pourquoi les clients me choisiraient MOI ?'],
        examples: ['La certification écologique vérifiée par un tiers de confiance, contrairement aux labels auto-déclarés.'],
        guidedQuestions: [
          { question: 'Qu\'est-ce qui rend votre solution unique ?', placeholder: 'Ce qui me rend unique est...', type: 'textarea' },
          { question: 'Pourquoi les clients vous choisiraient plutôt qu\'un concurrent ?', hint: 'Soyez honnête, pas de réponse trop générique', type: 'textarea' },
        ],
        estimatedMinutes: 5,
      },
      {
        key: 'objectifs', label: 'Objectifs du projet', objective: 'Définir vos objectifs à court et moyen terme',
        whyImportant: 'Des objectifs clairs vous guident et permettent de mesurer votre succès.',
        tips: ['Utilisez la méthode SMART : Spécifique, Mesurable, Atteignable, Réaliste, Temporel', 'Distinguer objectifs à 3 mois, 6 mois, 1 an, 3 ans', 'Soyez ambitieux mais réaliste'],
        examples: ['À 6 mois : 100 hébergements référencés et 500 réservations. À 1 an : rentabilité atteinte.'],
        guidedQuestions: [
          { question: 'Objectif à 3 mois', placeholder: 'ex: Finaliser le prototype...', type: 'text' },
          { question: 'Objectif à 6 mois', placeholder: 'ex: Premier client payant...', type: 'text' },
          { question: 'Objectif à 1 an', placeholder: 'ex: 1000 utilisateurs actifs...', type: 'text' },
        ],
        estimatedMinutes: 5,
      },
    ],
    checklist: ['J\'ai un nom provisoire pour mon projet', 'Je peux expliquer mon projet en 2 minutes', 'J\'ai identifié un problème réel', 'Ma solution est claire et différenciante', 'J\'ai des objectifs concrets'],
  },

  2: {
    stepNumber: 2,
    title: "Étude de Marché",
    objective: "Analyser votre marché pour valider qu'il existe une demande suffisante et comprendre votre environnement concurrentiel.",
    whyImportant: "70% des startups qui échouent le font par manque de marché, pas par mauvais produit. Une étude de marché solide réduit ce risque.",
    keyConcepts: [
      { term: "Marché adressable", definition: "Le nombre total de clients potentiels pour votre produit." },
      { term: "Segmentation", definition: "Diviser votre marché en groupes de clients aux besoins similaires." },
      { term: "SWOT", definition: "Outil d'analyse stratégique : Forces, Faiblesses, Opportunités, Menaces." },
      { term: "PESTEL", definition: "Analyse macro-environnementale : Politique, Économique, Social, Technologique, Environnemental, Légal." },
    ],
    estimatedMinutes: 90,
    subSections: [
      {
        key: 'marche_cible', label: 'Marché cible', objective: 'Définir précisément qui sont vos clients',
        whyImportant: 'Viser tout le monde = ne viser personne. Un marché bien défini permet un marketing efficace.',
        tips: ['Commencez petit : un quartier, une ville, une tranche d\'âge', 'Plus vous êtes précis, plus votre offre sera adaptée', 'Un marché de niche peut être très rentable'],
        examples: ['Les voyageurs français de 25-45 ans qui cherchent des hébergements écologiques pour leurs week-ends.'],
        guidedQuestions: [
          { question: 'Quel est le profil type de votre client ? (âge, profession, localisation)', placeholder: 'ex: 30-50 ans, urbain, cadre, France...', type: 'textarea' },
          { question: 'Quelle est la taille estimée de votre marché ?', hint: 'Cherchez des chiffres : INSEE, études de marché gratuites', placeholder: 'ex: 2 millions de personnes en France', type: 'text' },
          { question: 'Votre marché est-il en croissance, stable ou en déclin ?', hint: 'Un marché en croissance offre plus d\'opportunités', type: 'select', options: [{ label: 'En croissance', value: 'growth' }, { label: 'Stable', value: 'stable' }, { label: 'En déclin', value: 'decline' }, { label: 'Incertain', value: 'uncertain' }] },
        ],
        estimatedMinutes: 15,
      },
      {
        key: 'segmentation', label: 'Segmentation clients', objective: 'Diviser votre marché en segments distincts',
        whyImportant: 'Chaque segment a des besoins différents. Une segmentation permet de prioriser et personnaliser votre offre.',
        tips: ['Segmentez par âge, revenu, localisation, comportement', 'Identifiez le segment le plus accessible pour commencer', 'Chaque segment doit être assez grand pour être rentable'],
        examples: ['Segment 1 : Jeunes actifs écolos (25-35 ans). Segment 2 : Familles avec enfants (35-50 ans).'],
        guidedQuestions: [
          { question: 'Quels sont vos 2-3 segments clients principaux ?', placeholder: 'Segment 1 : ...', type: 'textarea' },
          { question: 'Quel segment ciblez-vous en premier ?', hint: 'Le plus accessible et rentable', type: 'text' },
        ],
        estimatedMinutes: 10,
      },
      {
        key: 'clients', label: 'Clients et besoins', objective: 'Comprendre en profondeur les besoins de vos clients',
        whyImportant: 'Un produit qui répond parfaitement à un besoin réel se vend tout seul.',
        tips: ['Allez parler à des clients potentiels (10 entretiens minimum)', 'Écoutez plus que vous ne parlez', 'Cherchez à comprendre le « pourquoi » derrière les besoins'],
        examples: ['Les clients veulent : 1) La garantie d\'un hébergement vraiment écolo 2) La simplicité de réservation 3) Des prix abordables.'],
        guidedQuestions: [
          { question: 'Quels sont les principaux besoins de vos clients ?', placeholder: 'Besoins identifiés...', type: 'textarea' },
          { question: 'Comment vos clients résolvent-ils ce problème aujourd\'hui ?', placeholder: 'Solutions actuelles...', type: 'textarea' },
          { question: 'Qu\'est-ce qui les frustre dans les solutions actuelles ?', placeholder: 'Frustrations...', type: 'textarea' },
        ],
        estimatedMinutes: 10,
      },
      {
        key: 'swot', label: 'Analyse SWOT', objective: 'Évaluer vos forces/faiblesses internes et opportunités/menaces externes',
        whyImportant: 'Le SWOT est l\'outil stratégique le plus utilisé. Il donne une vision claire de votre positionnement.',
        tips: ['Soyez honnête sur vos faiblesses', 'Les opportunités sont externes (marché, tech, réglementation)', 'Les menaces sont aussi externes (concurrents, régulation)'],
        examples: ['Force : équipe passionnée. Faiblesse : pas de fonds. Opportunité : tendance écolo. Menace : gros concurrents.'],
        guidedQuestions: [
          {
            question: 'Forces', hint: 'Qu\'est-ce que vous faites mieux que les autres ?', placeholder: 'Nos forces...',
            type: 'swot', subQuestions: [
              { question: 'Quelles sont vos compétences clés ?', type: 'text' },
              { question: 'Qu\'avez-vous de unique par rapport aux concurrents ?', type: 'text' },
              { question: 'Quelles ressources possédez-vous ?', type: 'text' },
            ]
          },
          {
            question: 'Faiblesses', hint: 'Soyez honnête, c\'est pour progresser', placeholder: 'Nos faiblesses...',
            type: 'swot', subQuestions: [
              { question: 'Que font mieux vos concurrents ?', type: 'text' },
              { question: 'Quelles compétences/manques avez-vous ?', type: 'text' },
              { question: 'Quelles ressources vous manquent ?', type: 'text' },
            ]
          },
          {
            question: 'Opportunités', hint: 'Facteurs externes positifs', placeholder: 'Opportunités...',
            type: 'swot', subQuestions: [
              { question: 'Quelles tendances du marché pouvez-vous exploiter ?', type: 'text' },
              { question: 'Y a-t-il de nouveaux segments de clientèle ?', type: 'text' },
              { question: 'Des évolutions technologiques/réglementaires favorables ?', type: 'text' },
            ]
          },
          {
            question: 'Menaces', hint: 'Facteurs externes négatifs', placeholder: 'Menaces...',
            type: 'swot', subQuestions: [
              { question: 'Qui sont vos concurrents directs et indirects ?', type: 'text' },
              { question: 'Quelles barrières réglementaires existent ?', type: 'text' },
              { question: 'Quels changements pourraient vous nuire ?', type: 'text' },
            ]
          },
        ],
        estimatedMinutes: 20,
      },
      {
        key: 'pestel', label: 'Analyse PESTEL', objective: 'Analyser les facteurs macro-environnementaux qui impactent votre projet',
        whyImportant: 'L\'environnement macro influence votre projet. Un bon entrepreneur anticipe les changements.',
        tips: ['Chaque dimension compte : ne négligez aucune', 'Restez factuel : citez des sources si possible', 'Un facteur peut être à la fois opportunité ET menace'],
        examples: ['Politique : subventions pour la transition écologique. Économique : inflation impactant le pouvoir d\'achat.'],
        guidedQuestions: [
          {
            question: 'Politique', hint: 'Lois, réglementations, subventions',
            type: 'pestel', subQuestions: [
              { question: 'Quelles politiques publiques impactent votre secteur ?', type: 'text' },
              { question: 'Y a-t-il des subventions ou aides disponibles ?', type: 'text' },
              { question: 'La stabilité politique est-elle un facteur ?', type: 'text' },
            ]
          },
          {
            question: 'Économique', hint: 'Croissance, inflation, pouvoir d\'achat',
            type: 'pestel', subQuestions: [
              { question: 'Quelle est la conjoncture économique actuelle ?', type: 'text' },
              { question: 'Comment évolue le pouvoir d\'achat de vos clients ?', type: 'text' },
              { question: 'Le taux d\'intérêt affecte-t-il votre financement ?', type: 'text' },
            ]
          },
          {
            question: 'Socioculturel', hint: 'Tendances sociales, démographie, valeurs',
            type: 'pestel', subQuestions: [
              { question: 'Quelles sont les tendances sociétales actuelles ?', type: 'text' },
              { question: 'Les comportements de consommation évoluent-ils ?', type: 'text' },
              { question: 'La démographie joue-t-elle en votre faveur ?', type: 'text' },
            ]
          },
          {
            question: 'Technologique', hint: 'Innovations, digitalisation, R&D',
            type: 'pestel', subQuestions: [
              { question: 'Quelles technologies impactent votre secteur ?', type: 'text' },
              { question: 'L\'innovation est-elle rapide dans votre domaine ?', type: 'text' },
              { question: 'Avez-vous besoin de technologies spécifiques ?', type: 'text' },
            ]
          },
          {
            question: 'Environnemental', hint: 'Écologie, réglementation verte, RSE',
            type: 'pestel', subQuestions: [
              { question: 'Quel est l\'impact environnemental de votre activité ?', type: 'text' },
              { question: 'Les réglementations écologiques vous impactent-elles ?', type: 'text' },
              { question: 'Pouvez-vous faire de l\'écologie un avantage concurrentiel ?', type: 'text' },
            ]
          },
          {
            question: 'Légal', hint: 'Droit des affaires, propriété intellectuelle, normes',
            type: 'pestel', subQuestions: [
              { question: 'Quelles sont les obligations légales de votre secteur ?', type: 'text' },
              { question: 'Avez-vous besoin de déposer des brevets ou marques ?', type: 'text' },
              { question: 'Quelles sont les normes à respecter ?', type: 'text' },
            ]
          },
        ],
        estimatedMinutes: 20,
      },
      {
        key: 'concurrence', label: 'Analyse concurrentielle', objective: 'Identifier et analyser vos concurrents',
        whyImportant: 'Connaître ses concurrents permet de se différencier et d\'éviter leurs erreurs.',
        tips: ['Analysez 3 à 5 concurrents minimum', 'Ne vous limitez pas aux concurrents directs', 'Testez leurs produits vous-même !'],
        examples: ['Concurrent direct : Booking.com (filtre éco). Indirect : locations entre particuliers.'],
        guidedQuestions: [
          { question: 'Qui sont vos 3 principaux concurrents ?', placeholder: 'Concurrent 1 : ...', type: 'textarea' },
          { question: 'Quels sont leurs points forts et faibles ?', placeholder: 'Forces/faiblesses...', type: 'textarea' },
          { question: 'Que ferez-vous différemment d\'eux ?', placeholder: 'Notre différence...', type: 'textarea' },
        ],
        estimatedMinutes: 15,
      },
    ],
    checklist: ['J\'ai défini mon marché cible précis', 'J\'ai segmenté mes clients', 'J\'ai réalisé un SWOT complet', 'J\'ai réalisé un PESTEL détaillé', 'Je connais mes 3 principaux concurrents'],
  },

  3: {
    stepNumber: 3,
    title: "Validation de l'idée",
    objective: "Tester votre idée auprès de vrais clients potentiels pour vérifier qu'elle répond à un besoin réel.",
    whyImportant: "Valider avant de développer permet d'économiser des mois de travail et des milliers d'euros. Un simple entretien peut vous éviter un échec.",
    keyConcepts: [
      { term: "MVP", definition: "Produit Minimum Viable : version la plus simple de votre produit qui apporte de la valeur." },
      { term: "Validation terrain", definition: "Tester votre hypothèse auprès de vrais utilisateurs potentiels." },
      { term: "Pivot", definition: "Changement de stratégie basé sur les retours du terrain." },
    ],
    estimatedMinutes: 120,
    subSections: [
      {
        key: 'questionnaires', label: 'Questionnaires', objective: 'Concevoir un questionnaire pour sonder vos clients potentiels',
        whyImportant: 'Un questionnaire bien conçu donne des données chiffrées sur la demande réelle.',
        tips: ['Maximum 10 questions', 'Utilisez Google Forms ou Typeform (gratuit)', 'Diffusez sur les réseaux sociaux et forums spécialisés'],
        examples: ['Question : « Seriez-vous prêt à payer 5€/mois pour un service qui... ? »'],
        guidedQuestions: [
          { question: 'Quelles sont les 5 questions clés de votre sondage ?', placeholder: '1. ...', type: 'textarea' },
          { question: 'Auprès de qui allez-vous diffuser ce questionnaire ?', placeholder: 'ex: Groupes Facebook, Linkedin, forums...', type: 'text' },
          { question: 'Quel est votre objectif de réponses ?', hint: '50+ réponses pour des données significatives', placeholder: 'ex: 100 réponses', type: 'text' },
        ],
        estimatedMinutes: 20,
      },
      {
        key: 'interviews', label: 'Entretiens clients', objective: 'Mener des entretiens individuels pour comprendre en profondeur',
        whyImportant: 'Les entretiens révèlent des insights que les questionnaires ne captent pas. C\'est l\'outil de validation le plus puissant.',
        tips: ['Menez au moins 10 entretiens', 'Ne parlez pas de votre solution : parlez du problème', 'La règle des 80/20 : écoutez 80%, parlez 20%'],
        examples: ['« Racontez-moi la dernière fois que vous avez cherché une solution écolo pour voyager... »'],
        guidedQuestions: [
          { question: 'Combien d\'entretiens prévoyez-vous de réaliser ?', placeholder: 'ex: 15 entretiens', type: 'text' },
          { question: 'Quelles questions allez-vous poser ?', hint: 'Concentrez-vous sur le problème, pas votre solution', placeholder: '1. ... 2. ...', type: 'textarea' },
          { question: 'Quels enseignements clés avez-vous déjà obtenus ?', placeholder: 'Enseignements...', type: 'textarea' },
        ],
        estimatedMinutes: 30,
      },
      {
        key: 'mvp_testing', label: 'Test du MVP', objective: 'Créer et tester une version minimaliste de votre produit',
        whyImportant: 'Un MVP vous permet d\'apprendre avec le moins d\'effort possible avant d\'investir massivement.',
        tips: ['Le MVP doit résoudre un problème, pas être parfait', 'Une landing page peut suffire comme MVP', 'Mesurez l\'engagement : inscriptions, clics, demandes'],
        examples: ['Une simple page web décrivant l\'offre avec un bouton « Je suis intéressé » pour valider la demande.'],
        guidedQuestions: [
          { question: 'Quel serait votre MVP idéal ? (version la plus simple possible)', placeholder: 'Mon MVP...', type: 'textarea' },
          { question: 'Combien de temps pour le créer ?', placeholder: 'ex: 2 semaines', type: 'text' },
          { question: 'Comment mesurerez-vous le succès du test ?', hint: 'Nombre d\'inscriptions, de précommandes...', placeholder: 'ex: 50 inscriptions = validation', type: 'text' },
        ],
        estimatedMinutes: 40,
      },
      {
        key: 'validation_terrain', label: 'Validation terrain', objective: 'Synthétiser tous vos apprentissages et décider de la suite',
        whyImportant: 'La validation terrain vous donne la confiance nécessaire pour passer à l\'étape suivante ou pivoter.',
        tips: ['Listez ce que vous avez appris de surprenant', 'Ce qui ne marche pas est aussi important que ce qui marche', 'Décidez : GO, PIVOT ou STOP'],
        examples: ['✅ 80% des personnes interrogées ont un besoin réel. ✅ 30% sont prêtes à payer. Décision : GO.'],
        guidedQuestions: [
          { question: 'Qu\'avez-vous appris de plus important sur le terrain ?', placeholder: 'Apprentissages clés...', type: 'textarea' },
          { question: 'Votre idée initiale est-elle validée ?', type: 'select', options: [{ label: 'Oui, pleinement', value: 'yes' }, { label: 'Partiellement, besoin d\'ajustements', value: 'partial' }, { label: 'Non, je dois revoir mon approche', value: 'pivot' }] },
          { question: 'Quelle est votre décision ?', type: 'select', options: [{ label: 'Go ! Je continue', value: 'go' }, { label: 'Pivot : je change ma stratégie', value: 'pivot' }, { label: 'Stop : j\'abandonne cette idée', value: 'stop' }] },
        ],
        estimatedMinutes: 30,
      },
    ],
    checklist: ['J\'ai conçu un questionnaire', 'J\'ai obtenu des réponses exploitables', 'J\'ai mené des entretiens clients', 'J\'ai testé un MVP', 'J\'ai pris une décision éclairée (GO/PIVOT/STOP)'],
  },

  4: {
    stepNumber: 4,
    title: "Business Model",
    objective: "Construire votre modèle économique : comment votre projet va générer des revenus, dépenser et créer de la valeur durablement.",
    whyImportant: "Un projet sans modèle économique viable n'est qu'un hobby. Le Business Model Canvas est l'outil n°1 pour le concevoir.",
    keyConcepts: [
      { term: "Business Model Canvas", definition: "Outil visuel qui décrit en 9 blocs comment une entreprise crée, délivre et capture de la valeur." },
      { term: "Proposition de valeur", definition: "L'ensemble des bénéfices que vous apportez à vos clients." },
      { term: "Flux de revenus", definition: "Comment vous gagnez de l'argent : vente, abonnement, commission, publicité..." },
    ],
    estimatedMinutes: 60,
    subSections: [
      {
        key: 'revenus', label: 'Sources de revenus', objective: 'Identifier toutes les façons dont votre projet peut gagner de l\'argent',
        whyImportant: 'Sans revenus, pas d\'entreprise viable. Diversifiez vos sources pour réduire les risques.',
        tips: ['Testez différents modèles : abonnement, commission, freemium', 'Un seul client = un risque. Cherchez plusieurs sources', 'Calculez votre prix de vente : coûts + marge'],
        examples: ['Plateforme : commission de 15% sur chaque réservation. Premium : abonnement 9,99€/mois pour les hébergeurs.'],
        guidedQuestions: [
          { question: 'Quels sont vos flux de revenus possibles ?', placeholder: '1. ... 2. ...', type: 'textarea' },
          { question: 'Quel est le prix estimé de votre offre ?', placeholder: 'ex: 10€/unité, 5€/mois...', type: 'text' },
          { question: 'Quand aurez-vous votre premier client payant estimé ?', placeholder: 'ex: Dans 3 mois', type: 'text' },
        ],
        estimatedMinutes: 10,
      },
      {
        key: 'couts', label: 'Structure de coûts', objective: 'Lister tous les coûts nécessaires au fonctionnement',
        whyImportant: 'Maîtriser ses coûts est aussi important que générer des revenus. L\'échec vient souvent d\'une sous-estimation. des coûts.',
        tips: ['Distinguer les coûts fixes (loyer, salaires) et variables (matériel, commission)', 'Prévoyez une marge de sécurité de 20%', 'Identifiez vos 3 plus gros postes de dépenses'],
        examples: ['Fixes : 2000€/mois (serveurs, salaires). Variables : 500€/mois (marketing, commissions).'],
        guidedQuestions: [
          { question: 'Quels sont vos principaux coûts fixes ?', placeholder: 'ex: loyer, salaires, assurances...', type: 'textarea' },
          { question: 'Quels sont vos coûts variables ?', placeholder: 'ex: marketing, matière première...', type: 'textarea' },
          { question: 'Quel est votre coût d\'acquisition client estimé ?', placeholder: 'ex: 5€ par client', type: 'text' },
        ],
        estimatedMinutes: 10,
      },
      {
        key: 'partenaires', label: 'Partenaires clés', objective: 'Identifier les partenaires indispensables à votre succès',
        whyImportant: 'Les bons partenaires accélèrent votre croissance et vous apportent des compétences et ressources que vous n\'avez pas.',
        tips: ['Cherchez des partenaires complémentaires, pas concurrents', 'Un partenariat doit être gagnant-gagnant', 'Commencez par 2-3 partenariats solides'],
        examples: ['Partenaires : organismes de certification, agences de voyage, offices de tourisme.'],
        guidedQuestions: [
          { question: 'Quels partenaires sont indispensables ?', placeholder: '1. ...', type: 'textarea' },
          { question: 'Que leur apportez-vous en échange ?', placeholder: 'ex: visibilité, commission...', type: 'text' },
        ],
        estimatedMinutes: 10,
      },
      {
        key: 'ressources_cles', label: 'Ressources clés', objective: 'Lister les ressources nécessaires au fonctionnement',
        whyImportant: 'Sans les bonnes ressources (humaines, financières, matérielles), même la meilleure idée échoue.',
        tips: ['Distinguer ce que vous avez ET ce qu\'il vous manque', 'Les ressources humaines sont souvent les plus critiques', 'Certaines ressources peuvent être externalisées'],
        examples: ['Ressources : développeur web, designer, capitaux de départ, serveurs cloud.'],
        guidedQuestions: [
          { question: 'Quelles ressources humaines sont nécessaires ?', placeholder: 'ex: développeur, commercial...', type: 'textarea' },
          { question: 'Quelles ressources matérielles/techniques ?', placeholder: 'ex: serveurs, locaux...', type: 'textarea' },
          { question: 'Quel budget total estimé pour lancer ?', placeholder: 'ex: 15 000€', type: 'text' },
        ],
        estimatedMinutes: 10,
      },
      {
        key: 'activites_cles', label: 'Activités clés', objective: 'Identifier les actions indispensables pour créer de la valeur',
        whyImportant: 'Se concentrer sur l\'essentiel évite de se disperser et maximise l\'impact de vos efforts.',
        tips: ['Identifiez les 3 activités qui créent le plus de valeur', 'Évitez de vouloir tout faire : déléguez ou automatisez', 'Priorisez les activités à fort impact'],
        examples: ['Activités : développement de la plateforme, acquisition d\'hébergements, marketing digital.'],
        guidedQuestions: [
          { question: 'Quelles sont vos 3 activités principales ?', placeholder: '1. ...', type: 'textarea' },
          { question: 'Quelles activités pouvez-vous externaliser ?', placeholder: 'ex: comptabilité, design...', type: 'text' },
        ],
        estimatedMinutes: 10,
      },
    ],
    checklist: ['J\'ai identifié mes sources de revenus', 'J\'ai listé mes coûts fixes et variables', 'J\'ai des partenaires identifiés', 'Je sais de quelles ressources j\'ai besoin', 'J\'ai priorisé mes activités clés'],
  },

  5: {
    stepNumber: 5,
    title: "Business Plan",
    objective: "Rédiger un document structuré qui présente votre projet, votre stratégie et vos prévisions financières.",
    whyImportant: "Le Business Plan est votre carte de visite pour les investisseurs, banques et partenaires. Il vous force à structurer votre pensée.",
    keyConcepts: [
      { term: "Executive Summary", definition: "Résumé de 1 page qui donne envie de lire la suite. C'est la partie la plus lue." },
      { term: "Prévisions financières", definition: "Projections chiffrées sur 3 ans : compte de résultat, bilan, trésorerie." },
      { term: "Seuil de rentabilité", definition: "Le chiffre d'affaires à partir duquel vous commencez à être rentable." },
    ],
    estimatedMinutes: 180,
    subSections: [
      {
        key: 'executive_summary', label: 'Executive Summary', objective: 'Rédiger un résumé percutant de votre projet en une page',
        whyImportant: 'C\'est la première chose que lit un investisseur. Si ça ne l\'accroche pas, il ne lira pas la suite.',
        tips: ['Une page maximum', 'Commencez par le problème et la solution', 'Terminez par ce que vous demandez (financement, partenariat)'],
        examples: ['EcoVoyage est une plateforme de réservation d\'hébergements écologiques certifiés... Nous recherchons 50 000€ pour développer l\'application mobile.'],
        guidedQuestions: [
          { question: 'Rédigez votre executive summary', placeholder: 'Commencez par : « [Nom du projet] est une [type] qui... »', type: 'textarea' },
          { question: 'Quel est votre besoin de financement ?', placeholder: 'ex: 50 000€ en échange de 10% du capital', type: 'text' },
        ],
        estimatedMinutes: 30,
      },
      {
        key: 'marche', label: 'Analyse du marché', objective: 'Détailler votre analyse de marché dans le BP',
        whyImportant: 'Cette section prouve qu\'il existe un marché viable pour votre projet.',
        tips: ['Citez vos sources (INSEE, études, articles)', 'Montrez la croissance du marché', 'Soyez précis sur votre part de marché visée'],
        examples: ['Marché français du tourisme durable : 5 milliards €, croissance de 15%/an. Cible : 1% en 3 ans.'],
        guidedQuestions: [
          { question: 'Taille et croissance de votre marché', placeholder: 'Notre marché...', type: 'textarea' },
          { question: 'Part de marché visée à 1 an, 2 ans, 3 ans', placeholder: 'Année 1 : X%, Année 2 : Y%...', type: 'textarea' },
        ],
        estimatedMinutes: 30,
      },
      {
        key: 'strategie', label: 'Stratégie', objective: 'Définir votre stratégie de développement',
        whyImportant: 'Une stratégie claire rassure les investisseurs : vous savez où vous allez.',
        tips: ['Détaillez votre avantage concurrentiel', 'Expliquez votre stratégie de prix', 'Montrez votre plan de développement'],
        guidedQuestions: [
          { question: 'Quelle est votre stratégie de développement ?', placeholder: 'Notre stratégie...', type: 'textarea' },
          { question: 'Quels sont vos avantages concurrentiels durables ?', placeholder: '1. ... 2. ...', type: 'textarea' },
        ],
        estimatedMinutes: 30,
      },
      {
        key: 'marketing', label: 'Plan marketing', objective: 'Expliquer comment vous allez acquérir des clients',
        whyImportant: 'Le meilleur produit du monde ne sert à rien si personne ne le connaît.',
        tips: ['Calculez votre budget marketing mensuel', 'Priorisez les canaux les plus rentables', 'Mesurez tout : coût d\'acquisition, taux de conversion'],
        examples: ['SEO (40%), Réseaux sociaux (30%), Partenariats (20%) , Publicité (10%)'],
        guidedQuestions: [
          { question: 'Quels canaux marketing allez-vous utiliser ?', placeholder: '1. ... 2. ...', type: 'textarea' },
          { question: 'Budget marketing mensuel estimé ?', placeholder: 'ex: 2000€/mois', type: 'text' },
          { question: 'Objectif d\'acquisition mensuel ?', placeholder: 'ex: 500 nouveaux utilisateurs/mois', type: 'text' },
        ],
        estimatedMinutes: 30,
      },
      {
        key: 'finances', label: 'Prévisions financières', objective: 'Établir vos projections financières sur 3 ans',
        whyImportant: 'Les chiffres donnent de la crédibilité à votre projet. Un BP sans finances n\'est pas pris au sérieux.',
        tips: ['Soyez réaliste : les investisseurs détectent le pipeau', 'Montrez 3 scénarios : pessimiste, réaliste, optimiste', 'Calculez votre seuil de rentabilité'],
        examples: ['Année 1 : CA 20k€, perte 15k€. Année 2 : CA 80k€, perte 5k€. Année 3 : CA 200k€, bénéfice 30k€.'],
        guidedQuestions: [
          { question: 'Chiffre d\'affaires prévisionnel Année 1, 2, 3', placeholder: 'A1: ... A2: ... A3: ...', type: 'textarea' },
          { question: 'Quand atteignez-vous le seuil de rentabilité ?', placeholder: 'ex: 18 mois', type: 'text' },
          { question: 'Besoins de financement totaux ?', placeholder: 'ex: 100 000€', type: 'text' },
        ],
        estimatedMinutes: 60,
      },
    ],
    checklist: ['Executive summary rédigé en 1 page', 'Analyse marché détaillée avec sources', 'Stratégie claire définie', 'Plan marketing chiffré', 'Prévisions financières sur 3 ans'],
  },

  6: {
    stepNumber: 6, title: "Équipe",
    objective: "Constituer l'équipe idéale pour porter votre projet et identifier les compétences manquantes.",
    whyImportant: "Les investisseurs disent souvent : « Je parie sur l'équipe, pas sur l'idée ». Une équipe complémentaire est votre plus grand atout.",
    keyConcepts: [
      { term: "Co-fondateur", definition: "Partenaire avec qui vous partagez la vision, le travail et souvent le capital." },
      { term: "Adéquation fondateur-marché", definition: "Quand l'équipe a l'expérience et la passion pour le marché visé." },
    ],
    estimatedMinutes: 45,
    subSections: [
      {
        key: 'membres', label: 'Membres de l\'équipe', objective: 'Lister les membres actuels de votre équipe',
        whyImportant: 'Chaque membre doit apporter une compétence complémentaire.',
        tips: ['Complémentarité > similarité', 'Cherchez des gens qui partagent vos valeurs', 'Petite équipe soudée > grande équipe désorganisée'],
        examples: ['CEO : stratégie et vision. CTO : développement technique. CMO : marketing et croissance.'],
        guidedQuestions: [
          { question: 'Qui sont les membres actuels de l\'équipe ? (nom, rôle, compétences)', placeholder: 'Membre 1 : ...', type: 'textarea' },
          { question: 'Quels sont les points forts collectifs de l\'équipe ?', placeholder: 'Nos forces...', type: 'textarea' },
        ],
        estimatedMinutes: 10,
      },
      {
        key: 'competences', label: 'Compétences', objective: 'Cartographier les compétences de votre équipe',
        whyImportant: 'Connaître vos forces et lacunes permet de recruter intelligemment.',
        tips: ['Listez toutes les compétences nécessaires', 'Évaluez le niveau de chaque compétence (1-5)', 'Identifiez les lacunes critiques'],
        guidedQuestions: [
          { question: 'Quelles compétences sont déjà couvertes ?', placeholder: 'Compétences acquises...', type: 'textarea' },
          { question: 'Quelles compétences manquent ?', placeholder: 'Compétences manquantes...', type: 'textarea' },
        ],
        estimatedMinutes: 10,
      },
      {
        key: 'organigramme', label: 'Organigramme', objective: 'Définir la structure de votre organisation',
        whyImportant: 'Un organigramme clair évite les conflits de rôles et montre votre professionnalisme.',
        tips: ['Prévoyez les postes clés même si vous ne les avez pas encore', 'Montrez qui rapporte à qui', 'Un organigramme plat est souvent plus efficace au début'],
        guidedQuestions: [
          { question: 'Quel est l\'organigramme prévisionnel de votre entreprise ?', placeholder: 'Décrivez votre structure...', type: 'textarea' },
          { question: 'Quels postes clés devez-vous recruter en priorité ?', placeholder: 'Recrutements prioritaires...', type: 'textarea' },
        ],
        estimatedMinutes: 10,
      },
      {
        key: 'besoins_recrutement', label: 'Besoins en recrutement', objective: 'Planifier vos recrutements',
        whyImportant: 'Recruter trop tôt ou trop tard peut être fatal. Un bon plan de recrutement est essentiel.',
        tips: ['Priorisez : recrutez d\'abord les postes qui génèrent du revenu', 'Prévoyez un budget recrutement', 'Définissez des profils précis avant de chercher'],
        guidedQuestions: [
          { question: 'Quels postes recruter et quand ?', placeholder: 'Dans 3 mois : ... Dans 6 mois : ...', type: 'textarea' },
          { question: 'Budget total salaires mensuel estimé ?', placeholder: 'ex: 10 000€/mois', type: 'text' },
        ],
        estimatedMinutes: 15,
      },
    ],
    checklist: ['J\'ai listé les membres de l\'équipe', 'J\'ai identifié les compétences clés et les lacunes', 'J\'ai un organigramme défini', 'J\'ai un plan de recrutement'],
  },

  7: {
    stepNumber: 7, title: "Statut Juridique",
    objective: "Choisir la forme juridique adaptée à votre projet et comprendre les obligations légales.",
    whyImportant: "Le choix du statut juridique impacte vos impôts, votre responsabilité et votre crédibilité. Une erreur peut coûter cher.",
    keyConcepts: [
      { term: "SAS/SASU", definition: "Société par Actions Simplifiée : la forme la plus flexible, très utilisée par les startups." },
      { term: "SARL/EURL", definition: "Société à Responsabilité Limitée : forme classique, bonne pour les petits projets." },
      { term: "EI", definition: "Entreprise Individuelle : la plus simple, mais responsabilité personnelle engagée." },
    ],
    estimatedMinutes: 60,
    subSections: [
      {
        key: 'forme_juridique', label: 'Forme juridique', objective: 'Choisir entre SAS, SARL, EI, etc.',
        whyImportant: 'Ce choix détermine votre protection sociale, fiscale et votre capacité à lever des fonds.',
        tips: ['SAS = pour les projets ambitieux avec levée de fonds', 'SARL = pour les projets stables, petite équipe', 'EI = pour commencer seul à moindre coût'],
        examples: ['Une startup visant des levées de fonds choisira une SAS. Un freelance choisira une EI.'],
        guidedQuestions: [
          { question: 'Quelle forme juridique envisagez-vous ?', type: 'select', options: [{ label: 'SAS/SASU', value: 'sas' }, { label: 'SARL/EURL', value: 'sarl' }, { label: 'EI', value: 'ei' }, { label: 'Je ne sais pas encore', value: 'unknown' }] },
          { question: 'Pourquoi ce choix correspond à votre projet ?', placeholder: 'Justification...', type: 'textarea' },
        ],
        estimatedMinutes: 20,
      },
      {
        key: 'documents', label: 'Documents légaux', objective: 'Préparer les documents de création',
        whyImportant: 'Des documents bien préparés accélèrent l\'immatriculation et évitent les erreurs.',
        tips: ['Rédigez les statuts', 'Préparez le dépôt de capital', 'Prévoyez les frais de greffe (environ 250€)'],
        guidedQuestions: [
          { question: 'Quels documents avez-vous préparés ?', placeholder: 'ex: Statuts, dépôt de capital...', type: 'textarea' },
          { question: 'Quel est votre budget pour la création légale ?', placeholder: 'ex: 500€ pour les frais', type: 'text' },
        ],
        estimatedMinutes: 20,
      },
      {
        key: 'obligations_legales', label: 'Obligations légales', objective: 'Comprendre les obligations après création',
        whyImportant: 'Le non-respect des obligations peut entraîner des pénalités et mettre en péril votre projet.',
        tips: ['Obligations comptables : faire les comptes annuels', 'Obligations fiscales : TVA, impôt sur les sociétés', 'Obligations sociales : déclarations URSSAF'],
        guidedQuestions: [
          { question: 'Quelles sont les principales obligations identifiées ?', placeholder: 'ex: TVA, comptabilité...', type: 'textarea' },
          { question: 'Avez-vous un comptable ou expert-comptable ?', type: 'select', options: [{ label: 'Oui, déjà trouvé', value: 'yes' }, { label: 'Non, je cherche', value: 'no' }, { label: 'Pas encore nécessaire', value: 'later' }] },
        ],
        estimatedMinutes: 20,
      },
    ],
    checklist: ['J\'ai choisi ma forme juridique', 'J\'ai préparé les documents de création', 'Je connais mes obligations légales', 'J\'ai (ou je cherche) un expert-comptable'],
  },

  8: {
    stepNumber: 8, title: "Financement",
    objective: "Évaluer vos besoins financiers et identifier les sources de financement disponibles.",
    whyImportant: "Le manque de trésorerie est la première cause d'échec des startups. Anticiper ses besoins est vital.",
    keyConcepts: [
      { term: "Love Money", definition: "Financement par les proches (famille, amis) au début du projet." },
      { term: "Business Angel", definition: "Investisseur particulier qui apporte des fonds et son expérience." },
      { term: "Venture Capital", definition: "Fonds d'investissement professionnel pour les startups à fort potentiel." },
      { term: "BPI France", definition: "Banque publique d'investissement française qui finance l'innovation." },
    ],
    estimatedMinutes: 60,
    subSections: [
      {
        key: 'besoin_financier', label: 'Besoin financier', objective: 'Calculer précisément vos besoins',
        whyImportant: 'Un besoin financier mal évalué vous mettra en difficulté. Prévoyez large.',
        tips: ['Calculez sur 12-18 mois; Ajoutez 20% de marge de sécurité', 'Distinguer investissement initial et besoin en trésorerie'],
        examples: ['Développement : 30k€. Marketing : 10k€. Trésorerie : 10k€. Total : 50k€.'],
        guidedQuestions: [
          { question: 'Quel est votre besoin de financement total ?', placeholder: 'ex: 80 000€', type: 'text' },
          { question: 'À quoi servira cet argent ? (postes de dépenses)', placeholder: '1. ... 2. ...', type: 'textarea' },
        ],
        estimatedMinutes: 15,
      },
      {
        key: 'investisseurs', label: 'Investisseurs', objective: 'Identifier les investisseurs potentiels',
        whyImportant: 'Tous les investisseurs ne conviennent pas à tous les projets. Choisir le bon investisseur est crucial.',
        tips: ['Les Business Angels sont accessibles via des réseaux (France Angels)', 'Préparez un pitch deck de 10 slides', 'Les investisseurs investissent d\'abord dans l\'équipe'],
        guidedQuestions: [
          { question: 'Quels types d\'investisseurs ciblez-vous ?', type: 'select', options: [{ label: 'Love Money (proches)', value: 'love' }, { label: 'Business Angels', value: 'ba' }, { label: 'BPI/Subventions', value: 'bpi' }, { label: 'Banques', value: 'bank' }, { label: 'Venture Capital', value: 'vc' }] },
          { question: 'Combien êtes-vous prêt à céder en capital ?', placeholder: 'ex: 10 à 20%', type: 'text' },
        ],
        estimatedMinutes: 15,
      },
      {
        key: 'subventions', label: 'Subventions et aides', objective: 'Identifier les aides publiques disponibles',
        whyImportant: 'Des milliers d\'euros d\'aides sont disponibles sans céder de capital.',
        tips: ['Consultez le site aides-entreprises.gouv.fr', 'Le Crédit d\'Impôt Recherche (CIR) peut financer la R&D', 'Les concours startup peuvent apporter financement ET visibilité'],
        guidedQuestions: [
          { question: 'Quelles aides/subventions avez-vous identifiées ?', placeholder: 'ex: BPI, NACRE, concours...', type: 'textarea' },
          { question: 'Avez-vous déjà candidaté ?', type: 'select', options: [{ label: 'Oui', value: 'yes' }, { label: 'En cours', value: 'pending' }, { label: 'Non, pas encore', value: 'no' }] },
        ],
        estimatedMinutes: 15,
      },
      {
        key: 'sources', label: 'Sources de financement', objective: 'Planifier votre stratégie de financement',
        whyImportant: 'Combiner plusieurs sources de financement réduit les risques de dépendance.',
        tips: ['Commencez par les aides sans dilution', 'Préparez un plan de financement sur 3 ans', 'Gardez des fonds de réserve'],
        guidedQuestions: [
          { question: 'Quelle est votre stratégie de financement ?', placeholder: 'Étape 1 : ... Étape 2 : ...', type: 'textarea' },
          { question: 'Plan de financement : d\'où vient l\'argent et quand ?', placeholder: 'Mois 1-3 : ... Mois 4-12 : ...', type: 'textarea' },
        ],
        estimatedMinutes: 15,
      },
    ],
    checklist: ['J\'ai évalué mon besoin financier', 'J\'ai identifié des investisseurs potentiels', 'J\'ai exploré les aides/subventions', 'J\'ai un plan de financement'],
  },

  9: {
    stepNumber: 9, title: "Développement Produit",
    objective: "Planifier le développement de votre produit ou service, du MVP à la version finale.",
    whyImportant: "Un développement sans plan = gaspillage de temps et d'argent. La roadmap vous garde focus.",
    keyConcepts: [
      { term: "MVP", definition: "Version minimale fonctionnelle qui résout le problème clé." },
      { term: "Roadmap", definition: "Plan de développement dans le temps avec les fonctionnalités clés." },
      { term: "Méthode Agile", definition: "Développement itératif par sprints de 1-4 semaines." },
    ],
    estimatedMinutes: 60,
    subSections: [
      {
        key: 'mvp', label: 'MVP', objective: 'Définir le périmètre de votre MVP',
        whyImportant: 'Le MVP doit être le plus petit produit possible qui apporte de la valeur.',
        tips: ['Listez TOUT ce que vous imaginez, puis supprimez 80%', 'Une seule fonctionnalité clé suffit pour le MVP', 'Le MVP doit pouvoir être testé en vrai'],
        examples: ['MVP Étape 1 : moteur de recherche + réservation. Étape 2 : avis clients. Étape 3 : recommandations IA.'],
        guidedQuestions: [
          { question: 'Quelle est LA fonctionnalité essentielle de votre MVP ?', placeholder: 'La fonction clé...', type: 'text' },
          { question: 'Décrivez votre MVP en une phrase', placeholder: 'Le MVP est un [produit] qui permet de [action clé]', type: 'text' },
        ],
        estimatedMinutes: 15,
      },
      {
        key: 'fonctionnalites', label: 'Fonctionnalités', objective: 'Lister et prioriser toutes les fonctionnalités',
        whyImportant: 'Tout ne peut pas être fait en même temps. La priorisation est la clé.',
        tips: ['Utilisez la matrice Impact/Effort', 'Catégorisez : Must have / Should have / Could have', 'Gardez une liste d\'idées pour plus tard'],
        guidedQuestions: [
          { question: 'Fonctionnalités indispensables (Must have)', placeholder: '1. ... 2. ...', type: 'textarea' },
          { question: 'Fonctionnalités souhaitables (Should have)', placeholder: '1. ... 2. ...', type: 'textarea' },
          { question: 'Fonctionnalités bonus (Could have)', placeholder: '1. ... 2. ...', type: 'textarea' },
        ],
        estimatedMinutes: 20,
      },
      {
        key: 'roadmap_technique', label: 'Roadmap technique', objective: 'Planifier les étapes de développement',
        whyImportant: 'Une roadmap claire donne de la visibilité à l\'équipe et aux investisseurs.',
        tips: ['Découpez en phases de 2-4 semaines', 'Prévoyez des marges (imprévus)', 'Validez chaque phase avant de passer à la suivante'],
        guidedQuestions: [
          { question: 'Quelles sont les grandes phases de développement ?', placeholder: 'Phase 1 : ... Phase 2 : ...', type: 'textarea' },
          { question: 'Date de sortie du MVP estimée ?', placeholder: 'ex: Dans 2 mois', type: 'text' },
          { question: 'Qui développe ? (interne, freelance, agence)', placeholder: 'ex: CTO co-fondateur + freelance', type: 'text' },
        ],
        estimatedMinutes: 25,
      },
    ],
    checklist: ['Périmètre du MVP défini', 'Fonctionnalités priorisées', 'Roadmap technique établie'],
  },

  10: {
    stepNumber: 10, title: "Marketing",
    objective: "Définir votre stratégie marketing et votre identité de marque.",
    whyImportant: "Un excellent produit sans marketing = un arbre qui tombe dans la forêt vide. Le marketing est votre mégaphone.",
    keyConcepts: [
      { term: "Branding", definition: "L'identité de votre marque : nom, logo couleurs, ton et personnalité." },
      { term: "Persona", definition: "Portrait-robot de votre client idéal basé sur des données réelles." },
      { term: "Canal d'acquisition", definition: "Le moyen par lequel vous touchez vos clients (SEO, réseaux sociaux, etc.)." },
    ],
    estimatedMinutes: 60,
    subSections: [
      {
        key: 'branding', label: 'Branding et identité', objective: 'Construire l\'identité de votre marque',
        whyImportant: 'Une marque forte se démarque et crée une connexion émotionnelle avec ses clients.',
        tips: ['Définissez votre mission, vision et valeurs', 'Créez un univers visuel cohérent', 'Le ton de votre marque doit être unique et reconnaissable'],
        examples: ['EcoVoyage = vert, nature, moderne. Ton : bienveillant, expert, engagé.'],
        guidedQuestions: [
          { question: 'Quels sont les valeurs de votre marque ?', placeholder: 'Nos valeurs...', type: 'textarea' },
          { question: 'Quel ton voulez-vous donner à votre marque ? (ex: sérieux, décalé, expert...)', placeholder: 'ex: Expert mais accessible', type: 'text' },
          { question: 'Avez-vous des éléments d\'identité visuelle ?', placeholder: 'logo, couleurs, typographie...', type: 'textarea' },
        ],
        estimatedMinutes: 15,
      },
      {
        key: 'personas', label: 'Personas clients', objective: 'Créer des portraits détaillés de vos clients idéaux',
        whyImportant: 'Les personas rendent votre client réel. Vous créez POUR quelqu\'un, pas pour une statistique.',
        tips: ['Donnez un prénom et une photo à chaque persona', 'Décrivez son quotidien, ses frustrations, ses rêves', 'Testez vos personas auprès de vrais clients'],
        examples: ['Sophie, 32 ans, chef de marketing, cherche des vacances écolo sans se ruiner, frustrée par l\'absence d\'offres claires.'],
        guidedQuestions: [
          { question: 'Persona 1 : décrivez votre client idéal', placeholder: 'Nom, âge, profession, besoins, frustrations...', type: 'textarea' },
          { question: 'Persona 2 : un autre segment', placeholder: '...', type: 'textarea' },
        ],
        estimatedMinutes: 20,
      },
      {
        key: 'strategie_acquisition', label: 'Stratégie d\'acquisition', objective: 'Définir comment vous allez acquérir vos clients',
        whyImportant: 'Choisir les bons canaux d\'acquisition maximise votre retour sur investissement marketing.',
        tips: ['Testez 3 canaux en même temps, gardez le meilleur', 'Le SEO est lent mais gratuit et durable', 'Le contenu (blog, vidéos) attire des clients qualifiés'],
        guidedQuestions: [
          { question: 'Quels sont vos 3 canaux d\'acquisition principaux ?', placeholder: '1. ... 2. ... 3. ...', type: 'textarea' },
          { question: 'Quel est votre budget marketing mensuel ?', placeholder: 'ex: 2000€', type: 'text' },
          { question: 'Objectif de coût d\'acquisition client (CAC) ?', placeholder: 'ex: 10€ par client', type: 'text' },
        ],
        estimatedMinutes: 25,
      },
    ],
    checklist: ['J\'ai défini mon identité de marque', 'J\'ai créé mes personas clients', 'J\'ai choisi mes canaux d\'acquisition', 'J\'ai un budget marketing défini'],
  },

  11: {
    stepNumber: 11, title: "Lancement",
    objective: "Planifier et exécuter le lancement de votre produit sur le marché.",
    whyImportant: "Un bon lancement peut faire la différence entre un produit qui décolle et un qui passe inaperçu.",
    keyConcepts: [
      { term: "Go To Market", definition: "La stratégie de mise sur le marché : comment, quand, où lancer." },
      { term: "Early Adopters", definition: "Les premiers utilisateurs, essentiels pour le bouche-à-oreille." },
    ],
    estimatedMinutes: 45,
    subSections: [
      {
        key: 'go_to_market', label: 'Go To Market', objective: 'Définir votre stratégie de mise sur le marché',
        whyImportant: 'Un lancement réussi est planifié des semaines à l\'avance. L\'improvisation mène à l\'échec.',
        tips: ['Créez du buzz avant le lancement (teasing)', 'Préparez vos canaux de communication', 'Planifiez des actions concrètes pour le jour J'],
        examples: ['J-30 : teaser sur les réseaux. J-7 : invitation presse. J0 : lancement + emailing + réseaux sociaux.'],
        guidedQuestions: [
          { question: 'Quand prévoyez-vous le lancement ?', placeholder: 'ex: Septembre 2026', type: 'text' },
          { question: 'Décrivez votre plan de lancement (J-30 à J+30)', placeholder: 'J-30 : ... J0 : ... J+30 : ...', type: 'textarea' },
        ],
        estimatedMinutes: 25,
      },
      {
        key: 'premiers_clients', label: 'Premiers clients', objective: 'Cibler et convaincre vos premiers clients',
        whyImportant: 'Les premiers clients sont vos meilleurs testeurs et vos premiers ambassadeurs.',
        tips: ['Commencez par votre réseau personnel', 'Offrez un avantage aux premiers clients (promo, accès VIP)', 'Recueillez leurs avis et améliorez votre produit'],
        guidedQuestions: [
          { question: 'Comment allez-vous trouver vos 10 premiers clients ?', placeholder: 'Notre stratégie...', type: 'textarea' },
          { question: 'Quelle offre spéciale pour les premiers clients ?', placeholder: 'ex: -50% sur le premier mois', type: 'text' },
          { question: 'Objectif de clients après 3 mois ?', placeholder: 'ex: 200 clients', type: 'text' },
        ],
        estimatedMinutes: 20,
      },
    ],
    checklist: ['Ma stratégie Go To Market est définie', 'J\'ai un plan de communication pré-lancement', 'J\'ai identifié comment trouver mes premiers clients'],
  },

  12: {
    stepNumber: 12, title: "Suivi et Amélioration",
    objective: "Mettre en place des outils pour suivre votre performance et améliorer votre offre en continu.",
    whyImportant: "Ce qui ne se mesure pas ne s'améliore pas. Le suivi des KPI est le tableau de bord de votre entreprise.",
    keyConcepts: [
      { term: "KPI", definition: "Indicateur Clé de Performance. Une métrique qui mesure votre succès." },
      { term: "NRR", definition: "Net Revenue Retention : mesure la fidélisation de vos clients." },
      { term: "NPS", definition: "Net Promoter Score : mesure la satisfaction et la recommandation client." },
    ],
    estimatedMinutes: 45,
    subSections: [
      {
        key: 'kpi', label: 'KPI', objective: 'Définir vos indicateurs clés de performance',
        whyImportant: 'Les bons KPI vous disent si vous allez dans la bonne direction, et à quelle vitesse.',
        tips: ['Pas plus de 5 KPI principaux', 'Choisissez des KPI actionnables (vous pouvez agir dessus)', 'Revoyez vos KPI chaque semaine'],
        examples: ['KPI : CA mensuel, nombre de clients, taux de rétention, NPS, coût d\'acquisition.'],
        guidedQuestions: [
          { question: 'Quels sont vos 5 KPI principaux ?', placeholder: '1. ... 2. ...', type: 'textarea' },
          { question: 'Quels sont vos objectifs pour chaque KPI ?', placeholder: 'KPI 1 : objectif X...', type: 'textarea' },
        ],
        estimatedMinutes: 15,
      },
      {
        key: 'feedbacks', label: 'Feedbacks clients', objective: 'Mettre en place un système de collecte des avis',
        whyImportant: 'Les feedbacks sont le carburant de l\'amélioration continue. Sans eux, vous avancez à l\'aveugle.',
        tips: ['Sollicitez les avis après chaque interaction', 'Utilisez des outils comme Typeform ou Google Forms', 'Répondez à tous les avis, bons comme mauvais'],
        guidedQuestions: [
          { question: 'Comment allez-vous collecter les avis clients ?', placeholder: 'ex: NPS automatique après achat', type: 'textarea' },
          { question: 'À quelle fréquence analyserez-vous les feedbacks ?', placeholder: 'ex: Toutes les semaines', type: 'text' },
        ],
        estimatedMinutes: 15,
      },
      {
        key: 'ameliorations_continues', label: 'Améliorations continues', objective: 'Planifier l\'amélioration de votre produit',
        whyImportant: 'Les meilleurs produits sont ceux qui s\'améliorent constamment. L\'innovation continue est un avantage concurrentiel.',
        tips: ['Itérez rapidement : mesurez, apprenez, améliorez', 'Priorisez les améliorations à fort impact', 'Communiquez sur vos améliorations à vos clients'],
        guidedQuestions: [
          { question: 'Quelles sont les 3 prochaines améliorations prioritaires ?', placeholder: '1. ... 2. ... 3. ...', type: 'textarea' },
          { question: 'Quel processus d\'amélioration continue mettez-vous en place ?', placeholder: 'ex: Sprint de 2 semaines, rétro chaque mois...', type: 'textarea' },
        ],
        estimatedMinutes: 15,
      },
    ],
    checklist: ['Mes KPI sont définis', 'J\'ai un système de collecte de feedback', 'J\'ai un processus d\'amélioration continue'],
  },

  13: {
    stepNumber: 13, title: "Croissance",
    objective: "Planifier la croissance de votre projet : passage à l'échelle, expansion géographique et levées de fonds.",
    whyImportant: "La croissance est l'objectif ultime. Mais une croissance non maîtrisée peut tuer une entreprise. Il faut la préparer.",
    keyConcepts: [
      { term: "Scalabilité", definition: "Capacité à croître sans augmenter vos coûts proportionnellement." },
      { term: "Levée de fonds", definition: "Obtention de capitaux auprès d'investisseurs pour accélérer la croissance." },
      { term: "ARPU", definition: "Average Revenue Per User : revenu moyen par utilisateur." },
    ],
    estimatedMinutes: 60,
    subSections: [
      {
        key: 'scalabilite', label: 'Scalabilité', objective: 'Évaluer et améliorer la scalabilité de votre modèle',
        whyImportant: 'Un modèle scalable peut croître rapidement sans coûts explosifs. C\'est ce que recherchent les investisseurs.',
        tips: ['Automatisez tout ce qui peut l\'être', 'Un produit digital est plus scalable qu\'un service physique', 'La scalabilité se prépare dès le début'],
        guidedQuestions: [
          { question: 'Votre modèle est-il scalable ? Pourquoi ?', placeholder: 'Oui, parce que...', type: 'textarea' },
          { question: 'Qu\'est-ce qui limitera votre croissance ? (goulots d\'étranglement)', placeholder: 'Limites identifiées...', type: 'textarea' },
        ],
        estimatedMinutes: 20,
      },
      {
        key: 'expansion', label: 'Stratégie d\'expansion', objective: 'Planifier votre développement géographique ou sectoriel',
        whyImportant: 'L\'expansion doit être planifiée : trop tôt = échec, trop tard = opportunités perdues.',
        tips: ['Validez votre modèle sur un marché avant de vous étendre', 'L\'expansion régionale est plus sûre que l\'international direct', 'Adaptez votre offre à chaque nouveau marché'],
        guidedQuestions: [
          { question: 'Quels sont vos marchés d\'expansion prioritaires ?', placeholder: '1. ... 2. ...', type: 'textarea' },
          { question: 'À quel horizon ?', placeholder: 'ex: Région dans 1 an, France dans 2 ans, Europe dans 3 ans', type: 'text' },
        ],
        estimatedMinutes: 20,
      },
      {
        key: 'levees_de_fonds', label: 'Levées de fonds', objective: 'Planifier votre stratégie de levée de fonds',
        whyImportant: 'Une levée de fonds réussie nécessite une préparation minutieuse et un timing approprié.',
        tips: ['Préparez un pitch deck irréprochable', 'Construisez un réseau d\'investisseurs avant d\'en avoir besoin', 'Le bon moment = quand vous avez des résultats à montrer'],
        guidedQuestions: [
          { question: 'Prévoyez-vous une levée de fonds ?', type: 'select', options: [{ label: 'Oui, dans les 12 mois', value: 'soon' }, { label: 'Oui, dans 1-3 ans', value: 'later' }, { label: 'Non, autofinancement', value: 'bootstrap' }, { label: 'Incertain', value: 'unsure' }] },
          { question: 'Quel montant et pour quelles étapes ?', placeholder: 'Seed : ... Série A : ...', type: 'textarea' },
        ],
        estimatedMinutes: 20,
      },
    ],
    checklist: ['J\'ai évalué la scalabilité de mon projet', 'J\'ai une stratégie d\'expansion', 'J\'ai un plan de financement de la croissance'],
  },
};
