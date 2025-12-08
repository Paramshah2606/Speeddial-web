import "./globals.css";
import { ToastContainer } from "react-toastify";

export const metadata = {
  title: "SpeedDial",
  description: "Agora-based calling system",
};
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ToastContainer position="top-right" autoClose={3000} />
          {children}
      </body>
    </html>
  );
}
