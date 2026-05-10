# ── Stage 1: Build React app ──────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Pass API base URLs at build time via --build-arg
ARG REACT_APP_AUTH_API_URL=http://localhost:5001
ARG REACT_APP_RESTAURANT_API_URL=http://localhost:5002
ARG REACT_APP_DELIVERY_API_URL=http://localhost:5003
ARG REACT_APP_PAYMENT_API_URL=http://localhost:5004
ARG REACT_APP_ORDER_API_URL=http://localhost:5005

ENV REACT_APP_AUTH_API_URL=$REACT_APP_AUTH_API_URL
ENV REACT_APP_RESTAURANT_API_URL=$REACT_APP_RESTAURANT_API_URL
ENV REACT_APP_DELIVERY_API_URL=$REACT_APP_DELIVERY_API_URL
ENV REACT_APP_PAYMENT_API_URL=$REACT_APP_PAYMENT_API_URL
ENV REACT_APP_ORDER_API_URL=$REACT_APP_ORDER_API_URL

RUN npm run build

# ── Stage 2: Serve with nginx ─────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html

# Enable React Router (client-side routing)
RUN printf 'server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / {\n\
    try_files $uri /index.html;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
