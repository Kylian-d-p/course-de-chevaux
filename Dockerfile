FROM node:20-slim

# Install openssl pour Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm

WORKDIR /usr/src/app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy prisma files
COPY prisma ./prisma
COPY prisma.config.ts ./

# Copy source code
COPY src ./src
COPY static ./static
COPY tsconfig.json ./
COPY nodemon.json ./

# Build TypeScript
RUN pnpm tsc

# Expose port
EXPOSE 3000

# Start command: reinstall bcrypt with build scripts, deploy migrations, generate Prisma client, then start app
CMD ["sh", "-c", "pnpm uninstall bcrypt && pnpm install bcrypt --ignore-scripts=false && pnpm dlx prisma migrate deploy && pnpm dlx prisma generate && node build/src/index.js"]
