import boto3
import json


def lambda_handler(event, context):
    """Called when the host sends the success task message back to the
    state machine with the callback token and player information to unpause
    the WaitForHost state

    Parameters
    ----------
    event: dict, required
        Input event to the Lambda function from UI
        {
            ...
            "body": '''{
                "action": "startgame",
                "taskToken": <callback token>,
                "players": [
                    {
                        "id": <player id>,
                        "connectionId": <player connection id>
                    },
                    ...
                ]
            }''',
        }

    context: object, required
        Lambda Context runtime methods and attributes

    Returns
    ------
        dict
            {
                "statusCode": 200,
                "headers": {"Content-Type": "application/json"},
                "body": '{"message":"Game ready"}'
            }
    """
    print("Event:", event)

    try:
        body = json.loads(event.get("body"))
    except Exception as e:
        print("Error parsing body:", e)
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": '{"message":"Error parsing body"}',
        }

    sfn_client = boto3.client("stepfunctions")

    players = body.get("players", [{"id": "dummy_player1", "connectionId": "dummy_connection_id"}])
    task_token = body.get("taskToken", "dummy_token")

    print("Players:", players)
    print("Task token:", task_token)

    sfn_client.send_task_success(
        taskToken=task_token, output=json.dumps({"players": players})
    )
    # TODO: Error handling

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": '{"message":"Game ready"}',
    }
