# Notion MCP Flask Application

A powerful Flask-based web application that integrates with Notion workspaces using the Model Context Protocol (MCP) and OpenAI's GPT-4o model. This application provides seamless access to Notion content through a conversational AI interface with automatic public URL generation via ngrok.

## 🚀 Features

- **Notion Integration**: Direct connection to Notion workspaces using MCP (Model Context Protocol)
- **AI-Powered Queries**: Leverages OpenAI's GPT-4o model for intelligent content search and summarization
- **Real-time Processing**: Asynchronous task execution for optimal performance
- **Public URL Generation**: Automatic ngrok tunnel creation for external access
- **Cross-Origin Support**: CORS-enabled for frontend integration
- **RESTful API**: Clean API endpoints for easy integration
- **Error Handling**: Comprehensive exception handling and status reporting

## 🛠 Technical Stack

### Backend Technologies
- **Flask**: Python web framework for API development
- **AsyncIO**: Asynchronous programming for concurrent task handling
- **AutoGen**: Multi-agent conversation framework
- **MCP (Model Context Protocol)**: Standardized protocol for AI model interactions
- **OpenAI GPT-4o**: Advanced language model for content processing

### Infrastructure & Networking
- **ngrok**: Secure tunnel service for public URL exposure
- **CORS**: Cross-Origin Resource Sharing for frontend compatibility
- **Environment Variables**: Secure configuration management with python-dotenv

### AI Agent Architecture
- **AssistantAgent**: Specialized agent for Notion workspace interactions
- **RoundRobinGroupChat**: Team-based conversation management
- **Tool Integration**: MCP server tools for Notion API operations
- **Reflection Mechanism**: Self-improvement through tool use reflection

## 🔧 Installation & Setup

### Prerequisites
```bash
# Required Python packages
pip install flask flask-cors python-dotenv pyngrok requests asyncio
pip install autogen-ext autogen-agentchat
```

### Environment Configuration
Create a `.env` file with the following variables:
```env
NGROK_AUTH_TOKEN=your_ngrok_auth_token
NOTION_INTEGRATION_SECRET=your_notion_integration_secret
OPENAI_API_KEY=your_openai_api_key
```

### Notion Integration Setup
1. Create a Notion integration at [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Generate an internal integration secret
3. Share your Notion pages/databases with the integration
4. Copy the integration secret to your `.env` file

### ngrok Configuration
1. Sign up for a free ngrok account at [https://ngrok.com](https://ngrok.com)
2. Obtain your authentication token from the ngrok dashboard
3. Add the token to your `.env` file

## 🚦 API Endpoints

### Health Check
```http
GET /health
```
Returns application status and confirms the service is running.

### Root Endpoint
```http
GET /
```
Basic endpoint providing application information.

### Task Execution
```http
POST /run
```
**Request Body:**
```json
{
  "task": "Search for project documentation in Notion"
}
```

**Response:**
```json
{
  "status": "success",
  "result": "AI-generated response with Notion content"
}
```

## 🤖 AI Agent Configuration

### System Message Design
The application uses a carefully crafted system message that:
- Defines the assistant's role as a Notion workspace helper
- Instructs intelligent tool selection and usage
- Implements proper termination conditions
- Ensures focused and relevant responses

### Agent Capabilities
- **Notion Content Search**: Intelligent querying of Notion databases and pages
- **Content Summarization**: AI-powered summarization of retrieved information
- **Tool Reflection**: Self-assessment of tool usage for improved performance
- **Conversation Management**: Structured multi-turn conversations with termination logic

## 🌐 ngrok Integration

### Automatic Tunnel Creation
The application automatically creates a public HTTPS tunnel using ngrok, enabling:
- **External Access**: Share your local application with external users
- **Webhook Support**: Receive webhooks from external services
- **Development Testing**: Test with real-world scenarios without deployment
- **Secure HTTPS**: Automatic SSL certificate provisioning

### URL Generation Process
1. Application starts on localhost:7001
2. ngrok creates a secure tunnel to the local server
3. Public URL is automatically generated and displayed
4. External requests are forwarded to your local Flask application

## 🔄 Asynchronous Architecture

### AsyncIO Implementation
- **Non-blocking Operations**: Prevents application freezing during long-running tasks
- **Concurrent Processing**: Handle multiple requests simultaneously
- **Resource Efficiency**: Optimal memory and CPU usage
- **Scalable Design**: Ready for high-traffic scenarios

### Team-based Processing
- **RoundRobinGroupChat**: Manages agent interactions efficiently
- **Turn Limits**: Prevents infinite loops with configurable max_turns
- **Termination Conditions**: Smart conversation ending based on content analysis

## 📊 Error Handling & Monitoring

### Comprehensive Exception Management
- **Try-catch blocks**: Graceful error handling for all API endpoints
- **Detailed Error Messages**: Informative error responses for debugging
- **Status Codes**: Proper HTTP status code implementation
- **Logging**: Console output for task tracking and debugging

### Health Monitoring
- **Health Check Endpoint**: Quick status verification
- **Service Status**: Real-time application health reporting
- **Connection Validation**: Automatic service availability checks

## 🔐 Security Features

### Environment Variable Protection
- **Sensitive Data Isolation**: API keys and secrets stored in environment variables
- **dotenv Integration**: Secure configuration loading
- **No Hardcoded Secrets**: All sensitive information externalized

### CORS Configuration
- **Cross-Origin Support**: Secure frontend-backend communication
- **Flexible Access Control**: Configurable origin policies
- **Security Headers**: Proper CORS header management

## 🎯 Use Cases

### Content Management
- Search across Notion workspaces
- Summarize project documentation
- Extract specific information from databases
- Generate content reports

### Productivity Enhancement
- Quick access to team knowledge bases
- Automated content organization
- Intelligent search and retrieval
- Meeting notes summarization

### Integration Scenarios
- Connect with existing web applications
- Mobile app backend services
- Workflow automation tools
- Business intelligence dashboards

## 🚀 Running the Application

1. **Set up environment variables** in your `.env` file
2. **Install dependencies** using pip
3. **Run the application**:
   ```bash
   python final.py
   ```
4. **Access via public URL** displayed in console output
5. **Test endpoints** using the provided API documentation

## 💡 Technical Highlights

- **Modern Python Patterns**: Async/await, type hints, and clean architecture
- **Production-Ready Code**: Error handling, logging, and configuration management
- **Scalable Design**: Modular structure ready for feature expansion
- **AI Integration**: Cutting-edge language model implementation
- **Network Automation**: Zero-configuration public URL generation
- **Cross-Platform Compatibility**: Works across different operating systems

---

*This application demonstrates advanced integration of AI agents, web frameworks, secure tunneling, and modern Python development practices.*