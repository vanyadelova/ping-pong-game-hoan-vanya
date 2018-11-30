import { 
  JsonController, Authorized, CurrentUser, Post, Param, BadRequestError, HttpCode, NotFoundError, ForbiddenError, Get, Patch, Body 
} from 'routing-controllers'
import User from '../users/entity'
import { Game, Player } from './entities'

import {io} from '../index'
import {gameData}  from './gamedata'

@JsonController()
export default class GameController {
  newGameData: Object = gameData
  @Authorized()
  @Post('/games')
  @HttpCode(201)
  async createGame(
    @CurrentUser() user: User
  ) {
    const entity = await Game.create().save()

    await Player.create({
      game: entity, 
      user,
      paddle: 'left',
      score: 0
    }).save()

    const game = await Game.findOneById(entity.id)

    io.emit('action', {
      type: 'ADD_GAME',
      payload: game
    })
    this.newGameData = gameData
    return ({
      ...game,
      position: this.newGameData
    })
  }

  @Authorized()
  @Post('/games/:id([0-9]+)/players')
  @HttpCode(201)
  async joinGame(
    @CurrentUser() user: User,
    @Param('id') gameId: number
  ) {
    const game = await Game.findOneById(gameId)
    if (!game) throw new BadRequestError(`Game does not exist`)
    if (game.status !== 'pending') throw new BadRequestError(`Game is already started`)

    game.status = 'started'
    await game.save()

    const player = await Player.create({
      game, 
      user,
      paddle: 'right',
      score: 0
    }).save()

    io.emit('action', {
      type: 'UPDATE_GAME_STATUS',
      payload: await Game.findOneById(game.id)
    })

    return player
  }

  @Authorized()

  @Patch('/games/:id([0-9]+)')
  async updateGame(
    @CurrentUser() user: User,
    @Param('id') gameId: number,
    @Body() update: Object
  ) {
    const game = await Game.findOneById(gameId)
    if (!game) throw new NotFoundError(`Game does not exist`)

    const player = await Player.findOne({ user, game })
    if (!player) throw new ForbiddenError(`You are not part of this game`)
    if (game.status !== 'started') throw new BadRequestError(`The game is not started yet`) 
    if(update['vx'] || update['vy'] || update['left'] || update['right']) {
      this.newGameData= {
        ...this.newGameData,
        ...update
      }

      io.emit('action', {
        type: 'UPDATE_GAME_POSITION',
        payload: {
          id: gameId,
          ...this.newGameData
        }
      })
    }

    if(update['score'] && update['score'] === player.paddle) {
      await player.score ++
    }
    if(player.score === 100 ) {
      game.status = 'finished'
      game.winner = player.userId
      await game.save()

      io.emit('action', {
        type: 'UPDATE_GAME_STATUS',
        payload: await Game.findOneById(game.id)
      })
      return game
    }

    await player.save()

    io.emit('action', {
      type: 'UPDATE_GAME_SCORE',
      payload: { 
        id: game.id,
        players: game.players 
      }
    })
    return game
  }

  @Authorized()
  @Get('/games/:id([0-9]+)')
  getGame(
    @Param('id') id: number
  ) {
    return Game.findOneById(id)
  }

  @Authorized()
  @Get('/games')
  async getGames(
    @CurrentUser() user: User
  ) {
    const games = await Game.find({where: {players: {userId: user.id}}})
    const resGames = games
      .filter(game => {
        return (game.players.length < 2 || game.players.filter(player => player.userId === user.id).length === 1)
      })
    return await resGames
  }
}
