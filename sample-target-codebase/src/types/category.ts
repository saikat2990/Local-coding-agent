export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface CreateCategoryInput {
  name: string;
  description: string;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;