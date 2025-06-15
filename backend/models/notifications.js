import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'alert', 'success'],
    default: 'info'
  },
  read: {
    type: Boolean,
    default: false
  },
  action: {
    route: String,
    params: mongoose.Schema.Types.Mixed
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

// Middleware para actualizar la fecha de modificación
NotificationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Método para marcar como leída
NotificationSchema.methods.markAsRead = function() {
  this.read = true;
  return this.save();
};

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;