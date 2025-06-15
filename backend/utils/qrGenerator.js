import QRCode from 'qrcode';

export const generateQRCode = async () => {
  const randomCode = Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15);
  return randomCode;
};

// Alternative if you want to keep the same export structure:
// export default { generateQRCode };