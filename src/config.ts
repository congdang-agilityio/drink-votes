export interface Config {
  port: number;
  /** Throws when DATABASE_URL is not set (read lazily). */
  readonly databaseUrl: string;
  appTz: string;
  defaultCloseAt: string;
  /** Fewer Going than this at the close cancels the outing. */
  minPeople: number;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const portRaw = env.PORT ?? '3000';
  if (!/^\d+$/.test(portRaw) || Number(portRaw) < 1) {
    throw new Error(`PORT must be a positive integer, got "${portRaw}"`);
  }
  const defaultCloseAt = env.DEFAULT_CLOSE_AT ?? '16:00';
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(defaultCloseAt)) {
    throw new Error(`DEFAULT_CLOSE_AT must match HH:mm (24-hour), got "${defaultCloseAt}"`);
  }
  const minPeopleRaw = env.MIN_PEOPLE ?? '3';
  if (!/^\d+$/.test(minPeopleRaw) || Number(minPeopleRaw) < 1) {
    throw new Error(`MIN_PEOPLE must be a positive integer, got "${minPeopleRaw}"`);
  }
  return {
    port: Number(portRaw),
    get databaseUrl() {
      const url = env.DATABASE_URL;
      if (!url) throw new Error('DATABASE_URL is required but not set');
      return url;
    },
    appTz: env.APP_TZ ?? 'Asia/Ho_Chi_Minh',
    defaultCloseAt,
    minPeople: Number(minPeopleRaw),
  };
}

export const config = loadConfig();
