# Zoof

## Summary

Zoof is a web app for video chat with GIFs. Users can select a room number on the index page and invite their friend to join. Then, they will have a video chat with access to GIFs through the Giphy API.

## Technologies Used

- Next.js
- WebRTC
- WebSockets (through the Socket.io library)
- Giphy API
- Hosted via Vercel

## Challenges and Techniques

- In order to keep the Giphy API key a secret, this app routes API requests to Giphy through the app's own server, rather than directly from the client.

- When a user clicks on a GIF, both the user's page and the peer's page must update. The useState React hook updates the user's DOM and the useRef React hook retains the URL of the GIF. Then, WebSocket allows event-driven events, so the URL can be to the server and then to the peer immediately.

## Acknowledgements

There were two sources that were instrumental in creating this app. Both were heavily modified and customized in order to fit with this project.

First, the article ["Peer-to-peer video call with Next.js, Socket.io and Native WebRTC APIs"](https://www.stackfive.io/work/webrtc/peer-to-peer-video-call-with-next-js-socket-io-and-native-webrtc-apis) by Tauqueer Khan. Working through this tutorial provided a skeleton of a video chat app in Next.js.

Second, the project ["GIPHY Search API with CSS Grid & Flexbox"](https://gist.github.com/Quincy2002/44a564a0da1672570205dea3cb71379d) by Quincy2002. This provided a basis for the Giphy search.

## Feature Wishlist

- Privacy via user accounts or room specific passwords.
- Code type checking by converting JavaScript files to TypeScript.
