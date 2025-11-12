FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4000
RUN npx prisma generate
CMD sh -c "npx prisma migrate dev --name init --preview-feature && npx prisma migrate deploy && npm run seed && npm start"