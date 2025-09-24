import { Team, TeamInvitation } from 'src/teams/team.model';
import { User } from 'src/user/user.model';

export interface Event {
  id: string;

  title: string;
  descriptionSummary?: string;
  description: string;
  location?: string;

  startDate?: Date;
  endDate?: Date;

  registrationStart?: Date;
  registrationEnd?: Date;

  maxParticipants?: number;

  allowTeams: boolean;
  maxTeamSize?: number;

  externalLink?: string;

  createdAt: Date;
  updatedAt: Date;

  teams?: Team[];
  participants?: EventParticipant[];
  invitations?: TeamInvitation[];
}

export interface EventParticipant {
  id: string;

  user: User;
  userId: string;

  event: Event;
  eventId: string;

  team?: Team;
  teamId?: string;

  createdAt: Date;
}
