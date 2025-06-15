import Notification from '../models/notifications.js';
import User from '../models/User.js';

/**
 * Crea una nueva notificación
 * @param {Object} data - Datos de la notificación
 * @param {String} data.userId - ID del usuario destinatario
 * @param {String} data.message - Mensaje de la notificación
 * @param {'info'|'warning'|'alert'|'success'} data.type - Tipo de notificación
 * @param {Object} [data.action] - Acción asociada (opcional)
 * @param {String} [data.action.route] - Ruta para la acción
 * @param {Object} [data.action.params] - Parámetros para la acción
 * @returns {Promise<Object>} Notificación creada
 */
export const createNotification = async (data) => {
  try {
    const notification = new Notification({
      userId: data.userId,
      message: data.message,
      type: data.type || 'info',
      action: data.action,
      read: false
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new Error('Error al crear notificación');
  }
};

/**
 * Obtiene notificaciones para un usuario específico
 * @param {String} userId - ID del usuario
 * @param {Boolean} [unreadOnly=false] - Solo notificaciones no leídas
 * @returns {Promise<Array>} Lista de notificaciones
 */
export const getUserNotifications = async (userId, unreadOnly = false) => {
  try {
    const query = { userId };
    if (unreadOnly) query.read = false;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw new Error('Error al obtener notificaciones');
  }
};

/**
 * Marca una notificación como leída
 * @param {String} notificationId - ID de la notificación
 * @returns {Promise<Object>} Notificación actualizada
 */
export const markAsRead = async (notificationId) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!notification) {
      throw new Error('Notificación no encontrada');
    }

    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new Error('Error al marcar notificación como leída');
  }
};

/**
 * Envía notificación a todos los administradores
 * @param {String} message - Mensaje de la notificación
 * @param {Object} [action] - Acción asociada (opcional)
 * @returns {Promise<Array>} Notificaciones creadas
 */
export const notifyAdmins = async (message, action) => {
  try {
    const admins = await User.find({ 
      role: { $in: ['admin', 'super-admin'] } 
    }).select('_id');

    const notifications = await Promise.all(
      admins.map(admin => 
        createNotification({
          userId: admin._id,
          message,
          type: 'alert',
          action
        })
      )
    );

    return notifications;
  } catch (error) {
    console.error('Error notifying admins:', error);
    throw new Error('Error al notificar administradores');
  }
};

/**
 * Elimina notificaciones antiguas (más de 30 días)
 * @returns {Promise<Object>} Resultado de la operación
 */
export const cleanupOldNotifications = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Notification.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      read: true
    });

    return result;
  } catch (error) {
    console.error('Error cleaning up old notifications:', error);
    throw new Error('Error al limpiar notificaciones antiguas');
  }
};