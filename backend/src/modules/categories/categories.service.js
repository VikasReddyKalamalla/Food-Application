import crypto from 'node:crypto';

/**
 * Categories Service (Phase 1 Foundation Scaffold)
 * Ready for Phase 2 Mongoose Category Schema integration
 */
export class CategoriesService {
  constructor() {
    this.categories = new Map();
  }

  async listCategories() {
    return Array.from(this.categories.values());
  }

  async createCategory(data) {
    const id = crypto.randomUUID();
    const category = {
      id,
      name: data.name,
      slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      imageUrl: data.imageUrl || null,
      isActive: true,
      createdAt: new Date(),
    };
    this.categories.set(id, category);
    return category;
  }
}

export const categoriesService = new CategoriesService();
export default categoriesService;
