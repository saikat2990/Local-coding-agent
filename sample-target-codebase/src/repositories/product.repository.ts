// In-memory product store. Replace internals with a real database later.
import { randomUUID } from 'node:crypto';
import type { Product, UpdateProductInput } from '../types/product';

type NewProduct = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

const products = new Map<string, Product>();

export function findAll(): Product[] {
  return Array.from(products.values());
}

export function findById(id: string): Product | null {
  return products.get(id) ?? null;
}

export function findByName(name: string): Product | null {
  const target = name.toLowerCase();
  return findAll().find((product) => product.name.toLowerCase() === target) ?? null;
}

export function create(data: NewProduct): Product {
  const now = new Date().toISOString();
  const product: Product = { id: randomUUID(), ...data, createdAt: now, updatedAt: now };
  products.set(product.id, product);
  return product;
}

export function update(id: string, data: UpdateProductInput): Product | null {
  const existing = products.get(id);
  if (!existing) return null;
  const product: Product = { ...existing, ...data, updatedAt: new Date().toISOString() };
  products.set(id, product);
  return product;
}

export function remove(id: string): boolean {
  return products.delete(id);
}

export function clear(): void {
  products.clear();
}
