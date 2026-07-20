# NOTE: This Dockerfile is retained for reference only.
# THE VICEROY TOUR & TRAVELS now uses:
#   - frontend/ (Next.js 15 + React 19)  → deploy on Vercel
#   - backend/  (NestJS + Prisma + PostgreSQL) → deploy via render.yaml
#
# The legacy server/ (Laravel PHP) and client/ (Vite React) directories
# have been removed from the repository.

FROM node:20-alpine

WORKDIR /app

EXPOSE 8080

CMD ["node", "dist/main.js"]
