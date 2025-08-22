# ICE Futsal Fest - Project Documentation

## 📋 Overview

ICE Futsal Fest is a web application for managing and displaying futsal tournament data including teams, matches, points tables, and tournament stages. It features an admin panel for content management and a responsive design for viewers.

## 🚀 Live Demo

- **Production URL**: [[Live](https://ice-futsal.web.app/)]

## 🛠️ Technology Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js/Express.js API
- **Authentication**: Firebase Authentication
- **Database**: MongoDB (or your chosen database)
- **Hosting**: Firebase Hosting / Netlify
- **CI/CD**: GitHub Actions (optional)

## 📁 Project Structure

```
ice-futsal-fest/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/          # Reusable components
│   ├── firebase.config.js   # Firebase configuration
│   ├── App.js              # Main application component
│   └── index.js            # Application entry point
├── api/                    # Backend API code
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   └── server.js           # Server entry point
├── .env.example            # Environment variables template
├── package.json            # Frontend dependencies
├── package-api.json        # Backend dependencies (if separate)
└── README.md               # This file
```

## ⚙️ Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB database
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sabbirsolid/ice-futsal-fest-client
   cd ice-futsal-fest
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd api
   npm install
   cd ..
   ```

4. **Environment setup**
   - Copy `.env.example` to `.env` in both root and api directories
   - Fill in your environment variables:
     ```
     # Frontend .env
     REACT_APP_API_URL=http://localhost:5000/api
     REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
     REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     REACT_APP_FIREBASE_PROJECT_ID=your_project_id
     
     # Backend .env (in api folder)
     MONGODB_URI=your_mongodb_connection_string
     PORT=5000
     ```

5. **Database setup**
   - Ensure MongoDB is running
   - The application will create collections automatically

6. **Run the application**
   ```bash
   # Start backend server (from /api directory)
   npm run dev
   
   # Start frontend (from root directory in new terminal)
   npm start
   ```

   The app will be available at:
   - Frontend: http://localhost:3000
   - API: http://localhost:5000

## 🔐 Admin Access

Default admin credentials:
- Email: admin@ice.com
- Password: ganjam

To add admin users:
1. Go to Firebase Console → Authentication → Users
2. Add user with email admin@ice.com (or your preferred email)
3. Set the password

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teams` | Get all teams |
| POST | `/api/teams` | Create a new team |
| DELETE | `/api/teams/:id` | Delete a team |
| GET | `/api/matches` | Get all matches |
| POST | `/api/matches` | Create a new match |
| DELETE | `/api/matches/:id` | Delete a match |
| GET | `/api/points` | Get points table |
| POST | `/api/points` | Add/update points |
| PATCH | `/api/points/:id` | Update points |
| DELETE | `/api/points/:id` | Delete points entry |
| GET | `/api/upcoming` | Get upcoming matches |
| POST | `/api/upcoming` | Add upcoming match |
| DELETE | `/api/upcoming/:id` | Delete upcoming match |
| GET | `/api/semifinals` | Get semifinal matches |
| POST | `/api/semifinals` | Add semifinal match |
| DELETE | `/api/semifinals/:id` | Delete semifinal match |
| GET | `/api/finals` | Get final matches |
| POST | `/api/finals` | Add final match |
| DELETE | `/api/finals/:id` | Delete final match |

## 🚀 Deployment

### Frontend Deployment (Netlify)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Drag and drop the `build` folder to Netlify
   - Or connect your GitHub repository for auto-deployment

3. **Environment variables in Netlify**
   - Go to Site settings → Environment variables
   - Add your production environment variables:
     - `REACT_APP_API_URL`: Your production API URL
     - Firebase configuration variables

### Backend Deployment (Heroku/Railway)

1. **Prepare for deployment**
   ```bash
   cd api
   ```

2. **Deploy to Heroku**
   ```bash
   # Login to Heroku
   heroku login
   
   # Create app
   heroku create your-app-name
   
   # Set environment variables
   heroku config:set MONGODB_URI=your_production_mongodb_uri
   
   # Deploy
   git subtree push --prefix api heroku main
   ```

### Alternative: Firebase Deployment

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login and initialize**
   ```bash
   firebase login
   firebase init
   ```

3. **Build and deploy**
   ```bash
   npm run build
   firebase deploy
   ```

## 🔧 Troubleshooting

### Common Issues

1. **Data not loading in production**
   - Check if API_BASE_URL is correctly set for production
   - Verify CORS settings on the backend

2. **Authentication issues**
   - Ensure Firebase auth domain is added to authorized domains
   - Check Firebase API key configuration

3. **Database connection issues**
   - Verify MongoDB connection string
   - Check if IP is whitelisted in MongoDB Atlas

4. **Build failures**
   - Check Node.js version compatibility
   - Verify all environment variables are set

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 👥 Authors

- **Sabbir Ahmed** - *Initial work* - [sabbir](https://github.com/sabbirsolid)

## 🙏 Acknowledgments

- React and Firebase communities for excellent documentation
- Contributors and testers

## 📞 Support

If you have any questions or issues, please contact:
- Email: sabbir.designer21@gmail.com
