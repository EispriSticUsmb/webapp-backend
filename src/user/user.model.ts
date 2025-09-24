import { EventParticipant } from 'src/events/event.model';
import { Notification } from 'src/notifications/notif.model';
import { Site } from 'src/sites/site.model';
import { Team, TeamInvitation } from 'src/teams/team.model';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MEMBRE = 'MEMBRE',
}

export enum UserType {
  ETUDIANT = 'ETUDIANT',
  ENSEIGNANT = 'ENSEIGNANT',
  ANCIEN = 'ANCIEN',
  AUTRE = 'AUTRE',
}

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;

  firstName: string;
  lastName: string;

  profileImage?: string;

  role: UserRole;
  hasVerifiedEmail: boolean;
  userType: UserType;

  createdAt: Date;
  updatedAt: Date;

  participations?: EventParticipant[];
  ledTeams?: Team[];

  notifications?: Notification[];
  sentNotifications?: Notification[];

  receivedInvitations?: TeamInvitation[];
  sentInvitations?: TeamInvitation[];

  site?: Site;
}
