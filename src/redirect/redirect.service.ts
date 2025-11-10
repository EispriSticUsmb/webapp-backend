import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class RedirectService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllRed() {
    return await this.prisma.redirect.findMany();
  }

  async createRed(name: string, target: string) {
    return await this.prisma.redirect.create({
      data: {
        name,
        target,
      },
    });
  }

  async getRed(name: string): Promise<string | undefined> {
    const red = await this.prisma.redirect.findUnique({
      where: {
        name,
      },
    });
    return red?.target;
  }

  async updateRed(name: string, target: string) {
    return await this.prisma.redirect.update({
      where: {
        name,
      },
      data: {
        target,
      },
    });
  }

  async deleteRed(name: string) {
    return await this.prisma.redirect.delete({
      where: {
        name,
      },
    });
  }
}
