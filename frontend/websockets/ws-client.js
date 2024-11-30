const WebSocket = require('ws')
const wsUrl = "wss://4920segdqe.execute-api.us-east-2.amazonaws.com/Staging/"

async function connectWebSocket() {
    return new Promise((resolve, reject) => {
        socket = new WebSocket(wsUrl)
        socket.on('open', function (event) {
            console.log("[Client] Connected to WebSocket", event)
            resolve(socket)
        })
        socket.on('message', function (event) {
            console.log("[Client] Message from WebSocket:", event.toString())
        })
        socket.on('error', function (event) {
            console.error("[Client] WebSocket error:", event)
            reject(event)
        })
        socket.on('close', function (event) {
            console.log("[Client] Disconnected from WebSocket", event)
        })
    })
}

async function makeRequest(connection, payload) {
    if (connection && connection.readyState === WebSocket.OPEN) {
        return new Promise((resolve, reject) => {
            connection.send(JSON.stringify(payload), (error) => {
                if (error) {
                    console.error("[Client] Error while making request through WebSocket", error)
                    reject(error)
                } else {
                    console.log("[Client] Message sent through WebSocket:", payload)
                    resolve()
                }
            })
        })
    } else {
        const errorMsg = "[Client] WebSocket is not open"
        console.error(errorMsg)
        throw new Error(errorMsg)
    }
}

function disconnectWebSocket(connection) {
    if (connection) connection.close()
}

module.exports = { connectWebSocket, makeRequest, disconnectWebSocket }