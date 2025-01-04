const WebSocket = require('ws')

const wsBaseUrl = "wss://4920segdqe.execute-api.us-east-2.amazonaws.com/Staging/"

async function connectWebSocket(name, room = null) {
    const wsUrl = `${wsBaseUrl}?name=${encodeURIComponent(name)}${room ? `&room=${encodeURIComponent(room)}` : ''}`

    return new Promise((resolve, reject) => {
        const socket = new WebSocket(wsUrl)

        socket.on('open', (event) => {
            console.log("[Client] Connected to WebSocket", event)
            resolve(socket)
        })

        socket.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString())
                console.log("[Client] Message from WebSocket:", message)
            } catch (err) {
                console.error("[Client] Error parsing WebSocket message:", err)
            }
        })

        socket.on('error', (event) => {
            console.error("[Client] WebSocket error:", event)
            reject(event)
        })

        socket.on('close', (event) => {
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

async function startGame(connection, taskToken, players) {
    const payload = {
        action: "startgame",
        taskToken,
        players
    }
    return makeRequest(connection, payload)
}

function disconnectWebSocket(connection) {
    if (connection) {
        connection.close()
        console.log("[Client] WebSocket connection closed")
    }
}

module.exports = { connectWebSocket, makeRequest, startGame, disconnectWebSocket }