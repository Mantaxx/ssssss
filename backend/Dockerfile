FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci || yarn install || pnpm install
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc -p tsconfig.json || ./node_modules/.bin/tsc -p tsconfig.json
EXPOSE 4000
CMD ["node", "dist/index.js"]

