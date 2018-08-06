import { div, VNode, DOMSource } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { Location } from 'history'
import { RequestInput, HTTPSource } from '@cycle/http'
import { Reducer, StateSource } from 'cycle-onionify'

import {
	pick,
	transformPathToPageDataPath,
	getCatalogDataUrl,
} from '../../misc/helpers'
import { fixPageData } from '../../misc/helpers.data'
import { simpleHttpResponseReplaceError } from '../../misc/helpers.xs'
import { dropRepeats } from '../../misc/xstream.extra'
import { Catalog, Selection } from '../interfaces'
import Sport from './sport'

interface State extends Array<Selection> {}

interface Sinks {
	DOM: Stream<VNode>,
	HTTP: Stream<RequestInput>
	onion: Stream<Reducer<State>>
}

interface Sources {
	History: Stream<Location>,
	HTTP: HTTPSource,
	onion: StateSource<State>
	LiveData: Stream<any>
	DOM: DOMSource
}

function Catalog(sources: Sources): Sinks {

	const liveData$ = sources.LiveData

	// nothing below here is isolated, all streams, which gives us access to the click events, for ex.
	// the below components simply spit out Dom. again, as ever, check thsi assumption as you go.
	// they should have access to the state, which is the selections.
	// they all only use that to render.
	// the click handler here does the management of state

	// stream of pathnames transformed to catalog data url
	const catalogDataUrl$: Stream<string> =
		sources.History
			.map(pick('pathname'))
			.map(transformPathToPageDataPath)
			.map(getCatalogDataUrl)

	// we transform the stream of urls to a stream of http requests.
	// these are passed to the HTTP sink.
	const catalogHttpRequest$ =
		catalogDataUrl$
			.compose(dropRepeats())
			.map(url => ({
				url,
				'category': 'catalog-data',
				lazy: true,
			}))

	// this is the stream of http responses tagged with 'catalog-data', errors handled
	// body contains our data, or an 'err' property to indicate an error.
	const catalogDataResponse$ =
		sources.HTTP
			.select('catalog-data')
			.map(simpleHttpResponseReplaceError)
			.flatten()
			.map(res => res.body)

	// filter the catalog data http responses such that we only have the successful responses.
	// flattenPageData transforms the data from given to flat - should be unecessary.
	const successfulCatalogDataResponse$ =
		catalogDataResponse$
			.filter(data => !data.err)
			.map(fixPageData)

	// as above, but filter for erroneous responses.
	const unsuccessfulCatalogDataResponse$ =
		catalogDataResponse$.filter(data => !!data.err)

	// every time we recieve an error response, we map that to a piece of Dom that says error.
	const errorPageDom$: Stream<VNode> =
		unsuccessfulCatalogDataResponse$
			.map(res => div('.catalog', res.err.message))

	// every time we requst new data, we map that to a piece of Dom that says loading...
	const loadingDom$: Stream<VNode> =
		catalogDataUrl$ // ie when this emits, we display the loading indicator
			.compose(dropRepeats())
			.mapTo(div('.catalog', 'loading...'))

	// successful page data is mapped to a sport component vdom
	const successPageDom$: Stream<VNode> =
		successfulCatalogDataResponse$
			.map(successfulCatalogDataResponse => {
				const sportSinks = Sport({
					DOM: sources.DOM,
					onion: sources.onion,
					competitions$: xs.of(successfulCatalogDataResponse),
					LiveData: liveData$,
				})
				// we want to stop listening to these when we make a new request for data,
				// else the push update updated dom will overwrite the loading/error via the merge
				// if one arrives
				return sportSinks.DOM.endWhen(catalogHttpRequest$)
			})
			.flatten()


	// **************************************************
	// Reducers - start with undefined as catalog state
	const defaultReducer$: Stream<Reducer<State>> =
		xs.of(function defaultReducer(prev: State): State {
			if (typeof prev === 'undefined') {
				return []
			} else {
				return prev
			}
		})

	const addToSelectionsReducer$: Stream<Reducer<State>> =
		sources.DOM.select('.outcome').events('click')
			.map((e: any) => e.ownerTarget)
			.map((t: any) => JSON.parse(t.dataset.dataOutcome))
			.map(selection =>
				function addOneItemReducer(prev: State): State {
					return [...prev, Object.assign(selection, {
            // we are copyiing an outcome from the dom to the state.
            // as they outcome in the dom may have a price change property if it has been updated, we don't want to take it to
            // the selections (as it'll force an animate)
            priceChangeUp: undefined,
            priceChangeDown: undefined, // ditto
          })]
				}
			)

	const removeSelectionReducer$: Stream<Reducer<State>> =
		sources.DOM.select('.outcome.selected').events('click')
			.map((e: any) => e.ownerTarget)
			.map((t: any) => JSON.parse(t.dataset.dataOutcome).id)
			.map(selectionId =>
				function removeSelectionReducer(prev: State): State {
					return prev.filter(({id}) => id !== selectionId)
				}
			)

	const catalogReducer$: Stream<Reducer<State>> =
		xs.merge(defaultReducer$, addToSelectionsReducer$, removeSelectionReducer$)

	// end Reducers
	// **************************************************

	// merge our dom streams - success, loading, error
	const vdom$: Stream<VNode> =
		xs.merge( // will essentially emit the most recent from these streams
			successPageDom$, // stream  of competition doms
			loadingDom$, // stream of loading...
			errorPageDom$, // stream of loading errors
		)
		.map((dom: VNode) =>
			div('.catalog', [
				dom,
			])
		)

	// return Catalog sinks
	return {
		DOM: vdom$,
		HTTP: catalogHttpRequest$,
		onion: catalogReducer$,
	}
}

export default Catalog
