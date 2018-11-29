import {ADD_GAME, UPDATE_GAME_POSITION, UPDATE_GAMES, UPDATE_GAME_STATUS, UPDATE_GAME_SCORE } from '../actions/games'
import {USER_LOGOUT} from '../actions/users'

export default (state = null, {type, payload}) => {
  switch (type) {
    case USER_LOGOUT:
      return null
    
    case ADD_GAME:
      return {
        ...state,
        [payload.id]: payload
      }

    case UPDATE_GAME_POSITION:
      const currentGame = state[payload.id]
      currentGame.position = {
        ...payload
      }
  
      return {
        ...state,
        [currentGame.id]: currentGame
      }

    case UPDATE_GAME_STATUS:
    return {
      ...state,
      [payload.id]: payload
    }

    case UPDATE_GAME_SCORE:
    return {
      ...state,
      [payload.id]: {
        ...state[payload.id],
        players: [...payload.players]
      }
    }

    case UPDATE_GAMES:
      return payload.reduce((games, game) => {
        games[game.id] = game
        return games
      }, {})

    default:
      return state
  }
}
