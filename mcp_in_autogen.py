import os, asyncio
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.conditions import TextMentionTermination, FunctionCallTermination
from autogen_ext.tools.mcp import StdioServerParams, mcp_server_tools
from dotenv import load_dotenv
load_dotenv()

NOTION_TOKEN = os.getenv("NOTION_INTEGRATION_SECRET")
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

SYSTEM_MESSAGE = """You are a helpful assistant that can search and summarize content from the users Notion workspace and also
list what is asked. Try to assume the tool and call the same and get the answer. Say TERMINATE when you are done with the task."""

async def config():

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

async def orchestrate(team, task):
    async for message in team.run_stream(task=task):
        yield message

async def main():
    team = await config()
    task = "Create a new page titled 'PageFromMCPNotion'"

    async for message in orchestrate(team, task):
        print("-"*100)
        print(message)
        print("-"*100)

if __name__ == "__main__":
    asyncio.run(main())
