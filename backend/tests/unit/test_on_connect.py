from ...functions.on_connect.app import lambda_handler


def test_connect_to_room(monkeypatch):
    monkeypatch.setenv("game_state_machine_arn", "arn:aws:states:us-east-2:585768148753:stateMachine:GameLogic")
    monkeypatch.setenv("connections_url", "https://4920segdqe.execute-api.us-east-2.amazonaws.com/Staging")
    event = {
        "headers": {
            "Host": "4920segdqe.execute-api.us-east-2.amazonaws.com",
            "Sec-WebSocket-Extensions": "permessage-deflate; client_max_window_bits",
            "Sec-WebSocket-Key": "5aQHHPlANipYBEk98lgDQg==",
            "Sec-WebSocket-Version": "13",
            "X-Amzn-Trace-Id": "Root=1-674b8628-664ed2eb032497ea6110bc85",
            "X-Forwarded-For": "24.189.180.105",
            "X-Forwarded-Port": "443",
            "X-Forwarded-Proto": "https",
        },
        "multiValueHeaders": {
            "Host": ["4920segdqe.execute-api.us-east-2.amazonaws.com"],
            "Sec-WebSocket-Extensions": ["permessage-deflate; client_max_window_bits"],
            "Sec-WebSocket-Key": ["5aQHHPlANipYBEk98lgDQg=="],
            "Sec-WebSocket-Version": ["13"],
            "X-Amzn-Trace-Id": ["Root=1-674b8628-664ed2eb032497ea6110bc85"],
            "X-Forwarded-For": ["24.189.180.105"],
            "X-Forwarded-Port": ["443"],
            "X-Forwarded-Proto": ["https"],
        },
        "queryStringParameters": {"name": "max", "room": "351"},
        "multiValueQueryStringParameters": {"name": ["max"], "room": ["351"]},
        "requestContext": {
            "routeKey": "$connect",
            "eventType": "CONNECT",
            "extendedRequestId": "CFHmdEaWCYcF4gw=",
            "requestTime": "30/Nov/2024:21:39:52 +0000",
            "messageDirection": "IN",
            "stage": "Staging",
            "connectedAt": 1733002792973,
            "requestTimeEpoch": 1733002792982,
            "identity": {"sourceIp": "24.189.180.105"},
            "requestId": "CFHmdEaWCYcF4gw=",
            "domainName": "4920segdqe.execute-api.us-east-2.amazonaws.com",
            "connectionId": "CFHmdfaQCYcCG2Q=",
            "apiId": "4920segdqe",
        },
        "isBase64Encoded": False,
    }

    lambda_handler(event, None)
