import { Schema } from '@nestjs/mongoose';

@Schema()
export class BlogTypeCreate {
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
}
export type BlogDto = {
  name: string;
  description: string;
  websiteUrl: string;
};
export type QueryBlogsRequestType = {
  searchNameTerm?: string | null;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  pageNumber?: number;
  pageSize?: number;
};
export type CommentCreateDto = {
  content: string;
  postId: string;
  userId: string;
};
