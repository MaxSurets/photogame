const { connectWebSocket, disconnectWebSocket } = require('./ws-client')
const fs = require('fs')
const path = require('path')

const playerName = process.argv[2] || 'testPlayer'
const roomId = process.argv[3] || null

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function uploadPhoto(uploadUrl) {
    try {
        const photoPath = path.join(__dirname, 'photo.jpg')
        const photoData = fs.readFileSync(photoPath)

        console.log(`[Player: ${playerName}] Uploading photo...`)

        const response = await fetch(uploadUrl, {
            method: 'PUT',
            body: photoData
        })

        if (response.ok) {
            console.log(`[Player: ${playerName}] Photo uploaded successfully`)
        } else {
            console.error(`[Player: ${playerName}] Failed to upload photo`, response)
        }
    } catch (error) {
        console.error(`[Player: ${playerName}] Error uploading photo:`, error)
    }
}

(async () => {
    try {
        console.log(`[Player: ${playerName}] Connecting to room: ${roomId}`)
        const connection = await connectWebSocket(playerName, roomId)

        connection.on('message', async (data) => {
            try {
                const message = JSON.parse(data.toString())
                console.log(`[Player: ${playerName}] Message from server:`, message)

                if (message.uploadUrl) {
                    console.log(`[Player: ${playerName}] Upload URL received: ${message.uploadUrl}`)
                    await uploadPhoto(message.uploadUrl)
                }

                if (message.prompt) {
                    console.log(`[Player: ${playerName}] Prompt received: ${message.prompt}`)
                }
            } catch (err) {
                console.error(`[Player: ${playerName}] Error parsing message:`, err)
            }
        });

        console.log(`[Player: ${playerName}] Waiting for game to start...`)

        await sleep(10000)
    } catch (error) {
        console.error(`[Player: ${playerName}] Error:`, error)
    }
})();
