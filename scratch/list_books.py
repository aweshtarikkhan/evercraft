import mysql.connector
import os
from dotenv import load_dotenv, find_dotenv
from urllib.parse import urlparse

load_dotenv(find_dotenv())
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost:3306/evercraft")
parsed_url = urlparse(DATABASE_URL)
DB_CONFIG = {
    'host': parsed_url.hostname or 'localhost',
    'user': parsed_url.username or 'root',
    'password': parsed_url.password or '',
    'database': parsed_url.path.lstrip('/') if parsed_url.path else 'evercraft',
    'port': parsed_url.port or 3306
}

def list_books():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, title, author, language FROM books")
        books = cursor.fetchall()
        print(f"Total books in DB: {len(books)}")
        for b in books:
            print(f"ID: {b['id']}, Title: '{b['title']}', Author: '{b['author']}', Language: '{b['language']}'")
        cursor.close()
        conn.close()
    except Exception as e:
        print(e)

if __name__ == '__main__':
    list_books()
