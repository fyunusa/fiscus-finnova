import { User } from '@modules/users/entities/user.entity';
import { UserType, UserRole, UserStatus, SignupStep } from '@modules/users/enums/user.enum';
import * as bcrypt from 'bcrypt';

const ADMIN_EMAIL = 'admin@fiscus.com';
const ADMIN_PASSWORD = 'Admin@123456';

export async function createDefaultAdminUser(): Promise<User> {
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = new User();
  admin.email = ADMIN_EMAIL;
  admin.password = hashedPassword;
  admin.firstName = 'System';
  admin.lastName = 'Administrator';
  admin.userType = UserType.INDIVIDUAL;
  admin.role = UserRole.ADMIN;
  admin.status = UserStatus.ACTIVE;
  admin.signupStep = SignupStep.COMPLETED;
  admin.emailVerified = true;
  admin.phoneVerified = true;
  admin.acceptedTerms = true;
  admin.acceptedPrivacy = true;
  admin.acceptedMarketing = false;

  return admin;
}
