-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateTable
CREATE TABLE "Fancier" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "pzhgp_id" TEXT,
    "club_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fancier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loft" (
    "id" SERIAL NOT NULL,
    "fancierId" INTEGER,
    "address" TEXT,
    "location_wkt" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pigeon" (
    "id" SERIAL NOT NULL,
    "fancierId" INTEGER,
    "ring_number" TEXT,
    "year" INTEGER,
    "sex" TEXT,
    "color" TEXT,
    "strain" TEXT,
    "sireId" INTEGER,
    "damId" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pigeon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReleasePoint" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "location_wkt" TEXT,
    "source_document" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReleasePoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Race" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "releasePointId" INTEGER,
    "release_datetime_utc" TIMESTAMP(3),
    "pzhgp_category" TEXT,
    "total_pigeons_basketed" INTEGER,
    "total_fanciers" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Race_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "id" SERIAL NOT NULL,
    "raceId" INTEGER,
    "pigeonId" INTEGER,
    "fancierId" INTEGER,
    "arrival_datetime_utc" TIMESTAMP(3),
    "clocking_system_id" TEXT,
    "position" INTEGER,
    "speed_m_per_min" DECIMAL(10,2),
    "coefficient" DECIMAL(10,4),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- Add PostGIS geography columns
ALTER TABLE "Loft" ADD COLUMN "location" geography(Point, 4326);
ALTER TABLE "ReleasePoint" ADD COLUMN "location" geography(Point, 4326);

-- CreateIndex
CREATE UNIQUE INDEX "Pigeon_ring_number_key" ON "Pigeon"("ring_number");

-- AddForeignKey
ALTER TABLE "Loft" ADD CONSTRAINT "Loft_fancierId_fkey" FOREIGN KEY ("fancierId") REFERENCES "Fancier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pigeon" ADD CONSTRAINT "Pigeon_fancierId_fkey" FOREIGN KEY ("fancierId") REFERENCES "Fancier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pigeon" ADD CONSTRAINT "Pigeon_sireId_fkey" FOREIGN KEY ("sireId") REFERENCES "Pigeon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pigeon" ADD CONSTRAINT "Pigeon_damId_fkey" FOREIGN KEY ("damId") REFERENCES "Pigeon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Race" ADD CONSTRAINT "Race_releasePointId_fkey" FOREIGN KEY ("releasePointId") REFERENCES "ReleasePoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_pigeonId_fkey" FOREIGN KEY ("pigeonId") REFERENCES "Pigeon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_fancierId_fkey" FOREIGN KEY ("fancierId") REFERENCES "Fancier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
