import xml.etree.ElementTree as ET

try:
    tree = ET.parse('raw_docx.xml')
    root = tree.getroot()
    texts = []
    for t in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'):
        if t.text:
            texts.append(t.text)
    
    with open('all_text.txt', 'w', encoding='utf-8') as f:
        f.write('\n'.join(texts))
    print('done')
except Exception as e:
    print(e)
