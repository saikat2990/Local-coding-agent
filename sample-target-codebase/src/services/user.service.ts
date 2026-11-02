// Business logic. Services know nothing about HTTP (no req/res here).
import * as userRepository from '../repositories/user.repository';
import { conflictError, notFoundError } from '../utils/AppError';
import type { CreateUserInput, UpdateUserInput, User } from '../types/user';

function pickUserFields(input: UpdateUserInput): UpdateUserInput {
  const data: UpdateUserInput = {};
  if (input.name !== undefined) data.name = input.name.trim();
  if (input.email !== undefined) data.email = input.email.trim().toLowerCase();
  return data;
}

export async function listUsers(): Promise<User[]> {
  return userRepository.findAll();
}

export async function getUser(id: string): Promise<User> {
  const user = userRepository.findById(id);
  if (!user) throw notFoundError(`User ${id} not found`);
  return user;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const data = pickUserFields(input) as CreateUserInput;
  if (userRepository.findByEmail(data.email)) {
    throw conflictError('Email already in use');
  }
  return userRepository.create(data);
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<User> {
  await getUser(id);
  const data = pickUserFields(input);
  if (data.email) {
    const owner = userRepository.findByEmail(data.email);
    if (owner && owner.id !== id) throw conflictError('Email already in use');
  }
  return userRepository.update(id, data) as User;
}

export async function deleteUser(id: string): Promise<void> {
  await getUser(id);
  userRepository.remove(id);
}
