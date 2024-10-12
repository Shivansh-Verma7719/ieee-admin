"use client";
import { Button } from "@nextui-org/button";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

export default function Home() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">IEEE Admin</h1>
      {!user && (
        <Button as={Link} href="/login" color="primary" variant="flat">
          Login
        </Button>
      )}
      {user && (
        <>
          <p className="text-lg font-bold">Welcome, {user.email}</p>
          <Button
            as={Link}
            href="/events/create"
            color="secondary"
            variant="flat"
            className="m-4"
          >
            Create a new event
          </Button>
          <Button
            as={Link}
            href="/events"
            color="secondary"
            variant="flat"
          >
            Edit an event
          </Button>
        </>
      )}
    </div>
  );
}
