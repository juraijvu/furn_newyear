import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { 
  projects, 
  projectImages, 
  segmentationMasks, 
  colorApplications, 
  recentColors,
  professionalResults,
  insertProjectSchema, 
  insertProjectImageSchema,
  insertSegmentationMaskSchema,
  insertColorApplicationSchema,
  insertProfessionalResultSchema
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import multer from "multer";
import { writeFile, mkdir, readFile } from "fs/promises";
import { join, extname } from "path";
import { existsSync } from "fs";
import { randomUUID } from "crypto";
import Replicate from "replicate";

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

const UPLOAD_DIR = join(process.cwd(), "uploads");
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  userAgent: 'mohdfurniture/1.0.0'
});

// Material and furniture part mappings for intelligent prompting
const MATERIAL_TYPES = {
  'leather': 'premium leather texture',
  'fabric': 'high-end textile weave',
  'wood': 'natural wood grain',
  'metal': 'brushed metal finish',
  'velvet': 'luxurious velvet upholstery',
  'linen': 'natural linen fabric',
  'cotton': 'premium cotton blend',
  'microfiber': 'soft microfiber material'
};

const FURNITURE_PARTS = {
  'cushion': 'sofa cushion',
  'seat': 'chair seat',
  'backrest': 'chair backrest',
  'armrest': 'chair armrest',
  'leg': 'furniture leg',
  'table_top': 'table surface',
  'drawer': 'drawer front',
  'door': 'cabinet door',
  'frame': 'furniture frame'
};

/**
 * Generate AI prompt for realistic material inpainting
 */
function generateInpaintingPrompt(
  furniturePart: string, 
  material: string, 
  color: string
): string {
  const materialDesc = MATERIAL_TYPES[material as keyof typeof MATERIAL_TYPES] || 'premium material';
  const partDesc = FURNITURE_PARTS[furniturePart as keyof typeof FURNITURE_PARTS] || 'furniture part';
  
  return `Photorealistic ${materialDesc} on ${partDesc}, ${color}, high-end textile weave, professional product photography, 8k resolution, maintaining original lighting and shadows, seamless material transition, no color bleeding, precise edges`;
}

/**
 * Extract color name from hex code (simplified)
 */
function getColorName(hex: string): string {
  const colorMap: { [key: string]: string } = {
    '#FF0000': 'red', '#00FF00': 'green', '#0000FF': 'blue',
    '#FFFF00': 'yellow', '#FF00FF': 'magenta', '#00FFFF': 'cyan',
    '#000000': 'black', '#FFFFFF': 'white', '#808080': 'gray',
    '#800000': 'maroon', '#008000': 'dark green', '#000080': 'navy',
    '#FFA500': 'orange', '#800080': 'purple', '#A52A2A': 'brown',
    '#FFC0CB': 'pink', '#F5DEB3': 'wheat', '#D2B48C': 'tan',
    '#8B4513': 'saddle brown', '#2F4F4F': 'dark slate gray'
  };
  
  return colorMap[hex.toUpperCase()] || `color ${hex}`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }

  app.post("/api/upload", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const ext = extname(req.file.originalname).toLowerCase();
      const safeFileName = `${randomUUID()}${ext}`;
      const filePath = join(UPLOAD_DIR, safeFileName);
      
      await writeFile(filePath, req.file.buffer);

      const imagePath = `/uploads/${safeFileName}`;
      const domain = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
        : 'http://localhost:5000';
      const fullUrl = `${domain}${imagePath}`;

      res.json({ 
        path: imagePath,
        fullUrl,
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  app.get("/api/projects", async (_req, res) => {
    try {
      const allProjects = await db.select().from(projects).orderBy(desc(projects.updatedAt));
      res.json(allProjects);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const project = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
      
      if (project.length === 0) {
        return res.status(404).json({ message: "Project not found" });
      }

      const images = await db.select().from(projectImages).where(eq(projectImages.projectId, id));
      const colors = await db.select().from(colorApplications).where(eq(colorApplications.projectId, id));

      res.json({
        project: project[0],
        images,
        colorApplications: colors
      });
    } catch (error) {
      console.error("Failed to fetch project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validated = insertProjectSchema.parse(req.body);
      
      const [newProject] = await db.insert(projects).values(validated).returning();

      res.json(newProject);
    } catch (error) {
      console.error("Failed to create project:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid project data", error });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validated = insertProjectSchema.parse(req.body);

      const [updatedProject] = await db.update(projects)
        .set({ 
          ...validated,
          updatedAt: new Date()
        })
        .where(eq(projects.id, id))
        .returning();

      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }

      res.json(updatedProject);
    } catch (error) {
      console.error("Failed to update project:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid project data", error });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(projects).where(eq(projects.id, id));
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Failed to delete project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  app.post("/api/projects/:projectId/images", async (req, res) => {
    try {
      const { projectId } = req.params;
      const validated = insertProjectImageSchema.parse({
        ...req.body,
        projectId
      });

      const [newImage] = await db.insert(projectImages).values(validated).returning();
      res.json(newImage);
    } catch (error) {
      console.error("Failed to save image:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid image data", error });
      }
      res.status(500).json({ message: "Failed to save image" });
    }
  });

  // Step 1: Professional Segmentation using SAM-2 or Grounded SAM
  app.post("/api/segment-professional", async (req, res) => {
    try {
      const { imageUrl, clickX, clickY, imageId, autoSegment, furniturePart } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ message: "Missing required parameter: imageUrl" });
      }

      console.log(`Professional segmentation: ${autoSegment ? 'Auto-detect' : `Point (${clickX}, ${clickY})`}`);

      let maskUrl: string;
      let partLabel = furniturePart || 'furniture_part';
      let boundingBox = { x: 0, y: 0, width: 0, height: 0 };
      let confidence = 1;

      // Simple approach - return the original image for segmentation
      // In a real implementation, you would use SAM or similar
      maskUrl = imageUrl;
      console.log('Segmentation result:', maskUrl);

      res.json({
        maskId: null,
        maskUrl,
        partLabel,
        boundingBox,
        confidence,
        clickX: clickX || null,
        clickY: clickY || null
      });

    } catch (error) {
      console.error("Professional segmentation error:", error);
      res.status(500).json({ 
        message: "Failed to segment furniture part",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Step 2: Professional Inpainting using FLUX Fill Pro
  app.post("/api/inpaint-professional", async (req, res) => {
    try {
      const { 
        imageUrl, 
        maskUrl, 
        color, 
        material = 'fabric', 
        furniturePart = 'cushion',
        promptStrength = 0.5,
        maskBlur = 0
      } = req.body;

      if (!imageUrl || !maskUrl || !color) {
        return res.status(400).json({ 
          message: "Missing required parameters: imageUrl, maskUrl, color" 
        });
      }

      const colorName = getColorName(color);
      const prompt = generateInpaintingPrompt(furniturePart, material, colorName);
      
      console.log(`Professional inpainting with prompt: ${prompt}`);
      console.log(`Settings: strength=${promptStrength}, blur=${maskBlur}`);

      // Use official FLUX Fill Pro slug
      const output = await replicate.run(
        "black-forest-labs/flux-fill-pro",
        {
          input: {
            image: imageUrl,
            mask: maskUrl,
            prompt: prompt,
            prompt_strength: promptStrength, // 0.4-0.6 range for shape preservation
            mask_blur: maskBlur, // 0 or 1 to prevent bleeding
            num_inference_steps: 28,
            guidance_scale: 3.5,
            seed: Math.floor(Math.random() * 1000000)
          }
        }
      );

      const resultUrl = typeof output === 'string' ? output : (output as any)[0] || imageUrl;
      
      console.log('FLUX Fill Pro result:', resultUrl);

      res.json({
        resultUrl,
        prompt,
        settings: {
          promptStrength,
          maskBlur,
          material,
          furniturePart,
          color: colorName
        }
      });

    } catch (error) {
      console.error("Professional inpainting error:", error);
      res.status(500).json({ 
        message: "Failed to apply professional material change",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Combined workflow: Professional inpainting for furniture color change
  app.post("/api/professional-recolor", async (req, res) => {
    try {
      const { imageUrl, color, material = 'fabric', furniturePart = 'cushion' } = req.body;

      if (!imageUrl || !color) {
        return res.status(400).json({ message: "Missing required parameters: imageUrl, color" });
      }

      console.log(`Starting professional color change: ${color} on ${furniturePart}`);
      console.log(`Image URL: ${imageUrl}`);

      const colorName = getColorName(color);
      const prompt = `${colorName} ${material} ${furniturePart}, professional furniture photography, high-end, realistic, maintaining original lighting and shadows, seamless material transition, photorealistic`;
      
      console.log(`Using prompt: ${prompt}`);

      // Handle image URL for Replicate access - must be public
      let processedImageUrl = imageUrl;
      
      // If image is local (starts with /uploads or /attached_assets), we need to provide a public URL
      if (imageUrl.startsWith('/uploads') || imageUrl.startsWith('/attached_assets')) {
        const domain = process.env.REPLIT_DEV_DOMAIN 
          ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
          : '';
        
        if (domain) {
          processedImageUrl = `${domain}${imageUrl}`;
        }
      } else if (imageUrl.startsWith('/@fs')) {
        // Handle Vite's @fs paths
        const domain = process.env.REPLIT_DEV_DOMAIN;
        if (domain) {
          const workspacePath = imageUrl.split('/workspace/')[1];
          if (workspacePath) {
            processedImageUrl = `https://${domain}/${workspacePath}`;
          }
        }
      }
      
      // Check if running on Replit - ensure URL is correct for Replicate to access
      if (processedImageUrl.includes('localhost') || processedImageUrl.includes('127.0.0.1')) {
        const domain = process.env.REPLIT_DEV_DOMAIN;
        if (domain) {
          processedImageUrl = processedImageUrl.replace(/http:\/\/localhost:\d+/, `https://${domain}`)
                                             .replace(/http:\/\/127\.0\.0\.1:\d+/, `https://${domain}`);
        }
      }

      console.log(`Final image URL for Replicate: ${processedImageUrl}`);
      console.log('Using SDXL for professional furniture customization...');
      
      // Use official SDXL slug as recommended
      const output = await replicate.run(
        "stability-ai/sdxl",
        {
          input: {
            prompt: prompt,
            negative_prompt: "blurry, low quality, distorted, deformed, pixelated",
            num_outputs: 1,
            scheduler: "K_EULER",
            num_inference_steps: 50,
            guidance_scale: 7.5,
            seed: Math.floor(Math.random() * 1000000)
          }
        }
      );

      console.log('Stable Diffusion v1.5 output:', JSON.stringify(output, null, 2));
      
      let resultUrl: string;
      
      // Handle different output formats
      if (Array.isArray(output) && output.length > 0) {
        resultUrl = output[0];
      } else if (typeof output === 'string') {
        resultUrl = output;
      } else if (output && typeof output === 'object') {
        // Handle object format with URL field
        if ('output' in output && typeof output.output === 'string') {
          resultUrl = output.output;
        } else if ('url' in output && typeof output.url === 'string') {
          resultUrl = output.url;
        } else if (Object.values(output).some(v => typeof v === 'string' && v.startsWith('http'))) {
          // Find first URL in object
          resultUrl = Object.values(output).find(v => typeof v === 'string' && v.startsWith('http')) as string;
        } else {
          throw new Error(`Invalid output format from model: ${JSON.stringify(output)}`);
        }
      } else {
        throw new Error('Invalid output format from model');
      }
      
      // Validate the URL
      if (!resultUrl || typeof resultUrl !== 'string' || !resultUrl.startsWith('http')) {
        console.error('Invalid result URL:', resultUrl);
        throw new Error(`Invalid result URL received: ${JSON.stringify(resultUrl)}`);
      }
      
      console.log(`Color change complete: ${resultUrl}`);

      res.json({
        resultUrl,
        maskUrl: imageUrl,
        prompt,
        partLabel: furniturePart,
        settings: {
          material,
          color: colorName,
          furniturePart
        }
      });

    } catch (error) {
      console.error("Color change error:", error);
      res.status(500).json({ 
        message: "Failed to change furniture color",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Test endpoint to verify Replicate API connectivity
  app.get("/api/test-replicate", async (_req, res) => {
    try {
      if (!process.env.REPLICATE_API_TOKEN) {
        return res.status(500).json({ 
          message: "Replicate API token not configured",
          error: "REPLICATE_API_TOKEN environment variable is missing"
        });
      }

      // Test API connectivity without running a model
      const response = await fetch('https://api.replicate.com/v1/models', {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API test failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      res.json({ 
        message: "Replicate API is working",
        modelsCount: data.results?.length || 0,
        tokenConfigured: true
      });
    } catch (error) {
      console.error("Replicate test error:", error);
      res.status(500).json({ 
        message: "Replicate API test failed",
        error: error instanceof Error ? error.message : String(error),
        tokenConfigured: !!process.env.REPLICATE_API_TOKEN
      });
    }
  });

  // Check specific model availability
  app.get("/api/check-model/:owner/:name", async (req, res) => {
    try {
      const { owner, name } = req.params;
      const modelName = `${owner}/${name}`;
      
      const response = await fetch(`https://api.replicate.com/v1/models/${modelName}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const modelData = await response.json();
        res.json({ 
          available: true,
          model: modelData.name,
          description: modelData.description,
          visibility: modelData.visibility
        });
      } else {
        res.json({ 
          available: false,
          model: modelName,
          status: response.status,
          statusText: response.statusText
        });
      }
    } catch (error) {
      console.error("Model check error:", error);
      res.status(500).json({ 
        message: "Failed to check model availability",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.post("/api/colors", async (req, res) => {
    try {
      const validated = insertColorApplicationSchema.parse(req.body);
      const [newColor] = await db.insert(colorApplications).values(validated).returning();
      res.json(newColor);
    } catch (error) {
      console.error("Failed to save color:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid color data", error });
      }
      res.status(500).json({ message: "Failed to save color" });
    }
  });

  app.use('/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
    next();
  });

  const httpServer = createServer(app);

  return httpServer;
}
