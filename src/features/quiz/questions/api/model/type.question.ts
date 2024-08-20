export type quizQuestion = {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type createQuizQuestion = {
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
};
