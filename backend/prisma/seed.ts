import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Create Fanciers
  const fancier1 = await prisma.fancier.create({
    data: {
      name: 'Jan Kowalski',
      pzhgpId: 'PL-0123',
      clubId: 'ODDZIAŁ-XYZ',
    },
  });

  const fancier2 = await prisma.fancier.create({
    data: {
      name: 'Adam Nowak',
      pzhgpId: 'PL-0456',
      clubId: 'ODDZIAŁ-ABC',
    },
  });

  console.log(`Created fanciers: ${fancier1.name}, ${fancier2.name}`);

  // Create Lofts
  await prisma.loft.create({
    data: {
      fancierId: fancier1.id,
      address: 'ul. Słoneczna 1, 00-001 Warszawa',
      latitude: 52.2297,
      longitude: 21.0122,
      isVerified: true,
    },
  });

  await prisma.loft.create({
    data: {
      fancierId: fancier2.id,
      address: 'ul. Leśna 5, 31-001 Kraków',
      latitude: 50.0647,
      longitude: 19.9450,
      isVerified: true,
    },
  });
  console.log(`Created lofts.`);

  // Create Pigeons
  const sire = await prisma.pigeon.create({
    data: {
      fancierId: fancier1.id,
      ringNumber: 'PL-0123-20-1000',
      year: 2020,
      sex: 'M',
      color: 'Niebieski',
    },
  });

  const dam = await prisma.pigeon.create({
    data: {
      fancierId: fancier1.id,
      ringNumber: 'PL-0123-19-2000',
      year: 2019,
      sex: 'F',
      color: 'Płowy',
    },
  });

  const pigeon1 = await prisma.pigeon.create({
    data: {
      fancierId: fancier1.id,
      ringNumber: 'PL-0123-21-1234',
      year: 2021,
      sex: 'M',
      color: 'Nakrapiany',
      sireId: sire.id,
      damId: dam.id,
    },
  });

  const pigeon2 = await prisma.pigeon.create({
    data: {
      fancierId: fancier2.id,
      ringNumber: 'PL-0456-21-5678',
      year: 2021,
      sex: 'F',
      color: 'Biały',
    },
  });
  console.log(`Created pigeons.`);

  // Create Release Point
  const releasePoint = await prisma.releasePoint.create({
    data: {
      name: 'Bruksela',
      latitude: 50.8503,
      longitude: 4.3517,
      sourceDocument: 'PZHGP/2023/WSPOLRZEDNE.pdf',
    },
  });
  console.log(`Created release point: ${releasePoint.name}`);

  // Create Race
  const race = await prisma.race.create({
    data: {
      name: 'Lot Narodowy Bruksela 2023',
      releasePointId: releasePoint.id,
      releaseDatetimeUtc: new Date('2023-07-15T06:00:00Z'),
      pzhgpCategory: 'Maraton',
      totalPigeonsBasketed: 5000,
      totalFanciers: 300,
    },
  });
  console.log(`Created race: ${race.name}`);

  // Create Results
  await prisma.result.create({
    data: {
      raceId: race.id,
      pigeonId: pigeon1.id,
      fancierId: fancier1.id,
      arrivalDatetimeUtc: new Date('2023-07-15T18:30:15Z'),
      position: 10,
      speedMPerMin: 1250.55,
      coefficient: 2.0,
    },
  });

  await prisma.result.create({
    data: {
      raceId: race.id,
      pigeonId: pigeon2.id,
      fancierId: fancier2.id,
      arrivalDatetimeUtc: new Date('2023-07-15T19:15:45Z'),
      position: 55,
      speedMPerMin: 1190.10,
      coefficient: 11.0,
    },
  });
  console.log(`Created results.`);

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });