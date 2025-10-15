import { useAuth } from "@/lib/auth-context";

export default function Profile() {
  const { user, subscription, loading, isAuthenticated, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please sign in to view your profile.</div>;

  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="text-xl font-semibold">Profile</h2>
        <p>Name: {user?.name}</p>
        <p>Username: {user?.username}</p>
        <p>Email: {user?.email}</p>
        <p>Joined: {new Date(user!.created).toLocaleString()}</p>
      </div>
      <div>
        <h3 className="text-lg font-medium">Subscription</h3>
        {subscription ? (
          <div>
            <p>Plan: {subscription.plan}</p>
            <p>Status: {subscription.status}</p>
            <p>
              Renews: {new Date(subscription.currentPeriodEnd).toLocaleString()}
            </p>
          </div>
        ) : (
          <p>No active subscription.</p>
        )}
      </div>
      <button className="px-3 py-2 rounded bg-gray-200" onClick={signOut}>
        Sign out
      </button>
    </div>
  );
}
