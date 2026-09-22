"use client";

import { useEffect, useMemo, useState } from "react";

type Friend = {
  id: string;
  name: string;
  status: "online" | "busy" | "offline";
  code: string;
};

type Room = {
  id: string;
  name: string;
  code: string;
  members: string[];
  messages: { id: string; sender: string; text: string; time: string }[];
};

type User = {
  id: string;
  name: string;
  code: string;
  avatar: string;
};

const seededFriends: Friend[] = [
  { id: "f1", name: "Ava", status: "online", code: "AVA-42" },
  { id: "f2", name: "Noah", status: "busy", code: "NOA-92" },
  { id: "f3", name: "Mila", status: "offline", code: "MIL-18" },
];

const seededRequests = [
  { id: "r1", name: "Jules", note: "Wants to play games after class" },
  { id: "r2", name: "Kai", note: "Suggested a study room for tonight" },
];

const seededRooms: Room[] = [
  {
    id: "room-1",
    name: "Late Night Hangout",
    code: "ROOM-99",
    members: ["Me", "Ava", "Noah"],
    messages: [
      { id: "m1", sender: "Ava", text: "Ready for the movie night?", time: "8:14 PM" },
      { id: "m2", sender: "Me", text: "Yep, I’m bringing snacks.", time: "8:15 PM" },
      { id: "m3", sender: "Noah", text: "I’m in. Nick’s playlist is crunchy.", time: "8:16 PM" },
    ],
  },
  {
    id: "room-2",
    name: "Design Sprint",
    code: "ROOM-77",
    members: ["Me", "Mila"],
    messages: [{ id: "m4", sender: "Mila", text: "Let’s lock the landing page by 9 PM.", time: "Yesterday" }],
  },
];

const defaultUser: User = {
  id: "me-001",
  name: "You",
  code: "YOU-77",
  avatar: "Y",
};

export default function HomePage() {
  const [user, setUser] = useState<User>(defaultUser);
  const [friends, setFriends] = useState<Friend[]>(seededFriends);
  const [friendRequests, setFriendRequests] = useState(seededRequests);
  const [rooms, setRooms] = useState<Room[]>(seededRooms);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(seededRooms[0].id);
  const [newFriendCode, setNewFriendCode] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [draft, setDraft] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [username, setUsername] = useState("You");

  useEffect(() => {
    const stored = localStorage.getItem("dicordchat-demo");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed.user ?? defaultUser);
      setFriends(parsed.friends ?? seededFriends);
      setFriendRequests(parsed.friendRequests ?? seededRequests);
      setRooms(parsed.rooms ?? seededRooms);
      setSelectedRoomId(parsed.selectedRoomId ?? seededRooms[0].id);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "dicordchat-demo",
      JSON.stringify({ user, friends, friendRequests, rooms, selectedRoomId })
    );
  }, [user, friends, friendRequests, rooms, selectedRoomId]);

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId) ?? rooms[0],
    [rooms, selectedRoomId]
  );

  const addFriendByCode = () => {
    const code = newFriendCode.trim().toUpperCase();
    if (!code) return;

    const existing = friends.some((friend) => friend.code === code);
    if (!existing && code !== user.code) {
      const newFriend: Friend = {
        id: `f-${Date.now()}`,
        name: code.split("-")[0].toLowerCase().replace(/^./, (v) => v.toUpperCase()),
        status: "online",
        code,
      };
      setFriends((prev) => [newFriend, ...prev]);
      setNewFriendCode("");
    }
  };

  const acceptRequest = (requestId: string) => {
    const request = friendRequests.find((item) => item.id === requestId);
    if (!request) return;

    const friend: Friend = {
      id: `f-${Date.now()}`,
      name: request.name,
      status: "online",
      code: `${request.name.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 90 + 10)}`,
    };

    setFriends((prev) => [friend, ...prev]);
    setFriendRequests((prev) => prev.filter((item) => item.id !== requestId));
  };

  const createRoom = () => {
    const name = newRoomName.trim();
    if (!name) return;

    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name,
      code: `ROOM-${Math.floor(Math.random() * 900 + 100)}`,
      members: [user.name, "Guest"],
      messages: [{ id: `msg-${Date.now()}`, sender: "System", text: `${user.name} created this room.`, time: "Now" }],
    };

    setRooms((prev) => [newRoom, ...prev]);
    setSelectedRoomId(newRoom.id);
    setNewRoomName("");
  };

  const joinRoom = () => {
    const code = joinRoomCode.trim().toUpperCase();
    if (!code) return;

    const match = rooms.find((room) => room.code === code);
    if (match) {
      setSelectedRoomId(match.id);
      setJoinRoomCode("");
    }
  };

  const sendMessage = () => {
    const text = draft.trim();
    if (!text || !selectedRoom) return;

    const message = {
      id: `m-${Date.now()}`,
      sender: user.name,
      text,
      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    };

    setRooms((prev) =>
      prev.map((room) =>
        room.id === selectedRoom.id
          ? { ...room, messages: [...room.messages, message] }
          : room
      )
    );
    setDraft("");
  };

  const signIn = () => {
    const name = username.trim() || "You";
    const nextUser: User = {
      ...user,
      name,
      avatar: name.slice(0, 1).toUpperCase(),
    };
    setUser(nextUser);
    setIsSignedIn(true);
  };

  return (
    <main className="page-shell">
      {!isSignedIn ? (
        <section className="auth-panel">
          <div className="auth-card">
            <p className="eyebrow">Join the fastest friend chat</p>
            <h1>DicordChat</h1>
            <p className="subtitle">Talk with friends, manage requests, and jump into rooms with a single invite code.</p>

            <label>
              Pick a name
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your name" />
            </label>

            <button className="primary" onClick={signIn}>Start chatting</button>
          </div>
        </section>
      ) : (
        <div className="app-shell">
          <aside className="sidebar">
            <div className="brand-row">
              <div className="brand-badge">D</div>
              <div>
                <strong>DicordChat</strong>
                <small>social space</small>
              </div>
            </div>

            <div className="profile-card">
              <div className="avatar">{user.avatar}</div>
              <div>
                <h3>{user.name}</h3>
                <span>Code: {user.code}</span>
              </div>
            </div>

            <div className="side-section">
              <div className="section-header">
                <span>Friends</span>
                <span>{friends.length}</span>
              </div>
              {friends.map((friend) => (
                <div className="mini-user" key={friend.id}>
                  <div className={`dot ${friend.status}`} />
                  <div>
                    <strong>{friend.name}</strong>
                    <small>{friend.code}</small>
                  </div>
                </div>
              ))}
            </div>

            <div className="side-section">
              <div className="section-header ">
                <span>Requests</span>
                <span>{friendRequests.length}</span>
              </div>
              {friendRequests.map((request) => (
                <div className="request-card" key={request.id}>
                  <div>
                    <strong>{request.name}</strong>
                    <small>{request.note}</small>
                  </div>
                  <button onClick={() => acceptRequest(request.id)}>Accept</button>
                </div>
              ))}
            </div>
          </aside>

          <section className="content">
            <div className="topbar">
              <div>
                <p className="eyebrow">Your community</p>
                <h2>Chat and rooms</h2>
              </div>
              <button className="ghost" onClick={() => setIsSignedIn(false)}>Switch user</button>
            </div>

            <div className="stats-row">
              <div className="stat-card">
                <span>Online now</span>
                <strong>{friends.filter((f) => f.status === "online").length + 1}</strong>
              </div>
              <div className="stat-card">
                <span>Room invites</span>
                <strong>{rooms.length}</strong>
              </div>
              <div className="stat-card">
                <span>Friend codes</span>
                <strong>{friends.length}</strong>
              </div>
            </div>

            <div className="panel-grid">
              <div className="panel">
                <div className="panel-header">
                  <h3>Add friend</h3>
                </div>
                <div className="input-row">
                  <input value={newFriendCode} onChange={(e) => setNewFriendCode(e.target.value)} placeholder="Enter friend code" />
                  <button className="primary" onClick={addFriendByCode}>Add</button>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <h3>Create room</h3>
                </div>
                <div className="input-row">
                  <input value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} placeholder="Room name" />
                  <button className="primary" onClick={createRoom}>Create</button>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <h3>Join room</h3>
                </div>
                <div className="input-row">
                  <input value={joinRoomCode} onChange={(e) => setJoinRoomCode(e.target.value)} placeholder="Room code" />
                  <button className="primary" onClick={joinRoom}>Join</button>
                </div>
              </div>
            </div>

            <div className="chat-shell">
              <div className="room-list">
                <div className="panel-header">
                  <h3>Rooms</h3>
                </div>
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    className={`room-item ${selectedRoom?.id === room.id ? "active" : ""}`}
                    onClick={() => setSelectedRoomId(room.id)}
                  >
                    <div>
                      <strong>{room.name}</strong>
                      <small>{room.code}</small>
                    </div>
                    <span>{room.messages.length}</span>
                  </button>
                ))}
              </div>

              <div className="chat-box">
                <div className="chat-header">
                  <div>
                    <h3>{selectedRoom?.name}</h3>
                    <span>{selectedRoom?.code}</span>
                  </div>
                  <div className="members-pill">{selectedRoom?.members.length} members</div>
                </div>

                <div className="messages">
                  {selectedRoom?.messages.map((message) => (
                    <div key={message.id} className={`message ${message.sender === user.name ? "mine" : ""}`}>
                      <div className="message-meta">
                        <strong>{message.sender}</strong>
                        <span>{message.time}</span>
                      </div>
                      <p>{message.text}</p>
                    </div>
                  ))}
                </div>

                <div className="composer">
                  <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type your message..." />
                  <button className="primary" onClick={sendMessage}>Send</button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
