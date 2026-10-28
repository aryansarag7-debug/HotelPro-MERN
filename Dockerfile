# Multi-stage Dockerfile for HotelPro (Full-Stack MERN)
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Build Frontend Client
COPY client/package*.json ./client/
RUN cd client && npm install

COPY client ./client
RUN cd client && npm run build

# 2. Production Server Image
FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

COPY server ./server
COPY database ./database
COPY --from=builder /app/client/dist ./client/dist
COPY .env.example .env

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "server/server.js"]
