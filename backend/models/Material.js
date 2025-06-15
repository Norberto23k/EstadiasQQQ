import mongoose from 'mongoose';

const MaterialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  available: { type: Number, required: true, min: 0 },
  qrCode: { type: String, required: true, unique: true },
  imageUrl: { type: String },
  category: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Disponible', 'Ocupado', 'Mantenimiento'], 
    default: 'Disponible' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Material', MaterialSchema);