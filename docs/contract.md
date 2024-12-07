
# Introduction
This document describes websocket API interactions from the perspective of the client.


## $connect
Establishes websocket connection as a host or player joining a room.

`wss://<API name>.us-east-2.amazonaws.com/{stage name}/?name=<name string>&room=<room ID (not required for hosts)>`



### Host receives this message upon a player joining the room
```json
{"action": "playerJoined", "player": {"id": "id2", "connectionId": "<connection ID>"}}
```



## startgame
Host sends this to start the game

```json
{"action":"startgame", "taskToken": "<task token>", "players":[{"id": "<id1>", "connectionId": "<connection ID>"},{"id": "<id2>", "connectionId": "<connection ID>"}]}
```



### Players receive this message before very round
```json
{"callbackToken":"<task callback token>","uploadUrl":"https://<URL to upload an image>","prompt":"<A prompt for this round>"}
```



## uploadedphoto
Player sends this to indicate an upload was done for the round
```json
{"action": "uploadedphoto", "taskToken": "<task callback token>"}
```



### Players receive this message when it's time to vote
```json
{"callbackToken": "{% $states.context.Task.Token %}"}
```



## vote
Players send this message with the player they are voting for this round
```json
{"playerId":"<player ID>"}
```



