# 🚀 Express TypeScript Starter Template

A production-ready **Express.js + TypeScript** starter project with JWT authentication, OAuth (Google), email integration, API documentation (Swagger/OpenAPI), and other best practices baked in.  
Perfect for quickly bootstrapping new backend projects.

---

## 📂 Project Structure

.
├── src/
│ ├── config/ # Configuration (env, logger, db, etc.)
│ ├── controllers/ # Route controllers
│ ├── middlewares/ # Express middlewares
│ ├── models/ # Database models
│ ├── routes/ # API route definitions
│ ├── utils/ # Utility functions
│ ├── emails/ # Email templates & functions
│ └── app.ts # App entry point
│
├── prisma/ # Prisma schema & migrations (if used)
├── dist/ # Compiled JavaScript (generated after build)
├── .env # Environment variables (not committed)
├── .env.example # Example env file
├── package.json
├── tsconfig.json
└── README.md

---


## ⚙️ Features

- ✅ **Express + TypeScript** with strict linting & type-checking  
- ✅ **JWT Authentication** (Access + Refresh Tokens)  
- ✅ **Email Integration** (Nodemailer + Gmail/SMTP, MJML ready)  
- ✅ **OAuth 2.0 Google Login**  
- ✅ **Rate Limiting & Security Best Practices**  
- ✅ **Swagger/OpenAPI Documentation**  
- ✅ **Environment-based Config** (`.env`)  
- ✅ **Prettier & ESLint** for clean code  
- ✅ **Docker Ready** (optional)  


---

## 🔧 Setup & Installation

### 1️⃣ Clone & Install
```bash
git clone https://github.com/your-username/express-ts-starter.git
cd express-ts-starter
npm install

```

2️⃣ Setup Environment
Copy .env.example and configure:

```bash

cp .env.example .env
Update values like DATABASE_URL, JWT_SECRET, and EMAIL_PASS.
```

🚀 Running the Project
Development

```bash
npm run dev
Type-check only
```
```bash
npm run type-check
Build for Production
```
```bash
npm run build
Run Production Build
```
```bash
npm run start:prod

#📜 Available Scripts

npm run dev   #  → Start app in dev mode with nodemon

npm run build #  → Compile TypeScript to JavaScript

npm start #  → Run compiled build

npm run start:prod #  → Build & start production

npm run format #  → Format code with Prettier

npm run format:check #  → Check formatting

npm run type-check #  → TypeScript type-check

npm run seed #  → Run database seeding script
```

🛠️ API Documentation
Swagger UI available at:

```bash
http://localhost:3000/docs
Configured from environment variables:
```

```env
API_DOCS_ENABLE=true
API_DOCS_TITLE=My API
API_DOCS_DESCRIPTION=This is a template to get started
API_DOCS_VERSION=1.0.0
API_DOCS_ROUTE=/docs
```
📧 Email Setup
Uses Nodemailer with Gmail/SMTP by default.

Update .env with your credentials:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_ADDRESS=youremail@gmail.com
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your-app-password
SENDER_NAME=My API
Enable Gmail App Passwords if using Gmail:
Google App Password Setup
```
🔐 Authentication
JWT
Access Token → short-lived (15 minutes default)

Refresh Token  → long-lived (30 days default)

Google OAuth
Configure in .env:

```env
ACTIVATE_GOOGLE_AUTH=true
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CLIENT_URL=http://localhost:3000
```

🗄️ Database
Uses PostgreSQL (can be swapped).

Example .env:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/db_name"
Run migrations if using Prisma:
```

```bash
npx prisma migrate dev
```
🔒 Security
Bcrypt password hashing (BCRYPT_SALT_ROUNDS=12)

Helmet for secure headers

Rate Limiting (100 requests / 15 mins)

✅ Roadmap
 Add test suite (Jest)

 Add CI/CD pipeline

 Add Dockerfile & docker-compose for DB + app

 Add Redis caching

📄 License
MIT License © 2025 Your Name