// @ts-ignore

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Invitees() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [invitees, setInvitees] = useState<any[]>([]);

  const fetchInvitees = async () => {
    const { data, error } = await supabase.from("invitees").select("*");
    if (data) setInvitees(data);
  };

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password === "your_password") {
      setShowTable(true);
      fetchInvitees();
    } else {
      alert("Invalid password!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Invitees List</CardTitle>
          <CardDescription>View and manage invitees.</CardDescription>
        </CardHeader>
        <CardContent>
          {!showTable ? (
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Surname</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Scanned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitees.map((invitee) => (
                    <TableRow key={invitee.id}>
                      <TableCell>{invitee.name}</TableCell>
                      <TableCell>{invitee.surname}</TableCell>
                      <TableCell>{invitee.phone_number}</TableCell>
                      <TableCell>{invitee.scanned ? "Yes" : "No"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
