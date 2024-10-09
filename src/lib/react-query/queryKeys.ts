export enum QUERY_KEYS {
  // POST KEYS
  GET_RECENT_POSTS = "getRecentPosts",
  GET_POSTS = "getPosts",
  GET_POST_BY_ID = "getPostById",
  GET_INFINITE_POSTS = "getInfinitePosts",
  GET_USERS = "getUsers",

  // USER KEYS
  GET_CURRENT_USER = "getCurrentUser",
  GET_USER_BY_USERNAME = "findUserByUsername",

  //  SEARCH KEYS
  SEARCH_POSTS = "getSearchPosts",
  GET_USER_POSTS = "getUserPosts",
  GET_SAVED_POSTS = "getSavedPosts",

  //  CONVERSATION KEYS
  GET_RECENT_CONVERSATIONS = "getRecentCoversations",
  GET_CONVERSATION_MSGS = "getConversationMsgs",
}
