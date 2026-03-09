import Link from "next/link";

import { registerAction } from "@/app/actions/auth";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function RegisterPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <main className="shell section-gap">
      <section className="auth-card card stack">
        <h1>Create account</h1>
        {params.error ? <p className="error">{params.error}</p> : null}
        <form action={registerAction} className="stack">
          <label className="field">
            <span>Email</span>
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              name="password"
              type="password"
              minLength={10}
              required
              autoComplete="new-password"
            />
          </label>
          <p className="muted">
            Use at least 10 characters with uppercase, lowercase, and a number.
          </p>
          <button className="button" type="submit">
            Create account
          </button>
        </form>
        <p className="muted">
          Already a member? <Link href="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
