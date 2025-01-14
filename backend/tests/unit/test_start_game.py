from ...functions.start_game.app import lambda_handler


def test_connect_to_room():
    event = {
        "requestContext": {
            "routeKey": "startgame",
            "messageId": "CHy8-d2MCYcCIKw=",
            "eventType": "MESSAGE",
            "extendedRequestId": "CHy8-ELEiYcFRmg=",
            "requestTime": "01/Dec/2024:17:09:38 +0000",
            "messageDirection": "IN",
            "stage": "Staging",
            "connectedAt": 1733072397096,
            "requestTimeEpoch": 1733072978633,
            "identity": {"sourceIp": "24.189.180.105"},
            "requestId": "CHy8-ELEiYcFRmg=",
            "domainName": "4920segdqe.execute-api.us-east-2.amazonaws.com",
            "connectionId": "CHxiGdehiYcCIKw=",
            "apiId": "4920segdqe",
        },
        "body": '{"action": "startgame", "taskToken":"AQBsAAAAKgAAAAMAAAAAAAAAAi2tUCHfoueVL4Herlnb/THYIvniQAyN3dIhyPqu7ZqFykXZ7Zuu5jPu2kjIDJgXiAPZgmb8nCrBXoBn38BkWYe318yaOhWnVywYYrKSZdmtnPfVN0RIjQJMlqN4n+fq5mfTB8+Ycazpa5I6XsafLjhE5QtTD7ZE85VtXdhK2eiQRgtqbfAb179XyRGaE1PJLUCt3b3cRXWppjINUPefjway1gBpdy1/myNGg/TIGnl17G8lI8V9CA+K54LnWTtDkHdPaL9cvGfNW5najHqjMyyUy8sfG041I1tcUaZDYMoexEi5rhwhnDETWWCjkCNOB0IdWbdw4hdxfsK17TppDje8UEUvY90gV1ZZ9P4AT8jGluKAzCPcmP+agYkoNbQt3a8lk0S6G0pCC/32lYQZplVyfd3xwYaS+iLkOZOLDX0UwzmosfH+QfMcvG+2pCAOFfFNhKHCBbF2BDhOHxlp5Z8Kg3J1ys2nyyN3Xy15+FZaWn8ll3WowUUYd8QrzizimnRAxz9LXsgp6UNClveY2xq/+xy8e/xDJiV43QkRVbfyIu0nzGZZzlXixZN712L+ay8C2ARh5qWc4+/uruDG/yNw60NL4VvFbtUShNE8M2Dc",  "players": [{"id": "max", "connectionId": "CHxpPeZViYcCFOQ="}]}',
        "isBase64Encoded": False,
    }
    lambda_handler(event, None)
