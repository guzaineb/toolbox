/**
 * Réponse paginée standard des endpoints d'annuaire
 * (`GET /experts`, `GET /projects/directory`).
 */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
