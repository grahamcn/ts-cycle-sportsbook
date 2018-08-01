import { div, VNode } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { Location } from 'history'
import { RequestInput, HTTPSource } from '@cycle/http'
import isolate from '@cycle/isolate'

import Betslip from './betslip'
import CatalogComponent from './catalog'
import { Reducer } from '../../../node_modules/cycle-onionify'
import { Sportsbook } from './interfaces'

interface State extends Sportsbook {}

interface Sinks {
	DOM: Stream<VNode>,
  HTTP: Stream<RequestInput>,
  onion: Stream<Reducer<State>>
}

interface Sources {
	History: Stream<Location>,
	HTTP: HTTPSource,
}

function Sportsbook(sources: Sources): Sinks {

	const catalogSinks = isolate(CatalogComponent, 'catalog')(sources)
	const betslipSinks = Betslip(sources)

  const sportsbookHttp$ = catalogSinks.HTTP
  const sportsbookOnion$ = catalogSinks.onion

	const vdom$: Stream<VNode> =
		xs.combine(
			catalogSinks.DOM,
			betslipSinks.DOM,
		).map(([catalogDom, betslipDom]) =>
			div('.sportsbook', [
				catalogDom, betslipDom
			])
		)

	return {
		DOM: vdom$,
    HTTP: sportsbookHttp$,
    onion: sportsbookOnion$,
	}
}

export default Sportsbook
