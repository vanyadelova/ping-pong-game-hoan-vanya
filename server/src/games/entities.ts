import { BaseEntity, PrimaryGeneratedColumn, Column, Entity, Index, OneToMany, ManyToOne } from 'typeorm'
import User from '../users/entity'

export type Paddle = 'left' | 'right'
export type Ball = {
  x: number,
  y: number
}

const defaultBall: Ball = {
  x: 250,
  y: 250
}
type Status = 'pending' | 'started' | 'finished'

@Entity()
export class Game extends BaseEntity {

  @PrimaryGeneratedColumn()
  id?: number

  @Column('integer', {nullable: true})
  winner: number

  @Column('text', {default: 'pending'})
  status: Status

  @Column('json', {default: defaultBall})
  ball: Ball

  @OneToMany(_ => Player, player => player.game, {eager:true})
  players: Player[]
}

@Entity()
@Index(['game', 'user'], {unique:true})
export class Player extends BaseEntity {

  @PrimaryGeneratedColumn()
  id?: number

  @ManyToOne(_ => User, user => user.players)
  user: User

  @ManyToOne(_ => Game, game => game.players)
  game: Game

  @Column()
  userId: number

  @Column('text')
  paddle: Paddle

  @Column('integer', {nullable: true})
  score: number
}