# Furniture Color Customizer

## Overview

A web-based furniture customization application that allows users to upload furniture images, select specific regions, and apply custom colors from a company palette. The system provides realistic color rendering that maintains shadows and textures, with capabilities to save, share, and export customized designs.

**Core Functionality:**
- Upload furniture images (sofa, chair, table, etc.)
- Select regions using drawing tools (manual polygon/brush or auto-detection)
- Apply colors from predefined company palette
- Realistic color blending with texture preservation
- Save/download/submit customizations for quotation

## Recent Changes

**November 2, 2025 - AI-Powered Click-to-Color Redesign:**
- **MAJOR REDESIGN**: Replaced manual drawing tools with AI-powered automatic furniture part detection
- Integrated Replicate API with FastSAM (Fast Segment Anything Model) for intelligent image segmentation
- **OPTIMIZED FastSAM**: Enhanced with better_quality and retina modes for improved accuracy
- New interaction model: Users simply click on any furniture part to automatically detect and color it
- Removed Fabric.js dependency and manual shape drawing (rectangle, circle tools)
- Implemented HTML5 Canvas with mask overlay system for precise color application
- Added real-time segmentation with loading states and error handling
- Backend: New `/api/segment` endpoint processes click coordinates and returns AI-detected masks
- Database schema updated: New tables for `segmentationMasks` and `colorApplications`
- User-friendly workflow: Upload → Click any part → Color is automatically applied
- No Photoshop skills required - perfect for non-technical users
- Fast and accurate AI detection ideal for furniture part segmentation (~2-3 seconds per click)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React.js with TypeScript, bundled using Vite

**UI Component System:** 
- shadcn/ui components built on Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- "New York" style variant with CSS variables for theming
- Component library includes: dialogs, buttons, forms, cards, tooltips, and specialized UI elements

**Canvas/Image Editing:**
- HTML5 Canvas for mask overlay and color rendering
- AI-powered image segmentation via Replicate API (Meta SAM 2)
- Click-based interaction: automatic furniture part detection on click
- Real-time color blending with multiply composite operation
- Zoom controls and download functionality

**State Management:**
- React Query (TanStack Query) for server state and data fetching
- Local React state for UI interactions and canvas operations
- Session-based state persistence

**Routing:**
- Wouter for lightweight client-side routing
- Single-page application with Home and NotFound routes

**Design System:**
- Reference-based approach inspired by professional design tools (Figma, Canva, Adobe Creative Cloud)
- Three-panel desktop layout: Left sidebar (320px), center canvas (fluid), right properties panel (280px)
- Responsive with collapsible sidebars for tablet and bottom sheets for mobile
- Typography: Inter/Work Sans (UI), Outfit/Space Grotesk (headers), JetBrains Mono (code)
- Consistent spacing scale using Tailwind units (2, 3, 4, 6, 8, 12, 16)

### Backend Architecture

**Runtime:** Node.js with Express.js

**API Design:**
- RESTful API endpoints for project and image management
- File upload handling via Multer with validation
- Supported image formats: JPEG, JPG, PNG, GIF, WebP
- 10MB file size limit for uploads

**Database ORM:**
- Drizzle ORM for type-safe database operations
- PostgreSQL dialect configuration
- Schema-driven with Zod validation integration

**Key Endpoints:**
- `POST /api/upload` - Image upload with file validation
- `GET /api/projects` - Fetch user projects
- CRUD operations for projects, images, color regions, and canvas states

**Build Process:**
- Development: tsx for TypeScript execution with hot reload
- Production: Vite for client build, esbuild for server bundling
- ESM module format throughout

### Data Storage

**Database Schema (PostgreSQL):**

1. **projects** - Furniture customization projects
   - id, name, description, previewImageUrl
   - Timestamps: createdAt, updatedAt

2. **projectImages** - Uploaded furniture images
   - id, projectId (FK), originalImagePath, mimeType
   - Dimensions: width, height
   - Cascade delete on project removal

3. **segmentationMasks** - AI-detected furniture parts
   - id, imageId (FK), clickX, clickY
   - maskData (base64 PNG), boundingBox (JSONB)
   - Stores SAM 2 generated masks for each click
   - Cascade delete on image removal

4. **colorApplications** - Applied colors to segmented parts
   - id, projectId (FK), maskId (FK)
   - fillHex, opacity, blendMode
   - Links colors to specific detected furniture parts
   - Cascade delete on project removal

5. **recentColors** - User's recent color selections
   - For quick color access in UI

**File Storage:**
- Local filesystem storage in `/uploads` directory
- Uploaded files served as static assets via Express
- UUID-based filenames to prevent collisions

**In-Memory Storage:**
- MemStorage class for user management (development/fallback)
- Can be replaced with database-backed storage

### External Dependencies

**UI Libraries:**
- @radix-ui/* - Accessible component primitives (accordion, dialog, dropdown, select, etc.)
- cmdk - Command palette component
- embla-carousel-react - Carousel functionality
- react-day-picker - Calendar/date selection
- lucide-react - Icon library

**AI/ML Services:**
- replicate - Node.js client for Replicate API
- Meta SAM 2 (Segment Anything Model 2) - AI-powered image segmentation
- Real-time furniture part detection from click coordinates

**Form Handling:**
- react-hook-form - Form state management
- @hookform/resolvers - Form validation
- zod - Schema validation

**Data Management:**
- @tanstack/react-query - Server state management and caching
- drizzle-orm - Database ORM
- drizzle-zod - Zod schema generation from database schema

**Styling:**
- tailwindcss - Utility-first CSS framework
- class-variance-authority - Component variant management
- clsx + tailwind-merge - Class name utilities

**Backend:**
- express - Web framework
- multer - Multipart form data handling (file uploads)
- pg - PostgreSQL client
- connect-pg-simple - PostgreSQL session store

**Development Tools:**
- vite - Build tool and dev server
- @vitejs/plugin-react - React support for Vite
- typescript - Type safety
- @replit/vite-plugin-* - Replit-specific development tools

**Color Palette Data:**
- Predefined company color categories stored in client-side data file
- Categories: Stainless Steel Finishing, Steel & Aluminum Options, Wooden Finishing
- Each color includes: id, code, name, hexColor