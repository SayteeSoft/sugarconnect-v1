import { users, getCurrentUser, UserProfile } from "@/lib/mock-data";
import { ProfileClient } from "@/components/profile-client";
import { notFound } from "next/navigation";

type ProfilePageProps = {
  params: {
    id: string;
  };
};

// In a real app, this would be an API call
const getProfileById = async (id: string): Promise<UserProfile | undefined> => {
  return users.find((user) => user.id === id);
};

const getAllProfiles = async (): Promise<UserProfile[]> => {
  return users;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const profile = await getProfileById(params.id);
  const allProfiles = await getAllProfiles();
  const currentUser = getCurrentUser();

  if (!profile) {
    notFound();
  }

  return <ProfileClient profile={profile} allProfiles={allProfiles} currentUser={currentUser} />;
}
