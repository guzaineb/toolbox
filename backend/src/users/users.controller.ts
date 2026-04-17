import {
  Controller, Get, Patch, Body, UseGuards, Req, Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: { user: { id: string } }) {
    return this.usersService.findById(req.user.id);
  }


  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Req() req: { user: { id: string } },
    @Body() body: Partial<{
      first_name: string;
      last_name: string;
      phone: string;
      birth_date: Date;
      country: string;
      city: string;
      address: string;
      bio: string;
      linkedin: string;
      preferred_language: string;
    }>,
  ) {
    return this.usersService.updateProfile(req.user.id, body);
  }

  /**
   * GET /users — Admin uniquement
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async findAll(
    @Query('skip') skip = 0,
    @Query('take') take = 10,
  ) {
    return this.usersService.getUsers({
      skip: Number(skip),
      take: Number(take),
      order: { created_at: 'DESC' },
    });
  }
}