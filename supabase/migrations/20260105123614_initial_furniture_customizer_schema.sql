/*
  # Initial Furniture Customizer Schema
  
  Creates the complete database schema for the furniture color customization application.
  
  ## Tables Created
  
  1. **projects** - Main furniture customization projects
     - id (uuid, primary key)
     - name (text) - Project name
     - description (text) - Optional description
     - preview_image_url (text) - Preview thumbnail
     - created_at, updated_at (timestamps)
  
  2. **project_images** - Uploaded furniture images
     - id (uuid, primary key)
     - project_id (uuid, FK to projects)
     - original_image_path (text) - File path
     - mime_type (varchar) - Image type
     - width, height (integers) - Dimensions
     - created_at (timestamp)
  
  3. **segmentation_masks** - AI-detected furniture parts from SAM-2
     - id (uuid, primary key)
     - image_id (uuid, FK to project_images)
     - click_x, click_y (integers) - User click coordinates
     - mask_data (text) - Base64 mask or URL
     - bounding_box (jsonb) - Part boundaries
     - part_label (text) - Semantic label
     - confidence (numeric) - Detection confidence
     - area (integer) - Mask area in pixels
     - material, furniture_part (varchar) - For AI prompting
     - created_at (timestamp)
  
  4. **color_applications** - Applied colors to furniture parts
     - id (uuid, primary key)
     - project_id (uuid, FK to projects)
     - mask_id (uuid, FK to segmentation_masks)
     - fill_hex (varchar) - Color code
     - opacity (numeric) - Transparency
     - blend_mode (varchar) - Blending mode
     - created_at (timestamp)
  
  5. **professional_results** - FLUX Fill Pro inpainting results
     - id (uuid, primary key)
     - project_id, mask_id (uuid, FKs)
     - original_image_url, mask_url, result_url (text)
     - prompt (text) - Generated AI prompt
     - material, furniture_part, color (varchar/text)
     - prompt_strength (numeric) - AI parameter
     - mask_blur (integer) - Processing setting
     - processing_time_ms (integer) - Performance metric
     - created_at (timestamp)
  
  6. **recent_colors** - User's recently used colors
     - id (uuid, primary key)
     - project_id (uuid, optional FK to projects)
     - hex, color_code, color_name (varchar/text)
     - used_at (timestamp)
  
  7. **canvas_states** - Full canvas JSON snapshots
     - id (uuid, primary key)
     - project_id (uuid, unique FK to projects)
     - canvas_json (jsonb) - Fabric.js canvas state
     - zoom (numeric)
     - updated_at (timestamp)
  
  ## Security
  
  - All tables have RLS enabled
  - Public access policies for development (to be restricted in production)
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  preview_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to projects"
  ON projects FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Project images table
CREATE TABLE IF NOT EXISTS project_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  original_image_path TEXT NOT NULL,
  mime_type VARCHAR(32) NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to project_images"
  ON project_images FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Segmentation masks table
CREATE TABLE IF NOT EXISTS segmentation_masks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id UUID NOT NULL REFERENCES project_images(id) ON DELETE CASCADE,
  click_x INTEGER,
  click_y INTEGER,
  mask_data TEXT NOT NULL,
  bounding_box JSONB NOT NULL,
  part_label TEXT,
  confidence NUMERIC,
  area INTEGER,
  material VARCHAR(32) DEFAULT 'fabric',
  furniture_part VARCHAR(32) DEFAULT 'cushion',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE segmentation_masks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to segmentation_masks"
  ON segmentation_masks FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Color applications table
CREATE TABLE IF NOT EXISTS color_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  mask_id UUID NOT NULL REFERENCES segmentation_masks(id) ON DELETE CASCADE,
  fill_hex VARCHAR(7) NOT NULL,
  opacity NUMERIC NOT NULL DEFAULT 0.8,
  blend_mode VARCHAR(16) NOT NULL DEFAULT 'multiply',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE color_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to color_applications"
  ON color_applications FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Professional results table
CREATE TABLE IF NOT EXISTS professional_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  mask_id UUID NOT NULL REFERENCES segmentation_masks(id) ON DELETE CASCADE,
  original_image_url TEXT NOT NULL,
  mask_url TEXT NOT NULL,
  result_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  material VARCHAR(32) NOT NULL,
  furniture_part VARCHAR(32) NOT NULL,
  color VARCHAR(7) NOT NULL,
  prompt_strength NUMERIC NOT NULL DEFAULT 0.5,
  mask_blur INTEGER NOT NULL DEFAULT 0,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE professional_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to professional_results"
  ON professional_results FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Recent colors table
CREATE TABLE IF NOT EXISTS recent_colors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  hex VARCHAR(7) NOT NULL,
  color_code VARCHAR(16),
  color_name TEXT,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE recent_colors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to recent_colors"
  ON recent_colors FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Canvas states table
CREATE TABLE IF NOT EXISTS canvas_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  canvas_json JSONB NOT NULL,
  zoom NUMERIC NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE canvas_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to canvas_states"
  ON canvas_states FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON project_images(project_id);
CREATE INDEX IF NOT EXISTS idx_segmentation_masks_image_id ON segmentation_masks(image_id);
CREATE INDEX IF NOT EXISTS idx_color_applications_project_id ON color_applications(project_id);
CREATE INDEX IF NOT EXISTS idx_color_applications_mask_id ON color_applications(mask_id);
CREATE INDEX IF NOT EXISTS idx_professional_results_project_id ON professional_results(project_id);
CREATE INDEX IF NOT EXISTS idx_recent_colors_project_id ON recent_colors(project_id);
CREATE INDEX IF NOT EXISTS idx_canvas_states_project_id ON canvas_states(project_id);
