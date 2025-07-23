"use client";

import { useState, useEffect } from "react";
import { UserProfile } from "@/lib/users";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Pencil, Trash2, Users, Briefcase, Heart, Wifi } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type AdminClientProps = {
  initialUsers: UserProfile[];
};

export function AdminClient({ initialUsers }: AdminClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const handleDelete = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/delete`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      setUsers(users.filter((user) => user.id !== userId));
      toast({
        title: "User Deleted",
        description: "The user has been successfully removed.",
      });
      router.refresh();
    } catch (error) {
      console.error("Deletion failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete the user.",
      });
    }
  };

  const getRoleVariant = (role: UserProfile['role']): "default" | "destructive" | "secondary" => {
    switch (role) {
      case 'Admin': return 'destructive';
      case 'Sugar Daddy': return 'default';
      case 'Sugar Baby': return 'secondary';
      default: return 'outline';
    }
  }

  const getRoleDisplayName = (role: UserProfile['role']): string => {
    if (role === 'Sugar Daddy') return 'Daddy';
    if (role === 'Sugar Baby') return 'Baby';
    return role;
  }

  return (
    <div className="container mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">User Management</h1>
        <p className="text-lg text-muted-foreground">A list of all users in the system.</p>
      </div>

      <Card className="shadow-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={user.image} alt={user.name} data-ai-hint="avatar person" />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{user.name}</span>
                        <Badge variant={getRoleVariant(user.role)}>{getRoleDisplayName(user.role)}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.age}</TableCell>
                    <TableCell>{user.location}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button asChild variant="ghost" size="icon">
                          <Link href={`/dashboard/profile/${user.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the user
                                and remove their data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(user.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
