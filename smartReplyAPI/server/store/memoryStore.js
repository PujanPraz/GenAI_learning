const sessions = new Map();

export const memoryStore = {
  // get chat history for a session
  getHistory(sessionId) {
    return sessions.get(sessionId) || [];
  },

  // add a message to history
  addMessage(sessionId, role, content) {
    const history = sessions.get(sessionId) || [];
    history.push({ role, content });
    sessions.set(sessionId, history);
  },

  // clear a session
  clearHistory(sessionId) {
    sessions.delete(sessionId);
  },

  // get all active sessions
  getAllSessions() {
    return [...sessions.keys()];
  },
};
