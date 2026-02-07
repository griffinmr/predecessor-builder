import { ThemeProvider } from './context/ThemeContext'
import BuilderPage from './components/BuilderPage'

export default function App() {
  return (
    <ThemeProvider>
      <BuilderPage />
    </ThemeProvider>
  )
}
