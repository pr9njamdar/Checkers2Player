using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;


public class WebSocketHandler
{
    private ConcurrentDictionary<string, WebSocket> ConnectedClients;
    public WebSocketHandler()
    {
        ConnectedClients = new ConcurrentDictionary<string, WebSocket>(); // Initialize the dictionary for connected clients
    }
    public async Task HandleWebSocketAsync(WebSocket webSocket)
    {
        byte[] buffer = new byte[1024];
        //Console.WriteLine("Client connected");

        while (webSocket.State == WebSocketState.Open)
        {
            var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

            if (result.MessageType == WebSocketMessageType.Close)
            {
                await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
                foreach (var kvp in ConnectedClients)
                {
                    if (kvp.Value == webSocket)
                    {
                        //Console.WriteLine(kvp.Key);
                        ConnectedClients.TryRemove(kvp.Key, out _);
                    }
                    else
                    {

                    }
                }

            }
            else
            {
                var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
               
                // handle messages here
                if (message.StartsWith("Hello"))
                {
                    await SendMessage("Reg", webSocket);
                }
                else if (message.StartsWith("RegisterId : "))
                {
                    var id = message.Substring(13);
                    //Console.WriteLine(id);
                    ConnectedClients.TryAdd(id, webSocket);
                }
                else if (message.StartsWith("Update : "))
                {
                    var Update = message.Substring(9);
                     //Console.WriteLine(Update);
                    if (Update.StartsWith("{") && Update.EndsWith("}"))
                    {
                        Console.WriteLine(Update);
                        try
                        {
                            var data = JsonSerializer.Deserialize<Dictionary<string, object>>(Update);
                            var id=data["oppid"].ToString();
                            Console.WriteLine(id);
                            WebSocket OpponentWs=ConnectedClients[id];
                            await SendMessage(message,OpponentWs);
                        }
                        catch (JsonException ex)
                        {
                            Console.WriteLine($"Failed to deserialize JSON: {ex.Message}");
                        }
                    }

                }
                else if( message.StartsWith("Verify : ")){
                    
                    var  info = JsonSerializer.Deserialize<Dictionary<string, object>>(message.Substring(9));
                    //Console.WriteLine(id);
                    
                    foreach(var kvp in ConnectedClients){
                        
                        if(Equals(info["oppid"].ToString(),kvp.Key)){
                            //Console.WriteLine(id);
                            await SendMessage("Verified id",webSocket);
                            await SendMessage("ConnectedWithId "+info["playerid"],kvp.Value);

                        }
                    }

                }


            }
        }



    }

    async Task SendMessage(String message, WebSocket ws)
    {
        var serverBuffer = Encoding.UTF8.GetBytes(message);
        await ws.SendAsync(new ArraySegment<byte>(serverBuffer), WebSocketMessageType.Text, true, CancellationToken.None);
        //Console.WriteLine("Sent " + message + " to client");

    }




}
