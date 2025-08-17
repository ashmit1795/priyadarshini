
# 🎬 Priyadarshini – Movie Ticket Booking Platform Project

A full-fledged MERN stack movie ticket booking application where users can explore movies, book tickets, and verify bookings through QR codes. Admins can manage shows, movies, and verify users with ease.


## 🚀 About the Project

**Priyadarshini** is my **first full-stack MERN project**, through which I learned how to build a scalable frontend, design a robust backend, and most importantly, how to **connect frontend and backend** seamlessly. The project integrates real-time seat booking, QR verification, admin dashboards, payment gateway, and automated emails.
## ✨ Features

#### ✅ User Side:

🔐 Signup/Login with Clerk (Email & Phone OTP verification)

🎥 Browse Now Playing & Upcoming Movies

📽️ View movie details, trailers & synopsis

🎟️ Book movie tickets (select date, time, seat)

🕰️ Real-time seat availability map

📬 Booking confirmation, failure, & reminder emails

💖 Like & save favorite movies

🧾 Access full booking history

📱 Mobile-friendly & responsive UI

📸 QR code generated for every booking (used at entry)

⏳ Failed payments temporarily hold seats for 10 mins, automatically released if not paid (powered by Inngest)

✉️ Users are notified via email when new shows are added

#### 🛠️ Admin Side:
🔒 Secure admin login

🎞️ Add, update, delete movies & showtimes

📊 Dashboard with real-time stats and booking details

📤 QR code input field for ticket verification

⏰ Admin can verify QR codes valid from 1 hour before show till end
## ⚙️ Tech Stack

#### 🧑‍💻 Frontend:
- React 19
- Tailwind CSS
- Axios
- Clerk Auth
- Inngest

#### 🧑‍🔧 Backend:
- Node.js + Express.js
- MongoDB with Mongoose
- Nodemailer (with verified business email)
- QR Code generation & scanning
- Cashfree Payment Gateway
- Inngest for cron jobs & automated workflows


## 🎫 QR Code Flow

- QR code is generated at booking time
- Valid from 1 hour before the show to the end of the show
- Admin scans or inputs the QR to verify tickets in real-time
## 💰 Payments
- Integrated with Cashfree
- Supports UPI, Credit/Debit Card, and Net Banking
- Secure and fast checkout
## Deployment

- Frontend: [Vercel](https://priyadarshini-client.vercel.app/)

- Backend: [Vercel Serverless Functions](https://priyadarshini-nine.vercel.app/)




## 🔮 Future Improvements

❌ Booking cancellation with automated refunds

👥 Multi-admin/manager access

✅ Manager approval system (only owners can approve new managers)

🏢 Multi-cinema theatre support

🌍 Multi-theatre system for different regions
## Screenshots

![App Screenshot](https://via.placeholder.com/468x300?text=App+Screenshot+Here)


## 🧑‍💻 Author

Made with ❤️ by [Ashmit Patra](https://github.com/ashmit1795)
