import type { User } from '@prisma/client';

interface CreateUserData {
  email: string;
  wallet: string;
  username?: string;
}

export async function createUser(data: CreateUserData): Promise<User> {
  try {
    const response = await fetch('/api/auth/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }

    const result = await response.json();
    return result.user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const response = await fetch(
      `/api/auth/user?email=${encodeURIComponent(email)}`,
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    const result = await response.json();
    return result.user; // API now returns { user: null } when not found
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

export async function getUserByWallet(wallet: string): Promise<User | null> {
  try {
    const response = await fetch(
      `/api/auth/user?wallet=${encodeURIComponent(wallet)}`,
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    const result = await response.json();
    return result.user; // API now returns { user: null } when not found
  } catch (error) {
    console.error('Error getting user by wallet:', error);
    return null;
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const response = await fetch(`/api/auth/user?id=${encodeURIComponent(id)}`);

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    const result = await response.json();
    return result.user; // API now returns { user: null } when not found
  } catch (error) {
    console.error('Error getting user by id:', error);
    return null;
  }
}

export async function updateUser(
  id: string,
  data: Partial<User>,
): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/user', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...data }),
    });

    if (!response.ok) {
      throw new Error('Failed to update user');
    }

    const result = await response.json();
    return result.user;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}
