const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { sendPaymentReceipt } = require('../utils/email');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Turf = require('../models/Turf');

// Process payment (simulated)
exports.processPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod, cardDetails } = req.body;
    const userId = req.userId;

    // Find the booking
    const booking = await Booking.findById(bookingId).populate('turfId');
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if booking belongs to user
    if (booking.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if payment already processed
    if (booking.paymentStatus === 'completed') {
      return res.status(400).json({ error: 'Payment already processed' });
    }

    // Simulate payment processing
    // In real implementation, this would integrate with payment gateway
    const paymentSuccess = simulatePayment(paymentMethod, cardDetails, booking.totalAmount);

    if (!paymentSuccess) {
      return res.status(400).json({ error: 'Payment failed. Please try again.' });
    }

    // Update booking with payment details
    booking.paymentStatus = 'completed';
    booking.paymentMethod = paymentMethod;
    booking.paymentDate = new Date();
    booking.status = 'paid'; // Set to paid, waiting for admin approval
    await booking.save();

    // Generate and send receipt
    const user = await User.findById(userId);
    const receiptPath = await generatePaymentReceipt(booking, user);
    await sendPaymentReceipt(user.email, user.fullName, receiptPath, booking);

    // Clean up temp file after sending
    setTimeout(() => {
      if (fs.existsSync(receiptPath)) {
        fs.unlinkSync(receiptPath);
      }
    }, 30000); // Delete after 30 seconds

    res.json({
      message: 'Payment processed successfully! Receipt sent to your email.',
      booking: {
        id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        totalAmount: booking.totalAmount
      }
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
};

// Simulate payment processing
function simulatePayment(paymentMethod, cardDetails, amount) {
  // Simulate payment success/failure randomly (90% success rate)
  const success = Math.random() > 0.1;

  if (!success) {
    return false;
  }

  // Basic validation based on payment method
  switch (paymentMethod) {
    case 'credit_card':
    case 'debit_card':
      if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv) {
        return false;
      }
      // Simulate card validation
      return cardDetails.cardNumber.length >= 13 && cardDetails.cvv.length >= 3;

    case 'upi':
      if (!cardDetails.upiId) {
        return false;
      }
      // Simulate UPI validation
      return cardDetails.upiId.includes('@');

    default:
      return false;
  }
}

// Generate PDF receipt
async function generatePaymentReceipt(booking, user) {
  return new Promise((resolve, reject) => {
    try {
      // Create receipts directory if it Choksisn't exist
      const receiptsDir = path.join(__dirname, '../receipts');
      if (!fs.existsSync(receiptsDir)) {
        fs.mkdirSync(receiptsDir, { recursive: true });
      }

      // Generate filename: username_date.pdf
      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const filename = `${user.username}_${dateStr}.pdf`;
      const filePath = path.join(receiptsDir, filename);

      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('TURF MANAGER', { align: 'center' });
      doc.moveDown();
      doc.fontSize(18).text('PAYMENT RECEIPT', { align: 'center' });
      doc.moveDown(2);

      // Receipt details
      doc.fontSize(12).font('Helvetica');
      doc.text(`Receipt Number: ${booking._id.toString().slice(-8).toUpperCase()}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.text(`Time: ${new Date().toLocaleTimeString()}`);
      doc.moveDown();

      // Customer details
      doc.fontSize(14).font('Helvetica-Bold').text('CUSTOMER DETAILS');
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica');
      doc.text(`Name: ${user.fullName}`);
      doc.text(`Email: ${user.email}`);
      doc.text(`Phone: ${user.phone || 'N/A'}`);
      doc.moveDown();

      // Booking details
      doc.fontSize(14).font('Helvetica-Bold').text('BOOKING DETAILS');
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica');
      doc.text(`Turf: ${booking.turfName}`);
      doc.text(`Sport: ${booking.sportType || 'Cricket'}`);
      doc.text(`Location: ${booking.location || 'N/A'}`);
      doc.text(`Date: ${booking.date}`);
      doc.text(`Time: ${booking.bookingType === 'slot' ? booking.timeSlot : `${booking.startTime} - ${booking.endTime}`}`);
      doc.text(`Duration: ${booking.duration || 'N/A'} hours`);
      doc.moveDown();

      // Payment details
      doc.fontSize(14).font('Helvetica-Bold').text('PAYMENT DETAILS');
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica');
      doc.text(`Payment Method: ${booking.paymentMethod.replace('_', ' ').toUpperCase()}`);
      doc.text(`Amount: ₹${booking.totalAmount}`);
      doc.text(`Status: PAID`);
      doc.text(`Transaction ID: TXN${Date.now()}`);
      doc.moveDown(2);

      // Terms and conditions
      doc.fontSize(10).font('Helvetica');
      doc.text('Terms & Conditions:', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(9);
      doc.text('• This receipt is computer generated and Choksis not require signature.');
      doc.text('• Booking is confirmed upon successful payment.');
      doc.text('• Cancellation policy: 24 hours notice required for refund.');
      doc.text('• For any queries, contact support@turfmanager.com');
      doc.moveDown();

      // Footer
      doc.fontSize(10).text('Thank you for choosing Turf Manager!', { align: 'center' });
      doc.text('Visit us again!', { align: 'center' });

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
}

// Get payment status
exports.getPaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.userId;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      bookingId: booking._id,
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod,
      paymentDate: booking.paymentDate,
      totalAmount: booking.totalAmount
    });

  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
};