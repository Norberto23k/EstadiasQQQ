import Reservation from '../models/reservation.js';
import Material from '../models/Material.js';
import User from '../models/User.js';
import { createNotification } from '../services/notificationService.js';

export const getAllReservations = async (req, res) => {
  try {
    const { status, userId, materialId } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    if (materialId) filter.materialId = materialId;

    const reservations = await Reservation.find(filter)
      .populate('userId', 'name email')
      .populate('materialId', 'name description status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });

  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reservas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const createReservation = async (req, res) => {
  try {
    const { userId, materialId, startDate, endDate } = req.body;

    // Verificar disponibilidad del material
    const material = await Material.findById(materialId);
    if (!material || material.status !== 'Disponible') {
      return res.status(400).json({
        success: false,
        message: 'El material no está disponible para reserva'
      });
    }

    // Verificar conflictos de reserva
    const conflictingReservation = await Reservation.findOne({
      materialId,
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
        { startDate: { $gte: startDate, $lte: endDate } }
      ],
      status: { $in: ['Pendiente', 'Aprobado'] }
    });

    if (conflictingReservation) {
      return res.status(409).json({
        success: false,
        message: 'El material ya tiene una reserva en ese período'
      });
    }

    const reservation = new Reservation({
      userId,
      materialId,
      startDate,
      endDate,
      status: 'Pendiente'
    });

    await reservation.save();

    // Notificar al administrador
    await createNotification({
      userId: 'admin', // O el ID de un admin específico
      message: `Nueva reserva pendiente para ${material.name}`,
      type: 'reservation'
    });

    res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente',
      data: await reservation.populate(['userId', 'materialId'])
    });

  } catch (error) {
    console.error('Reservation creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear reserva',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const approveReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { status: 'Aprobado' },
      { new: true }
    ).populate(['userId', 'materialId']);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    // Actualizar estado del material
    await Material.findByIdAndUpdate(
      reservation.materialId,
      { status: 'Reservado' }
    );

    // Notificar al usuario
    await createNotification({
      userId: reservation.userId._id,
      message: `Tu reserva para ${reservation.materialId.name} ha sido aprobada`,
      type: 'reservation'
    });

    res.status(200).json({
      success: true,
      message: 'Reserva aprobada exitosamente',
      data: reservation
    });

  } catch (error) {
    console.error('Reservation approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al aprobar reserva',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const rejectReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar una razón para el rechazo'
      });
    }

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { 
        status: 'Rechazado',
        rejectionReason 
      },
      { new: true }
    ).populate(['userId', 'materialId']);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    // Notificar al usuario
    await createNotification({
      userId: reservation.userId._id,
      message: `Tu reserva para ${reservation.materialId.name} ha sido rechazada`,
      type: 'reservation',
      details: rejectionReason
    });

    res.status(200).json({
      success: true,
      message: 'Reserva rechazada exitosamente',
      data: reservation
    });

  } catch (error) {
    console.error('Reservation rejection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al rechazar reserva',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getReservationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const reservations = await Reservation.find({ userId })
      .populate('materialId', 'name description status imageUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });

  } catch (error) {
    console.error('Error fetching user reservations:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reservas del usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};