using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using System.Net.WebSockets;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Enable default file mapping (index.html, default.html, etc.)
app.UseDefaultFiles();

// Enable static file serving from wwwroot folder
app.UseStaticFiles();

// Enable WebSockets
app.UseWebSockets();

// Initialize WebSocketHandler
var webSocketHandler = new WebSocketHandler();

app.Use(async (context, next) =>
{
    if (context.Request.Path == "/ws" && context.WebSockets.IsWebSocketRequest)
    {
        using WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();
        await webSocketHandler.HandleWebSocketAsync(webSocket);
    }
    else
    {
        await next();
    }
});

app.Run();
