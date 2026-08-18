import { updatePassword } from "../actions";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="shell auth">
      <div className="card">
        <h1>Choose a new password</h1>
        {error && <p className="error">{error}</p>}
        <form action={updatePassword}>
          <label>
            New password
            <input name="password" type="password" minLength={8} required />
          </label>
          <label>
            Confirm password
            <input
              name="confirmPassword"
              type="password"
              minLength={8}
              required
            />
          </label>
          <button>Update password</button>
        </form>
      </div>
    </main>
  );
}
