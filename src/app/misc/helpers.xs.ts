import xs, { Stream } from 'xstream'
import { VNode } from '@cycle/dom'

import { CatalogComponentSinks } from '../sportsbook/interfaces'

// when the stream returns an error, replace an error on the stream with a non erroneous stream (ie don't kill the stream),
// with an error property on it to identify
// there is a good video on error handling in streams from AngularConnect 2017 by Ben Lesh
export function simpleHttpResponseReplaceError(response$) {
	return response$.replaceError(err => {
		const body = {
			err,
			message: null,
		}

		switch (err.status) {
			case 404:
				body.message = '404 Not found'
				break
			case 403:
				body.message = '403 Not authorized'
				break
			case 401:
				body.message = '401 Not authenticated'
				break
			default:
				body.message = 'Generic server error'
				break
		}

		return xs.of({
			body,
		})
	})
}

// transform stream of catalog component sinks to stream of array of streams of vnodes.
export function transformCatCompSinksToArrayOfStreamsOfVdoms(catalogComponentsSinks: CatalogComponentSinks[]): Stream<VNode>[] {
	return catalogComponentsSinks
		.map((catalogComponentsSink: CatalogComponentSinks) =>
			catalogComponentsSink.DOM
		)
}

// helper for the above for the second transformation in the consumer of these two
export function transformArrayOfStreamsToStreamOfArrays(arrayOfStreams$: Stream<any>[]): Stream<any[]> {
	return xs.combine(...arrayOfStreams$)
}
