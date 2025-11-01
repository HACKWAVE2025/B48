# HackWave Learning Platform - Complete Agent Training Guide

## 🎯 PLATFORM OVERVIEW

**HackWave** is a comprehensive, AI-powered educational platform designed to revolutionize the learning experience for students (grades 5th-12th) and researchers. The platform combines gamification, social learning, interactive simulations, and artificial intelligence to create an engaging, personalized learning ecosystem.

**Mission:** To make learning engaging, accessible, and effective through technology-driven education that adapts to each learner's pace and style.

**Target Audience:**
- Students: Grades 5th through 12th
- Researchers: Academic and scientific research community
- Learning enthusiasts of all levels

---

## 🚀 GETTING STARTED (ONBOARDING)

### Step 1: Account Registration
**URL:** `/register`

**What users need:**
- Full Name
- Email Address
- Password (secure, minimum 8 characters)
- Location (for localized content)
- Role Selection:
  - **Student**: Access to grade-appropriate content, quizzes, and learning tools
  - **Researcher**: Access to advanced simulations, research tools, and community features
- Interests: Select from multiple subjects (Physics, Chemistry, Biology, Math, Computer Science, etc.)

**After Registration:**
- Users receive a welcome message
- Automatically directed to the Dashboard
- Start at Level 1 with 0 XP
- Receive "Starter" badge automatically

### Step 2: First Login
**URL:** `/login`

**Login Options:**
- Remember Me (saves login credentials)
- Standard login with email and password
- Secure authentication with JWT tokens

**First-Time Experience:**
- Personalized dashboard greeting
- Tour of available features
- Recommended first steps based on role
- Introduction to XP and leveling system

### Step 3: Profile Setup
**URL:** `/profile`

**Complete Your Profile:**
- Upload profile avatar/photo
- Write a bio (introduce yourself to the community)
- Select grade level (for students)
- Add detailed interests and subjects
- Set learning goals
- View your starting stats:
  - Level: 1
  - XP: 0
  - Current Streak: 0 days
  - Badges: 1 (Starter Badge)

---

## 📊 DASHBOARD - YOUR LEARNING COMMAND CENTER

**URL:** `/dashboard`

### Main Dashboard Features:

#### 1. **Welcome Section**
- Personalized greeting with user's name
- Current level display
- Total XP counter
- Current streak indicator
- Beautiful animated background with particles

#### 2. **Stats Overview Cards**
Display at a glance:
- **Total XP**: Cumulative experience points earned
- **Achievements**: Total badges and milestones unlocked
- **Courses**: Number of completed learning modules
- **Current Streak**: Consecutive days of activity

#### 3. **Quick Action Cards**
Easy access to all major features:

**🎓 Resources**
- Access study guides, references, and educational materials
- Organized by subject and difficulty
- Quick link: "Browse"

**👥 Learning Community**
- Connect with peers
- Join study rooms
- Participate in discussions
- Create or join study sessions
- Quick link: "Join"

**🧠 AI Quiz Challenge**
- Personalized quizzes powered by Google Gemini AI
- Adaptive difficulty based on performance
- Multiple subjects available
- Earn XP for every quiz completed
- Quick link: "Start Quiz"

**🔬 Interactive Simulations**
- Virtual science experiments
- Physics simulations
- Chemistry labs
- Biology visualizations
- Quick link: "Explore"

**✨ AI Learning Assistant**
- Get instant help with any topic
- AI-generated animations and explanations
- Voice-enabled learning
- Visual concept explanations
- Quick link: "Learn"

**🧩 Interactive Learning Tools**
- Digital Flashcards (spaced repetition)
- Pomodoro Study Timer
- Mind Mapping Tools
- Study analytics and tracking
- Quick link: "Study"

**🏆 Badges & Achievements**
- View all earned badges
- See progress toward unearned badges
- Track milestone achievements
- Quick link: "View Badges"

**📝 My Notes**
- Rich text editor powered by EditorJS
- Create, organize, and share notes
- Markdown support
- Code snippets and formatting
- Quick link: "Open Notes"

#### 4. **Daily Challenge Widget**
- Complete today's question to maintain streak
- Earn 100 XP for correct answers
- Earn 30 XP even for wrong answers (encourages participation)
- Streak bonuses:
  - 7 days: +100 XP bonus
  - 30 days: +500 XP bonus
  - 100 days: +2000 XP bonus
- Button: "Take Today's Challenge"

#### 5. **Weekly Competition Widget**
- View your ranking on the leaderboard
- See top performers
- Weekly reset for fair competition
- Button: "View Leaderboard"

#### 6. **XP Progress Display**
- Current level with visual progress bar
- XP needed for next level
- Visual unlock information
- Next level rewards preview

---

## 🎮 GAMIFICATION SYSTEM

### XP (Experience Points) System

**Philosophy:** Reward active learning, consistency, and engagement across all platform features.

#### XP Earning Activities:

**Daily Activities (Highest Priority)**
- ✅ Daily Challenge - Correct Answer: **100 XP**
- ❌ Daily Challenge - Wrong Answer: **30 XP** (still rewards effort)
- 📝 Writing a Note: **15 XP** (max 3 notes/day = 45 XP/day)
- 💬 Chat Message: **2 XP** (community participation)
- 🤝 Helpful Message (upvoted): **5 XP** (max 5/day = 25 XP/day)

**Learning Activities**
- 🧪 Simulation Completed: **40 XP**
- 📚 Quiz Set Completed: **30 XP**
- 🎯 Quiz Bonus (≥80% score): **+10 XP** (bonus on top of base)
- 🚪 Join Room: **1 XP**

**Streak Bonuses (Milestone Rewards)**
- 🔥 7-Day Streak: **+100 XP bonus**
- 🔥 30-Day Streak: **+500 XP bonus**
- 🔥 100-Day Streak: **+2000 XP bonus**

**Weekly Leaderboard Rewards**
- 🥇 1st Place: **200 XP**
- 🥈 2nd Place: **150 XP**
- 🥉 3rd Place: **100 XP**

### Level System

**10 Levels Total** - Each with increasing XP requirements and special unlocks

| Level | XP Range | Unlocks |
|-------|----------|---------|
| 1 | 0 - 100 | Starter badge, basic features |
| 2 | 101 - 300 | Profile customization |
| 3 | 301 - 600 | Bronze Badge |
| 4 | 601 - 1,000 | Access to advanced quizzes |
| 5 | 1,001 - 1,500 | Silver Badge |
| 6 | 1,501 - 2,200 | Unlock new simulations |
| 7 | 2,201 - 3,000 | Gold Badge |
| 8 | 3,001 - 4,000 | Mentor role in community |
| 9 | 4,001 - 5,500 | Platinum Badge + certificate |
| 10 | 5,501+ | Master status + special privileges |

**Level Progress Features:**
- Visual progress bar showing percentage to next level
- XP needed display
- Next unlock preview
- Celebration animation on level up
- Badge rewards at milestone levels

### Badge System

**Complete Badge Collection** - Earn badges across multiple categories

#### 🎯 Quiz-Based Badges

1. **First Steps** 🚀
   - Category: Quiz
   - Requirement: Complete your first quiz
   - Color: Blue
   - Progress tracking available

2. **Quiz Master** 👑
   - Category: Quiz
   - Requirement: Complete 50 quizzes
   - Color: Purple
   - Shows dedication to learning

#### 🔥 Streak Badges

3. **Getting Started** 🔥
   - Category: Streak
   - Requirement: Complete 3 quizzes in a row
   - Color: Orange

4. **Weekly Warrior** ⚡
   - Category: Streak
   - Requirement: Complete 7 quizzes in a row
   - Color: Yellow

5. **Unstoppable** 🏆
   - Category: Streak
   - Requirement: Complete 15 quizzes in a row
   - Color: Gold

#### 📊 Performance Badges

6. **Perfectionist** ⭐
   - Category: Score
   - Requirement: Score 100% on a quiz
   - Color: Green

7. **High Scorer** 🎯
   - Category: Average
   - Requirement: Maintain 90% average score
   - Color: Green

8. **Speed Demon** 💨
   - Category: Speed
   - Requirement: Complete a quiz in under 5 minutes
   - Color: Cyan

#### 📅 Daily Challenge Badges

9. **Daily Challenger** 📅
   - Category: Daily
   - Requirement: Complete 10 daily questions
   - Color: Indigo

#### 📚 Knowledge Badges

10. **Knowledge Seeker** 📚
    - Category: Subjects
    - Requirement: Complete quizzes in 5 different subjects
    - Color: Emerald

#### 💎 Progress Badges

11. **Point Collector** 💎
    - Category: Points
    - Requirement: Earn 1,000 points
    - Color: Pink

#### 🌟 Level Badges

12. **Starter** 🚀
    - Level: 1
    - Automatically awarded on registration
    - Color: Blue

13. **Bronze Learner** 🥉
    - Level: 3
    - Color: Amber

14. **Silver Scholar** 🥈
    - Level: 5
    - Color: Gray

15. **Gold Graduate** 🥇
    - Level: 7
    - Color: Yellow

16. **Platinum Master** 💎
    - Level: 9
    - Color: Cyan

17. **Rising Star** 🌟
    - Level: 5
    - Alternative level badge
    - Color: Yellow

18. **Expert** 🏅
    - Level: 10
    - Master status
    - Color: Gold

#### 🔬 Simulation Badge

19. **Simulation Explorer** 🔬
    - Category: Simulation
    - Requirement: Complete 5 simulations
    - Color: Teal

**Badge Features:**
- View all badges in dedicated Badge Gallery (`/badges`)
- See earned badges with date/time
- Track progress toward unearned badges
- Percentage completion indicator
- Sort by: Earned first, Progress percentage
- Beautiful visual display with colors and icons

---

## 🔥 DAILY CHALLENGE SYSTEM

**URL:** `/daily-question`

### How It Works:

**1. Daily Question Generation**
- New question generated every day at midnight (automated via cron job)
- Unique questions for each grade level (5th-12th)
- AI-generated using Google Gemini API
- Covers subjects: Math, Science, English, History, Geography
- Difficulty levels: Easy, Medium, Hard (randomly selected)

**2. Answering Process**
- One question per day per user
- Multiple choice format (4 options)
- Cannot change answer after submission
- Get immediate feedback (correct/incorrect)
- See explanation after answering
- View correct answer after submission

**3. Streak Tracking**
- **Current Streak**: Consecutive days answered correctly
- **Longest Streak**: Personal best streak record
- Streak breaks if you:
  - Miss a day
  - Answer incorrectly
  - Skip the daily question
- Streak continues with consecutive correct answers

**4. Rewards**
- **Correct Answer**: 100 XP
- **Wrong Answer**: 30 XP (encourages daily participation)
- **Streak Milestones**:
  - 7 days: +100 XP bonus
  - 30 days: +500 XP bonus
  - 100 days: +2,000 XP bonus

**5. Statistics Tracking**
- Total submissions
- Correct submissions
- Overall accuracy percentage
- Current streak display
- Longest streak record
- Last submission date

**6. Badge Progress**
- Daily Challenger badge: Complete 10 daily questions
- Streak badges unlock with consistent participation

---

## 🧠 AI QUIZ GENERATOR

**URL:** `/quiz`

### Features:

**1. Personalized Quiz Generation**
- Powered by Google Gemini 2.0 Flash AI
- Generates questions based on:
  - User's grade level
  - Subject interests
  - Past performance
  - Difficulty preference

**2. Custom Quiz Options**
- Select specific subject
- Choose difficulty: Easy, Medium, Hard
- Set question count (default: 10 questions)
- Mix and match topics

**3. Available Subjects**
- Mathematics
- Physics
- Chemistry
- Biology
- Computer Science
- English
- History
- Geography
- General Knowledge

**4. Quiz Features**
- Multiple choice questions (4 options each)
- Timer (tracks completion time)
- Immediate feedback after submission
- Detailed explanations for each answer
- Performance analytics

**5. Scoring System**
- Percentage score (correct/total)
- Time tracking
- Speed bonus for fast completion
- High score tracking

**6. XP Rewards**
- Base: 30 XP per quiz completed
- Bonus: +10 XP if score ≥ 80%
- Fastest time recorded
- Highest score saved

**7. Quiz Statistics**
- Total quizzes completed
- Average score
- Highest score
- Fastest completion time
- Quiz streak counter
- Subject-wise performance
- Quiz history with dates

**8. Badge Opportunities**
- First quiz badge
- Streak badges (3, 7, 15 in a row)
- Quiz master (50 quizzes)
- Perfectionist (100% score)
- High scorer (90% average)
- Speed demon (under 5 minutes)
- Knowledge seeker (5 different subjects)

---

## 📝 MICRO QUIZ BUILDER

**URL:** `/micro-quiz`

### Create & Share Custom Quizzes

**1. Quiz Creation**
- User-generated content
- Create custom question sets
- Add multiple-choice questions
- Set difficulty levels
- Add explanations
- Organize by topic/subject

**2. Sharing Features**
- Generate shareable quiz links
- Share with community
- Track quiz usage
- See performance statistics
- Public or private options

**3. Community Quizzes**
- Browse quizzes created by others
- Filter by subject, difficulty
- Rate and review quizzes
- Popular quiz rankings
- Trending quizzes section

**4. Use Cases**
- Create study materials for friends
- Prepare for exams together
- Test knowledge on specific topics
- Share learning resources
- Group study sessions

---

## 🔬 INTERACTIVE SIMULATIONS

**URL:** `/simulations`

### Virtual Labs & Experiments

**1. Physics Simulations**
- Projectile Motion
- Newton's Laws demonstrations
- Pendulum experiments
- Wave mechanics
- Optics and light
- Electricity and circuits
- Magnetism demonstrations

**2. Chemistry Simulations**
- Molecular structures
- Chemical reactions
- Periodic table interactive
- Acid-base titrations
- Balancing equations
- Lab equipment practice

**3. Biology Simulations**
- Cell structure exploration
- Photosynthesis process
- Respiration cycles
- DNA replication
- Ecosystems
- Human body systems

**4. Features**
- Interactive 3D models (some simulations)
- Adjustable parameters
- Real-time results
- Visual feedback
- Step-by-step guides
- Educational explanations
- Save progress

**5. Rewards**
- 40 XP per simulation completed
- Simulation Explorer badge (5 completions)
- Tracks completed simulations
- Progress saved to profile

**6. Individual Simulation Pages**
- URL: `/simulation/:slug`
- Detailed simulation interface
- Instructions and objectives
- Controls and parameters
- Results analysis
- Related simulations suggested

---

## ✨ AI LEARNING ASSISTANT

**URL:** `/learn-animations`

### AI-Powered Concept Explanations

**1. Ask Anything**
- Type any topic or concept
- Ask questions in natural language
- Get instant AI-generated explanations
- Follow-up questions supported

**2. AI-Generated Animations**
- Visual concept explanations
- Step-by-step animated breakdowns
- Complex topics simplified
- Interactive visualizations

**3. Voice Features**
- Text-to-speech for explanations
- Listen while studying
- Adjustable speed
- Multiple voice options
- Pause/resume functionality

**4. Supported Topics**
- All school subjects
- Advanced concepts
- Real-world applications
- Problem-solving strategies
- Exam preparation
- Conceptual clarifications

**5. Learning Modes**
- Visual learner mode (animations)
- Audio learner mode (voice)
- Read mode (text explanations)
- Interactive mode (Q&A)

**6. Save & Bookmark**
- Save useful explanations
- Bookmark animations
- Create personal knowledge library
- Review saved content anytime

---

## 🧩 INTERACTIVE LEARNING TOOLS

**URL:** `/interactive-learning`

### Comprehensive Study Toolkit

#### 1. **Digital Flashcards**

**Features:**
- Create custom flashcard decks
- Front: Question/Concept
- Back: Answer/Explanation
- Flip animation
- Subject categorization
- Difficulty tagging

**Study Modes:**
- Sequential review
- Random shuffle
- Spaced repetition algorithm
- Show/hide answers
- Auto-advance option
- Sound effects (optional)

**Progress Tracking:**
- Cards reviewed counter
- Accuracy percentage
- Last reviewed date
- Success rate per card
- Study session statistics

**Sample Subjects Available:**
- Physics (Newton's Laws, formulas)
- Chemistry (formulas, elements)
- Mathematics (equations, theorems)
- Biology (processes, definitions)
- Custom user-created decks

#### 2. **Pomodoro Study Timer**

**What is Pomodoro?**
- Proven time management technique
- 25-minute focused study sessions
- 5-minute short breaks
- 15-minute long breaks after 4 cycles

**Timer Features:**
- Work mode: 25 minutes
- Short break: 5 minutes
- Long break: 15 minutes
- Visual countdown display
- Progress indicator
- Cycle counter
- Sound notifications (optional)

**Controls:**
- Start/Pause button
- Reset timer
- Skip to next phase
- Mode switching
- Custom duration settings

**Statistics:**
- Total study time today
- Completed pomodoro cycles
- Total sessions this week
- Average focus time
- Productivity trends

**Benefits:**
- Improved focus
- Reduced burnout
- Better time management
- Structured study sessions
- Regular break reminders

#### 3. **Mind Mapping Tool**

**Create Visual Knowledge Maps:**
- Drag-and-drop interface
- Create nodes (concepts)
- Connect related ideas
- Color-coded categories
- Hierarchical structure

**Node Features:**
- Add text labels
- Choose colors (8 color options)
- Edit content inline
- Delete nodes
- Duplicate nodes

**Connection Features:**
- Draw connections between nodes
- Link related concepts
- Create knowledge networks
- Show relationships
- Visual learning paths

**Tools:**
- Zoom in/out
- Pan canvas
- Center view
- Save maps
- Export maps
- Share with community

**Use Cases:**
- Brainstorming sessions
- Concept mapping
- Study organization
- Exam preparation
- Project planning
- Visual note-taking

**Colors Available:**
- Purple (#8B5CF6)
- Pink (#EC4899)
- Green (#10B981)
- Orange (#F59E0B)
- Red (#EF4444)
- Blue (#3B82F6)
- Orange-Red (#F97316)
- Cyan (#06B6D4)

#### 4. **Study Statistics Dashboard**

**Track Your Progress:**
- Total study time accumulated
- Cards reviewed today/week
- Accuracy rate
- Current study streak
- Pomodoro cycles completed
- Mind maps created
- Learning patterns analysis

---

## 📝 NOTES SYSTEM

**URL:** `/notes`

### Powerful Note-Taking Platform

#### 1. **Rich Text Editor**

**Powered by EditorJS** - Professional block-style editor

**Available Blocks:**
- **Paragraph**: Standard text with formatting
- **Header**: H1, H2, H3, H4, H5, H6 levels
- **List**: Ordered and unordered lists
- **Checklist**: To-do items with checkboxes
- **Quote**: Block quotes for emphasis
- **Code**: Syntax-highlighted code snippets
- **Delimiter**: Section separators
- **Table**: Create data tables
- **Link**: Embed external links
- **Image**: Upload and embed images
- **Embed**: YouTube videos, tweets, etc.
- **Raw HTML**: Custom HTML content
- **Marker**: Highlight important text
- **Inline Code**: Inline code formatting

#### 2. **Note Management**

**Features:**
- Create unlimited notes
- Edit anytime
- Delete notes
- Organize by categories
- Tag system
- Search functionality
- Date-based sorting
- Title and slug generation

**Note View:**
- URL: `/note/:slug`
- Clean reading interface
- Full note display
- Edit button (quick access)
- Back to notes button
- Responsive design

#### 3. **Organization**

**Categories:**
- Subject-based folders
- Project notes
- Exam preparation
- Personal notes
- Research notes
- Quick notes

**Search & Filter:**
- Search by title
- Search by content
- Filter by date
- Filter by category
- Sort by: Recent, Oldest, Title

#### 4. **Sharing Options**

- Make notes public
- Share with specific users
- Generate share links
- Community contribution
- Collaborative editing (future feature)

#### 5. **XP Rewards**

- Earn 15 XP per note created
- Daily limit: 3 notes (max 45 XP/day)
- Encourages daily documentation
- Rewards consistent note-taking

#### 6. **Auto-Save**

- Automatic draft saving
- No data loss
- Recovery options
- Version history (future feature)

---

## 👥 COMMUNITY & SOCIAL FEATURES

**URL:** `/community`

### Connect, Collaborate, and Learn Together

#### 1. **Study Rooms**

**Types of Rooms:**
- Public study rooms (anyone can join)
- Private rooms (invite-only)
- Subject-specific rooms
- Grade-level rooms
- Project collaboration rooms

**Room Features:**
- Real-time chat
- File sharing
- Whiteboard collaboration
- Video calls (future feature)
- Screen sharing
- Member list
- Room moderators

**Creating a Room:**
- Set room name
- Add description
- Choose public/private
- Select subject/topic
- Set maximum members
- Add room rules

**Room Activities:**
- Group discussions
- Homework help
- Exam preparation
- Project collaboration
- Peer teaching
- Study sessions
- Q&A sessions

#### 2. **Study Sessions**

**Scheduled Learning Events:**
- Create scheduled study sessions
- Set date and time
- Add session description
- Invite specific users
- Set session duration
- Topic/subject focus

**Session Features:**
- Calendar integration
- Reminder notifications
- Session summary
- Attendance tracking
- Recurring sessions
- Session materials sharing

**Session Types:**
- Live study sessions
- Recorded sessions
- Group study
- One-on-one tutoring
- Exam prep sessions
- Topic reviews

#### 3. **Chat System**

**Real-Time Messaging:**
- Instant message delivery
- Socket.io powered
- Message history
- Unread indicators
- Typing indicators (future)
- Message reactions (future)

**Chat Features:**
- Text messages
- File attachments
- Code sharing
- Link previews
- Message search
- Private messages
- Group messages

**Message Types:**
- Study questions
- Answers and solutions
- Resource sharing
- Motivation and support
- General discussion
- Announcements

#### 4. **Leaderboard**

**URL:** `/leaderboard`

**Weekly Competition:**
- Resets every Sunday
- Top 10 users displayed
- Ranked by XP earned this week
- Real-time updates
- Profile visibility

**Leaderboard Display:**
- Rank position (1-10)
- User name
- Avatar image
- Total XP this week
- Current level
- Badge count
- Current streak

**Rewards:**
- 1st Place: 200 XP bonus
- 2nd Place: 150 XP bonus
- 3rd Place: 100 XP bonus
- Recognition badge
- Community status boost

**Features:**
- Your current position highlighted
- See your weekly progress
- Motivation to study more
- Fair competition (weekly reset)
- Encourages consistent learning

#### 5. **Multiplayer Quiz Rooms**

**Compete in Real-Time:**
- Create quiz rooms
- Join existing rooms
- Real-time multiplayer quizzes
- Live scoreboards
- Timed questions
- Multiple participants

**Room Creation:**
- Set quiz topic
- Choose difficulty
- Set number of questions
- Set time limit per question
- Public or private rooms
- Room codes for sharing

**During Quiz:**
- Real-time question display
- Answer submission
- Live scoring
- Player rankings
- Time pressure
- Correct answer reveals

**After Quiz:**
- Final rankings
- Performance analysis
- XP distribution
- Badges earned
- Share results

#### 6. **Profile System**

**URL:** `/profile`

**Public Profile:**
- Profile picture/avatar
- User bio
- Current level badge
- Total XP
- Current streak
- Earned badges display
- Recent activities
- Statistics overview

**Privacy Settings:**
- Profile visibility
- Activity visibility
- Contact preferences
- Notification settings

**Activity Feed:**
- Recent badges earned
- Level ups
- Quiz completions
- Study sessions joined
- Notes created
- Community contributions

---

## 📚 RESOURCES LIBRARY

**URL:** `/resources`

### Curated Study Materials

#### 1. **Resource Categories**

**Academic Subjects:**
- Mathematics resources
- Science guides
- Language arts materials
- Social studies content
- Computer science tutorials
- Arts and creativity

**Resource Types:**
- Study guides (PDF, docs)
- Video tutorials
- Practice worksheets
- Reference materials
- Cheat sheets
- Exam papers
- Sample projects
- Research papers

#### 2. **Features**

**Browse Resources:**
- Subject filters
- Grade level filters
- Difficulty filters
- Resource type filters
- Search functionality
- Popular resources
- Recently added

**Resource Details:**
- Title and description
- Author/source
- Publication date
- Subject and grade
- Difficulty level
- File type/format
- Download or view
- Related resources

#### 3. **User Actions**

- Download resources
- Bookmark favorites
- Rate resources
- Review/comment
- Share with community
- Report issues
- Request resources

#### 4. **Upload Resources**

**For Researchers & Advanced Users:**
- Upload own materials
- Contribute to library
- Share knowledge
- Build reputation
- Help community
- Recognition and credits

---

## 🏆 BADGES & ACHIEVEMENTS

**URL:** `/badges`

### Track Your Progress

#### **Badge Gallery View**

**Display Features:**
- Grid layout (responsive)
- Color-coded badges
- Large icons/emojis
- Badge names and descriptions
- Progress bars (for unearned badges)
- Earned badges highlighted
- Sort options

**Badge Information:**
- Badge name
- Description of requirement
- Category (quiz, streak, level, etc.)
- Color theme
- Icon/emoji
- Requirement number
- Current progress
- Progress percentage
- Date earned (if earned)

#### **Progress Tracking**

**For Unearned Badges:**
- Current count vs. requirement
- Visual progress bar
- Percentage completion
- Motivational text
- Next milestone info

**For Earned Badges:**
- Earned timestamp
- Celebration checkmark
- Full opacity display
- Special highlighting

#### **Badge Analytics**

**Statistics:**
- Total badges earned
- Total badges available
- Completion percentage
- Category breakdown
- Recent badges
- Rarest badges
- Most common badges

---

## 📊 ANALYTICS & STATISTICS

### Track Your Learning Journey

#### **Personal Analytics**

**Available Throughout Platform:**
- Total XP earned
- Current level
- Level progress percentage
- XP to next level
- Current streak
- Longest streak
- Total study time
- Active days

#### **Performance Metrics**

**Quiz Statistics:**
- Total quizzes taken
- Average score
- Highest score
- Quiz streak
- Fastest completion
- Subject-wise performance
- Accuracy by difficulty
- Time trends

**Daily Challenge Stats:**
- Total submissions
- Correct answers
- Accuracy rate
- Streak history
- Best streak
- Participation rate

**Simulation Stats:**
- Simulations completed
- Favorite simulations
- Time spent
- Topics explored

**Community Stats:**
- Messages sent
- Rooms joined
- Sessions attended
- Helpful votes received
- Community rank

#### **Learning Insights**

**Patterns & Trends:**
- Best study times
- Most productive days
- Preferred subjects
- Learning style indicators
- Improvement trends
- Goal achievement rate

---

## 🔧 TECHNICAL DETAILS

### Platform Architecture

**Frontend:**
- React 19.1.1
- React Router DOM (navigation)
- Vite (build tool)
- TailwindCSS (styling)
- Socket.io-client (real-time)
- Axios (API calls)
- EditorJS (note editor)
- Recharts (analytics visualization)
- React Hot Toast (notifications)
- Lucide React (icons)

**Backend:**
- Node.js with Express 5.1.0
- MongoDB with Mongoose (database)
- Socket.io (WebSockets)
- JWT authentication
- bcrypt (password hashing)
- Google Gemini AI integration
- Supabase (additional storage)
- Multer (file uploads)
- node-cron (scheduled tasks)

**Security:**
- JWT token authentication
- Secure password hashing (bcrypt)
- Protected routes
- CORS enabled
- Input validation
- XSS protection
- Rate limiting

---

## 📱 MOBILE RESPONSIVENESS

**Platform is fully responsive:**
- Mobile-first design
- Tablet optimization
- Desktop enhancement
- Touch-friendly interfaces
- Adaptive layouts
- Responsive navigation
- Mobile-optimized forms

**Mobile Features:**
- Hamburger menu
- Touch gestures
- Swipe actions
- Mobile keyboard support
- Responsive cards
- Optimized images
- Fast loading times

---

## 🎨 DESIGN & UX

### Visual Design

**Theme:**
- Dark mode primary (black/purple gradient)
- Glassmorphism effects (backdrop blur)
- Neon/gradient accents
- Animated backgrounds
- Particle effects
- Smooth transitions

**Color Palette:**
- Primary: Purple (#8B5CF6)
- Secondary: Pink (#EC4899)
- Accent: Yellow/Gold
- Success: Green (#10B981)
- Warning: Orange (#F59E0B)
- Error: Red (#EF4444)
- Background: Black/Dark gradient

**Components:**
- Glassmorphic cards
- Gradient buttons
- Animated hover effects
- Icon-rich interface
- Progress bars
- Badges and tags
- Modal dialogs
- Toast notifications

**Animation Effects:**
- Auto-typing text (AutoText component)
- Fade-in animations
- Scale on hover
- Pulse effects
- Slide transitions
- Particle systems
- Loading spinners

---

## 🆘 COMMON USER QUESTIONS & ANSWERS

### Account & Access

**Q: How do I reset my password?**
A: Currently, contact support for password reset. Feature coming soon on login page.

**Q: Can I change my role from Student to Researcher?**
A: Contact support to change your role. This affects your content access and features.

**Q: What if I forgot my email?**
A: Contact support with your name and any associated information.

**Q: Can I delete my account?**
A: Yes, go to Profile > Settings > Delete Account (or contact support).

**Q: Is my data secure?**
A: Yes! We use industry-standard JWT authentication, encrypted passwords (bcrypt), and secure HTTPS connections.

### XP & Leveling

**Q: How do I earn XP?**
A: Complete daily challenges (100 XP), take quizzes (30+ XP), complete simulations (40 XP), write notes (15 XP), participate in community (2-5 XP).

**Q: What happens when I level up?**
A: You unlock new features, earn badges, get achievements, and gain access to advanced content.

**Q: Can I lose XP?**
A: No! XP is never deducted. You only gain XP.

**Q: How long does it take to reach Level 10?**
A: With consistent daily activity (100+ XP/day), approximately 2-3 months. Top users can reach it faster.

**Q: What's the fastest way to earn XP?**
A: Daily challenges (100 XP) + maintaining streaks (bonus XP) + quizzes (30-40 XP each).

### Streaks

**Q: What happens if I miss a day?**
A: Your streak resets to 0, but you can start a new streak the next day.

**Q: Do wrong answers break my streak?**
A: For daily challenges, yes. However, you still earn 30 XP for attempting.

**Q: Can I do yesterday's challenge today?**
A: No, you must answer the daily challenge on the day it's posted.

**Q: What timezone is used for daily reset?**
A: The platform uses UTC timezone for daily resets (midnight UTC).

**Q: What's the longest streak possible?**
A: Unlimited! Your longest streak is tracked and displayed on your profile.

### Quizzes

**Q: How are quizzes generated?**
A: Using Google's Gemini AI, customized to your grade level, interests, and performance history.

**Q: Can I retake a quiz?**
A: Yes! Generate a new quiz anytime. Each quiz is unique.

**Q: Why am I getting hard questions?**
A: The AI adapts difficulty based on your performance. Doing well = harder questions = more growth!

**Q: Can I create my own quiz?**
A: Yes! Use the Micro Quiz Builder at `/micro-quiz` to create and share custom quizzes.

**Q: How many questions are in a quiz?**
A: Default is 10 questions, but you can customize this in the quiz settings.

**Q: Is there a time limit?**
A: No forced time limit, but we track your completion time for the "Speed Demon" badge.

### Community

**Q: How do I create a study room?**
A: Go to Community > Click "Create Room" > Fill in details > Set public/private > Create!

**Q: Can I kick someone from my room?**
A: Yes, as room creator/moderator, you have moderation controls.

**Q: How do voice calls work?**
A: Voice call features are coming soon! Currently, use chat and screen sharing.

**Q: Can I report inappropriate behavior?**
A: Yes, use the report button on messages or profiles to flag issues for moderators.

**Q: How do I find study partners?**
A: Browse active rooms, join subject-specific rooms, or create a session and invite users.

### Badges

**Q: How do I see all badges?**
A: Visit `/badges` to see all available badges and your progress.

**Q: Can badges be removed once earned?**
A: No, badges are permanent achievements!

**Q: What's the rarest badge?**
A: "Platinum Master" (Level 9) and "Expert" (Level 10) are the rarest, requiring 4,001+ XP.

**Q: Do badges give XP?**
A: Badges themselves don't give XP, but many badge activities reward XP.

**Q: How many badges are there?**
A: Currently 19 badges across 7 categories, with more added regularly!

### Notes

**Q: Can I export my notes?**
A: Export feature coming soon! Currently, notes are stored securely in your account.

**Q: Can others see my notes?**
A: Only if you explicitly share them. Notes are private by default.

**Q: What's the note limit?**
A: No limit! Create as many notes as you need.

**Q: Can I add images to notes?**
A: Yes! The EditorJS supports image uploads and embeds.

**Q: Does auto-save work?**
A: Yes, notes auto-save as you type to prevent data loss.

### Simulations

**Q: Do I need special software for simulations?**
A: No! All simulations run in your web browser.

**Q: Are simulations mobile-friendly?**
A: Most are, but some complex simulations work best on tablets or computers.

**Q: Can I suggest new simulations?**
A: Yes! Contact support or use the feedback form with simulation suggestions.

**Q: Are simulation results saved?**
A: Yes, completion status is saved. Full result saving coming soon.

### Technical Issues

**Q: The site is loading slowly**
A: Check your internet connection. Clear browser cache. Try a different browser.

**Q: My XP isn't updating**
A: Refresh the page. XP updates in real-time, but sometimes requires a refresh.

**Q: I can't log in**
A: Check email and password. Clear cookies. Try "Remember Me" option. Contact support if issue persists.

**Q: Features aren't working**
A: Try: Refresh page > Clear cache > Different browser > Check internet > Contact support.

**Q: Can I use HackWave offline?**
A: No, HackWave requires internet connection for AI features and real-time updates.

**Q: Which browsers are supported?**
A: Chrome, Firefox, Safari, Edge (latest versions). Mobile: Safari (iOS), Chrome (Android).

---

## 🚀 FUTURE FEATURES (Coming Soon)

**Planned Updates:**
- Video call integration in study rooms
- Live screen sharing
- Collaborative note editing
- Mobile apps (iOS & Android)
- Advanced analytics dashboard
- AI tutor chat (24/7)
- Parent dashboard
- Teacher accounts
- Course creation tools
- Certificate generation
- Integration with school LMS
- Offline mode (limited)
- Dark/Light theme toggle
- More languages support
- Achievement animations
- Social media integration
- Friend system
- Private messaging
- Custom avatars
- Profile themes
- Merchandise for top learners

---

## 📞 SUPPORT & CONTACT

**Need Help?**
- In-app support chat (coming soon)
- Email support (check website for email)
- Community help (ask in study rooms)
- FAQ section (this document)
- User guides
- Video tutorials (coming soon)

**Report Issues:**
- Bug reports welcome
- Feature requests appreciated
- Feedback always valued
- Contact via GitHub or support email

**Connect With Us:**
- GitHub: akshayachigullapally/HackWave
- Community forums
- Social media (check website)

---

## 🎓 BEST PRACTICES FOR USERS

### Maximize Your Learning

**Daily Routine:**
1. Start with Daily Challenge (100 XP)
2. Review flashcards (active recall)
3. Take 1-2 quizzes (practice)
4. Use Pomodoro timer (25 min focus)
5. Join community study session
6. Make notes of learning
7. Complete 1 simulation

**Weekly Goals:**
- Maintain 7-day streak
- Complete 10+ quizzes
- Write 10+ notes
- Try all subjects
- Participate in community
- Aim for leaderboard top 10
- Earn 2-3 new badges

**Study Tips:**
- Use Pomodoro technique (focus + breaks)
- Create flashcards for key concepts
- Teach others in community (best learning)
- Mix subjects for variety
- Review notes regularly
- Set daily XP goals
- Track your progress
- Celebrate achievements
- Stay consistent
- Ask for help when stuck

---

## 📈 SUCCESS METRICS

**Platform Tracks:**
- User engagement (daily active users)
- XP earned (total and weekly)
- Quiz completion rates
- Streak maintenance
- Community participation
- Content creation (notes, quizzes)
- Badge earn rates
- Level progression
- Study time
- User satisfaction

**Your Personal Metrics:**
- XP growth rate
- Streak length
- Badge collection
- Level progress
- Quiz accuracy
- Study consistency
- Community contributions
- Learning goals achieved

---

## 🌟 PLATFORM PHILOSOPHY

**Core Values:**
1. **Learning First**: Every feature designed to enhance education
2. **Gamification for Good**: Make learning fun, not addictive
3. **Community Support**: Learn together, grow together
4. **AI Enhancement**: Use AI to personalize and improve learning
5. **Accessibility**: Available to all students regardless of background
6. **Privacy & Safety**: Protect user data and create safe environment
7. **Continuous Improvement**: Regular updates based on feedback
8. **Recognition & Reward**: Celebrate every achievement
9. **Healthy Competition**: Motivate without pressure
10. **Lifelong Learning**: Build habits that last beyond school

---

## 🎯 ONBOARDING CHECKLIST

**New User First Steps:**
- [ ] Create account (choose Student or Researcher)
- [ ] Complete profile (name, bio, interests, avatar)
- [ ] Take platform tour (explore dashboard)
- [ ] Complete first daily challenge (earn first 100 XP)
- [ ] Take first quiz (earn "First Steps" badge)
- [ ] Create first note (earn 15 XP)
- [ ] Join a study room (meet community)
- [ ] Try a simulation (earn 40 XP)
- [ ] Use AI Learning Assistant (explore features)
- [ ] Set learning goals (profile settings)
- [ ] Check badge progress (motivation)
- [ ] View leaderboard (see rankings)
- [ ] Explore all dashboard features
- [ ] Save resources for later
- [ ] Customize notification settings
- [ ] Start first Pomodoro session
- [ ] Create flashcard deck
- [ ] Build first mind map
- [ ] Share something with community
- [ ] Celebrate reaching Level 2!

---

## 🔍 KEYWORD INDEX (For Quick Reference)

**Features:** Quiz, Daily Challenge, Simulations, Community, Badges, XP, Levels, Notes, Flashcards, Pomodoro, Mind Maps, AI Assistant, Study Rooms, Leaderboard, Profile

**Actions:** Login, Register, Create, Join, Complete, Earn, Share, Track, Study, Learn, Compete, Collaborate

**Metrics:** XP, Level, Streak, Score, Time, Badges, Rank, Progress

**Content:** Math, Science, English, History, Geography, Physics, Chemistry, Biology, Computer Science

**Tools:** Editor, Timer, Chat, Whiteboard, Search, Filter, Sort

---

## 📊 QUICK STATS SUMMARY

**Platform Capabilities:**
- ∞ Unlimited quizzes (AI-generated)
- 19 Badges to earn
- 10 Levels to unlock
- 8 Major feature categories
- 50+ Interactive simulations
- Real-time community chat
- Unlimited notes
- 100s of resources
- Daily fresh content
- 24/7 availability

**Average User Journey:**
- Day 1: Level 1, 0-150 XP
- Week 1: Level 2-3, 300-700 XP
- Month 1: Level 4-6, 1,500-2,500 XP
- Month 3: Level 7-9, 3,000-5,000 XP
- Month 6+: Level 10, 5,500+ XP (Master status)

---

## 🎉 CELEBRATION MOMENTS

**Platform celebrates user success:**
- Level up animations
- Badge unlock notifications
- Streak milestone messages
- Leaderboard achievements
- Perfect score celebrations
- Personal best records
- Community shoutouts
- Achievement sound effects (optional)
- Confetti animations
- Progress milestones
- Goal completions
- Special event participation

---

## 🤝 COMMUNITY GUIDELINES

**Be Respectful:**
- Treat all users with respect
- No bullying or harassment
- Help others learn
- Share knowledge generously
- Give constructive feedback
- Report inappropriate content

**Quality Content:**
- Share accurate information
- Verify facts before sharing
- Credit sources
- Create helpful resources
- Contribute positively

**Engagement Rules:**
- Stay on topic in rooms
- Use appropriate language
- No spam or advertising
- Respect moderators
- Follow room-specific rules

---

## 🌐 ACCESSIBILITY FEATURES

**Inclusive Design:**
- Keyboard navigation support
- Screen reader compatible
- High contrast mode
- Adjustable text sizes
- Color-blind friendly
- Mobile accessibility
- Touch-friendly controls
- Alternative text for images
- Clear focus indicators
- Semantic HTML structure

---

## 💡 TIPS FOR AGENT RESPONSES

**When Answering Users:**
1. **Be Clear**: Use simple, direct language
2. **Be Specific**: Reference exact URLs and feature names
3. **Be Encouraging**: Motivate users to explore features
4. **Be Patient**: Some users are new to the platform
5. **Be Accurate**: Use this document as source of truth
6. **Provide Steps**: Break down complex processes
7. **Offer Alternatives**: Suggest multiple solutions
8. **Celebrate Progress**: Acknowledge user achievements
9. **Guide Navigation**: Tell users exactly where to go
10. **Follow Up**: Ask if they need more help

**Common Response Templates:**

*For onboarding:*
"Welcome to HackWave! To get started, visit `/register` and create your account. Choose Student or Researcher role, and complete your profile. Then, head to `/dashboard` where you can explore all features!"

*For XP questions:*
"You can earn XP by: Completing daily challenges (100 XP), taking quizzes (30-40 XP), completing simulations (40 XP), writing notes (15 XP), and participating in community (2-5 XP). Check `/dashboard` to see all options!"

*For feature help:*
"That feature is located at [URL]. Here's how to use it: [step-by-step]. Would you like more details about any specific step?"

*For troubleshooting:*
"Try these steps: 1) Refresh the page, 2) Clear browser cache, 3) Try a different browser. If the issue persists, please describe what you see and I'll help further."

---

## 📚 GLOSSARY OF TERMS

**XP (Experience Points)**: Points earned through learning activities that contribute to leveling up

**Streak**: Consecutive days of completing daily challenges correctly

**Badge**: Achievement award for reaching specific milestones

**Level**: User progression tier (1-10), unlocked by earning XP

**Simulation**: Interactive virtual experiment or demonstration

**Flashcard**: Study tool with question on front, answer on back

**Pomodoro**: 25-minute focused study session with breaks

**Mind Map**: Visual diagram connecting related concepts

**Study Room**: Virtual space for group learning and chat

**Study Session**: Scheduled learning event with other users

**Leaderboard**: Weekly ranking of top XP earners

**Daily Challenge**: One question per day to maintain streak

**Micro Quiz**: User-created custom quiz to share

**AI Assistant**: AI-powered tool for concept explanations

**Gamification**: Using game elements to make learning engaging

**Socket**: Real-time connection for instant updates

**JWT**: Secure authentication token

**Slug**: URL-friendly identifier for pages

**Glassmorphism**: Translucent UI design style

---

## 🎬 CONCLUSION

HackWave is a comprehensive learning platform that combines:
- 🎮 **Gamification** (XP, levels, badges)
- 🤖 **AI Technology** (personalized quizzes, explanations)
- 👥 **Social Learning** (community, study rooms)
- 🔬 **Interactive Tools** (simulations, animations)
- 📝 **Productivity** (notes, flashcards, timers)
- 📊 **Progress Tracking** (analytics, achievements)

**Our Goal**: Transform education by making learning engaging, personalized, and rewarding for every student.

**Start Your Journey**: Register today and begin earning XP, unlocking badges, and reaching new levels of knowledge!

---

*Document Version: 1.0*
*Last Updated: November 1, 2025*
*Platform: HackWave Learning Platform*
*For: JotForm Agent Training*

---

## 📋 DOCUMENT USAGE NOTES

**For Agent Training:**
This document contains comprehensive information about every feature, page, and interaction on the HackWave platform. Use this as your knowledge base to:
- Answer user questions accurately
- Guide users through onboarding
- Explain features in detail
- Troubleshoot issues
- Provide navigation help
- Clarify doubts
- Motivate and encourage users

**Update Protocol:**
When platform features change:
- Update relevant sections
- Add new features to appropriate categories
- Update XP values if changed
- Add new badges to badge section
- Update URLs if routes change
- Revise version number and date

**Agent Best Practices:**
- Prioritize user understanding
- Be conversational yet professional
- Reference specific URLs and paths
- Break down complex features
- Encourage exploration
- Celebrate user achievements
- Provide actionable next steps

---

**END OF TRAINING DOCUMENT**

*Ready to help users succeed on HackWave! 🚀*
