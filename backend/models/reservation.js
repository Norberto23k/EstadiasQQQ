import mongoose from 'mongoose';

const ReservationSchema = new mongoose.Schema({
  materialId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Material', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pendiente', 'Aprobado', 'Rechazado'], 
    default: 'Pendiente' 
  },
  rejectionReason: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model('Reservation', ReservationSchema);