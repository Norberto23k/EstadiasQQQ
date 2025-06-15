const QRCode = require('qrcode');

const generateQRCode = async () => {
  const randomCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return randomCode;
};

module.exports = { generateQRCode };