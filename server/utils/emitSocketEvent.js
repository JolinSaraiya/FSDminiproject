function emitSocketEvent(req, eventName, payload) {
  const io = req.app.get('io');
  if (io) {
    io.emit(eventName, {
      ...payload,
      createdAt: new Date().toISOString(),
    });
  }
}

module.exports = emitSocketEvent;

