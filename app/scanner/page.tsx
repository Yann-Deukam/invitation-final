// @ts-ignore
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import QrScanner from "qr-scanner"; // Import qr-scanner
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Scanner() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [password, setPassword] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [scanner, setScanner] = useState<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false); // State to manage scan delay

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password === "your_password") {
      setShowScanner(true);
    } else {
      alert("Invalid password!");
    }
  };

  useEffect(() => {
    if (showScanner && videoRef.current) {
      const qrScanner = new QrScanner(videoRef.current, async (result) => {
        if (!isScanning) {
          setIsScanning(true);
          await handleScan(result);
          setTimeout(() => setIsScanning(false), 3000); // Delay for 3 seconds after each scan
        }
      });

      qrScanner.start();
      setScanner(qrScanner);

      return () => qrScanner.stop();
    }
  }, [showScanner, isScanning]);

  const handleScan = async (data: string) => {
    if (!data) return;

    console.log("Scanned Data:", data);

    try {
      const { data: invitee, error } = await supabase
        .from("invitees")
        .select("*")
        .eq("qr_code", data)
        .single();

      if (error || !invitee) {
        setMessage("❌ Invalid QR Code!");
        return;
      }

      if (invitee.scanned) {
        setMessage("❌ QR Code already used!");
        return;
      }

      const { error: updateError } = await supabase
        .from("invitees")
        .update({ scanned: true })
        .eq("id", invitee.id);

      if (updateError) {
        setMessage("❌ Error updating the database.");
      } else {
        setMessage("✅ QR Code Valid! Access Granted.");
      }
    } catch (err) {
      console.error("Scan Error:", err);
      setMessage("❌ An error occurred.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>QR Code Scanner</CardTitle>
          <CardDescription>
            Scan QR codes to validate invitations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showScanner ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
              <Button type="submit" className="w-full">
                Submit
              </Button>
            </form>
          ) : (
            <>
              <div>
                <video ref={videoRef} style={{ width: "100%" }} />
                {message && <p className="mt-4 text-lg">{message}</p>}
              </div>

              {message && !isScanning && (
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setIsScanning(false)} // Reset scanning state
                >
                  Scan Again
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => router.push("/")}
              >
                Return to Home
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
