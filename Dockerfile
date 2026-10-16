# Frontend
FROM node:22-slim AS web
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Backend Rust
FROM rust:1-bookworm AS api
WORKDIR /src
COPY Cargo.toml Cargo.lock rustfmt.toml clippy.toml ./
COPY crates ./crates
COPY apps ./apps
RUN cargo build --release -p bible-server

# Imagem final
FROM debian:bookworm-slim
RUN useradd --system --create-home app && mkdir -p /data && chown app /data
COPY --from=api /src/target/release/bible-server /usr/local/bin/bible-server
COPY --from=web /app/dist /app/dist
ENV API_PORT=3001 DB_FILE=/data/bible.db UPLOAD_DIR=/data/uploads DIST_DIR=/app/dist
VOLUME /data
USER app
EXPOSE 3001
CMD ["bible-server"]
