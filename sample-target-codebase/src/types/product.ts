export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  price: number;
  stock?: number;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface ListProductsOptions {
  inStock?: boolean;
}
