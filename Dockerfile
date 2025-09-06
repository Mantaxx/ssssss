# Etap 1: Instalacja zależności i budowanie aplikacji
FROM node:18-alpine AS builder

WORKDIR /app

# Skopiuj pliki package.json i package-lock.json
COPY package*.json ./

# Zainstaluj wszystkie zależności (w tym devDependencies potrzebne do budowy)
RUN npm install

# Skopiuj schemat Prisma
COPY prisma ./prisma/

# Wygeneruj klienta Prisma - to naprawi błędy TS2305
RUN npx prisma generate

# Skopiuj resztę kodu źródłowego
COPY . .

# Zbuduj aplikację TypeScript
RUN npm run build

# Etap 2: Stworzenie finalnego, lekkiego obrazu produkcyjnego
FROM node:18-alpine

WORKDIR /app

# Skopiuj tylko niezbędne pliki z etapu 'builder'
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000

CMD ["node", "dist/index.js"]