import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from '../profiles/dto/update-profile.dto';

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
  async updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    try {
      const updatedUser = await this.usersService.updateProfile(
        req.user.id,
        dto,
      );
      if (!updatedUser) {
        throw new NotFoundException('User or profile not found');
      }
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }
}
