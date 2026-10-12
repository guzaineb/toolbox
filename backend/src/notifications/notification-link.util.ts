const DASHBOARD = '/dashboard';

function withQuery(path: string, query: string): string {
  if (!query) return path;
  if (query.startsWith('#')) return `${path}${query}`;
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}${query.slice(1)}`;
}

function splitTail(link: string): [string, string] {
  const idx = link.search(/[?#]/);
  if (idx === -1) return [link, ''];
  return [link.slice(0, idx), link.slice(idx)];
}

function rewriteProjectModule(path: string): string | null {
  const coaching = path.match(
    /^(.*)(\/project-owner\/projects\/[^/]+)\/coaching$/,
  );
  if (coaching) return `${coaching[1]}${coaching[2]}/coachings`;

  const swot = path.match(/^(.*)(\/project-owner\/projects\/[^/]+)\/swot$/);
  if (swot) return `${swot[1]}${swot[2]}/gbm?step=gbm_21`;

  return null;
}

function rewriteDashboardPath(path: string, query: string): string {
  const projectRewrite = rewriteProjectModule(path);
  if (projectRewrite) return withQuery(projectRewrite, query);

  if (
    path === `${DASHBOARD}/jury/evaluations` ||
    path.startsWith(`${DASHBOARD}/jury/evaluations/`)
  ) {
    return withQuery(
      path.replace(
        '/dashboard/jury/evaluations',
        '/dashboard/expert/evaluations',
      ),
      query,
    );
  }

  if (path.startsWith(`${DASHBOARD}/expert/evaluations/todo`)) {
    return withQuery(
      path.replace('/expert/evaluations/todo', '/expert/evaluations-todo'),
      query,
    );
  }

  const expertCoaching = path.match(
    /^(.*)(\/dashboard\/expert\/coaching\/[^/]+)\/coaching$/,
  );
  if (expertCoaching)
    return withQuery(`${expertCoaching[1]}${expertCoaching[2]}`, query);

  return withQuery(path, query);
}

function rewriteLegacyPath(path: string, query: string): string {
  const projectRewrite = rewriteProjectModule(path);
  if (projectRewrite) return withQuery(`${DASHBOARD}${projectRewrite}`, query);

  if (path.startsWith('/project-owner/')) {
    return withQuery(`${DASHBOARD}${path}`, query);
  }

  if (
    path === '/expert/evaluations/todo' ||
    path.startsWith('/expert/evaluations/todo/')
  ) {
    return withQuery(
      path.replace(
        '/expert/evaluations/todo',
        '/dashboard/expert/evaluations-todo',
      ),
      query,
    );
  }

  if (path === '/expert/projects') {
    return `${DASHBOARD}/expert/coachings`;
  }

  if (path.startsWith('/expert/')) {
    return withQuery(`${DASHBOARD}${path}`, query);
  }

  if (/^\/incubator\/cohorts\/[^/]+\/evaluations$/.test(path)) {
    return `${DASHBOARD}/incubator`;
  }

  const cohort = path.match(/^\/incubator\/cohorts\/([^/]+)(\/.*)?$/);
  if (cohort) {
    return withQuery(
      `${DASHBOARD}/expert/cohorts/${cohort[1]}${cohort[2] ?? ''}`,
      query,
    );
  }

  if (path.startsWith('/incubator/')) {
    return withQuery(`${DASHBOARD}${path}`, query);
  }

  if (path === '/cohorts' || path.startsWith('/cohorts/')) {
    return `${DASHBOARD}/expert/cohorts`;
  }

  if (path === '/evaluations' || path.startsWith('/evaluations/')) {
    return `${DASHBOARD}/expert/evaluations`;
  }

  if (path === '/dashboard' || path.startsWith(`${DASHBOARD}/`)) {
    return withQuery(path, query);
  }

  return DASHBOARD;
}

export function resolveAppLink(link?: string | null): string | undefined {
  if (!link) return undefined;

  if (!link.startsWith('/') || link.startsWith('//')) return link;

  if (link.startsWith('/auth/')) return link;

  const [path, query] = splitTail(link);

  if (path === DASHBOARD || path.startsWith(`${DASHBOARD}/`)) {
    return rewriteDashboardPath(path, query);
  }

  return rewriteLegacyPath(path, query);
}
