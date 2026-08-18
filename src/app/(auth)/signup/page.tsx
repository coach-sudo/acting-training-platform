import { headers } from "next/headers";
import { signup } from "../actions";
import { requestOrigin } from "@/lib/http/origin";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const origin = requestOrigin(await headers());
  return (
    <main className="shell auth">
      <div className="card">
        <h1>Create your studio</h1>
        {error && <p className="error">{error}</p>}
        <form action={signup}>
          <input type="hidden" name="origin" value={origin} />
          <label>
            Email
            <input name="email" type="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" minLength={8} required />
          </label>
          <button>Create account</button>
        </form>
      </div>
    </main>
  );
}
