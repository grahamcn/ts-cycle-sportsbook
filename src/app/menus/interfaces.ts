export interface MenuLink {
	id: string,
	url: string
	title: string,
}

export interface Menu {
	id: string,
	title?: string,
	items: MenuLink[] | Menu[]
}


