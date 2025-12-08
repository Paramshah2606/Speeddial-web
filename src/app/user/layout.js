"use client";
import { SocketProvider } from "@/context/socketContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserLayout({ children }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) router.push("/auth");
    else setIsChecking(false);
  }, []);

  if (isChecking) return null;

  return (
    <SocketProvider>
      {children}
    </SocketProvider>
  );
}
