import { VNode, DOMSource } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { StateSource, makeCollection } from 'cycle-onionify'
import isolate from '@cycle/isolate'

import { Menu } from './interfaces'
import MenuItem from './menuItem'
import { renderMenu } from '../misc/helpers.dom'

interface State extends Menu { }

interface Sinks {
	DOM: Stream<VNode>
	History: Stream<string>
}

interface Sources {
	DOM: DOMSource,
	onion: StateSource<State>
}

function MenuComponent(sources: Sources): Sinks {
	const state$ = sources.onion.state$

	const MenuItemList: any = makeCollection({
		item: MenuItem,
		itemKey: (item: any) => item.id,
		itemScope: key => key,
		collectSinks: instances => {
			return {
				DOM: instances.pickCombine('DOM'), // combine all the dom streams
				History: instances.pickMerge('History')
			}
		}
	})

	const MenuItemListSinks = isolate(MenuItemList, 'items')(sources) // list idetifies the part of state of loop over
	const menuItemListDom$: Stream<Array<VNode>> = MenuItemListSinks.DOM
	const menuItemListHistory$: Stream<string> = MenuItemListSinks.History

	const vdom$: Stream<VNode> =
		xs.combine(
			state$.map(({title}) => title),
			menuItemListDom$,
		).map(renderMenu)

	return {
		DOM: vdom$,
		History: menuItemListHistory$,
	}
}

export default MenuComponent
