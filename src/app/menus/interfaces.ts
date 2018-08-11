export type MenuLink = {
	id: string,
	url: string
	title: string,
}

export type Menu = {
	id: string,
	title?: string,
	items: MenuItem[]
}

export type MenuItem = MenuLink | Menu

