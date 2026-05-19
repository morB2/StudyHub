import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  institution?: string;
  createdAt: Timestamp;
  language?: 'he' | 'en';
  followedGroups?: string[];
  notificationSettings?: {
    chat: boolean;
    meetings: boolean;
  };
}

export interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  subject: string;
  creatorId: string;
  members: string[];
  createdAt: Timestamp;
  isPrivate?: boolean;
}

export interface Invitation {
  id: string;
  groupId: string;
  groupName: string;
  inviterId: string;
  inviterName: string;
  inviteeEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Timestamp;
}

export interface ChatMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  text?: string;
  audioUrl?: string;
  type: 'text' | 'audio';
  createdAt: Timestamp;
}

export interface StudyMaterial {
  id: string;
  groupId: string;
  uploaderId: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  folderId: string | null;
  createdAt: Timestamp;
}

export interface Folder {
  id: string;
  groupId: string;
  parentId: string | null;
  name: string;
  creatorId: string;
  createdAt: Timestamp;
}

export interface Meeting {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  location?: string;
  creatorId: string;
  createdAt: Timestamp;
}

export interface Notice {
  id: string;
  groupId: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  createdAt: Timestamp;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
