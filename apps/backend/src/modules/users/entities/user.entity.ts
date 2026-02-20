import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { UserType, UserStatus, SignupStep, UserRole } from '../enums/user.enum';

@Entity('users')
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  firstName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lastName?: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber?: string;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.INDIVIDUAL,
  })
  userType!: UserType;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @Column({ type: 'boolean', default: false })
  emailVerified!: boolean;

  @Column({ type: 'boolean', default: false })
  phoneVerified?: boolean;

  @Column({
    type: 'enum',
    enum: SignupStep,
    default: SignupStep.CREATED,
  })
  signupStep?: SignupStep;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  // Additional fields for signup process
  @Column({ type: 'text', nullable: true })
  residentNumber?: string; // Encrypted

  @Column({ type: 'varchar', length: 255, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  district?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postcode?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  buildingName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  accountNumber?: string; // Encrypted

  @Column({ type: 'varchar', length: 10, nullable: true })
  bankCode?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  accountHolder?: string;

  // Corporate fields
  @Column({ type: 'varchar', length: 255, nullable: true })
  businessName?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  businessRegistrationNumber?: string; // Encrypted

  @Column({ type: 'varchar', length: 255, nullable: true })
  businessCity?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  businessDistrict?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  businessAddress?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  businessLicenseUrl?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sealCertificateUrl?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  representativeIdUrl?: string;

  // Terms and conditions
  @Column({ type: 'boolean', default: false })
  acceptedTerms?: boolean;

  @Column({ type: 'boolean', default: false })
  acceptedPrivacy?: boolean;

  @Column({ type: 'boolean', default: false })
  acceptedMarketing?: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
