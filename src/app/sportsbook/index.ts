import { div, VNode } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { Location } from 'history'
import { RequestInput, HTTPSource } from '@cycle/http'

import Betslip from './betslip'
import Catalog from './catalog'

interface Sinks {
	DOM: Stream<VNode>,
	HTTP: Stream<RequestInput>
}

interface Sources {
	History: Stream<Location>,
	HTTP: HTTPSource,
}

function Sportsbook(sources: Sources): Sinks {
	const catalogSinks = Catalog(sources)
	const betslipSinks = Betslip(sources)

	const sportsbookHttp$ = catalogSinks.HTTP

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
	}
}

export default Sportsbook
