// Data access layer. This in-memory store keeps the template dependency-free;
// swap the internals for a real database without touching services.
import { randomUUID } from 'node:crypto';
import type { CreateUserInput, UpdateUserInput, User } from '../types/user';

const users = new Map<string, User>();

export function findAll(): User[] {
  return Array.from(users.values());
}

export function findById(id: string): User | null {
  return users.get(id) ?? null;
}

export function findByEmail(email: string): User | null {
  return findAll().find((user) => user.email === email) ?? null;
}

export function create(data: CreateUserInput): User {
  const now = new Date().toISOString();
  const user: User = { id: randomUUID(), ...data, createdAt: now, updatedAt: now };
  users.set(user.id, user);
  return user;
}

export function update(id: string, data: UpdateUserInput): User | null {
  const existing = users.get(id);
  if (!existing) return null;
  const user: User = { ...existing, ...data, updatedAt: new Date().toISOString() };
  users.set(id, user);
  return user;
}

export function remove(id: string): boolean {
  return users.delete(id);
}

export function clear(): void {
  users.clear();
}
