# ♠ BORDERLAND ♥

A comprehensive survival game management system built with React, TypeScript, and Supabase. Borderland provides a complete platform for managing players, arenas, game templates, and match outcomes in a competitive survival game environment.

## 🎮 Overview

Borderland is a sophisticated game management platform designed for competitive survival games. It features real-time player tracking, arena management, game template systems, and comprehensive match recording capabilities.

### Key Features

- **Player Management**: Track player status, game history, and elimination timers
- **Arena System**: Manage multiple game locations with real-time status monitoring
- **Game Templates**: Create and manage different game types (Solo, Versus, Group)
- **Match Recording**: Record and manage game outcomes with video footage
- **Real-time Updates**: Live countdown timers and automatic forfeit detection
- **User Authentication**: Secure login system with admin and player roles
- **Media Management**: Organize explainer clips and match footage

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Yarn package manager
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/beacon-borderland.git
   cd beacon-borderland
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your Supabase credentials in `.env.local`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Database Setup**
   - Import the database schema from `supabase-complete-schema.sql`
   - Set up Supabase Edge Functions for email notifications
   - Configure Row Level Security (RLS) policies

5. **Start Development Server**
   ```bash
   yarn dev
   ```

   Open [http://localhost:5173](http://localhost:5173) to view the application.

# 🌌 About Borderland

**Borderland** is a live, hyperlocal survival game tournament hosted by **The Beacon**, inspired by Netflix’s *Alice in Borderland*.  
Players compete in challenges to extend their **“Visa”** — their right to exist in Borderland, a realm between life and death.  

Throughout each day of Borderland, different **Arenas** activate, each offering one of three distinct types of games.  
Players must choose their battles wisely to survive and advance.

---

## 🎮 Types of Games

### 🕹️ Solo Games  
Players take on individual missions or face off against a “Borderland Citizen” in one-on-one survival challenges.  
**Win to stay alive — lose and face elimination.**

### ⚔️ Versus Games  
A competitive arena where players go head-to-head.  
**Some survive. Others risk elimination.**

### 🤝 Group Games  
Team-based trials where cooperation is key.  
**Either everyone survives, or everyone is eliminated.**

---

## ⏳ Player Visas

Every player holds a **Visa**, a timer that determines how long they can remain in Borderland.  
To renew it, players must complete at least **one game every three days**.  
Failure to do so results in **automatic forfeiture** from the tournament.

📧 Players connected via email will receive a warning **one day before their Visa expires**.  
Visa countdowns are also visible under each player’s username on the **Players Page**.

---

## 🏁 Final Tournament

As Borderland nears its end, a **final arena** will activate for the ultimate showdown.  
The remaining contenders will enter a **last-player-standing Versus Game**, where only one will emerge as the champion. 🏆  

Past victories count — each win grants **favor points**, giving players a strategic advantage in the final battle.

---

## 🧭 The Borderland Dashboard

### 📊 Overview Page
Get a snapshot of Borderland in real time — total players, active arenas, and ongoing games.  
See who’s dominating the leaderboard and which arenas are open for competition.  
For players seeking their next challenge, this is the best place to start.

<img width="1278" height="759" alt="Overview" src="https://github.com/user-attachments/assets/c25dd497-47d4-4137-8e41-190a0bd9001f" />

---

### 🧍 Players Page
Browse all registered players, view their **status** (Active, Forfeit, or Eliminated), **win count**, and **Visa countdowns**.  

**🛠️ Admins can:**
- Manage account details directly from this page  
- Reinstate eliminated players

<img width="1278" height="759" alt="Players" src="https://github.com/user-attachments/assets/c26d9bdb-936a-4a06-afe5-0e0025738c21" />

---


### 🏟️ Arenas
The **Arenas Page** lists all active and inactive arenas, along with the games currently running in each location.  

**🛠️ Admins can:**
- Activate or deactivate arenas  
- Create new arenas  
- Assign or change the games hosted at arenas  
- Start games and add participants  
- Declare winners for completed matches  

<img width="1278" height="759" alt="Arenas" src="https://github.com/user-attachments/assets/94d9632b-b4a4-4ef2-8378-c844d2b3cf90" />

---

### 🎲 Game Templates
View a collection of **Game Templates**, each featuring a photo, game description, and classification (Solo, Versus, or Group).  
Explainer videos may also be available for reference.  

**🛠️ Admins can:**
- Create new templates or edit existing ones  

<img width="1278" height="759" alt="Game Templates" src="https://github.com/user-attachments/assets/86826c96-a828-4fdc-a361-b46ae33242e1" />

---

### 🎯 Arena Games
The **Arena Games Page** displays every game hosted across Borderland’s arenas.  

Each entry shows:
- 🏟️ The hosting **Arena**  
- 🧩 The **Game Template** used  
- 🎮 **Participating Players**  
- ⏱️ **Game Status** (Active, Completed, or Cancelled)  

Detailed views include start and end times, results, player stats, and match footage, if available. 🎥

<img width="1278" height="759" alt="Arena Games" src="https://github.com/user-attachments/assets/259688e5-6977-4520-b69a-daf5cb3859af" />

---

### 🎬 Clips & Media
An archive of all Borderland media — from explainer videos to match highlights.  
This central hub lets players **relive past games** or **learn from others**.  
🛠️ Admins can edit clips if needed.

<img width="1278" height="759" alt="Clips and Media" src="https://github.com/user-attachments/assets/27927f82-a656-4a98-b8b1-c6fe0f652ee6" />

---

### 💬 Chat
A **live chatroom** where players can connect, strategize, and share their experiences in real time.  

<img width="1278" height="759" alt="Chat" src="https://github.com/user-attachments/assets/1204f86e-5d26-457c-96c1-b1344bd357a4" />

---

### 🔐 Sign Up & Login
Anyone can **Sign Up** and **Log In** using their email, but by default, player profiles can only be created by **admins**.  

**🛠️ Admins have access to the User Connections page**, where they can link:
- 🧑‍💻 A **User Account** (created through email signup)  
- 🎭 To a **Player Profile** (created on the Players Page)  

This system ensures that every player in Borderland is **verified and approved by admins** — the official gatekeepers of the game. 🚪

<img width="1278" height="759" alt="User Connections" src="https://github.com/user-attachments/assets/91035b81-763b-4b9f-b048-6382ef0e520e" />

---

## 🔧 Configuration

### Database Schema
The application uses a comprehensive PostgreSQL schema with the following main tables:
- `players` - Player profiles and status
- `arenas` - Game location management
- `game_templates` - Reusable game configurations
- `arena_games` - Individual game sessions
- `arena_game_players` - Player participation records
- `users` - Authentication and user management

### Environment Variables
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Email Configuration
VITE_EMAIL_FROM=noreply@yourdomain.com
```

### Supabase Edge Functions
The application includes several Edge Functions:
- `send-email` - Email notification system
- `check-user-exists` - User validation
- `forfeit-warnings` - Automatic forfeit notifications

## 🎯 Game Mechanics

### Player Status System
- **Active**: Players currently in the game
- **Eliminated**: Players removed from competition
- **Forfeit**: Players who failed to play within 3 days

### Game Types
- **Solo**: Individual player challenges
- **Versus**: Head-to-head competitions
- **Group**: Team-based gameplay

### Arena Management
- Multiple physical locations
- Real-time status monitoring
- Template assignment per arena
- Live game session tracking

## 🔐 Security Features

- **Row Level Security (RLS)** on all database tables
- **JWT-based authentication** via Supabase
- **Role-based access control** (Admin vs Player)
- **Secure API endpoints** with proper validation
- **Password reset** via magic links

## 📊 Monitoring & Analytics

- Real-time player statistics
- Game outcome tracking
- Arena utilization metrics
- Player performance analytics
- Match duration and frequency data

## 🚀 Deployment

### Vercel Deployment
The application is configured for Vercel deployment:

1. **Connect to Vercel**
   ```bash
   vercel --prod
   ```

2. **Configure Environment Variables**
   Set all required environment variables in Vercel dashboard

3. **Database Setup**
   Ensure Supabase project is properly configured with RLS policies

### Build Commands
```bash
# Development
yarn dev

# Production Build
yarn build

# Preview Build
yarn preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `docs/` folder

## 🎨 Design System

The application uses a consistent design system with:
- **Color Palette**: Dark theme with neon accents (#00d9ff, #ff00ff, #e63946)
- **Typography**: Clean, readable fonts with proper hierarchy
- **Components**: Reusable UI components built with Radix UI
- **Icons**: Consistent iconography with Lucide React
- **Animations**: Smooth transitions and loading states

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added video management and media gallery
- **v1.2.0** - Enhanced admin tools and user management
- **v1.3.0** - Real-time updates and automatic forfeit detection

---

**Built with ❤️ for the competitive gaming community**

![Footer](docs/images/footer-banner.png)
