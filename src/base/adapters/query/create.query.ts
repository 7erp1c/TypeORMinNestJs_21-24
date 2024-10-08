import {
  QueryDto,
  QueryRequestType,
  QuerySearchType,
  QuerySortType,
} from './types';

export const createQuery = (query: QueryRequestType): QueryDto => {
  const searchData: QuerySearchType = {};
  const sortData: QuerySortType = {
    sortBy: query.sortBy ? query.sortBy : 'createdAt',
    sortDirection: query.sortDirection ? query.sortDirection : 'desc',
    pageNumber: query.pageNumber ? query.pageNumber : 1,
    pageSize: query.pageSize ? query.pageSize : 10,
  };
  if (query.searchLoginTerm) searchData.searchLoginTerm = query.searchLoginTerm;
  if (query.searchEmailTerm) searchData.searchEmailTerm = query.searchEmailTerm;
  if (query.searchNameTerm) searchData.searchNameTerm = query.searchNameTerm;
  if (query.bodySearchTerm) searchData.bodySearchTerm = query.bodySearchTerm;
  if (query.publishedStatus) searchData.publishedStatus = query.publishedStatus;

  return { sortData, searchData };
};

export const createQueryGame = (query: QueryRequestType): QueryDto => {
  const searchData: QuerySearchType = {};
  const sortData: QuerySortType = {
    sortBy: query.sortBy ? query.sortBy : 'pairCreatedDate',
    sortDirection: query.sortDirection ? query.sortDirection : 'desc',
    pageNumber: query.pageNumber ? query.pageNumber : 1,
    pageSize: query.pageSize ? query.pageSize : 10,
  };

  return { sortData, searchData };
};
