import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
 
class AuthDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;
 
  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;
 
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  name?: string;
}
 
class TokenResponse {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token!: string;
}
 
class OtpRequestDto {
  @ApiProperty({ example: '919994683263' })
  @IsString()
  @IsNotEmpty()
  phone!: string;
}
 
class OtpVerifyDto {
  @ApiProperty({ example: '919994683263' })
  @IsString()
  @IsNotEmpty()
  phone!: string;
 
  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  otp!: string;
}
 
class CompleteRegistrationDto {
  @ApiProperty({ example: '919994683263' })
  @IsString()
  @IsNotEmpty()
  phone!: string;
 
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  name?: string;
 
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsString()
  @IsOptional()
  email?: string;
}
 
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
 
  @Post('user/register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, type: TokenResponse })
  async registerUser(@Body() { email, password, name }: AuthDto) {
    return this.authService.registerUser(email, password, name);
  }
 
  @Post('user/login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, type: TokenResponse })
  async loginUser(@Body() { email, password }: AuthDto) {
    return this.authService.loginUser(email, password);
  }
 
  @Post('admin/register')
  @ApiOperation({ summary: 'Register new admin' })
  @ApiResponse({ status: 201, type: TokenResponse })
  async registerAdmin(@Body() { email, password, name }: AuthDto) {
    return this.authService.registerAdmin(email, password, name);
  }
 
  @Post('admin/login')
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, type: TokenResponse })
  async loginAdmin(@Body() { email, password }: AuthDto) {
    return this.authService.loginAdmin(email, password);
  }
 
  @Post('otp/request')
  @ApiOperation({ summary: 'Request OTP via WhatsApp' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  async requestOtp(@Body() { phone }: OtpRequestDto) {
    return this.authService.requestOtp(phone);
  }
 
  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify OTP only (returns isNewUser flag)' })
  @ApiResponse({ status: 200, description: 'OTP verified', type: TokenResponse })
  async verifyOtpOnly(@Body() { phone, otp }: OtpVerifyDto) {
    return this.authService.verifyOtp(phone, otp);
  }
 
  @Post('complete-registration')
  @ApiOperation({ summary: 'Complete registration after OTP verification' })
  @ApiResponse({ status: 200, type: TokenResponse })
  async completeRegistration(@Body() { phone, name, email }: CompleteRegistrationDto) {
    return this.authService.completeRegistration(phone, name, email);
  }
}