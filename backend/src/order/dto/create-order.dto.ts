import { IsString, IsObject, IsArray, ValidateNested, IsOptional, IsIn, registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
] as const;

// Custom decorator for case-insensitive state validation
function IsValidIndianState(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidIndianState',
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value || typeof value !== 'string') return false;
          return INDIAN_STATES.some(state => state.toLowerCase() === value.toLowerCase());
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid Indian state`;
        },
      },
    });
  };
}

class ShippingAddressDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  addressLine1: string;

  @ApiProperty({ example: 'Apt 4B', required: false })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiProperty({ example: 'Near Park', required: false })
  @IsString()
  @IsOptional()
  landmark?: string;

  @ApiProperty({ example: 'Mumbai' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Maharashtra', enum: INDIAN_STATES })
  @IsString()
  @IsValidIndianState({ message: 'Invalid state. Please select a valid Indian state.' })
  state: string;

  @ApiProperty({ example: '400001' })
  @IsString()
  pincode: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  mobile: string;
}

export class CreateOrderDto {
  @ApiProperty({ example: '1497.00' })
  @IsString()
  subtotal: string;

  @ApiProperty({ example: '50.00' })
  @IsString()
  deliveryFee: string;

  @ApiProperty({ example: '35.00', required: false })
  @IsOptional()
  @IsString()
  codFee?: string;

  @ApiProperty({ example: '1547.00' })
  @IsString()
  total: string;

  @ApiProperty({ example: 'SAVE20', required: false })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiProperty({ example: '1027', required: false })
  @IsOptional()
  @IsString()
  discount?: string;

  @ApiProperty({ example: 'upi', enum: ['card', 'upi', 'cod', 'online'] })
  @IsString()
  @IsIn(['card', 'upi', 'cod', 'online'], { message: 'Payment method must be one of: card, upi, cod, online' })
  paymentMethod: string;

  @ApiProperty({ type: ShippingAddressDto })
  @IsObject()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @ApiProperty({ type: ShippingAddressDto, required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  billingAddress?: ShippingAddressDto;

  @ApiProperty({ example: { fee: 50, name: 'Standard Delivery', duration: '3-5 days' } })
  @IsObject()
  deliveryOption: any;
}
