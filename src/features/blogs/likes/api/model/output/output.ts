export type LikeStatusType = 'None' | 'Like' | 'Dislike';

export type LikesInfoType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatusType;
};
