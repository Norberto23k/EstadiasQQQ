import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configuración para soportar __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Definir constantes de configuración al principio
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Configuración mejorada para almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads');
    // Se podría añadir aquí lógica para crear el directorio si no existe
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${uuidv4()}-${Date.now()}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Filtro de imágenes mejorado
const imageFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isValidExtension = ALLOWED_EXTENSIONS.includes(ext);
  const isValidMimeType = ALLOWED_MIME_TYPES.includes(file.mimetype);

  if (!isValidExtension || !isValidMimeType) {
    return cb(new Error('Solo se permiten archivos de imagen (JPG, JPEG, PNG, WEBP, GIF)'), false);
  }

  if (file.size > MAX_FILE_SIZE) {
    return cb(new Error('El tamaño del archivo no debe exceder los 5MB'), false);
  }

  cb(null, true);
};

// Configuración de Multer con manejo mejorado
const upload = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1 // Solo permite un archivo por campo
  }
});

// Middleware para manejo de errores mejorado
export const handleUploadErrors = (err, req, res, next) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        success: false,
        message: 'El archivo es demasiado grande (máximo 5MB)'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        success: false,
        message: 'Demasiados archivos subidos'
      });
    }
    if (err.message.includes('Solo se permiten archivos de imagen')) {
      return res.status(415).json({ 
        success: false,
        message: 'Tipo de archivo no soportado'
      });
    }
    return res.status(400).json({ 
      success: false,
      message: err.message || 'Error al procesar el archivo'
    });
  }
  next();
};

// Exportaciones para diferentes usos
export const singleUpload = (fieldName) => upload.single(fieldName);
export const arrayUpload = (fieldName, maxCount) => upload.array(fieldName, maxCount);
export const fieldsUpload = (fields) => upload.fields(fields);

export default upload;