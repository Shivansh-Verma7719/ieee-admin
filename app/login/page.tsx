"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@heroui/react";
import Image from "next/image";
import Google from "@/public/images/google.png";

export default function Login() {
  const router = useRouter();
  const supabase = createClient();
  const nextUrl = "/";

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.push("/");
      }
    };

    checkUser();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${nextUrl}`,
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-10 md:p-0 md:w-1/2 mx-auto">
      <h1 className="text-3xl font-bold mb-6">Login</h1>
      <Button
        onClick={handleLogin}
        startContent={
          <Image src={Google} alt="Google" width={20} height={20} />
        }
        className="m-4"
      >
        Login
      </Button>
    </div>
  );
}
