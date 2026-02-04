const express = require('express');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { open } = require('sqlite');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors()); // Allow frontend requests

let dbPath = path.join(__dirname, 'mindmate.db');
let db;

// Initialize SQLite Database
const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    // Only start listening when not running tests.
    if (process.env.NODE_ENV !== 'test') {
      const port = process.env.PORT || 5000
      app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
      });
    }
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

// Export app so tests can import it. Also export an initializer below.
module.exports = app;

// Exported initializer so tests / start scripts can call it with a test DB path
module.exports.initializeDBandServer = async (options = {}) => {
  // allow overriding the DB path via options or env var
  if (options.dbPath) {
    dbPath = options.dbPath
  } else if (process.env.TEST_DB_PATH) {
    dbPath = process.env.TEST_DB_PATH
  }

  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    // do not listen when tests pass noListen or when NODE_ENV is test
    if (!options.noListen && process.env.NODE_ENV !== 'test') {
      const port = options.port || process.env.PORT || 5000
      app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
      });
    }
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    throw error
  }
}

// If this file is run directly, initialize and start the server.
if (require.main === module) {
  (async () => {
    try {
      await module.exports.initializeDBandServer({ noListen: false })
    } catch (err) {
      console.error('Failed to start server:', err)
      process.exit(1)
    }
  })()
}

app.post('/signup', async (req, res) => {
  try {
    const { name, aadhar_number, phone, address, family_members, user_type, gender, password } = req.body;

    // Validate required fields
    if (!name || !aadhar_number || !phone || !address || !family_members || !user_type || !gender || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await db.get(`SELECT * FROM users WHERE aadhar_number = ?`, [aadhar_number]);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    if (password.length < 5) {
      return res.status(400).json({ error: 'Password must be at least 5 characters long' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await db.run(
      `INSERT INTO users (name, aadhar_number, phone, address, family_members, user_type, gender, password_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, aadhar_number, phone, address, family_members, user_type, gender, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    console.log("➡️ Received login request:", req.body);
    
    const { aadhar_number, password } = req.body;
    
    // Validate input
    if (!aadhar_number || !password) {
      console.log("❌ Missing credentials");
      return res.status(400).json({ error: 'Aadhar number and password are required' });
    }

    // Database query
    console.log("🔍 Querying database for aadhar number:", aadhar_number);
    const user = await db.get(
      `SELECT user_id, name, user_type, password_hash, address, aadhar_number
       FROM users 
       WHERE aadhar_number = ?`,
      [aadhar_number]
    );

    if (!user) {
      console.log("❌ User not found");
      return res.status(400).json({ error: 'Invalid user' });
    }

    // Password check
    console.log("🔑 Verifying password...");
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      console.log("❌ Invalid password");
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Successful login
    console.log("✅ Login success. User:", user);
    res.status(200).json({ 
      message: 'Login successful', 
      user: { 
        user_id: user.user_id,
        name: user.name, 
        user_type: user.user_type,
        address: user.address,
        aadhar_number: user.aadhar_number
      } 
    });

  } catch (error) {
    console.error("💥 SERVER ERROR:", error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});


//Get Ration Stock Details
app.get("/vendorstockmanagement", async (req, res) => {
  try {
    const query = "SELECT * FROM ration_stock;";

    const stockItems = await db.all(query); // Fetch data asynchronously
    

    res.json(stockItems); // Send response to frontend
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/updateStock", async (req, res) => {
  const { item_id, available_quantity } = req.body;

  if (!item_id || available_quantity < 0) {
      return res.status(400).json({ message: "Invalid item_id or quantity." });
  }

  const updateQuery = "UPDATE ration_stock SET available_quantity = ? WHERE item_id = ?";

  try {
      await db.run(updateQuery, [available_quantity, item_id]);
      res.json({ message: "Stock updated successfully.", item_id, available_quantity });
  } catch (err) {
      res.status(500).json({ message: "Database update failed.", error: err.message });
  }
});app.put("/updateStock", async (req, res) => {
  const { item_id, available_quantity } = req.body;

  if (!item_id || available_quantity < 0) {
    return res.status(400).json({ 
      success: false,
      message: "Invalid item_id or quantity." 
    });
  }

  const updateQuery = "UPDATE ration_stock SET available_quantity = ? WHERE item_id = ?";

  try {
    await db.run(updateQuery, [available_quantity, item_id]);
    res.status(200).json({ 
      success: true,
      message: "Stock updated successfully.", 
      item_id, 
      available_quantity 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: "Database update failed.", 
      error: err.message 
    });
  }
});

// ADD PRODUCT IN RATION_STOCK
app.post("/addProduct", async(req, res)=>{
  const{item_name, unit, price_per_unit, item_url, available_quantity}=req.body

  if(!item_name || !unit || !price_per_unit || !item_url || !available_quantity ){
    return res.status(400).json({
      success:false,
      message:"All fields are requires"
    });
  }

  try{
    await db.run(
      `INSERT INTO ration_stock(item_name,available_quantity, unit, price_per_unit, item_url)
      VALUES(?,?,?,?,?);`,
      [item_name,available_quantity,unit,price_per_unit,item_url]
    );
    res.status(201).json({
      success:true,
      message:"Product added successfully."
    })
  }catch(err){
    res.status(500).json({ 
      success: false, 
      message: "Database error.", 
      error: err.message 
  })
}})

// Backend route to add item to cart
// Add to Cart
app.post("/addToCart", async (req, res) => {
  const { user_id, item_id, quantity, price_per_unit } = req.body;

  if (!user_id || !item_id || !quantity || !price_per_unit) {
    return res.status(400).json({
      success: false,
      message: "All fields are required."
    });
  }

  const total_price = quantity * price_per_unit; // Calculate total price

  try {
    // Check if the user already has a cart
    let cart = await db.get("SELECT cart_id FROM cart WHERE user_id = ?", [user_id]);

    // If no cart exists, create a new one
    if (!cart) {
      const result = await db.run("INSERT INTO cart (user_id) VALUES (?)", [user_id]);
      cart = { cart_id: result.lastID };
    }

    // Insert or update the product in the cart_products table
    await db.run(
      `INSERT INTO cart_products (cart_id, item_id, quantity, price_per_unit, total_price) 
       VALUES (?, ?, ?, ?, ?) 
       ON CONFLICT(cart_id, item_id) 
       DO UPDATE SET quantity = ?, total_price = ?`,
      [cart.cart_id, item_id, quantity, price_per_unit, total_price, quantity, total_price]
    );

    res.status(201).json({
      success: true,
      message: "Product added to cart."
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Database error.",
      error: err.message
    });
  }
});

// Backend route to fetch cart items for a user
app.get('/cartproduct/:user_id', async (req, res) => {
  try {
      const userId = req.params.user_id;

      // SQL query to fetch cart items and grand total
      const cartItems = await db.all(
          `SELECT 
              cart.cart_id,
              cart.user_id,
              cart_products.item_id,
              cart_products.quantity,
              cart_products.cart_product_id,
              cart_products.price_per_unit,
              ration_stock.item_name,
              ration_stock.item_url,
              (cart_products.quantity * cart_products.price_per_unit) AS total_price,
              (SELECT SUM(cart_products.quantity * cart_products.price_per_unit) 
               FROM cart_products
               WHERE cart_products.cart_id = cart.cart_id) AS grand_total_price
          FROM cart 
          INNER JOIN cart_products ON cart.cart_id = cart_products.cart_id
          INNER JOIN ration_stock ON cart_products.item_id = ration_stock.item_id
          WHERE cart.user_id = ?`, 
          [userId]
      );

      // ✅ Always return 200 with either cart items or an empty list
      if (!cartItems.length) {
          return res.status(200).json({ cartItems: [], grandTotal: 0 });
      }

      // Extract grand total
      const grandTotal = cartItems[0].grand_total_price;

      res.status(200).json({ cartItems, grandTotal });
  } catch (error) {
      console.error("Backend Error:", error);
      res.status(500).json({ message: "Server error" });
  }
});



app.delete("/removeFromCart/:cart_product_id", async (req, res) => {
  const { cart_product_id } = req.params;

  if (!cart_product_id) {
    return res.status(400).json({ success: false, message: "Cart product ID is required" });
  }

  try {
    const result = await db.run("DELETE FROM cart_products WHERE cart_product_id = ?", [cart_product_id]);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: "Item not found in cart" });
    }

    res.status(200).json({ success: true, message: "Item removed successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, message: "Failed to delete item" });
  }
});


//GRAND TOTAL OF CART

app.get('/getGrandTotal/:user_id', (req, res) => {
  const userId = req.params.user_id;

  const query = `
      SELECT SUM(cart_products.total_price) AS grand_total
      FROM cart
      INNER JOIN cart_products ON cart_products.cart_id = cart.cart_id
      WHERE cart.user_id = ?
      LIMIT 1
  `;

  db.get(query, [userId], (err, row) => {
      if (err) {
          console.error("Error fetching grand total:", err);
          return res.status(500).json({ error: "Internal server error" });
      }

      res.json({ grand_total: row?.grand_total || 0 });
  });
});

//INSERT BOOKING DETAILS
app.post("/createBooking/:user_id", async (req, res) => {
  const user_id = parseInt(req.params.user_id, 10);
  const { cart_id, name, address, total_cost, aadhar_number, delivery_method, payment_method, special_requests } = req.body;

  try {
    await db.run("BEGIN TRANSACTION");

    // 1. Verify cart ownership
    const cart = await db.get(
      `SELECT cart_id, user_id FROM cart 
       WHERE cart_id = ? AND user_id = ?`,
      [cart_id, user_id]
    );
    
    if (!cart) {
      await db.run("ROLLBACK");
      return res.status(400).json({ error: "Invalid cart" });
    }

    // Calculate payment status once
    const paidStatus = payment_method === 'card' ? 'YES' : 'NO';

    // 2. Create booking
    const bookingResult = await db.run(
      `INSERT INTO bookings (
        cart_id, user_id, name, address, total_cost,
        aadhar_number, delivery_method, payment_method,
        special_requests, confirmed, paid
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cart_id,
        user_id,
        name,
        address,
        total_cost,
        aadhar_number.toString().padEnd(12, ' '),
        delivery_method,
        payment_method,
        special_requests || 'None',
        'NO',
        paidStatus
      ]
    );

    // 3. Create main order record
    const orderResult = await db.run(
      `INSERT INTO orders (
        booking_id, user_id, total_amount, paid
      ) VALUES (?, ?, ?, ?)`,
      [bookingResult.lastID, user_id, total_cost, paidStatus]
    );
    const order_id = orderResult.lastID;
    
    // 4. Move cart items to order_products
    await db.run(
      `INSERT INTO order_products (
        order_id, item_id, quantity, price_per_unit, total_price
      )
      SELECT 
        ?, 
        cp.item_id,
        cp.quantity,
        cp.price_per_unit,
        cp.total_price
      FROM cart_products cp
      WHERE cp.cart_id = ?`,
      [order_id, cart_id]
    );

    // 5. Cleanup cart
    await db.run(`DELETE FROM cart_products WHERE cart_id = ?`, [cart_id]);
    await db.run(`DELETE FROM cart WHERE cart_id = ?`, [cart_id]);

    await db.run("COMMIT");

    res.status(201).json({
      success: true,
      booking_id: bookingResult.lastID,
      order_id: order_id,
      cart_deleted: true
    });

  } catch (err) {
    await db.run("ROLLBACK");
    console.error("Error:", err);
    res.status(500).json({
      success: false,
      error: "Transaction failed",
      details: err.message
    });
  }
});
// Get detailed items from cart using cart_id
app.get('/booking-details/:booking_id', async (req, res) => {
  try {
    const bookingId = req.params.booking_id;
    const orderDetails = await db.all(
      `SELECT 
        orders.order_id,
        order_products.order_product_id,
        ration_stock.item_name,
        order_products.item_id,
        order_products.quantity,
        order_products.total_price,
        orders.total_amount
      FROM orders 
      INNER JOIN order_products ON order_products.order_id = orders.order_id 
      INNER JOIN ration_stock ON ration_stock.item_id = order_products.item_id
      WHERE orders.booking_id = ?`,
      [bookingId]
    );
    res.status(200).json(orderDetails);
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
app.get('/vendorBookingData', async (req, res) => {
  try {
    const bookings = await db.all(`
      SELECT 
        bookings.booking_id,
        bookings.aadhar_number,
        bookings.total_cost,
        bookings.delivery_method,
        bookings.confirmed,
        bookings.paid,
        bookings.name,
        bookings.booking_date
      FROM bookings
      ORDER BY bookings.booking_date DESC
      LIMIT 100
    `);
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching booking list:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/orders/:user_id", async (req, res) => {
  try {
    const userId = req.params.user_id;
    
    const orders = await db.all(`
      SELECT 
        o.order_id,
        o.total_amount,
        o.order_date,
        b.delivery_method,
        o.paid AS payment_status,
        o.confirmed AS delivery_status,
        o.secret_code,
        o.pickup_time
      FROM orders o
      JOIN bookings b ON o.booking_id = b.booking_id
      WHERE o.user_id = ?
      ORDER BY o.order_date DESC
    `, [userId]);

    for (const order of orders) {
      const products = await db.all(`
        SELECT 
          op.*,
          rs.item_name,
          rs.item_url
        FROM order_products op
        JOIN ration_stock rs ON op.item_id = rs.item_id
        WHERE op.order_id = ?
      `, [order.order_id]);
      
      order.products = products;
    }

    res.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

//GENERATING SECRET KEY AND DATETIME
// Add this endpoint to your server
// Generate secret code and confirm pickup order
// Update Order (Pickup confirmation)
app.put('/orders/:booking_id', async (req, res) => {
  
  try {
    const bookingId = req.params.booking_id;
    const { pickup_time, secret_code } = req.body;

    await db.run("BEGIN TRANSACTION");

    // 1. Update orders table
    await db.run(
      `UPDATE orders SET
        pickup_time = ?,
        secret_code = ?,
        confirmed = 'YES'
      WHERE booking_id = ?`,
      [pickup_time, secret_code, bookingId]
    );

    // 2. Update bookings table
    await db.run(
      `UPDATE bookings SET confirmed = 'YES' 
       WHERE booking_id = ?`,
      [bookingId]
    );

    // 3. Verify stock before deduction
    const orderProducts = await db.all(
      `SELECT op.item_id, op.quantity, rs.available_quantity
       FROM order_products op
       JOIN orders o ON op.order_id = o.order_id
       JOIN ration_stock rs ON op.item_id = rs.item_id
       WHERE o.booking_id = ?`, 
      [bookingId]
    );

    // Check stock availability
    for (const product of orderProducts) {
      if (product.available_quantity < product.quantity) {
        throw new Error(`Insufficient stock for item ${product.item_id}`);
      }
    }

    // Deduct stock
    for (const product of orderProducts) {
      await db.run(
        `UPDATE ration_stock 
         SET available_quantity = available_quantity - ?
         WHERE item_id = ?`,
        [product.quantity, product.item_id]
      );
    }

    await db.run("COMMIT");

    res.json({ 
      success: true,
      confirmed: 'YES',
      pickup_time,
      secret_code
    });

  } catch (error) {
    await db.run("ROLLBACK");
    console.error("Error:", error);
    res.status(500).json({ 
      error: "Failed to update order",
      details: error.message 
    });
  }
});

// Confirm Delivery Order
app.put('/orders/:booking_id/confirm', async (req, res) => {
  
  try {
    const bookingId = req.params.booking_id;
    
    await db.run("BEGIN TRANSACTION");

    // 1. Update both tables
    await db.run(
      `UPDATE orders SET confirmed = 'YES' 
       WHERE booking_id = ?`,
      [bookingId]
    );

    await db.run(
      `UPDATE bookings SET confirmed = 'YES' 
       WHERE booking_id = ?`,
      [bookingId]
    );

    // 2. Reduce stock quantities
    const orderProducts = await db.all(
      `SELECT op.item_id, op.quantity 
       FROM order_products op
       JOIN orders o ON op.order_id = o.order_id
       WHERE o.booking_id = ?`, 
      [bookingId]
    );

    for (const product of orderProducts) {
      await db.run(
        `UPDATE ration_stock 
         SET available_quantity = available_quantity - ?
         WHERE item_id = ?`,
        [product.quantity, product.item_id]
      );
    }

    await db.run("COMMIT");

    res.json({ success: true });

  } catch (error) {
    await db.run("ROLLBACK");
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to confirm order" });
  }
});
// Add this to your backend
app.get('/orders/:booking_id', async (req, res) => {
  try {
    const bookingId = req.params.booking_id;
    const order = await db.get(
      `SELECT * FROM orders WHERE booking_id = ?`,
      [bookingId]
    );
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    res.json(order);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
});

// Enhanced psychiatrists endpoint

app.get('/api/nearby', async (req, res) => {
  const { lat, lng } = req.query;
  const API_KEY="AIzaSyCqvvrrhUSq5Hx3PLdCmIZhjzQ8V_ZKpXM"
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&keyword=psychiatrist&key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch from Google API' });
  }
});

// Ophthalmologist endpoint
app.get('/api/nearby-ophthalmologist', async (req, res) => {
  const { lat, lng } = req.query;
  const API_KEY="AIzaSyCqvvrrhUSq5Hx3PLdCmIZhjzQ8V_ZKpXM"
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&keyword=ophthalmologist&key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch from Google API' });
  }
});

// Geocoding endpoint
app.get('/api/geocode', async (req, res) => {
  const { lat, lng } = req.query;
  const API_KEY = "AIzaSyCqvvrrhUSq5Hx3PLdCmIZhjzQ8V_ZKpXM";
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch from Google API' });
  }
});




module.exports = app;

  