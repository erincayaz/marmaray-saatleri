# Marmaray Saatleri - React Version

A modern React application to check Marmaray (Istanbul metro) train schedules.

## Features

- Real-time train schedule information
- Search trains by station and direction
- Support for Turkish characters
- Responsive design with Bootstrap
- Deployed on GitHub Pages

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Navigate to the project directory
cd marmaray-saatleri

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build and Deploy

```bash
# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Project Structure

```
src/
├── main.jsx           # React entry point
├── App.jsx            # Main component
├── App.css            # Styles
├── constant.js        # Train schedule constants
├── trainTimes.js      # Train time calculation logic
└── utils.js           # Utility functions
```

## Technology Stack

- React 18
- Vite (Build tool)
- Bootstrap 5 (UI Framework)
- Luxon (DateTime handling)
- Remove Accents (Turkish character support)

## License

ISC
