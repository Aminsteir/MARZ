"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import Link from "next/link";

// Field map by role
const FIELD_MAP: Record<
  string,
  { label: string; name: string; type?: string }[]
> = {
  Helpdesk: [{ label: "Position", name: "position" }],
  Buyer: [
    { label: "Business Name", name: "business_name" },
    { label: "Street Number", name: "street_num" },
    { label: "Street Name", name: "street_name" },
    { label: "City", name: "city" },
    { label: "State", name: "state" },
    { label: "Zipcode", name: "zipcode" },
  ],
  Seller: [
    { label: "Business Name", name: "business_name" },
    { label: "Street Number", name: "street_num" },
    { label: "Street Name", name: "street_name" },
    { label: "City", name: "city" },
    { label: "State", name: "state" },
    { label: "Zipcode", name: "zipcode" },
    { label: "Bank Routing Number", name: "bank_routing_number" },
    { label: "Bank Account Number", name: "bank_account_number" },
  ],
};

export default function UserProfile() {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  const [profile, setProfile] = useState<Record<string, any>>({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const role = session?.user?.role;

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch("/api/profile");
      const data = await res.json();

      const flattened = {
        ...data,
        ...(data.address
          ? {
              street_number: data.address?.street_num || "",
              street_name: data.address?.street_name || "",
              zipcode: data.address?.zipcode?.zipcode || "",
              city: data.address?.zipcode?.city || "",
              state: data.address?.zipcode?.state || "",
            }
          : {}),
      };

      setProfile(flattened);
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = { ...profile };

    if (role === "buyer" || role === "seller") {
      payload.address = {
        street_num: profile.street_number,
        street_name: profile.street_name,
        zipcode: profile.zipcode,
        city: profile.city,
        state: profile.state,
      };

      delete payload.street_number;
      delete payload.street_name;
      delete payload.zipcode;
      delete payload.city;
      delete payload.state;
    }

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Profile updated successfully.");
    } else {
      alert("Failed to update profile.");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (newPassword !== confirmPassword) {
      alert("New password and confirmation do not match.");
      return;
    }

    const res = await fetch("/api/update-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    if (res.ok) {
      alert("Password updated successfully.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      alert("Failed to update password. Please check your current password.");
    }
  };

  if (!session || !role) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col w-full justify-center items-center p-4">
      <h1 className="text-2xl font-bold mt-6">Update Profile</h1>

      {/* Profile Form */}
      <form
        onSubmit={handleProfileSubmit}
        className="w-full max-w-md mt-8 space-y-4"
      >
        <div>
          <label className="flex flex-row">
            <span className="flex-1">Email (uneditable)</span>
            <Link
              href="/submit-request"
              className="hover:underline text-blue-400"
            >
              Need to change email?
            </Link>
          </label>
          <input
            type="email"
            value={profile.email || ""}
            disabled
            className="w-full px-3 py-2 border rounded disabled:bg-gray-200"
          />
        </div>

        {FIELD_MAP[role].map(({ label, name, type = "text" }) => (
          <div key={name}>
            <label>{label}</label>
            <input
              type={type}
              name={name}
              value={profile[name] || ""}
              onChange={handleProfileChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        ))}

        {role === "Seller" && (
          <div>
            <label>Balance</label>
            <input
              type="number"
              name="balance"
              value={profile.balance || ""}
              disabled
              className="w-full px-3 py-2 border rounded disabled:bg-gray-200"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
        >
          Update Profile
        </button>
      </form>

      {/* Password Update Form */}
      <details className="w-full max-w-md mt-8">
        <summary className="cursor-pointer pb-2 font-medium text-lg text-blue-600">
          Update Password
        </summary>
        <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
          <div>
            <label>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border rounded"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border rounded"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border rounded"
              autoComplete="new-password"
            />
          </div>
          {passwordForm.newPassword !== passwordForm.confirmPassword &&
            passwordForm.newPassword.trim().length > 0 &&
            passwordForm.confirmPassword.trim().length > 0 && (
              <div className="text-red-500">Passwords do not match</div>
            )}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed cursor-pointer"
            disabled={
              passwordForm.currentPassword.trim().length === 0 ||
              passwordForm.newPassword.trim().length === 0 ||
              passwordForm.newPassword !== passwordForm.confirmPassword
            }
          >
            Update Password
          </button>
        </form>
      </details>
    </div>
  );
}
