# SkyDish – Food Delivery Microservices Platform

A modern, cloud-native, microservices-based food ordering & delivery platform designed for scalabilty.
Supports four roles: Customer, Restaurant Admin, Delivery Personnel, and Super Admin.

---

## 🌟 Key Features & Recent UI Overhaul
- **Centralized Login Hub (`/portals`):** A newly designed hub connecting users to their respective portals effortlessly.
- **Premium Customer Portal:** Modern UI with responsive grid layouts, dynamic headers, and glassmorphism cards for food menus and ordering.
- **Super Admin Dashboard:** Transformed into a professional portal featuring live summary stats, search-enabled data tables, and an intuitive Modal-based editing workflow.
- **Order Management:** Replaced legacy table views with responsive, status-badged Card designs.

---

## 🛠 Tech Stack

- **Frontend:** React, React Router DOM, React-Bootstrap, Axios
- **Backend:** Node.js, Express.js
- **Databases:** MongoDB Atlas (Mongoose) with isolated databases per microservice
- **Auth:** JWT & bcrypt
- **Payments:** Paymob Integration (Test Mode)
- **Notifications:** Twilio (SMS), Resend (Email)
- **Containerization:** Docker & Docker Compose
- **Orchestration:** Kubernetes (YAML manifests)

---

## 🔌 Microservices & Architecture

The backend is fully decoupled into 5 microservices communicating via REST and sharing state via MongoDB Atlas clusters:

1. **Auth Service** (Port `5001`) - Handles user registration, login, and JWT issuance.
2. **Restaurant Service** (Port `5002`) - Manages restaurant profiles, food item menus, and Super Admin controls.
3. **Delivery Service** (Port `5003`) - Handles delivery personnel assignment and status updates.
4. **Payment Service** (Port `5004`) - Processes transactions via Paymob.
5. **Order Service** (Port `5005`) - Tracks order status from cart to delivery.

**Frontend Application** runs on Port `3000`.

---

## 🚀 Running Locally with Docker Compose

Ensure you have Docker and Docker Compose installed.

1. Clone the repository:
   ```bash
   git clone https://github.com/mido-io/Cloud-Computing-Project.git
   cd Cloud-Computing-Project
   ```

2. Build and start all services:
   ```bash
   docker-compose up --build -d
   ```

3. Access the platform:
   - Open your browser and navigate to **[http://localhost:3000/portals](http://localhost:3000/portals)**

---

## 🔑 Test Credentials

To easily test the application, use the following pre-seeded credentials:

### 👤 Customer
- **Portal:** `http://localhost:3000/auth/login`
- **Email:** `customer@skydish.com`
- **Password:** `Test1234!` 

### 🏢 Restaurant Admin (Partner)
- **Portal:** `http://localhost:3000/restaurant/login`
- **Email:** `restaurant@skydish.com`
- **Password:** `Rest1234!`

### 👑 Super Admin
- **Portal:** `http://localhost:3000/superadmin/login`
- **Email:** `admin@skydish.com`
- **Password:** `password123`

### 🚚 Delivery Driver
- Portal: http://localhost:3000/delivery/login
- Email: testdriver@skydish.com
- Password: password123

---

## 🚢 Kubernetes Deployment

Manifests are provided in the `/k8s` directory.

```bash
# Apply ConfigMaps and Deployments
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/
```

*(Note: Ensure sensitive keys like JWT secrets and API keys are populated securely before applying in production).*

---

## 📄 API Documentation

- **Swagger UI** for Payment Service available at: `http://localhost:5004/api-docs`

---
*Developed for the Cloud Computing Project.*
