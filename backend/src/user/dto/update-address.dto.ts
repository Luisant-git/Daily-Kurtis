import { IsIn, IsOptional, IsNotEmpty, IsString } from 'class-validator';

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
] as const;

export class UpdateAddressDto {
  @IsOptional()
  @IsString({ message: 'name must be a string' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'fullName must be a string' })
  fullName?: string;

  @IsOptional()
  @IsString({ message: 'addressLine must be a string' })
  addressLine?: string;

  @IsOptional()
  @IsString({ message: 'addressLine1 must be a string' })
  addressLine1?: string;

  @IsOptional()
  @IsString({ message: 'landmark must be a string' })
  landmark?: string;

  @IsOptional()
  @IsString({ message: 'city must be a string' })
  city?: string;

  @IsOptional()
  @IsString({ message: 'state must be a string' })
  @IsIn(INDIAN_STATES, { message: 'Invalid state. Please select a valid Indian state.' })
  state?: string;

  @IsOptional()
  @IsString({ message: 'pincode must be a string' })
  pincode?: string;

  @IsOptional()
  @IsString({ message: 'mobile must be a string' })
  mobile?: string;
}