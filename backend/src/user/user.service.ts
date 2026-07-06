import { Injectable, NotFoundException } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { PrismaClient } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  private prisma = new PrismaClient();

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async updateAddress(id: number, address: any) {
    await this.findOne(id);

    const shippingAddress = this.normalizeAddress(address);
    return this.prisma.user.update({
      where: { id },
      data: { shippingAddress },
    });
  }

  private normalizeAddress(address: any): Record<string, any> {
    if (!address || typeof address !== 'object' || Array.isArray(address)) {
      return {};
    }

    const normalized = JSON.parse(JSON.stringify(address));
    const plainAddress = typeof normalized === 'object' && normalized !== null ? normalized : {};

    return {
      ...(plainAddress as Record<string, any>),
      name: plainAddress.name ?? plainAddress.fullName ?? '',
      addressLine: plainAddress.addressLine ?? plainAddress.addressLine1 ?? '',
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
