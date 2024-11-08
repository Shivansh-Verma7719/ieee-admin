"use client";

import { useEffect, useState } from 'react';
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function Logout() {
  const [isLoggingOut, setIsLoggingOut] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
        setIsLoggingOut(false);
      } catch (err) {
        setError(`An error occurred while logging out: ${err}`);
        console.error("Error logging out:", err);
        setIsLoggingOut(false);
      }
    };

    handleLogout();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {isLoggingOut ? (
        <p className="text-xl">Logging out...</p>
      ) : (
        <p className="text-xl text-red-500">{error}</p>
      )}
    </div>
  );
}
