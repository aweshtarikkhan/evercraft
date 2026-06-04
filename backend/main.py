from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Any
import datetime
import mysql.connector
from mysql.connector import Error
import json
import os
from dotenv import load_dotenv, find_dotenv
from urllib.parse import urlparse

# Load variables from .env file
load_dotenv(find_dotenv())
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost:3306/evercraft")

app = FastAPI(title="EverCraft Publications API")

# Allow the React frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── MYSQL DATABASE CONFIGURATION ─────────────────────────────────────────

# Parse Database URL automatically from .env
parsed_url = urlparse(DATABASE_URL)
DB_CONFIG = {
    'host': parsed_url.hostname or 'localhost',
    'user': parsed_url.username or 'root',
    'password': parsed_url.password or '',
    'database': parsed_url.path.lstrip('/') if parsed_url.path else 'evercraft',
    'port': parsed_url.port or 3306
}

def get_db():
    return mysql.connector.connect(**DB_CONFIG)

def init_db():
    try:
        # Auto-create database if not exists
        temp_conn = mysql.connector.connect(host=DB_CONFIG['host'], user=DB_CONFIG['user'], password=DB_CONFIG['password'], port=DB_CONFIG['port'])
        temp_cursor = temp_conn.cursor()
        temp_cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_CONFIG['database']}")
        temp_cursor.close()
        temp_conn.close()

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), phone VARCHAR(50), password VARCHAR(255), status VARCHAR(50), profile_image LONGTEXT)")
        cursor.execute("CREATE TABLE IF NOT EXISTS books (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), titleHindi VARCHAR(255), author VARCHAR(255), authorHindi VARCHAR(255), mrp FLOAT, price FLOAT, isbn VARCHAR(100), genre VARCHAR(100), language VARCHAR(50), pages INT, badge VARCHAR(50), rating FLOAT, reviews INT, available BOOLEAN, stock INT DEFAULT 0, publisher VARCHAR(255) DEFAULT 'EverCraft Publications', frontCover LONGTEXT, backCover LONGTEXT, amazonLink TEXT, flipkartLink TEXT, ondcLink TEXT, description TEXT, descriptionHindi TEXT, is_hero BOOLEAN DEFAULT FALSE, is_bestseller BOOLEAN DEFAULT FALSE)")
        
        # Ensure stock and publisher columns exist in books
        try:
            cursor.execute("ALTER TABLE books ADD COLUMN stock INT DEFAULT 0 AFTER available")
        except Error:
            pass
        try:
            cursor.execute("ALTER TABLE books ADD COLUMN publisher VARCHAR(255) DEFAULT 'EverCraft Publications' AFTER stock")
        except Error:
            pass
        try:
            cursor.execute("ALTER TABLE books ADD COLUMN is_upcoming BOOLEAN DEFAULT FALSE AFTER is_bestseller")
        except Error:
            pass
        try:
            cursor.execute("ALTER TABLE books ADD COLUMN release_date VARCHAR(255) DEFAULT 'Coming Soon' AFTER is_upcoming")
        except Error:
            pass

        cursor.execute("CREATE TABLE IF NOT EXISTS orders (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, user_name VARCHAR(255), items LONGTEXT, total FLOAT, `date` VARCHAR(50), status VARCHAR(50))")
        
        # Agar purani table hai jisme user_name nahi tha, toh use automatically add karein
        try:
            cursor.execute("ALTER TABLE orders ADD COLUMN user_name VARCHAR(255) AFTER user_id")
        except Error:
            pass # Agar column pehle se hai toh koi error throw mat karo
            
        # Agar purani table hai jisme shipping_address_id nahi tha, toh use automatically add karein
        try:
            cursor.execute("ALTER TABLE orders ADD COLUMN shipping_address_id INT AFTER user_name")
        except Error:
            pass

        cursor.execute("CREATE TABLE IF NOT EXISTS cookie_consents (id INT AUTO_INCREMENT PRIMARY KEY, session_id VARCHAR(255) UNIQUE, user_id INT, status VARCHAR(50), `timestamp` VARCHAR(50))")
        cursor.execute("CREATE TABLE IF NOT EXISTS coupons (id INT AUTO_INCREMENT PRIMARY KEY, code VARCHAR(255) UNIQUE, discount_percent INT)")
        cursor.execute("CREATE TABLE IF NOT EXISTS addresses (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, type VARCHAR(50), address TEXT, city VARCHAR(100), pincode VARCHAR(20))")
        cursor.execute("CREATE TABLE IF NOT EXISTS subscribers (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255), `date` VARCHAR(50))")
        
        # Agar purani subscribers table hai jisme date nahi tha, toh use automatically add karein
        try:
            cursor.execute("ALTER TABLE subscribers ADD COLUMN `date` VARCHAR(50)")
        except Error:
            pass
            
        cursor.execute("CREATE TABLE IF NOT EXISTS publish_reqs (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), phone VARCHAR(50), genre VARCHAR(100), manuscript LONGTEXT, date_submitted VARCHAR(50))")
        cursor.execute("CREATE TABLE IF NOT EXISTS contact_msgs (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), phone VARCHAR(50), subject VARCHAR(255), message TEXT, date_submitted VARCHAR(50))")
        cursor.execute("CREATE TABLE IF NOT EXISTS service_inquiries (id INT AUTO_INCREMENT PRIMARY KEY, service_name VARCHAR(255), name VARCHAR(255), email VARCHAR(255), phone VARCHAR(50), message TEXT, date_submitted VARCHAR(50))")
        cursor.execute("CREATE TABLE IF NOT EXISTS service_feedbacks (id INT AUTO_INCREMENT PRIMARY KEY, service_name VARCHAR(255), name VARCHAR(255), email VARCHAR(255), rating INT, feedback TEXT, date_submitted VARCHAR(50))")
        try:
            cursor.execute("ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(255) AFTER total")
        except Error:
            pass
        try:
            cursor.execute("ALTER TABLE orders ADD COLUMN discount_amount FLOAT AFTER coupon_code")
        except Error:
            pass
        try:
            cursor.execute("ALTER TABLE orders ADD COLUMN gst_amount FLOAT AFTER discount_amount")
        except Error:
            pass
        try:
            cursor.execute("ALTER TABLE orders ADD COLUMN shipping_cost FLOAT AFTER gst_amount")
        except Error:
            pass
        cursor.execute("CREATE TABLE IF NOT EXISTS front_stats (id INT PRIMARY KEY, books_published VARCHAR(50), happy_readers VARCHAR(50), cities_reached VARCHAR(50), sales_platforms VARCHAR(50))")
        
        # Agar purani front_stats table hai jisme books_published nahi tha, toh use automatically add karein
        try:
            cursor.execute("ALTER TABLE front_stats ADD COLUMN books_published VARCHAR(50) AFTER id")
        except Error:
            pass

        cursor.execute("CREATE TABLE IF NOT EXISTS admins (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255) UNIQUE, password VARCHAR(255), name VARCHAR(255), role VARCHAR(50) DEFAULT 'Super Admin')")
        
        # Ensure role column exists in admins
        try:
            cursor.execute("ALTER TABLE admins ADD COLUMN role VARCHAR(50) DEFAULT 'Super Admin'")
        except Error:
            pass

        # Ensure role column exists in users
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'Customer'")
        except Error:
            pass

        # Check if default site admin user exists, if not, create one
        cursor.execute("SELECT * FROM admins WHERE email='admin@evercraft.com'")
        if not cursor.fetchone():
            cursor.execute("INSERT INTO admins (name, email, password, role) VALUES (%s, %s, %s, %s)", ('Admin', 'admin@evercraft.com', 'admin', 'Site Admin'))

        # Check if developer admin user exists, if not, create one
        cursor.execute("SELECT * FROM admins WHERE email='awesh.etpl@gmail.com'")
        if not cursor.fetchone():
            cursor.execute("INSERT INTO admins (name, email, password, role) VALUES (%s, %s, %s, %s)", ('Developer', 'awesh.etpl@gmail.com', 'Mariyam@2026', 'Developer'))

        # Check if test admin user exists, if not, create one
        cursor.execute("SELECT * FROM admins WHERE email='testadmin@evercraft.com'")
        if not cursor.fetchone():
            cursor.execute("INSERT INTO admins (name, email, password, role) VALUES (%s, %s, %s, %s)", ('Test Admin', 'testadmin@evercraft.com', 'admin123', 'Super Admin'))

        cursor.execute("CREATE TABLE IF NOT EXISTS settings (s_key VARCHAR(255) PRIMARY KEY, s_value VARCHAR(255))")
        cursor.execute("INSERT IGNORE INTO settings (s_key, s_value) VALUES ('gst_percent', '0')")
        cursor.execute("INSERT IGNORE INTO settings (s_key, s_value) VALUES ('shipping_cost', '0')")
        cursor.execute("INSERT IGNORE INTO settings (s_key, s_value) VALUES ('contact_email', 'evercraft2026@gmail.com')")
        cursor.execute("INSERT IGNORE INTO settings (s_key, s_value) VALUES ('contact_phone', '+91 90090 36633')")
        cursor.execute("INSERT IGNORE INTO settings (s_key, s_value) VALUES ('contact_hours', 'Mon–Fri, 10 AM – 6 PM IST')")
        cursor.execute("INSERT IGNORE INTO settings (s_key, s_value) VALUES ('contact_address', 'Vrindavan Nagar, Bhopal - 462022')")
        cursor.execute("INSERT IGNORE INTO settings (s_key, s_value) VALUES ('social_facebook', 'https://www.facebook.com/EvercraftPublications')")
        cursor.execute("INSERT IGNORE INTO settings (s_key, s_value) VALUES ('social_instagram', 'https://www.instagram.com/evercraft_publications/')")
        cursor.execute("INSERT IGNORE INTO settings (s_key, s_value) VALUES ('social_linkedin', 'https://www.linkedin.com/company/bookpublishing/about/')")
        cursor.execute("INSERT IGNORE INTO settings (s_key, s_value) VALUES ('social_x', '#')")
        
        cursor.execute("CREATE TABLE IF NOT EXISTS testimonials (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), role VARCHAR(255), text TEXT, rating INT DEFAULT 5, avatar VARCHAR(50))")
        cursor.execute("SELECT COUNT(*) FROM testimonials")
        if cursor.fetchone()[0] == 0:
            default_testimonials = [
                ("Priya Sharma", "First-time Author", "EverCraft made my dream of becoming a published author a reality. Their team was incredibly supportive throughout!", 5, "PS"),
                ("Rajesh Kumar", "Spiritual Writer", "The editorial team truly understands spiritual literature. My book has reached thousands of readers across India.", 5, "RK"),
                ("Anita Verma", "Self-Help Author", "From manuscript to bookshelf in record time, with exceptional quality. Best publishing partner I could ask for!", 5, "AV"),
                ("Kavita Sharma", "Fiction Writer", "A phenomenal experience! They took care of everything and my book is now an Amazon Bestseller.", 5, "KS"),
                ("Prince Raj", "Reader", "This platform offers an excellent collection of books with diverse and engaging content. Every book is well-written, inspiring, and easy to understand. The quality of publishing is impressive, making reading a great experience. Highly recommended for readers and aspiring authors looking for meaningful and professionally published books.", 5, "PR")
            ]
            for name, role, text, rating, avatar in default_testimonials:
                cursor.execute("INSERT INTO testimonials (name, role, text, rating, avatar) VALUES (%s, %s, %s, %s, %s)", (name, role, text, rating, avatar))

        # Seeding team members
        cursor.execute("CREATE TABLE IF NOT EXISTS team_members (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), role VARCHAR(255), image LONGTEXT, description TEXT, category VARCHAR(100))")
        cursor.execute("SELECT COUNT(*) FROM team_members")
        if cursor.fetchone()[0] == 0:
            default_members = [
                ("Aarav Sharma", "Chief Editor", "", "10+ years of experience in fiction editing. Loves historical novels and guiding new authors.", "Editorial Team"),
                ("Priya Patel", "Senior Proofreader", "", "Eagle-eyed proofreader who ensures every manuscript is grammatically flawless and ready for print.", "Editorial Team"),
                ("Rahul Verma", "Acquisitions Editor", "", "Expert in scouting fresh talent and acquiring bestselling titles that resonate with readers.", "Editorial Team"),
                ("Neha Gupta", "Copy Editor", "", "Specializes in non-fiction and biographies, refining author voices while keeping authenticity.", "Editorial Team"),
                ("Vikram Singh", "Art Director", "", "Award-winning designer with an eye for typography and composition.", "Design Team"),
                ("Ananya Desai", "Cover Illustrator", "", "Specializes in vibrant, custom illustrations that bring stories to life.", "Design Team"),
                ("Rohan Kapoor", "Typesetter", "", "Ensures the interior layout is perfectly formatted for a seamless reading experience.", "Design Team"),
                ("Meera Joshi", "Digital Asset Designer", "", "Creates engaging promotional graphics for our authors' marketing campaigns.", "Design Team"),
                ("Karan Malhotra", "Marketing Head", "", "Strategic thinker focused on maximizing book visibility and author branding.", "Marketing Team"),
                ("Sanya Iyer", "Social Media Manager", "", "Option to build viral content and manages vibrant reader communities online.", "Marketing Team"),
                ("Tariq Ali", "PR Specialist", "", "Connects authors with media outlets, bloggers, and literary influencers.", "Marketing Team"),
                ("Pooja Nair", "Ad Strategist", "", "Data-driven expert in running high-converting ad campaigns across platforms.", "Marketing Team")
            ]
            for name, role, img, desc, cat in default_members:
                cursor.execute("INSERT INTO team_members (name, role, image, description, category) VALUES (%s, %s, %s, %s, %s)", (name, role, img, desc, cat))

        # Clean up duplicate 'Kya Sikhata Hai Sundarkand' entries
        cursor.execute("SELECT id FROM books WHERE title = 'Kya Sikhata Hai Sundarkand' ORDER BY id ASC")
        sundar_books = cursor.fetchall()
        if len(sundar_books) > 1:
            keep_id = sundar_books[0][0]
            delete_ids = [b[0] for b in sundar_books[1:]]
            for d_id in delete_ids:
                cursor.execute("DELETE FROM books WHERE id = %s", (d_id,))
            cursor.execute("UPDATE books SET language = 'Hindi' WHERE id = %s", (keep_id,))
            print(f"INFO: Cleaned up {len(delete_ids)} duplicate Sundarkand entries and set language to Hindi.")
        elif len(sundar_books) == 1:
            keep_id = sundar_books[0][0]
            cursor.execute("UPDATE books SET language = 'Hindi' WHERE id = %s", (keep_id,))
            print("INFO: Sundarkand language set to Hindi.")

        conn.commit()
        cursor.close()
        conn.close()
        print("SUCCESS: MySQL Database 'evercraft' connected & tables initialized!")
    except Error as e:
      print("ERROR: MySQL Connection Error:", e)

init_db()

def query_db(query, args=(), fetchone=False, fetchall=False, commit=False):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(query, args)
        res = None
        if fetchone:
            res = cursor.fetchone()
        elif fetchall:
            res = cursor.fetchall()
        if commit:
            conn.commit()
            res = cursor.lastrowid
        return res
    except Exception as e:
        print(f"❌ DB Query Error: {e}")
        raise e
    finally:
        # Ye block hamesha chalega aur connection ko safely band karega
        cursor.close()
        conn.close()

# ─── PYDANTIC MODELS ──────────────────────────────────────────────────────
class UserLogin(BaseModel):
    email: str
    password: str

class UserSignup(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    status: str = "Logged In"

class UserUpdate(BaseModel):
    name: str
    email: str
    phone: str
    profile_image: str

class AddressCreate(BaseModel):
    type: str
    address: str
    city: str
    pincode: str

class PasswordChange(BaseModel):
    new_password: str

class PasswordReset(BaseModel):
    email: str
    new_password: str

class EmailCheck(BaseModel):
    email: str

class DuplicateCheck(BaseModel):
    email: str
    phone: str

class AdminLogin(BaseModel):
    email: str
    password: str

class FrontStatsUpdate(BaseModel):
    happy_readers: str
    cities_reached: str
    sales_platforms: str

class CookieConsentCreate(BaseModel):
    session_id: str
    user_id: Optional[int] = None
    status: str # 'accepted' or 'denied'

class SubscriberCreate(BaseModel):
    email: str

class PublishReqCreate(BaseModel):
    name: str
    email: str
    phone: str
    genre: str
    manuscript: str

class ContactMsgCreate(BaseModel):
    name: str
    email: str
    phone: str
    subject: str
    message: str

class ServiceInquiryCreate(BaseModel):
    service_name: str
    name: str
    email: str
    phone: str
    message: str

class ServiceFeedbackCreate(BaseModel):
    service_name: str
    name: str
    email: str
    rating: int
    feedback: str

class OrderItem(BaseModel):
    id: int
    qty: int

class OrderCreate(BaseModel):
    user_id: int
    items: List[OrderItem]
    shipping_address_id: int
    coupon_code: Optional[str] = None
    status: str = "Order Placed"

class SettingsUpdate(BaseModel):
    gst_percent: Optional[str] = None
    shipping_cost: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_hours: Optional[str] = None
    contact_address: Optional[str] = None
    social_facebook: Optional[str] = None
    social_instagram: Optional[str] = None
    social_linkedin: Optional[str] = None
    social_x: Optional[str] = None

class CouponCreate(BaseModel):
    code: str
    discount_percent: int

class OrderStatusUpdate(BaseModel):
    status: str

class TestimonialCreate(BaseModel):
    name: str
    role: str
    text: str
    rating: int = 5
    avatar: Optional[str] = None

class TeamMemberCreate(BaseModel):
    name: str
    role: str
    image: str
    description: str
    category: str

class BookCreate(BaseModel):
    title: str
    titleHindi: str
    author: str
    authorHindi: str
    mrp: float
    price: float
    isbn: str
    genre: str
    language: str
    pages: int
    badge: str
    rating: float
    reviews: int
    available: bool
    stock: int = 0
    publisher: str = "EverCraft Publications"
    frontCover: str
    backCover: str
    amazonLink: str
    flipkartLink: str
    ondcLink: str
    description: str
    descriptionHindi: str
    is_hero: bool = False
    is_bestseller: bool = False
    is_upcoming: bool = False
    release_date: str = "Coming Soon"

# ─── ROUTES: USERS ────────────────────────────────────────────────────────
@app.post("/users/check-duplicate")
def check_duplicate(data: DuplicateCheck):
    existing = query_db("SELECT id FROM users WHERE email=%s OR phone=%s", (data.email, data.phone), fetchone=True)
    if existing:
        raise HTTPException(status_code=409, detail="Account already exists. Please login instead.")
    return {"exists": False}

@app.post("/users")
def create_user(user: UserSignup):
    existing = query_db("SELECT id FROM users WHERE email=%s OR phone=%s", (user.email, user.phone), fetchone=True)
    if existing:
        raise HTTPException(status_code=409, detail="Account already exists. Please login instead.")
        
    user_id = query_db("INSERT INTO users (name, email, phone, password, status, profile_image) VALUES (%s, %s, %s, %s, %s, %s)", (user.name, user.email, user.phone, user.password, "Logged In", ""), commit=True)
    return {"id": user_id, "name": user.name, "email": user.email, "phone": user.phone, "status": "Logged In", "profile_image": ""}

@app.post("/users/login")
def login_user(user: UserLogin):
    # 1. Check hardcoded master/developer/test admin credentials
    if user.email == "prprince46@gmail.com" and user.password == "Prince@2004":
        return {"id": 99999, "name": "Master Admin", "email": user.email, "phone": "", "role": "Super Admin", "status": "Logged In", "profile_image": ""}
    if user.email == "awesh.etpl@gmail.com" and user.password == "Mariyam@2026":
        return {"id": 99998, "name": "Developer", "email": user.email, "phone": "", "role": "Developer", "status": "Logged In", "profile_image": ""}
    if user.email == "testadmin@evercraft.com" and user.password == "admin123":
        return {"id": 99997, "name": "Test Admin", "email": user.email, "phone": "", "role": "Super Admin", "status": "Logged In", "profile_image": ""}

    # 2. Check standard users table
    u = query_db("SELECT * FROM users WHERE email=%s AND password=%s", (user.email, user.password), fetchone=True)
    if u:
        query_db("UPDATE users SET status='Logged In' WHERE id=%s", (u['id'],), commit=True)
        u['status'] = 'Logged In'
        if 'role' not in u or not u['role']:
            u['role'] = 'Customer'
        return u

    # 3. Check admins table
    admin = query_db("SELECT * FROM admins WHERE email=%s AND password=%s", (user.email, user.password), fetchone=True)
    if admin:
        return {
            "id": 90000 + admin['id'],
            "name": admin.get('name', 'Admin'),
            "email": admin['email'],
            "phone": "",
            "role": admin.get('role', 'Site Admin'),
            "status": "Logged In",
            "profile_image": ""
        }

    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.put("/users/{user_id}")
def update_user(user_id: int, data: UserUpdate):
    query_db("UPDATE users SET name=%s, email=%s, phone=%s, profile_image=%s WHERE id=%s", (data.name, data.email, data.phone, data.profile_image, user_id), commit=True)
    return query_db("SELECT * FROM users WHERE id=%s", (user_id,), fetchone=True)

@app.post("/users/logout/{user_id}")
def logout_user(user_id: int):
    query_db("UPDATE users SET status='Offline' WHERE id=%s", (user_id,), commit=True)
    return {"message": "Logged out"}

@app.post("/users/{user_id}/password")
def change_password(user_id: int, data: PasswordChange):
    query_db("UPDATE users SET password=%s WHERE id=%s", (data.new_password, user_id), commit=True)
    return {"message": "Password updated successfully"}

@app.post("/users/reset-password")
def reset_password(data: PasswordReset):
    # Check if user exists
    user = query_db("SELECT * FROM users WHERE email=%s", (data.email,), fetchone=True)
    if not user:
        raise HTTPException(status_code=404, detail="User with this email does not exist.")
    query_db("UPDATE users SET password=%s WHERE email=%s", (data.new_password, data.email), commit=True)
    return {"message": "Password updated successfully"}

@app.post("/users/check-email")
def check_user_email(data: EmailCheck):
    user = query_db("SELECT id FROM users WHERE email=%s", (data.email,), fetchone=True)
    if not user:
        raise HTTPException(status_code=404, detail="User with this email does not exist.")
    return {"exists": True}

# ─── ROUTES: ADDRESSES ────────────────────────────────────────────────────
@app.get("/users/{user_id}/addresses")
def get_addresses(user_id: int):
    return query_db("SELECT * FROM addresses WHERE user_id=%s", (user_id,), fetchall=True) or []

@app.post("/users/{user_id}/addresses")
def add_address(user_id: int, addr: AddressCreate):
    addr_id = query_db("INSERT INTO addresses (user_id, type, address, city, pincode) VALUES (%s, %s, %s, %s, %s)", (user_id, addr.type, addr.address, addr.city, addr.pincode), commit=True)
    return {"id": addr_id}

# ─── ROUTES: ORDERS ───────────────────────────────────────────────────────
@app.get("/users/{user_id}/orders")
def get_user_orders(user_id: int):
    return query_db("SELECT * FROM orders WHERE user_id=%s", (user_id,), fetchall=True) or []

@app.post("/orders")
def create_order(order: OrderCreate):
    try:
        if not order.items:
             raise HTTPException(status_code=400, detail="Cannot create an empty order.")

        # 1. Calculate total on the backend for security
        subtotal = 0
        full_items_details = []
        for item in order.items:
            item_id = item.id
            item_qty = item.qty
            book = query_db("SELECT * FROM books WHERE id=%s", (item_id,), fetchone=True)
            if not book:
                raise HTTPException(status_code=404, detail=f"Book with id {item_id} not found.")
            subtotal += book['price'] * item_qty
            full_items_details.append({ "id": book['id'], "title": book['title'], "price": book['price'], "qty": item_qty })

        # 2. Apply coupon
        discount_amount = 0
        if order.coupon_code:
            coupon = query_db("SELECT * FROM coupons WHERE code = %s", (order.coupon_code.upper(),), fetchone=True)
            if coupon:
                discount_amount = subtotal * (coupon['discount_percent'] / 100)
        
        # 3. Get settings for GST and Shipping
        settings = query_db("SELECT * FROM settings", fetchall=True)
        settings_dict = {s['s_key']: s['s_value'] for s in settings}
        gst_percent = float(settings_dict.get('gst_percent', '0'))
        shipping_cost = float(settings_dict.get('shipping_cost', '0'))

        # 4. Calculate final total
        gst_amount = (subtotal - discount_amount) * (gst_percent / 100)
        final_total = subtotal - discount_amount + gst_amount + shipping_cost

        # 5. Insert order
        date_str = datetime.date.today().strftime("%Y-%m-%d")
        u = query_db("SELECT name FROM users WHERE id=%s", (order.user_id,), fetchone=True)
        user_name = u['name'] if u else "Unknown User"
        items_json_string = json.dumps(full_items_details)

        # Retrieve user status choice, default to Order Placed
        ord_status = order.status if order.status else "Order Placed"

        query_db("INSERT INTO orders (user_id, user_name, shipping_address_id, items, total, coupon_code, discount_amount, gst_amount, shipping_cost, `date`, status) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                 (order.user_id, user_name, order.shipping_address_id, items_json_string, final_total, order.coupon_code, discount_amount, gst_amount, shipping_cost, date_str, ord_status), commit=True)
        return {"message": "Order created"}
    except Exception as e:
        print("❌ Order Error:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/orders")
def get_all_orders():
    return query_db("""
        SELECT o.*, a.address, a.city, a.pincode, u.email as user_email, u.phone as user_phone
        FROM orders o
        LEFT JOIN addresses a ON o.shipping_address_id = a.id
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.id DESC
    """, fetchall=True) or []

@app.put("/orders/{order_id}/status")
def update_order_status(order_id: int, data: OrderStatusUpdate):
    query_db("UPDATE orders SET status=%s WHERE id=%s", (data.status, order_id), commit=True)
    return {"message": "Order status updated"}

# ─── ROUTES: COUPONS ──────────────────────────────────────────────────────
@app.get("/coupons")
def get_coupons():
    return query_db("SELECT * FROM coupons ORDER BY id DESC", fetchall=True) or []

@app.post("/coupons")
def create_coupon(coupon: CouponCreate):
    try:
        query_db("INSERT INTO coupons (code, discount_percent) VALUES (%s, %s)", (coupon.code.upper(), coupon.discount_percent), commit=True)
        return {"message": "Coupon created"}
    except Error as e:
        if e.errno == 1062: # Duplicate entry
            raise HTTPException(status_code=409, detail="Coupon code already exists.")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/coupons/{coupon_id}")
def delete_coupon(coupon_id: int):
    query_db("DELETE FROM coupons WHERE id = %s", (coupon_id,), commit=True)
    return {"message": "Coupon deleted"}

@app.get("/coupons/validate/{code}")
def validate_coupon(code: str):
    coupon = query_db("SELECT * FROM coupons WHERE code = %s", (code.upper(),), fetchone=True)
    if coupon:
        return coupon
    raise HTTPException(status_code=404, detail="Invalid coupon code")

@app.get("/settings")
def get_settings():
    settings = query_db("SELECT * FROM settings", fetchall=True)
    # Convert list of dicts to a single dict
    return {s['s_key']: s['s_value'] for s in settings}

@app.post("/settings")
def update_settings(settings: SettingsUpdate):
    try:
        for key, val in settings.model_dump().items():
            if val is not None:
                query_db("INSERT INTO settings (s_key, s_value) VALUES (%s, %s) ON DUPLICATE KEY UPDATE s_value=%s", (key, val, val), commit=True)
        return {"message": "Settings updated"}
    except Exception as e:
        print("ERROR: Settings Update Error:", e)
        raise HTTPException(status_code=500, detail=str(e))

# ─── ROUTES: ADMIN & STATS ────────────────────────────────────────────────
@app.post("/admin/login")
def admin_login(creds: AdminLogin):
    print(f"INFO: Admin login attempt with email: '{creds.email}'")
    # Hardcoded fallback credentials as requested
    if creds.email == "prprince46@gmail.com" and creds.password == "Prince@2004":
        print("SUCCESS: Logged in with hardcoded master credentials.")
        return {"email": creds.email, "role": "Super Admin", "name": "Master Admin"}
    if creds.email == "awesh.etpl@gmail.com" and creds.password == "Mariyam@2026":
        print("SUCCESS: Logged in with hardcoded developer credentials.")
        return {"email": creds.email, "role": "Developer", "name": "Developer"}
    if creds.email == "testadmin@evercraft.com" and creds.password == "admin123":
        print("SUCCESS: Logged in with hardcoded test admin credentials.")
        return {"email": creds.email, "role": "Super Admin", "name": "Test Admin"}

    print("... Hardcoded credentials did not match. Checking database.")
    
    # Check users table first for staff roles
    try:
        user_admin = query_db("SELECT * FROM users WHERE email=%s AND password=%s", (creds.email, creds.password), fetchone=True)
        if user_admin:
            role = user_admin.get('role', 'Customer')
            if role != 'Customer':
                print(f"SUCCESS: Staff user logged in: {user_admin['name']} with role {role}")
                return {"email": user_admin['email'], "role": role, "name": user_admin['name']}
    except Exception as e:
        print(f"... Error checking users table: {e}")

    try:
        if not query_db("SELECT id FROM admins WHERE email='admin@evercraft.com'", fetchone=True):
            print("... Default admin not found, creating it.")
            query_db("INSERT INTO admins (name, email, password, role) VALUES (%s, %s, %s, %s)", 
                     ('Admin', 'admin@evercraft.com', 'admin', 'Site Admin'), commit=True)
    except Error as e:
        print(f"... DB Error while checking/creating default admin: {e}")
        pass

    admin = query_db("SELECT * FROM admins WHERE email=%s AND password=%s", (creds.email, creds.password), fetchone=True)
    if admin:
        print(f"SUCCESS: Logged in with database credentials for user: {admin.get('name', 'Admin')}")
        return {"email": admin['email'], "role": admin.get('role', 'Site Admin'), "name": admin.get('name', 'Admin')}

    print("... Database credentials did not match. Login failed.")
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/stats")
def get_stats():
    return {
        "total_books": query_db("SELECT COUNT(*) as c FROM books", fetchone=True)['c'],
        "total_users": query_db("SELECT COUNT(*) as c FROM users", fetchone=True)['c'],
        "active_sessions": query_db("SELECT COUNT(*) as c FROM users WHERE status='Logged In'", fetchone=True)['c'],
        "total_orders": query_db("SELECT COUNT(*) as c FROM orders", fetchone=True)['c'],
        "total_subscribers": query_db("SELECT COUNT(*) as c FROM subscribers", fetchone=True)['c'],
        "total_publish_requests": query_db("SELECT COUNT(*) as c FROM publish_reqs", fetchone=True)['c'],
        "total_contact_messages": query_db("SELECT COUNT(*) as c FROM contact_msgs", fetchone=True)['c']
    }

@app.get("/users")
def get_all_users():
    res = query_db("SELECT * FROM users", fetchall=True) or []
    return [{"id": u["id"], "n": u["name"], "e": u["email"], "p": u["phone"], "s": u.get("status") or "Offline", "img": u.get("profile_image") or "", "role": u.get("role") or "Customer"} for u in res]

class UserRoleUpdate(BaseModel):
    role: str

@app.put("/users/{user_id}/role")
def update_user_role(user_id: int, data: UserRoleUpdate):
    query_db("UPDATE users SET role=%s WHERE id=%s", (data.role, user_id), commit=True)
    return {"message": "User role updated successfully"}

@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    query_db("DELETE FROM users WHERE id=%s", (user_id,), commit=True)
    return {"message": "User deleted successfully"}

@app.get("/front-stats")
def get_front_stats():
    s = query_db("SELECT * FROM front_stats WHERE id=1", fetchone=True)
    if not s:
        s = {"happy_readers": "500+", "cities_reached": "10+", "sales_platforms": "2"}
    s["books_published"] = str(query_db("SELECT COUNT(*) as c FROM books", fetchone=True)['c'])
    return s

@app.post("/front-stats")
def update_front_stats(stats: FrontStatsUpdate):
    try:
        query_db("INSERT INTO front_stats (id, happy_readers, cities_reached, sales_platforms) VALUES (1, %s, %s, %s) ON DUPLICATE KEY UPDATE happy_readers=%s, cities_reached=%s, sales_platforms=%s", (stats.happy_readers, stats.cities_reached, stats.sales_platforms, stats.happy_readers, stats.cities_reached, stats.sales_platforms), commit=True)
        return {"message": "Stats updated"}
    except Exception as e:
        print("ERROR: Update Stats Error:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cookie-consent")
def record_cookie_consent(consent: CookieConsentCreate):
    date_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    # Use INSERT ... ON DUPLICATE KEY UPDATE to handle repeat consents from the same session
    query_db(
        "INSERT INTO cookie_consents (session_id, user_id, status, `timestamp`) VALUES (%s, %s, %s, %s) ON DUPLICATE KEY UPDATE status=%s, `timestamp`=%s",
        (consent.session_id, consent.user_id, consent.status, date_str, consent.status, date_str),
        commit=True
    )
    return {"message": "Consent recorded"}

@app.get("/cookie-consents")
def get_cookie_consents():
    return query_db("SELECT * FROM cookie_consents ORDER BY id DESC", fetchall=True) or []

# ─── ROUTES: INQUIRIES & NEWSLETTER ───────────────────────────────────────
@app.get("/subscribers")
def get_subscribers():
    res = query_db("SELECT * FROM subscribers", fetchall=True) or []
    return [{"e": r["email"], "d": r["date"]} for r in res]

@app.post("/subscribers")
def add_subscriber(sub: SubscriberCreate):
    try:
        date_str = datetime.date.today().strftime("%Y-%m-%d")
        query_db("INSERT INTO subscribers (email, `date`) VALUES (%s, %s)", (sub.email, date_str), commit=True)
        return {"message": "Subscribed successfully"}
    except Exception as e:
        print("❌ Subscriber Error:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/publish-requests")
def get_publish_reqs():
    return query_db("SELECT * FROM publish_reqs ORDER BY id DESC", fetchall=True) or []

@app.post("/publish-requests")
def add_publish_req(req: PublishReqCreate):
    date_str = datetime.date.today().strftime("%Y-%m-%d")
    query_db("INSERT INTO publish_reqs (name, email, phone, genre, manuscript, date_submitted) VALUES (%s, %s, %s, %s, %s, %s)", (req.name, req.email, req.phone, req.genre, req.manuscript, date_str), commit=True)
    return {"message": "Submitted"}

@app.get("/contact-messages")
def get_contact_msgs():
    return query_db("SELECT * FROM contact_msgs ORDER BY id DESC", fetchall=True) or []

@app.post("/contact-messages")
def add_contact_msg(msg: ContactMsgCreate):
    date_str = datetime.date.today().strftime("%Y-%m-%d")
    query_db("INSERT INTO contact_msgs (name, email, phone, subject, message, date_submitted) VALUES (%s, %s, %s, %s, %s, %s)", (msg.name, msg.email, msg.phone, msg.subject, msg.message, date_str), commit=True)
    return {"message": "Submitted"}

# ─── ROUTES: BOOKS ────────────────────────────────────────────────────────
@app.get("/books")
def get_books():
    books = query_db("SELECT * FROM books", fetchall=True) or []
    for b in books:
        b['is_hero'] = bool(b['is_hero'])
        b['is_bestseller'] = bool(b['is_bestseller'])
        b['available'] = bool(b['available'])
        b['is_upcoming'] = bool(b.get('is_upcoming', False))
    return books

@app.post("/books")
def add_book(book: BookCreate):
    query_db("INSERT INTO books (title, titleHindi, author, authorHindi, mrp, price, isbn, genre, language, pages, badge, rating, reviews, available, stock, publisher, frontCover, backCover, amazonLink, flipkartLink, ondcLink, description, descriptionHindi, is_hero, is_bestseller, is_upcoming, release_date) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", (book.title, book.titleHindi, book.author, book.authorHindi, book.mrp, book.price, book.isbn, book.genre, book.language, book.pages, book.badge, book.rating, book.reviews, book.available, book.stock, book.publisher, book.frontCover, book.backCover, book.amazonLink, book.flipkartLink, book.ondcLink, book.description, book.descriptionHindi, book.is_hero, book.is_bestseller, book.is_upcoming, book.release_date), commit=True)
    return {"message": "Book added"}

@app.put("/books/{book_id}")
def update_book(book_id: int, book: BookCreate):
    query_db("""
        UPDATE books 
        SET title=%s, titleHindi=%s, author=%s, authorHindi=%s, mrp=%s, price=%s, 
            isbn=%s, genre=%s, language=%s, pages=%s, badge=%s, rating=%s, reviews=%s, 
            available=%s, stock=%s, publisher=%s, frontCover=%s, backCover=%s, 
            amazonLink=%s, flipkartLink=%s, ondcLink=%s, description=%s, descriptionHindi=%s,
            is_upcoming=%s, release_date=%s
        WHERE id=%s
    """, (
        book.title, book.titleHindi, book.author, book.authorHindi, book.mrp, book.price,
        book.isbn, book.genre, book.language, book.pages, book.badge, book.rating, book.reviews,
        book.available, book.stock, book.publisher, book.frontCover, book.backCover,
        book.amazonLink, book.flipkartLink, book.ondcLink, book.description, book.descriptionHindi,
        book.is_upcoming, book.release_date,
        book_id
    ), commit=True)
    return {"message": "Book updated"}

@app.post("/books/hero/{book_id}")
def set_hero(book_id: int):
    query_db("UPDATE books SET is_hero=0", commit=True)
    query_db("UPDATE books SET is_hero=1 WHERE id=%s", (book_id,), commit=True)
    return {"message": "Hero book updated"}

@app.post("/books/bestseller/{book_id}")
def set_bestseller(book_id: int):
    query_db("UPDATE books SET is_bestseller=0", commit=True)
    query_db("UPDATE books SET is_bestseller=1 WHERE id=%s", (book_id,), commit=True)
    return {"message": "Bestseller updated"}

# ─── ROUTES: TESTIMONIALS ──────────────────────────────────────────────────
@app.get("/testimonials")
def get_testimonials():
    return query_db("SELECT * FROM testimonials ORDER BY id DESC", fetchall=True) or []

@app.post("/testimonials")
def create_testimonial(testimonial: TestimonialCreate):
    avatar = testimonial.avatar or "".join([part[0].upper() for part in testimonial.name.split() if part])[:3]
    t_id = query_db("INSERT INTO testimonials (name, role, text, rating, avatar) VALUES (%s, %s, %s, %s, %s)", 
                    (testimonial.name, testimonial.role, testimonial.text, testimonial.rating, avatar), commit=True)
    return {"id": t_id, "message": "Testimonial created"}

@app.put("/testimonials/{t_id}")
def update_testimonial(t_id: int, testimonial: TestimonialCreate):
    avatar = testimonial.avatar or "".join([part[0].upper() for part in testimonial.name.split() if part])[:3]
    query_db("UPDATE testimonials SET name=%s, role=%s, text=%s, rating=%s, avatar=%s WHERE id=%s",
             (testimonial.name, testimonial.role, testimonial.text, testimonial.rating, avatar, t_id), commit=True)
    return {"message": "Testimonial updated"}

@app.delete("/testimonials/{t_id}")
def delete_testimonial(t_id: int):
    query_db("DELETE FROM testimonials WHERE id=%s", (t_id,), commit=True)
    return {"message": "Testimonial deleted"}

# ─── ROUTES: SERVICE INQUIRIES & FEEDBACK ───────────────────────────────
@app.post("/service-inquiries")
def add_service_inquiry(inq: ServiceInquiryCreate):
    date_str = datetime.date.today().strftime("%Y-%m-%d")
    query_db("INSERT INTO service_inquiries (service_name, name, email, phone, message, date_submitted) VALUES (%s, %s, %s, %s, %s, %s)",
             (inq.service_name, inq.name, inq.email, inq.phone, inq.message, date_str), commit=True)
    return {"message": "Inquiry submitted successfully"}

@app.get("/service-inquiries")
def get_service_inquiries():
    return query_db("SELECT * FROM service_inquiries ORDER BY id DESC", fetchall=True) or []

@app.post("/service-feedbacks")
def add_service_feedback(fb: ServiceFeedbackCreate):
    date_str = datetime.date.today().strftime("%Y-%m-%d")
    query_db("INSERT INTO service_feedbacks (service_name, name, email, rating, feedback, date_submitted) VALUES (%s, %s, %s, %s, %s, %s)",
             (fb.service_name, fb.name, fb.email, fb.rating, fb.feedback, date_str), commit=True)
    return {"message": "Feedback submitted successfully"}

@app.get("/service-feedbacks")
def get_service_feedbacks():
    return query_db("SELECT * FROM service_feedbacks ORDER BY id DESC", fetchall=True) or []

# ─── ROUTES: TEAM MEMBERS ─────────────────────────────────────────────────
@app.get("/team-members")
def get_team_members():
    return query_db("SELECT * FROM team_members ORDER BY id ASC", fetchall=True) or []

@app.post("/team-members")
def create_team_member(member: TeamMemberCreate):
    m_id = query_db("INSERT INTO team_members (name, role, image, description, category) VALUES (%s, %s, %s, %s, %s)",
                    (member.name, member.role, member.image, member.description, member.category), commit=True)
    return {"id": m_id, "message": "Team member created"}

@app.put("/team-members/{member_id}")
def update_team_member(member_id: int, member: TeamMemberCreate):
    query_db("UPDATE team_members SET name=%s, role=%s, image=%s, description=%s, category=%s WHERE id=%s",
             (member.name, member.role, member.image, member.description, member.category, member_id), commit=True)
    return {"message": "Team member updated"}

@app.delete("/team-members/{member_id}")
def delete_team_member(member_id: int):
    query_db("DELETE FROM team_members WHERE id=%s", (member_id,), commit=True)
    return {"message": "Team member deleted"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)