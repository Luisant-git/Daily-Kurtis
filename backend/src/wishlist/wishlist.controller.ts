import { Controller, Post, Get, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post(':productId')
  async addToWishlist(@Request() req, @Param('productId') productId: string) {
    return this.wishlistService.addToWishlist(req.user.userId, parseInt(productId));
  }

  @Delete(':productId')
  async removeFromWishlist(@Request() req, @Param('productId') productId: string) {
    return this.wishlistService.removeFromWishlist(req.user.userId, parseInt(productId));
  }

  @Get()
  async getWishlist(@Request() req) {
    try {
      return await this.wishlistService.getWishlist(req.user.userId);
    } catch (e) {
      require('fs').appendFileSync('error.log', 'Wishlist Error: ' + e.stack + '\n');
      throw e;
    }
  }
}
