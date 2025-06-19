const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * E-posta gönderme fonksiyonu
 * @param {Object} options - E-posta seçenekleri
 * @param {string} options.email - Alıcı e-posta adresi
 * @param {string} options.subject - E-posta konusu
 * @param {string} options.message - E-posta içeriği
 * @returns {Promise<boolean>} - Başarı durumu
 */
exports.sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    await transporter.sendMail(mailOptions);
    console.log("E-posta gönderildi:", options.email);
    return true;
  } catch (error) {
    console.error("Error sending email:", error.message);
    return false;
  }
};