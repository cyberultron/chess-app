import { useEffect, useMemo, useState } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import './App.css'

function App() {
  const [game, setGame] = useState(new Chess())
  const [position, setPosition] = useState(game.fen())
  const [history, setHistory] = useState(game.history({ verbose: true }))
  const [boardWidth, setBoardWidth] = useState(560)

  useEffect(() => {
    const updateBoardWidth = () => {
      const horizontalPadding = window.innerWidth < 768 ? 40 : 120
      const nextWidth = Math.min(560, Math.max(260, window.innerWidth - horizontalPadding))
      setBoardWidth(nextWidth)
    }

    updateBoardWidth()
    window.addEventListener('resize', updateBoardWidth)
    return () => window.removeEventListener('resize', updateBoardWidth)
  }, [])

  const status = useMemo(() => {
    if (game.isCheckmate()) {
      const winner = game.turn() === 'w' ? 'Black' : 'White'
      return `Checkmate! ${winner} wins.`
    }
    if (game.isStalemate()) return 'Stalemate.'
    if (game.isDraw()) return 'Draw.'
    if (game.isCheck()) return `${game.turn() === 'w' ? 'White' : 'Black'} to move (Check).`
    return `${game.turn() === 'w' ? 'White' : 'Black'} to move.`
  }, [game, position])

  function sync(next) {
    setGame(next)
    setPosition(next.fen())
    setHistory(next.history({ verbose: true }))
  }

  function onDrop(sourceSquare, targetSquare) {
    const next = new Chess(game.fen())
    const move = next.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
    if (!move) return false
    sync(next)
    return true
  }

  function resetGame() {
    sync(new Chess())
  }

  function undoMove() {
    const next = new Chess(game.fen())
    const undone = next.undo()
    if (!undone) return
    sync(next)
  }

  return (
    <div className="app">
      <div className="board-wrap">
        <h1>Chess App</h1>
        <p className="status">{status}</p>
        <div className="board-shell">
          <Chessboard id="chess-board" position={position} onPieceDrop={onDrop} boardWidth={boardWidth} />
        </div>
        <div className="actions">
          <button onClick={undoMove}>Undo</button>
          <button onClick={resetGame}>New Game</button>
        </div>
      </div>

      <aside className="history-wrap">
        <h2>Move History</h2>
        {history.length === 0 ? (
          <p>No moves yet.</p>
        ) : (
          <ol>
            {history.map((move, i) => (
              <li key={`${move.san}-${i}`}>
                <strong>{move.san}</strong> <span>{move.from} → {move.to}</span>
              </li>
            ))}
          </ol>
        )}
      </aside>
    </div>
  )
}

export default App
