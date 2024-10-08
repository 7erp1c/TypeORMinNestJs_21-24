export type QueryUsersRequestType = {
  searchLoginTerm?: string | null;
  searchEmailTerm?: string | null;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  pageNumber?: number;
  pageSize?: number;
};
export type SortPostRepositoryType = {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  pageNumber: number;
  pageSize: number;
};

export type QueryQuestionRequestType = {
  bodySearchTerm?: string | null;
  publishedStatus?: string | null;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  pageNumber?: number;
  pageSize?: number;
};
