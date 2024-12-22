'use client'

import React, { useEffect, useRef, useState } from 'react'
import './App.css'

interface Message {
  text: string;
  sender: 'user' | 'other';
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [room, setRoom] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const roomInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const message = event.data;
      setMessages(prevMessages => [...prevMessages, { text: message, sender: 'other' }]);
    }

    return () => {
      ws.close();
    }
  }, [])

  const joinRoom = () => {
    const roomId = roomInputRef.current?.value;
    if (roomId && wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: "join",
        payload: {
          roomId: roomId
        }
      }));
      setRoom(roomId);
    }
  }

  const sendMessage = () => {
    const message = inputRef.current?.value;
    if (message && wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: "chat",
        payload: {
          message: message
        }
      }));
      setMessages(prevMessages => [...prevMessages, { text: message, sender: 'user' }]);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-zinc-950 border-b border-zinc-800">
        <h1 className="text-zinc-200 text-xl font-semibold p-4 text-center">
          ChatApp
        </h1>
      </div>

      <div className="p-4">
        <div className="max-w-2xl mx-auto">
          {!room && (
            <div className="mb-4 flex gap-2">
              <input
                ref={roomInputRef}
                className="flex-1 bg-zinc-950 text-zinc-200 rounded-lg px-4 py-3 
                            focus:outline-none focus:ring-1 focus:ring-zinc-800 transition-all
                            placeholder-zinc-500 border border-zinc-800"
                placeholder="Enter room ID"
              />
              <button
                onClick={joinRoom}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg 
                          px-6 py-3 transition-colors shadow-sm"
              >
                Join Room
              </button>
            </div>
          )}

          {room && (
            <>
              <div className="bg-zinc-950 rounded-lg border border-zinc-800 p-4 mb-4">
                <div className="h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                  {messages.map((message, index) => (
                    <div key={index} className={`mb-4 animate-fade-in ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block rounded-lg px-4 py-2 max-w-[80%] break-words shadow-sm
                                      ${message.sender === 'user' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-zinc-700 text-zinc-200'}`}>
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  className="flex-1 bg-zinc-950 text-zinc-200 rounded-lg px-4 py-3 
                              focus:outline-none focus:ring-1 focus:ring-zinc-800 transition-all
                              placeholder-zinc-500 border border-zinc-800"
                  placeholder="Type your message..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendMessage();
                    }
                  }}
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg 
                            px-6 py-3 transition-colors shadow-sm"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

