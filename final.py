import os, asyncio
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.conditions import TextMentionTermination, FunctionCallTermination
from autogen_ext.tools.mcp import StdioServerParams, mcp_server_tools

from flask import Flask, jsonify, request
from flask_cors import CORS
from pyngrok import ngrok
import requests
from dotenv import load_dotenv
load_dotenv()

port = 7001
NGROK_AUTH_TOKEN = os.getenv("NGROK_AUTH_TOKEN")
NOTION_TOKEN = os.getenv("NOTION_INTEGRATION_SECRET")
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)
CORS(app)

SYSTEM_MESSAGE = """You are a helpful assistant that can search and summarize content from the users Notion workspace and also
list what is asked. Try to assume the tool and call the same and get the answer. Say TERMINATE when you are done with the task."""

async def setup_team():

    params = StdioServerParams(
        command = "npx",
        args = ["-y", "mcp-remote", "https://mcp.notion.com/mcp"],
        env = {"NOTION_API_KEY" : NOTION_TOKEN},
        read_timeout_seconds = 20
    )

    model = OpenAIChatCompletionClient(model="gpt-4o")

    mcp_tools = await mcp_server_tools(server_params=params)

    agent = AssistantAgent(
        name = "notion_agent",
        model_client=model,
        system_message=SYSTEM_MESSAGE,
        tools=mcp_tools,
        reflect_on_tool_use=True
    )

    team = RoundRobinGroupChat(
        participants=[agent],
        max_turns=5,
        termination_condition=TextMentionTermination(text="TERMINATE")
    )

    return team

async def run_task(task:str) -> str:
    team = await setup_team()
    output = []

    async for msg in team.run_stream(task=task):
        output.append(str(msg))

    return "\n\n\n".join(output)

#################################################

@app.route('/health', methods=["GET"])
def health():
    return jsonify({"status" : "ok", "message" : "Notion MCP Flask is live"}), 200

@app.route("/", methods=["GET"])
def root():
    return jsonify({"message" : "MCP Notion app is live, use /health or /run to work"}), 200

@app.route("/run", methods=["POST"])
def run():
    try:
        data = request.get_json()
        task = data.get('task')

        if not task:
            return jsonify({'error':'Missing task'}), 400
        
        print(f"Got the task, {task}")

        result = asyncio.run(run_task(task))
        return jsonify({"status":"success", "result":result}), 200
    
    except Exception as e:
        return jsonify({"status":"error", "result": str(e)}), 500
    
if __name__ == "__main__":

    ngrok.set_auth_token(NGROK_AUTH_TOKEN)
    public_url = ngrok.connect(port)
    print(f"Public URL: {public_url} \n \n")

    app.run(port=port)