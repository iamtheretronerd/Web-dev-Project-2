import MyMongoDB from "./myMongoDB.js";

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

export default postsDB;
