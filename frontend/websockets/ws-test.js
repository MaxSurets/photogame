const { connectWebSocket, startGame, disconnectWebSocket } = require('./ws-client')

const players = [
    { id: "id1", connectionId: "conn1" },
    { id: "id2", connectionId: "conn2" }
]

let callbackToken = null

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

(async () => {
    try {
        const connection = await connectWebSocket('testHost')

        connection.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString())
                if (message.callbackToken) {
                    callbackToken = message.callbackToken
                }
            } catch (err) {
                console.error('[Test] Error parsing server message:', err)
            }
        })

        while (!callbackToken) {
            await sleep(100) 
        }

        await startGame(connection, callbackToken, players)

        await sleep(5000)

        disconnectWebSocket(connection)
    } catch (error) {
        console.error('[Test] Error:', error)
    }
})()