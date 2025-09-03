import { prisma } from '../src/db/prisma';

async function main() {
  const fancier = await prisma.fancier.create({ data: { name: 'Jan Kowalski', pzhgp_id: 'PL-0001' } });
  await prisma.loft.create({ data: { fancierId: fancier.id, address: 'Warszawa', locationWkt: 'POINT(21.0122 52.2297)', is_verified: true } });
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });

