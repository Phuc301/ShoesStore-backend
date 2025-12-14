# 👟 E-commerce Shoe Shop  

An e-commerce web application built with **Node.js (Express.js)** for selling shoes.  
The project supports full customer shopping flow, admin management, and deployment on **Docker Compose** or **AWS EC2**.  

---

## 🚀 Features  

### 👤 User Features  
- User registration, login, and social authentication (Google, Facebook)  
- Profile & address management  
- Order history and order tracking  
- Loyalty points system (10% cashback per order)  

### 👟 Product Features  
- Shoe catalog with categories, variants (size, color)  
- Search, filtering, and sorting (price, name, rating)  
- Product details with reviews & star ratings  
- Real-time review updates (WebSocket)  

### 🛒 Shopping & Checkout  
- Add/update/remove items from shopping cart  
- Multi-step checkout with guest checkout option  
- Apply discount codes (with usage limits)  
- Email order confirmation  

### 🔑 Admin Panel  
- Manage products, categories, and inventory  
- Manage users and orders (update status, ban users)  
- Create & manage discount codes  
- Dashboard & advanced analytics  

---

## 🛠️ Tech Stack  
- **Backend**: Node.js, Express.js  
- **Database**: MongoDB  
- **Authentication**: JWT, Passport.js (Google/Facebook OAuth)  
- **Real-time**: WebSocket (Socket.io)  
- **Deployment**: Docker Compose, AWS EC2  
- **Other**: GitHub Actions (CI/CD), Nodemailer  

---

## 🌐 Deployment  

### Docker Compose (local)  
1. Run the following command:  
   ```bash  
   docker compose up -d  
   ```  
2. Access the app at:  
   👉 http://localhost:8080  

### AWS EC2 (cloud)  
1. SSH into your EC2 instance.  
2. Clone the repository.  
3. Run Docker Compose:  
   ```bash  
   docker compose up -d  
   ```  
4. Access via EC2 public IP:  
   👉 http://47.128.64.7:8080  

---

## 📦 Release  
- **v1.0.0**: Initial stable release  
  - Full user & admin features  
  - Deployment with Docker Compose and AWS  

---

## 👨‍💻 Team & Collaboration  
- Developed as a final project for Web Programming with Node.js.  
- Team collaboration managed via GitHub Insights and commit history.  

---

## 📜 License  
This project is for educational purposes only.