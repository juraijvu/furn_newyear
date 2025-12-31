# Professional Furniture Customizer - Masked Inpainting Workflow

## Overview

This application implements a professional-grade furniture customization system using advanced AI models for precise color and material changes without bleeding or artifacts. The system uses a two-step workflow: **Segmentation** → **Inpainting**.

## Professional Workflow Architecture

### Step 1: Precision Segmentation
- **Manual Mode**: Uses `meta/sam-2` for point-based segmentation when user clicks on furniture parts
- **Auto Mode**: Uses `schananas/grounded_sam` for automatic furniture part detection
- **Output**: High-precision black and white masks with exact furniture part boundaries

### Step 2: Professional Inpainting
- **Model**: `black-forest-labs/flux-fill-pro` - World's best inpainting model
- **Features**: Maintains original lighting, shadows, and realistic material transitions
- **Settings**: 
  - `mask_blur: 0-1` (prevents color bleeding)
  - `prompt_strength: 0.4-0.6` (preserves furniture shape)
  - `num_inference_steps: 28` (high quality)

## AI Model Stack

| Step | Model | Purpose | Why It's Superior |
|------|-------|---------|-------------------|
| **Segmentation** | `meta/sam-2` | Point-based precision | Identifies exact edges, prevents bleeding |
| **Auto-Detection** | `schananas/grounded_sam` | Automatic part detection | Recognizes furniture semantics |
| **Inpainting** | `black-forest-labs/flux-fill-pro` | Material application | Maintains 100% realistic lighting/shadows |

## Intelligent Prompting Engine

The system automatically generates professional prompts based on:

### Material Types
- `leather` → "premium leather texture"
- `fabric` → "high-end textile weave"  
- `velvet` → "luxurious velvet upholstery"
- `wood` → "natural wood grain"
- `metal` → "brushed metal finish"

### Furniture Parts
- `cushion` → "sofa cushion"
- `seat` → "chair seat"
- `backrest` → "chair backrest"
- `armrest` → "chair armrest"
- `leg` → "furniture leg"

### Generated Prompt Structure
```
Photorealistic [Material] texture on [Furniture Part], [Color], high-end textile weave, professional product photography, 8k resolution, maintaining original lighting and shadows, seamless material transition, no color bleeding, precise edges
```

## API Endpoints

### `/api/segment-professional`
**Purpose**: High-precision furniture part segmentation
```json
{
  "imageUrl": "string",
  "clickX": "number (optional)",
  "clickY": "number (optional)", 
  "autoSegment": "boolean",
  "furniturePart": "string"
}
```

### `/api/inpaint-professional`
**Purpose**: Professional material application using FLUX Fill Pro
```json
{
  "imageUrl": "string",
  "maskUrl": "string",
  "color": "string (hex)",
  "material": "string",
  "furniturePart": "string",
  "promptStrength": "number (0.4-0.6)",
  "maskBlur": "number (0-1)"
}
```

### `/api/professional-recolor`
**Purpose**: Complete workflow (segment + inpaint) in one call
```json
{
  "imageUrl": "string",
  "clickX": "number (optional)",
  "clickY": "number (optional)",
  "color": "string (hex)",
  "material": "string",
  "furniturePart": "string",
  "autoSegment": "boolean"
}
```

## Frontend Features

### ProfessionalCanvasWorkspace Component
- **Click-to-Select**: Users click on furniture parts for precise selection
- **Material Selection**: Dropdown with premium material options
- **Part Selection**: Dropdown with furniture part types
- **Auto-Detection**: One-click automatic furniture part detection
- **Real-time Preview**: Shows processing steps and results
- **Professional Controls**: Zoom, reset, download functionality

### Key Features
- **No Color Bleeding**: Precise mask boundaries prevent color spreading
- **Realistic Materials**: Professional texture application
- **Lighting Preservation**: Maintains original shadows and highlights
- **Shape Integrity**: Furniture structure remains unchanged
- **Professional Quality**: 8K resolution output

## Database Schema

### segmentation_masks
Stores AI-detected furniture parts with material context:
```sql
- id: Primary key
- imageId: Reference to uploaded image
- clickX, clickY: User click coordinates
- maskData: Mask URL or base64 data
- partLabel: Detected part name
- material: Selected material type
- furniturePart: Furniture part category
```

### professional_results
Tracks complete inpainting results:
```sql
- id: Primary key
- projectId: Project reference
- maskId: Mask reference
- originalImageUrl: Source image
- maskUrl: Segmentation mask
- resultUrl: Final inpainted result
- prompt: Generated AI prompt
- material, furniturePart, color: Settings used
- promptStrength, maskBlur: Technical parameters
- processingTimeMs: Performance metrics
```

## Technical Advantages

### vs. Basic Image-to-Image
- **Precision**: Targets exact furniture parts vs. guessing
- **No Bleeding**: Mask boundaries prevent color spreading to floors/walls
- **Realistic**: Maintains original lighting and shadows
- **Professional**: Uses world's best inpainting model

### vs. Simple Color Overlay
- **Material Textures**: Applies realistic fabric/leather/wood textures
- **Lighting Integration**: Respects original lighting conditions
- **Shadow Preservation**: Maintains natural shadows and highlights
- **Professional Quality**: 8K resolution with seamless transitions

## Usage Instructions

1. **Upload Image**: Upload furniture photo or select example
2. **Select Material**: Choose from premium material options
3. **Select Part Type**: Specify furniture part category
4. **Choose Color**: Pick desired color from palette
5. **Click to Select**: Click on furniture part for precision targeting
6. **Auto-Detect**: Or use auto-detection for multiple parts
7. **Download Result**: Get professional-quality customized image

## Performance Optimization

- **Efficient Workflow**: Combined segmentation + inpainting in single API call
- **Smart Caching**: Reuses masks for multiple color applications
- **Progress Tracking**: Real-time processing status updates
- **Error Handling**: Graceful fallbacks and user feedback

## Environment Variables

```env
DATABASE_URL=postgres://user:pass@localhost:5432/furniture_db
REPLICATE_API_TOKEN=your_replicate_token
```

## Installation & Setup

```bash
# Install dependencies
npm install

# Setup database
npm run db:push

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000` with professional furniture customization capabilities.