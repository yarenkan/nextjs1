import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const allowedEmailsPath = path.join(process.cwd(), 'data', 'allowedEmails.json');
const blacklistPath = path.join(process.cwd(), 'data', 'sessionBlacklist.json');

const readJsonFile = (filePath: string) => {
  try {
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(jsonData);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error reading JSON file at ${filePath}: ${error.message}`);
    } else {
      throw new Error(`Error reading JSON file at ${filePath}: Unknown error`);
    }
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const allowedEmails = readJsonFile(allowedEmailsPath);
    const blacklist = readJsonFile(blacklistPath);

    res.status(200).json({ allowedEmails, blacklist });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
}
