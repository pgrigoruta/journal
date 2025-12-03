export interface Category {
  id: string;
  name: string;
  percent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryInput {
  name: string;
  percent: number;
}

export interface UpdateCategoryInput {
  name?: string;
  percent?: number;
}

