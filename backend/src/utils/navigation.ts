export const TAB_PATHS: Record<string, string> = {
  home: '/home',
  create: '/create',
  library: '/library',
  profile: '/profile',
};

export function normalizePath(path: string) {
  if (!path) return '/';
  const normalized = path.replace(/\/+/g, '/').replace(/\/+$/, '');
  return normalized.length === 0 ? '/' : normalized;
}

export function resolveTabFromLocation(pathname: string): string {
  const normalized = normalizePath(pathname);
  if (normalized.startsWith('/library')) {
    return 'library';
  }
  switch (normalized) {
    case '/create':
      return 'create';
    case '/profile':
      return 'profile';
    default:
      return 'home';
  }
}

export function extractFolderIdFromPath(pathname: string): string | null {
  const normalized = normalizePath(pathname);
  const match = normalized.match(/^\/library\/folder\/(.+)$/);
  return match ? match[1] : null;
}
