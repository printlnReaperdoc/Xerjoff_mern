import React, { useState } from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    alert('Thank you for contacting us!')
    setFormData({ name: '', email: '', message: '' })
  }

  return (
    <main>
      <Typography variant="h4" gutterBottom>Contact Page</Typography>
      <Typography variant="body1">
        Contact us at <a href="mailto:contact@example.com">contact@example.com</a>
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mt: 2 }}>
        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          fullWidth
          multiline
          rows={4}
          margin="normal"
        />
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>Send</Button>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Our Location</Typography>
        <iframe
          title="Google Maps Shibuya"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.700170820291!2d139.6536477!3d35.6668906!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188cb2eb3108d1%3A0xf11cd9b2395b6677!2sShibuya%2C%20Tokyo%2C%20Japan!5e0!3m2!1sen!2sjp!4v1694420341201!5m2!1sen!2sjp"
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </Box>
    </main>
  )
}

export default Contact
