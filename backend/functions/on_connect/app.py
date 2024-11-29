import json

def lambda_handler(event, context):
    """Called when a user initiates a websocket connection

    Parameters
    ----------
    event: dict, required
        Input event to the Lambda function
        {
            ...
            "requestContext": {
                ...
                "routeKey":"$connect",
                "eventType":"CONNECT",
                "connectionId": <websocket ID>
            }
        }
    context: object, required
        Lambda Context runtime methods and attributes

    Returns
    ------
        dict
    """
    print("Event: ", event)
    print("Conn ID: ", event.get(""))

    # Run state machine with name of room, set hostConnectionId

    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
