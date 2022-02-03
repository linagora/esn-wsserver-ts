from node:16-alpine as build-deps

WORKDIR /app
copy package* ./
RUN npm install

from node:16-alpine as builder

WORKDIR /app

COPY --from=build-deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

from node:16-alpine as runner

WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=build-deps /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
