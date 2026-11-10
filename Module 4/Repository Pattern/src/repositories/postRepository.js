/*
 * PRISMA SWAP EXPLANATION:
 * When swapping this Map-backed repository to a Prisma implementation:
 * 
 * WHAT WILL CHANGE:
 * - Internal implementation: Map CRUD methods (.get, .set, Map values) will be replaced with Prisma Client calls (db.post.findMany, db.post.findUnique, db.post.create, etc.).
 * - Asynchronous operations: Database calls return Promises, so repository methods will become async.
 * 
 * WHAT WILL REMAIN UNCHANGED:
 * - Repository Interface: The standard 5 method signatures (findAll, findById, create, update, remove) stay identical.
 * - Service Layer: postService.js will continue calling these exact repository methods without changing business rules or error handling.
 */

// Private Map store (fulfills the storage-swap requirement)
const postsMap = new Map([
  [1, { id: 1, title: 'First post', body: 'Repository boundaries protect change.', authorId: 7 }],
  [2, { id: 2, title: 'Second post', body: 'Services should speak in domain language.', authorId: 8 }],
]);

let nextId = 3;

function findAll() {
  return Array.from(postsMap.values());
}

function findById(id) {
  return postsMap.get(Number(id)) || null;
}

function create(fields) {
  const post = {
    id: nextId++,
    title: fields.title,
    body: fields.body || '',
    authorId: fields.authorId,
  };
  postsMap.set(post.id, post);
  return post;
}

function update(id, patch) {
  const existing = findById(id);
  if (!existing) return null;

  if (patch.title !== undefined) existing.title = patch.title;
  if (patch.body !== undefined) existing.body = patch.body;

  postsMap.set(existing.id, existing);
  return existing;
}

function remove(id) {
  const numericId = Number(id);
  if (!postsMap.has(numericId)) return false;
  return postsMap.delete(numericId);
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};