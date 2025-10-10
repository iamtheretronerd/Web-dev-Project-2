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
  };
  return await postsDB.insertDocument(post);
};

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

// Get posts by user
export const getUserPosts = async (userEmail, page = 1, limit = 20) => {
  return await getPostsPaginated(page, limit, { userEmail });
};

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

// Get a single post by ID
export const getPostById = async (postId) => {
  const { client, collection } = await postsDB.connect();

  try {
    // import at top const { ObjectId } = await import("mongodb");
    const post = await collection.findOne({ _id: new ObjectId(postId) });
    return post;
  } finally {
    await client.close();
  }
};

// Upvote a post by ID
export const upvotePost = async postId => {
  const { client, collection } = await postsDB.connect();
  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(postId) },
      { $inc: { votes: 1 } }
    );
    return result;
  } finally {
    await client.close();
  }
};

// Add a comment with its onw commentId, author email, text, timestamp, 
// and an empty array for replies, use mongoDB $push operator to appet it to the comments aray of post

export const addCommentToPost = async (postId, { userEmail, text }) => {
  const { client, collection } = await postsDB.connect();
  try {
    const comment = {
      commentId: new ObjectId(),
      userEmail,
      text,
      date: new Date(),
      votes: 0,
      replies: [],
    };
    const result = await collection.updateOne(
      { _id: new ObjectId(postId) },
      { $push: { comments: comment } }
    );
    return result;
  } finally {
    await client.close();
  }
};

// Upvote a comment, uses positional $ operator to increment a nested comment's votes field
export const upvoteComment = async (postId, commentId) => {
  const { client, collection } = await postsDB.connect();
  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(postId), "comments.commentId": new ObjectId(commentId) },
      { $inc: { "comments.$.votes": 1 } }
    );
    return result;
  } finally {
    await client.close();
  }
};

export default postsDB;
