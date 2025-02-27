# VR Tournament Platform

A web-based platform for managing VR tournaments, games, and players.

## Admin Panel Refactoring

The admin panel has been refactored to use a modular architecture:

### Directory Structure

```
renderer/
├── js/
│   ├── admin.js                  # Main entry point for admin panel
│   ├── modules/
│   │   ├── admin/
│   │   │   ├── admin.js          # Core admin module
│   │   │   ├── games.js          # Games management module
│   │   │   └── ...               # Future modules (tournaments, players, etc.)
```

### Module System

The admin panel now uses a modular approach:

1. **Main Entry Point (`admin.js`)**: 
   - Loads all required modules
   - Initializes the admin panel

2. **Core Admin Module (`modules/admin/admin.js`)**:
   - Handles navigation
   - Manages dashboard
   - Provides shared utilities (modals, notifications)

3. **Games Module (`modules/admin/games.js`)**:
   - Manages game CRUD operations
   - Handles game filtering and search
   - Manages game form

### Benefits of Refactoring

- **Improved Maintainability**: Each module has a single responsibility
- **Better Organization**: Code is organized by feature
- **Easier Debugging**: Issues can be isolated to specific modules
- **Scalability**: New features can be added as separate modules

## Future Improvements

- Add modules for tournaments, players, and settings
- Implement proper authentication
- Add real API integration
- Improve error handling and validation

## Features

- Tournament management
- Player registration
- Match scheduling and results tracking
- Cross-platform support (Windows, macOS, Linux)

## Development Setup

### Prerequisites

- Node.js 14+ and npm

### Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Start the application:

```bash
npm start
```

## Building for Distribution

To build the application for your current platform:

```bash
npm run build
```

Platform-specific builds:

```bash
# For Windows
npm run build:win

# For macOS
npm run build:mac

# For Linux
npm run build:linux
```

## Project Structure

- `main.js` - Electron main process
- `renderer/` - Frontend HTML, CSS, and JavaScript
- `backend/` - Node.js backend services
  - `database.js` - Sequelize models and database setup
  - `server.js` - Express API server

## Mobile Support

This project is designed with cross-platform support in mind:

### For Desktop (Windows, macOS, Linux)
- Uses Electron for native desktop experience
- Full access to OS-level features
- Offline-first architecture with local database

### For Mobile (iOS, Android)
- Will use Capacitor for wrapping the web application
- Responsive UI that adapts to mobile form factors
- Touch-friendly interface elements
- Native device API integration

### Shared Components
- Core business logic
- Database schemas
- UI components (with responsive design)
- API integration

See the `/mobile` directory for more details on the mobile implementation strategy.

## License

MIT
