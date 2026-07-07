import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async addToWishlist(userId: number, productId: number) {
    return this.prisma.wishlistItem.create({
      data: { userId, productId },
    });
  }

  async removeFromWishlist(userId: number, productId: number) {
    return this.prisma.wishlistItem.deleteMany({
      where: { userId, productId },
    });
  }

async getWishlist(userId: number) {
    const items = await this.prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    
    const productIds = items.map(item => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, status: 'active' },
      include: { category: true, subCategory: true, brand: true },
    });

    return products.map(product => {
      const colors = (product.colors || []) as any[];
      const gallery = (product.gallery || []) as any[];
      
      return {
        id: product.id,
        name: product.name,
        slug: product.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + product.id,
        description: product.description || '',
        category: product.category,
        fabric: '',
        occasion: '',
        basePrice: product.basePrice,
        mrp: product.mrp,
        newArrivals: product.newArrivals,
        status: product.status,
        colors,
        gallery,
      };
    });
  }
}
