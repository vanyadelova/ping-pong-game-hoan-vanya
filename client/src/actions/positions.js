import * as request from 'superagent'
import {baseUrl} from '../constants'
import {isExpired} from '../jwt'
import {logout} from './users'

export const UPDATE_POSITIONS = 'UPDATE_POSITIONS'
export const UPDATE_GAME_SUCCESS = 'UPDATE_GAME_SUCCESS'

const updateGameSuccess = () => ({
  type: UPDATE_GAME_SUCCESS
})


export const updatePositions = (gameId, key, value) => (dispatch, getState) => {
  const state = getState()
  const jwt = state.currentUser.jwt

  if (isExpired(jwt)) return dispatch(logout())

  request
    .patch(`${baseUrl}/games/${gameId}`)
    .set('Authorization', `Bearer ${jwt}`)
    .send({ [key]: value })
    .then(_ => dispatch(updateGameSuccess()))
    .catch(err => console.error(err))
}

