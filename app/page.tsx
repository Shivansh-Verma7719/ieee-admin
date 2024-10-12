import Image from "next/image";
import { Button } from "@nextui-org/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Welcome to IEEE Admin</h1>
      <Button as={Link} href="/login" color="primary" variant="flat">Login</Button>
    </div>
  );
}
