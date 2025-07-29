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
- July 11, 2025: Added Comprehensive Pre-defined Data for Core Systems:
  - Added Working Days pre-defined data with realistic school schedule (Mon-Fri FullDay, Sat HalfDay, Sun Holiday)
  - Implemented School Schedule data with complete day-wise period and break schedules
  - Created Class/Subject/Division Mappings for Classes 1-10 with realistic subject assignments
  - Added Teacher Subject/Class/Division Mappings with proper teacher assignments and class teacher designations
  - All systems now load with authentic educational data for immediate functionality testing
  - Enhanced user experience with complete educational management ecosystem
- July 11, 2025: Removed Pre-defined Data for Class and Teacher Mapping Systems:
  - Removed all pre-defined Class/Subject/Division Mappings data from initialization
  - Removed all pre-defined Teacher Subject/Class/Division Mappings data from initialization
  - Both systems now start with clean state requiring user input for authentic data entry
  - Enhanced data integrity by ensuring only user-created mappings populate the tables
- July 14, 2025: Added Syllabus Master Management System:
  - Created new "Syllabus Master" menu item positioned after Class/Subject/Div Mapping
  - Built landing page displaying classes with syllabus counts and navigation options
  - Created class detail page showing subjects and existing syllabus content with chapter/lesson organization
  - Developed comprehensive Add Syllabus form with Chapter/Lesson No. field and optional description
  - Added complete CRUD operations for syllabus masters in backend storage and API
  - Applied consistent indigo-purple gradient theme matching application design
  - Enhanced syllabus display with chapter/lesson badges and conditional description rendering
- July 14, 2025: Added Schedule Periodic Test Management System:
  - Created new "Schedule Periodic Test" menu item positioned after Time Table creation
  - Built landing page displaying scheduled tests with Class/Division, Subject, and Action columns
  - Developed comprehensive Add Periodic Test form with year, class, division, subject, and chapter selection
  - Implemented advanced validation system with real-time error display for class-subject-division conflicts
  - Added multi-select functionality for divisions and chapters with proper validation
  - Created complete CRUD operations for periodic tests in backend storage and API
  - Applied consistent orange-red gradient theme matching educational scheduling design
  - Enhanced form with date/time pickers and comprehensive validation messaging
- July 14, 2025: Enhanced Schedule Periodic Test with Add More Functionality:
  - Redesigned Add Periodic Test form with "Add More" button functionality
  - Added real-time table display showing entered test subjects, chapters, date, and time
  - Implemented individual test entry management with delete functionality
  - Updated landing page to group tests by Class/Division with comma-separated subjects display
  - Modified form to allow multiple subject scheduling per class-division combination
  - Enhanced validation to ensure only mapped subjects for selected class-divisions appear
  - Added batch saving functionality for multiple test entries at once
- July 15, 2025: Added Public Holiday/Vacation Master Management System:
  - Created new "Public Holiday/Vacation Master" menu item positioned after Schedule Periodic Test
  - Built full-page creative calendar landing page with bold vibrant blue-purple-pink gradient design
  - Implemented monthly calendar view with holiday highlighting and navigation controls
  - Added comprehensive sidebar with year selector, upcoming holidays, and statistics
  - Created detailed Add Public Holiday form with year, description, type, and date range fields
  - Implemented holiday type selection (Full Day/Half Day) with radio button interface
  - Added complete CRUD operations for public holidays in backend storage and API
  - Enhanced calendar display with color-coded holiday periods and holiday count badges
  - Applied consistent gradient theme with glass morphism effects throughout interface
- July 16, 2025: Added Hand Book Management System with File Upload:
  - Created new "Hand Book" menu item positioned after Public Holiday/Vacation Master
  - Built landing page displaying uploaded files with year filtering and file information
  - Developed comprehensive Add Hand Book form with year selection and file upload functionality
  - Implemented file upload validation supporting PDF, DOC, DOCX formats with 10MB limit
  - Added file preview with size display and remove functionality before upload
  - Created complete CRUD operations for hand books in backend storage and API
  - Enhanced file management with download links and delete confirmation dialogs
  - Applied consistent blue-indigo-purple gradient theme matching application design
  - Integrated with multer middleware for secure file handling and filesystem storage
- July 16, 2025: Added Newsletter Management System with File Upload:
  - Created new "Newsletter" menu item positioned after Hand Book in sidebar navigation
  - Built landing page displaying newsletters with topic name, year, file info, and upload date
  - Developed comprehensive Add Newsletter form with year selection and topic name field (textarea)
  - Implemented file upload functionality supporting PDF, DOC, DOCX formats with validation
  - Added complete CRUD operations for newsletters in backend storage and API
  - Enhanced file management with view, edit, and delete functionality
  - Applied consistent emerald-teal gradient theme matching application design
  - Integrated file handling with proper error handling and success notifications
- July 16, 2025: Added Events Management System:
  - Created new "Events" menu item positioned after Newsletter in sidebar navigation
  - Built landing page displaying events with name, date range, duration, and status tracking
  - Developed comprehensive Add Event form with event name and from/to date selection
  - Implemented intelligent event status tracking (upcoming, ongoing, completed) based on dates
  - Added duration calculation and event validation with date range checking
  - Created complete CRUD operations for events in backend storage and API
  - Enhanced event display with color-coded status badges and action buttons
  - Applied consistent purple-pink gradient theme matching application design
  - Integrated date validation to ensure proper from/to date relationships
- July 16, 2025: Added Bus Routes Management System with Google Maps Integration:
  - Created new "Bus Routes" menu item positioned after Events in sidebar navigation
  - Built landing page displaying route information with comprehensive route details and action buttons
  - Developed Add Bus Route form with route number, name, from/to locations, and bus number fields
  - Integrated Google Maps API with interactive map for selecting route stops with search functionality
  - Implemented modal dialog for location selection with real-time map interaction and address lookup
  - Added stops management table with ability to add multiple locations and delete unwanted stops
  - Created vehicle and staff information fields (vehicle number, driver details, attender details)
  - Built comprehensive Edit Bus Route page with pre-populated data and full editing capabilities
  - Added complete CRUD operations for bus routes in backend storage and API with JSON stops storage
  - Applied consistent amber-orange gradient theme matching transportation management design
  - Integrated Google Maps geocoding services for address search and reverse geocoding functionality
- July 16, 2025: Updated Bus Routes Color Palette to Blue-Purple Theme:
  - Changed background gradient from amber-orange to blue-indigo-purple across all bus route pages
  - Updated header text gradients from amber-orange to blue-purple for consistent branding
  - Modified route information cards to use blue-purple color scheme instead of amber-orange
  - Applied consistent blue-purple gradient theme to all bus route components and elements
  - Enhanced visual appeal with modern blue-purple color palette throughout the bus routes system
- July 16, 2025: Reorganized Public Holiday/Vacation Master System:
  - Moved calendar view from Public Holiday landing page to Dashboard for better integration
  - Created simple table-based Public Holiday management page with Holiday Name and Actions columns
  - Added View, Edit, and Delete action buttons for each holiday entry
  - Implemented holiday type badges (Full Day/Half Day) and duration display
  - Updated dashboard with holiday calendar functionality including month navigation
  - Applied consistent blue-purple gradient theme to both dashboard calendar and holiday table
- July 16, 2025: Enhanced Add Periodic Test with Time Management:
  - Removed "Time of Test" field from add-periodic-test form
  - Added "From Time", "To Time", and auto-calculated "Duration" fields
  - Implemented intelligent duration calculation with real-time updates
  - Enhanced form validation to ensure proper time range (To Time after From Time)
  - Updated database schema to include fromTime, toTime, and duration columns
  - Applied consistent time formatting and validation throughout the system
- July 16, 2025: Reorganized Navigation Menu Structure:
  - Restructured sidebar menu into two main groups: "Masters" and "Others"
  - Masters group includes: Roles, Subjects, Staff Data, Class/Subject/Div Mapping, Syllabus Master, Schedule Periodic Test, Teacher Subject/Class/Div Mapping, Student Masters, Working Days, School Schedule, Create Time Table
  - Others group includes: Public Holiday/Vacation Master, Hand Book, Newsletter, Bus Routes, Events
  - Moved Dashboard to top level for easy access
  - Enhanced navigation organization for better user experience and logical grouping
- July 20, 2025: Enhanced Bus Routes with Pickup Time functionality:
  - Added pickup time input fields for each bus stop location
  - Updated database schema to support pickup times in bus route stops
  - Enhanced both add-bus-route and edit-bus-route pages with time validation
  - Applied database schema changes using drizzle push command
- July 20, 2025: Implemented Comprehensive Polls Management System:
  - Added "Polls" menu item under "Others" section in navigation
  - Created polls database schema with questions, options, and responses tables
  - Built polls landing page showing poll information with question types and counts
  - Developed add poll page with dynamic question and choice management
  - Each question can have its own poll type (Single Choice/Multiple Choices)
  - Each question has its own set of choices with dynamic count selection (2-8 choices)
  - Implemented "Add More Questions" functionality to repeat question sections
  - Created view poll page for taking polls with proper question-choice associations
  - Added complete CRUD operations for polls in backend storage and API
  - Applied consistent blue-purple gradient design theme throughout polls system
  - Updated database schema to support question-specific poll types and choice associations
- July 21, 2025: Implemented Comprehensive Mock Test Management System:
  - Added "Mock Test" menu item under "Others" section in navigation with ClipboardList icon
  - Created mock tests database schema with questions, options, file upload, and class/division mapping
  - Built landing page with table showing Mock Name, Class/Subject/Division, and Action columns
  - Developed comprehensive Add Mock Test page with three main sections:
    - Mock Information: Mock name, description, start/end dates, class/division/subjects selection
    - File Upload: Optional file attachment with Yes/No radio buttons and file upload interface
    - Questions: Dynamic question builder with options, scores, required flags, and other options
  - Implemented question management: Add, Delete, Move Up/Down, Required checkbox, Other option
  - Added option management: Add/Remove options with text and score fields for each option
  - Created View Mock Test page displaying full test with all questions and answer options
  - Added complete CRUD operations for mock tests in backend storage and API with file upload support
  - Applied consistent purple-pink gradient design theme throughout mock test system
  - Updated database schema and successfully pushed changes to support mock test functionality
- July 22, 2025: Added Test Result Management System:
  - Created new "Test Result" menu item positioned after Schedule Periodic Test in Masters section
  - Built comprehensive landing page with navigation tabs (Landing, Add, View) showing test progress and overview
  - Developed Add Test Result form with year/periodic test/class/division dropdowns and PDF sheet generation
  - Implemented auto-populate functionality linking periodic tests to class/division selections
  - Created PDF generation feature producing printable test result sheets with student roster and subject columns
  - Added View Test Result page with detailed statistics, grade distribution, and individual student results
  - Implemented auto-grade calculation (A+ to F) based on marks percentage with customizable grade boundaries
  - Added complete CRUD operations for test results with bulk operations support in backend API
  - Applied consistent emerald-teal-cyan gradient theme matching educational assessment design
  - Enhanced system with progress tracking, completion percentages, and comprehensive analytics
- July 23, 2025: Refined Add Periodic Test UI for Exact User Requirements:
  - Converted Period Test Name from dropdown to text input field for custom test names
  - Removed specific date format displays (17-07-2025(Thu), 18-07-2025(Fri)) from Date/Day column
  - Updated Date/Day column to show generic "Date range from Start Date to End Date (Excluding Sundays)"
  - Removed "50" default placeholder from Maximum Marks field, changed to "Enter marks"
  - Cleaned up date field labels by removing specific date examples (": 17/7", ": 22/7")
  - Removed explanatory text "Continue for rest of the week and Exclude Sunday" from form
  - Updated class selection label to remove "(VIII)" example text for cleaner interface
  - Made Maximum Marks field optional in form validation schema
  - Enhanced form layout for better user experience and data entry flexibility
- July 23, 2025: Added Dynamic Date-Based Table Generation:
  - Implemented functional Test End Date field with proper form validation
  - Added testEndDate column to periodicTests database schema and applied migration
  - Created dynamic table row generation based on selected start and end dates
  - Built date range calculator that excludes Sundays automatically
  - Each valid day between start and end dates creates a separate table row
  - Table displays formatted dates with day names (e.g., "17/07/2025 (Thu)")
  - Added proper fallback messaging when no dates selected or no valid dates in range
  - Enhanced form interactivity with real-time table updates on date changes
- July 23, 2025: Enhanced Multi-Day Test Scheduling with Individual Day Management:
  - Restructured form schema to support testDays array with separate data for each day
  - Implemented individual form fields for each day allowing different subjects per day
  - Created automatic testDays array population when date range changes
  - Added separate subject, marks, and time field management for each table row
  - Implemented automatic duration calculation for each individual day
  - Enhanced form validation to check each day's data individually
  - Updated submission logic to create separate periodic test entries for each day
  - Added comprehensive validation messages with specific day references
  - Enabled true multi-day test scheduling with independent daily configurations
- July 24, 2025: Added Syllabus Column with Modal-Based Chapter Selection:
  - Added new "Syllabus" column to the test scheduling table
  - Implemented "Add Syllabus" button for each day with dynamic enabling based on subject selection
  - Created modal dialog for syllabus chapter selection with checkbox interface
  - Added syllabusChapters field to testDays schema for storing selected chapters per day
  - Implemented subject-specific chapter filtering based on class and subject mapping
  - Added visual indicators showing selected chapter count and chapter names in table cells
  - Enhanced form submission to use day-specific syllabus chapters instead of global chapters
  - Applied consistent blue-purple gradient theme to syllabus selection components
  - Removed redundant global "Select Chapters" section for cleaner UI
  - Updated modal to display both chapter number and chapter name (e.g., "1 - Introduction to Mathematics")
  - Modified cell display to show only chapter numbers with hover tooltips revealing chapter names
  - Enhanced user experience with intuitive chapter selection and display workflow
- July 24, 2025: Enhanced Periodic Test Display and Form Interface:
  - Restructured landing page to group tests by Class and Test Name instead of individual subjects
  - Modified display to show all subjects for a test group in single row (e.g., "Class X - Mathematics, English, Biology")
  - Simplified date display to show only start date to end date without time details
  - Updated test name field to dropdown with existing test names and "Add New" option
  - Implemented dynamic text input that appears when "Add New" is selected with cancel functionality
  - Enhanced user experience with streamlined test creation and better organized test overview
- July 24, 2025: Enhanced Add Test Results with Period Test Integration and Excel Download:
  - Updated Periodic Test dropdown to fetch test names from "Period Test Name" field in Schedule Periodic Test
  - Modified test selection to use unique test names instead of individual test entries
  - Added Excel download functionality generating CSV files with same data structure as PDF sheets
  - Implemented dual download buttons for both PDF and Excel file generation
  - Enhanced data structure generation to include all subjects for selected test name and class
  - Applied consistent emerald-teal gradient styling to both download buttons
  - Improved test result sheet format to include date range and comprehensive test information
  - Fixed class selection issue for tests with multiple classes - now allows manual class selection
  - Enhanced form logic to handle test names spanning multiple classes with proper validation
  - Updated PDF/Excel headers with hardcoded school name "Greenwood International School"
  - Replaced subject-specific test headers with periodic test names (e.g., "Unit Test 1")
  - Removed redundant subject field from upper section as subjects appear in table columns
  - Added proper date range display with "From Date" and "To Date" from scheduled test data
- July 25, 2025: Enhanced Add Test Results with All Divisions Support and Proper PDF Generation:
  - Added "All Divisions" option in division dropdown for comprehensive test result sheets
  - Implemented subject availability checking for "All" divisions with N/A marking for unavailable subjects
  - Fixed PDF generation to create actual PDF files using jsPDF library instead of HTML downloads
  - Added proper table formatting with landscape orientation and grey-out functionality for N/A cells
  - Enhanced Excel generation to include division column and subject availability logic
  - Updated student count display to show "All Divisions" when appropriate
  - Applied subject-division mapping validation for proper test result accuracy
  - Fixed subject availability logic to use class mappings instead of periodic tests for accurate division-subject associations

## Changelog

- June 25, 2025. Initial setup
- December 26, 2024. UI modernization and feature enhancement