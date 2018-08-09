import { VNode, DOMSource, div, ul, li } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { StateSource } from 'cycle-onionify'

import { Menu } from './interfaces'
import { getTargetDataUrl } from '../misc/helpers'
import { renderMenuItems } from '../misc/helpers.dom'

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

  // menu items list
  const menuItemsDom$ = xs.of(li('menu!'))

	const history$ =
		sources.DOM
			.select('.link')
			.events('click')
			.map(getTargetDataUrl)

  const vdom$: Stream<VNode> =
    xs.combine(
      state$,
      menuItemsDom$,
    ).map(([state, menuDom]) =>
        div('.menu', [
          state.title && div('.header',
            div('.heading', state.title)
          ),
          ul('.list', [menuDom])
        ])
      )

	return {
		DOM: vdom$,
		History: history$,
	}
}

export default MenuComponent
