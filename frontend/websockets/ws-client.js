let WebSocket

if (typeof window !== "undefined" && window.WebSocket) {
    WebSocket = window.WebSocket // browser or react-native
} else {
    WebSocket = require("ws") // node
}

const wsBaseUrl = "wss://4920segdqe.execute-api.us-east-2.amazonaws.com/Staging/"

function connectWebSocket(name, room = null) {
    const wsUrl = `${wsBaseUrl}?name=${encodeURIComponent(name)}${room ? `&room=${encodeURIComponent(room)}` : ''}`

    return new Promise((resolve, reject) => {
        const socket = new WebSocket(wsUrl)

        socket.onopen = (event) => {
            console.log("[Client] Connected to WebSocket", event)
            resolve(socket)
        }

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data)
                console.log("[Client] Message from WebSocket:", message)
            } catch (err) {
                console.error("[Client] Error parsing WebSocket message:", err)
            }
        }

        socket.onerror = (error) => {
            console.error("[Client] WebSocket error:", error)
            reject(error)
        }

        socket.onclose = (event) => {
            console.log("[Client] Disconnected from WebSocket", event)
        }
    })
}

async function makeRequest(connection, payload) {
    if (connection && connection.readyState === WebSocket.OPEN) {
        return new Promise((resolve, reject) => {
            try {
                connection.send(JSON.stringify(payload))
                console.log("[Client] Message sent through WebSocket:", payload)
                resolve()
            } catch (error) {
                console.error("[Client] Error while making request through WebSocket", error)
                reject(error)
            }
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
