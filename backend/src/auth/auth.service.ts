import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { WhatsAppService } from './whatsapp.service';
import * as bcrypt from 'bcryptjs';
import { normalizePhone } from '../utils/phone.util';
 
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private whatsappService: WhatsAppService,
  ) {}
 
  async registerUser(email: string, password: string, name?: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, password: hashedPassword, name },
    });
    return this.generateToken(user.id, user.email || '', 'user', user.phone || undefined, user.name || undefined);
  }
 
  async loginUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password || !await bcrypt.compare(password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateToken(user.id, user.email || '', 'user', user.phone || undefined, user.name || undefined);
  }
 
  async registerAdmin(email: string, password: string, name?: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await this.prisma.admin.create({
      data: { email, password: hashedPassword, name },
    });
    return this.generateToken(admin.id, admin.email, 'admin');
  }
 
  async loginAdmin(email: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin || !await bcrypt.compare(password, admin.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateToken(admin.id, admin.email, 'admin');
  }
 
  private generateToken(id: number, email: string, role: string, phone?: string, name?: string) {
    const payload = { sub: id, email: email && email.includes('@') ? email : null, phone, name, role };
    return { access_token: this.jwtService.sign(payload) };
  }
 
  async requestOtp(rawPhone: string) {
    const phone = normalizePhone(rawPhone);
    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  
    await this.prisma.otp.deleteMany({ where: { phone, verified: false } });
    await this.prisma.otp.create({ data: { phone, otp, expiresAt } });
  
    const sent = await this.whatsappService.sendOtp(phone, otp);
    if (!sent) throw new BadRequestException('Failed to send OTP');
  
    const existingUser = await this.prisma.user.findUnique({ where: { phone } });
    return { message: 'OTP sent successfully', isNewUser: !existingUser };
  }
  
  async verifyOtp(rawPhone: string, otp: string) {
    const phone = normalizePhone(rawPhone);
    const otpRecord = await this.prisma.otp.findFirst({
      where: { 
        phone, 
        verified: false 
      },
      orderBy: { createdAt: 'desc' }
    });
  
    const isValidOtp = otpRecord && otpRecord.otp === otp;
    
    if (!isValidOtp) throw new UnauthorizedException('Invalid OTP');
    
    if (otpRecord.expiresAt < new Date()) throw new UnauthorizedException('OTP expired');
    await this.prisma.otp.update({ where: { id: otpRecord.id }, data: { verified: true } });
  
    // Check if user exists
    let user = await this.prisma.user.findUnique({ where: { phone } });
    const isNewUser = !user;
    
    // Generate token for both new and existing users
    const token = this.generateToken(user?.id || 0, user?.email || '', 'user', phone, user?.name || undefined);
    
    return {
      ...token,
      isNewUser,
      user: user || null
    };
  }
  
  async completeRegistration(phone: string, name?: string, email?: string) {
    let user = await this.prisma.user.findUnique({ where: { phone } });
    
    if (user) {
      // User already exists, just update if new info provided
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (Object.keys(updateData).length > 0) {
        user = await this.prisma.user.update({ where: { id: user.id }, data: updateData });
      }
    } else {
      // Create new user
      user = await this.prisma.user.create({ 
        data: { 
          phone, 
          name: name || undefined, 
          email: email || undefined 
        } 
      });
    }
    
    const token = this.generateToken(user.id, user.email || '', 'user', user.phone || undefined, user.name || undefined);
    return {
      ...token,
      user
    };
  }
}