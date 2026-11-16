# EduCommunity 

EduCommunity is a comprehensive full-stack educational platform designed to connect teachers, students, and administrators, featuring a robust microservices-ready architecture and production-grade DevOps implementation.

---

 Tech Stack & Infrastructure

### **Backend**
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB & Mongoose (with advanced aggregation pipelines)
* **Real-time Communication:** Socket.IO
* **File Management:** Cloudinary
* **Security:** JWT Authentication, bcrypt, Joi/Zod validation

### **Frontend**
* **Library/Framework:** React.js / Vite / Next.js
* **Styling:** Tailwind CSS

### **DevOps & Cloud Infrastructure**
* **Containerization:** Docker & Docker Compose (Multi-container setup for Frontend, Backend, and Services)
* **Infrastructure as Code (IaC):** Terraform (Cloud provisioning & storage configurations)
* **Web Server & Reverse Proxy:** Nginx
* **CI/CD & Version Control:** GitHub Actions / Git

---

##  Features

* **Multi-Role User Management:** Tailored dashboards for Students, Teachers, and Administrators.
* **Real-Time Communication:** Instant messaging and notifications powered by **Socket.IO**.
* **Weighted Teacher Rating System:** Dynamic rating aggregation pipelines built into MongoDB.
* **Task & Reward System:** Interactive student task submissions and automated points/rewards tracking.
* **Cloud File Uploads:** Seamless media and document handling utilizing **Cloudinary**.
* **Containerized Deployment:** Fully dockerized services with custom `Dockerfile` configurations for both frontend and backend.
* **Automated Provisioning:** Infrastructure management using Terraform scripts (`main.tf`, `variables.tf`, `storage.tf`).

---

##  Installation & Setup

### Prerequisites
* Node.js & npm installed locally
* Docker & Docker Compose
* Terraform (optional, for cloud infrastructure provisioning)

### 1. Clone the Repository
```bash
git clone [https://github.com/Ahmedadel33/EduCommunity-Egypt.git](https://github.com/Ahmedadel33/EduCommunity-Egypt.git)
cd EduCommunity-Egypt
```

### Run all applications locally
Install the root runner and each application's dependencies:
```bash
npm install
npm --prefix backend ci
npm --prefix frontend ci
npm --prefix admin ci
```

Create the backend environment file and start MongoDB and Redis:
```bash
Copy-Item backend\.env.example backend\.env
docker compose up -d mongo redis
```

Then run the backend, frontend, and admin dashboard together from the repository root:
```bash
npm run dev
```

The frontend is available at `http://localhost:8080`, the admin dashboard at `http://localhost:5200/`, and the backend at `http://localhost:5000`. Stop all three with `Ctrl+C`.

### Deploy to Vercel

Deploy the monorepo as three Vercel projects connected to this repository:

1. Create a frontend project with Root Directory `frontend`.
2. Create an admin project with Root Directory `admin`.
3. Create a backend project with Root Directory `backend`.

Each project uses its own `vercel.json`. Set `VITE_API_URL` in the frontend and admin project settings to the deployed backend URL ending in `/api/v1` (for example, `https://<backend-project>.vercel.app/api/v1`). Set `VITE_ADMIN_URL` in the frontend project to the admin deployment's root URL (for example, `https://<admin-project>.vercel.app/`).

Set `MONGODB_URI`, `JWT_SECRET`, and `JWT_REFRESH_SECRET` in the backend project. Set `CORS_ORIGIN` to the frontend and admin deployment origins. Configure Cloudinary credentials for persistent uploaded files; Vercel Functions do not persist local uploads. Gmail notification variables are optional.

Vercel's standard `vercel.json` does not support a multi-service `services` array or automatic service bindings. These three projects therefore use the backend deployment URL through `VITE_API_URL`. The backend Express app runs as a Vercel Function; persistent Socket.IO connections and the in-process weekly cron require separate hosting or Vercel-compatible services. If Socket.IO is hosted separately, set `VITE_SOCKET_URL` in the frontend project to its origin.
