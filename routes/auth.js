const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Register
router.post('/register', async (req, res) => {
  try {
    // Verificar si el usuario ya existe
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) return res.status(400).json({ error: 'El email ya está registrado' });

    // Hash contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Cargar colección inicial
    const templatePath = path.join(__dirname, '../coleccion_mundial.json');
    const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    
    // Crear nuevo usuario
    const user = new User({
      email: req.body.email,
      password: hashedPassword,
      coleccion: templateData.coleccion
    });

    const savedUser = await user.save();
    res.json({ error: null, data: { userId: savedUser._id } });
  } catch (error) {
    res.status(400).json({ error });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    // Validar email
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    // Validar contraseña
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Contraseña no válida' });

    // Crear token
    const token = jwt.sign({
      id: user._id,
      email: user.email
    }, process.env.JWT_SECRET);

    res.header('auth-token', token).json({
      error: null,
      data: { token }
    });
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = router;
