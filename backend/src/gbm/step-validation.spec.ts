import {
  countValidOneToManyItems,
  getOneToManyRule,
  isValidOneToManyItem,
  missingOneToManyFields,
} from './step-validation';

describe('step-validation (D3)', () => {
  describe('getOneToManyRule', () => {
    it('retourne une règle pour chacune des étapes one-to-many', () => {
      for (const stepKey of [
        'gbm_7a',
        'gbm_7b',
        'gbm_8',
        'gbm_10',
        'gbm_12b',
      ]) {
        expect(getOneToManyRule(stepKey)).toBeDefined();
      }
    });

    it('retourne undefined pour une étape one-to-one ou inconnue', () => {
      expect(getOneToManyRule('gbm_1')).toBeUndefined();
      expect(getOneToManyRule('unknown')).toBeUndefined();
    });
  });

  describe('gbm_7a — parties prenantes', () => {
    it('valide si name + au moins un champ secondaire', () => {
      const item = {
        name: 'Mairie',
        role: 'Régulateur',
        interest: '',
        influence: 'fort',
        engagement_strategy: '',
      };
      expect(isValidOneToManyItem('gbm_7a', item)).toBe(true);
    });

    it('invalide si seul le name est renseigné', () => {
      const item = {
        name: 'Mairie',
        role: '  ',
        interest: '',
        influence: '',
        engagement_strategy: '',
      };
      expect(isValidOneToManyItem('gbm_7a', item)).toBe(false);
      expect(missingOneToManyFields('gbm_7a', item)).toEqual([
        "Rôle ou Intérêt dans le projet ou Degré d'influence ou Stratégie d'engagement",
      ]);
    });

    it('invalide si le name manque', () => {
      const item = { name: ' ', role: 'Régulateur' };
      expect(isValidOneToManyItem('gbm_7a', item)).toBe(false);
    });
  });

  describe('gbm_7b — cartes des parties prenantes', () => {
    it('valide si stakeholder_name + contribution + reward', () => {
      const item = {
        stakeholder_name: 'Mairie',
        contribution: 'Terrain',
        reward: 'Image',
      };
      expect(isValidOneToManyItem('gbm_7b', item)).toBe(true);
    });

    it('invalide si contribution ou reward manque', () => {
      const item = {
        stakeholder_name: 'Mairie',
        contribution: 'Terrain',
        reward: '',
      };
      expect(isValidOneToManyItem('gbm_7b', item)).toBe(false);
      expect(missingOneToManyFields('gbm_7b', item)).toEqual([
        'Récompense (donnant)',
      ]);
    });
  });

  describe('gbm_8 — segments de clientèle', () => {
    it('valide si segment_name + un des pains/gains/functions', () => {
      const item = {
        segment_name: 'PME locales',
        pains: '',
        gains: 'Économies',
        functions: '',
      };
      expect(isValidOneToManyItem('gbm_8', item)).toBe(true);
    });

    it('invalide si aucun sans pains/gains/functions', () => {
      const item = { segment_name: 'PME locales', description: 'générique' };
      expect(isValidOneToManyItem('gbm_8', item)).toBe(false);
    });
  });

  describe('gbm_10 — tests de la proposition', () => {
    it('valide si hypothesis + un des test_method/results/learnings', () => {
      const item = {
        hypothesis: 'Les PME paieront 50 €/mois',
        test_method: 'Entretien',
        results: '',
        learnings: '',
      };
      expect(isValidOneToManyItem('gbm_10', item)).toBe(true);
    });

    it('le booléen validated n’est jamais requis', () => {
      const item = { hypothesis: 'H', test_method: 'M', validated: false };
      expect(isValidOneToManyItem('gbm_10', item)).toBe(true);
      const bare = { hypothesis: 'H', validated: true };
      expect(isValidOneToManyItem('gbm_10', bare)).toBe(false);
    });
  });

  describe('gbm_12b — parcours du client', () => {
    it('valide si stage_name + un des touchpoints/émotions/améliorations', () => {
      const item = {
        stage_name: 'Achat',
        touchpoints: 'Boutique',
        customer_emotions: '',
        improvement_ideas: '',
      };
      expect(isValidOneToManyItem('gbm_12b', item)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('chaînes avec espaces considérées vides', () => {
      const item = { name: '  X  ', role: '   ' };
      expect(isValidOneToManyItem('gbm_7a', item)).toBe(false);
    });

    it('null / undefined / non-chaîne gérés', () => {
      const item = {
        name: 'X',
        role: null,
        interest: undefined,
        influence: 0,
        engagement_strategy: '',
      };
      expect(isValidOneToManyItem('gbm_7a', item)).toBe(true);
    });

    it('countValidOneToManyItems compte uniquement les éléments valides', () => {
      const items = [
        { name: 'A', role: 'R1' },
        { name: 'B' },
        { name: 'C', interest: 'I' },
      ];
      expect(countValidOneToManyItems('gbm_7a', items)).toBe(2);
    });

    it('règle inconnue → élément toujours valide', () => {
      expect(isValidOneToManyItem('gbm_999', {})).toBe(true);
    });
  });
});
