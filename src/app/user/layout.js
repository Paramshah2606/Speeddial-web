"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserLayout({ children }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/auth");
    } else {
      setIsChecking(false); // user exists, stop loading
    }
  }, [router]);

  if (isChecking) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}
