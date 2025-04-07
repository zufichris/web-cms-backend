# Web Content Manager Backend

A Node.js/TypeScript backend service for managing website content dynamically.

## Features

- 🏗️ Clean Architecture with Domain-Driven Design principles
- 🔄 CRUD operations with MongoDB via Mongoose
- 🛠️ TypeScript with strict type checking
- 🔒 Input validation using Zod schemas
- 🚦 Express middleware for request/response handling
- 📝 Comprehensive logging system
- ⚙️ Modular design with code generation
- 🔍 Health check and monitoring endpoints

## Getting Started

### Prerequisites

- Node.js >= 16.x
- MongoDB >= 4.x
- npm >= 8.x

### Installation

1. Clone the repository:

```bash
git clone https://github.com/zufichris/web-cms-backend.git
cd web-cms-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000
DB_URI=mongodb://localhost:27017/web-cms
```

### Scripts

- `npm start` - Build and start the production server
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests
- `npm run cleanup` - Clean build artifacts and dependencies
- `npm run generate:module <name>` - Generate a new module

## Project Structure

```
├── src/
│   ├── config/         # Configuration files
│   ├── middleware/     # Express middleware
│   ├── modules/        # Feature modules
│   ├── shared/         # Shared code
│   │   ├── application/    # Application layer
│   │   ├── domain/        # Domain layer
│   │   └── infrastructure/ # Infrastructure layer
│   └── utils/         # Utility functions
├── scripts/          # Build and development scripts
└── __tests__/       # Test files
```

## Creating a New Module

Generate a new module with complete boilerplate:

```bash
npm run generate:module user-profile
```

This will create a new module with:

- Domain layer (entities, repositories, use cases)
- Application layer (DTOs)
- Infrastructure layer (controllers, routes, persistence)
- Validation schemas
- Type definitions

## API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Endpoints

- `GET /` - API information and system details
- `GET /health` - Health check with detailed metrics
- `GET /ping` - Service availability check

## Development

### Code Style

The project uses ESLint and Prettier for code formatting:

```bash
# Check code style
npm run lint

# Format code
npm run format
```

### Testing

Run tests with:

```bash
npm test
```

## Deployment

1. Build the project:

```bash
npm run build
```

2. Set production environment variables
3. Start the server:

```bash
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
