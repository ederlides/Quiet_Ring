const io = require('socket.io')(3000, {
  cors: { origin: '*' }
});

io.on('connection', socket => {
  console.log('Client connected');

  socket.on('join', (roomId) => {
    console.log(`Joining room ${roomId}`);
    socket.join(roomId);
  });

  socket.on('offer', (offer, roomId) => {
    console.log(`Offer for room ${roomId}`);
    socket.to(roomId).emit('offer', offer);
  });

  socket.on('answer', (answer, roomId) => {
    console.log(`Answer for room ${roomId}`);
    socket.to(roomId).emit('answer', answer);
  });

  socket.on('ice-candidate', (candidate, roomId) => {
    console.log(`ICE Candidate for room ${roomId}`);
    socket.to(roomId).emit('ice-candidate', candidate);
  });
});
