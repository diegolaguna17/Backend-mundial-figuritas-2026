const mongoose = require('mongoose');

const stickerSchema = new mongoose.Schema({
  figura: { type: String, required: true },
  obtenida: { type: Boolean, default: false },
  repetidas: { type: Number, default: 0 }
}, { _id: false });

const countrySchema = new mongoose.Schema({
  pais: { type: String, required: true },
  codigo: { type: String, required: true },
  figuritas: [stickerSchema]
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fecha_creacion: { type: Date, default: Date.now },
  ultima_actualizacion: { type: Date, default: Date.now },
  progreso_total: { type: Number, default: 0 },
  coleccion: [countrySchema]
});

module.exports = mongoose.model('User', userSchema);
