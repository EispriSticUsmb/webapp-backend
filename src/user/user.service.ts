import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { hash, verify } from 'argon2';
import { PrismaService } from 'src/prisma.service';
import { PaginationQueryDto } from 'src/share/dto/pagination-query.dto';
import { PartialUserDto } from 'src/share/dto/user.dto';
import { UserPayload } from 'src/types/user-payload.type';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async role(user: UserPayload | null, userId: string) {
    if (!user) return 'GUEST';
    if (await this.isAdmin(user.userId)) {
      return 'ADMIN';
    } else {
      if (user.userId === userId) {
        return 'SELF';
      } else {
        return 'USER';
      }
    }
  }
  async isAdmin(userId: string): Promise<boolean> {
    if (!userId) return false;
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) return false;
    return user?.role === 'ADMIN';
  }
  async getUsers(pagination: PaginationQueryDto) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    const users = await this.prisma.user.findMany({
      skip: skip,
      take: limit,
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        role: true,
        hasVerifiedEmail: true,
        userType: true,
        createdAt: true,
        updatedAt: true,
        participations: true,
        ledTeams: true,
        notifications: true,
        sentNotifications: true,
        receivedInvitations: true,
        sentInvitations: true,
      },
    });
    return users;
  }
  async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        password: false,
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        role: true,
        hasVerifiedEmail: true,
        userType: true,
        createdAt: true,
        updatedAt: true,
        participations: true,
        ledTeams: true,
        notifications: true,
        sentNotifications: true,
        receivedInvitations: true,
        sentInvitations: true,
      },
    });
    return user;
  }

  async getUserByIdentifier(identifier: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
      select: {
        password: false,
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        role: true,
        hasVerifiedEmail: true,
        userType: true,
        createdAt: true,
        updatedAt: true,
        participations: true,
        ledTeams: true,
        notifications: true,
        sentNotifications: true,
        receivedInvitations: true,
        sentInvitations: true,
      },
    });
    return user;
  }

  async updateUser(id: string, data: PartialUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé !');

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        password: false,
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        role: true,
        hasVerifiedEmail: true,
        userType: true,
        createdAt: true,
        updatedAt: true,
        participations: true,
        ledTeams: true,
        notifications: true,
        sentNotifications: true,
        receivedInvitations: true,
        sentInvitations: true,
      },
    });

    if (!updated)
      throw new InternalServerErrorException('Erreur lors de la mise à jour !');

    return updated;
  }
  async getUserLite(userId: string) {
    const users = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        username: true,
        profileImage: true,
        userType: true,
        password: false,
        id: true,
        email: false,
        firstName: false,
        lastName: false,
        role: false,
        hasVerifiedEmail: false,
        createdAt: false,
        updatedAt: false,
        participations: false,
        ledTeams: false,
        notifications: false,
        sentNotifications: false,
        receivedInvitations: false,
        sentInvitations: false,
      },
    });
    return users;
  }
  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return await this.prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }

  async getUserNotifications(userId: string) {
    return await this.prisma.notification.findMany({
      where: {
        userId,
      },
    });
  }

  async ValidUserPassword(userId: string, password: string): Promise<boolean> {
    const hashPassword = (
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          password: true,
        },
      })
    )?.password;
    if (hashPassword) {
      return await verify(hashPassword, password);
    } else {
      return false;
    }
  }

  async getUsersEvent(userId: string) {
    return (await this.getUser(userId))?.participations;
  }

  async getUsersNotif(userId: string) {
    return (await this.getUser(userId))?.notifications;
  }

  async getUsersReceivedInvitations(userId: string) {
    return (await this.getUser(userId))?.receivedInvitations;
  }

  private async hashPassword(password: string): Promise<string> {
    const hashedpassword = await hash(password);
    return hashedpassword;
  }

  async changeUserPassword(userId: string, newPassword: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: await this.hashPassword(newPassword),
      },
    });
  }

  async setUserAdminRole(userId: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: 'ADMIN',
      },
    });
  }

  async setUserMemberRole(userId: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: 'MEMBRE',
      },
    });
  }

  async setUserUserRole(userId: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: 'USER',
      },
    });
  }
}
