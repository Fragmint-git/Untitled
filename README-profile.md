# VR Tournament Application - Profile Module

## Overview

The Profile Module adds user profile management functionality to the VR Tournament Application. It allows users to view and edit their personal information, account settings, notification preferences, appearance settings, and privacy controls.

## Features

- **Personal Information Management**: Edit display name, full name, email, phone number, and bio
- **Account Settings**: Change password and language preferences
- **Notification Settings**: Configure email and in-app notifications
- **Appearance Settings**: Customize theme (dark/light) and font size
- **Privacy Controls**: Manage profile visibility and data sharing preferences
- **Profile Picture**: Upload and change profile picture

## File Structure

```
renderer/
├── index.html                  # Main HTML file with profile section
├── styles.css                  # CSS styles including profile styles
├── js/
│   ├── main.js                 # Main JavaScript file that initializes modules
│   ├── modules/
│   │   ├── ui.js               # UI module for notifications and theme
│   │   ├── navigation.js       # Navigation module
│   │   ├── profile/            # Profile module directory
│   │   │   ├── profile.js      # Main profile module
│   │   │   ├── personalInfo.js # Personal information module
│   │   │   ├── accountSettings.js # Account settings module
│   │   │   ├── notificationSettings.js # Notification settings module
│   │   │   ├── appearanceSettings.js # Appearance settings module
│   │   │   └── privacySettings.js # Privacy settings module
```

## Implementation Details

### HTML Structure

The profile section is implemented as a content section in the main `index.html` file. It includes:

- A sidebar with profile picture and navigation menu
- Content sections for each category of settings
- Forms for editing different types of user data

### CSS Styles

The profile styles are included in the main `styles.css` file and provide:

- Layout for the profile container, sidebar, and content areas
- Styling for forms, inputs, and buttons
- Responsive design for different screen sizes
- Light and dark mode support

### JavaScript Modules

The profile functionality is implemented using a modular approach:

- **profile.js**: Main module that initializes the profile functionality
- **personalInfo.js**: Handles personal information form
- **accountSettings.js**: Manages account settings
- **notificationSettings.js**: Controls notification preferences
- **appearanceSettings.js**: Handles theme and font size settings
- **privacySettings.js**: Manages privacy controls

## Data Storage

User profile data is stored in the browser's localStorage for demonstration purposes. In a production environment, this would be replaced with server-side storage and API calls.

## Usage

1. Click on the user profile image in the top-right corner to access the profile page
2. Navigate between different sections using the sidebar menu
3. Edit information in the forms and click "Save Changes" to update
4. Click "Change Picture" to upload a new profile picture

## Integration

The profile module is integrated with the rest of the application through:

- The navigation module for switching to the profile section
- The UI module for notifications and theme switching
- Event-based communication between modules

## Future Enhancements

- Server-side data storage and synchronization
- Additional profile sections (e.g., connected accounts, security settings)
- Profile verification and two-factor authentication
- Enhanced profile picture editing with cropping and filters 