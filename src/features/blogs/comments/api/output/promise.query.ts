import { CommentViewOutput } from './type';

export type CommentsViewModelType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: CommentViewOutput[];
};
export type QueryCommentsRequestType = {
  postId?: string | null;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  pageNumber?: number;
  pageSize?: number;
};
export type SortCommentsRepositoryType = {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  pageNumber: number;
  pageSize: number;
};
