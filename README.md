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

## 📱 Application Pages

### 🏠 Overview Dashboard

<img width="1244" height="668" alt="The Beacon Overview" src="https://github.com/user-attachments/assets/581b8e51-feaa-4d68-aac6-6c98a9a3b4a2" />

- Real-time statistics and player counts
- Top performing players leaderboard
- Active arenas and games monitoring
- Quick navigation to all sections

### 👥 Players Management
![Players Page](docs/images/players-page.png)
- Complete player roster with status tracking
- Individual player profiles and game history
- Automatic forfeit detection (3-day inactivity rule)
- Player reinstatement capabilities
- Real-time countdown timers

### 📡 Arenas System
![Arenas Page](docs/images/arenas-page.png)
- Multi-location arena management
- Real-time arena status monitoring
- Game template assignment per arena
- Live game session management
- Participant management and outcome tracking

### 🎯 Game Templates
![Game Templates](docs/images/game-templates.png)
- Template creation and management
- Support for Solo, Versus, and Group game types
- Video explainer clips integration
- Thumbnail and description management
- Template assignment to arenas

### 🎮 Arena Games
![Arena Games](docs/images/arena-games.png)
- Live game session monitoring
- Match outcome recording
- Video footage management
- Player participation tracking
- Game history and statistics

### 🎬 Clips & Media
![Media Page](docs/images/media-page.png)
- Explainer clips gallery
- Match footage collection
- Video URL management
- Organized by game templates and matches

### 💬 Community Chat
![Chat Page](docs/images/chat-page.png)
- Real-time community chat integration
- Embedded chat widget
- Community guidelines
- Live status indicators

### 👤 User Profile
![User Profile](docs/images/user-profile.png)
- Personal account management
- Player profile connection
- Game history tracking
- Password management
- Account security settings

### 🔗 Admin Tools
![Admin Panel](docs/images/admin-panel.png)
- User-player connection management
- Administrative controls
- System monitoring
- Data management tools

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** for component primitives
- **Lucide React** for icons
- **Sonner** for notifications

### Backend Stack
- **Supabase** for database and authentication
- **PostgreSQL** database
- **Supabase Edge Functions** for serverless functions
- **Row Level Security (RLS)** for data protection

### Key Services
- **Player Management**: Track player status and game participation
- **Arena Management**: Handle multiple game locations
- **Game Templates**: Manage different game types and rules
- **Match Recording**: Record outcomes and video footage
- **User Authentication**: Secure login and role management
- **Background Services**: Automatic forfeit detection

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
