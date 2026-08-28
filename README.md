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
