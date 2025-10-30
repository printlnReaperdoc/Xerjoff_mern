import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Container, CssBaseline, IconButton, Box } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { useMemo, useState, useEffect } from 'react'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import Header from './components/Header'
import Footer from './components/Footer'
import Homepage from './pages/Homepage'
import About from './pages/About'
import Contact from './pages/Contact'
import Shop from './pages/Shop'
import Login from './pages/Login'
import Register from './pages/Register'
import Product from './pages/Product'
import Manage from './pages/Manage'
import Forbidden from './pages/Forbidden'
import Users from './pages/ManageUsers'
import './App.css'

function App() {
  // Initialize mode from localStorage or default to 'light'
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('themeMode')
    return saved === 'dark' ? 'dark' : 'light'
  })

  // Update localStorage whenever mode changes
  useEffect(() => {
    localStorage.setItem('themeMode', mode)
  }, [mode])

  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode },
        typography: {
          fontFamily: "'CustomFont', 'Segoe UI', sans-serif",
        },
      }),
    [mode]
  )

  const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'))

  const modeToggleButton = (
    <IconButton onClick={toggleMode} color="inherit" sx={{ ml: 1 }}>
      {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  )

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          backgroundImage: 'url(/FONTAINE.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: mode === 'dark' ? 'brightness(0.6)' : 'brightness(1)',
          pointerEvents: 'none',
        }}
      />
      <ThemeProvider theme={theme}>
        <Router>
          {/* Header with mode toggle on the left */}
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              zIndex: 1201,
            }}
          >
            <Header leftContent={modeToggleButton} />
          </Box>
          <CssBaseline />
          {/* Make the outer Box a flex column to push footer down */}
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              pt: { xs: '64px', sm: '64px' }, // header height
              // no pb needed
            }}
          >
            <Container
              maxWidth="lg"
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                p: 0,
                position: 'relative',
                zIndex: 1,
              }}
            >
              <Box component="main" sx={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Container
                  maxWidth="md"
                  sx={{
                    py: 4,
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    boxShadow: 3,
                    my: 4,
                    minHeight: '60vh',
                  }}
                >
                  <Routes>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/product/:slug" element={<Product />} />
                    <Route path="/manage" element={<Manage />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/forbidden" element={<Forbidden />} />
                  </Routes>
                  </Container>
                </Box>
              </Container>
              {/* Footer always at the very bottom */}
              <Footer />
            </Box>
          </Router>
        </ThemeProvider>
      </>
    )
  }

export default App
