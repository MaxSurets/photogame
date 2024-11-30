const { connectWebSocket, makeRequest, disconnectWebSocket } = require('./ws-client')

const payload = {
    action: 'sendmessage',
    roomname: 'test'
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// test
(async () => {
    try {
        const connection = await connectWebSocket()
        console.log('[Test] action: sendmessage request')
        await makeRequest(connection, payload)
        console.log('[Test] Message sent successfully')
        await sleep(2000)
        disconnectWebSocket(connection)
    } catch (error) {
        console.error('error:', error)
    }
})()