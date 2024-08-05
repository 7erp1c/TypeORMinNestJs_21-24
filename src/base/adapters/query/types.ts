export type ErrorType = {
  errorsMessages: ErrorsMessageType[];
};
export type ErrorsMessageType = {
  field: string;
  message: string;
};

export type QueryRequestType = {
  searchLoginTerm?: string | null;
  searchEmailTerm?: string | null;
  searchNameTerm?: string | null;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  pageNumber?: number;
  pageSize?: number;
};

export type QuerySortType = {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  pageNumber: number;
  pageSize: number;
};

export type QuerySearchType = {
  searchLoginTerm?: string | null;
  searchEmailTerm?: string | null;
  searchNameTerm?: string | null;
};

export type QueryDto = {
  sortData: QuerySortType;
  searchData: QuerySearchType;
};

export type ViewModelType<R> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: R[];
};
