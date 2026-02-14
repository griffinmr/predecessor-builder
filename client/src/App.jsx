import { useState } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import BuilderPage     from './components/BuilderPage'
import BuildsPage      from './components/BuildsPage'
import LeaderboardPage from './components/LeaderboardPage'

export default function App() {
  const [page, setPage] = useState('builder')

  return (
    <ThemeProvider>
      {page === 'builder' && <BuilderPage activePage={page} onNavigate={setPage} />}
      {page === 'builds' && <BuildsPage activePage={page} onNavigate={setPage} />}
      {page === 'leaderboard' && <LeaderboardPage activePage={page} onNavigate={setPage} />}
    </ThemeProvider>
  )
}
