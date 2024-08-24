import { Player } from '../../features/quiz/game/domain/player.entity';
import { Answer } from '../../features/quiz/game/domain/answers.on.questions.entity';
import { Game } from '../../features/quiz/game/domain/game.entity';
import { Question } from '../../features/quiz/questions/domain/quiz.question.entity';
import { User } from '../../features/users/domain/user.entity';
import { Blog } from '../../features/blogs/blogs/domain/blogs.entity';
import {
  CommentLike,
  PostsLike,
} from '../../features/blogs/likes/domain/likes.entity.type.orm';
import { Post } from '../../features/blogs/posts/domain/posts.entity';
import { Session } from '../../features/security/devices/domain/device.entity.type.orm';

export type TypeOrmEntity =
  | Player
  | Answer
  | Game
  | Question
  | User
  | Blog
  | Comment
  | CommentLike
  | Post
  | PostsLike
  | Session;
