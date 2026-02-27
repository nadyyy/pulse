import Link from "next/link";

import { loginAction } from "@/app/actions/auth";

type PageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <main className="shell section-gap">
      <section className="auth-card card stack">
        <h1>Sign in</h1>
        {params.error ? <p className="error">{params.error}</p> : null}
        <form action={loginAction} className="stack">
          <input type="hidden" name="next" value={params.next ?? ""} />
          <label className="field">
            <span>Email</span>
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              name="password"
              type="password"
              minLength={8}
              required
              autoComplete="current-password"
            />
          </label>
          <button className="button" type="submit">
            Sign in
          </button>
        </form>
        <p className="muted">
          No account? <Link href="/register">Create one</Link>
        </p>
      </section>
    </main>
  );
}
