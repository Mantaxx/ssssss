import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface PigeonData {
  ringNumber: string;
  color?: string;
  sex?: string;
  electronicRingId?: string;
}

interface FancierData {
  name: string;
  pzhgpId: string;
  pigeons: PigeonData[];
}

function parseVizionEsk(report: string): FancierData | null {
  const fancierMatch = report.match(/Hodowca:\s*(.*?)\s*\n\s*Nr hod:\s*(.*)/);
  if (!fancierMatch) return null;

  const name = fancierMatch[1].trim();
  const pzhgpId = fancierMatch[2].trim().replace(/\s+/g, '-');

  const pigeons: PigeonData[] = [];
  const pigeonRegex = /\d{3}\s+(Pl-\d{4}-\d{2}-\d+)(\w+)?\s+(\d)\s+([A-F0-9]{8}|-{8})/g;

  let match;
  while ((match = pigeonRegex.exec(report)) !== null) {
    pigeons.push({
      ringNumber: match[1],
      color: match[2] || undefined,
      sex: match[3] === '0' ? 'M' : 'F', // Assumption: 0 -> Male, 1 -> Female
      electronicRingId: match[4] !== '--------' ? match[4] : undefined,
    });
  }

  return { name, pzhgpId, pigeons };
}

function parseAmcEsk(report: string): FancierData | null {
    const fancierMatch = report.match(/Hodowca:\s*(.*?)\s+Nr hodowcy:\s*(\d+)\s+Nr oddzialu:\s*(\d+)/);
    if (!fancierMatch) return null;

    const name = fancierMatch[1].trim();
    // Construct PZHGP ID from section and breeder number
    const pzhgpId = `${fancierMatch[3]}-${fancierMatch[2]}`;

    const pigeons: PigeonData[] = [];
    // Regex to capture pigeon data from both columns in a single pass
    const pigeonLinesRegex = /^\s*(\d+)\|(.{16})\|(.)\|(.{8})\|(..)\|(.*?)\|\s*(\d+)\|(.{16})\|(.)\|(.{8})\|(..)\|(.*)/gm;
    
    const lines = report.split('\n');
    const dataLines = lines.slice(lines.findIndex(l => l.startsWith('---+--')) + 1);

    for (const line of dataLines) {
        if (line.trim() === '' || line.startsWith('Podpisy:')) break;

        const parts = line.split('|').map(p => p.trim());
        if (parts.length < 6 && parts.length < 12) continue;

        // Process first pigeon in the line
        if (parts[1]) {
            pigeons.push({
                ringNumber: parts[1].replace(/\s/g, ''),
                sex: parts[2] ? (parts[2] === '0' ? 'M' : 'F') : undefined,
                color: parts[5] || undefined,
            });
        }

        // Process second pigeon in the line
        if (parts.length > 6 && parts[7]) {
            pigeons.push({
                ringNumber: parts[7].replace(/\s/g, ''),
                sex: parts[8] ? (parts[8] === '0' ? 'M' : 'F') : undefined,
                color: parts[11] || undefined,
            });
        }
    }

    return { name, pzhgpId, pigeons };
}


async function importData(filePath: string) {
  console.log(`Starting import from ${filePath}...`);

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  // Split reports by the form feed character, which often separates pages/reports
  const reports = fileContent.split('');

  for (const report of reports) {
    if (report.trim().length === 0) continue;

    let fancierData: FancierData | null = null;

    if (report.includes('Polmark =VIZION-ESK=')) {
      console.log('Detected VIZION-ESK report.');
      fancierData = parseVizionEsk(report);
    } else if (report.includes('System AMC-ESK')) {
      console.log('Detected AMC-ESK report.');
      fancierData = parseAmcEsk(report);
    } else {
      console.log('Skipping unrecognized report block.');
      continue;
    }

    if (!fancierData) {
      console.error('Failed to parse report block.');
      continue;
    }

    console.log(`Processing fancier: ${fancierData.name} (${fancierData.pzhgpId})`);

    const existingFancier = await prisma.fancier.findFirst({
      where: { pzhgpId: fancierData.pzhgpId },
    });   where: { id: existingFancier.id },
        data: { name: fancierData.name },; });
    }

    let createdPigeons = 0;
    for (const p of fancierData.pigeons) {
      await prisma.pigeon.upsert({
        where: { ringNumber: p.ringNumber },
        update: {
            color: p.color,
            sex: p.sex,
            electronicRingId: p.electronicRingId,
        },
        create: {
          ringNumber: p.ringNumber,
          fancierId: fancier.id,
          color: p.color,
          sex: p.sex,
          electronicRingId: p.electronicRingId,
          year: parseInt(p.ringNumber.split('-')[2], 10) || undefined,
        },
      });
      createdPigeons++;
    }
    console.log(`  > Upserted ${createdPigeons} pigeons for ${fancier.name}.`);
  }

  console.log('Import finished.');
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Please provide a path to the ESK file.');
    console.error('Usage: npm run import:esk <path/to/file.txt>');
    process.exit(1);
  }

  const absolutePath = path.resolve(filePath);
  await importData(absolutePath);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });