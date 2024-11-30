import { getMenuItems } from "./menu-items";
import { HeaderClient } from "./header-client";

export async function Header() {
	const menuItems = await getMenuItems();

	return <HeaderClient initialMenuItems={menuItems} />;
}
