import mysql.connector
import os
from dotenv import load_dotenv, find_dotenv
from urllib.parse import urlparse

# Load env
load_dotenv(find_dotenv())
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost:3306/evercraft")

# Parse
parsed_url = urlparse(DATABASE_URL)
DB_CONFIG = {
    'host': parsed_url.hostname or 'localhost',
    'user': parsed_url.username or 'root',
    'password': parsed_url.password or '',
    'database': parsed_url.path.lstrip('/') if parsed_url.path else 'evercraft',
    'port': parsed_url.port or 3306
}

def fix_sundarkand():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        # Query books with similar title
        cursor.execute("SELECT id, title, language FROM books WHERE title LIKE '%Sundarkand%'")
        books = cursor.fetchall()
        print(f"Found {len(books)} books matching 'Sundarkand':")
        for b in books:
            print(f"ID: {b['id']}, Title: '{b['title']}', Language: '{b['language']}'")
            
        if len(books) > 1:
            # Keep the first one, delete the rest
            ids = [b['id'] for b in books]
            keep_id = ids[0]
            delete_ids = ids[1:]
            
            print(f"Keeping book ID: {keep_id}")
            for d_id in delete_ids:
                print(f"Deleting duplicate book ID: {d_id}")
                cursor.execute("DELETE FROM books WHERE id = %s", (d_id,))
                
            # Update the language to Hindi
            cursor.execute("UPDATE books SET language = 'Hindi' WHERE id = %s", (keep_id,))
            print(f"Updated book ID: {keep_id} language to Hindi.")
            
        elif len(books) == 1:
            # Only one exists, update language to Hindi
            keep_id = books[0]['id']
            cursor.execute("UPDATE books SET language = 'Hindi' WHERE id = %s", (keep_id,))
            print(f"Only one book found. Updated book ID: {keep_id} language to Hindi.")
        else:
            print("No books found matching 'Sundarkand'.")
            
        conn.commit()
        cursor.close()
        conn.close()
        print("Success!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    fix_sundarkand()
