import React, { useEffect, useState } from 'react'
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

function Manage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ name: '', price: '', category: '', description: '', image_path: '' })
  const [imageFile, setImageFile] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [openForm, setOpenForm] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [userChecked, setUserChecked] = useState(false)
  const [unauthorized, setUnauthorized] = useState(false)
  const navigate = useNavigate()

  // Fetch products
  useEffect(() => {
    setLoading(true)
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products')
        return res.json()
      })
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Restrict access: only logged in users with role_id !== 2
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      setUnauthorized(true)
      setUserChecked(true)
      return
    }
    try {
      const user = JSON.parse(userStr)
      if (user.role_id === 2) {
        setUnauthorized(true)
        setUserChecked(true)
        return
      }
      setUserChecked(true) // Allowed
    } catch {
      setUnauthorized(true)
      setUserChecked(true)
    }
  }, [navigate])

  useEffect(() => {
    if (unauthorized) {
      navigate('/forbidden')
    }
  }, [unauthorized, navigate])

  // Open create modal
  const handleOpenCreate = () => {
    setForm({ name: '', price: '', category: '', description: '', image_path: '' })
    setEditingId(null)
    setImageFile(null)
    setOpenForm(true)
  }

  // Open edit modal
  const handleOpenEdit = (product) => {
    setForm({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
      image_path: product.image_path || ''
    })
    setEditingId(product._id)
    setImageFile(null)
    setOpenForm(true)
  }

  // Handle image file change
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  // Submit create/edit
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    let image_path = form.image_path

    // If a new image file is selected, upload it first
    if (imageFile) {
      const data = new FormData()
      data.append('image', imageFile)
      const res = await fetch('/api/products/upload-image', {
        method: 'POST',
        body: data,
      })
      const result = await res.json()
      if (res.ok && result.image_path) {
        image_path = result.image_path
      } else {
        alert('Image upload failed')
        return
      }
    } else if (!form.image_path) {
      // No image uploaded and no previous image, use default
      image_path = '/public/uploads/sample.image.jpg'
    }

    const payload = { ...form, image_path }

    if (editingId) {
      fetch(`/api/products/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(res => res.json())
        .then(updated => {
          setProducts(products.map(p => p._id === editingId ? updated : p))
          setOpenForm(false)
          setEditingId(null)
        })
    } else {
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(res => res.json())
        .then(newProduct => {
          setProducts([...products, newProduct])
          setOpenForm(false)
        })
    }
  }

  // Open delete modal
  const handleOpenDelete = (id) => {
    setDeleteId(id)
    setOpenDelete(true)
  }

  // Confirm delete
  const handleDelete = () => {
    fetch(`/api/products/${deleteId}`, { method: 'DELETE' })
      .then(() => setProducts(products.filter(p => p._id !== deleteId)))
      .finally(() => {
        setOpenDelete(false)
        setDeleteId(null)
      })
  }

  if (!userChecked) return <main><Typography>Checking permissions...</Typography></main>
  if (loading) return <main><Typography>Loading...</Typography></main>
  if (error) return <main><Typography color="error">Error: {error}</Typography></main>

  return (
    <main>
      <Typography variant="h4" gutterBottom>Manage Products</Typography>
      <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={handleOpenCreate}>
        Create Product
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Image</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map(product => (
            <TableRow key={product._id}>
              <TableCell>
                {product.image_path &&
                  <img src={product.image_path} alt={product.name} style={{ width: 60, height: 60, objectFit: 'cover' }} />
                }
              </TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.price}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>{product.description}</TableCell>
              <TableCell>
                <Button size="small" onClick={() => handleOpenEdit(product)}>Edit</Button>
                <Button size="small" color="error" onClick={() => handleOpenDelete(product._id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Create/Edit Modal */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)}>
        <DialogTitle>{editingId ? 'Edit Product' : 'Create Product'}</DialogTitle>
        <Box component="form" onSubmit={handleFormSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 350 }}>
            <TextField
              label="Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
            <TextField
              label="Price"
              type="number"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              required
            />
            <TextField
              label="Category"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              required
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
            <Button variant="outlined" component="label">
              {imageFile ? imageFile.name : 'Upload Image'}
              <input type="file" accept="image/*" hidden onChange={handleImageChange} />
            </Button>
            {form.image_path && !imageFile && (
              <img src={form.image_path} alt="Current" style={{ width: 60, height: 60, objectFit: 'cover' }} />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenForm(false)}>Cancel</Button>
            <Button type="submit" variant="contained">{editingId ? 'Update' : 'Create'}</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this product?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </main>
  )
}

export default Manage
