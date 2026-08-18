import Link from "next/link";
import { login } from "../actions";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="shell auth">
      <div className="card">
        <h1>Welcome back</h1>
        {error && <p className="error">{error}</p>}
        <form action={login}>
          <label>
            Email
            <input name="email" type="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" minLength={8} required />
          </label>
          <button>Log in</button>
        </form>
        <p>
          <Link href="/forgot-password">Forgot password?</Link>
        </p>
        <p>
          <Link href="/signup">Create account</Link>
        </p>
      </div>
    </main>
  );
}
