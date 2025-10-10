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
    // Cast the incoming postId string into an ObjectId.  If the
    // provided id is invalid, this will throw and get caught by the
    // calling function.
    const post = await collection.findOne({ _id: new ObjectId(postId) });
    return post;
  } finally {
    await client.close();
  }
};

// Post voting and commenting helpers
/**
 * Increment the vote counter on a post if the given user has not already
 * voted. This uses the $ne operator to ensure the userEmail is not
 * already present in the voters array, then uses $inc and $push atomically.
 *
 * @param {string} postId The ID of the post being upvoted
 * @param {string} userEmail The email of the user performing the vote
 * @returns {object} The result of the updateOne operation
 */
export const upvotePost = async (postId, userEmail) => {
  const { client, collection } = await postsDB.connect();
  try {
    const result = await collection.updateOne(
      {
        _id: new ObjectId(postId),
        // only match documents where the voters array does not already
        // contain this user. If the voter is present, modifiedCount will
        // remain 0 and the route can return an appropriate message.
        voters: { $ne: userEmail },
      },
      {
        $inc: { votes: 1 },
        $push: { voters: userEmail },
      }
    );
    return result;
  } finally {
    await client.close();
  }
};

/**
 * Append a new comment to the comments array of a post. Each comment
 * receives its own commentId, author, text, timestamp, vote count and
 * empty replies array. The $push operator will create the comments
 * array if it doesn't exist【796652227629499†L102-L106.
 *
 * @param {string} postId The ID of the post to add a comment to
 * @param {object} commentFields An object with userEmail and text
 */
export const addCommentToPost = async (postId, { userEmail, text }) => {
  const { client, collection } = await postsDB.connect();
  try {
    const comment = {
      commentId: new ObjectId(),
      userEmail,
      text,
      date: new Date(),
      votes: 0,
      // track voters for each comment so that users can only upvote
      // a comment once and can toggle their vote
      voters: [],
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

/**
 * Increment the vote count on a comment embedded in a post.  Uses the
 * positional $ operator to target the specific comment within the
 * comments array【179960199388456†L1050-L1056】.
 *
 * @param {string} postId The ID of the parent post
 * @param {string} commentId The ID of the comment to upvote
 * @returns {object} The result of the updateOne operation
 */
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

/**
 * Toggle a user's vote on a post.  If the user has already voted, the
 * vote is removed and the vote count is decremented.  Otherwise, the
 * vote is added and the count incremented.  Returns an object
 * indicating whether the post is now upvoted by the user.
 *
 * @param {string} postId The post ID
 * @param {string} userEmail The voter's email
 */
export const togglePostVote = async (postId, userEmail) => {
  const { client, collection } = await postsDB.connect();
  try {
    // First attempt to remove the user's vote.  This only matches
    // documents where the voters array contains the email.
    let result = await collection.updateOne(
      { _id: new ObjectId(postId), voters: userEmail },
      { $inc: { votes: -1 }, $pull: { voters: userEmail } }
    );
    if (result.modifiedCount === 1) {
      return { upvoted: false };
    }
    // If no vote was removed, try to add a new vote.  Only matches
    // documents where the email is not already present.
    result = await collection.updateOne(
      { _id: new ObjectId(postId), voters: { $ne: userEmail } },
      { $inc: { votes: 1 }, $push: { voters: userEmail } }
    );
    if (result.modifiedCount === 1) {
      return { upvoted: true };
    }
    // If still no change, the post may not exist.  Return null.
    return null;
  } finally {
    await client.close();
  }
};

/**
 * Toggle a user's vote on a comment nested inside a post.  If the
 * user has already voted on the comment, their vote is removed and
 * the count decremented; otherwise, their vote is added.  Returns
 * whether the comment is now upvoted by the user.
 *
 * @param {string} postId The parent post ID
 * @param {string} commentId The comment ID
 * @param {string} userEmail The voter's email
 */
export const toggleCommentVote = async (postId, commentId, userEmail) => {
  const { client, collection } = await postsDB.connect();
  try {
    // To avoid unintentionally affecting other comments, use the filtered
    // positional operator ($[elem]) with arrayFilters. This ensures that
    // only the comment matching the provided commentId is updated. First,
    // attempt to remove the user's vote from the comment if it exists.
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
            // Only match elements where the user has already voted
            "elem.voters": userEmail,
          },
        ],
      }
    );
    if (result.modifiedCount === 1) {
      // Vote removed (unvoted)
      return { upvoted: false };
    }

    // If no vote was removed, attempt to add the user's vote to the
    // specified comment. Only match elements where the user is not
    // already in the voters array.
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
      }
    );
    if (result.modifiedCount === 1) {
      return { upvoted: true };
    }
    // If no match found, return null (comment may not exist)
    return null;
  } finally {
    await client.close();
  }
};

export default postsDB;
