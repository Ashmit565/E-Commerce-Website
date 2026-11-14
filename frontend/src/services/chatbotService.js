import api from './api';

export const chatbotService = {
  /**
   * Send a message to ShopBot
   */
  async sendMessage(message, conversationId = null, context = {}) {
    const res = await api.post('/chatbot/message', {
      message,
      conversation_id: conversationId,
      context
    });
    return res.data;
  },

  /**
   * Execute a confirmed action (e.g. user confirmed adding item to cart)
   */
  async executeAction(action, payload = {}, conversationId = null) {
    const res = await api.post('/chatbot/action', {
      action,
      payload,
      conversation_id: conversationId
    });
    return res.data;
  },

  /**
   * Reset conversation memory
   */
  async resetConversation(conversationId) {
    const res = await api.post('/chatbot/reset', {
      conversation_id: conversationId
    });
    return res.data;
  },

  /**
   * Fetch contextual quick actions based on user state
   */
  async getQuickActions() {
    const res = await api.get('/chatbot/quick-actions');
    return res.data;
  }
};

