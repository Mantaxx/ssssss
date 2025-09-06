/*
  Warnings:

  - You are about to drop the `Fancier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Loft` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pigeon` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Race` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReleasePoint` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Result` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Loft" DROP CONSTRAINT "Loft_fancierId_fkey";

-- DropForeignKey
ALTER TABLE "Pigeon" DROP CONSTRAINT "Pigeon_damId_fkey";

-- DropForeignKey
ALTER TABLE "Pigeon" DROP CONSTRAINT "Pigeon_fancierId_fkey";

-- DropForeignKey
ALTER TABLE "Pigeon" DROP CONSTRAINT "Pigeon_sireId_fkey";

-- DropForeignKey
ALTER TABLE "Race" DROP CONSTRAINT "Race_releasePointId_fkey";

-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_fancierId_fkey";

-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_pigeonId_fkey";

-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_raceId_fkey";

-- DropTable
DROP TABLE "Fancier";

-- DropTable
DROP TABLE "Loft";

-- DropTable
DROP TABLE "Pigeon";

-- DropTable
DROP TABLE "Race";

-- DropTable
DROP TABLE "ReleasePoint";

-- DropTable
DROP TABLE "Result";

-- CreateTable
CREATE TABLE "fanciers" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "pzhgp_id" TEXT,
    "club_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fanciers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lofts" (
    "id" SERIAL NOT NULL,
    "fancier_id" INTEGER NOT NULL,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "is_verified" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lofts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pigeons" (
    "id" SERIAL NOT NULL,
    "fancier_id" INTEGER NOT NULL,
    "ring_number" TEXT NOT NULL,
    "year" INTEGER,
    "sex" TEXT,
    "color" TEXT,
    "strain" TEXT,
    "sire_id" INTEGER,
    "dam_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pigeons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "races" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "release_point_id" INTEGER NOT NULL,
    "release_datetime_utc" TIMESTAMP(3),
    "pzhgp_category" TEXT,
    "total_pigeons_basketed" INTEGER,
    "total_fanciers" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "races_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "release_points" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "source_document" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "release_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "results" (
    "id" SERIAL NOT NULL,
    "race_id" INTEGER NOT NULL,
    "pigeon_id" INTEGER NOT NULL,
    "fancier_id" INTEGER NOT NULL,
    "arrival_datetime_utc" TIMESTAMP(3),
    "clocking_system_id" TEXT,
    "position" INTEGER,
    "speed_m_per_min" DECIMAL(10,2),
    "coefficient" DECIMAL(10,4),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pigeons_ring_number_key" ON "pigeons"("ring_number");

-- AddForeignKey
ALTER TABLE "lofts" ADD CONSTRAINT "lofts_fancier_id_fkey" FOREIGN KEY ("fancier_id") REFERENCES "fanciers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pigeons" ADD CONSTRAINT "pigeons_fancier_id_fkey" FOREIGN KEY ("fancier_id") REFERENCES "fanciers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pigeons" ADD CONSTRAINT "pigeons_sire_id_fkey" FOREIGN KEY ("sire_id") REFERENCES "pigeons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pigeons" ADD CONSTRAINT "pigeons_dam_id_fkey" FOREIGN KEY ("dam_id") REFERENCES "pigeons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "races" ADD CONSTRAINT "races_release_point_id_fkey" FOREIGN KEY ("release_point_id") REFERENCES "release_points"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_race_id_fkey" FOREIGN KEY ("race_id") REFERENCES "races"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_pigeon_id_fkey" FOREIGN KEY ("pigeon_id") REFERENCES "pigeons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_fancier_id_fkey" FOREIGN KEY ("fancier_id") REFERENCES "fanciers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
