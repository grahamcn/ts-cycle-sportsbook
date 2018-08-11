import { VNode, DOMSource } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { StateSource } from 'cycle-onionify'

import { Competition } from '../interfaces'
import { Selection } from '../interfaces'
import CompetitionComponent, { Sinks as CompetitionComponentSinks } from './competition'
import { renderSport } from '../../misc/helpers.dom'
import { transformArrayOfStreamsToStreamOfArrays, transformCatCompSinksToArrayOfStreamsOfVdoms } from '../../misc/helpers.xs';
import { competitionEvents } from '../../misc/helpers.data';

export interface State extends Array<Selection> { }

export interface Sinks {
	DOM: Stream<VNode>,
}

export interface Sources {
	onion: StateSource<State>
	competitions$: Stream<Competition[]>
	LiveData: Stream<any>
	DOM: DOMSource
}

function Sport(sources: Sources): Sinks {
	const competitions$ = sources.competitions$
	const liveData$ = sources.LiveData

	// transform a stream of an array of competitions to stream of an array of components
	// simple enough
	const competitionComponentSinks$: Stream<CompetitionComponentSinks[]> =
		competitions$
			.map(competitions =>
				competitions
					.filter(competition => competitionEvents(competition).length > 0)
					.map(competition =>
						CompetitionComponent({
							DOM: sources.DOM,
							onion: sources.onion,
							competition$: xs.of(competition),
							LiveData: liveData$,
						})
					)
			)

	const competitionComponentsDom$: Stream<VNode[]> =
		competitionComponentSinks$
			.map(transformCatCompSinksToArrayOfStreamsOfVdoms)
			.map(transformArrayOfStreamsToStreamOfArrays)
			.flatten()

	/// back to what we've seen before.
	// simple enough
	const vdom$ =
		xs.combine(
			competitionComponentsDom$,
		).map(renderSport)

	return {
		DOM: vdom$,
	}
}

export default Sport
