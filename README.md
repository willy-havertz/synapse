# Full Stack Social Platform + Realtime Chat App Prompt

I want to build a full-stack MERN (MongoDB, Express, React, Node.js) project using the following structure:


---

## 🔐 Authentication
- Email/password signup and login
- JWT authentication for protected routes

---

## 💬 Chat Page Features
- Realtime 1-1 and group messaging (Socket.io)
- Online/offline status
- Typing indicators
- Send text, emojis, images (via Cloudinary), voice notes, documents
- Search users
- User blocking/muting
- Unread message counter
- Message read receipts
- Delete/edit messages
- Reply to or react to messages
- Notification system

---

## ⚙️ Settings Page
- Change profile photo (upload to Cloudinary)
- Change username and password (with email code verification)
- Dark/light theme toggle (with FontAwesome icons)
- Enable/disable read receipts
- Privacy options: who can message, show online status, etc.
- Account deletion
- Support/donation (via PayPal and M-PESA)
- Buy verification badge (paid with PayPal or M-PESA)
- Notification preferences (email, push, in-app)
- View login activity/devices
- Terms and Conditions

---

## 📷 Photo Analyzer Page
- Upload or take a selfie
- Measure “handsomeness” or “beauty” using AI model
- Show rating and feedback
- Save results to profile (optional)
- Option to retake photo

---

## 🌦️ Weather Page
- Show user's local weather using weather API
- Show 7-day forecast: rain, sun, wind, temperature
- Update based on geolocation or manual location search

---

## 📱 Device Inspector Page
- Show user's device info (model, brand, OS, battery status)
- Show lifetime estimates (battery health, expected lifespan)
- Show security score based on OS updates, usage
- Provide tips to improve performance and security

---

## 🚀 Tech Trends Page
- Show latest technology trends by category:
  - Cybersecurity
  - Engineering
  - Nursing
  - Agriculture
  - Education
- Use external API or manually updated database
- Allow search and filter by field
- Like/save interesting posts
- Weekly newsletter option (optional)

---

## 📊 Analytics Page
- Track user activity (messages sent, photos uploaded, logins)
- Device/browser analytics
- Message trends, most active friends
- Time spent in app (daily, weekly)
- Voice vs text usage

---

## 🧠 Gamification
- XP system for user activity (chatting, uploading, supporting)
- Levels and badges
- Leaderboard
- Daily goals and streaks
- Reward with discounts or visual perks

---

## 🤖 AI Chatbot (Python)
- A chatbot that can answer user questions or help them navigate
- Built with Python using:
  - Flask/FastAPI backend
  - Natural language model (OpenAI API or custom)
  - Exposed as an API and consumed in React frontend
- Can answer support queries, guide users, or give feedback on photos

---

## ☁️ Other Tech Stack Details
- Cloudinary for image storage
- Socket.io for real-time chat
- Tailwind CSS for frontend styling
- React Context or Redux for state management
- dotenv for config
- Helmet & CORS for security
- MongoDB Atlas for production DB
- Vercel for client deployment, Render for server

---

## ✅ Extra Pages
- Terms and Conditions (with legal layout)
- About the platform
- Contact/Support form (email or live chat)
- Privacy Policy

---

## 🔐 Security
- Secure all API endpoints
- Validate image uploads
- Use HTTPS
- Rate limiting and brute force protection
- Sanitize inputs and outputs
- Audit logs for admin
- Prevent XSS, CSRF, and injection attacks

---

## 📄 Deliverables
- Full client and server code
- `.env.example` files
- Deployment configuration (Render, Vercel)
- GitHub Actions workflows for CI/CD
- README with documentation and screenshots

also use toast notification,the app is caLLED synapse(root folder),use the cx,ux,ui of this site(https://connect-discover-evolve-bdtz63uk6-wiltords-projects.vercel.app/)