import { div, VNode } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { Location } from 'history'
import { RequestInput, HTTPSource } from '@cycle/http'
import { dropRepeats } from '../misc/xstream.extra'

import {
	pick,
	transformPathToPageDataPath,
	getCatalogDataUrl,
} from '../misc/helpers'

import { flattenPageData, initialCatalogState } from '../misc/helpers.data'
import { simpleHttpResponseReplaceError } from '../misc/helpers.xs'
import { Catalog } from './interfaces'
import { Reducer, StateSource } from '../../../node_modules/cycle-onionify'
import isolate from '../../../node_modules/@cycle/isolate'
import Competitions from './competitions'

interface State extends Catalog {}

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

	const catalogDataRequestsPath$ =
		sources.History
			.map(pick('pathname'))
			.map(transformPathToPageDataPath)

	const catalogHttpRequest$ =
		catalogDataRequestsPath$
			.compose(dropRepeats())
			.map(path => ({
				url: getCatalogDataUrl(path),
				'category': 'page-data',
				lazy: true,
			}))

	const pageDataResponse$ =
		sources.HTTP
			.select('page-data')
			.map(simpleHttpResponseReplaceError)
			.flatten()
			.map(res => res.body)

	const successPageData$ =
		pageDataResponse$
			.filter(data => !data.err)
			.map(flattenPageData)

	const errorPageData$ =
		pageDataResponse$.filter(data => !!data.err)

	const errorPageDom$: Stream<VNode> =
    errorPageData$
      .map(res => div('.sport', res.err.message))

	const loadingDom$: Stream<VNode> =
		catalogDataRequestsPath$ // this emits, we display the loading indicator
			.compose(dropRepeats())
      .mapTo(div('.sport', 'loading...'))

  const competitionsSinks = isolate(Competitions, 'competitions')(sources)

  // we only use the competitions DOM when it's rendering an empty map (success, no data) or a list of comps (success, data)
  const successPageDom$ =
    successPageData$
      .map(() => competitionsSinks.DOM)
      .flatten()


  // Reducers
  // default catalog state
  const defaultReducer$ = xs.of(function defaultReducer(prevState) {
    return undefined
  });

  // when we recieve data succesfuly, it's added to state.
  const succesfulCatalogDataReducer$: Stream<Reducer<State>> =
    successPageData$.map(pageData => () => pageData)

  // // when we recieve an error from an api call, we reset state. should this happen on the request? probably yes.
  const erroneousCatalogDataReducer$: Stream<Reducer<State>> =
    errorPageData$.map(errorData => () => undefined)

  const catalogReducer$ =
    xs.merge(defaultReducer$, succesfulCatalogDataReducer$, erroneousCatalogDataReducer$)

  // end reducer

  const vdom$: Stream<VNode> =
    xs.merge(
      successPageDom$,
      loadingDom$,
      errorPageDom$,
    ).debug(console.log).map(dom => {
      return div('.catalog', [
        dom,
      ])
    }).startWith(div('.sport', 'initializing...'))

	return {
		DOM: vdom$,
    HTTP: catalogHttpRequest$,
    onion: catalogReducer$,
	}
}

export default Catalog
