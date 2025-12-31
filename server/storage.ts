// Storage interface for future extensibility
// Currently using database directly via Drizzle ORM

export interface IStorage {
  // Add storage methods here if needed
}

export class MemStorage implements IStorage {
  constructor() {
    // Initialize storage if needed
  }
}

export const storage = new MemStorage();
