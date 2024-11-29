import json

def lambda_handler(event, context):
    """Called when a user disconnects from the websocket

    Parameters
    ----------
    event: dict, required
        Input event to the Lambda function

    context: object, required
        Lambda Context runtime methods and attributes

    Returns
    ------
        dict: Object containing the players' information
    """
    print("Event: ", event)
    print("Conn ID: ", event.get(""))

    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }

