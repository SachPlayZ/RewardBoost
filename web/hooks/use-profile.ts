import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

export interface UserProfile {
  id?: string;
  walletAddress: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  totalXP?: number;
  twitterLinked: boolean;
  twitterUsername?: string;
  twitterName?: string;
  twitterProfileImage?: string;
  linkedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useProfile() {
  const { address, isConnected } = useAccount();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      fetchProfile();
    } else {
      setLoading(false);
      setProfile(null);
    }
  }, [isConnected, address]);

  const fetchProfile = async () => {
    if (!address) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/user/profile?userWallet=${address}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      } else {
        setError("Failed to fetch profile");
      }
    } catch (err) {
      setError("Failed to fetch profile");
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const delinkTwitter = async (): Promise<boolean> => {
    if (!address || !profile?.twitterLinked) return false;

    try {
      setError(null);
      
      const response = await fetch(`/api/user/profile?userWallet=${address}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to delink Twitter account");
        return false;
      }
    } catch (err) {
      setError("Failed to delink Twitter account");
      console.error("Delink error:", err);
      return false;
    }
  };

  const refreshProfile = () => {
    if (isConnected && address) {
      fetchProfile();
    }
  };

  return {
    profile,
    loading,
    error,
    delinkTwitter,
    refreshProfile,
    isConnected,
    address,
  };
}
