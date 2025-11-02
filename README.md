# StudySync 🌊

A comprehensive interactive learning platform that combines collaborative study features, AI-powered educational tools, and gamification to enhance the learning experience.

## 🚀 Features

### Core Features
- **Dashboard**: Personalized learning dashboard with progress tracking
- **Interactive Learning**: Real-time collaborative learning sessions
- **Quiz Generator**: AI-powered quiz creation with multiple question types
- **Micro Quiz Builder**: Quick quiz creation for bite-sized learning
- **Daily Questions**: Daily challenges to keep learners engaged
- **Notes**: Rich text editor for creating and managing study notes
- **Simulations**: Interactive simulations for hands-on learning
- **Animations**: Learn through engaging visual animations

### Collaboration Features
- **Study Sessions**: Create and join collaborative study sessions
- **Community Rooms**: Real-time chat rooms for group discussions
- **Quiz Rooms**: Multiplayer quiz competitions
- **Whiteboard**: Collaborative whiteboard for visual explanations
- **Voice Chat**: Real-time voice communication during study sessions

### Engagement & Gamification
- **XP System**: Earn experience points for learning activities
- **Badges**: Unlock achievements and badges
- **Leaderboard**: Compete with other learners
- **Engagement Tracker**: Monitor your learning progress and streaks

### AI-Powered Tools
- **AI Quiz Generation**: Generate quizzes from any topic using Google Gemini AI
- **AI Summaries**: Get AI-generated summaries of study sessions
- **Flowchart Generator**: Create visual flowcharts from text
- **Auto Text**: AI-assisted content creation

### Advanced Features
- **Face Detection**: Engagement tracking using face-api.js
- **Real-time Collaboration**: Socket.io powered real-time features
- **Multi-language Support**: Built-in language switcher
- **Theme Support**: Dark/light mode with custom themes
- **Profile Management**: Customize your learning profile

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Socket.io Client** - Real-time communication
- **Tailwind CSS** - Utility-first CSS framework
- **Editor.js** - Block-style rich text editor
- **Face-api.js** - Face detection and recognition
- **Mermaid** - Diagram and flowchart generation
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Google Generative AI** - AI-powered content generation
- **Supabase** - Cloud storage for files and images
- **Multer** - File upload handling
- **Sharp** - Image processing
- **Node-cron** - Scheduled tasks

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas)
- **Git**

## 🔧 Installation

### 1. Clone the repository
```bash
git clone https://github.com/akshayachigullapally/HackWave.git
cd HackWave
```

### 2. Install Client Dependencies
```bash
cd client
npm install
```

### 3. Install Server Dependencies
```bash
cd ../server
npm install
```

### 4. Environment Configuration

#### Server Environment Variables
Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Google Generative AI
GOOGLE_API_KEY=your_google_gemini_api_key

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_BUCKET=your_bucket_name
```

#### Client Environment Variables
Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 5. Download Face Detection Models
Run the PowerShell script to download required face-api.js models:

```powershell
.\download-models.ps1
```

Or manually download models to `client/public/models/`:
- `tiny_face_detector_model`
- `face_landmark_68_model`
- `face_expression_model`

## 🚀 Running the Application

### Development Mode

#### Start the Server
```bash
cd server
npm run dev
```
The server will run on `http://localhost:5000`

#### Start the Client
```bash
cd client
npm run dev
```
The client will run on `http://localhost:5173`

### Production Build

#### Build the Client
```bash
cd client
npm run build
```

#### Start Production Server
```bash
cd server
npm start
```

## 📁 Project Structure

```
HackWave/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   │   └── models/        # Face-api.js models
│   ├── src/
│   │   ├── assets/        # Theme and static files
│   │   ├── components/    # React components
│   │   ├── context/       # Context providers
│   │   ├── data/          # Static data files
│   │   └── utils/         # Utility functions
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Node.js backend
│   ├── config/           # Configuration files
│   ├── middleware/       # Express middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── socket/           # Socket.io handlers
│   ├── uploads/          # File uploads
│   ├── scripts/          # Utility scripts
│   ├── package.json
│   └── server.js         # Entry point
│
└── README.md             # This file
```

## 🔑 Key Components

### Frontend Components
- **Dashboard**: Main user dashboard with analytics
- **Community**: Chat rooms and community features
- **QuizGenerator**: AI-powered quiz creation
- **InteractiveLearning**: Real-time collaborative learning
- **SimulationView**: Interactive simulations
- **Whiteboard**: Collaborative drawing canvas
- **BadgesGrid**: Achievement display
- **Leaderboard**: User rankings
- **EngagementTracker**: Face detection-based engagement

### Backend Services
- **aiSummaryService**: Generate AI summaries
- **analyticsService**: Track user analytics
- **badgeService**: Manage badges and achievements
- **cronService**: Scheduled tasks (daily questions)
- **dailyQuestionService**: Daily challenge management
- **quizService**: Quiz generation and management
- **voiceService**: Voice chat integration
- **xpService**: Experience points calculation

### API Routes
- `/api/auth` - Authentication (login, register)
- `/api/profile` - User profile management
- `/api/quiz` - Quiz operations
- `/api/quiz-rooms` - Multiplayer quiz rooms
- `/api/micro-quiz` - Micro quiz management
- `/api/daily-questions` - Daily challenges
- `/api/notes` - Note management
- `/api/simulations` - Simulation CRUD
- `/api/community` - Chat rooms and messages
- `/api/sessions` - Study sessions
- `/api/whiteboard` - Whiteboard data
- `/api/gemini` - AI-powered features
- `/api/xp` - XP and leaderboard

## 🎮 Usage

### Getting Started
1. **Register/Login**: Create an account or login
2. **Explore Dashboard**: View your progress and available features
3. **Create a Quiz**: Use the quiz generator to create custom quizzes
4. **Join Community**: Participate in study rooms
5. **Track Progress**: Monitor your XP, badges, and leaderboard position
6. **Daily Questions**: Complete daily challenges for bonus XP

### Creating a Study Session
1. Navigate to "Interactive Learning"
2. Click "Create Session"
3. Set session details (topic, duration, etc.)
4. Invite participants
5. Start collaborating in real-time

### Using the Whiteboard
1. Join a study session
2. Open the whiteboard
3. Draw, annotate, and share with participants
4. Save and export your work

## 🧪 Database Schema

### Key Models
- **User**: User profiles, authentication, XP, badges
- **Quiz**: Quiz content and questions
- **QuizRoom**: Multiplayer quiz sessions
- **MicroQuiz**: Quick quiz entries
- **DailyQuestion**: Daily challenges
- **Note**: User notes with rich content
- **Simulation**: Interactive simulations
- **Animation**: Learning animations
- **Room**: Community chat rooms
- **Message**: Chat messages
- **StudySession**: Collaborative study sessions
- **Whiteboard**: Whiteboard data
- **WhiteboardImage**: Saved whiteboard images

## 🔒 Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- CORS configuration
- Socket authentication
- Secure file uploads

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Scripts

### Client Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Server Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `node seed.js` - Seed database with sample data
- `node migrateNotes.js` - Migrate notes data
- `node migrateSimulations.js` - Migrate simulations data

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check your `MONGODB_URI` in `.env`

**Socket.io Connection Failed**
- Verify `CLIENT_URL` in server `.env`
- Check `VITE_SOCKET_URL` in client `.env`

**Face Detection Not Working**
- Ensure models are downloaded in `client/public/models/`
- Run `.\download-models.ps1` script

**Build Errors**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- **Akshaya Chigullapally** - [GitHub Profile](https://github.com/akshayachigullapally)

## 🙏 Acknowledgments

- Google Generative AI for AI-powered features
- Face-api.js for face detection capabilities
- Socket.io for real-time communication
- Editor.js for rich text editing
- The open-source community

## 📞 Support

For support, email your-email@example.com or open an issue in the GitHub repository.

## 🔮 Future Enhancements

- [ ] Mobile app version
- [ ] Video streaming for study sessions
- [ ] Advanced analytics dashboard
- [ ] Plugin system for custom features
- [ ] Multi-language content support
- [ ] Offline mode
- [ ] AI-powered study recommendations
- [ ] Integration with external learning platforms

---

**Happy Learning! 🎓✨**
