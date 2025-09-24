import { User } from 'src/user/user.model';

export enum NotificationType {
  TEAM_INVITATION = 'TEAM_INVITATION',
  TEAM_INVITATION_DELETE = 'TEAM_INVITATION_DELETE',
  INVITATION_ACCEPTED = 'INVITATION_ACCEPTED',
  INVITATION_DECLINED = 'INVITATION_DECLINED',
  TEAM_KICK = 'TEAM_KICK',
  GENERAL = 'GENERAL',
}

export interface Notification {
  id: string;

  user: User;
  userId: string;

  fromUser?: User;
  fromUserId?: string;

  type: NotificationType;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}
