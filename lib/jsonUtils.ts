import fs from 'fs';
import path from 'path';

const allowedEmailsPath = path.join(process.cwd(), 'data', 'allowedEmails.json');
const blacklistPath = path.join(process.cwd(), 'data', 'sessionBlacklist.json');

export const readAllowedEmails = () => {
  const jsonData = fs.readFileSync(allowedEmailsPath, 'utf-8');
  return JSON.parse(jsonData);
};

export const readBlacklist = () => {
  const jsonData = fs.readFileSync(blacklistPath, 'utf-8');
  return JSON.parse(jsonData);
};
