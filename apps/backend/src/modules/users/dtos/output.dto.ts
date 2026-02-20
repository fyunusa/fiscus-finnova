import { ApiProperty } from '@nestjs/swagger';
import { UserType, UserStatus, UserRole } from '../enums/user.enum';

export class UserOutputDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ required: false })
  firstName?: string;

  @ApiProperty({ required: false })
  lastName?: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ required: false })
  phoneNumber?: string;

  @ApiProperty({ enum: UserType })
  userType!: UserType;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;

  @ApiProperty({ enum: UserStatus })
  status!: UserStatus;

  @ApiProperty()
  emailVerified!: boolean;

  @ApiProperty({ required: false })
  lastLoginAt?: Date;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
