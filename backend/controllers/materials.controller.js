import Material from '../models/Material.js';
import cloudinary from '../config/cloudinary.js';
import { v4 as uuidv4 } from 'uuid';

export const getMaterials = async (req, res) => {
  try {
    const materials = await Material.find()
      .select('-__v -createdAt -updatedAt')
      .lean();

    res.status(200).json({
      success: true,
      count: materials.length,
      data: materials
    });

  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener materiales',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const createMaterial = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar una imagen'
      });
    }

    const { nombre, descripcion, categoria, estado } = req.body;

    // Generate unique filename
    const uniqueFilename = `material-${uuidv4()}`;
    
    const uploadOptions = {
      public_id: uniqueFilename,
      folder: 'materials',
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
    };

    const result = await cloudinary.uploader.upload(req.file.path, uploadOptions);

    const nuevoMaterial = new Material({
      nombre,
      descripcion,
      categoria,
      estado: estado || 'Disponible',
      imagenUrl: result.secure_url,
      imagenId: result.public_id,
      qrCode: uuidv4() // Generate unique QR code
    });

    await nuevoMaterial.save();

    // Remove sensitive/unnecessary fields from response
    const materialResponse = nuevoMaterial.toObject();
    delete materialResponse.__v;

    res.status(201).json({
      success: true,
      message: 'Material creado exitosamente',
      data: materialResponse
    });

  } catch (error) {
    console.error('Material creation error:', error);
    
    // Cleanup uploaded file if error occurs
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear material',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material no encontrado'
      });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(material.imagenId, {
      resource_type: 'image'
    });

    // Delete from database
    await Material.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Material eliminado correctamente'
    });

  } catch (error) {
    console.error('Material deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar material',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};