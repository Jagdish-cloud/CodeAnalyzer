# replit.md

## Overview
This is a full-stack web application for managing educational institutions and their branches. It offers a comprehensive form system for institution setup, including detailed branch information, contact persons, and administrative settings. The project aims to provide a robust platform for educational management, encompassing features from student and staff management to academic scheduling and administrative tasks.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, built using Vite.
- **UI/Styling**: Shadcn/ui components (based on Radix UI) with Tailwind CSS for consistent theming and modern aesthetics including gradient backgrounds, glass morphism effects, and enhanced typography. Lucide React for iconography.
- **State Management**: React hooks for local state, TanStack Query for server state.
- **Routing**: Wouter for client-side routing.
- **Form Management**: React Hook Form with Zod validation.

### Backend Architecture
- **Runtime**: Node.js with Express.js framework, written in TypeScript.
- **Database ORM**: Drizzle ORM for PostgreSQL.
- **File Uploads**: Multer middleware.
- **Session Management**: Connect-pg-simple for PostgreSQL session storage.

### Database Architecture
- **Database**: PostgreSQL.
- **ORM**: Drizzle ORM with type-safe schema definitions.
- **Schema**: Tables include users and institutions, with complex JSON fields for nested data like branches and contact persons.
- **Migrations**: Managed through Drizzle Kit.

### Key Features & Design Decisions
- **Institution Management**: Multi-branch registration, contact person management, super admin configuration, mobile app licensing, logo upload.
- **Data Storage**: Structured data in PostgreSQL columns, complex data (branches, contacts) as JSON, uploaded files in local filesystem, PostgreSQL-backed sessions.
- **UI Design**: Consistent modern design system applied across all pages, including dynamic color palettes, increased sidebar width, and standardized form layouts (max-w-5xl cards, mb-2 spacing).
- **Module Design**:
    - **Staff & Roles Management**: Comprehensive CRUD for staff and roles, integrated with dynamic role selection.
    - **Academic Management**:
        - **Class/Subject/Division Mapping**: Supports multi-select subjects and elective groups.
        - **Teacher Mapping**: Detailed assignment of teachers to classes, subjects, and divisions, including class teacher designation.
        - **Syllabus Master**: Chapter and lesson organization, linked to class and subject mappings, with elective group support.
        - **School Schedule**: Period and break management based on working days, with time conflict detection.
        - **Periodic Test Management**: Multi-day test scheduling with individual day management, dynamic date-based table generation, syllabus column with modal-based chapter selection, and elective group support.
        - **Test Result Management**: PDF/Excel generation of test sheets, auto-grade calculation, and comprehensive analytics.
    - **Student Management**: Full CRUD for student records, auto roll number assignment, integration with class mapping for class/division selection.
    - **Administrative & Utility**:
        - **Working Days Management**: Configurable full day/half day/holiday/alternate week options.
        - **Public Holiday/Vacation Master**: Calendar view with holiday highlighting, integrated into dashboard.
        - **Handbook & Newsletter Management**: File upload (PDF, DOC, DOCX) and management.
        - **Events Management**: Tracking events with intelligent status (upcoming, ongoing, completed).
        - **Bus Routes Management**: Google Maps integration for stop selection, vehicle and staff details, with pickup time functionality.
        - **Polls Management**: Dynamic question and choice management, supporting single/multiple choice.
        - **Mock Test Management**: Comprehensive test creation with file upload, dynamic question builder, and scoring.
- **Deployment**: Vite for frontend build, esbuild for backend bundling. Replit configuration with Node.js 20, Web, PostgreSQL 16.

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL connection driver.
- **drizzle-orm**: Type-safe database operations.
- **@tanstack/react-query**: Server state management.
- **react-hook-form**: Form handling and validation.
- **zod**: Runtime type checking and validation.

### UI and Styling Dependencies
- **@radix-ui/***: Accessible UI component primitives.
- **tailwindcss**: Utility-first CSS framework.
- **class-variance-authority**: Component variant management.
- **lucide-react**: Icon library.
- **jsPDF**: PDF generation (for test results).

### Development Dependencies
- **tsx**: TypeScript execution for development.
- **esbuild**: Fast JavaScript bundler for production.

### Services and APIs
- **Google Maps API**: Integrated for bus route management (map interaction, geocoding).

## Recent Changes

- August 3, 2025: Enhanced Test Results PDF/Excel Generation with Elective Groups and Removed N/A Values:
  - Updated Add Test Results to format elective groups as "Group Name (Subject1/Subject2/Subject3...)" in PDF/Excel headers
  - Removed all "N/A" values from test result sheets since core subjects are common and electives are mandatory
  - Enhanced PDF generation to display properly formatted elective group names in column headers
  - Updated Excel generation to match PDF formatting with clean elective group display
  - Removed grey-out styling for N/A cells since N/A values are no longer used
  - Applied consistent elective group formatting throughout test result generation system
  - Improved user experience with cleaner, more professional test result sheet appearance