import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from frontend/public for image access
app.use('/public', express.static(path.join(process.cwd(), '../frontend/public')));

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(process.cwd(), '../frontend/public/uploads');
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// Product model
const productSchema = new mongoose.Schema({
  name: String,
  slug: String, // added slug
  description: String,
  price: Number,
  category: String,
  review: Number, // out of 10
  image_path: String, // added image_path
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// User model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  status_id: Number,
  role_id: Number,
  profileImage: { type: String, default: "defaultuserpic.png" },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Example route
app.get("/api", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// GET all products (with optional name filter)
app.get('/api/products', async (req, res) => {
  try {
    const { name } = req.query;
    let filter = {};
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET product by slug
app.get('/api/products/slug/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload image endpoint
app.post('/api/products/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // The image will be accessible at /public/uploads/filename
  const image_path = `/public/uploads/${req.file.filename}`;
  res.json({ image_path });
});

// Upload profile image endpoint
app.post('/api/upload-profile-image', upload.single('profileImage'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Only return the filename, not the full path
  res.json({ filename: `uploads/${req.file.filename}` });
});

// Serve uploaded profile images
app.use('/uploads', express.static(path.join(process.cwd(), '../frontend/public/uploads')));


// Create product
app.post('/api/products', async (req, res) => {
  try {
    const { name, slug, description, price, category, image_path } = req.body;
    const product = new Product({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description,
      price,
      category,
      review: 0, // always set to 0 on creation
      image_path,
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { name, slug, description, price, category, review, image_path } = req.body;
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        description,
        price,
        category,
        review,
        image_path,
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Register route
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, status_id, role_id, profileImage } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, status_id, role_id, profileImage });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (user.status_id === 2) {
      return res.status(403).json({ error: 'User is deactivated' });
    }
    res.json({ 
      message: 'Login successful', 
      user: { 
        name: user.name, 
        email: user.email, 
        status_id: user.status_id, 
        role_id: user.role_id,
        profileImage: user.profileImage || 'defaultuserpic.png'
      } 
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout route (dummy, for extensibility)
app.post('/api/logout', (req, res) => {
  // For stateless JWT, client just deletes token. For sessions, destroy session here.
  res.json({ message: 'Logged out' });
});

// GET all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // exclude password for security
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE user
app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, email, status_id, role_id, profileImage, password } = req.body;

    let updateFields = { name, email, status_id, role_id, profileImage };

    // If password is provided, hash it before updating
    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    ).select('-password'); // exclude password from response

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
