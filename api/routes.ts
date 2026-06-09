import { Router, Request, Response } from 'express';
import { query } from './config/database';
import { validate } from './middleware/validate';
import { generateToken, verifyToken, rlsCheck } from './middleware/auth';
import { sendEmail } from './utils/mailer';
import {
  DuplicateCheckSchema,
  UserSignupSchema,
  UserLoginSchema,
  UserUpdateSchema,
  PasswordChangeSchema,
  PasswordResetSchema,
  EmailCheckSchema,
  AddressCreateSchema,
  OrderCreateSchema,
  OrderStatusUpdateSchema,
  CouponCreateSchema,
  SettingsUpdateSchema,
  AdminLoginSchema,
  FrontStatsUpdateSchema,
  CookieConsentCreateSchema,
  SubscriberCreateSchema,
  PublishReqCreateSchema,
  ContactMsgCreateSchema,
  BookCreateSchema,
  SupabaseLoginSchema
} from './schemas';

const router = Router();

// Helper to format dates like Python's datetime.date.today().strftime("%Y-%m-%d")
function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to format date-times like %Y-%m-%d %H:%M:%S
function getNowDateTimeString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// ─── ROUTES: USERS ────────────────────────────────────────────────────────

router.post('/users/check-duplicate', validate(DuplicateCheckSchema), async (req: Request, res: Response) => {
  const { email, phone } = req.body;
  const users = await query('SELECT id FROM users WHERE email=? OR phone=?', [email, phone]);
  if (users.length > 0) {
    return res.status(409).json({ detail: 'Account already exists. Please login instead.' });
  }
  return res.json({ exists: false });
});

router.post('/users', validate(UserSignupSchema), async (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body;
  
  const existing = await query('SELECT id FROM users WHERE email=? OR phone=?', [email, phone]);
  if (existing.length > 0) {
    return res.status(409).json({ detail: 'Account already exists. Please login instead.' });
  }

  const result = await query(
    'INSERT INTO users (name, email, phone, password, status, profile_image) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, phone, password, 'Logged In', '']
  );
  const userObj = {
    id: result.insertId,
    name,
    email,
    phone,
    status: 'Logged In',
    profile_image: ''
  };
  const token = generateToken({ id: userObj.id, email: userObj.email, role: 'User' });
  return res.json({ user: userObj, token });
});
router.post('/users/login', validate(UserLoginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body;

  let isAdmin = false;
  let adminName = '';
  let adminRole = 'Admin';

  if (email === 'awesh.etpl@gmail.com' && password === 'Mariyam@2026') {
    isAdmin = true;
    adminName = 'Developer Admin';
    adminRole = 'Developer';
  } else if (email === 'prprince46@gmail.com' && password === 'Prince@2004') {
    isAdmin = true;
    adminName = 'Master Admin';
    adminRole = 'Master Admin';
  } else if (email === 'admin@evercraft.com' && (password === 'admin' || password === 'admin123')) {
    isAdmin = true;
    adminName = 'Admin';
    adminRole = 'Master Admin';
  } else {
    // Check admins table
    const admins = await query('SELECT * FROM admins WHERE email=? AND password=?', [email, password]);
    if (admins.length > 0) {
      isAdmin = true;
      adminName = admins[0].name || 'Admin';
      adminRole = admins[0].role || 'Admin';
    }
  }

  if (isAdmin) {
    // Ensure they exist in the users table and log them in
    const dbUsers = await query('SELECT * FROM users WHERE email=?', [email]);
    let user;
    if (dbUsers.length > 0) {
      user = dbUsers[0];
      await query("UPDATE users SET status='Logged In', role=? WHERE id=?", [adminRole, user.id]);
      user.status = 'Logged In';
      user.role = adminRole;
    } else {
      const result = await query(
        "INSERT INTO users (name, email, phone, password, status, profile_image, role) VALUES (?, ?, ?, ?, 'Logged In', '', ?)",
        [adminName, email, '9999999999', password, adminRole]
      );
      user = {
        id: result.insertId,
        name: adminName,
        email,
        phone: '9999999999',
        status: 'Logged In',
        profile_image: '',
        role: adminRole
      };
    }
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return res.json({ user, token });
  }

  const users = await query('SELECT * FROM users WHERE email=? AND password=?', [email, password]);
  
  if (users.length > 0) {
    const user = users[0];
    await query("UPDATE users SET status='Logged In' WHERE id=?", [user.id]);
    user.status = 'Logged In';
    const token = generateToken({ id: user.id, email: user.email, role: user.role || 'User' });
    return res.json({ user, token });
  }
  
  return res.status(401).json({ detail: 'Invalid credentials' });
});

router.post('/users/supabase-login', validate(SupabaseLoginSchema), async (req: Request, res: Response) => {
  const { email, name, profile_image } = req.body;
  try {
    const existing = await query('SELECT * FROM users WHERE email=?', [email]);
    if (existing.length > 0) {
      const user = existing[0];
      await query("UPDATE users SET status='Logged In' WHERE id=?", [user.id]);
      user.status = 'Logged In';
      const token = generateToken({ id: user.id, email: user.email, role: user.role || 'User' });
      return res.json({ user, token });
    } else {
      const dummyPhone = '';
      const dummyPassword = 'oauth_managed_' + Math.random().toString(36).slice(-8);
      const result = await query(
        'INSERT INTO users (name, email, phone, password, status, profile_image) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, dummyPhone, dummyPassword, 'Logged In', profile_image || '']
      );
      const userObj = {
        id: result.insertId,
        name,
        email,
        phone: dummyPhone,
        status: 'Logged In',
        profile_image: profile_image || ''
      };
      const token = generateToken({ id: userObj.id, email: userObj.email, role: 'User' });
      return res.json({ user: userObj, token });
    }
  } catch (err: any) {
    console.error("❌ Supabase OAuth Login Error:", err);
    return res.status(500).json({ detail: err.message || 'Internal Server Error' });
  }
});

router.put('/users/:user_id', verifyToken, rlsCheck, validate(UserUpdateSchema), async (req: Request, res: Response) => {
  const userId = parseInt(req.params.user_id);
  const { name, email, phone, profile_image } = req.body;
  
  await query(
    'UPDATE users SET name=?, email=?, phone=?, profile_image=? WHERE id=?',
    [name, email, phone, profile_image, userId]
  );
  
  const users = await query('SELECT * FROM users WHERE id=?', [userId]);
  return res.json(users[0]);
});

router.post('/users/logout/:user_id', verifyToken, rlsCheck, async (req: Request, res: Response) => {
  const userId = parseInt(req.params.user_id);
  await query("UPDATE users SET status='Offline' WHERE id=?", [userId]);
  return res.json({ message: 'Logged out' });
});

router.post('/users/:user_id/password', verifyToken, rlsCheck, validate(PasswordChangeSchema), async (req: Request, res: Response) => {
  const userId = parseInt(req.params.user_id);
  const { new_password } = req.body;
  await query('UPDATE users SET password=? WHERE id=?', [new_password, userId]);
  return res.json({ message: 'Password updated successfully' });
});

router.post('/users/reset-password', validate(PasswordResetSchema), async (req: Request, res: Response) => {
  const { email, new_password } = req.body;
  const users = await query('SELECT * FROM users WHERE email=?', [email]);
  
  if (users.length === 0) {
    return res.status(404).json({ detail: 'User with this email does not exist.' });
  }
  
  await query('UPDATE users SET password=? WHERE email=?', [new_password, email]);
  return res.json({ message: 'Password updated successfully' });
});

router.post('/users/check-email', validate(EmailCheckSchema), async (req: Request, res: Response) => {
  const { email } = req.body;
  const users = await query('SELECT id FROM users WHERE email=?', [email]);
  
  if (users.length === 0) {
    return res.status(404).json({ detail: 'User with this email does not exist.' });
  }
  return res.json({ exists: true });
});

// ─── ROUTES: OTP & CART SYNC ──────────────────────────────────────────────

router.post('/users/send-otp', async (req: Request, res: Response) => {
  try {
    const { email, type } = req.body; // type can be 'signup' or 'reset'
    if (!email) {
      return res.status(400).json({ detail: 'Email is required' });
    }
    
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Expire in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const expiresStr = expiresAt.toISOString().slice(0, 19).replace('T', ' '); // YYYY-MM-DD HH:MM:SS
    
    // Store in DB
    await query('INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, ?)', [email, otp, expiresStr]);
    
    const isReset = type === 'reset';
    const emailSubject = isReset
      ? `${otp} is your EverCraft Password Reset Code`
      : `${otp} is your EverCraft Verification Code`;

    // Send Email
    const mailSent = await sendEmail({
      to: email,
      subject: emailSubject,
      htmlContent: `
        <div style="font-family: 'Georgia', serif; max-width: 500px; margin: 0 auto; padding: 32px; border: 2px solid #D4AF37; border-radius: 20px; background-color: #FAF5EF; color: #1C1109; box-shadow: 0 10px 30px rgba(0,0,0,0.05); box-sizing: border-box;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #1C1109; font-size: 24px; font-weight: 900; margin: 0; letter-spacing: 0.5px; border-bottom: 1.5px solid rgba(212, 175, 55, 0.3); padding-bottom: 16px;">
              ${isReset ? 'Reset Your Password' : 'Verify Your Email'}
            </h2>
          </div>
          <p style="font-size: 15px; line-height: 1.7; text-align: center; margin-bottom: 28px; color: #5C3A21;">
            ${isReset 
              ? 'We received a request to reset your password. Use the verification code below to complete the reset process.' 
              : 'Thank you for registering with EverCraft Publications. Use the verification code below to complete your signup.'}
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <div style="background-color: #1C1109; border: 2px solid #D4AF37; border-radius: 12px; padding: 18px 28px; display: inline-block; box-shadow: 0 4px 15px rgba(28, 17, 9, 0.15);">
              <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #D4AF37; padding-left: 8px; font-family: monospace;">${otp}</span>
            </div>
          </div>
          <p style="font-size: 13px; color: #7f8c8d; text-align: center; margin: 28px 0 0 0; line-height: 1.5;">
            This code is valid for 10 minutes. If you did not request this, please disregard this email.
          </p>
          <div style="text-align: center; margin-top: 36px; border-top: 1px solid rgba(212, 175, 55, 0.2); padding-top: 20px;">
            <p style="font-weight: 800; color: #D4AF37; font-size: 15px; margin: 0 0 4px 0; letter-spacing: 1.5px; text-transform: uppercase;">EverCraft Publications</p>
            <p style="font-size: 12px; color: #7f8c8d; margin: 0;">Where Stories Come Alive.</p>
          </div>
        </div>
      `
    });
    
    if (mailSent) {
      return res.json({ message: 'OTP sent successfully' });
    } else {
      return res.status(500).json({ detail: 'Failed to send verification email.' });
    }
  } catch (err: any) {
    console.error("❌ Send OTP Error:", err);
    return res.status(500).json({ detail: err.message || 'Internal Server Error' });
  }
});

router.post('/users/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp, verify_only } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ detail: 'Email and OTP are required' });
    }
    
    // Find valid OTP
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const otps = await query('SELECT * FROM otps WHERE email=? AND otp=? AND expires_at > ? ORDER BY id DESC', [email, otp, nowStr]);
    
    if (otps.length === 0) {
      return res.status(400).json({ detail: 'Invalid or expired OTP. Please try again.' });
    }
    
    // Delete the verified OTP
    await query('DELETE FROM otps WHERE email=?', [email]);
    
    if (verify_only) {
      return res.json({ success: true, message: 'OTP verified successfully' });
    }
    
    // Login flow: Find user by email
    const users = await query('SELECT * FROM users WHERE email=?', [email]);
    if (users.length > 0) {
      const user = users[0];
      await query("UPDATE users SET status='Logged In' WHERE id=?", [user.id]);
      user.status = 'Logged In';
      const token = generateToken({ id: user.id, email: user.email, role: user.role || 'User' });
      return res.json({ success: true, user, token });
    } else {
      return res.json({ success: true, signup_required: true });
    }
  } catch (err: any) {
    console.error("❌ Verify OTP Error:", err);
    return res.status(500).json({ detail: err.message || 'Internal Server Error' });
  }
});

router.post('/users/:user_id/cart', verifyToken, rlsCheck, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.user_id);
    const { items } = req.body; // JSON array of items as string
    
    if (isNaN(userId)) {
      return res.status(400).json({ detail: 'Invalid user ID' });
    }
    
    await query(
      'INSERT INTO carts (user_id, items, abandoned_email_sent) VALUES (?, ?, 0) ON DUPLICATE KEY UPDATE items = ?, abandoned_email_sent = 0',
      [userId, items, items]
    );
    
    return res.json({ message: 'Cart synced successfully' });
  } catch (err: any) {
    console.error("❌ Sync Cart Error:", err);
    return res.status(500).json({ detail: err.message || 'Internal Server Error' });
  }
});

router.get('/users/:user_id/cart', verifyToken, rlsCheck, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.user_id);
    if (isNaN(userId)) {
      return res.status(400).json({ detail: 'Invalid user ID' });
    }
    
    const carts = await query('SELECT items FROM carts WHERE user_id = ?', [userId]);
    if (carts.length > 0) {
      return res.json({ items: carts[0].items });
    }
    return res.json({ items: '[]' });
  } catch (err: any) {
    console.error("❌ Get Cart Error:", err);
    return res.status(500).json({ detail: err.message || 'Internal Server Error' });
  }
});

// ─── ROUTES: ADDRESSES ────────────────────────────────────────────────────

router.get('/users/:user_id/addresses', verifyToken, rlsCheck, async (req: Request, res: Response) => {
  const userId = parseInt(req.params.user_id);
  const addresses = await query('SELECT * FROM addresses WHERE user_id=?', [userId]);
  return res.json(addresses || []);
});

router.post('/users/:user_id/addresses', verifyToken, rlsCheck, validate(AddressCreateSchema), async (req: Request, res: Response) => {
  const userId = parseInt(req.params.user_id);
  const { type, address, city, pincode } = req.body;
  
  const result = await query(
    'INSERT INTO addresses (user_id, type, address, city, pincode) VALUES (?, ?, ?, ?, ?)',
    [userId, type, address, city, pincode]
  );
  return res.json({ id: result.insertId });
});

// ─── ROUTES: ORDERS ───────────────────────────────────────────────────────

router.get('/users/:user_id/orders', verifyToken, rlsCheck, async (req: Request, res: Response) => {
  const userId = parseInt(req.params.user_id);
  const orders = await query('SELECT * FROM orders WHERE user_id=?', [userId]);
  return res.json(orders || []);
});

router.post('/orders', verifyToken, validate(OrderCreateSchema), async (req: Request, res: Response) => {
  try {
    const { user_id, items, shipping_address_id, coupon_code } = req.body;
    
    // RLS Check
    if (req.user!.id !== user_id && !['Admin', 'Master Admin', 'Developer'].includes(req.user!.role || '')) {
      return res.status(403).json({ detail: 'Forbidden: You cannot create an order for another user.' });
    }
    
    if (!items || items.length === 0) {
      return res.status(400).json({ detail: 'Cannot create an empty order.' });
    }

    // 1. Calculate total on the backend for security
    let subtotal = 0;
    const fullItemsDetails = [];
    
    for (const item of items) {
      const books = await query('SELECT * FROM books WHERE id=?', [item.id]);
      if (books.length === 0) {
        return res.status(404).json({ detail: `Book with id ${item.id} not found.` });
      }
      const book = books[0];
      if (book.stock < item.qty) {
        return res.status(400).json({ detail: `Insufficient stock for ${book.title}. Available: ${book.stock}` });
      }
      subtotal += book.price * item.qty;
      fullItemsDetails.push({
        id: book.id,
        title: book.title,
        price: book.price,
        qty: item.qty
      });
    }

    // 2. Apply coupon
    let discount_amount = 0;
    if (coupon_code) {
      const coupons = await query('SELECT * FROM coupons WHERE code = ?', [coupon_code.toUpperCase()]);
      if (coupons.length > 0) {
        const coupon = coupons[0];
        discount_amount = subtotal * (coupon.discount_percent / 100);
      }
    }

    // 3. Get settings for GST and Shipping
    const settingsRows = await query('SELECT * FROM settings');
    const settingsDict: Record<string, string> = {};
    for (const s of settingsRows) {
      settingsDict[s.s_key] = s.s_value;
    }
    const gst_percent = parseFloat(settingsDict['gst_percent'] || '0');
    const shipping_cost = parseFloat(settingsDict['shipping_cost'] || '0');

    // 4. Calculate final total
    const gst_amount = (subtotal - discount_amount) * (gst_percent / 100);
    const final_total = subtotal - discount_amount + gst_amount + shipping_cost;

    // 5. Insert order
    const dateStr = getTodayDateString();
    const users = await query('SELECT name FROM users WHERE id=?', [user_id]);
    const user_name = users.length > 0 ? users[0].name : 'Unknown User';
    const itemsJsonString = JSON.stringify(fullItemsDetails);

    await query(
      'INSERT INTO orders (user_id, user_name, shipping_address_id, items, total, coupon_code, discount_amount, gst_amount, shipping_cost, `date`, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, user_name, shipping_address_id, itemsJsonString, final_total, coupon_code || null, discount_amount, gst_amount, shipping_cost, dateStr, 'Order Placed']
    );

    // 6. Decrement stock
    for (const item of items) {
      await query('UPDATE books SET stock = stock - ? WHERE id = ?', [item.qty, item.id]);
    }

    // Clear cart in database on successful order
    try {
      await query("UPDATE carts SET items = '[]', abandoned_email_sent = 1 WHERE user_id = ?", [user_id]);
    } catch (e) {
      console.error("⚠️ Failed to clear database cart after order:", e);
    }

    // Send Order Confirmation Email via Brevo
    try {
      const userRows = await query('SELECT email, name FROM users WHERE id = ?', [user_id]);
      if (userRows.length > 0) {
        const userEmail = userRows[0].email;
        const userName = userRows[0].name;
        
        let itemsHtml = `
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <thead>
              <tr style="background-color: #aa7c11; color: white; text-align: left;">
                <th style="padding: 10px; border: 1px solid #D4AF37;">Book Title</th>
                <th style="padding: 10px; border: 1px solid #D4AF37; text-align: right;">Price</th>
                <th style="padding: 10px; border: 1px solid #D4AF37; text-align: center;">Qty</th>
                <th style="padding: 10px; border: 1px solid #D4AF37; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
        `;
        
        for (const item of fullItemsDetails) {
          itemsHtml += `
            <tr style="background-color: white; color: #2D1B10;">
              <td style="padding: 10px; border: 1px solid #fde68a;">${item.title}</td>
              <td style="padding: 10px; border: 1px solid #fde68a; text-align: right;">₹${item.price}</td>
              <td style="padding: 10px; border: 1px solid #fde68a; text-align: center;">${item.qty}</td>
              <td style="padding: 10px; border: 1px solid #fde68a; text-align: right;">₹${item.price * item.qty}</td>
            </tr>
          `;
        }
        
        itemsHtml += `
            </tbody>
          </table>
        `;
        
        sendEmail({
          to: userEmail,
          toName: userName,
          subject: 'Order Confirmation - EverCraft Publications 📚',
          htmlContent: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1.5px solid #D4AF37; border-radius: 16px; background-color: #fdf6e2; color: #2D1B10;">
              <h2 style="color: #aa7c11; text-align: center; font-size: 24px; font-weight: 900; margin-bottom: 20px;">Order Confirmed!</h2>
              <p>Dear ${userName},</p>
              <p>Thank you for your purchase from EverCraft Publications! We are pleased to confirm that we have received your order.</p>
              
              <h3 style="color: #aa7c11; border-bottom: 1.5px solid #fde68a; padding-bottom: 8px; margin-top: 24px;">Order Summary</h3>
              ${itemsHtml}
              
              <div style="margin-top: 20px; text-align: right; font-size: 16px; font-weight: 800; color: #2D1B10;">
                <p style="margin: 4px 0;">Subtotal: ₹${subtotal}</p>
                ${discount_amount > 0 ? `<p style="margin: 4px 0; color: #dc2626;">Discount: -₹${discount_amount}</p>` : ''}
                ${shipping_cost > 0 ? `<p style="margin: 4px 0;">Shipping Cost: ₹${shipping_cost}</p>` : ''}
                <p style="margin: 8px 0 0 0; font-size: 18px; color: #aa7c11;">Total Paid: ₹${final_total}</p>
              </div>
              
              <p style="margin-top: 30px;">We will process and ship your books shortly. You will receive tracking details via email once shipped.</p>
              <p style="margin-top: 24px;">Thank you for supporting authors and literature!</p>
              <p style="font-weight: 800; color: #aa7c11; margin: 0;">The EverCraft Team</p>
            </div>
          `
        }).catch(err => console.error("Error sending order confirmation email:", err));
      }
    } catch (err) {
      console.error("⚠️ Failed to process order confirmation email:", err);
    }

    return res.json({ message: 'Order created' });
  } catch (error: any) {
    console.error('❌ Order Error:', error);
    return res.status(500).json({ detail: error.message || 'Internal Server Error' });
  }
});

router.get('/orders', verifyToken, adminOnly, async (req: Request, res: Response) => {
  const orders = await query(`
    SELECT o.*, a.address, a.city, a.pincode
    FROM orders o
    LEFT JOIN addresses a ON o.shipping_address_id = a.id
    ORDER BY o.id DESC
  `);
  return res.json(orders || []);
});

router.put('/orders/:order_id/status', verifyToken, adminOnly, validate(OrderStatusUpdateSchema), async (req: Request, res: Response) => {
  const orderId = parseInt(req.params.order_id);
  const { status } = req.body;
  await query('UPDATE orders SET status=? WHERE id=?', [status, orderId]);
  return res.json({ message: 'Order status updated' });
});

// ─── ROUTES: COUPONS ──────────────────────────────────────────────────────

router.get('/coupons', verifyToken, adminOnly, async (req: Request, res: Response) => {
  const coupons = await query('SELECT * FROM coupons ORDER BY id DESC');
  return res.json(coupons || []);
});

router.post('/coupons', verifyToken, adminOnly, validate(CouponCreateSchema), async (req: Request, res: Response) => {
  const { code, discount_percent } = req.body;
  try {
    await query('INSERT INTO coupons (code, discount_percent) VALUES (?, ?)', [code.toUpperCase(), discount_percent]);
    return res.json({ message: 'Coupon created' });
  } catch (error: any) {
    if (error.errno === 1062 || error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ detail: 'Coupon code already exists.' });
    }
    return res.status(500).json({ detail: error.message || 'Internal Server Error' });
  }
});

router.delete('/coupons/:coupon_id', verifyToken, adminOnly, async (req: Request, res: Response) => {
  const couponId = parseInt(req.params.coupon_id);
  await query('DELETE FROM coupons WHERE id = ?', [couponId]);
  return res.json({ message: 'Coupon deleted' });
});

router.get('/coupons/validate/:code', async (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const coupons = await query('SELECT * FROM coupons WHERE code = ?', [code]);
  if (coupons.length > 0) {
    return res.json(coupons[0]);
  }
  return res.status(404).json({ detail: 'Invalid coupon code' });
});

import fs from 'fs';
import path from 'path';

router.get('/settings', async (req: Request, res: Response) => {
  const settings = await query('SELECT * FROM settings');
  const settingsMap: Record<string, string> = {};
  for (const s of settings) {
    settingsMap[s.s_key] = s.s_value;
  }
  return res.json(settingsMap);
});

router.post('/settings', verifyToken, adminOnly, async (req: Request, res: Response) => {
  const updates = req.body;
  if (typeof updates !== 'object' || updates === null) {
    return res.status(400).json({ error: 'Body must be an object of key-value pairs' });
  }

  // Iterate through all provided keys and update them
  for (const [key, value] of Object.entries(updates)) {
    if (typeof value === 'string') {
      await query(
        'INSERT INTO settings (s_key, s_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE s_value=?',
        [key, value, value]
      );
    }
  }

  return res.json({ message: 'Settings updated' });
});

router.post('/settings/sync', verifyToken, adminOnly, async (req: Request, res: Response) => {
  try {
    const contentPath = path.join(process.cwd(), 'src', 'content.json');
    if (!fs.existsSync(contentPath)) {
      return res.status(404).json({ error: 'content.json not found' });
    }

    const fileData = fs.readFileSync(contentPath, 'utf8');
    const contentJson = JSON.parse(fileData);
    
    // Process theme config
    if (contentJson.theme) {
      for (const [key, value] of Object.entries(contentJson.theme)) {
        await query(
          'INSERT IGNORE INTO settings (s_key, s_value) VALUES (?, ?)',
          [`theme_${key}`, value]
        );
      }
    }

    // Process content text
    if (contentJson.content) {
      for (const [key, value] of Object.entries(contentJson.content)) {
        await query(
          'INSERT IGNORE INTO settings (s_key, s_value) VALUES (?, ?)',
          [`content_${key}`, value]
        );
      }
    }

    return res.json({ message: 'Sync successful - default keys added to database if they were missing' });
  } catch (error) {
    console.error('Error syncing content.json:', error);
    return res.status(500).json({ error: 'Failed to sync content' });
  }
});

// ─── ROUTES: ADMIN & STATS ────────────────────────────────────────────────

router.post('/admin/login', validate(AdminLoginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log(`ℹ️ Admin login attempt with email: '${email}'`);
  
  if (email === 'awesh.etpl@gmail.com' && password === 'Mariyam@2026') {
    console.log('✅ Logged in with developer credentials.');
    return res.json({ message: 'Welcome Developer', email: 'awesh.etpl@gmail.com', role: 'Developer' });
  }

  if (email === 'prprince46@gmail.com' && password === 'Prince@2004') {
    console.log('✅ Logged in with master admin credentials.');
    return res.json({ message: 'Welcome Master Admin', email: 'prprince46@gmail.com', role: 'Master Admin' });
  }

  if (email === 'admin@evercraft.com' && (password === 'admin' || password === 'admin123')) {
    console.log('✅ Logged in with default admin credentials.');
    return res.json({ message: 'Welcome Admin', email: 'admin@evercraft.com', role: 'Master Admin' });
  }

  console.log('... Hardcoded credentials did not match. Checking database.');
  try {
    const existing = await query("SELECT id FROM admins WHERE email='admin@evercraft.com'");
    if (existing.length === 0) {
      console.log('... Default admin not found, creating it.');
      await query("INSERT INTO admins (name, email, password) VALUES (?, ?, ?)", ['Admin', 'admin@evercraft.com', 'admin']);
    }
  } catch (err) {
    console.log(`... DB Error while checking/creating default admin: ${err}`);
  }

  const admins = await query('SELECT * FROM admins WHERE email=? AND password=?', [email, password]);
  if (admins.length > 0) {
    const admin = admins[0];
    console.log(`✅ Logged in with database credentials for user: ${admin.name || 'Admin'}`);
    return res.json({ message: `Welcome ${admin.name || 'Admin'}`, email: admin.email, role: 'Admin' });
  }

  console.log('... Database credentials did not match. Login failed.');
  return res.status(401).json({ detail: 'Invalid credentials' });
});

router.get('/stats', verifyToken, adminOnly, async (req: Request, res: Response) => {
  const booksCount = await query('SELECT COUNT(*) as c FROM books');
  const usersCount = await query('SELECT COUNT(*) as c FROM users');
  const sessionsCount = await query('SELECT COUNT(*) as c FROM users WHERE status=\'Logged In\'');
  const ordersCount = await query('SELECT COUNT(*) as c FROM orders');
  const subscribersCount = await query('SELECT COUNT(*) as c FROM subscribers');
  const publishReqCount = await query('SELECT COUNT(*) as c FROM publish_reqs');
  const contactMsgCount = await query('SELECT COUNT(*) as c FROM contact_msgs');
  
  return res.json({
    total_books: booksCount[0].c,
    total_users: usersCount[0].c,
    active_sessions: sessionsCount[0].c,
    total_orders: ordersCount[0].c,
    total_subscribers: subscribersCount[0].c,
    total_publish_requests: publishReqCount[0].c,
    total_contact_messages: contactMsgCount[0].c
  });
});

router.get('/users', verifyToken, adminOnly, async (req: Request, res: Response) => {
  const users = await query('SELECT * FROM users');
  const normalized = (users || []).map((u: any) => ({
    id: u.id,
    n: u.name,
    e: u.email,
    p: u.phone,
    s: u.status || 'Offline',
    img: u.profile_image || '',
    role: u.role || 'Customer'
  }));
  return res.json(normalized);
});

router.put('/users/:user_id/role', verifyToken, adminOnly, async (req: Request, res: Response) => {
  const userId = req.params.user_id;
  const { role } = req.body;
  if (!role) return res.status(400).json({ error: 'Role is required' });
  await query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
  return res.json({ message: 'Role updated' });
});

router.delete('/users/:user_id', verifyToken, adminOnly, async (req: Request, res: Response) => {
  const userId = req.params.user_id;
  try {
    await query('DELETE FROM cart WHERE user_id = ?', [userId]);
    await query('DELETE FROM addresses WHERE user_id = ?', [userId]);
    await query('DELETE FROM orders WHERE user_id = ?', [userId]);
    await query('DELETE FROM users WHERE id = ?', [userId]);
    return res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete account' });
  }
});

router.get('/front-stats', async (req: Request, res: Response) => {
  const statsRows = await query('SELECT * FROM front_stats WHERE id=1');
  let stats = statsRows.length > 0 ? statsRows[0] : {
    happy_readers: '500+',
    cities_reached: '10+',
    sales_platforms: '2'
  };
  
  const booksCount = await query('SELECT COUNT(*) as c FROM books');
  stats.books_published = String(booksCount[0].c);
  return res.json(stats);
});

router.post('/front-stats', verifyToken, adminOnly, validate(FrontStatsUpdateSchema), async (req: Request, res: Response) => {
  try {
    const { happy_readers, cities_reached, sales_platforms } = req.body;
    await query(
      'INSERT INTO front_stats (id, happy_readers, cities_reached, sales_platforms) VALUES (1, ?, ?, ?) ON DUPLICATE KEY UPDATE happy_readers=?, cities_reached=?, sales_platforms=?',
      [happy_readers, cities_reached, sales_platforms, happy_readers, cities_reached, sales_platforms]
    );
    return res.json({ message: 'Stats updated' });
  } catch (error: any) {
    console.error('❌ Update Stats Error:', error);
    return res.status(500).json({ detail: error.message || 'Internal Server Error' });
  }
});

router.post('/cookie-consent', validate(CookieConsentCreateSchema), async (req: Request, res: Response) => {
  const { session_id, user_id, status } = req.body;
  const dateStr = getNowDateTimeString();
  
  await query(
    'INSERT INTO cookie_consents (session_id, user_id, status, `timestamp`) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE status=?, `timestamp`=?',
    [session_id, user_id || null, status, dateStr, status, dateStr]
  );
  return res.json({ message: 'Consent recorded' });
});

router.get('/cookie-consents', verifyToken, adminOnly, async (req: Request, res: Response) => {
  const consents = await query('SELECT * FROM cookie_consents ORDER BY id DESC');
  return res.json(consents || []);
});

// ─── ROUTES: INQUIRIES & NEWSLETTER ───────────────────────────────────────

router.get('/subscribers', verifyToken, adminOnly, async (req: Request, res: Response) => {
  const subscribers = await query('SELECT * FROM subscribers');
  const normalized = (subscribers || []).map((s: any) => ({
    e: s.email,
    d: s.date
  }));
  return res.json(normalized);
});

router.post('/subscribers', validate(SubscriberCreateSchema), async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const dateStr = getTodayDateString();
    await query('INSERT INTO subscribers (email, `date`) VALUES (?, ?)', [email, dateStr]);
    
    // Send welcome email via Brevo
    try {
      sendEmail({
        to: email,
        subject: 'Welcome to EverCraft Publications Newsletter! 📚',
        htmlContent: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1.5px solid #D4AF37; border-radius: 16px; background-color: #fdf6e2; color: #2D1B10;">
            <h2 style="color: #aa7c11; text-align: center; font-size: 24px; font-weight: 900; margin-bottom: 20px;">Welcome to EverCraft Publications!</h2>
            <p>Thank you for subscribing to our newsletter! You've joined a community of passionate readers and writers across India.</p>
            <p>Here is what you can look forward to:</p>
            <ul style="padding-left: 20px; line-height: 1.6; color: #2D1B10;">
              <li>Exclusive updates on our latest book releases.</li>
              <li>Inspirational wisdom, quotes, and spiritual insights.</li>
              <li>Invitations to exclusive book launch events and author meetups.</li>
              <li>Expert publishing tips for aspiring authors.</li>
            </ul>
            <p style="margin-top: 24px;">Warm regards,</p>
            <p style="font-weight: 800; color: #aa7c11; margin: 0;">The EverCraft Team</p>
          </div>
        `
      }).catch(err => console.error("Error sending newsletter welcome email:", err));
    } catch (e) {
      console.error("⚠️ Failed to process newsletter welcome email:", e);
    }

    return res.json({ message: 'Subscribed successfully' });
  } catch (error: any) {
    console.error('❌ Subscriber Error:', error);
    return res.status(500).json({ detail: error.message || 'Internal Server Error' });
  }
});

router.get('/publish-requests', verifyToken, adminOnly, async (req: Request, res: Response) => {
  const reqs = await query('SELECT * FROM publish_reqs ORDER BY id DESC');
  return res.json(reqs || []);
});

router.post('/publish-requests', validate(PublishReqCreateSchema), async (req: Request, res: Response) => {
  const { name, email, phone, country, genre, manuscript } = req.body;
  const dateStr = getTodayDateString();
  await query(
    'INSERT INTO publish_reqs (name, email, phone, country, genre, manuscript, date_submitted) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, email, phone, country || '', genre || '', manuscript || '', dateStr]
  );
  return res.json({ message: 'Request submitted' });
});

router.get('/contact-messages', verifyToken, adminOnly, async (req: Request, res: Response) => {
  const msgs = await query('SELECT * FROM contact_msgs ORDER BY id DESC');
  return res.json(msgs || []);
});

router.post('/contact-messages', validate(ContactMsgCreateSchema), async (req: Request, res: Response) => {
  const { name, email, phone, subject, message } = req.body;
  const dateStr = getTodayDateString();
  await query(
    'INSERT INTO contact_msgs (name, email, phone, subject, message, date_submitted) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, phone, subject, message, dateStr]
  );
  return res.json({ message: 'Submitted' });
});

// ─── ROUTES: BOOKS ────────────────────────────────────────────────────────

router.get('/books', async (req: Request, res: Response) => {
  const books = await query('SELECT * FROM books');
  const formatted = (books || []).map((b: any) => ({
    ...b,
    is_hero: Boolean(b.is_hero),
    is_bestseller: Boolean(b.is_bestseller),
    available: Boolean(b.available)
  }));
  return res.json(formatted);
});

router.post('/books', verifyToken, adminOnly, validate(BookCreateSchema), async (req: Request, res: Response) => {
  const {
    title, titleHindi, author, authorHindi, mrp, price, isbn, genre, language,
    pages, badge, rating, reviews, available, frontCover, backCover,
    amazonLink, flipkartLink, ondcLink, description, descriptionHindi,
    is_hero, is_bestseller, stock, is_upcoming
  } = req.body;
  
  await query(
    `INSERT INTO books (
      title, titleHindi, author, authorHindi, mrp, price, isbn, genre, language,
      pages, badge, rating, reviews, available, frontCover, backCover,
      amazonLink, flipkartLink, ondcLink, description, descriptionHindi,
      is_hero, is_bestseller, stock, is_upcoming
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      title, titleHindi, author, authorHindi, mrp, price, isbn, genre, language,
      pages, badge, rating, reviews, available, frontCover, backCover,
      amazonLink, flipkartLink, ondcLink, description, descriptionHindi,
      is_hero, is_bestseller, stock, is_upcoming
    ]
  );
  
  return res.json({ message: 'Book added' });
});

router.put('/books/:id', verifyToken, adminOnly, validate(BookCreateSchema), async (req: Request, res: Response) => {
  const bookId = parseInt(req.params.id);
  const {
    title, titleHindi, author, authorHindi, mrp, price, isbn, genre, language,
    pages, badge, rating, reviews, available, frontCover, backCover,
    amazonLink, flipkartLink, ondcLink, description, descriptionHindi,
    is_hero, is_bestseller, stock, is_upcoming
  } = req.body;

  await query(
    `UPDATE books SET
      title=?, titleHindi=?, author=?, authorHindi=?, mrp=?, price=?, isbn=?, genre=?, language=?,
      pages=?, badge=?, rating=?, reviews=?, available=?, frontCover=?, backCover=?,
      amazonLink=?, flipkartLink=?, ondcLink=?, description=?, descriptionHindi=?,
      is_hero=?, is_bestseller=?, stock=?, is_upcoming=?
    WHERE id=?`,
    [
      title, titleHindi, author, authorHindi, mrp, price, isbn, genre, language,
      pages, badge, rating, reviews, available, frontCover, backCover,
      amazonLink, flipkartLink, ondcLink, description, descriptionHindi,
      is_hero, is_bestseller, stock, is_upcoming, bookId
    ]
  );
  
  return res.json({ message: 'Book updated' });
});

router.delete('/books/:id', verifyToken, adminOnly, async (req: Request, res: Response) => {
  const bookId = parseInt(req.params.id);
  await query('DELETE FROM books WHERE id = ?', [bookId]);
  return res.json({ message: 'Book deleted successfully' });
});

router.post('/books/:id/notify', async (req: Request, res: Response) => {
  const bookId = parseInt(req.params.id);
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  await query(
    'INSERT INTO book_notifications (book_id, user_email) VALUES (?, ?)',
    [bookId, email]
  );
  return res.json({ message: 'Notification subscription successful' });
});

router.post('/books/hero/:book_id', verifyToken, adminOnly, async (req: Request, res: Response) => {
  const bookId = parseInt(req.params.book_id);
  await query('UPDATE books SET is_hero=0');
  await query('UPDATE books SET is_hero=1 WHERE id=?', [bookId]);
  return res.json({ message: 'Hero book updated' });
});

router.post('/books/bestseller/:book_id', verifyToken, adminOnly, async (req: Request, res: Response) => {
  const bookId = parseInt(req.params.book_id);
  await query('UPDATE books SET is_bestseller=0');
  await query('UPDATE books SET is_bestseller=1 WHERE id=?', [bookId]);
  return res.json({ message: 'Bestseller updated' });
});

// ─── ROUTES: TESTIMONIALS ────────────────────────────────────────────────────────

router.get('/testimonials', async (req: Request, res: Response) => {
  let testimonials = await query('SELECT * FROM testimonials ORDER BY id DESC');
  
  // Auto-seed if empty
  if (!testimonials || testimonials.length === 0) {
    const defaultTestimonials = [
      { name: "Priya Sharma", role: "First-time Author", text: "EverCraft made my dream of becoming a published author a reality. Their team was incredibly supportive throughout!", rating: 5, avatar: "PS" },
      { name: "Rajesh Kumar", role: "Spiritual Writer", text: "The editorial team truly understands spiritual literature. My book has reached thousands of readers across India.", rating: 5, avatar: "RK" },
      { name: "Anita Verma", role: "Self-Help Author", text: "From manuscript to bookshelf in record time, with exceptional quality. Best publishing partner I could ask for!", rating: 5, avatar: "AV" },
      { name: "Kavita Sharma", role: "Fiction Writer", text: "A phenomenal experience! They took care of everything and my book is now an Amazon Bestseller.", rating: 5, avatar: "KS" },
      { name: "Prince Raj", role: "Reader", text: "This platform offers an excellent collection of books with diverse and engaging content. Every book is well-written, inspiring, and easy to understand. The quality of publishing is impressive, making reading a great experience. Highly recommended for readers and aspiring authors looking for meaningful and professionally published books.", rating: 5, avatar: "PR" }
    ];
    for (const t of defaultTestimonials) {
      await query(
        'INSERT INTO testimonials (name, role, text, rating, avatar) VALUES (?, ?, ?, ?, ?)',
        [t.name, t.role, t.text, t.rating, t.avatar]
      );
    }
    testimonials = await query('SELECT * FROM testimonials ORDER BY id DESC');
  }

  return res.json(testimonials || []);
});

router.post('/testimonials', verifyToken, adminOnly, async (req: Request, res: Response) => {
  const { name, role, text, rating, avatar } = req.body;
  await query(
    'INSERT INTO testimonials (name, role, text, rating, avatar) VALUES (?, ?, ?, ?, ?)',
    [name, role || '', text, rating || 5, avatar || '']
  );
  return res.json({ message: 'Testimonial added' });
});

router.put('/testimonials/:id', verifyToken, adminOnly, async (req: Request, res: Response) => {
  const id = req.params.id;
  const { name, role, text, rating, avatar } = req.body;
  await query(
    'UPDATE testimonials SET name=?, role=?, text=?, rating=?, avatar=? WHERE id=?',
    [name, role || '', text, rating || 5, avatar || '', id]
  );
  return res.json({ message: 'Testimonial updated' });
});

router.delete('/testimonials/:id', verifyToken, adminOnly, async (req: Request, res: Response) => {
  const id = req.params.id;
  await query('DELETE FROM testimonials WHERE id=?', [id]);
  return res.json({ message: 'Testimonial deleted' });
});

export default router;
