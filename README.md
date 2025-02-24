# VR Tournament Desktop Application

A cross-platform desktop application for managing VR tournaments, built with Electron.

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

ISC