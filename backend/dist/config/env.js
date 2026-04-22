import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
/**
 * Load env from the backend package root first, then `src/.env` (common mistake when
 * running `npm run dev` from `backend/`, where the default dotenv path is `./.env` only).
 */
function loadEnvFiles() {
    const cwd = process.cwd();
    const rootEnv = path.join(cwd, '.env');
    const srcEnv = path.join(cwd, 'src', '.env');
    if (fs.existsSync(rootEnv)) {
        dotenv.config({ path: rootEnv });
    }
    else if (fs.existsSync(srcEnv)) {
        dotenv.config({ path: srcEnv });
    }
    else {
        dotenv.config();
    }
}
loadEnvFiles();
const defaultDbUser = process.env.USER ?? process.env.USERNAME ?? 'postgres';
const defaultDatabaseUrl = `postgresql://${defaultDbUser}@localhost:5432/sia_academy`;
export const env = {
    port: Number(process.env.PORT ?? 4000),
    databaseUrl: process.env.DATABASE_URL ?? defaultDatabaseUrl,
    frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
};
