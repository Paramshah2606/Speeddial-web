import { SocketProvider } from "@/context/socketContext";
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
        <SocketProvider>
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}
