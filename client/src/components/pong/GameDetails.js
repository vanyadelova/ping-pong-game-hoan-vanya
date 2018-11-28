import React, {PureComponent} from 'react'
import {connect} from 'react-redux'
import {Redirect} from 'react-router-dom'
import {getGames, joinGame, updateGame} from '../../actions/games'
import {getUsers} from '../../actions/users'
import {userId} from '../../jwt'
import Paper from 'material-ui/Paper'
import Button from 'material-ui/Button'
import Field from './Field'
import './GameDetails.css'
import {updatePositions} from '../../actions/positions'

class GameDetails extends PureComponent {

  componentWillMount() {
    if (this.props.authenticated) {
      if (this.props.game === null) this.props.getGames()
      if (this.props.users === null) this.props.getUsers()
    }
  }

  joinGame = () => this.props.joinGame(this.props.game.id)

  makeMove = (toRow, toCell) => {
    const {game, updateGame} = this.props

    const board = game.board.map(
      (row, rowIndex) => row.map((cell, cellIndex) => {
        if (rowIndex === toRow && cellIndex === toCell) return game.turn
        else return cell
      })
    )
    updateGame(game.id, board)
  }

  updatePaddlesPos = (paddley, paddle) => {
    this.props.updatePositions(this.props.game.id, paddle, paddley)
  }

  playSound = (x) => {
    const sound = new Audio(x)
    sound.play()
  }


  render() {
    const {game, users, authenticated, userId} = this.props

    if (!authenticated) return (
			<Redirect to="/login" />
		)

    if (game === null || users === null) return 'Loading...'
    if (!game) return 'Not found'

    const player = game.players.find(p => p.userId === userId)
    const opponent = game.players.find(p => p.userId !== userId)

    return (<Paper className="outer-paper">
      <h1>Game #{game.id}</h1>

      <p>Status: {game.status}</p>
      {
        game.status === 'pending' && 
        game.players.map(p => p.userId).indexOf(userId) === -1 &&
        <Button onClick={this.joinGame}>Join Game</Button>
      }

      {
        
        game.winner &&
          <p>Winner: {users[game.winner].firstName}</p>
      }

      <hr />

      {
        game.status !== 'pending' && game.status !== 'finished' &&
        <Field 
          players={game.players} 
          userId={this.props.userId} 
          updatePaddlesPos={this.updatePaddlesPos}
          position={this.props.position}
          users={this.props.users}
          winner={this.props.game.winner || null}
        />
      }
    </Paper>)
  }
}

const mapStateToProps = (state, props) => ({
  authenticated: state.currentUser !== null,
  userId: state.currentUser && userId(state.currentUser.jwt),
  game: state.games && state.games[props.match.params.id],
  users: state.users,
  position: state.games && state.games[props.match.params.id].position
})

const mapDispatchToProps = {
  getGames, getUsers, joinGame, updateGame, updatePositions
}

export default connect(mapStateToProps, mapDispatchToProps)(GameDetails)
