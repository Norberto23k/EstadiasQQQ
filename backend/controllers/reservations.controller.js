const Reservation = require('../models/reservation');

exports.getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().populate('user material');
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener reservas', err });
  }
};

exports.createReservation = async (req, res) => {
  try {
    const { user, material, fechaReserva } = req.body;
    const reservation = new Reservation({ user, material, fechaReserva });
    await reservation.save();
    res.status(201).json({ message: 'Reserva creada', reservation });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear reserva', err });
  }
};

exports.deleteReservation = async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reserva eliminada' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar reserva', err });
  }
};
