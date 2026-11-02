// Product business logic. No req/res here.
import * as productRepository from '../repositories/product.repository';
import { conflictError, notFoundError } from '../utils/AppError';
import type {
  CreateProductInput,
  ListProductsOptions,
  Product,
  UpdateProductInput,
} from '../types/product';

function pickProductFields(input: UpdateProductInput): UpdateProductInput {
  const data: UpdateProductInput = {};
  if (input.name !== undefined) data.name = input.name.trim();
  if (input.price !== undefined) data.price = input.price;
  if (input.stock !== undefined) data.stock = input.stock;
  return data;
}

export async function listProducts({ inStock }: ListProductsOptions = {}): Promise<Product[]> {
  const products = productRepository.findAll();
  if (inStock) return products.filter((product) => product.stock > 0);
  return products;
}

export async function getProduct(id: string): Promise<Product> {
  const product = productRepository.findById(id);
  if (!product) throw notFoundError(`Product ${id} not found`);
  return product;
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const fields = pickProductFields(input);
  const data = { name: fields.name as string, price: fields.price as number, stock: fields.stock ?? 0 };
  if (productRepository.findByName(data.name)) {
    throw conflictError('Product name already in use');
  }
  return productRepository.create(data);
}

export async function updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
  await getProduct(id);
  const data = pickProductFields(input);
  if (data.name) {
    const owner = productRepository.findByName(data.name);
    if (owner && owner.id !== id) throw conflictError('Product name already in use');
  }
  return productRepository.update(id, data) as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  await getProduct(id);
  productRepository.remove(id);
}
