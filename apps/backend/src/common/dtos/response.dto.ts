import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T = any> {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Operation successful' })
  message!: string;

  @ApiProperty({ required: false })
  data?: T;

  @ApiProperty({ required: false })
  error?: string;

  @ApiProperty({ required: false })
  statusCode?: number;

  @ApiProperty({ required: false })
  timestamp?: Date;
}
