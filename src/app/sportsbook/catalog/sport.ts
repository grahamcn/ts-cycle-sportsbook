import { VNode, DOMSource, ul } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { StateSource } from 'cycle-onionify'

import { Competition } from '../interfaces'
import { Selection } from '../interfaces'
import CompetitionComponent, { Sinks as CompetitionComponentSinks } from './competition'

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
	const competitionComponents$: Stream<CompetitionComponentSinks[]> =
		competitions$
			.map(competitions =>
				competitions.map(competition =>
					CompetitionComponent({
						DOM: sources.DOM,
						onion: sources.onion,
						competition$: xs.of(competition),
						LiveData: liveData$,
					})
				)
			)

	// stream of an array of streams of competition component vdoms
	// simple enough
	const competitionComponentsDom$$: Stream<Stream<VNode>[]> =
		competitionComponents$
			.map((competitionComponents: CompetitionComponentSinks[]) =>
				competitionComponents
					.map((competitionComponent: CompetitionComponentSinks) =>
						competitionComponent.DOM
					)
			)

	// this is the trick here.
	// transform to a stream of an array of vdoms from a an array of streams of competition component vdoms
	const competitionComponentDoms$: Stream<VNode[]> =
		competitionComponentsDom$$
			.map((eventComponentsDoms$: Stream<VNode>[]): Stream<VNode[]> =>
				xs.combine(...eventComponentsDoms$)
			)
			.flatten()

	/// back to what we've seen before.
	// simple enough
	const vdom$ =
		xs.combine(
			competitionComponentDoms$,
		).map(([competitionComponentsDom]) =>
			ul('.list', [
					...competitionComponentsDom,
				])
			)

	return {
		DOM: vdom$,
	}
}

export default Sport
