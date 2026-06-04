import urllib.request
import json

def test_api():
    try:
        response = urllib.request.urlopen("http://localhost:8000/books")
        data = json.loads(response.read())
        print(f"API returned {len(data)} books:")
        for idx, b in enumerate(data):
            print(f"{idx + 1}. ID: {b['id']}, Title: '{b['title']}', Language: '{b['language']}'")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    test_api()
