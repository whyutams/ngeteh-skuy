"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/libs/supabase/server";

// Server action untuk keluar dari sesi akun
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

