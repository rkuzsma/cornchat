export default {
  roomId: () => window.HC.ApplicationStore.data.active_chat,
  userId: () => window.HC.ApplicationStore.data.config.user_id,
  oauthToken: () => window.HC.ApplicationStore.data.config.oauth_token
}
