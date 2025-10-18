import MyMongoDB from "./myMongoDB.js";
import { ObjectId } from "mongodb";

const postsDB = MyMongoDB({
  dbName: "9thSeat",
  collectionName: "posts",
});

// Create a new post
export const createPost = async (postData) => {
  const post = {
    ...postData,
    date: new Date(),
    votes: 0,
    comments: [],
    voters: [],
  };
  return await postsDB.insertDocument(post);
};
// Clear and concise insert helper.
// Suggestion: Add input validation or schema enforcement to avoid malformed documents.


// Get posts with pagination
export const getPostsPaginated = async (page = 1, limit = 20, filter = {}) => {
  const { client, collection } = await postsDB.connect();

  try {
    const skip = (page - 1) * limit;

    const posts = await collection
      .find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalCount = await collection.countDocuments(filter);

    return {
      posts,
      hasMore: skip + posts.length < totalCount,
      totalCount,
    };
  } finally {
    await client.close();
  }
};
// Good pagination logic with skip/limit.
// Suggestion: Add projection or indexed query for large datasets to improve performance.


// Get posts by user
export const getUserPosts = async (userEmail, page = 1, limit = 20) => {
  return await getPostsPaginated(page, limit, { userEmail });
};
// Clean wrapper function reusing getPostsPaginated.
// Suggestion: Sanitize or validate userEmail before using it in the query.


// Search posts by title
export const searchPosts = async (searchTerm) => {
  const { client, collection } = await postsDB.connect();

  try {
    const posts = await collection
      .find({
        title: { $regex: searchTerm, $options: "i" },
      })
      .sort({ date: -1 })
      .toArray();

    return posts;
  } finally {
    await client.close();
  }
};
// Simple regex-based search, case-insensitive.
// Note: For larger datasets, consider using a full-text index for efficiency.


// Get a single post by ID
export const getPostById = async (postId) => {
  const { client, collection } = await postsDB.connect();

  try {
    const post = await collection.findOne({ _id: new ObjectId(postId) });
    return post;
  } finally {
    await client.close();
  }
};
// Straightforward document retrieval.
// Suggestion: Add error handling for invalid ObjectId inputs before calling new ObjectId().


// Upvote a post
export const upvotePost = async (postId, userEmail) => {
  const { client, collection } = await postsDB.connect();
  try {
    const result = await collection.updateOne(
      {
        _id: new ObjectId(postId),
        voters: { $ne: userEmail },
      },
      {
        $inc: { votes: 1 },
        $push: { voters: userEmail },
      },
    );
    return result;
  } finally {
    await client.close();
  }
};
// Efficient single update using atomic operations ($inc, $push).
// Suggestion: Consider toggle-based logic (like togglePostVote) to avoid duplicate code.


// Add a comment to a post
export const addCommentToPost = async (postId, { userEmail, text }) => {
  const { client, collection } = await postsDB.connect();
  try {
    const comment = {
      commentId: new ObjectId(),
      parentId: null,
      userEmail,
      text,
      date: new Date(),
      votes: 0,
      voters: [],
    };
    const result = await collection.updateOne(
      { _id: new ObjectId(postId) },
      { $push: { comments: comment } },
    );
    return result;
  } finally {
    await client.close();
  }
};
// Clear structure for comment creation.
// Suggestion: Add validation to prevent empty text or missing userEmail.


// Upvote a comment
export const upvoteComment = async (postId, commentId) => {
  const { client, collection } = await postsDB.connect();
  try {
    const result = await collection.updateOne(
      {
        _id: new ObjectId(postId),
        "comments.commentId": new ObjectId(commentId),
      },
      { $inc: { "comments.$.votes": 1 } },
    );
    return result;
  } finally {
    await client.close();
  }
};
// Simple positional update for embedded comments.
// Suggestion: Ensure indexes on comments.commentId if collection grows large.


// Toggle a user's vote on a post
export const togglePostVote = async (postId, userEmail) => {
  const { client, collection } = await postsDB.connect();
  try {
    // Attempt to remove vote if user already voted
    let result = await collection.updateOne(
      { _id: new ObjectId(postId), voters: userEmail },
      { $inc: { votes: -1 }, $pull: { voters: userEmail } },
    );
    if (result.modifiedCount === 1) {
      return { upvoted: false };
    }

    // Otherwise, add vote
    result = await collection.updateOne(
      { _id: new ObjectId(postId), voters: { $ne: userEmail } },
      { $inc: { votes: 1 }, $push: { voters: userEmail } },
    );
    if (result.modifiedCount === 1) {
      return { upvoted: true };
    }

    return null;
  } finally {
    await client.close();
  }
};
// Well-implemented toggle logic using two-phase update.
// Suggestion: Wrap ObjectId creation in a try/catch to handle invalid IDs gracefully.


// Toggle a user's vote on a comment
export const toggleCommentVote = async (postId, commentId, userEmail) => {
  const { client, collection } = await postsDB.connect();
  try {
    // First, attempt to remove the user's existing vote
    let result = await collection.updateOne(
      { _id: new ObjectId(postId) },
      {
        $inc: { "comments.$[elem].votes": -1 },
        $pull: { "comments.$[elem].voters": userEmail },
      },
      {
        arrayFilters: [
          {
            "elem.commentId": new ObjectId(commentId),
            "elem.voters": userEmail,
          },
        ],
      },
    );
    if (result.modifiedCount === 1) {
      return { upvoted: false };
    }

    // Otherwise, add vote
    result = await collection.updateOne(
      { _id: new ObjectId(postId) },
      {
        $inc: { "comments.$[elem].votes": 1 },
        $push: { "comments.$[elem].voters": userEmail },
      },
      {
        arrayFilters: [
          {
            "elem.commentId": new ObjectId(commentId),
            "elem.voters": { $ne: userEmail },
          },
        ],
      },
    );
    if (result.modifiedCount === 1) {
      return { upvoted: true };
    }

    return null;
  } finally {
    await client.close();
  }
};
// Strong use of arrayFilters for targeting nested elements.
// Suggestion: Ensure MongoDB version >= 3.6 for compatibility.


// Add a reply to a comment
export const addReplyToComment = async (postId, commentId, { userEmail, text }) => {
  const { client, collection } = await postsDB.connect();
  try {
    const replyComment = {
      commentId: new ObjectId(),
      parentId: new ObjectId(commentId),
      userEmail,
      text,
      date: new Date(),
      votes: 0,
      voters: [],
    };
    const result = await collection.updateOne(
      {
        _id: new ObjectId(postId),
        "comments.commentId": new ObjectId(commentId),
      },
      {
        $push: { comments: replyComment },
      },
    );
    return result;
  } finally {
    await client.close();
  }
};
// Uses flat structure for comments/replies, avoiding deep nesting.
// Suggestion: Add text length limits and handle missing post/comment gracefully.


// Update a post
export const updatePost = async (postId, userEmail, updateData) => {
  const { client, collection } = await postsDB.connect();

  try {
    const result = await collection.updateOne(
      {
        _id: new ObjectId(postId),
        userEmail: userEmail,
      },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
    );
    return result.modifiedCount > 0 ? result : null;
  } finally {
    await client.close();
  }
};
// Correct ownership check ensures only post owners can modify posts.
// Suggestion: Add validation for allowed fields in updateData to prevent unsafe overwrites.


// Delete a post
export const deletePost = async (postId, userEmail) => {
  const { client, collection } = await postsDB.connect();
  try {
    const result = await collection.deleteOne({
      _id: ObjectId.createFromHexString(postId),
      userEmail: userEmail,
    });
    return result.deletedCount > 0 ? result : null;
  } finally {
    await client.close();
  }
};
// Ownership validation is clear and safe.
// Suggestion: Handle errors for invalid ObjectId conversion before deleteOne().


// Get top-rated posts
export const getTopRatedPosts = async (page = 1, limit = 20) => {
  const { client, collection } = await postsDB.connect();

  try {
    const skip = (page - 1) * limit;

    const posts = await collection
      .find({})
      .sort({ votes: -1, date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalCount = await collection.countDocuments({});

    return {
      posts,
      hasMore: skip + posts.length < totalCount,
      totalCount,
    };
  } finally {
    await client.close();
  }
};
// Effective query combining sort and pagination.
// Suggestion: Create an index on votes and date for performance improvement.


// Get total post count
export const getTotalPostCount = async () => {
  const { client, collection } = await postsDB.connect();

  try {
    const count = await collection.countDocuments({});
    return count;
  } finally {
    await client.close();
  }
};
// Simple and efficient implementation.
// Suggestion: Could be combined with pagination queries to reduce extra DB calls.

export default postsDB;
