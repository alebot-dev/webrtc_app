const socket = io("/");
const vidGrid = document.getElementById("video-grid");
const myPeer = new Peer(user.id, {
    host: "/",
    path: "/peer",
    proxied: true
});
const theNewVideo = document.createElement("video");
theNewVideo.muted = true;

const peers = {};

navigator.mediaDevices.getUserMedia({video: true, audio: true})
.then(stream => {
    appendVidStream(theNewVideo, stream);

    myPeer.on("call", peerCall => {
        peerCall.answer(stream);
        const yetAnotherVideo = document.createElement("video");
        peerCall.on("stream", userStream => {
            appendVidStream(yetAnotherVideo, userStream);
        });
    });

    socket.on("userConnected", userID => {
        connectToUser(userID, stream);
    });
});

socket.on("userDisconnected", userID => {
    console.log(userID);
    if (peers[userID]) peers[userID].close();
});

myPeer.on("open", userID => {
    socket.emit("roomJoined", room.id, userID);
});

function connectToUser(userID, stream) {
    const peerCall = myPeer.call(userID, stream);
    const peerVid = document.createElement("video");
    peerCall.on("stream", peerVidStream => {
        appendVidStream(peerVid, peerVidStream);
    });
    peerCall.on("close", () => {
        peerVid.remove();
    });

    peers[userID] = peerCall;
};

function appendVidStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    vidGrid.append(video);
};