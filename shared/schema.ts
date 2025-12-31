import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Projects table - stores furniture customization projects
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  previewImageUrl: text("preview_image_url"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Project images table - stores uploaded furniture images
export const projectImages = pgTable("project_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  originalImagePath: text("original_image_path").notNull(),
  mimeType: varchar("mime_type", { length: 32 }).notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertProjectImageSchema = createInsertSchema(projectImages).omit({
  id: true,
  createdAt: true,
});

export type InsertProjectImage = z.infer<typeof insertProjectImageSchema>;
export type ProjectImage = typeof projectImages.$inferSelect;

// Segmentation masks table - stores AI-detected furniture parts
export const segmentationMasks = pgTable("segmentation_masks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  imageId: varchar("image_id").notNull().references(() => projectImages.id, { onDelete: 'cascade' }),
  clickX: integer("click_x"),
  clickY: integer("click_y"),
  maskData: text("mask_data").notNull(), // Base64 encoded mask PNG or URL
  boundingBox: jsonb("bounding_box").notNull(), // {x, y, width, height}
  partLabel: text("part_label"), // Semantic label from SAM (e.g., "chair leg", "cushion")
  confidence: numeric("confidence"), // Quality/stability score from SAM
  area: integer("area"), // Mask area in pixels
  material: varchar("material", { length: 32 }).default('fabric'), // Material type for prompting
  furniturePart: varchar("furniture_part", { length: 32 }).default('cushion'), // Part type for prompting
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertSegmentationMaskSchema = createInsertSchema(segmentationMasks).omit({
  id: true,
  createdAt: true,
});

export type InsertSegmentationMask = z.infer<typeof insertSegmentationMaskSchema>;
export type SegmentationMask = typeof segmentationMasks.$inferSelect;

// Color applications table - stores applied colors to segmented parts
export const colorApplications = pgTable("color_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  maskId: varchar("mask_id").notNull().references(() => segmentationMasks.id, { onDelete: 'cascade' }),
  fillHex: varchar("fill_hex", { length: 7 }).notNull(),
  opacity: numeric("opacity").notNull().default('0.8'),
  blendMode: varchar("blend_mode", { length: 16 }).notNull().default('multiply'),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertColorApplicationSchema = createInsertSchema(colorApplications).omit({
  id: true,
  createdAt: true,
});

export type InsertColorApplication = z.infer<typeof insertColorApplicationSchema>;
export type ColorApplication = typeof colorApplications.$inferSelect;

// Professional inpainting results table - stores FLUX Fill Pro results
export const professionalResults = pgTable("professional_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  maskId: varchar("mask_id").notNull().references(() => segmentationMasks.id, { onDelete: 'cascade' }),
  originalImageUrl: text("original_image_url").notNull(),
  maskUrl: text("mask_url").notNull(),
  resultUrl: text("result_url").notNull(),
  prompt: text("prompt").notNull(), // Generated AI prompt
  material: varchar("material", { length: 32 }).notNull(),
  furniturePart: varchar("furniture_part", { length: 32 }).notNull(),
  color: varchar("color", { length: 7 }).notNull(), // Hex color
  promptStrength: numeric("prompt_strength").notNull().default('0.5'),
  maskBlur: integer("mask_blur").notNull().default('0'),
  processingTimeMs: integer("processing_time_ms"), // Time taken for processing
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertProfessionalResultSchema = createInsertSchema(professionalResults).omit({
  id: true,
  createdAt: true,
});

export type InsertProfessionalResult = z.infer<typeof insertProfessionalResultSchema>;
export type ProfessionalResult = typeof professionalResults.$inferSelect;

// Recent colors table - stores user's recently used colors
export const recentColors = pgTable("recent_colors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id, { onDelete: 'cascade' }),
  hex: varchar("hex", { length: 7 }).notNull(),
  colorCode: varchar("color_code", { length: 16 }),
  colorName: text("color_name"),
  usedAt: timestamp("used_at").notNull().default(sql`now()`),
});

export const insertRecentColorSchema = createInsertSchema(recentColors).omit({
  id: true,
  usedAt: true,
});

export type InsertRecentColor = z.infer<typeof insertRecentColorSchema>;
export type RecentColor = typeof recentColors.$inferSelect;

// Canvas state snapshots - stores full canvas JSON for easy loading
export const canvasStates = pgTable("canvas_states", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }).unique(),
  canvasJson: jsonb("canvas_json").notNull(), // Full Fabric.js canvas serialization
  zoom: numeric("zoom").notNull().default('1'),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertCanvasStateSchema = createInsertSchema(canvasStates).omit({
  id: true,
  updatedAt: true,
});

export type InsertCanvasState = z.infer<typeof insertCanvasStateSchema>;
export type CanvasState = typeof canvasStates.$inferSelect;
