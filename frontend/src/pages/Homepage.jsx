import React, { useRef, useState } from 'react'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { useNavigate } from 'react-router-dom'

function Homepage() {
  const welcomeRef = useRef(null)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  useGSAP(() => {
    gsap.fromTo(
      welcomeRef.current,
      { opacity: 0, y: -40 },
      { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
    )
  }, [])

  // Get user from localStorage
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'))
    } catch {
      return null
    }
  })()

  // ✅ For Vite: use import.meta.env
  const API_URL = import.meta.env.VITE_API_URL || ""

  // Helper function to get profile image URL
  const getProfileImageUrl = () => {
    if (!user?.profileImage || user.profileImage === 'defaultuserpic.png') {
      return '/defaultuserpic.png'
    }
    
    const imagePath = user.profileImage.startsWith('uploads/') 
      ? user.profileImage 
      : `uploads/${user.profileImage}`
    
    return `${API_URL}/${imagePath}`
  }

  return (
    <main>
      <Typography
        ref={welcomeRef}
        variant="h3"
        gutterBottom
        sx={{ fontWeight: 'bold', mb: 3 }}
      >
        Welcome!
      </Typography>

      {user ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
          <img
            src={getProfileImageUrl()}
            alt="Profile"
            style={{
              width: 160,
              height: 160,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #eee',
              marginBottom: 8,
              cursor: 'pointer'
            }}
            onClick={() => setOpen(true)}
          />

          <Typography variant="body1">
            Currently Logged In As <b>{user.name}</b>
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Role: <b>{user.role_id === 1 ? 'Admin' : user.role_id === 2 ? 'Customer' : 'Unknown'}</b>
          </Typography>

          {/* ✅ Show Manage Users button if admin */}
          {user.role_id === 1 && (
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mt: 2 }}
              onClick={() => navigate('/users')}
            >
              Manage Users
            </Button>
          )}

          {/* ✅ Profile Picture Modal */}
          <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md">
            <DialogContent sx={{ position: 'relative', p: 0 }}>
              <IconButton
                onClick={() => setOpen(false)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: 'white',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.6)' }
                }}
              >
                <CloseIcon />
              </IconButton>
              <img
                src={getProfileImageUrl()}
                alt="Profile Full"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '90vh',
                  objectFit: 'contain',
                  borderRadius: 8
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <Typography variant="body1">Welcome to the homepage!</Typography>
      )}

      <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
        About Xerjoff Perfume Store
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Xerjoff Perfume Store is your destination for luxurious and exclusive fragrances. Discover a curated selection of premium perfumes crafted with the finest ingredients, offering a unique olfactory experience for every scent enthusiast.
      </Typography>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/aau-c8l5z9c"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </main>
  )
}

export default Homepage
