"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { hashPassword, verifyPassword } from "@/lib/crypto";
import { createSession, destroySession, getCurrentUser } from "@/lib/session";
import { createUser, findUserByEmail } from "@/lib/users";
import { createSystem, createPaletteSystem, updateSystem, deleteSystem } from "@/lib/systems";
import { parseSystemForm, parseWith, signInSchema, signUpSchema } from "@/lib/validation";
import { safeNext } from "@/lib/safe-next";

// Compared against when the email is unknown, so "no such user" takes as long as "wrong password".
const DUMMY_HASH = hashPassword("momentum-dummy-password");

// Every action returns { errors, values } so the form can show messages and keep what was typed.

export async function signUp(previousState, formData) {
  const values = { name: String(formData.get("name") ?? ""), email: String(formData.get("email") ?? "") };
  const parsed = parseWith(signUpSchema, { ...values, password: String(formData.get("password") ?? "") });
  if (!parsed.ok) return { errors: parsed.errors, values };

  const created = createUser({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash: hashPassword(parsed.data.password),
  });
  if (!created.ok) return { errors: { email: "An account with this email already exists" }, values };

  await createSession(created.user.id);
  redirect(safeNext(formData.get("next")));
}

export async function signIn(previousState, formData) {
  const values = { email: String(formData.get("email") ?? "") };
  const parsed = parseWith(signInSchema, { ...values, password: String(formData.get("password") ?? "") });
  if (!parsed.ok) return { errors: parsed.errors, values };

  const user = findUserByEmail(parsed.data.email);
  const valid = verifyPassword(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) {
    // One message for both cases, so the form never reveals which emails have accounts.
    return { errors: { form: "Email or password is incorrect" }, values };
  }

  await createSession(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function signOut() {
  await destroySession();
  redirect("/");
}

export async function saveSystem(previousState, formData) {
  const user = await getCurrentUser();
  if (!user) return { errors: { form: "Sign in to save your system." } };

  const parsed = parseSystemForm(formData);
  if (!parsed.ok) return { errors: parsed.errors };

  const id = String(formData.get("id") ?? "");
  let saved;
  if (id) {
    const result = updateSystem(user.id, id, parsed.data);
    if (!result.ok) {
      return {
        errors: {
          form: result.error === "forbidden" ? "You can only edit your own systems." : "That system no longer exists.",
        },
      };
    }
    saved = result.system;
  } else {
    saved = createSystem(user.id, parsed.data);
  }

  updateTag("systems"); // public pages and lists show the change on the very next request
  redirect(saved.isPublic ? `/systems/${saved.id}` : "/systems");
}

export async function deleteSystemAction(formData) {
  const user = await getCurrentUser();
  if (!user) redirect("/signin?next=/systems");
  const result = deleteSystem(user.id, String(formData.get("id") ?? ""));
  if (result.ok) updateTag("systems");
  redirect("/systems");
}


export async function saveColorPaletteAction({ name, colors }) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in to save palettes to My Systems." };

  try {
    const system = createPaletteSystem(user.id, { name, colors });
    updateTag("systems");
    return { ok: true, id: system.id, name: system.name };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not save this palette.",
    };
  }
}
