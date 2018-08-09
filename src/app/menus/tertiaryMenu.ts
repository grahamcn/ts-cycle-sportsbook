import { div, VNode, ul, DOMSource, p } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { Location } from 'history'
import { RequestInput, HTTPSource } from '@cycle/http'
import { StateSource, Reducer, makeCollection } from 'cycle-onionify'
import isolate from '@cycle/isolate'
import { dropRepeats } from '../misc/xstream.extra'

import {staticTertiaryMenus} from '../misc/constants'
import {
	pick,
	transformPathToSecondaryDataKey,
	getTertiaryMenuDataUrl,
	transformDynamicMenuDataToMenus,
} from '../misc/helpers'

import {
	simpleHttpResponseReplaceError,
} from '../misc/helpers.xs'

import MenuComponent from './menu'
import { Menu	} from './interfaces'


interface State {
  secondaryKey: string,
  staticMenus: Menu[]
  dynamicMenus: Menu[]
 }

interface Sinks {
	DOM: Stream<VNode>,
	HTTP: Stream<RequestInput>,
	onion: Stream<Reducer<State>>,
	History: Stream<string | {}>,
}

interface Sources {
	History: Stream<Location>,
	HTTP: HTTPSource,
	DOM: DOMSource,
	onion: StateSource<State>
}

// this component has two child components:
// static menu
// dynamic menu

// it's assumed we find the static menu in the config. if this doesn't exist there is an error.
// the dynamic menu will display any menu items it finds for the secondary key, else wiull return nothing (won't display an error)

function TertiaryMenu(sources: Sources): Sinks {
  const state$ = sources.onion.state$

	// define a stream of sport
	const secondaryDataKey$ =
		sources.History
			.map(pick('pathname'))
			.map(transformPathToSecondaryDataKey)

  // define a stream of menu data requests
	const menuHttp$ =
		secondaryDataKey$
			.compose(dropRepeats()) // akin to memoize / shouldComponentUpdate. if we change urls, we don't change menu unless segment 1 changes
			.map(key => ({
				url: getTertiaryMenuDataUrl(key),
				'category': 'tertiary-menu',
				lazy: true, // cancellable
			}))

	const menuData$ =
		sources.HTTP
			.select('tertiary-menu')
			.map(simpleHttpResponseReplaceError)
			.flatten()
			.map(res => res.body)

	const successMenuData$ = menuData$.filter(data => !data.err)
	const errorMenuData$ = menuData$.filter(data => !!data.err)


	const dynamicMenus$: Stream<Menu[]> =
		successMenuData$.map(transformDynamicMenuDataToMenus)

  // static menu list
	const staticMenusListLens = {
		get: (state: State) => state.staticMenus,
	}

	const StaticMenusList: any = makeCollection({
		item: MenuComponent,
		itemKey: (item: any) => item.id,
		itemScope: key => key,
		collectSinks: instances => {
			return {
				DOM: instances.pickCombine('DOM'), // combine all the dom streams
				History: instances.pickMerge('History')
			}
		}
	})

	const staticMenusSinks = isolate(StaticMenusList, { onion: staticMenusListLens })(sources) // list idetifies the part of state of loop over
	const staticMenusDom$: Stream<Array<VNode>> = staticMenusSinks.DOM
  const staticMenusHistory$: Stream<string> = staticMenusSinks.History

  // dynamic menu list
  const dynamicMenusListLens = {
		get: (state: State) => state.dynamicMenus,
	}

	const DynamicMenusList: any = makeCollection({
		item: MenuComponent,
		itemKey: (item: any) => item.id,
		itemScope: key => key,
		collectSinks: instances => {
			return {
				DOM: instances.pickCombine('DOM'), // combine all the dom streams
				History: instances.pickMerge('History')
			}
		}
	})

	const dynamicMenusSinks = isolate(DynamicMenusList, { onion: dynamicMenusListLens })(sources) // list idetifies the part of state of loop over
	const dynamicMenusDom$: Stream<Array<VNode>> = dynamicMenusSinks.DOM
	const dynamicMenusHistory$: Stream<string> = dynamicMenusSinks.History

	const errorMenuDom$: Stream<VNode> = errorMenuData$.map(() =>
		div('.tertiaryMenu', [
			p('No menu data for this segment...')
		])
	)

	// add loading state to the dynamic menu
  const vdom$: Stream<VNode> =
    xs.combine(
      staticMenusDom$,
      dynamicMenusDom$,
    ).map(([staticMenusDom, dynamicMenusDom]) =>
      div('.tertiaryMenu', [
        ul('.list', staticMenusDom),
        ul('.list', dynamicMenusDom),
      ])
    )


  // Reducer / state - two streams change state, the dstatic menu items and the dynamic menu  items.
  // The view is derive from state
  // Set the default sate
  const defaultReducer$: Stream<Reducer<State>> =
    xs.of(function () {
      return {
        secondaryKey: undefined,
        staticMenus: [],
        dynamicMenus: []
      }
    })

  // Set the static menu data based on the secondary data key
	const staticMenusReducer$: Stream<Reducer<State>> =
    secondaryDataKey$
      .compose(dropRepeats())
      .map(staticTertiaryMenus)
      .map(menus =>
        function staticMenusReducer(prev: State): State {
          return {
            ...prev,
            staticMenus: menus
          }
        }
      )

  // set the dynamic menus based on data over the wire
  const dynamicMenusReducer$: Stream<Reducer<State>> =
    dynamicMenus$
      .map((dynamicMenus: Menu[]) =>
        function dynamicMenusReducer(prev:State): State {
          return {
            ...prev,
            dynamicMenus,
          }
        })


  const tertiaryMenuReducer$ = xs.merge(defaultReducer$, staticMenusReducer$, dynamicMenusReducer$)
  const tertiaryMenuHistory$ = xs.merge(staticMenusHistory$, dynamicMenusHistory$)


	return {
		DOM: vdom$,
		HTTP: xs.empty(),
		onion: tertiaryMenuReducer$,
		History: tertiaryMenuHistory$,
	}
}

export default TertiaryMenu
