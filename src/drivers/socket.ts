import * as io from 'socket.io-client'
import {adapt} from '@cycle/run/lib/adapt'
import xs, { Stream } from 'xstream'
// import {buffer} from '../app/misc/xstream.extra'

export function makeSocketDriver(socketUrl) {
	//const separator = xs.periodic(1000)

	const socketDriver = (/* no sinks */) => {
		const incoming$: Stream<any> = Stream.create({
			start: listener => {
				const socket = io(socketUrl)

				socket.on('connect', function() {
					console.log('Connected')
				})

				socket.on('pushUpdate', function(event) {
					listener.next(event)
				})

				socket.emit('liveSportsConfig', {
					event: 2000,
					market: 1000,
					outcome: 1000,
				})
			},
			stop: () => {},
		})
		// .compose(buffer(separator))
		// .map((array: any[]): Stream<any> =>
		// 	xs.from(array)
		// ).flatten()

		return adapt(incoming$)
	}

	return socketDriver
}

