# Furniture Color Customizer - Design Guidelines

## Design Approach
**Reference-Based + Design System Hybrid**: Drawing inspiration from professional design tools (Figma, Canva, Adobe Creative Cloud) combined with Material Design principles for a polished, productivity-focused interface. The design emphasizes workflow efficiency, visual clarity, and professional presentation suitable for the furniture industry.

## Core Design Principles
1. **Workspace-Centric Layout**: Primary focus on the canvas/editing area with supporting panels
2. **Organized Complexity**: Extensive color palette categorization without overwhelming users
3. **Professional Polish**: Furniture industry-appropriate aesthetic with clean, modern execution
4. **Contextual Clarity**: Clear visual hierarchy between original and customized views

---

## Layout System

### Spacing Scale
Use Tailwind spacing units: **2, 3, 4, 6, 8, 12, 16** for consistent rhythm throughout the application.

### Application Structure
**Three-Panel Layout** (Desktop):
- Left Sidebar (320px fixed): Upload controls, color palette browser, saved projects
- Center Canvas (fluid, min 600px): Main editing workspace with furniture image
- Right Properties Panel (280px fixed): Region selection tools, active color info, export options

**Responsive Behavior**:
- Tablet: Collapsible sidebars, tabbed navigation for tools
- Mobile: Full-screen canvas with bottom sheet for tools/colors

### Grid System
- Main container: `max-w-[1920px]` centered
- Panel gutters: `gap-4`
- Internal component spacing: `space-y-3` or `space-y-4`

---

## Typography

### Font Families
- **Primary (UI)**: Inter or Work Sans (400, 500, 600, 700)
- **Accent (Headers)**: Outfit or Space Grotesk (600, 700)

### Type Scale
- **Page Title**: 2xl (24px), font-semibold
- **Section Headers**: lg (18px), font-semibold
- **Panel Titles**: base (16px), font-medium
- **Body Text**: sm (14px), font-normal
- **Labels/Captions**: xs (12px), font-medium
- **Color Codes**: xs (12px), font-mono

### Hierarchy Rules
- Panel headers: All-caps with letter-spacing (tracking-wide)
- Color palette category names: Medium weight with subtle uppercase
- Action buttons: Medium weight, sentence case

---

## Component Library

### 1. Upload Zone
- Drag-and-drop area: Large (min-h-96), dashed border (border-2 border-dashed), rounded corners (rounded-xl)
- Icon: Upload cloud icon (h-16 w-16)
- Primary text: "Drag & Drop Furniture Image" (text-lg font-medium)
- Secondary text: "or click to browse • JPG, PNG up to 10MB" (text-sm)
- Hover state: Subtle scale transform and border emphasis

### 2. Color Palette Browser

**Category Organization** (Accordion-style):
- Stainless Steel Finishes (8 colors)
- Steel & Aluminum Options A & B (12 colors)
- Wooden Finishing (12 colors)
- HPL Laminate - Wooden Patterns (18 colors)
- HPL Laminate - Stone Patterns (9 colors)
- Nano Microcrystalline Patterns (6 colors)

**Color Swatch Display**:
- Grid: 4 columns on desktop, 3 on tablet, 2 on mobile
- Each swatch: Square (h-12 w-12), rounded (rounded-lg), with border
- Color code below: Centered, text-xs, font-mono (e.g., "SS02", "PC1")
- Color name: text-xs, truncated, hover shows full tooltip
- Active selection: Thick border indicator and subtle shadow

**Search & Filter**:
- Search input at top with icon
- Category filters as chips/tags
- "Recently Used" quick access section (max 8 colors)

### 3. Canvas Workspace

**Canvas Container**:
- Centered positioning with max dimensions fitting viewport
- Background: Subtle checkerboard pattern (like Photoshop) to indicate transparency
- Border: Thin stroke around canvas
- Zoom controls: Bottom-right corner (25%, 50%, 100%, 200%, Fit)
- Pan/zoom with mouse wheel and drag

**Image Display**:
- Original image on left half, edited preview on right half with vertical divider slider
- OR: Tabbed view switching between "Original" and "Preview"
- Image actions toolbar above canvas: Reset, Undo, Redo icons

**Region Selection Tools**:
- Floating toolbar on canvas: Polygon tool, Freehand brush, Magic wand, Eraser
- Tool size slider for brush/eraser
- "Smart detect" button for automatic region detection
- Active selection: Dotted animated border overlay (marching ants effect)

### 4. Properties Panel

**Active Selection Info**:
- Region name input field (e.g., "Sofa Seat", "Chair Legs")
- Currently applied color swatch with name and code
- "Change Color" button
- Opacity slider (0-100%)
- Blend mode dropdown (Normal, Multiply, Overlay)

**Export Section**:
- Preview thumbnail of final result (aspect ratio preserved, max h-48)
- File name input
- Format selector: PNG, JPG (with quality slider for JPG)
- Resolution selector: Original, 2x, 4x
- Primary "Download Image" button (w-full)
- Secondary "Save to Gallery" button

### 5. Header Bar

**Layout** (h-16, sticky top-0):
- Left: Logo + App name "Furniture Customizer" (text-xl font-semibold)
- Center: Current project name (editable inline, text-base)
- Right: User avatar + "My Projects" button + Help icon

### 6. Project Gallery Modal

**Grid Layout**:
- 3-column grid (2 on tablet, 1 on mobile)
- Each card: Thumbnail preview, project name, date, delete/duplicate actions
- Hover: Slight lift and shadow
- Empty state: Large illustration with "Start your first project" CTA

### 7. Buttons & Controls

**Primary Actions**: Solid fill, rounded-lg, px-6 py-3, font-medium
**Secondary Actions**: Border only, rounded-lg, px-6 py-3, font-medium
**Icon Buttons**: Square (h-10 w-10), rounded-md, centered icon
**Tool Toggles**: Toggle group for mutually exclusive options (like region selection tools)

### 8. Loading States
- Canvas: Skeleton shimmer effect
- Color palette: Pulsing placeholder squares
- Upload progress: Linear progress bar with percentage

---

## Interaction Patterns

### Color Application Flow
1. User selects region with tool → Region highlighted with animated border
2. User clicks color from palette → Color instantly previews on region
3. User adjusts opacity/blend mode in properties panel → Real-time update
4. User confirms or tries different color

### Multi-Region Workflow
- Support for selecting and naming multiple regions
- Region list in properties panel shows all defined regions
- Click region name to highlight it on canvas
- Toggle visibility of regions for easier editing

### Keyboard Shortcuts
- Display keyboard shortcut panel (accessible via "?" key)
- Common shortcuts: Z (Zoom), H (Pan), P (Polygon), B (Brush), Delete (Clear selection)

---

## Images

### Hero Section
**Not Applicable** - This is a web application tool, not a marketing site. The interface opens directly to the workspace.

### Onboarding/Empty States
- **Upload Zone**: Abstract illustration of furniture with color swatches floating around it
- **Empty Gallery**: Illustration of empty folder with furniture icons
- **Tutorial Tooltips**: Small instructional images showing how to use region selection tools

### Example Gallery
- Pre-loaded example furniture images users can try (3-4 samples)
- Small thumbnail grid in a "Try an Example" section within upload zone
- Examples: Sofa, dining chair, office chair, side table

---

## Responsive Considerations

**Desktop (1920px+)**: Full three-panel layout with all tools visible
**Laptop (1280-1920px)**: Narrower sidebars, canvas adjusts fluidly
**Tablet (768-1279px)**: Collapsible sidebars, floating action buttons to reveal panels
**Mobile (<768px)**: 
- Full-screen canvas
- Bottom navigation bar with tool icons
- Slide-up drawers for color palette and properties
- Simplified single-column workflow

---

## Special Features

### Real-time Collaboration Indicator (Future)
- Small avatar badges showing who else is viewing the project
- Live cursor positions with user names

### Before/After Comparison
- Slider handle to drag between original and customized
- OR: Side-by-side view with sync pan/zoom
- "Flicker" mode: Click to toggle rapidly between views

### Color Matching Assistant
- "Upload reference image" to extract colors not in palette
- AI suggestion: "This color is closest to SS13 - Champagne"

---

## Accessibility

- All interactive elements minimum 44px touch target
- Color swatches include tooltips with full color names and codes
- Keyboard navigation throughout all panels
- Focus indicators on all controls
- Alt text for all example images
- ARIA labels for canvas tools and region selections

---

## Professional Polish

- Subtle drop shadows on floating panels (shadow-lg)
- Smooth transitions on all interactive elements (transition-all duration-200)
- Micro-interactions: Button press states, color swatch hover effects
- Consistent rounded corners throughout (rounded-lg for cards, rounded-md for inputs)
- Professional iconography from Heroicons (outline style for inactive, solid for active)

This design creates a professional, efficient workspace that balances the complexity of 50+ color options with an intuitive, visually organized interface suitable for furniture industry professionals and end customers alike.