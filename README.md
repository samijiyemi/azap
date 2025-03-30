Below is a comprehensive `README.md` file for your Azap payment app. It includes instructions for setup, usage, features, and additional notes to help users or developers understand and run the application.

---

# Azap Payment App

Azap is a full-featured payment application built with Node.js, Express, EJS, and Bootstrap. It integrates the Paystack payment gateway for sending and receiving money, offers a USD exchangers marketplace with Mapbox integration, provides loan request functionality, and includes user authentication with email verification. The app also generates QR codes for receiving payments, sends transaction receipts as PDFs, and has a placeholder for future NFC functionality.

---

## Features

- **Authentication**: User registration with email verification, login, and logout.
- **Payments**: Fund wallet and send money using the Paystack payment gateway.
- **Wallet Management**: Track and manage wallet balance.
- **USD Exchangers Marketplace**: List exchangers with rates, contacts, and locations displayed on a Mapbox map.
- **Loan Requests**: Request and view loan status.
- **Email Notifications**: Sends verification pins and transaction receipts via email.
- **PDF Receipts**: Generates and emails PDF receipts for transactions.
- **QR Codes**: Each user has a unique QR code for receiving payments.
- **NFC Placeholder**: Marked as "Coming Soon" in the dashboard.
- **Frontend**: Responsive UI with Bootstrap 5.

---

## Prerequisites

- **Node.js**: v16.x or higher
- **MongoDB**: Local instance or cloud service (e.g., MongoDB Atlas)
- **Paystack Account**: For payment gateway integration ([Paystack](https://paystack.com/))
- **Mapbox Account**: For map integration ([Mapbox](https://www.mapbox.com/))
- **Gmail Account**: For email notifications (with App Password if 2FA is enabled)

---

## Project Structure

```
Azap/
├── config/
│   └── db.js           # MongoDB connection config
├── controllers/
│   ├── auth.js        # Authentication logic
│   ├── payment.js     # Payment and exchanger logic
│   └── loan.js        # Loan request logic
├── models/
│   ├── user.js        # User schema
│   ├── transaction.js # Transaction schema
│   └── loan.js        # Loan schema
├── public/
│   ├── css/           # Custom CSS (if any)
│   ├── js/            # Custom JS (if any)
│   └── images/        # Static images
├── routes/
│   ├── auth.js        # Auth routes
│   ├── payment.js     # Payment routes
│   └── loan.js        # Loan routes
├── utils/
│   ├── email.js       # Email sending utility
│   ├── pdf.js         # PDF generation utility
│   └── qr.js          # QR code generation utility
├── views/
│   ├── partials/      # EJS partials (header, footer)
│   ├── auth/          # Login, register, verify pages
│   ├── dashboard.ejs  # Main dashboard
│   ├── payment.ejs    # Payment page
│   ├── exchangers.ejs # Exchangers marketplace with Mapbox
│   └── loan.ejs       # Loan request and status page
├── .env               # Environment variables
├── package.json       # Dependencies and scripts
├── README.md          # This file
└── server.js          # Main server file
```

---

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/Azap.git
   cd Azap
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   Create a `.env` file in the root directory and add the following:

   ```
   MONGO_URI=mongodb://localhost/Azap
   PAYSTACK_SECRET=sk_test_your_paystack_secret_key
   SESSION_SECRET=your_session_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   PORT=3000
   MAPBOX_TOKEN=pk.your_mapbox_access_token_here
   ```

   - `MONGO_URI`: Your MongoDB connection string.
   - `PAYSTACK_SECRET`: Your Paystack secret key (from [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer)).
   - `SESSION_SECRET`: A random string for session encryption.
   - `EMAIL_USER`: Your Gmail address.
   - `EMAIL_PASS`: An App Password (generate from [Google Account](https://myaccount.google.com/security) if 2FA is enabled).
   - `MAPBOX_TOKEN`: Your Mapbox access token (from [Mapbox Dashboard](https://account.mapbox.com/)).

4. **Start MongoDB**
   Ensure MongoDB is running locally or use a cloud service like MongoDB Atlas.

5. **Run the Application**
   ```bash
   npm start
   ```
   The app will start on `http://localhost:3000`.

---

## Usage

1. **Register**: Go to `http://localhost:3000/auth/register`, enter your email and password, and verify your account with the pin sent to your email.
2. **Login**: Visit `http://localhost:3000/auth/login` to log in.
3. **Dashboard**: View your wallet balance and QR code at `http://localhost:3000/dashboard`.
4. **Payments**: Fund your wallet or send money at `http://localhost:3000/payment`.
5. **Exchangers**: Browse the USD exchangers marketplace with a Mapbox map at `http://localhost:3000/payment/exchangers`.
6. **Loans**: Request a loan or view loan status at `http://localhost:3000/loan`.
7. **Logout**: End your session at `http://localhost:3000/auth/logout`.

---

## API Integrations

- **Paystack**: Handles wallet funding and payment verification. The callback URL is set to `http://localhost:3000/payment/verify` for local development.
- **Mapbox**: Displays exchanger locations on a map in the exchangers marketplace.
- **Nodemailer**: Sends verification emails and transaction receipts via Gmail SMTP.

---

## Development Notes

- **Database**: Uses MongoDB with Mongoose for data persistence.
- **Session Management**: Uses `express-session` with memory storage (consider `connect-mongo` for production).
- **Frontend**: Built with EJS and Bootstrap 5, with Mapbox GL JS for maps.
- **Security**: Add HTTPS, CSRF protection, and input validation for production use.
- **NFC**: Currently a placeholder ("Coming Soon") as it requires hardware integration.

---

## Troubleshooting

- **"Missing credentials for 'PLAIN'"**: Ensure `EMAIL_USER` and `EMAIL_PASS` are set correctly in `.env`. Use an App Password if Gmail 2FA is enabled.
- **"req.session.user is undefined"**: Verify `SESSION_SECRET` is set and the user is logged in before accessing protected routes.
- **Mapbox Not Loading**: Check that `MAPBOX_TOKEN` is valid and correctly included in `.env`.
- **Paystack Errors**: Ensure `PAYSTACK_SECRET` is correct and test payments work in Paystack’s test mode.

---

## Future Enhancements

- **Production Session Store**: Use `connect-mongo` for persistent sessions.
- **Exchanger Database**: Replace mock exchanger data with a real MongoDB model.
- **NFC Integration**: Implement NFC payment functionality with hardware support.
- **Webhooks**: Add Paystack webhook support for robust payment verification.
- **User Profiles**: Expand user features (e.g., profile editing, transaction history).

---

## Contributing

Feel free to fork this repository, submit issues, or create pull requests. Contributions are welcome!

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact

For questions or support, reach out to [your-email@example.com](mailto:your-email@example.com).

---
