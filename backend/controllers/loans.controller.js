const Loan = require('../models/Loan');

exports.getLoans = async (req, res) => {
  try {
    const loans = await Loan.find().populate('material user');
    res.json(loans);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener préstamos', err });
  }
};

exports.createLoan = async (req, res) => {
  try {
    const { user, material, fechaInicio, fechaFin } = req.body;
    const loan = new Loan({ user, material, fechaInicio, fechaFin });
    await loan.save();
    res.status(201).json({ message: 'Préstamo registrado', loan });
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar préstamo', err });
  }
};

exports.updateLoan = async (req, res) => {
  try {
    const updated = await Loan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar préstamo', err });
  }
};

exports.deleteLoan = async (req, res) => {
  try {
    await Loan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Préstamo eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar préstamo', err });
  }
};
