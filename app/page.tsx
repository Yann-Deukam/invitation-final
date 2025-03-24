// "use client";
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid"; // For unique QR codes

export default function Home() {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const surname = formData.get("surname") as string;
    const phone = formData.get("phone") as string;

    // ✅ Step 1: Generate QR Code
    const uniqueQrCode = `${nanoid(10)}-${phone}`;
    console.log("Generated QR Code:", uniqueQrCode); // Debugging Log

    // ✅ Step 2: Insert into Supabase
    const { data, error } = await supabase
      .from("invitees")
      .insert([
        {
          name,
          surname,
          phone_number: phone,
          qr_code: uniqueQrCode,
          scanned: false, // Ensuring initial status is false
        },
      ])
      .select(); // Retrieve inserted row for debugging

    if (error) {
      console.error("Supabase Insert Error:", error); // Debugging Log
      alert("Error submitting form! Check console.");
    } else {
      console.log("Inserted Data:", data); // Debugging Log
      router.push("/success"); // Redirect if successful
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Invitation App</CardTitle>
          <CardDescription>
            Enter your details to receive an invitation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" placeholder="Name" required />
            <Input name="surname" placeholder="Surname" required />
            <Input name="phone" placeholder="Phone Number" required />
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
      <nav className="mt-4">
        <Link href="/scanner">
          <Button variant="outline" className="mr-2">
            Scanner
          </Button>
        </Link>
        <Link href="/invitees">
          <Button variant="outline">Invitees</Button>
        </Link>
      </nav>
    </div>
  );
}
