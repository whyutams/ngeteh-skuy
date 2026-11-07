import { getCurrentSession } from "@/libs/auth-session";
import { getMenuListAction } from "@/app/actions/menu";
import { getKategoriListAction } from "@/app/actions/kategori";
import { MenuClient } from "@/components/dashboard/menu/menu-client";
import { APP_NAME } from "@/libs/constants";

export const metadata = {
  title: "Kelola Menu",
};

interface MenuPageProps {
  searchParams?: Promise<{ status?: string }>;
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const session = await getCurrentSession();
  const isOwner = session.isSuperadmin;
  const { status } = (await searchParams) || {};

  const [{ data: menus }, { data: categories }] = await Promise.all([
    getMenuListAction(),
    getKategoriListAction(),
  ]);

  return (
    <MenuClient
      initialMenus={menus || []}
      categories={categories || []}
      isOwner={isOwner}
      statusParam={status}
    />
  );
}

