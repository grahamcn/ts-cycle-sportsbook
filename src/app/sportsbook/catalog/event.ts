import { VNode, DOMSource } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { StateSource } from 'cycle-onionify'

import { Event, Selection } from '../interfaces'
import MarketComponent, { Sinks as MarketComponentSinks } from './market'
import { renderEvent } from '../../misc/helpers.dom'
import {
	transformArrayOfStreamsToStreamOfArrays,
	transformCatCompSinksToArrayOfStreamsOfVdoms,
} from '../../misc/helpers.xs'

export interface State extends Array<Selection> { }

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

	const marketComponentSinks$: Stream<MarketComponentSinks[]> =
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
							LiveData: liveData$.filter((d: any) =>
								d && d.outcome.marketId === market.id
							),
						})
				)
			)

	const marketComponentsDom$: Stream<VNode[]> =
		marketComponentSinks$
			.map(transformCatCompSinksToArrayOfStreamsOfVdoms)
			.map(transformArrayOfStreamsToStreamOfArrays)
			.flatten()

	const vdom$: Stream<VNode> =
		xs.combine(
			event$,
			marketComponentsDom$,
		).map(renderEvent)

	return {
		DOM: vdom$,
	}
}

export default EventComponent
