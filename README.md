WFH Attendance System

A web-based Work From Home (WFH) Attendance Management System built using a microservices architecture.

This project is developed using:
Frontend: React (Vite)
Backend: NestJS
Database: MySQL
ORM: TypeORM (Migration-based, no synchronize)
Authentication: JWT
Architecture: Microservices

🏗 Architecture Overview
WFH_Attendance/
│
├── frontend-wfh/              → React + Vite
│
└── backend/
    ├── auth-service/          → NestJS + TypeORM (auth_db)
    └── attendance-service/    → NestJS + TypeORM (attendance_db)


Each service has its own database to ensure loose coupling and independent scalability.

🚀 Features
🔐 Authentication
- JWT-based login
- Password hashing using bcrypt
- Role-based access (ADMIN / USER)

🧑‍💼 Employee Management (Admin Only)
View employee list
- Add new employee
- Edit employee
- Delete employee

🕒 Attendance Management
- Record attendance (check-in / check-out)
- Attendance status:
  - Present
  - Late In
  - Early Out
- View attendance list
- Submit attendance correction request

🧩 Tech Stack
Frontend:
- React
- Vite
- Axios
- Ant Design

Backend
- NestJS
- TypeORM
- MySQL
- JWT
- bcrypt

⚙️ Setup Guide

1️⃣ Clone Repository
- git clone https://github.com/filbert29/attendance-wfh-system.git
- cd WFH_Attendance

2️⃣ Database Setup
Create two separate databases:
- CREATE DATABASE auth_db;
- CREATE DATABASE attendance_db;

3️⃣ Environment Configuration
Create .env file inside each service.
📌 backend/auth-service/.env
- DB_HOST=localhost
- DB_PORT=3306
- DB_USER=root
- DB_PASS=your_password
- DB_NAME=auth_db
- JWT_SECRET=your_secret_key
- JWT_EXPIRES_IN=1d

📌 backend/attendance-service/.env
- DB_HOST=localhost
- DB_PORT=3306
- DB_USER=root
- DB_PASS=your_password
- DB_NAME=attendance_db
- AUTH_SERVICE_URL=http://localhost:3001


⚠️ .env files are excluded via .gitignore.

4️⃣ Install Dependencies
Auth Service
- cd backend/auth-service
- npm install

Attendance Service
- cd ../attendance-service
- npm install

Frontend
- cd ../../frontend-wfh
- npm install

5️⃣ Run Database Migration

This project uses TypeORM migration (production-style configuration).

🔹 Auth Service
- cd backend/auth-service
- npm run migration:generate
- npm run migration:run

🔹 Attendance Service
- cd backend/attendance-service
- npm run migration:generate
- npm run migration:run

6️⃣ Seed Initial Data

Seed will create:

1 Admin user

🔹 Seed Auth Service
- cd backend/auth-service
- npm run seed


Default Admin Credential:

Email: admin@wfh.com
Password: password123

🔹 Seed Attendance Service
- cd backend/attendance-service
- npm run seed

7️⃣ Run the Application
🔹 Start Auth Service
- cd backend/auth-service
- npm run start:dev


Runs on:

http://localhost:3001

🔹 Start Attendance Service
- cd backend/attendance-service
- npm run start:dev


Runs on:

http://localhost:3002

🔹 Start Frontend
- cd frontend-wfh
- npm run dev


Runs on:

http://localhost:5173

🧠 Architecture Notes
- Microservices architecture
- Separate database per service
- JWT authentication
- Migration-based schema management
- No synchronize: true
- Environment variables for sensitive data
- Password stored as bcrypt hash

📌 Future Improvements
- Docker Compose setup
- API Gateway
- Refresh token implementation
- Automated testing
- Role-based middleware improvement

👨‍💻 Developed For
Software Engineer Technical Assessment

👨‍💻 Developed For

Software Engineer Technical Assessment
