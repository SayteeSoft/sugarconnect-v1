
"use client";

import { useState, useEffect } from "react";
import { UserProfile } from "@/lib/users";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
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
import { Eye, Pencil, Trash2, Loader2 } from "lucide-react";
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
import { mockUsers } from "@/lib/mock-data";


export function AdminClient() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.URL;
        let fetchedUsers: UserProfile[];

        if (!baseUrl) {
          console.warn("URL env var not set, falling back to mock users.");
          fetchedUsers = [...mockUsers];
        } else {
            const res = await fetch(`${baseUrl}/api/users`, { cache: 'no-store' });
            if (!res.ok) {
                console.warn(`API call failed with status ${res.status}, falling back to mock users.`);
                fetchedUsers = [...mockUsers];
            } else {
                const apiUsers = await res.json();
                const allUsers = [...mockUsers];
                const mockUserIds = new Set(mockUsers.map(u => u.id));
                for (const apiUser of apiUsers) {
                    if (!mockUserIds.has(apiUser.id)) {
                        allUsers.push(apiUser);
                    }
                }
                fetchedUsers = allUsers;
            }
        }
        
        const sortedUsers = [...fetchedUsers].sort((a, b) => {
            if (a.role === 'Admin' && b.role !== 'Admin') return -1;
            if (a.role !== 'Admin' && b.role === 'Admin') return 1;
            return 0;
        });

        setUsers(sortedUsers);
      } catch (e) {
        console.error("Error fetching users, falling back to mock users:", e);
        const sortedMockUsers = [...mockUsers].sort((a, b) => {
            if (a.role === 'Admin' && b.role !== 'Admin') return -1;
            if (a.role !== 'Admin' && b.role === 'Admin') return 1;
            return 0;
        });
        setUsers(sortedMockUsers);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        //
      }
    }
  }, []);

  const handleDelete = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/delete`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete user");
      }

      setUsers(users.filter((user) => user.id !== userId));
      toast({
        title: "User Deleted",
        description: "The user has been successfully removed.",
      });
    } catch (error: any) {
      console.error("Deletion failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not delete the user.",
      });
    }
  };

  const getRoleVariant = (role: UserProfile['role']): "default" | "destructive" | "secondary" | "outline" => {
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

  const canShowAdminBadge = (user: UserProfile) => {
    if (user.role !== 'Admin') return true;
    return currentUser?.role === 'Admin';
  };

  return (
    <div className="container mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">Admin Dashboard</h1>
        <p className="text-lg text-muted-foreground">Manage user profiles and site settings.</p>
      </div>

      <Card className="shadow-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
             {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
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
                      <Link href={`/dashboard/profile/${user.id}`}>
                        <Avatar>
                          <AvatarImage src={user.image || ''} alt={user.name} data-ai-hint="avatar person" />
                          <AvatarFallback>{user.name ? user.name.charAt(0) : 'U'}</AvatarFallback>
                        </Avatar>
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{user.name}</span>
                        {canShowAdminBadge(user) && <Badge variant={getRoleVariant(user.role)}>{getRoleDisplayName(user.role)}</Badge>}
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
                        <Button asChild variant="ghost" size="icon">
                          <Link href={`/dashboard/profile/${user.id}?edit=true`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={user.role === 'Admin'}>
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
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
