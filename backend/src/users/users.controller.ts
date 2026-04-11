import { Controller, Post, Body, Get, UseGuards, Req, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

 
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req) {
    const user = await this.usersService.findById(req.user.id);
    return user;
  }
@Get()
async findAll(
  @Query('skip') skip: number = 0, 
  @Query('take') take: number = 10
) {
  return this.usersService.getUsers({
    skip,
    take,
    order: { created_at: 'DESC' }
  });
}

}