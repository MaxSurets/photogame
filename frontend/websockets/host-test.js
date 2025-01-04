const { connectWebSocket, startGame, disconnectWebSocket } = require('./ws-client')

let callbackToken = null
let roomId = null
const players = []

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

(async () => {
    try {
        console.log('[Host] Connecting to WebSocket as host')
        const connection = await connectWebSocket('testHost')

        connection.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString())
                if (message.room) {
                    roomId = message.room
                    console.log(`[Host] Room ID received: ${roomId}`)
                    players.push({ id: 'host', connectionId: message.hostConnId })
                    console.log(`[Host] Added host to players list: ${JSON.stringify(players[0])}`)
                }
                if (message.callbackToken) {
                    callbackToken = message.callbackToken
                }
                if (message.action === 'playerJoined') {
                    console.log(`[Host] Player joined: ${message.player.id}`)
                    players.push({ id: message.player.id, connectionId: message.player.connectionId })

                    if (players.length === 2) { // start game when the first player joins
                        console.log('[Host] First player joined. Starting game...')
                        if (callbackToken) {
                            startGame(connection, callbackToken, players).then(() => {
                                console.log('[Host] Game started')
                            }).catch(err => {
                                console.error('[Host] Error starting game:', err)
                            })
                        } else {
                            console.error('[Host] Callback token not yet received, cannot start game')
                        }
                    }
                }
            } catch (err) {
                console.error('[Host] Error parsing server message:', err)
            }
        })

        console.log('[Host] Waiting for room ID...')
        while (!roomId) {
            await sleep(100) 
        }

        console.log('[Host] Listening for player joins and game events...')
    } catch (error) {
        console.error('[Host] Error:', error)
    }
})()
