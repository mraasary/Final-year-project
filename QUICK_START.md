# 🚀 Quick Start Guide - MindFul AI

## Prerequisites
- Node.js (v14+) installed
- MongoDB Atlas account (configured in .env)
- Google Gemini API key (configured in .env)

## Getting Started

### 1️⃣ Install Dependencies
```powershell
npm install
```

### 2️⃣ Configure Environment
Create/verify `.env` file in root directory with:
```
GOOGLE_API_KEY=your_api_key_here
MONGODB_URI=your_mongodb_connection_string
PORT=3000
NODE_ENV=development
```

### 3️⃣ Start the Server
```powershell
node server.js
```

Expected output:
```
Server running on http://localhost:3000
✅ MongoDB connected successfully
```

### 4️⃣ Open in Browser
- **Main Site**: http://localhost:3000
- **Articles**: http://localhost:3000/public/articles.html
- **Quiz**: http://localhost:3000/public/quiz.html
- **Community**: http://localhost:3000/public/community.html
- **Chatbot**: http://localhost:3000/public/chatbot.html
- **Dashboard**: http://localhost:3000/public/dashboard.html

---

## 🔧 Common Ports & URLs

| Service | URL | Status |
|---------|-----|--------|
| Web App | `http://localhost:3000` | ✅ Running |
| API | `http://localhost:3000/api/` | ✅ Available |
| Articles | `/api/articles` | ✅ Available |
| Chat | `/api/chat` | ✅ Available |

---

## 📦 Key Dependencies

| Package | Purpose | Version |
|---------|---------|---------|
| express | Web framework | ^5.1.0 |
| mongoose | MongoDB ORM | ^8.15.0 |
| @google/generative-ai | Gemini AI API | ^0.24.1 |
| dotenv | Environment variables | ^16.5.0 |
| cors | Cross-Origin requests | ^2.8.5 |
| express-session | User sessions | ^1.18.1 |

---

## 🧪 Testing the APIs

### Test Login
```javascript
fetch('http://localhost:3000/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
})
```

### Test Chat API
```javascript
fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'I am feeling anxious',
    email: 'user@example.com'
  })
})
```

### Test Quiz Submission
```javascript
fetch('http://localhost:3000/api/submit-quiz', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    responses: { q1: 2, q2: 3, q3: 1 }
  })
})
```

---

## 🐛 Troubleshooting

### Issue: MongoDB Connection Failed
**Solution**: 
- Check MongoDB URI in `.env`
- Verify IP whitelist in MongoDB Atlas
- Ensure VPN/firewall allows Atlas connections

### Issue: Google API Key Error
**Solution**:
- Verify API key in .env is correct
- Check if API is enabled in Google Cloud Console
- Ensure quota limits aren't exceeded

### Issue: Port 3000 Already in Use
**Solution**:
```powershell
# Change PORT in .env to 3001
PORT=3001
```

### Issue: CORS Errors
**Solution**:
- Verify your frontend URL is correct
- Check CORS is enabled in server.js
- Clear browser cache

---

## 📂 Project Structure

```
MindFul AI/
├── server.js          # Main server file
├── .env               # Environment configuration
├── package.json       # Dependencies
├── public/            # Frontend files
│   ├── *.html        # All page templates
│   ├── *.css         # Stylesheets
│   ├── *.js          # Client-side scripts
│   └── image.png     # Assets
└── BUILD_SUMMARY.md   # Build documentation
```

---

## 🎯 Main Features

### User Management
- Register & Login
- User preferences
- Profile management

### Mental Health Tools
- Depression screening quiz
- AI-powered CBT chatbot
- Mood tracking
- Diary with reframing
- Progress reports

### Community
- Share posts
- Support forum
- Topic discussion

---

## 💡 Tips

1. **Development Mode**: NODE_ENV=development shows detailed errors
2. **Local Storage**: Frontend uses browser localStorage for session data
3. **Database**: All user data stored in MongoDB Atlas
4. **AI Responses**: Powered by Google Gemini API

---

## 🔐 Security Notes

- Never commit `.env` file to git
- Store sensitive keys securely
- Use HTTPS in production
- Implement rate limiting for APIs
- Hash passwords before storing (consider bcrypt)

---

## 📞 Support Resources

- **MongoDB Docs**: https://docs.mongodb.com/
- **Google Gemini API**: https://ai.google.dev/
- **Express.js Guide**: https://expressjs.com/
- **CORS Documentation**: https://enable-cors.org/

---

**Ready to start? Run `npm install && node server.js`** ✅
