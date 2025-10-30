import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

function Header({ leftContent }) {
  // Get user from localStorage
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();

  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    setShowConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('user');
    setShowConfirm(false);
    navigate('/');
    // Force refresh to update homepage state
    window.location.reload();
  };

  const cancelLogout = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <AppBar position="static" color="primary" sx={{ mb: 2 }}>
        <Toolbar>
          {/* Left content (e.g., mode toggle) */}
          <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
            {leftContent}
          </Box>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold',
            }}
          >
            Xerjoff Perfume Store
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button color="inherit" component={Link} to="/">Home</Button>
            <Button color="inherit" component={Link} to="/about">About</Button>
            <Button color="inherit" component={Link} to="/contact">Contact</Button>
            <Button color="inherit" component={Link} to="/shop">Shop</Button>

            {user ? (
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/login">Login</Button>
                <Button color="inherit" component={Link} to="/register">Register</Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Dialog open={showConfirm} onClose={cancelLogout}>
        <DialogTitle>Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to logout?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirmLogout} color="primary">Yes</Button>
          <Button onClick={cancelLogout} color="primary" autoFocus>No</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Header
