const mammoth = require('mammoth');
const fs = require('fs');

mammoth.extractRawText({path: './Books Details/Book List.docx'})
  .then(result => {
    fs.writeFileSync('./Books Details/book_list.txt', result.value);
    console.log('Success');
  })
  .catch(err => console.error(err));
