# Mindrop tracker API — tiny Node service with a JSON-file store.
FROM node:20-alpine
WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY index.mjs ./

ENV PORT=46721 \
    DATA_DIR=/data
EXPOSE 46721

# State lives on a mounted volume so it survives container rebuilds.
VOLUME ["/data"]

CMD ["node", "index.mjs"]
