# Weather Agent Chat Interface

This project is a responsive, streaming chat interface built with React, as per the Frontend Engineer Assignment. It allows a user to interact with a (mocked) Weather Agent API.

## Features

-   **Responsive Design**: Mobile-first UI that works on all screen sizes (min-width: 320px).
-   **Real-time Streaming**: Agent responses appear word-by-word in real-time.
-   **Conversation History**: Displays a full history of the conversation.
-   **User & Agent Styling**: User messages appear on the right (blue), and agent messages on the left (grey).
-   **Loading State**: The input field is disabled while the agent is generating a response.
-   **Error Handling**: Displays a graceful error message in the chat if the API call fails.
-   **Auto-Scroll**: The chat view automatically scrolls to the newest message.
-   **Timestamps**: Each message is timestamped.
-   **Clear Chat**: A button in the header allows the user to clear the conversation history.
-   **Keyboard Shortcuts**: Press `Enter` to send a message and `Shift+Enter` for a new line.

## Technology Stack

-   **Framework**: React
-   **Build Tool**: Vite
-   **Styling**: Tailwind CSS
-   **Language**: JavaScript

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/weather-chat-app.git](https://github.com/your-username/weather-chat-app.git)
    cd weather-chat-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## API Integration Note

The original API endpoint provided in the assignment (`https://...mastra.cloud/...`) was found to be inactive (returning a 404 Not Found error).

To ensure full functionality and demonstrate the required features, a **mock streaming API** was implemented directly in the frontend code (`App.jsx`). This mock API simulates the word-by-word streaming behavior and allows for proper testing of the UI, loading states, and error handling.