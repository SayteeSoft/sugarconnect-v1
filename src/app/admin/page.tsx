
import { AdminClient } from "@/components/admin-client";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin Dashboard - Sugar Connect",
    description: "Manage users and view site statistics.",
};

export default function AdminPage() {
  return (
    <AdminClient />
  );
}
