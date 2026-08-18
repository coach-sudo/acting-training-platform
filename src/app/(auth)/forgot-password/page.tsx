import { headers } from "next/headers";
import { reset } from "../actions";
import { requestOrigin } from "@/lib/http/origin";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const p = await searchParams,
    origin = requestOrigin(await headers());
  return (
    <main className="shell auth">
      <div className="card">
        <h1>Reset password</h1>
        {p.sent ? (
          <p>Check your email.</p>
        ) : (
          <form action={reset}>
            <input type="hidden" name="origin" value={origin} />
            {p.error && <p className="error">{p.error}</p>}
            <label>
              Email
              <input name="email" type="email" required />
            </label>
            <button>Send reset link</button>
          </form>
        )}
      </div>
    </main>
  );
}
