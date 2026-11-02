// HTTP layer for products: req -> service -> res.
import type { Request, Response } from 'express';
import * as productService from '../services/product.service';

type IdParams = { id: string };

export async function list(req: Request, res: Response): Promise<void> {
  const inStock = req.query.inStock === 'true';
  const products = await productService.listProducts({ inStock });
  res.json({ data: products });
}

export async function getById(req: Request<IdParams>, res: Response): Promise<void> {
  const product = await productService.getProduct(req.params.id);
  res.json({ data: product });
}

export async function create(req: Request, res: Response): Promise<void> {
  const product = await productService.createProduct(req.body);
  res.status(201).json({ data: product });
}

export async function update(req: Request<IdParams>, res: Response): Promise<void> {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.json({ data: product });
}

export async function remove(req: Request<IdParams>, res: Response): Promise<void> {
  await productService.deleteProduct(req.params.id);
  res.status(204).end();
}
