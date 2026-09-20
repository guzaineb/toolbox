export interface ScoreDetails {
  experience: { years: number; score: number };
  diversity: { count: number; score: number };
  levels: { average: number; score: number };
  availability: { status: string; score: number };
}

export interface ExpertScore {
  score: number;
  details: ScoreDetails;
}
