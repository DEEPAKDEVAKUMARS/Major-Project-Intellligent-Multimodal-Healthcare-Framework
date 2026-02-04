const request = require('supertest')
const app = require('../../backend/server')
const sqlite3 = require('sqlite3')
const { open } = require('sqlite')
const path = require('path')

describe('Backend API Tests', () => {
  let db

  beforeAll(async () => {
    // Set up test database
    const dbPath = path.join(__dirname, '../../backend/test-mindmate.db')
    // Remove existing test DB if present to start with a clean slate
    try {
      const fs = require('fs')
      if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath)
      }
    } catch (err) {
      console.warn('Could not remove old test DB:', err.message)
    }

    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    // Initialize server DB connection to point at the test DB without starting the HTTP listener
    const server = require('../../backend/server')
    if (server.initializeDBandServer) {
      await server.initializeDBandServer({ dbPath, noListen: true })
    }

    // Create test tables
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        aadhar_number TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        family_members TEXT NOT NULL,
        user_type TEXT NOT NULL,
        gender TEXT NOT NULL,
        password_hash TEXT NOT NULL
      )
    `)

    await db.exec(`
      CREATE TABLE IF NOT EXISTS ration_stock (
        item_id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_name TEXT NOT NULL,
        available_quantity INTEGER NOT NULL,
        unit TEXT NOT NULL,
        price_per_unit REAL NOT NULL,
        item_url TEXT NOT NULL
      )
    `)

    await db.exec(`
      CREATE TABLE IF NOT EXISTS cart (
        cart_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (user_id)
      )
    `)

    await db.exec(`
      CREATE TABLE IF NOT EXISTS cart_products (
        cart_product_id INTEGER PRIMARY KEY AUTOINCREMENT,
        cart_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price_per_unit REAL NOT NULL,
        total_price REAL NOT NULL,
        FOREIGN KEY (cart_id) REFERENCES cart (cart_id),
        FOREIGN KEY (item_id) REFERENCES ration_stock (item_id),
        UNIQUE(cart_id, item_id)
      )
    `)

    await db.exec(`
      CREATE TABLE IF NOT EXISTS bookings (
        booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
        cart_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        total_cost REAL NOT NULL,
        aadhar_number TEXT NOT NULL,
        delivery_method TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        special_requests TEXT,
        confirmed TEXT DEFAULT 'NO',
        paid TEXT DEFAULT 'NO',
        booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cart_id) REFERENCES cart (cart_id),
        FOREIGN KEY (user_id) REFERENCES users (user_id)
      )
    `)

    await db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        total_amount REAL NOT NULL,
        order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        confirmed TEXT DEFAULT 'NO',
        paid TEXT DEFAULT 'NO',
        pickup_time TEXT,
        secret_code TEXT,
        FOREIGN KEY (booking_id) REFERENCES bookings (booking_id),
        FOREIGN KEY (user_id) REFERENCES users (user_id)
      )
    `)

    await db.exec(`
      CREATE TABLE IF NOT EXISTS order_products (
        order_product_id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price_per_unit REAL NOT NULL,
        total_price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (order_id),
        FOREIGN KEY (item_id) REFERENCES ration_stock (item_id)
      )
    `)

    // Insert test data
    await db.run(`
      INSERT INTO users (name, aadhar_number, phone, address, family_members, user_type, gender, password_hash)
      VALUES ('Test User', '123456789012', '9876543210', '123 Test St', '4', 'citizen', 'male', '$2b$10$testhash')
    `)

    await db.run(`
      INSERT INTO ration_stock (item_name, available_quantity, unit, price_per_unit, item_url)
      VALUES ('Rice', 100, 'kg', 50.0, 'https://example.com/rice.jpg')
    `)
  })

  afterAll(async () => {
    if (db) {
      await db.close()
    }
  })

  describe('POST /signup', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        aadhar_number: '987654321098',
        phone: '9876543210',
        address: '456 Main St',
        family_members: '3',
        user_type: 'citizen',
        gender: 'male',
        password: 'password123'
      }

      const response = await request(app)
        .post('/signup')
        .send(userData)
        .expect(201)

      expect(response.body.message).toBe('User registered successfully')
    })

    test('should return error for missing fields', async () => {
      const userData = {
        name: 'John Doe',
        // Missing other required fields
      }

      const response = await request(app)
        .post('/signup')
        .send(userData)
        .expect(400)

      expect(response.body.error).toBe('All fields are required')
    })

    test('should return error for short password', async () => {
      const userData = {
        name: 'John Doe',
        aadhar_number: '987654321099',
        phone: '9876543210',
        address: '456 Main St',
        family_members: '3',
        user_type: 'citizen',
        gender: 'male',
        password: '123'
      }

      const response = await request(app)
        .post('/signup')
        .send(userData)
        .expect(400)

      expect(response.body.error).toBe('Password must be at least 5 characters long')
    })

    test('should return error for existing user', async () => {
      const userData = {
        name: 'Test User',
        aadhar_number: '123456789012', // Already exists
        phone: '9876543210',
        address: '123 Test St',
        family_members: '4',
        user_type: 'citizen',
        gender: 'male',
        password: 'password123'
      }

      const response = await request(app)
        .post('/signup')
        .send(userData)
        .expect(400)

      expect(response.body.error).toBe('User already exists')
    })
  })

  describe('POST /login', () => {
    test('should login successfully with valid credentials', async () => {
      const loginData = {
        aadhar_number: '123456789012',
        password: 'testpassword'
      }

      // Mock bcrypt.compare to return true for test
      const bcrypt = require('bcrypt')
      const originalCompare = bcrypt.compare
      bcrypt.compare = jest.fn().mockResolvedValue(true)

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(200)

      expect(response.body.message).toBe('Login successful')
      expect(response.body.user).toBeDefined()
      expect(response.body.user.name).toBe('Test User')

      // Restore original function
      bcrypt.compare = originalCompare
    })

    test('should return error for missing credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({})
        .expect(400)

      expect(response.body.error).toBe('Aadhar number and password are required')
    })

    test('should return error for invalid user', async () => {
      const loginData = {
        aadhar_number: '999999999999',
        password: 'password123'
      }

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(400)

      expect(response.body.error).toBe('Invalid user')
    })
  })

  describe('GET /vendorstockmanagement', () => {
    test('should return stock items', async () => {
      const response = await request(app)
        .get('/vendorstockmanagement')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThan(0)
      expect(response.body[0]).toHaveProperty('item_name')
      expect(response.body[0]).toHaveProperty('available_quantity')
    })
  })

  describe('POST /addToCart', () => {
    test('should add item to cart successfully', async () => {
      const cartData = {
        user_id: 1,
        item_id: 1,
        quantity: 2,
        price_per_unit: 50.0
      }

      const response = await request(app)
        .post('/addToCart')
        .send(cartData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Product added to cart.')
    })

    test('should return error for missing fields', async () => {
      const response = await request(app)
        .post('/addToCart')
        .send({})
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('All fields are required.')
    })
  })

  describe('GET /cartproduct/:user_id', () => {
    test('should return cart items for user', async () => {
      const response = await request(app)
        .get('/cartproduct/1')
        .expect(200)

      expect(response.body).toHaveProperty('cartItems')
      expect(response.body).toHaveProperty('grandTotal')
      expect(Array.isArray(response.body.cartItems)).toBe(true)
    })

    test('should return empty cart for user with no items', async () => {
      const response = await request(app)
        .get('/cartproduct/999')
        .expect(200)

      expect(response.body.cartItems).toEqual([])
      expect(response.body.grandTotal).toBe(0)
    })
  })

  describe('POST /createBooking/:user_id', () => {
    test('should create booking successfully', async () => {
      // First add item to cart
      await request(app)
        .post('/addToCart')
        .send({
          user_id: 1,
          item_id: 1,
          quantity: 2,
          price_per_unit: 50.0
        })

      const bookingData = {
        cart_id: 1,
        name: 'Test User',
        address: '123 Test St',
        total_cost: 100.0,
        aadhar_number: '123456789012',
        delivery_method: 'pickup',
        payment_method: 'cash',
        special_requests: 'None'
      }

      const response = await request(app)
        .post('/createBooking/1')
        .send(bookingData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.booking_id).toBeDefined()
      expect(response.body.order_id).toBeDefined()
    })
  })
})
