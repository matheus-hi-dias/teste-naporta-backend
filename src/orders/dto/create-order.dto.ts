import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ClientDto } from './client.dto';
import { AddressDto } from './address.dto';
import { CreateOrderItemDto } from './create-order-item';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  orderNumber: string;

  @ValidateNested()
  @Type(() => AddressDto)
  deliveryAddress: AddressDto;

  @IsString()
  @IsNotEmpty()
  estimatedDeliveryDate: Date;

  @ValidateNested()
  @Type(() => ClientDto)
  client: ClientDto;

  @IsArray()
  @ArrayMinSize(1, { message: 'Order must have at least one item' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
