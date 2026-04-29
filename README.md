# StudySync+

![StudySync+ Banner](https://via.placeholder.com/800x200.png?text=StudySync%2B+Collaborative+Learning+Platform)

**StudySync+** is a modern, full-stack collaborative learning and dataset-sharing platform. It empowers students, researchers, and educators to form study groups, share files and datasets seamlessly, and communicate in real time.

## 🚀 Features

- **User Authentication**: Secure signup and login using JWT.
- **Study Groups & Workspaces**: Create, join, and manage study groups. Group owners can edit group details and manage members.
- **Real-Time Collaboration**: Instant messaging within groups powered by Socket.IO.
- **Dataset Management**: Upload, share, and parse datasets. Supports CSV, PDF, and DOC formats.
- **Dataset Preview**: Built-in CSV parsing to preview dataset contents directly in the browser.
- **User Profiles & Contribution Tracking**: Keep track of your contributions, uploaded datasets, and activity.
- **Dark/Light Theme**: Built-in theme toggling with preference saving for a better user experience.
- **Responsive UI**: A premium, mobile-friendly interface built with Vanilla JavaScript and CSS.

## 🛠️ Technology Stack

### Frontend
- HTML5 & CSS3
- Vanilla JavaScript (Modular Architecture)
- Socket.IO Client

### Backend
- Node.js & Express.js
- MongoDB (Mongoose)
- Socket.IO (Real-time features)
- Multer (File uploads)
- JWT (Authentication)
- bcryptjs (Password hashing)
- csv-parse (CSV parsing)

## 📦 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/studysync.git
cd studysync
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory and add your environment variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:3000 # Adjust according to your frontend hosting/port
```

Start the backend server:
```bash
npm run dev
```
*(The server will typically run on http://localhost:5000)*

### 3. Frontend Setup
The frontend is built with vanilla web technologies, so no build step is required! 

Simply serve the `frontend/` directory using a local web server. 
For example, using `npx`:
```bash
npx serve frontend
```
Or using Python:
```bash
cd frontend
python -m http.server 3000
```
Then, open your browser and navigate to `http://localhost:3000`.

## 📂 Project Structure

```
StudySync+/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Mongoose database models
│   │   ├── routes/        # Express API routes
│   │   ├── utils/         # Helper functions (CSV parsing, seeds, etc.)
│   │   └── app.js         # Entry point for Express server
│   ├── package.json
│   └── .env
└── frontend/
    ├── modules/           # Modular Vanilla JS logic (api, auth, chat, etc.)
    ├── script.js          # Main frontend entry point
    ├── style.css          # Global and component styles
    └── index.html         # Main HTML file
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check the [issues page](https://github.com/yourusername/studysync/issues) if you want to contribute.

## 📝 License

This project is licensed under the MIT License.
