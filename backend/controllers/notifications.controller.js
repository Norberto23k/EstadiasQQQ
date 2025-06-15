import Notification from '../models/notifications.js';
import Loan from '../models/Loan.js';
import Reservation from '../models/reservation.js';

export const getNotifications = async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }

    // 1. Get upcoming due loans (within 3 days)
    const dueLoans = await Loan.find({
      user: userId,
      endDate: { 
        $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        $gte: new Date() 
      },
      status: 'active'
    }).populate('material');

    // 2. Get reservation status updates
    const reservationUpdates = await Reservation.find({
      user: userId,
      status: { $in: ['Aprobado', 'Rechazado'] },
      viewed: false
    }).populate('material');

    // 3. Get system notifications
    const systemNotifications = await Notification.find({
      $or: [
        { user: userId },
        { user: null } // General notifications
      ],
      viewed: false
    }).sort({ createdAt: -1 });

    // Format notifications
    const loanNotifications = dueLoans.map(loan => ({
      type: 'loan',
      message: `Tu préstamo de ${loan.material.nombre} está por vencer`,
      data: loan,
      priority: 'high'
    }));

    const reservationNotifications = reservationUpdates.map(res => ({
      type: 'reservation',
      message: `Tu reserva de ${res.material.nombre} ha sido ${res.status}`,
      data: res,
      priority: res.status === 'Aprobado' ? 'medium' : 'low'
    }));

    const systemNotifs = systemNotifications.map(notif => ({
      type: 'system',
      message: notif.message,
      data: notif,
      priority: notif.priority || 'medium'
    }));

    // Combine all notifications
    const allNotifications = [
      ...loanNotifications,
      ...reservationNotifications,
      ...systemNotifs
    ].sort((a, b) => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    res.status(200).json({
      success: true,
      count: allNotifications.length,
      notifications: allNotifications
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;

    // Update notifications as viewed
    await Notification.updateMany(
      { _id: { $in: notificationIds } },
      { $set: { viewed: true } }
    );

    res.status(200).json({
      success: true,
      message: 'Notificaciones marcadas como leídas'
    });

  } catch (error) {
    console.error('Error marking notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar notificaciones'
    });
  }
};