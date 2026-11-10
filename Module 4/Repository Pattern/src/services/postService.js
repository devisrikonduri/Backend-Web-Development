const postRepo = require('../repositories/postRepository');

/**
 * Retrieves all posts from the repository.
 * @returns {Array} List of post objects.
 */
function listPosts() {
  return postRepo.findAll();
}

/**
 * Retrieves a single post by its ID.
 * @param {number|string} id 
 * @returns {Object|null} Post object if found, otherwise null.
 */
function getPost(id) {
  return postRepo.findById(id);
}

/**
 * Enforces business logic/validation and creates a new post via the repository.
 * @param {Object} fields 
 * @returns {Object} Created post object with generated ID.
 */
function createPost(fields) {
  // Business validation rule stays inside the service layer
  if (!fields || !fields.title) {
    const error = new Error('Title is required');
    error.statusCode = 422;
    throw error;
  }

  return postRepo.create(fields);
}

/**
 * Updates an existing post by ID.
 * @param {number|string} id 
 * @param {Object} patch 
 * @returns {Object|null} Updated post object or null if not found.
 */
function updatePost(id, patch) {
  return postRepo.update(id, patch);
}

/**
 * Removes a post by ID.
 * @param {number|string} id 
 * @returns {boolean} True if deleted, false if not found.
 */
function removePost(id) {
  return postRepo.remove(id);
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  updatePost,
  removePost,
};