"use client";
import { Button } from "@heroui/react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

export default function HomePageWrapper({ user }: { user: User | null }) {

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
