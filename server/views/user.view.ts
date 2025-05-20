import { Injectable } from '@nestjs/common';
import { User } from '../models/user.model';

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  displayName: string;
}

@Injectable()
export class UserView {
  transformUser(user: User): UserResponse {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: `User: ${user.username}`,
    };
  }

  transformUsers(users: User[]): UserResponse[] {
    return users.map(user => this.transformUser(user));
  }
} 