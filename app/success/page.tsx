// @ts-ignore

"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";
import QRCode from "qrcode"; // Import QRCode generator

export default function Success() {
  const router = useRouter();
  const [invitee, setInvitee] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  // Fetch the latest invitee data
  useEffect(() => {
    const fetchLatestInvitee = async () => {
      const { data, error } = await supabase
        .from("invitees")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setInvitee(data);
        generateQRCode(data.qr_code); // Generate QR code when data is received
      } else {
        console.error("Error fetching invitee:", error);
      }
    };

    fetchLatestInvitee();
  }, []);

  // Generate and cache the QR code
  const generateQRCode = async (qrData: string) => {
    try {
      const qrUrl = await QRCode.toDataURL(qrData);
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error("QR Code Generation Error:", error);
    }
  };

  // Generate and download the PDF
  const handleDownloadPDF = () => {
    if (invitee && invitee.qr_code) {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;

      // QR Code settings
      const qrSize = 50; // Size of the QR Code
      const qrX = (pageWidth - qrSize) / 2; // Center horizontally
      const qrY = (pageHeight - qrSize) / 2 - 40; // Position QR code above the message

      // Draw the QR code
      const qrImage = new Image();
      qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?data=${invitee.qr_code}&size=${qrSize}x${qrSize}`;
      qrImage.onload = () => {
        pdf.addImage(qrImage, "PNG", qrX, qrY, qrSize, qrSize);

        // Message settings
        const text = `Mr/Mrs. ${invitee.name} ${invitee.surname},\nYou are henceforth invited to our wedding. Endeavour to bring this PDF along with you. DO NOT SHARE.`;
        const textX = 20; // Left margin for justified text
        const textY = qrY + qrSize + 10; // Position text below QR code

        // Draw the message (justified)
        pdf.setFont("Helvetica", "normal");
        pdf.setFontSize(12);
        pdf.text(text, textX, textY, {
          maxWidth: pageWidth - 40,
          align: "justify",
        });

        // Save the PDF
        pdf.save(`${invitee.name}-${invitee.surname}-mariage.pdf`);
      };
    } else {
      alert("No QR code found!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Success!</CardTitle>
          <CardDescription>
            Your invitation has been successfully submitted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Thank you for registering. Your invitation PDF is ready for
            download.
          </p>

          {qrCodeUrl && (
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="w-32 h-32 mx-auto mb-4"
            />
          )}

          <Button onClick={handleDownloadPDF} className="w-full">
            Download PDF
          </Button>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => router.push("/")}
          >
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
