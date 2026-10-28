export type UserRole = 'owner' | 'manager' | 'kitchen_chef' | 'waiter';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  restaurantId: string;
  branchId: string;
  avatarUrl?: string;
}

