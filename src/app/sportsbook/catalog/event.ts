import { VNode, DOMSource, a, li, ul } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { StateSource } from 'cycle-onionify'

import { Event, Selection } from '../interfaces'
import MarketComponent, { Sinks as MarketComponentSinks } from './market'

export interface State extends Array<Selection> {}

export interface Sinks {
	DOM: Stream<VNode>,
}

export interface Sources {
	event$: Stream<Event>
	onion: StateSource<State>
	LiveData: Stream<any>
	DOM: DOMSource
}

function EventComponent(sources: Sources): Sinks {
	const event$ = sources.event$
	const liveData$ = sources.LiveData

	const marketComponentsSinks$: Stream<MarketComponentSinks[]> =
		event$
			.map(event =>
					event.markets.map(market =>
						MarketComponent({
							DOM: sources.DOM,
							onion: sources.onion,
							market$: xs.of(
								Object.assign(market, {
									competitionId: event.competitionId,
									competitionName: event.competitionName,
									competitioUrlName: event.competitionUrlName,
									eventId: event.id,
									eventName: event.name,
									eventUrlName: event.urlName,
								})
							),
							LiveData: liveData$.filter((d: any) => d && d.outcome.marketId === market.id),
						})
				)
			)

	const marketComponentsDom$$: Stream<Stream<VNode>[]> =
		marketComponentsSinks$
			.map((marketComponentsSinks: MarketComponentSinks[]) =>
				marketComponentsSinks
					.map((marketComponentSinks: MarketComponentSinks) =>
						marketComponentSinks.DOM
					)
			)

	const marketComponentsDom$: Stream<VNode[]> =
		marketComponentsDom$$
			.map((marketComponentsDom$: Stream<VNode>[]): Stream<VNode[]> =>
				xs.combine(...marketComponentsDom$)
			)
			.flatten()


	const vdom$: Stream<VNode> =
		xs.combine(
			event$,
			marketComponentsDom$,
		).map(([event, marketComponentsDom]) =>
			li('.listItem .event', [
				a('.link .event__name',
					event.name
				),
				ul('.list .inline .markets', [
					...marketComponentsDom,
				])
			])
		)

	return {
		DOM: vdom$,
	}
}

export default EventComponent
