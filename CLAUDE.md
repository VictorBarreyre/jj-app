# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **rental management application** for Jean Jacques Cérémonie (JJ Location), a formal wear rental business. It manages rental contracts for suits, tuxedos, jackets, and formal accessories for ceremonies.

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Express + TypeScript + MongoDB (Atlas)
- **Database**: MongoDB Atlas with Mongoose ODM
- **State Management**: Zustand + TanStack React Query
- **Authentication**: JWT-based auth
- **PDF Generation**: jsPDF + Puppeteer (backend)
- **Deployment**: Vercel (frontend), backend deployed separately

## Development Commands

### Frontend (in `/frontend/`)
```bash
npm run dev          # Start development server (Vite) on port 5173
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend (in `/backend/`)
```bash
npm run dev          # Start development server with nodemon on port 3001
npm run build        # Compile TypeScript to /dist
npm run start        # Start production server from /dist
npm run test-email   # Test email functionality
npm run test-smtp    # Test SMTP connection only
```

### Root Level
- Both frontend and backend must be started separately
- Frontend dev server proxies `/api` requests to backend (localhost:3001)
- No unified test suite; testing is primarily manual

## Architecture & Key Concepts

### Core Business Domain
This application manages **rental contracts** for formal wear with these key entities:
- **Clients**: Individual or group customers
- **Rental Contracts**: Complete rental agreements with dates, items, payments
- **Stock Management**: Inventory of clothing items (suits, accessories)
- **Product Catalog**: Defined in `backend/config/productCatalog.ts` with references, sizes, and pricing

### Application Flow
1. **Measurement Form**: Capture client details and outfit requirements
2. **Stock Selection**: Choose items from inventory
3. **Contract Generation**: Create rental agreement with pricing
4. **PDF Export**: Generate customer and vendor copies

### Data Models

#### Key Types (see `/frontend/src/types/`)
- `RentalContract`: Main business entity with client, dates, items, payments
- `TenueInfo`: Outfit configuration (jacket, vest, pants, accessories)
- `Order`: Simplified version for drafts and workflow
- `GroupRentalInfo`: For group bookings with multiple participants

#### Database Models (see `/backend/models/`)
- `RentalContract.ts`: Main contract schema
- `RentalContractMongo.ts`: MongoDB-specific implementation
- `Stock.ts`: Inventory management
- `User.ts`: Authentication

### State Management Patterns
- **TanStack React Query**: Server state, caching, mutations
- **Zustand**: Local UI state
- **AuthContext**: Authentication state management
- **Custom hooks** in `/frontend/src/hooks/` for business logic

### API Structure
RESTful APIs in `/backend/routes/`:
- `/api/auth/*`: Authentication endpoints
- `/api/contracts/*`: Rental contract CRUD
- `/api/stock/*`: Inventory management
- `/api/measurements/*`: Measurement data

### Key Configuration Files

#### Product Catalog (`backend/config/productCatalog.ts`)
- Comprehensive clothing catalog with 60+ formal wear references
- Size mappings for different garment types (suits, tuxedos, accessories)
- Pricing and availability data
- **Critical**: This file defines the entire business inventory

#### Database (`backend/config/database.ts`)
- MongoDB Atlas connection with fallback error handling
- Connection string stored in environment variables

## Development Guidelines

### Code Organization
- **Component Structure**: Follows atomic design in `/frontend/src/components/`
  - `auth/`: Authentication components
  - `forms/`: Business logic forms (rental, measurement)
  - `stock/`: Inventory management UI
  - `ui/`: Reusable UI components (buttons, modals, etc.)
- **API Services**: Centralized in `/frontend/src/services/` and `/backend/routes/`
- **Type Safety**: Shared types between frontend and backend, strict TypeScript

### Import Patterns
- Frontend uses path alias `@/` for `/src/`
- Backend uses relative imports
- Shared business logic in utility files

### State Management
- Use TanStack React Query for server state
- Prefer custom hooks for complex business logic
- Keep components focused on presentation

### Error Handling
- Backend: Centralized error middleware in `/backend/middleware/errorHandler.ts`
- Frontend: Toast notifications via react-hot-toast
- Database errors gracefully handled (app continues without MongoDB)

## Security & Environment

### Authentication
- JWT tokens for session management
- Protected routes via `ProtectedRoute` component
- Backend auth middleware in `/backend/middleware/authMiddleware.ts`

### Environment Variables (Backend)
```
MONGODB_URI=<MongoDB Atlas connection string>
FRONTEND_URL=<Frontend URL for CORS>
PORT=<Server port, defaults to 3001>
JWT_SECRET=<JWT signing secret>
```

### CORS Configuration
- Configured for multiple origins including Vercel deployment
- Credentials enabled for authentication

## Deployment

### Frontend (Vercel)
- Build command: `cd frontend && npm install && npm run build`
- Output directory: `frontend/dist`
- SPA routing handled via rewrites in `vercel.json`

### Backend
- Compile TypeScript: `npm run build`
- Start with: `npm start` (from compiled `/dist`)
- Requires MongoDB Atlas connection and environment variables

## Common Development Patterns

### Adding New Rental Items
1. Update `PRODUCT_CATALOG` in `backend/config/productCatalog.ts`
2. Add size mappings if needed
3. Update TypeScript types in `/frontend/src/types/`

### Creating New Forms
- Extend existing form components in `/frontend/src/components/forms/`
- Use React Hook Form + Zod validation pattern
- Integrate with TanStack React Query for submissions

### PDF Generation
- Client-side: jsPDF in `/frontend/src/services/pdfService.ts`
- Server-side: Puppeteer for complex layouts
- Both vendor and customer versions supported

## Known Patterns & Conventions

### Naming Conventions
- Components: PascalCase (`RentalContractForm`)
- Files: kebab-case for utilities, PascalCase for components
- API endpoints: RESTful with resource-based URLs

### Data Flow
1. Forms capture data → React Hook Form
2. Submit via TanStack React Query mutations
3. Backend validation → MongoDB storage
4. Real-time UI updates via query invalidation

### Error Boundaries
- Toast notifications for user-facing errors
- Console logging for development debugging
- Graceful degradation when backend unavailable