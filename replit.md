# Replit.md

## Overview
This is a full-stack web application built with Express.js and React, designed for managing educational institutions and their branches. The application provides a comprehensive form system for adding institutions with detailed branch information, contact persons, and administrative settings.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and bundling
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React hooks for local state, TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Management**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **File Uploads**: Multer middleware for handling file uploads
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **Development**: Hot reload with Vite integration

### Database Architecture
- **Database**: PostgreSQL (configured but can be provisioned later)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema**: Two main tables - users and institutions
- **Migrations**: Managed through Drizzle Kit

## Key Components

### 1. Institution Management System
- **Purpose**: Core functionality for managing educational institutions
- **Features**: 
  - Multi-branch institution registration
  - Contact person management
  - Super admin configuration
  - Mobile app licensing
  - Logo upload capabilities

### 2. Database Schema
- **Users Table**: Basic authentication with username/password
- **Institutions Table**: Complex JSON fields for branches and contact persons
- **Validation**: Zod schemas ensure data integrity with nested object validation

### 3. File Upload System
- **Storage**: Local file system with organized directory structure
- **Validation**: Image file type and size restrictions (5MB limit)
- **Security**: File type filtering and secure filename generation

### 4. UI Component Library
- **Foundation**: Shadcn/ui components providing consistent design
- **Accessibility**: Built on Radix UI for ARIA compliance
- **Customization**: CSS variables for easy theming
- **Icons**: Lucide React for consistent iconography

## Data Flow

### 1. Institution Creation Flow
1. User fills out comprehensive institution form
2. Form data validated client-side with Zod schemas
3. File uploads processed through Multer middleware
4. Data submitted to `/api/institutions` endpoint
5. Server validates and stores in PostgreSQL
6. Response returned with created institution data

### 2. Data Storage Strategy
- **Structured Data**: Primary institution fields in PostgreSQL columns
- **Complex Data**: Branch and contact information stored as JSON
- **Files**: Uploaded images stored in local filesystem
- **Sessions**: PostgreSQL-backed session storage for user management

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL connection driver
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling and validation
- **zod**: Runtime type checking and validation

### UI and Styling Dependencies
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Dependencies
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production
- **@replit/vite-plugin-***: Replit-specific development tools

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev`
- **Port**: 5000 (configured in .replit)
- **Hot Reload**: Vite middleware integrated with Express
- **Database**: PostgreSQL module available in Replit

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Assets**: Static files served from built frontend
- **Start Command**: `npm run start`

### Replit Configuration
- **Modules**: Node.js 20, Web, PostgreSQL 16
- **Deployment**: Autoscale target with build/run commands
- **Port Mapping**: Internal 5000 → External 80
- **Environment**: Development tools and error overlays enabled

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 25, 2025. Initial setup