import boto3
import os


def generate_prompt():
    """Generate a prompt for this round

    Returns
    -------
        str: Prompt for this round
    """
    return "A prompt for this round"


def lambda_handler(event, context):
    """Called by the state machine to generate this round's prompt
    and pre-signed S3 URLs for uploads.

    Parameters
    ----------
    event: dict, required
        Input event to the Lambda function
        {
            "room": <room id>,
            "round": <round number>,
            "players": [
                {
                    "id": <player id>,
                    "connectionId": <player connection id>
                },
                ...
            ]
        }

    context: object, required
        Lambda Context runtime methods and attributes

    Returns
    ------
        dict: Object with the current round's info
        {
            "prompt": <prompt for this round>,
            "uploads": [
                {
                    "playerId": <player id>,
                    "uploadUrl": <pre-signed upload url>
                },
                ...
            ]
        }
    """

    print("Event: ", event)

    round_info = {
        "prompt": generate_prompt(),
        "uploads": []
    }
    players = event.get("players", [])

    for player in players:
        # Generate a unique upload key for each player
        upload_key = f"{event.get('room')}/{event.get('round')}/{player.get('id')}.jpg"

        # Create a pre-signed S3 URL for uploads
        s3_client = boto3.client("s3")
        upload_url = s3_client.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": os.environ["bucket_name"],
                "Key": upload_key,
            },
            ExpiresIn=605,
        )

        round_info["uploads"].append(
            {
                "playerId": player.get("id"),
                "connectionId": player.get("connectionId"),
                "uploadUrl": upload_url,
            }
        )

    return round_info
