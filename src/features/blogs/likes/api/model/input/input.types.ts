export type LikeStatusType = 'None' | 'Like' | 'Dislike';

export type PostLikeDto = {
  postId: string;
  likedUserId: string;
  likedUserName: string;
  addedAt: string;
  status: LikeStatusType;
};

export type NewestLikeType = {
  addedAt: string;
  userId: string;
  login: string;
};

export type PostsLikesInfoType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatusType;
  newestLikes: Array<NewestLikeType>;
};
