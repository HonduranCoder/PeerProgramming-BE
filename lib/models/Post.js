const pool = require('../utils/pool');

module.exports = class Post {
  postId;
  postedBy;
  title;
  code;
  question;
  created;
  username;
  avatar;
  github;
  repos;
  bio;
  favorite;

  constructor(row) {
    this.postId = row.post_id;
    this.postedBy = row.posted_by;
    this.title = row.title;
    this.code = row.code;
    this.question = row.question;
    this.created = row.created;
    this.username = row.username;
    this.avatar = row.avatar;
    this.github = row.github;
    this.repos = row.repos;
    this.bio = row.bio;
    this.favorite = row.favorite;
  }

  static async insert({ postedBy, title, code, question }) {
    const { rows } = await pool.query(
      `INSERT INTO posts (posted_by, title, code, question)
      VALUES($1, $2, $3, $4)
      RETURNING *`,
      [postedBy, title, code, question]
    );
    return new Post(rows[0]);
  }

  static async getAll() {
    const { rows } = await pool.query(`
        SELECT users.avatar, users.github, users.username, posts.post_id, posts.posted_by, posts.title, posts.question, posts.code, posts.created FROM posts
        LEFT JOIN users on users.user_id=posts.posted_by 
        `);

    return rows.map((row) => new Post(row));
  }

  static async getById(postId) {
    const { rows } = await pool.query(
      `
        SELECT users.avatar, users.github, users.repos, users.bio, posts.* 
        FROM posts 
        LEFT JOIN users on users.user_id=posts.posted_by
        WHERE post_id=$1
      `,
      [postId]
    );

    if (!rows[0]) return null;
    return new Post(rows[0]);
  }

  static async update(postId, { title, code, question }) {
    const { rows } = await pool.query(
      `
      UPDATE posts 
      SET title=$2, code=$3, question=$4
      from users 
      WHERE users,user_id=posts.posted_by
      AND post_id=$1
      RETURNING *`,
      [postId, title, code, question]
    );
    return new Post(rows[0]);
  }

  static async delete(postId) {
    const { rows } = await pool.query(
      `
    DELETE FROM posts WHERE post_id=$1
    RETURNING *`,
      [postId]
    );
    if (!rows[0]) return null;
    return new Post(rows[0]);
  }

  static async getAllByUsername(username) {
    const { rows } = await pool.query(
      `
    SELECT users.*, posts.*
    FROM posts 
    LEFT JOIN users on users.user_is = posts.posted_by 
    WHERE users.github = $1
    `,
      [username]
    );

    return rows.map((row) => new Post(row));
  }

  static async favoriteComment(commentId, postId) {
    const { rows } = await pool.query(
      `
    UPDATE posts 
    SET favorite=$2
    WHERE post_id=$1
    RETURNING *`,
      [postId, commentId]
    );
    return new Post(rows[0]);
  }
};
