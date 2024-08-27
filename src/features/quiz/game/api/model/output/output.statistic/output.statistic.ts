import { ApiProperty } from '@nestjs/swagger';

export class MyStatisticViewModel {
  // @ApiProperty({
  //   type: Number,
  //   description: 'Sum scores of all games',
  // })
  sumScore: number;

  // @ApiProperty({
  //   type: Number,
  //   description: 'Average score of all games rounded to 2 decimal places',
  // })
  avgScores: number;

  // @ApiProperty({
  //   type: Number,
  //   description: 'All played games count',
  // })
  gamesCount: number;

  // @ApiProperty({
  //   type: Number,
  // })
  winsCount: number;

  // @ApiProperty({
  //   type: Number,
  // })
  lossesCount: number;

  // @ApiProperty({
  //   type: Number,
  // })
  drawsCount: number;
}
