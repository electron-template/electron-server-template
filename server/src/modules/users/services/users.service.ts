import { Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from '../models/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';

@Injectable()
export class UsersService {
  // 模拟数据库
  private users: UserEntity[] = [
    new UserEntity({
      id: 1,
      username: 'john',
      email: 'john@example.com',
      password: 'password123',
    }),
    new UserEntity({
      id: 2,
      username: 'jane',
      email: 'jane@example.com',
      password: 'password456',
    }),
  ];

  findAll(): UserEntity[] {
    return this.users;
  }

  findById(id: number): UserEntity {
    const user = this.users.find(user => user.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  create(createUserDto: CreateUserDto): UserEntity {
    const newUser = new UserEntity({
      id: this.users.length + 1,
      ...createUserDto,
    });
    this.users.push(newUser);
    return newUser;
  }

  update(id: number, updateUserDto: UpdateUserDto): UserEntity {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatedUser = {
      ...this.users[userIndex],
      ...updateUserDto,
      updatedAt: new Date(),
    };

    this.users[userIndex] = updatedUser as UserEntity;
    return this.users[userIndex];
  }

  remove(id: number): void {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.users.splice(userIndex, 1);
  }
} 