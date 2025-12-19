# CollectiSense AI - Frontend

This is the Next.js frontend for CollectiSense AI with authentication, data management, and analytics capabilities.

## Features

- 🔐 JWT-based authentication
- 🎨 Modern UI with green, black, and white color scheme
- 📱 Responsive design with Tailwind CSS
- ⚡ Next.js 15+ with TypeScript
- 🧪 Jest testing setup

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.local.example .env.local
```

3. Update the environment variables in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:9000
```

### Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Building

Build for production:
```bash
npm run build
npm start
```

## Default Login Credentials

- Username: `admin`
- Password: `admin123`

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── auth/             # Authentication components
│   └── dashboard/        # Dashboard components
├── lib/                  # Utility libraries
│   ├── auth/            # Authentication logic
│   └── utils.ts         # Helper functions
├── __tests__/           # Test files
└── public/              # Static assets
```

## Technologies Used

- **Next.js 15+** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **js-cookie** - Cookie management
- **Lucide React** - Icons
- **Jest** - Testing framework
- **React Testing Library** - Component testing