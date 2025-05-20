import { User } from '../interfaces/user.interface';

// 这里模拟一个实体类
// 在实际应用中，这可能是一个TypeORM实体或Mongoose模型
export class UserEntity implements User {
  id: number;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
} 