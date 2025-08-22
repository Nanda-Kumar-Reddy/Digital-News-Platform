INSERT OR IGNORE INTO categories (name, slug, priority) VALUES
('India','india',1), ('Business','business',2), ('Sports','sports',3), ('World','world',4);

INSERT OR IGNORE INTO subcategories (category_id, name, slug) VALUES
(2,'Economy','economy'), (3,'Cricket','cricket');

INSERT OR IGNORE INTO authors (name, bio, designation, email, twitter, verified)
VALUES ('Jane Smith','Award-winning journalist','Senior Economic Correspondent','jane@news.com','@jane',1),
       ('A. Reporter','Sports journalist','Sports Desk','reporter@news.com','@sportsrep',1);

INSERT OR IGNORE INTO tags (name) VALUES ('economy'), ('policy'), ('reform'), ('cricket');



INSERT OR IGNORE INTO plans (name, price, duration_days, features)
VALUES ('Monthly Premium', 99, 30, 'Ad-free, Exclusive articles, E-paper');

INSERT OR IGNORE INTO articles (headline, subheadline, summary, content, category_id, subcategory_id, article_type, image_url, published_at, is_premium)
VALUES
('Major Economic Reform Announced','New policies to boost growth','Govt unveils policy...','Full article content ...', 2, 1, 'news', NULL, datetime('now','-1 day'), 0),
('Breaking: Major Sports Victory', NULL, 'Historic win...', 'Detailed sports article...', 3, 2, 'news', NULL, datetime('now','-3 hours'), 0);

INSERT OR IGNORE INTO article_authors (article_id, author_id, is_primary) VALUES
(1, 1, 1),
(2, 2, 1);

INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES
(1,1),(1,2),(1,3),(2,4);

INSERT OR IGNORE INTO breaking_news (title, article_id, priority, push, expires_at)
VALUES ('Breaking: Major Sports Victory', 2, 10, 1, datetime('now','+6 hours'));

INSERT OR IGNORE INTO polls (question, show_results, active) VALUES
('Do you support the new economic policy?', 1, 1);

INSERT OR IGNORE INTO poll_options (poll_id, text) VALUES
(1,'Yes'), (1,'No'), (1,'Not Sure');
