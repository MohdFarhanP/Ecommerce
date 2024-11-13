const multer = require('multer');

// multer configuration 
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = { upload };