import * as path from 'path';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

export function requireEnv(config: ConfigService, key: string): string {
  const value = config.get<string>(key);
  if (value) return value;

  const envPath = path.resolve(process.cwd(), '.env');
  const envFileExists = fs.existsSync(envPath);

  throw new Error(
    '\n\n' +
      '========================================================\n' +
      `${key} is not set (or is empty) — cannot start the server.\n` +
      '========================================================\n' +
      `Working directory: ${process.cwd()}\n` +
      `Looked for:        ${envPath}\n` +
      `That file exists:  ${envFileExists ? 'yes' : 'NO — this is very likely the problem'}\n\n` +
      `Make sure backend/.env has a non-empty line:\n` +
      `  ${key}=<a real value, no quotes>\n\n` +
      'See backend/.env.example for the full list of required variables.\n' +
      '========================================================\n',
  );
}
