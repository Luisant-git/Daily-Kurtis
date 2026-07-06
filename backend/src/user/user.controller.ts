import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
 
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
 
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
 
  @Get()
  findAll() {
    return this.userService.findAll();
  }
 
  @UseGuards(JwtAuthGuard)
  @Get('profile/me')
  async getProfile(@Request() req) {
    return this.userService.findOne(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(req.user.id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/address')
  async updateAddress(@Request() req, @Body() body: UpdateAddressDto) {
    const shippingAddress = {
      name: body?.name ?? body?.fullName,
      addressLine: body?.addressLine ?? body?.addressLine1,
      landmark: body?.landmark,
      city: body?.city,
      state: body?.state,
      pincode: body?.pincode,
      mobile: body?.mobile,
    };
    return this.userService.updateAddress(req.user.id, shippingAddress);
  }
 
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }
 
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }
 
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}