const mysql = require('mysql2/promise');

async function run() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'evercraft',
      password: 'Evercraft@2026',
      database: 'evercraft'
    });
    
    console.log('Fixing image URLs in database...');
    // Replace lower case /images/ with Capitalized /Images/
    await connection.execute(`UPDATE books SET frontCover = REPLACE(frontCover, '/images/', '/Images/')`);
    await connection.execute(`UPDATE books SET backCover = REPLACE(backCover, '/images/', '/Images/')`);
    
    console.log('Cover URLs fixed successfully!');
    await connection.end();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
