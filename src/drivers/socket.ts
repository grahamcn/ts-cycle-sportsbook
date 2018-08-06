import * as io from 'socket.io-client/dist/socket.io.slim'
import {adapt} from '@cycle/run/lib/adapt'
import { Stream } from 'xstream'

export function makeSocketDriver(socketUrl) {
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
					outcome: 200,
				})
			},
			stop: () => {},
		})

		return adapt(incoming$)
	}

	return socketDriver
}

