import json
import boto3
import random
import os


def lambda_handler(event, context):
    """Called when a user initiates a websocket connection

    Parameters
    ----------
    event: dict, required
        Input event to the Lambda function
        {
            ...
            "queryStringParameters": {
                "room": <room name>,
                "name": <player name>
            },
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
            {
                "statusCode": 200,
                "body": {
                    "room": <room name>,
                    "message": str
                }
            }
    """

    print("Event:", event)

    connection_id = event.get("requestContext", {}).get("connectionId")
    name = event.get("queryStringParameters", {}).get("name")
    if not name or not str(name).strip():
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "Name not provided"}),
        }
    print("Conn ID:", connection_id)

    sfn_client = boto3.client("stepfunctions")

    room_id = event.get("queryStringParameters", {}).get("room")
    if room_id:
        print("Room ID:", room_id)
        # TODO: Check name duplicate

        try:
            execution_info = sfn_client.describe_execution(
                executionArn=os.environ.get("game_state_machine_arn").replace(
                    "stateMachine", "execution"
                )
                + ":"
                + str(room_id)
            )
            # TODO: Ensure this room is still waiting for players
        except Exception as e:
            print("Error getting execution:", e)
            return {
                "statusCode": 400,
                "body": json.dumps({"message": "Room not found"}),
            }

        input = json.loads(execution_info.get("input", "{}"))
        host_connection_id = input["hostConnectionId"]

        player_info = {"id": name, "connectionId": connection_id}

        apigateway_client = boto3.client(
            "apigatewaymanagementapi", endpoint_url=os.environ.get("connections_url")
        )
        apigateway_client.post_to_connection(
            ConnectionId=host_connection_id,
            Data=json.dumps({"action": "playerJoined", "player": player_info}),
        )
        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Successfully joined room"}),
        }

    else:
        room_id = str(random.randint(100, 999))
        print("Creating room with ID:", room_id)
        try:
            sfn_client.start_execution(
                stateMachineArn=os.environ.get("game_state_machine_arn"),
                name=room_id,
                input=json.dumps(
                    {
                        "room": room_id,
                        "hostConnectionId": connection_id,
                        "hostName": name,
                        "maxRounds": 3  # TODO: adjustable max rounds count
                    }
                ),
            )
        except Exception as e:
            print("Error starting execution:", e)
            return {
                "statusCode": 500,
                "body": json.dumps({"message": "Error starting execution"}),
            }

        return {
            "statusCode": 200,
            "body": json.dumps(
                {"room": room_id, "message": "Successfully created room"}
            ),
        }
