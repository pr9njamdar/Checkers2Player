// socket.js

// Initialize the WebSocket connection
const socket = new WebSocket('ws://localhost:5064/ws');

// Handle connection open
socket.onopen = function(event) {
    console.log('WebSocket connection opened:', event);
};

// Handle incoming messages
socket.onmessage = function(event) {
    console.log('Message from server:', event.data);
};

// Handle errors
socket.onerror = function(error) {
    console.error('WebSocket error:', error);
};

// Handle connection close
socket.onclose = function(event) {
    console.log('WebSocket connection closed:', event);
};

// Function to send messages to the server
function sendMessage(message) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(message);
    } else {
        console.error('WebSocket is not open. Message not sent:', message);
    }
}

// Export the sendMessage function
export { sendMessage };
