import Loan from '../models/Loan.js';

export const getLoans = async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate('material user')
      .select('-__v') // Exclude version key
      .lean(); // Convert to plain JS object

    res.status(200).json({
      success: true,
      count: loans.length,
      data: loans
    });

  } catch (err) {
    console.error('Error fetching loans:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener préstamos',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const createLoan = async (req, res) => {
  try {
    const { user, material, fechaInicio, fechaFin } = req.body;

    // Validate dates
    if (new Date(fechaFin) < new Date(fechaInicio)) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de fin debe ser posterior a la fecha de inicio'
      });
    }

    const loan = new Loan({
      user,
      material,
      fechaInicio,
      fechaFin,
      status: 'active' // Default status
    });

    await loan.save();

    res.status(201).json({
      success: true,
      message: 'Préstamo registrado exitosamente',
      data: loan.toObject({ versionKey: false })
    });

  } catch (err) {
    console.error('Loan creation error:', err);
    res.status(500).json({
      success: false,
      message: 'Error al registrar préstamo',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const updateLoan = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent certain fields from being updated
    const { status, createdAt, ...updateData } = req.body;

    const updated = await Loan.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,
        runValidators: true // Ensure updates pass model validation
      }
    ).select('-__v');

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Préstamo no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Préstamo actualizado',
      data: updated
    });

  } catch (err) {
    console.error('Loan update error:', err);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar préstamo',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const deleteLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Loan.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Préstamo no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Préstamo eliminado correctamente'
    });

  } catch (err) {
    console.error('Loan deletion error:', err);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar préstamo',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};