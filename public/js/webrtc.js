// Photobooth Lifmar - WebRTC video call (PeerJS)
// Kelola peer connection, local & remote stream, kamera flip

const LifmarWebRTC = (() => {
  let peer = null;
  let localStream = null;
  let remoteStream = null;
  let call = null;
  let peerId = null;
  let facing = 'user'; // user = depan, environment = belakang (default depan untuk narsis)
  let isInitiator = false;

  async function init() {
    localStream = await getUserMedia();
    LifmarReplay.prepare(localStream);
    const localVideo = document.getElementById('localVideo');
    const stageVideo = document.getElementById('stageVideo');
    localVideo.srcObject = localStream;
    stageVideo.srcObject = localStream;
    return localStream;
  }

  async function getUserMedia() {
    const constraints = {
      video: { facingMode: facing },
      audio: true,
    };
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (e) {
      // fallback tanpa facingMode
      return await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    }
  }

  function connectPeer(id) {
    peerId = id;
    peer = new Peer(id);
    peer.on('open', (myId) => {
      console.log('peer open:', myId);
      window.LifmarState.peerId = myId;
      // Host = yang buka pertama, dia yang call
      document.dispatchEvent(new CustomEvent('peer-ready'));
    });
    peer.on('call', (incomingCall) => {
      incomingCall.answer(localStream);
      incomingCall.on('stream', (remote) => {
        setRemoteStream(remote);
      });
      call = incomingCall;
    });
    peer.on('error', (err) => {
      if (err.type !== 'peer-unavailable') console.error('Peer error:', err);
    });
  }

  // Host memanggil guest -> host harus tahu peerId guest
  function startCall(remotePeerId) {
    if (!peer) return;
    call = peer.call(remotePeerId, localStream);
    call.on('stream', (remote) => setRemoteStream(remote));
    call.on('close', () => {});
  }

  function setRemoteStream(stream) {
    remoteStream = stream;
    const remoteVideo = document.getElementById('remoteVideo');
    remoteVideo.srcObject = stream;
    const waiting = document.getElementById('waitingText');
    if (waiting) waiting.style.display = 'none';
  }

  async function flip() {
    facing = facing === 'user' ? 'environment' : 'user';
    // stop semua track lalu restart
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    localStream = await getUserMedia();
    LifmarReplay.prepare(localStream);
    document.getElementById('localVideo').srcObject = localStream;
    document.getElementById('stageVideo').srcObject = localStream;
    // restart call dengan stream baru
    if (call) {
      // replace track pada sender
      const videoSender = call.peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
      const newTrack = localStream.getVideoTracks()[0];
      if (videoSender && newTrack) videoSender.replaceTrack(newTrack);
      const audioSender = call.peerConnection.getSenders().find(s => s.track && s.track.kind === 'audio');
      const newAudio = localStream.getAudioTracks()[0];
      if (audioSender && newAudio) audioSender.replaceTrack(newAudio);
    }
    return facing;
  }

  function getLocalStream() { return localStream; }
  function getPeerId() { return peerId; }
  function hasRemote() { return !!remoteStream; }

  return { init, connectPeer, startCall, flip, getLocalStream, getPeerId, hasRemote };
})();
