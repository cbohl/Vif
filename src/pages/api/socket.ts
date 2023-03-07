// /* eslint-disable */

import type { Server as HTTPServer } from "http";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as IOServer } from "socket.io";
import type { Socket as NetSocket } from "net";
import { Server, Socket } from "socket.io";
import { Namespace } from "socket.io";

interface SocketServer extends HTTPServer {
  io?: IOServer | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
  hello: () => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

interface SocketServer extends HTTPServer {
  io?: IOServer | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (res.socket) {
    if (res.socket.server.io) {
      console.log("Socket is already attached");
      return res.end();
    }
  }

  if (res.socket) {
    // const io = new Server(res.socket.server);
    const io = new Server<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >(res.socket.server);

    res.socket.server.io = io;

    // types for the namespace named "/my-namespace"
    interface NamespaceSpecificClientToServerEvents {
      foo: (arg: string) => void;
    }

    interface NamespaceSpecificServerToClientEvents {
      bar: (arg: string) => void;
    }

    const myNamespace: Namespace<
      NamespaceSpecificClientToServerEvents,
      NamespaceSpecificServerToClientEvents
    > = io.of("/my-namespace");

    // myNamespace.on("connection", (socket) => {
    //   socket.on("foo", () => {
    //     // ...
    //   });

    //   socket.emit("bar", "123");
    // });

    io.on("connection", (socket: Socket) => {
      // myNamespace.on("connection", (socket: Socket) => {
      console.log(`User Connected :${socket.id}`);

      socket.on("set-gif-to-server", (gifUrl, roomName: string) => {
        console.log("sending gif", gifUrl); // world
        socket.broadcast.to(roomName).emit("new-gif-from-server", gifUrl);
      });

      socket.on("new-peer-to-server", (roomName: string) => {
        console.log("new peer to server!");
        socket.broadcast.to(roomName).emit("new-peer-from-server");
      });

      // Triggered when a peer hits the join room button.
      socket.on("join", (roomName: string) => {
        const { rooms } = io.sockets.adapter;
        const room = rooms.get(roomName);

        // room == undefined when no such room exists.
        if (room === undefined) {
          void socket.join(roomName);
          socket.emit("created");
        } else if (room.size === 1) {
          // room.size == 1 when one person is inside the room.
          void socket.join(roomName);
          socket.emit("joined");
        } else {
          // when there are already two people inside the room.
          socket.emit("full");
        }
        console.log(rooms);
      });

      // Triggered when the person who joined the room is ready to communicate.
      socket.on("ready", (roomName: string) => {
        socket.broadcast.to(roomName).emit("ready"); // Informs the other peer in the room.
      });

      // Triggered when server gets an icecandidate from a peer in the room.
      socket.on(
        "ice-candidate",
        (candidate: RTCIceCandidate, roomName: string) => {
          console.log(candidate);
          socket.broadcast.to(roomName).emit("ice-candidate", candidate); // Sends Candidate to the other peer in the room.
        }
      );

      // Triggered when server gets an offer from a peer in the room.
      socket.on("offer", (offer, roomName: string) => {
        socket.broadcast.to(roomName).emit("offer", offer); // Sends Offer to the other peer in the room.
      });

      // Triggered when server gets an answer from a peer in the room.
      socket.on("answer", (answer, roomName: string) => {
        socket.broadcast.to(roomName).emit("answer", answer); // Sends Answer to the other peer in the room.
      });

      socket.on("leave", (roomName: string) => {
        void socket.leave(roomName);
        socket.broadcast.to(roomName).emit("leave");
      });
    });
    return res.end();
  }
};

export default SocketHandler;
