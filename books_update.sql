DELETE FROM books WHERE title NOT LIKE '%sundarkhand%';

INSERT INTO books (
    title, titleHindi, author, authorHindi, mrp, price, isbn, genre, language,
    pages, badge, rating, reviews, available, frontCover, backCover,
    amazonLink, flipkartLink, ondcLink, description, descriptionHindi,
    is_hero, is_bestseller, stock, is_upcoming
  ) VALUES (
    'Yatharth', 'यथार्थ', 'Rameshwar Prasad Dixit', 'रामेश्वर प्रसाद दीक्षित', 499, 499, '978-81-949301-0-5', 'Spiritual, Philosophical & Self-Help', 'Hindi',
    164, '', 5, 0, 1, '/images/books/Book_1_Front.png', '/images/books/Book_1_Back.png',
    '', '', '', '“Yatharth” is a spiritual book that presents a yogic and Vedantic interpretation of Sundarkand from the Ramcharitmanas. Written by Rameshwar Prasad Dixit, it explores the deeper symbolic meanings behind characters and events, linking them to human consciousness and inner growth. The book also explains the chakra system, guiding readers toward self-realization, balance, and a more meaningful, spiritually aware life.', '“यथार्थ” एक आध्यात्मिक पुस्तक है जो रामचरितमानस के सुंदरकांड की योगिक और वैदांतिक व्याख्या प्रस्तुत करती है। लेखक रामेश्वर प्रसाद दीक्षित ने इसमें पात्रों और घटनाओं के गहरे प्रतीकात्मक अर्थ समझाए हैं, जिन्हें मानव चेतना और आत्म-विकास से जोड़ा गया है। साथ ही चक्रों का वर्णन करते हुए यह पुस्तक आत्मबोध, संतुलन और सार्थक जीवन की दिशा दिखाती है।',
    0, 0, 218, 0
  );
INSERT INTO books (
    title, titleHindi, author, authorHindi, mrp, price, isbn, genre, language,
    pages, badge, rating, reviews, available, frontCover, backCover,
    amazonLink, flipkartLink, ondcLink, description, descriptionHindi,
    is_hero, is_bestseller, stock, is_upcoming
  ) VALUES (
    'Sifar Shesh', 'सिफ़र शेष', 'J. Rajaram', 'जे. राजाराम', 260, 260, '978-81-949301-6-7', 'Fiction', 'Hindi',
    156, '', 5, 0, 1, '/images/books/Book_2_Front.png', '/images/books/Book_2_Back.png',
    '', '', '', '“Sifar Shesh” by J. Rajaram is a collection of short stories that explores human emotions, struggles, love, and societal realities. Through simple yet impactful storytelling, the book highlights everyday experiences, moral dilemmas, and deep reflections on life. Each story carries a meaningful message, encouraging readers to think, feel, and connect with the truths of modern life and human relationships.', '“सिफ़र शेष” जे. राजाराम द्वारा लिखित लघु कथाओं का संग्रह है, जो मानवीय भावनाओं, संघर्ष, प्रेम और समाज की वास्तविकताओं को दर्शाता है। सरल लेकिन प्रभावशाली भाषा में लिखी गई ये कहानियाँ जीवन के अनुभवों, नैतिक द्वंद्व और गहरी सोच को उजागर करती हैं। हर कहानी एक संदेश देती है, जो पाठकों को सोचने, महसूस करने और जीवन की सच्चाइयों से जुड़ने के लिए प्रेरित करती है।',
    0, 0, 349, 0
  );
INSERT INTO books (
    title, titleHindi, author, authorHindi, mrp, price, isbn, genre, language,
    pages, badge, rating, reviews, available, frontCover, backCover,
    amazonLink, flipkartLink, ondcLink, description, descriptionHindi,
    is_hero, is_bestseller, stock, is_upcoming
  ) VALUES (
    'Khoi Hui Zubaan Kee Waapasee', 'खोई हुई जुबान की वापसी', 'Rahul Banerjee', 'राहुल बैनर्जी', 300, 300, '978-81-960210-1-6', 'Social & Political Issues / Activism', 'Hindi',
    338, '', 5, 0, 1, '/images/books/Book_3_Front.png', '/images/books/Book_3_Back.png',
    '', '', '', '“Khoi Hui Zubaan Kee Waapasee” presents real stories of tribal and marginalized communities in central India. It highlights struggles against social injustice, environmental challenges, and grassroots movements. The book sheds light on people fighting for their rights, land, and identity, bringing forward voices often ignored, through powerful real-life experiences and narratives.', '“खोई हुई ज़ुबान की वापसी” मध्य भारत के आदिवासी और वंचित समुदायों के संघर्षों की सच्ची कहानी प्रस्तुत करती है। यह पुस्तक सामाजिक अन्याय, पर्यावरणीय संकट और जन आंदोलनों को उजागर करती है, जहाँ लोग अपने अधिकार, जमीन और पहचान के लिए लड़ रहे हैं। लेखक ने वास्तविक घटनाओं के माध्यम से दबे हुए स्वर को सामने लाने का प्रयास किया है।',
    0, 0, 484, 0
  );
INSERT INTO books (
    title, titleHindi, author, authorHindi, mrp, price, isbn, genre, language,
    pages, badge, rating, reviews, available, frontCover, backCover,
    amazonLink, flipkartLink, ondcLink, description, descriptionHindi,
    is_hero, is_bestseller, stock, is_upcoming
  ) VALUES (
    'ReInventing Future', 'रीइन्वेंटिंग फ्यूचर', 'Dr. Nilambara Shrivastav', 'डॉ. नीलाम्बरा श्रीवास्तव', 400, 400, '', 'Educational, Academic, Leadership & Professional Development', 'English',
    172, '', 5, 0, 1, '/images/books/Book_4_Front.png', '/images/books/Book_4_Back.png',
    '', '', '', '“Re-Inventing Future” by Dr. Nilambara Shrivastava focuses on redefining the role of professors in modern education, especially under India’s New Education Policy. It highlights leadership, innovative teaching methods, student engagement, and the use of technology. The book guides educators to adapt to changing academic needs and prepare students for future challenges, making it useful for teachers, researchers, and academic professionals.', '“रीइन्वेंटिंग फ्यूचर” डॉ. नीलाम्बरा श्रीवास्तव द्वारा लिखित पुस्तक है, जो नई शिक्षा नीति के तहत प्रोफेसरों की भूमिका को नए दृष्टिकोण से समझाती है। इसमें नेतृत्व, आधुनिक शिक्षण विधियाँ, तकनीक का उपयोग और छात्रों के विकास पर जोर दिया गया है। यह पुस्तक शिक्षकों और शिक्षाविदों को बदलते समय के अनुसार खुद को ढालने और विद्यार्थियों को भविष्य के लिए तैयार करने में मदद करती है।',
    0, 0, 313, 0
  );
INSERT INTO books (
    title, titleHindi, author, authorHindi, mrp, price, isbn, genre, language,
    pages, badge, rating, reviews, available, frontCover, backCover,
    amazonLink, flipkartLink, ondcLink, description, descriptionHindi,
    is_hero, is_bestseller, stock, is_upcoming
  ) VALUES (
    'Neither Water Nor Governance', 'नीदर वाटर नॉर गवर्नेंस', 'Rahul Banerjee', 'राहुल बैनर्जी', 300, 300, '978-81-960210-4-7', 'Non-Fiction, Environmental Studies & Public Policy', 'English',
    196, '', 5, 0, 1, '/images/books/Book_5_Front.png', '/images/books/Book_5_Back.png',
    '', '', '', '“Neither Water Nor Governance” by Rahul Banerjee explores the challenges of water mismanagement in the Narmada River Basin. The book examines geographical, environmental, and political aspects influencing water resources, highlighting disputes, development projects, and sustainability concerns. It critically analyzes governance failures and emphasizes the need for balanced, inclusive, and sustainable water management practices to ensure long-term ecological and social well-being.', '“नीदर वाटर नॉर गवर्नेंस” राहुल बनर्जी की पुस्तक है, जो नर्मदा नदी बेसिन में जल कुप्रबंधन की समस्याओं को उजागर करती है। इसमें भौगोलिक, पर्यावरणीय और राजनीतिक पहलुओं का विश्लेषण किया गया है। पुस्तक जल विवादों, विकास परियोजनाओं और सतत प्रबंधन की आवश्यकता पर प्रकाश डालते हुए बेहतर और संतुलित जल शासन की जरूरत को समझाती है।',
    0, 0, 324, 0
  );
INSERT INTO books (
    title, titleHindi, author, authorHindi, mrp, price, isbn, genre, language,
    pages, badge, rating, reviews, available, frontCover, backCover,
    amazonLink, flipkartLink, ondcLink, description, descriptionHindi,
    is_hero, is_bestseller, stock, is_upcoming
  ) VALUES (
    'My Wise Countrymen', 'माय वाइज़ कंट्रीमेन', 'Jitendra Rajaram Verma', 'जितेन्द्र राजाराम वर्मा', 150, 150, '', 'Romantic, Social & Inspirational Novel', 'English',
    190, '', 5, 0, 1, '/images/books/Book_6_Front.png', '/images/books/Book_6_Back.png',
    '', '', '', '“My Wise Countrymen” by Jitendra Rajaram Verma is a compelling contemporary fiction that blends love, youth, and social awakening. Set around college life, it follows a group of students navigating relationships, dreams, and real-world challenges. As they grow, they strive to bring meaningful change to society. The novel offers a realistic, inspiring journey of passion, purpose, and patriotism.', '“माय वाइज़ कंट्रीमेन” एक प्रेरणादायक उपन्यास है जो प्रेम, युवावस्था और सामाजिक जागरूकता को दर्शाता है। यह कहानी कॉलेज जीवन के इर्द-गिर्द घूमती है, जहाँ कुछ छात्र अपने सपनों, रिश्तों और चुनौतियों से जूझते हैं। धीरे-धीरे वे समाज में बदलाव लाने की दिशा में आगे बढ़ते हैं। यह एक वास्तविक, प्रेरक और देशभक्ति से भरी यात्रा है।',
    0, 0, 350, 0
  );
