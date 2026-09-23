export interface MatchDetails {
  skillsMatch: { matched: number; required: number; score: number };
  experienceMatch: { years: number; required: number; score: number };
  availabilityBonus?: number;
}

export interface ProjectMatch {
  matchPercentage: number;
  details: MatchDetails;
}