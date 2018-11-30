import * as React from 'react'
import Controller from './Controller'
import { connect } from 'react-redux'

class Field extends React.PureComponent {
  state = {
    leftPaddleX: 0,
    rightPaddleX: 490,
    leftPaddleY: 213,
    rightPaddleY: 213,
    input: new Controller()
  }

  componentDidMount() {
    this.countdown(1, 'start')
    this.state.input.bindKeys();
  }

  componentWillUnmount() {
    this.state.input.unbindKeys();
    this.stopGame()
    clearInterval(this.id)
   
  }   
  //draw scores
  drawScoreLeft = (ctx) => {
    const canvas = this.refs.canvas
    ctx.fillStyle = '#fff';
    ctx.font = '56px VT323, monospace';
    let score = this.props.players.find(player => player.paddle === 'left').score
    ctx.fillText(`${score}`, canvas.width / 4, canvas.height / 4);
  }

  drawScoreRight = (ctx) => {
    const canvas = this.refs.canvas
    ctx.fillStyle = '#fff';
    ctx.font = '56px VT323, monospace';
    let score = this.props.players.find(player => player.paddle === 'right').score
    ctx.fillText(`${score}`, (canvas.width / 4) * 3, canvas.height / 4);
  }

  //start the game
  menu = (textToRender) => {
    const context = this.refs.canvas.getContext('2d')
    const canvas = this.refs.canvas
    context.fillStyle = 'yellow';
    context.font = '36px VT323, monospace';
    context.textAlign = 'center';
    if(textToRender === 'start') {
      context.fillText("Pong game", canvas.width / 2, canvas.height / 4);
      context.font = '26px VT323, monospace';
      context.fillText(`The game start in ${this.sec} seconds`, canvas.width / 2, canvas.height / 2);
      context.font = '20px VT323, monospace'
      context.fillText('Use up & down arrow keys to move', canvas.width / 2, (canvas.height / 4) * 3);
    } else {
      context.fillText("SCORE!", canvas.width / 2, canvas.height / 4);
      context.font = '30px VT323, monospace';
      context.fillText(`Restart in ${this.sec} seconds...`, canvas.width / 2, canvas.height / 2);
    }

  }


  clearCanv = () => {
    const context = this.refs.canvas.getContext('2d')
    const canvas = this.refs.canvas
    context.clearRect(0,0,canvas.width,canvas.height)
  }
  
  //count down time to start the game
  countdown = (x, textToRender) => {     
    this.sec = x;  
    this.id = setInterval(() => {
      this.clearCanv()
        this.menu(textToRender)
        this.sec--;
        
        if (this.sec < -1) {
            clearInterval(this.id);
            this.serve();
            return;
        }        
    }, 1000)
  }

  //draw the paddles
  drawPaddles = (paddlex, paddley, ctx) => {
    var paddleHeight = 75;
    var paddleWidth = 10;
    ctx.beginPath();
    ctx.rect(paddlex, paddley, paddleWidth, paddleHeight);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.closePath();
  }

  //draw the ball
  drawBall = (x , y, ctx) => {
    this.setState({
      ballX: x,
      ballY: y
    }, () => {
      const ballRadius = 10;
      ctx.beginPath();
      ctx.arc(x, y, ballRadius, 0, Math.PI*2);
      ctx.fillStyle = "yellow";
      ctx.fill();
      ctx.closePath();
    })
  }

  //draw the board, paddles, ball and score
  drawCanvas = (x,y) => {
    const ctx = this.refs.canvas.getContext('2d')
    ctx.clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
    this.drawMiddleLine(ctx)
    this.drawBall(x,y,ctx)
    this.drawScoreLeft(ctx)
    this.drawScoreRight(ctx)
    this.drawPaddles(this.state.leftPaddleX, ( this.props.position && this.props.position.left) || this.state.leftPaddleY,ctx) //left paddle
    this.drawPaddles(this.state.rightPaddleX, ( this.props.position && this.props.position.right) || this.state.rightPaddleY,ctx) //right paddle
  }

  //draw the net
  drawMiddleLine = (ctx) => {
    ctx.beginPath();
    ctx.moveTo(this.refs.canvas.width/2,0);
    ctx.lineTo(this.refs.canvas.width/2, this.refs.canvas.height);
    ctx.lineWidth = 2;
    // set line color
    ctx.strokeStyle = 'yellow';
    ctx.stroke();
  }

  //update position of the paddle
  updatePaddle = (keys, side) => {
    if(side === 'left') {
      if (keys.down && this.state.leftPaddleY < 425) {
        this.setState(
          {leftPaddleY: this.state.leftPaddleY + 8},
          () => this.props.updatePaddlesPos(this.state.leftPaddleY, side)
        )
      }
      if (keys.up && this.state.leftPaddleY > 0) {
        this.setState({leftPaddleY: this.state.leftPaddleY - 8},
        () => this.props.updatePaddlesPos(this.state.leftPaddleY, side)
        )
      }
    } else {
      if (keys.down && this.state.rightPaddleY < 425) {
        this.setState(
          {rightPaddleY: this.state.rightPaddleY + 8}
        )
        this.props.updatePaddlesPos(this.state.rightPaddleY,side)
      }
      if (keys.up && this.state.rightPaddleY > 0) {
        this.setState({rightPaddleY: this.state.rightPaddleY - 8})
        this.props.updatePaddlesPos(this.state.rightPaddleY,side)
      }
    }
  }

  //moving the paddle up and down
  addKeyEventListeners = () => {
    window.addEventListener('keyup', () => this.state.input.handleKeys(false));
    window.addEventListener('keydown', () => this.state.input.handleKeys(true));
  } 

  //moving the ball
  moveBall = (x,y, vx = -2, vy = 4) => {
    const playersPaddle = this.props.players.find(player => player.userId === this.props.userId).paddle
    vx = (this.props.position && this.props.position.vx) || vx
    vy = (this.props.position && this.props.position.vy) || vy
    this.interval = setInterval(() => {  
      this.drawCanvas(x, y)
      x += vx 
      y += vy 
      
      vx = this.collide(x, y, vx, vy)
      
      if(y >= this.refs.canvas.height || y <= 0 ) {
        vy = this.bounce1(vy)
        this.props.updatePaddlesPos(vy, 'vy')
      }
      
      if(this.ballFlewOut(x, y)) {
        
        this.stopGame(this.interval)
        const scoredPlayer = x < 1 ? 'right' : 'left'
        this.props.updatePaddlesPos(scoredPlayer, 'score')
        this.countdown(1, 'score')
      }
      if(this.state.input.pressedKeys.up || this.state.input.pressedKeys.down) {
        this.updatePaddle(this.state.input.pressedKeys, playersPaddle)
      }
    }, 1000/60)
  }

  //stop the game
  stopGame = () => {
    clearInterval(this.interval)
  }
  //when the ball bounce back from the paddle, change the direction of the ball
  bounce1 = (velocity) => {
    return velocity = velocity * (- 1)
  }
  //set the bounce of the game from the left and right edges
  bounce2 = (velocity) => {
    return velocity * 1
  }
  //when the ball hits the paddle
  collide = (x, y, vx, vy) => {
    let targetPaddle
    vx < 0 ? targetPaddle = 'left' : targetPaddle = 'right'
     if(targetPaddle === 'left') {
      if((x <= (this.state.leftPaddleX + 10) && (y + vy) >= this.props.position.left && (y + vy) <= (this.props.position.left + 75))) {
        vx = this.bounce1(vx)
        this.props.updatePaddlesPos(vx, 'vx')        
      } return vx
     }
     if(targetPaddle === 'right') {
      if((x >= (this.state.rightPaddleX - 10) && (y + vy) >= this.props.position.right && (y + vy) <= (this.props.position.right + 75))) {
        vx = this.bounce1(vx)
        this.props.updatePaddlesPos(vx, 'vx')        
      } return vx
     }
      
  }
   
  //ball flew out of the field
  ballFlewOut = (x) => {
    return x <= 0 || x >= this.refs.canvas.width
  }
  //serving the ball
  serve = () => {
    
    let x = this.props.games[this.props.id].ball.x
    let y = this.props.games[this.props.id].ball.y
    this.moveBall(x, y)
  }

  render() {
    return (
      <canvas
        className="outer-paper"
        style={{background: "black"}} 
        ref="canvas" 
        height="500" 
        width="500" />  
    )
  }
}

const mapStateToProps = (state) => {
  return {
    games: state.games
  }
}

export default connect(mapStateToProps)(Field)