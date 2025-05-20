import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { UserModel } from '../models/user.model';
import { UserView } from '../views/user.view';

@Controller('users')
export class UserController {
  constructor(
    private readonly userModel: UserModel,
    private readonly userView: UserView,
  ) {}

  @Get()
  getUsers() {
    const users = this.userModel.findAll();
    return this.userView.transformUsers(users);
  }

  @Get(':id')
  getUserById(@Param('id') id: string) {
    const user = this.userModel.findById(+id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.userView.transformUser(user);
  }

  @Post()
  createUser(@Body() userData: { username: string; email: string }) {
    const newUser = this.userModel.create(userData);
    return this.userView.transformUser(newUser);
  }
} 