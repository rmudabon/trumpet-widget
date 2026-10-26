FROM node:22-bookworm-slim
WORKDIR /app
COPY package*.json .npmrc ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi \
    && cat package.json package-lock.json | sha256sum | cut -d ' ' -f 1 > node_modules/.dependency-stamp
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
