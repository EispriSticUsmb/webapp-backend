import { User } from 'src/user/user.model';

export enum SiteStatus {
  MAINTENANCE = 'MAINTENANCE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
  UNKNOWN = 'UNKNOWN',
}

export interface Site {
  id: string;
  status: SiteStatus;
  domain?: string;

  createdAt: Date;
  updatedAt: Date;

  user: User;
  userId: string;
}
