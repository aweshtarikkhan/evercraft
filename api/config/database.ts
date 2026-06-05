import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { URL } from 'url';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/evercraft';

// Parse database URL
let host = process.env.DB_HOST || 'localhost';
let user = process.env.DB_USER || 'root';
let password = process.env.DB_PASSWORD || '';
let database = process.env.DB_NAME || 'evercraft';
let port = parseInt(process.env.DB_PORT || '3306');

try {
  const parsed = new URL(databaseUrl);
  host = parsed.hostname || host;
  user = parsed.username || user;
  password = parsed.password ? decodeURIComponent(parsed.password) : password;
  database = parsed.pathname ? parsed.pathname.substring(1) : database;
  port = parsed.port ? parseInt(parsed.port) : port;
} catch (e) {
  // If parsing fails, stick with the defaults / env vars
}

let pool: mysql.Pool;

export async function initDb() {
  try {
    // 1. Connect without database to ensure it exists
    const tempConn = await mysql.createConnection({
      host,
      user,
      password,
      port
    });
    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    await tempConn.end();

    // 2. Initialize connection pool
    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log(`🔌 Connected to MySQL at ${host}:${port}/${database}`);

    // 3. Create tables
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        name VARCHAR(255), 
        email VARCHAR(255), 
        phone VARCHAR(50), 
        password VARCHAR(255), 
        status VARCHAR(50), 
        profile_image LONGTEXT,
        role VARCHAR(50) DEFAULT 'Customer'
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        title VARCHAR(255), 
        titleHindi VARCHAR(255), 
        author VARCHAR(255), 
        authorHindi VARCHAR(255), 
        mrp FLOAT, 
        price FLOAT, 
        isbn VARCHAR(100), 
        genre VARCHAR(100), 
        language VARCHAR(50), 
        pages INT, 
        badge VARCHAR(50), 
        rating FLOAT, 
        reviews INT, 
        available BOOLEAN, 
        frontCover LONGTEXT, 
        backCover LONGTEXT, 
        amazonLink TEXT, 
        flipkartLink TEXT, 
        ondcLink TEXT, 
        description TEXT, 
        descriptionHindi TEXT, 
        is_hero BOOLEAN DEFAULT FALSE, 
        is_bestseller BOOLEAN DEFAULT FALSE,
        stock INT DEFAULT 0,
        is_upcoming BOOLEAN DEFAULT FALSE
      )
    `);

    // Safely add stock column if it doesn't exist
    try {
      await query(`ALTER TABLE books ADD COLUMN stock INT DEFAULT 0`);
    } catch (e: any) {
      if (e.code !== 'ER_DUP_FIELDNAME') console.error('Error adding stock column:', e);
    }

    // Safely add is_upcoming column if it doesn't exist
    try {
      await query(`ALTER TABLE books ADD COLUMN is_upcoming BOOLEAN DEFAULT FALSE`);
    } catch (e: any) {
      if (e.code !== 'ER_DUP_FIELDNAME') console.error('Error adding is_upcoming column:', e);
    }

    await query(`
      CREATE TABLE IF NOT EXISTS book_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        book_id INT,
        user_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        user_id INT, 
        user_name VARCHAR(255), 
        shipping_address_id INT,
        items LONGTEXT, 
        total FLOAT, 
        coupon_code VARCHAR(255),
        discount_amount FLOAT,
        gst_amount FLOAT,
        shipping_cost FLOAT,
        \`date\` VARCHAR(50), 
        status VARCHAR(50)
      )
    `);

    // Alter commands for old schema upgrades (simulating Python pass-on-error behavior)
    try {
      await query(`ALTER TABLE orders ADD COLUMN user_name VARCHAR(255) AFTER user_id`);
    } catch (e) {}

    try {
      await query(`ALTER TABLE orders ADD COLUMN shipping_address_id INT AFTER user_name`);
    } catch (e) {}

    try {
      await query(`ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(255) AFTER total`);
    } catch (e) {}

    try {
      await query(`ALTER TABLE orders ADD COLUMN discount_amount FLOAT AFTER coupon_code`);
    } catch (e) {}

    try {
      await query(`ALTER TABLE orders ADD COLUMN gst_amount FLOAT AFTER discount_amount`);
    } catch (e) {}

    try {
      await query(`ALTER TABLE orders ADD COLUMN shipping_cost FLOAT AFTER gst_amount`);
    } catch (e) {}

    try {
      await query(`ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'Customer'`);
    } catch (e) {}

    try {
      await query(`ALTER TABLE admins ADD COLUMN role VARCHAR(50) DEFAULT 'Super Admin'`);
    } catch (e) {}

    await query(`
      CREATE TABLE IF NOT EXISTS cookie_consents (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        session_id VARCHAR(255) UNIQUE, 
        user_id INT, 
        status VARCHAR(50), 
        \`timestamp\` VARCHAR(50)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        code VARCHAR(255) UNIQUE, 
        discount_percent INT
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS addresses (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        user_id INT, 
        type VARCHAR(50), 
        address TEXT, 
        city VARCHAR(100), 
        pincode VARCHAR(20)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        email VARCHAR(255), 
        \`date\` VARCHAR(50)
      )
    `);

    try {
      await query(`ALTER TABLE subscribers ADD COLUMN \`date\` VARCHAR(50)`);
    } catch (e) {}

    await query(`
      CREATE TABLE IF NOT EXISTS publish_reqs (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        name VARCHAR(255), 
        email VARCHAR(255), 
        phone VARCHAR(50), 
        country VARCHAR(100),
        genre VARCHAR(100), 
        manuscript LONGTEXT, 
        date_submitted VARCHAR(50)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS contact_msgs (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        name VARCHAR(255), 
        email VARCHAR(255), 
        phone VARCHAR(50), 
        subject VARCHAR(255), 
        message TEXT, 
        date_submitted VARCHAR(50)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS front_stats (
        id INT PRIMARY KEY, 
        books_published VARCHAR(50), 
        happy_readers VARCHAR(50), 
        cities_reached VARCHAR(50), 
        sales_platforms VARCHAR(50)
      )
    `);

    try {
      await query(`ALTER TABLE front_stats ADD COLUMN books_published VARCHAR(50) AFTER id`);
    } catch (e) {}

    await query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        email VARCHAR(255) UNIQUE, 
        password VARCHAR(255), 
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'Super Admin'
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS carts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        items TEXT NOT NULL,
        abandoned_email_sent INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255),
        text TEXT,
        rating INT DEFAULT 5,
        avatar VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Helper to seed a user if not exists, and make sure their role/password matches
    const seedUser = async (name: string, email: string, phone: string, pass: string, role: string) => {
      const [rows] = await pool.query<any[]>('SELECT * FROM users WHERE email = ?', [email]);
      if (rows.length === 0) {
        await pool.query('INSERT INTO users (name, email, phone, password, status, profile_image, role) VALUES (?, ?, ?, ?, ?, ?, ?)', 
          [name, email, phone, pass, 'Offline', '', role]);
      } else {
        await pool.query('UPDATE users SET role = ?, password = ? WHERE email = ?', [role, pass, email]);
      }
    };

    // Helper to seed an admin if not exists, and make sure their role/password matches
    const seedAdmin = async (name: string, email: string, pass: string, role: string) => {
      const [rows] = await pool.query<any[]>('SELECT * FROM admins WHERE email = ?', [email]);
      if (rows.length === 0) {
        await pool.query('INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, pass, role]);
      } else {
        await pool.query('UPDATE admins SET role = ?, password = ? WHERE email = ?', [role, pass, email]);
      }
    };

    // 1. Seed developer user/admin
    await seedUser('Developer Admin', 'awesh.etpl@gmail.com', '9999999999', 'Mariyam@2026', 'Developer');
    await seedAdmin('Developer Admin', 'awesh.etpl@gmail.com', 'Mariyam@2026', 'Developer');

    // 2. Seed default admin user/admin
    await seedUser('Admin', 'admin@evercraft.com', '9999999999', 'admin123', 'Master Admin');
    await seedAdmin('Admin', 'admin@evercraft.com', 'admin123', 'Super Admin');

    // 3. Seed master admin user/admin
    await seedUser('Master Admin', 'prprince46@gmail.com', '9999999999', 'Prince@2004', 'Master Admin');
    await seedAdmin('Master Admin', 'prprince46@gmail.com', 'Prince@2004', 'Super Admin');

    await query(`
      CREATE TABLE IF NOT EXISTS settings (
        s_key VARCHAR(255) PRIMARY KEY, 
        s_value LONGTEXT
      )
    `);

    // Upgrade column if it's already created as VARCHAR
    try {
      await query(`ALTER TABLE settings MODIFY COLUMN s_value LONGTEXT`);
    } catch (e) {}

    await query(`INSERT IGNORE INTO settings (s_key, s_value) VALUES ('gst_percent', '0')`);
    await query(`INSERT IGNORE INTO settings (s_key, s_value) VALUES ('shipping_cost', '0')`);

    // Seed additional books if they don't exist
    const [existingBooks] = await pool.query<any[]>('SELECT COUNT(*) as c FROM books');
    if (existingBooks[0].c < 5) {
      const seedBooks = [
        {
          title: 'Atomic Habits', titleHindi: 'एटॉमिक हैबिट्स',
          author: 'James Clear', authorHindi: 'जेम्स क्लियर',
          mrp: 350, price: 299, isbn: '978-0-7352-1129-2',
          genre: 'Self-Help, Productivity', language: 'English', pages: 320,
          badge: 'Bestseller', rating: 4.8, reviews: 245, available: true,
          frontCover: '/Images/atomic_habits.png', backCover: '',
          amazonLink: '', flipkartLink: '', ondcLink: '',
          description: 'No matter your goals, Atomic Habits offers a proven framework for improving every day. James Clear, one of the world\'s leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.',
          descriptionHindi: 'चाहे आपके लक्ष्य कुछ भी हों, एटॉमिक हैबिट्स हर दिन सुधार के लिए एक सिद्ध रूपरेखा प्रदान करती है।',
          is_hero: false, is_bestseller: false
        },
        {
          title: 'Ikigai', titleHindi: 'इकिगाई',
          author: 'Héctor García & Francesc Miralles', authorHindi: 'हेक्टर गार्सिया',
          mrp: 250, price: 199, isbn: '978-0-14-313101-5',
          genre: 'Self-Help, Philosophy', language: 'English', pages: 194,
          badge: 'Popular', rating: 4.6, reviews: 189, available: true,
          frontCover: '/Images/ikigai.png', backCover: '',
          amazonLink: '', flipkartLink: '', ondcLink: '',
          description: 'The people of Japan believe that everyone has an ikigai — a reason to jump out of bed each morning. According to the Japanese, everyone has an ikigai. Finding it requires a deep and often lengthy search of self. Such a search is regarded as being very important, since it is believed that discovery of one\'s ikigai brings satisfaction and meaning to life.',
          descriptionHindi: 'जापान के लोग मानते हैं कि हर किसी का एक इकिगाई होता है — हर सुबह बिस्तर से उठने का एक कारण।',
          is_hero: false, is_bestseller: false
        },
        {
          title: 'The Alchemist', titleHindi: 'द अल्केमिस्ट',
          author: 'Paulo Coelho', authorHindi: 'पाउलो कोएल्हो',
          mrp: 299, price: 249, isbn: '978-0-06-231500-7',
          genre: 'Fiction, Philosophy', language: 'English', pages: 197,
          badge: 'Classic', rating: 4.7, reviews: 312, available: true,
          frontCover: '/Images/the_alchemist.png', backCover: '',
          amazonLink: '', flipkartLink: '', ondcLink: '',
          description: 'Paulo Coelho\'s enchanting novel has inspired a devoted following around the world. This story, dazzling in its powerful simplicity and soul-stirring wisdom, is about an Andalusian shepherd boy named Santiago who travels from his homeland in Spain to the Egyptian desert in search of a treasure buried near the Pyramids.',
          descriptionHindi: 'पाउलो कोएल्हो का यह मनमोहक उपन्यास दुनिया भर में एक समर्पित अनुयायी समूह को प्रेरित करता है।',
          is_hero: false, is_bestseller: false
        },
        {
          title: 'Think and Grow Rich', titleHindi: 'सोचिये और अमीर बनिये',
          author: 'Napoleon Hill', authorHindi: 'नेपोलियन हिल',
          mrp: 199, price: 149, isbn: '978-1-58542-980-5',
          genre: 'Business, Motivation', language: 'English', pages: 238,
          badge: '', rating: 4.5, reviews: 156, available: true,
          frontCover: '/Images/think_and_grow_rich.png', backCover: '',
          amazonLink: '', flipkartLink: '', ondcLink: '',
          description: 'Think and Grow Rich has been called the "Granddaddy of All Motivational Literature." It was the first book to boldly ask, "What makes a winner?" The man who asked and listened for the answer, Napoleon Hill, is now counted among the greatest winners of all time.',
          descriptionHindi: 'थिंक एंड ग्रो रिच को "सभी प्रेरक साहित्य का दादा" कहा गया है।',
          is_hero: false, is_bestseller: false
        },
        {
          title: 'The Art of Living', titleHindi: 'जीवन जीने की कला',
          author: 'EverCraft Publications', authorHindi: 'एवरक्राफ्ट पब्लिकेशंस',
          mrp: 0, price: 0, isbn: 'FREE-001',
          genre: 'Self-Help, Spirituality', language: 'Hindi', pages: 45,
          badge: 'Free', rating: 4.3, reviews: 67, available: true,
          frontCover: '/Images/the_art_of_living.png', backCover: '',
          amazonLink: '', flipkartLink: '', ondcLink: '',
          description: 'जीवन जीने की कला एक मार्गदर्शिका है जो आपको सिखाती है कि कैसे आप अपने जीवन को अर्थपूर्ण और खुशहाल बना सकते हैं। इस पुस्तक में आध्यात्मिकता, मानसिक स्वास्थ्य, और दैनिक आदतों पर व्यावहारिक सलाह दी गई है।\n\n--- अध्याय 1: आत्म-जागरूकता ---\n\nजीवन की यात्रा आत्म-जागरूकता से शुरू होती है। जब हम अपने विचारों, भावनाओं और व्यवहारों को समझने लगते हैं, तभी हम सच्चे बदलाव ला सकते हैं। आत्म-जागरूकता का अर्थ है अपने आप को बिना किसी पूर्वाग्रह के देखना।\n\nध्यान (Meditation) आत्म-जागरूकता का सबसे शक्तिशाली उपकरण है। प्रतिदिन केवल 10 मिनट का ध्यान आपके जीवन को बदल सकता है। शांत बैठें, अपनी सांसों पर ध्यान दें, और अपने विचारों को बिना निर्णय के देखें।\n\n--- अध्याय 2: सकारात्मक सोच ---\n\nसकारात्मक सोच केवल एक मानसिकता नहीं है, यह एक जीवनशैली है। जब हम सकारात्मक सोचते हैं, तो हम बेहतर निर्णय लेते हैं, बेहतर संबंध बनाते हैं, और अधिक खुश रहते हैं।\n\nहर सुबह उठकर तीन चीजों के लिए कृतज्ञता व्यक्त करें। यह सरल आदत आपकी सोच को पूरी तरह बदल सकती है।\n\n--- अध्याय 3: स्वस्थ आदतें ---\n\nस्वस्थ शरीर में स्वस्थ मन निवास करता है। नियमित व्यायाम, संतुलित आहार, और पर्याप्त नींद — ये तीन स्तंभ आपके स्वास्थ्य की नींव हैं।\n\nप्रतिदिन कम से कम 30 मिनट व्यायाम करें। यह आपकी शारीरिक और मानसिक दोनों तरह की सेहत के लिए आवश्यक है।',
          descriptionHindi: 'जीवन जीने की कला — एक सम्पूर्ण मार्गदर्शिका',
          is_hero: false, is_bestseller: false
        },
        {
          title: 'Beginner\'s Guide to Publishing', titleHindi: 'प्रकाशन की शुरुआती गाइड',
          author: 'EverCraft Publications', authorHindi: 'एवरक्राफ्ट पब्लिकेशंस',
          mrp: 0, price: 0, isbn: 'FREE-002',
          genre: 'Education, Publishing', language: 'English', pages: 38,
          badge: 'Free', rating: 4.1, reviews: 42, available: true,
          frontCover: '/Images/publishing_guide.png', backCover: '',
          amazonLink: '', flipkartLink: '', ondcLink: '',
          description: 'A comprehensive guide for first-time authors looking to navigate the world of book publishing in India. This free resource by EverCraft Publications covers everything from writing your first draft to getting your book on Amazon.\n\n--- Chapter 1: Writing Your First Draft ---\n\nEvery great book starts with a single word. The most important step in becoming a published author is simply sitting down and writing. Don\'t worry about perfection — your first draft is meant to be messy.\n\nSet a daily writing goal. Even 500 words a day will give you a complete manuscript in just a few months. The key is consistency, not speed.\n\nFind your writing space — a quiet corner, a coffee shop, or your study. Make it your creative sanctuary.\n\n--- Chapter 2: Self-Editing Basics ---\n\nOnce your first draft is complete, let it rest for at least two weeks. Then read it fresh with a critical eye.\n\nLook for: Plot holes and inconsistencies, weak dialogue, unnecessary scenes, and grammatical errors.\n\nRead your work aloud — you\'ll catch awkward phrasing and rhythm issues that your eyes might miss.\n\n--- Chapter 3: Choosing a Publisher ---\n\nResearch publishers who specialize in your genre. Look at their catalog, author testimonials, and distribution reach.\n\nKey questions to ask: What services are included? What are the costs? How are royalties calculated? Where will my book be distributed?\n\nEverCraft Publications offers end-to-end publishing services with transparent pricing and nationwide distribution on Amazon, Flipkart, and ONDC.\n\n--- Chapter 4: The Publishing Process ---\n\nA typical publishing journey takes 3-6 months from manuscript to bookshelf:\n\n1. Manuscript submission and evaluation\n2. Editing and proofreading\n3. Cover design and interior layout\n4. Printing and quality check\n5. Distribution and marketing\n\nPatience and collaboration with your publisher are key to a successful launch.',
          descriptionHindi: 'भारत में पुस्तक प्रकाशन की दुनिया में नेविगेट करने के इच्छुक पहली बार के लेखकों के लिए एक व्यापक गाइड।',
          is_hero: false, is_bestseller: false
        }
      ];

      for (const b of seedBooks) {
        const [existing] = await pool.query<any[]>('SELECT id FROM books WHERE isbn = ?', [b.isbn]);
        if (existing.length === 0) {
          await query(
            `INSERT INTO books (title, titleHindi, author, authorHindi, mrp, price, isbn, genre, language, pages, badge, rating, reviews, available, frontCover, backCover, amazonLink, flipkartLink, ondcLink, description, descriptionHindi, is_hero, is_bestseller)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [b.title, b.titleHindi, b.author, b.authorHindi, b.mrp, b.price, b.isbn, b.genre, b.language, b.pages, b.badge, b.rating, b.reviews, b.available, b.frontCover, b.backCover, b.amazonLink, b.flipkartLink, b.ondcLink, b.description, b.descriptionHindi, b.is_hero, b.is_bestseller]
          );
          console.log(`  📚 Seeded book: ${b.title}`);
        }
      }
    }

    console.log("✅ MySQL Database tables initialized!");
  } catch (error) {
    console.error("❌ MySQL Connection/Init Error:", error);
    throw error;
  }
}

// Database helper
export async function query(sql: string, params: any[] = []): Promise<any> {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDb() first.');
  }
  const [results] = await pool.query(sql, params);
  return results;
}
