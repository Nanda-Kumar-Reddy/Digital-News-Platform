PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  is_premium INTEGER DEFAULT 0,
  preferred_language TEXT DEFAULT 'en',
  created_at TEXT DEFAULT (datetime('now'))
);


CREATE TABLE IF NOT EXISTS notification_settings (
  user_id INTEGER PRIMARY KEY,
  breaking INTEGER DEFAULT 1,
  daily INTEGER DEFAULT 1,
  personalized INTEGER DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  device_token TEXT NOT NULL,
  platform TEXT CHECK(platform IN ('android','ios','web')) NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, device_token),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS authors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  bio TEXT,
  designation TEXT,
  email TEXT UNIQUE,
  twitter TEXT,
  profile_image TEXT,
  verified INTEGER DEFAULT 0,
  total_articles INTEGER DEFAULT 0,
  followers INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);


CREATE TABLE IF NOT EXISTS author_follows (
  user_id INTEGER NOT NULL,
  author_id INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, author_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  priority INTEGER DEFAULT 0
);


CREATE TABLE IF NOT EXISTS subcategories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  UNIQUE(category_id, slug),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  headline TEXT NOT NULL,
  subheadline TEXT,
  summary TEXT,
  content TEXT NOT NULL,
  category_id INTEGER NOT NULL,
  subcategory_id INTEGER,
  article_type TEXT CHECK(article_type IN ('news','opinion','editorial')) DEFAULT 'news',
  image_url TEXT,
  image_caption TEXT,
  view_count INTEGER DEFAULT 0,
  is_premium INTEGER DEFAULT 0,
  published_at TEXT,
  updated_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL
);


CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS article_tags (
  article_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (article_id, tag_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS article_authors (
  article_id INTEGER NOT NULL,
  author_id INTEGER NOT NULL,
  is_primary INTEGER DEFAULT 0,
  PRIMARY KEY (article_id, author_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  parent_id INTEGER,
  comment TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  status TEXT CHECK(status IN ('visible','hidden','flagged')) DEFAULT 'visible',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS comment_votes (
  user_id INTEGER NOT NULL,
  comment_id INTEGER NOT NULL,
  vote INTEGER NOT NULL CHECK (vote IN (1, -1)),
  created_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, comment_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS bookmark_collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, name),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookmarks (
  user_id INTEGER NOT NULL,
  article_id INTEGER NOT NULL,
  collection_id INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, article_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (collection_id) REFERENCES bookmark_collections(id) ON DELETE SET NULL
);


CREATE TABLE IF NOT EXISTS reading_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  article_id INTEGER NOT NULL,
  read_seconds INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  features TEXT
);


CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  plan_id INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT CHECK(status IN ('active','expired','cancelled')) DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  plan_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  txn_id TEXT UNIQUE NOT NULL,
  status TEXT CHECK(status IN ('success','failed','pending')) NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS breaking_news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  article_id INTEGER,
  priority INTEGER DEFAULT 0,
  push INTEGER DEFAULT 0,
  expires_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE SET NULL
);


CREATE TABLE IF NOT EXISTS polls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  show_results INTEGER DEFAULT 1,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS poll_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  poll_id INTEGER NOT NULL,
  text TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS poll_votes (
  user_id INTEGER NOT NULL,
  poll_id INTEGER NOT NULL,
  option_id INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, poll_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
  FOREIGN KEY (option_id) REFERENCES poll_options(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT CHECK(type IN ('photo','video')) NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  credit TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);


CREATE TABLE IF NOT EXISTS epaper_editions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  city TEXT NOT NULL,
  pages INTEGER NOT NULL,
  download_url TEXT NOT NULL
);
