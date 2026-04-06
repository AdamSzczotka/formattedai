FROM node:20-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      chromium \
      fonts-liberation \
      fonts-noto-color-emoji \
      libnss3 libatk-bridge2.0-0 libx11-xcb1 \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV NODE_ENV=production

RUN groupadd -r pptruser && useradd -r -g pptruser pptruser \
    && mkdir -p /home/pptruser && chown -R pptruser:pptruser /home/pptruser
USER pptruser

WORKDIR /app
COPY --chown=pptruser:pptruser package*.json ./
RUN npm ci --production
COPY --chown=pptruser:pptruser . .

EXPOSE 3001
CMD ["node", "server.js"]
