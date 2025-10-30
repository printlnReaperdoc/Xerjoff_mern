import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Slider from '@mui/material/Slider'

function Shop() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [modalImage, setModalImage] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [review, setReview] = useState(0)
  const [reviewQuery, setReviewQuery] = useState(null) // null means no filter, show all
  const loader = useRef(null)

  // Fetch products with pagination and review filter
  useEffect(() => {
    setLoading(true)
    setError(null)
    let url = `/api/products?page=${page}&limit=12`
    if (query) url += `&name=${encodeURIComponent(query)}`
    // Only add review param if reviewQuery is not null
    if (reviewQuery !== null) url += `&review=${reviewQuery}`
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products')
        return res.json()
      })
      .then(data => {
        if (page === 1) {
          setProducts(data.products || data)
        } else {
          setProducts(prev => [...prev, ...(data.products || data)])
        }
        setHasMore(data.products ? data.products.length > 0 : data.length > 0)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
    // eslint-disable-next-line
  }, [query, page, reviewQuery])

  // Reset products and page when query or reviewQuery changes
  useEffect(() => {
    setProducts([])
    setPage(1)
    setHasMore(true)
  }, [query, reviewQuery])

  // Infinite scroll observer
  const handleObserver = useCallback((entries) => {
    const target = entries[0]
    if (target.isIntersecting && hasMore && !loading) {
      setPage(prev => prev + 1)
    }
  }, [hasMore, loading])

  useEffect(() => {
    const option = { root: null, rootMargin: '100px', threshold: 0 }
    const observer = new window.IntersectionObserver(handleObserver, option)
    if (loader.current) observer.observe(loader.current)
    return () => { if (loader.current) observer.unobserve(loader.current) }
  }, [handleObserver])

  const handleSearch = (e) => {
    e.preventDefault()
    setQuery(search)
  }

  const handleReviewFilter = () => {
    setReviewQuery(review)
  }

  const handleReset = () => {
    setSearch("")
    setQuery("")
    setReview(0)
    setReviewQuery(null) // <-- set to null so all products load
  }

  // Filter products by review on frontend if reviewQuery is not null
  const filteredProducts = reviewQuery !== null
    ? products.filter(product => Number(product.review) === Number(reviewQuery))
    : products

  if (loading && page === 1) return (
    <main>
      <Typography variant="h4">Shop Page</Typography>
      <Typography>Loading...</Typography>
    </main>
  )

  if (error) return (
    <main>
      <Typography variant="h4">Shop Page</Typography>
      <Typography color="error">Error: {error}</Typography>
    </main>
  )

  return (
    <main>
      <Typography variant="h4" gutterBottom>Shop Page</Typography>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="secondary"
          component={Link}
          to="/manage"
          sx={{ mb: 2 }}
        >
          Manage
        </Button>
      </Box>
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          type="text"
          placeholder="Search by product name"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
        />
        <Button type="submit" variant="contained">Search</Button>
        <Button type="button" variant="outlined" onClick={handleReset}>Reset</Button>
        {/* Review slider and confirm button */}
        <Box sx={{ width: 180, ml: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>Review: {review}</Typography>
          <Slider
            value={review}
            min={0}
            max={10}
            step={1}
            marks
            valueLabelDisplay="auto"
            onChange={(_, val) => setReview(val)}
            sx={{ mt: 1 }}
          />
        </Box>
        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={() => setReviewQuery(review)}
          sx={{ height: 40 }}
        >
          Confirm Review Filter
        </Button>
        <Button
          type="button"
          variant="outlined"
          color="secondary"
          onClick={() => setReviewQuery(null)}
          sx={{ height: 40 }}
        >
          Reset Review Filter
        </Button>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {filteredProducts.length === 0 ? (
          <Typography>No products found.</Typography>
        ) : (
          filteredProducts.map(product => (
            <Card key={product._id} sx={{ width: 220, display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="120"
                image={product.image_path}
                alt={product.name}
                sx={{ objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => {
                  setModalImage(product.image_path)
                  setModalOpen(true)
                }}
              />
              <CardContent>
                <Typography variant="h6" component={Link} to={`/product/${product.slug}`} sx={{ textDecoration: 'none', color: 'primary.main' }}>
                  {product.name}
                </Typography>
                <Typography variant="body2">{product.description}</Typography>
                <Typography variant="body2" color="text.secondary">Category: {product.category}</Typography>
                <Typography variant="body2" color="text.secondary">Price: ${product.price}</Typography>
                <Typography variant="body2" color="text.secondary">Review: {product.review}</Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* Infinite scroll loader + messages */}
      <>
        <div ref={loader} />
        {loading && page > 1 && (
          <Typography sx={{ mt: 2 }}>Loading more...</Typography>
        )}
        {!hasMore && products.length > 0 && (
          <Typography sx={{ mt: 2 }}>No more products.</Typography>
        )}
      </>

      {/* Image modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="product-image-modal"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{ position: 'relative', outline: 'none', maxWidth: '90vw', maxHeight: '90vh' }}>
          <IconButton
            aria-label="close"
            onClick={() => setModalOpen(false)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: (theme) => theme.palette.grey[500],
              zIndex: 1,
              background: 'rgba(255,255,255,0.7)'
            }}
          >
            <CloseIcon />
          </IconButton>
          {modalImage && (
            <img
              src={modalImage}
              alt="Product"
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8, boxShadow: '0 2px 16px rgba(0,0,0,0.3)' }}
            />
          )}
        </Box>
      </Modal>
    </main>
  )
}

export default Shop
