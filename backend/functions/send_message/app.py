
def lambda_handler(event, context):
    """Called when state machine starts waiting for a player to join
    Sends the host a message to indicate players can join

    Parameters
    ----------
    event: dict, required
        Input event to the Lambda function

    context: object, required
        Lambda Context runtime methods and attributes

    Returns
    ------
        dict
    """
    print("Event:", event)

    return {"statusCode": 200}
