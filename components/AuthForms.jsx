"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, signUp } from "@/app/actions";

function Submit({ children, pendingText }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? pendingText : children}
    </button>
  );
}

function Field({ id, label, error, ...props }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} name={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props} />
      {error && (
        <p id={`${id}-error`} role="alert" className="error">
          {error}
        </p>
      )}
    </div>
  );
}

function SignInForm({ next }) {
  const [state, action] = useActionState(signIn, { errors: {}, values: {} });
  return (
    <form action={action} noValidate>
      <input type="hidden" name="next" value={next} />
      {state.errors.form && (
        <p role="alert" className="error">
          {state.errors.form}
        </p>
      )}
      <Field id="email" label="Email" type="email" autoComplete="email" defaultValue={state.values?.email ?? ""} error={state.errors.email} />
      <Field id="password" label="Password" type="password" autoComplete="current-password" error={state.errors.password} />
      <Submit pendingText="Signing in…">Sign in</Submit>
    </form>
  );
}

function SignUpForm({ next }) {
  const [state, action] = useActionState(signUp, { errors: {}, values: {} });
  return (
    <form action={action} noValidate>
      <input type="hidden" name="next" value={next} />
      <Field id="name" label="Name" type="text" autoComplete="name" defaultValue={state.values?.name ?? ""} error={state.errors.name} />
      <Field id="email" label="Email" type="email" autoComplete="email" defaultValue={state.values?.email ?? ""} error={state.errors.email} />
      <Field
        id="password"
        label="Password (8+ characters)"
        type="password"
        autoComplete="new-password"
        error={state.errors.password}
      />
      <Submit pendingText="Creating account…">Create account</Submit>
    </form>
  );
}

export default function AuthForms({ next }) {
  const [mode, setMode] = useState("signin");
  return (
    <section className="card auth">
      <div className="segmented" role="group" aria-label="Account">
        <button type="button" className="seg" aria-pressed={mode === "signin"} onClick={() => setMode("signin")}>
          Sign in
        </button>
        <button type="button" className="seg" aria-pressed={mode === "signup"} onClick={() => setMode("signup")}>
          Create account
        </button>
      </div>
      {mode === "signin" ? <SignInForm next={next} /> : <SignUpForm next={next} />}
    </section>
  );
}
