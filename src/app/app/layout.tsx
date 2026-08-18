import Link from "next/link";
import { logout } from "../(auth)/actions";
import { requireCoach } from "@/lib/auth/context";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { organizationName } = await requireCoach();
  return (
    <>
      <header>
        <nav className="shell">
          <Link href="/app">
            <strong>{organizationName}</strong>
          </Link>
          <div className="navlinks">
            <Link href="/app/students">Students</Link>
            <Link href="/app/cohorts">Cohorts</Link>
            <Link href="/app/sessions">Sessions</Link>
            <Link href="/app/focus-areas">Focus Areas</Link>
          </div>
          <form action={logout}>
            <button className="secondary">Log out</button>
          </form>
        </nav>
      </header>
      {children}
    </>
  );
}
