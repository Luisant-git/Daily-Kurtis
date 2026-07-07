import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  create(createProductDto: CreateProductDto) {
    const sanitizedData = this.sanitizeProductData(createProductDto);
    return this.prisma.product.create({
      data: {
        ...sanitizedData,
        gallery: (sanitizedData.gallery || []) as any,
        colors: (sanitizedData.colors || []) as any,
      },
    });
  }

  findAll() {
    return this.prisma.product.findMany({
      include: {
        category: true,
        subCategory: true,
        brand: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findAllActive() {
    return this.prisma.product.findMany({
      where: {
        status: 'active',
      },
      include: {
        category: true,
        subCategory: true,
        brand: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        subCategory: true,
        brand: true,
      },
    });
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    const { id: _, createdAt, updatedAt, category, subCategory, brand, ...data } = updateProductDto as any;
    const sanitized = this.sanitizeProductData(data);
    return this.prisma.product.update({
      where: { id },
      data: {
        ...sanitized,
        gallery: (sanitized.gallery || []) as any,
        colors: (sanitized.colors || []) as any,
      },
    });
  }

  private sanitizeProductData(data: any) {
    const result = { ...data };
    // Filter out empty arrays/objects from gallery
    if (result.gallery && Array.isArray(result.gallery)) {
      result.gallery = result.gallery.filter(
        (item: any) => item && typeof item === 'object' && !Array.isArray(item) && item.url
      );
    }
    // Filter out invalid entries from colors
    if (result.colors && Array.isArray(result.colors)) {
      result.colors = result.colors.filter(
        (item: any) => item && typeof item === 'object' && !Array.isArray(item) && item.name
      );
    }
    // Filter out invalid sizes
    if (result.colors) {
      result.colors = result.colors.map((color: any) => ({
        ...color,
        sizes: (color.sizes || []).filter(
          (s: any) => s && typeof s === 'object' && !Array.isArray(s) && s.size
        ),
      }));
    }
    return result;
  }

  remove(id: number) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  updateBundleOffers(id: number, bundleOffers: any[]) {
    return this.prisma.product.update({
      where: { id },
      data: { bundleOffers },
    });
  }

  async calculatePrice(id: number, selectedColors: string[]) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const colorCount = selectedColors.length;
    const bundleOffer = (product.bundleOffers as any[])?.find(
      offer => offer.colorCount === colorCount
    );
    
    const price = bundleOffer ? bundleOffer.price : product.basePrice;

    return {
      colorCount,
      price,
      selectedColors,
      availableColors: product.colors
    };
  }

  async search(query: string) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const products = await this.prisma.product.findMany({
      where: {
        status: 'active',
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { tags: { has: query.toLowerCase() } },
        ],
      },
      include: { category: true, subCategory: true, brand: true },
      take: 10,
    });

    return products.map(product => {
      const firstColor = product.colors[0] as any;
      const firstSize = firstColor?.sizes?.[0];
      const firstGallery = product.gallery[0] as any;
      return {
        id: product.id,
        name: product.name,
        price: firstSize?.price || product.basePrice,
        image: firstColor?.image || firstGallery?.url,
      };
    });
  }
}