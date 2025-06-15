const multer = require('multer');
const path = require('path');

// Configuración para aceptar solo imágenes
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const imageFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);
  if (!['.jpg', '.jpeg', '.png'].includes(ext.toLowerCase())) {
    return cb(new Error('Solo se permiten imágenes'), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter: imageFilter });
module.exports = upload;
