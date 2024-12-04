import json
import boto3


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
    print("The event:", event)
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
    task_token = body.get("taskToken")

    print("Task token:", task_token)

    output = {}

    sfn_client.send_task_success(taskToken=task_token, output=json.dumps(output))

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": '{"asd":"asd"}',
    }
