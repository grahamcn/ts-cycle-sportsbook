export interface Menu {
	id?: string | number,
	title?: string,
	items: MenuItem[]
}

export type MenuItem = Link | MenuGroup

export interface MenuGroup {
	title: string,
	menu: Menu[],
}

export interface Link {
	url: string
	title: string,
}
