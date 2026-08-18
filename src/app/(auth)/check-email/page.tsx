import Link from "next/link";
export default function Page() {
  return (
    <main className="shell auth">
      <div className="card">
        <h1>Check your email</h1>
        <p>
          Open the confirmation link we sent you, then you&apos;ll finish
          creating your studio.
        </p>
        <Link href="/login">Return to login</Link>
      </div>
    </main>
  );
}
