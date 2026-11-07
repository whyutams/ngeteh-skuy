import packageInfo from "../../package.json";

// Nama aplikasi / brand bisnis resmi yang diambil dari environment variable
export const APP_NAME =
  process.env.NEXT_PUBLIC_APP_NAME || "Ngeteh Skuyy";

// Nama resmi owner outlet untuk pencatatan dan tampilan data
export const DEFAULT_OWNER_NAME = "Owner Ngeteh Skuyy";

// Versi aplikasi resmi yang diambil langsung dari package.json
export const APP_VERSION = packageInfo.version;
