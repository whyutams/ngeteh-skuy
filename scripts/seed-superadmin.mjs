import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const envPath = path.resolve(".env.local");
if (!fs.existsSync(envPath)) {
  console.error("Berkas .env.local tidak ditemukan.");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf8");
function getEnv(key) {
  const match = envContent.match(new RegExp(`${key}=(.*)`));
  if (!match) return "";
  return match[1].replace(/["']/g, "").trim();
}

const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceKey) {
  console.error("Kredensial Supabase belum lengkap di .env.local.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seed() {
  const targetUsername = "estehadmin";
  const targetPassword = "SuperAdmin#";
  const targetEmail = `${targetUsername}@ngeteh-skuyy.internal`;
  const targetRole = "superadmin";

  console.log(`Memeriksa akun ${targetUsername} di Supabase...`);

  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Gagal memeriksa daftar user:", listError.message);
    process.exit(1);
  }

  let user = listData.users.find(
    (u) =>
      u.email === targetEmail ||
      u.user_metadata?.username === targetUsername
  );

  if (!user) {
    console.log(`Membuat akun baru ${targetUsername} di Supabase Auth...`);
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: targetEmail,
      password: targetPassword,
      email_confirm: true,
      user_metadata: {
        username: targetUsername,
        role: targetRole,
      },
    });

    if (createError) {
      console.error("Gagal membuat user:", createError.message);
      process.exit(1);
    }

    user = createData.user;
    console.log(`Akun ${targetUsername} berhasil dibuat! (ID: ${user.id})`);
  } else {
    console.log(`Akun ${targetUsername} sudah ada. Memperbarui password...`);
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: targetPassword,
      email_confirm: true,
      user_metadata: {
        username: targetUsername,
        role: targetRole,
      },
    });

    if (updateError) {
      console.error("Gagal memperbarui password user:", updateError.message);
    } else {
      console.log(`Password akun ${targetUsername} berhasil diperbarui.`);
    }
  }

  try {
    const { error: profileError } = await supabase.from("profil_pengguna").upsert({
      id: user.id,
      username: targetUsername,
      role: targetRole,
      email: targetEmail,
      is_active: true,
    });

    if (profileError) {
      console.log("Catatan tabel profil_pengguna:", profileError.message);
    } else {
      console.log("Data profil superadmin berhasil disinkronkan ke tabel profil_pengguna.");
    }
  } catch (err) {
    console.log("Catatan tabel profil_pengguna belum aktif di database.");
  }

  console.log("\nProses selesai!");
}

seed();

