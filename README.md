# React TypeScript Starter

A production-ready React TypeScript template with a comprehensive project structure, development tools, and best practices. Skip the initial setup and focus on building your application with this battle-tested foundation used across multiple enterprise projects.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [State Management](#state-management)
- [Utilities](#utilities)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Design Patterns](#design-patterns)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Features

✨ **Zero Configuration** - Pre-configured development environment ready to use  
📁 **Organized Structure** - Scalable folder architecture following React best practices  
🎯 **TypeScript First** - Full type safety with comprehensive type definitions  
🔄 **Redux Toolkit** - Modern state management with Redux best practices  
🛠️ **Custom HTTP Client** - Built-in fetch wrapper with automatic JSON handling  
📝 **ESLint & Prettier** - Code formatting and quality enforcement  
🎨 **Import Aliases** - Clean imports with `@/` path mapping  
🏗️ **Component Architecture** - Separation of concerns with container/component pattern  
🔧 **Environment Management** - Flexible configuration for different deployment targets

## Quick Start

```bash
# Clone this starter template
git clone https://github.com/David-H-Afonso/react-ts-starter.git

# Rename the folder to your project name
mv react-ts-starter your-project-name
cd your-project-name

# Install dependencies
npm install

# Remove the original remote and add your own repository
git remote remove origin
git remote add origin YOUR_REPOSITORY_URL

# Make your first commit to your repository
git add .
git commit -m "Initial commit from react-ts-starter template"
git push -u origin main

# Start development server
npm run dev
```

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── elements/        # Basic, atomic components (Button, Input, etc.)
│   └── [feature]/       # Feature-specific components
│       ├── components/  # React components (.tsx)
│       └── containers/  # Logic containers
├── store/               # Redux state management
│   ├── features/        # Feature slices
│   └── hooks/          # Typed Redux hooks
├── services/           # API service layer
├── models/             # TypeScript type definitions
├── utils/              # Utility functions and helpers
├── environments/       # Environment configurations
├── assets/            # Static assets
├── hooks/             # Custom React hooks
└── enums/             # Enumeration definitions
```

### Component Architecture

The project follows a **Container/Component pattern** to separate concerns:

#### Elements

Foundation components that form the building blocks of your application. These are reusable, atomic components like buttons, inputs, cards, and lists that can be used across multiple features. They should be:

- **Highly reusable** across different parts of the application
- **Well-typed** with proper TypeScript interfaces
- **Self-contained** with their own styling and behavior
- **Never full pages** but rather smaller, focused pieces

#### Components

Feature-specific components organized by functionality. Each feature follows a structured approach that separates concerns for maintainable code:

```
Feature/
├── components/
│   ├── FeatureComponent.tsx    # UI rendering and visual logic
│   └── FeatureComponent.scss   # Styling (optional)
└── containers/
    └── FeatureContainer.tsx    # Business logic and state management
```

**Containers** are responsible for all business logic, state management, API calls, data processing, and complex operations. This includes everything from simple state hooks like `[loading, setLoading] = useState()` to complex fetching processes involving custom hooks. Most functions will live here since they typically involve calculations, data manipulation, or side effects.

**Components** focus exclusively on rendering and user interactions. They receive props from containers and handle the visual presentation. Functions exclusive to rendering (like UI helpers or display formatters) can live inside the component, but the decision of where to place logic is yours to make based on your project's needs.

**Styling Approach**: The `.scss` file is completely optional and represents just one of many styling approaches you might choose:

- **Container-level styling** - Some developers prefer organizing styles with business logic
- **Assets folder** - Centralized styling in a dedicated assets directory
- **Styled Components** - CSS-in-JS approach for component-scoped styling
- **Other methodologies** - Tailwind, CSS Modules, or your preferred approach

This flexibility is one of many project-specific decisions you'll need to make when adapting this starter template.

**Scaling Components**: When components grow too large (which is normal), consider these refactoring strategies:

- **Extract reusable elements** into smaller, more atomic components in the `elements/` directory
- **Create sub-components** within the same feature directory and import them
- **Use the main component as an index** that composes smaller, focused components
- **Split complex rendering logic** into multiple component files within the same feature

This approach maintains clean separation of concerns while allowing flexibility in how you organize and scale your component architecture as your application grows.

### State Management

The Redux store is structured with modern Redux Toolkit patterns:

#### Features Structure

Each feature slice contains:

- **Slice** (`featureSlice.ts`) - Actions, reducers, and state definition
- **Thunks** (`thunk.ts`) - Async operations and side effects
- **Selectors** (`selector.ts`) - Memoized state access with reselect
- **Index** (`index.ts`) - Centralized exports for clean imports

#### Hooks

Pre-configured typed hooks (`useAppDispatch`, `useAppSelector`) provide type safety and eliminate the need for manual typing throughout your application.

#### Why This Structure?

- **Separation of concerns** - Each file has a single responsibility
- **Reusability** - Selectors and thunks can be reused across components
- **Performance** - Memoized selectors prevent unnecessary re-renders
- **Maintainability** - Clear organization makes code easy to find and modify

### Utilities

#### Custom Fetch

A powerful HTTP client (`customFetch`) designed to replace external dependencies like Axios:

**Features:**

- **Automatic JSON handling** with intelligent content-type detection
- **Query parameter encoding** for GET requests
- **Request/response interceptors** with custom headers
- **Error handling** with detailed error messages
- **Timeout support** for request cancellation
- **TypeScript generics** for response type safety
- **Multiple content types** support (JSON, text, blobs, binary)

**Usage Example:**

```typescript
// GET with query parameters
const users = await customFetch<User[]>('/api/users', {
	params: { page: 1, limit: 10 },
})

// POST with JSON body
const newUser = await customFetch<User>('/api/users', {
	method: 'POST',
	body: { name: 'John', email: 'john@example.com' },
})

// With custom headers and timeout
const data = await customFetch<ApiResponse>('/api/data', {
	headers: { Authorization: 'Bearer token' },
	timeout: 5000,
})
```

#### Environment Management

Flexible configuration system supporting multiple deployment scenarios:

- **Development/Production** environments with automatic detection
- **Runtime configuration** for Docker deployments
- **Electron support** with global variable injection
- **Centralized API routes** in `apiRoutes.ts` for maintainable endpoint management

## Getting Started

### 1. Initial Setup

- **Fork or download** this repository
- **Review and understand** the project structure
- **Install dependencies** with `npm install`

### 2. Configuration

#### Package.json

- Update `name`, `version`, and `description`
- Review dependencies and add/remove as needed
- Customize build scripts if required

#### Environment Setup

- Configure API endpoints in `src/environments/apiRoutes.ts`
- Update base URLs in environment files for your backend
- Add environment variables as needed

#### README Customization

- Replace placeholder content with your project details
- Update repository URLs and project name
- Add project-specific documentation

### 3. Development

Start the development server and begin building your application:

```bash
npm run dev
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run type-check   # TypeScript type checking
```

## Design Patterns

This starter template implements several proven design patterns to ensure maintainable and scalable code:

### Container/Component Pattern

**Location:** `src/components/[feature]/`

- **Containers** (`containers/`) handle business logic, state management, and API calls
- **Components** (`components/`) focus purely on UI rendering and user interactions
- Promotes separation of concerns and easier testing

### Redux Toolkit Pattern

**Location:** `src/store/features/`

- **Slice Pattern** - Combines actions, reducers, and state in single files
- **Thunk Pattern** - Handles async operations and side effects
- **Selector Pattern** - Memoized state access with reselect for performance

### Facade Pattern

**Location:** `src/services/` and `src/utils/customFetch.ts`

- **Custom HTTP Client** provides a simplified interface over the native fetch API
- **Service Layer** abstracts complex API interactions behind simple method calls

### Module Pattern

**Location:** Throughout `src/` with `index.ts` files

- **Barrel Exports** - Clean imports through centralized index files
- **Feature Modules** - Self-contained feature directories with clear boundaries

### Factory Pattern

**Location:** `src/environments/` and `src/store/`

- **Environment Factory** - Creates appropriate configurations based on runtime environment
- **Store Configuration** - Dynamically configures Redux store with middleware

### Hook Pattern

**Location:** `src/hooks/` and `src/store/hooks/`

- **Custom Hooks** - Encapsulate reusable stateful logic
- **Typed Redux Hooks** - Provide type-safe store interactions

## Roadmap

- [ ] React Router integration for navigation
- [ ] Testing setup with Jest and React Testing Library
- [ ] Storybook integration for component documentation
- [ ] PWA configuration
- [ ] Docker deployment templates

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE.md](LICENSE.md) file for details.

---

**Ready to build something amazing?** This starter template provides everything you need to create scalable, maintainable React applications. Focus on your business logic while we handle the foundation.
