const Material = require('../models/Material');
const cloudinary = require('../config/cloudinary');

exports.getMaterials = async (req, res) => {
  try {
    const materials = await Material.find();
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener materiales', error });
  }
};

exports.createMaterial = async (req, res) => {
  try {
    const { nombre, descripcion, categoria, estado } = req.body;

    const result = await cloudinary.uploader.upload(req.file.path);
    const nuevoMaterial = new Material({
      nombre,
      descripcion,
      categoria,
      estado,
      imagenUrl: result.secure_url,
      imagenId: result.public_id,
    });

    await nuevoMaterial.save();
    res.status(201).json(nuevoMaterial);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear material', error });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (material) {
      await cloudinary.uploader.destroy(material.imagenId);
      await material.deleteOne();
      res.json({ message: 'Material eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Material no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar material', error });
  }
};
