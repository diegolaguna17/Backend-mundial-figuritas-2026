const router = require('express').Router();
const User = require('../models/User');
const verifyToken = require('../middleware/auth');

// Get user collection
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    const coleccionTransformada = user.coleccion.map(c => ({
      pais: c.pais,
      codigo: c.codigo,
      figuritas: c.figuritas.map(f => ({
        figura: f.figura,
        tiene: f.obtenida,
        repetidas: f.repetidas || 0
      }))
    }));

    res.json({ error: null, data: { coleccion: coleccionTransformada, progreso_total: user.progreso_total, id_usuario: user._id } });
  } catch (error) {
    res.status(400).json({ error });
  }
});

// Update sticker status
router.put('/figurita', verifyToken, async (req, res) => {
  try {
    const { codigo_pais, figura, tiene, repetidas } = req.body;
    
    // Find the user
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Find the country
    const country = user.coleccion.find(c => c.codigo === codigo_pais);
    if (!country) return res.status(404).json({ error: 'País no encontrado' });

    // Find the sticker
    const sticker = country.figuritas.find(f => f.figura === figura);
    if (!sticker) return res.status(404).json({ error: 'Figurita no encontrada' });

    // Update status
    if (tiene !== undefined) sticker.obtenida = tiene;
    if (repetidas !== undefined) sticker.repetidas = repetidas;
    user.ultima_actualizacion = Date.now();

    // Recalculate total progress (optional but good)
    let totalObtained = 0;
    user.coleccion.forEach(c => {
      c.figuritas.forEach(f => {
        if (f.obtenida) totalObtained++;
      });
    });
    user.progreso_total = totalObtained;

    await user.save();
    
    res.json({ error: null, message: 'Figurita actualizada exitosamente' });
  } catch (error) {
    res.status(400).json({ error });
  }
});

// Share endpoint
router.get('/share/:id_usuario', async (req, res) => {
  try {
    const user = await User.findById(req.params.id_usuario);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    const coleccionTransformada = user.coleccion.map(c => ({
      pais: c.pais,
      codigo: c.codigo,
      figuritas: c.figuritas.map(f => ({
        figura: f.figura,
        tiene: f.obtenida,
        repetidas: f.repetidas || 0
      }))
    }));

    res.json({ error: null, data: { coleccion: coleccionTransformada, progreso_total: user.progreso_total } });
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = router;
