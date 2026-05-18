FROM node:18

WORKDIR /app

COPY frontend ./frontend
COPY backend ./backend

# Install frontend dependencies
WORKDIR /app/frontend

RUN npm install
RUN npm run build

# Install backend dependencies
WORKDIR /app/backend

RUN npm install

# Create public folder
RUN mkdir -p public

# Copy React build into backend public folder
RUN cp -r /app/frontend/build/* /app/backend/public/

EXPOSE 5000

CMD ["node", "server.js"]