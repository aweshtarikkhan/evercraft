const fs = require('fs');
const content = fs.readFileSync('all_books.sql', 'utf8');
const match = content.match(/INSERT INTO `books` VALUES (.*?);/s);
if (match) {
  const values = match[1];
  console.log('Found INSERT block with length:', values.length);
  // Let's count how many books: Split by "),("
  const books = values.split(/\),\(/);
  console.log('Number of books found:', books.length);
  
  // Look at the first book
  console.log('First book:', books[0].substring(0, 100));
} else {
  console.log('No INSERT block found');
}
