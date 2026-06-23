import zipfile

try:
    doc = zipfile.ZipFile('Books Details/Book List.docx')
    xml_content = doc.read('word/document.xml')
    with open('raw_docx.xml', 'w', encoding='utf-8') as f:
        f.write(xml_content.decode('utf-8'))
except Exception as e:
    print(e)
