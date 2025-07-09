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

## Recent Changes

- December 26, 2024: Migrated from Replit Agent to standard Replit environment
- December 26, 2024: Added Class/Subject/Div Mapping functionality with complete CRUD operations
- December 26, 2024: Modernized UI with contemporary design system:
  - Implemented gradient backgrounds and glass morphism effects across all pages
  - Updated color palette with improved contrast and accessibility
  - Added smooth animations and hover effects
  - Enhanced typography with better font features
  - Modernized cards, buttons, and form layouts
  - Applied consistent modern styling across all pages
- December 26, 2024: Enhanced sidebar and navbar with vibrant colorful design:
  - Transformed sidebar with indigo-purple-pink gradient background
  - Added glass morphism effects and modern styling to sidebar elements
  - Modernized navbar with gradient background and enhanced search functionality
  - Applied unique vibrant color schemes to each page background
  - Created cohesive modern design system throughout the application
  - Increased sidebar width from 256px to 320px for better spacing and readability
- June 27, 2025: Added Teacher Subject/Class/Div Mapping functionality:
  - Created new menu item "Teacher Subject/Class/Div Mapping" in sidebar
  - Built landing page with table showing Class-Subject, Status, and Action columns
  - Added comprehensive Add Teacher Mapping form with class/subject dropdowns
  - Implemented dynamic divisions table based on class/subject selection
  - Created teacher assignment functionality with dropdown for available teachers
  - Added complete CRUD operations for teacher mappings in backend
  - Applied consistent teal-cyan gradient design matching application theme
- June 30, 2025: Added Roles Management functionality:
  - Created new "Roles" menu item positioned before Staff data in sidebar
  - Built roles landing page with table showing Role, Status, and Action columns
  - Added comprehensive Add Role form with role name field and submit functionality
  - Implemented complete CRUD operations for roles in backend storage and API
  - Applied consistent purple-pink gradient design matching application theme
  - Added proper navigation and form validation with success/error handling
- June 30, 2025: Enhanced Class Mapping with Multi-Select Subjects:
  - Updated schema to support subjects array instead of single subject string
  - Implemented multi-select checkbox interface for subject selection in Add Class Mapping
  - Added selected subjects display with badge removal functionality
  - Updated landing page to show subjects as comma-separated values (e.g., "English, Mathematics")
  - Fixed backend API validation to handle subjects array properly
  - Removed all prepopulated data from Staff Management for authentic data only
  - Updated Staff Management to integrate with Roles system for dynamic role selection
- June 30, 2025: Redesigned Add Teacher Mapping with Enhanced UX:
  - Completely redesigned form layout with Class-Division selection dropdown
  - Implemented subject columns displaying all mapped subjects for selected class-division
  - Added teacher assignment dropdowns for each subject with "No teacher assigned" option
  - Integrated class teacher checkbox functionality (single selection enforced)
  - Updated form to create multiple teacher mappings per subject assignment
  - Applied consistent teal-cyan gradient theme matching teacher mapping pages
- June 30, 2025: Updated Teacher Subject/Class/Div Mapping Landing Page:
  - Redesigned table to group mappings by Class-Division combinations
  - Column 1 displays "Class [X] - Division [Y]" with "Subject: Subject1, Subject2" format
  - Column 2 shows Status with gradient badge styling
  - Column 3 contains Action buttons (View, Edit, Delete)
  - Implemented grouped data structure for better organization and readability
  - Applied consistent teal-cyan gradient theme throughout the interface
- June 30, 2025: Added Student Masters Management System:
  - Created new "Student Masters" menu item with complete navigation system
  - Built Class Landing page showing class-division with student counts and view actions
  - Developed Students Landing page displaying students by roll number with view/edit actions
  - Created comprehensive Add Student form with all required fields and validation
  - Implemented auto roll number assignment based on alphabetical order of first names
  - Added complete CRUD operations for students in backend storage and API
  - Applied vibrant indigo-purple-pink gradient design for student-related pages
  - Integrated with existing class mapping system for class/division selection
- June 30, 2025: Standardized Form UI and Enhanced UX:
  - Made all form cards uniform size (max-w-5xl) across the application
  - Added mb-2 spacing between main headers and sub headers on all pages
  - Ensured consistent form card centering and layout throughout the system
  - Updated add-student, add-staff, add-class-mapping, add-teacher-mapping, and add-role pages
  - Applied consistent styling to all form pages and landing pages
- July 3, 2025: Added Working Days Management System:
  - Created new "Working Days" menu item with comprehensive scheduling functionality
  - Built editable form supporting FullDay/HalfDay/Holiday/AlternateWeek options for each day
  - Implemented conditional AlternateWeek checkboxes (W1-W5) with dynamic display
  - Added timing fields (From/To) with conditional visibility based on day type
  - Created complete CRUD operations for working days in backend storage and API
  - Applied orange-red-pink gradient theme matching educational management design
  - Integrated with existing class mapping system to use subjects from Subjects API
- July 4, 2025: Added School Schedule Management System:
  - Created new "School Schedule" menu item positioned after Working Days in sidebar
  - Built comprehensive period and break management based on Working Days timings
  - Implemented day-wise schedule display showing working day timings and existing periods/breaks
  - Added modern modal dialogs for adding periods and breaks with stylish form design
  - Created auto-naming functionality (Period-1, Period-2, Break-1, etc.)
  - Implemented time conflict detection and validation for period/break scheduling
  - Added complete CRUD operations for school schedules in backend storage and API
  - Applied consistent orange-red-pink gradient theme matching Working Days design
  - Integrated holiday detection to disable scheduling on non-working days
- July 9, 2025: Added Pre-defined Master Data:
  - Implemented realistic educational data for immediate system functionality
  - Added 12 comprehensive staff roles (Principal, Vice Principal, Teachers, etc.)
  - Included 20 academic subjects covering primary and secondary education
  - Created 15 detailed staff profiles with hierarchical reporting structure
  - All data automatically loads when the application starts
  - Enhanced user experience with authentic educational institution data

## Changelog

- June 25, 2025. Initial setup
- December 26, 2024. UI modernization and feature enhancement