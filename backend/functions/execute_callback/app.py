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

    sfn_client = boto3.client("stepfunctions")
    body = json.loads(event.get("body"))
    task_token = body.get("taskToken")

    print("Task token:", task_token)

    output = {}

    if body["action"] == "uploadedphoto":
        output["uploaded"] = True
        print("Photo uploaded")
    elif body["action"] == "vote":
        output["vote"] = body.get("vote")
        output["voter"] = body.get("voter")

    sfn_client.send_task_success(taskToken=task_token, output=json.dumps(output))

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": '{"message":"Callback successful"}',
    }
