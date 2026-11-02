// HTTP layer: translate req -> service call -> res. Keep logic out of here.
import type { Request, Response } from 'express';
import * as userService from '../services/user.service';

type IdParams = { id: string };

export async function list(_req: Request, res: Response): Promise<void> {
  const users = await userService.listUsers();
  res.json({ data: users });
}

export async function getById(req: Request<IdParams>, res: Response): Promise<void> {
  const user = await userService.getUser(req.params.id);
  res.json({ data: user });
}

export async function create(req: Request, res: Response): Promise<void> {
  const user = await userService.createUser(req.body);
  res.status(201).json({ data: user });
}

export async function update(req: Request<IdParams>, res: Response): Promise<void> {
  const user = await userService.updateUser(req.params.id, req.body);
  res.json({ data: user });
}

export async function remove(req: Request<IdParams>, res: Response): Promise<void> {
  await userService.deleteUser(req.params.id);
  res.status(204).end();
}
