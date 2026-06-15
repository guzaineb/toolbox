import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/user.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// Exemple d'usage dans un controller :
//
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(UserRole.EXPERT)
// @Get('expert/dashboard')
// getExpertDashboard() { ... }