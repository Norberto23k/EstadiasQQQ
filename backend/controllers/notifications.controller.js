exports.getNotifications = (req, res) => {
  // Placeholder de ejemplo
  res.json([
    { id: 1, mensaje: 'Tu préstamo está por vencer', tipo: 'warning' },
    { id: 2, mensaje: 'Se ha aprobado tu reserva', tipo: 'success' },
  ]);
};
