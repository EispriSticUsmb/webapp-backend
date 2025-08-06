export type UserRole = 'ADMIN' | 'USER' | 'MEMBRE';
export type UserType = 'ETUDIANT' | 'ENSEIGNANT' | 'ANCIEN' | 'AUTRE';

export interface UserModel {
  id: string;
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  role: UserRole;
  createdAt: Date;
  hasVerifiedEmail: boolean;
  usertype: UserType;
}

export interface UserDto {
  id?: string;
  email?: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  role?: UserRole;
  createdAt?: Date;
  hasVerifiedEmail?: boolean;
  UserType: UserType;
}
