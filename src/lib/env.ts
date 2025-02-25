const requiredEnvs = ["DATABASE_URL"] as const;

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
} as const;

for (const envName of requiredEnvs) {
  if (!env[envName]) {
    throw new Error(`${envName} environment variable is required`);
  }
}
