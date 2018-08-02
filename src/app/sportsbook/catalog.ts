import { div, VNode, p } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { Location } from 'history'
import { RequestInput, HTTPSource } from '@cycle/http'
import isolate from '@cycle/isolate'
import { Reducer, StateSource } from 'cycle-onionify'

import { dropRepeats } from '../misc/xstream.extra'

import {
	pick,
	transformPathToPageDataPath,
	getCatalogDataUrl,
} from '../misc/helpers'

import { flattenPageData } from '../misc/helpers.data'
import { simpleHttpResponseReplaceError } from '../misc/helpers.xs'
import { Catalog } from './interfaces'

import Competitions from './competitions'

interface State extends Catalog { }

interface Sinks {
	DOM: Stream<VNode>,
	HTTP: Stream<RequestInput>
	onion: Stream<Reducer<State>>
}

interface Sources {
	History: Stream<Location>,
	HTTP: HTTPSource,
	onion: StateSource<State>
}

function Catalog(sources: Sources): Sinks {

	// stream of pathnames transformed to catalog data url
	const catalogDataUrl$ =
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
			.map(flattenPageData)

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

	// Competitions component is isolated against the 'competitions' property of the state atom.
	// Our Catalog component is already isolaated against the 'catalog' property
	// Peeling off layers of state a la MobX?

	// this maybe wrong, which is to look at - are we better off peeling off the state as we go down,
	// augmenting as we go? and how does this work with push updates?
	// branch now, perhaps - take out competition? then put back on one branch.
	const competitionsSinks = isolate(Competitions, 'competitions')(sources)

	// when successfulCatalogDataResponse$ emits, we start listening to the stream of competition Dom
	// because a value emitted by successfulCatalogDataResponse is mapped to a stream, we then
	// have a stream of stream of Doms, hence we need to flatten that by one dimension to have a stream of Doms
	const successPageDom$: Stream<VNode> =
		successfulCatalogDataResponse$
			.map(() => competitionsSinks.DOM) // value of data is not important here
			.flatten()

	// Reducers - start with undefined as catalog state
	const defaultReducer$: Stream<Reducer<State>> =
		xs.of(function defaultReducer(): State {
			return undefined
		})

	// when we recieve data succesfuly, it replaces the state.
	const succesfulCatalogDataReducer$: Stream<Reducer<State>> =
		successfulCatalogDataResponse$
			.map(pageData => () => pageData)

	// when we change catalog data, clear the state.
	// what we are doing with reducers is returning a stream of reducer functions that are executed againt
	// state.
	// so when the url stream emits, we run the function returned () => undefined against the previous state
	const resetCatalogDataReducer$: Stream<Reducer<State>> =
		catalogDataUrl$
			.compose(dropRepeats())
			.map(() => () => undefined)

	const catalogReducer$: Stream<Reducer<State>> =
		xs.merge(defaultReducer$, succesfulCatalogDataReducer$, resetCatalogDataReducer$)

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
