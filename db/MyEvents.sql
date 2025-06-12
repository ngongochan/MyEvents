ALTER USER 'root'@'localhost'
  IDENTIFIED WITH mysql_native_password
  BY 'root';
FLUSH PRIVILEGES;

CREATE DATABASE IF NOT EXISTS MyEvents;
USE MyEvents;

CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  title ENUM('mr', 'ms', 'mrs', 'none') DEFAULT 'none',
  user_password VARCHAR(60) DEFAULT 'MyEvent01!',
  avatar VARCHAR(255) DEFAULT 'default_avatar.png',
  user_role ENUM('admin','student','uoa_staff','guest') DEFAULT 'guest',
  student_id VARCHAR(20),
  email VARCHAR(100) UNIQUE NOT NULL,
  phone_number VARCHAR(15)
);

CREATE TABLE IF NOT EXISTS auth_credentials (
  auth_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  strategy ENUM('local', 'google') NOT NULL,
  provider_id VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY provider_strategy (strategy, provider_id)
);

CREATE TABLE IF NOT EXISTS events (
  event_id INT AUTO_INCREMENT PRIMARY KEY,
  host INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price INT NOT NULL,
  remaining INT NOT NULL,
  total_tickets INT NOT NULL,
  event_date DATE NOT NULL,
  event_location VARCHAR(255),
  start_time TIME NOT NULL,
  end_time TIME,
  event_status ENUM('upcoming','ongoing','ended','canceled', 'soldout') DEFAULT 'upcoming',
  event_type ENUM('workshop', 'networking', 'entertainment', 'cultural', 'Others') DEFAULT 'Others',
  FOREIGN KEY (host) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  number_of_tickets INT NOT NULL,
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_price INT NOT NULL,
  FOREIGN KEY (user_id)  REFERENCES users(user_id)  ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tickets (
  ticket_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS email_logs (
  email_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  email_type ENUM('ticket','event_update','event_cancellation','reminder','welcome') NOT NULL,
  send_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_send BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id)   REFERENCES users(user_id)   ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS error_report (
  error_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  detail TEXT,
  report_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event_images (
  image_id     INT AUTO_INCREMENT PRIMARY KEY,
  event_id     INT               NOT NULL,
  image_name   VARCHAR(255)      NOT NULL,
  image_order  TINYINT UNSIGNED  NOT NULL DEFAULT 1,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
  UNIQUE KEY  ux_event_order (event_id, image_order)
);


INSERT INTO users
  (first_name, last_name, title, user_password, avatar, user_role, student_id, email, phone_number)
VALUES
  ('Admin',   'MyEvents',   'none',  '$2b$10$vombYJW4HB68YcmnG7hlN.gG4Aw0uCHma8gim8rveDXY7ISovGCli', 'default_avatar.png',   'admin',      NULL,     'admin.myevent@uoa.com',    '0411122233'),
  ('Anh Khoa',   'Le',   'mr',  '$2b$10$vombYJW4HB68YcmnG7hlN.gG4Aw0uCHma8gim8rveDXY7ISovGCli', 'default_avatar.png',   'admin',      NULL,     'anhkhoa.wm@gmail.com',    '0411122233'),
  ('Luong Phuoc',     'Nguyen',  'mr',  '$2b$10$vombYJW4HB68YcmnG7hlN.gG4Aw0uCHma8gim8rveDXY7ISovGCli', 'default_avatar.png',     'admin',  NULL,     'luongphuoctdn@gmail.com',     '0412233445'),
  ('Ngoc Han',  'Ngo',     'ms', '$2b$10$vombYJW4HB68YcmnG7hlN.gG4Aw0uCHma8gim8rveDXY7ISovGCli', 'default_avatar.png',  'admin',   NULL,   'ngongochan@gmail.com',     '0413344556'),
  ('Daniel',  'Wong',    'mr',  '$2b$10$vombYJW4HB68YcmnG7hlN.gG4Aw0uCHma8gim8rveDXY7ISovGCli', 'daniel.png',  'student',   'S1002',   'daniel.wong@university.edu',    '0414455667'),
  ('Eva',     'Taylor',  'ms',  '$2b$10$vombYJW4HB68YcmnG7hlN.gG4Aw0uCHma8gim8rveDXY7ISovGCli', 'eva.png',     'student',   'S1003',   'eva.taylor@university.edu',     '0415566778'),
  ('Frank',   'Brown',   'mr',  'password123', 'frank.png',   'guest',      NULL,     'frank.brown@example.com',       '0416677889'),
  ('Grace',   'Chen',    'ms',  'password123', 'grace.png',   'student',   'S1004',   'grace.chen@university.edu',     '0417788990'),
  ('Hank',    'Patel',   'mr',  'password123', 'hank.png',    'uoa_staff',  NULL,     'hank.patel@university.edu',     '0418899001'),
  ('Ivy',     'Kim',     'ms',  'password123', 'ivy.png',     'student',   'S1005',   'ivy.kim@university.edu',        '0419900112'),
  ('Jack',    'O’Neil',  'mr',  'password123', 'jack.png',    'student',   'S1006',   'jack.oneil@university.edu',     '0420011223'),
  ('Katie',   'Lopez',   'ms',  'password123', 'katie.png',   'student',   'S1007',   'katie.lopez@university.edu',    '0421122334'),
  ('Leo',     'Wright',  'mr',  'password123', 'leo.png',     'uoa_staff',  NULL,     'leo.wright@university.edu',     '0422233445'),
  ('Mia',     'Davis',   'ms',  'password123', 'mia.png',     'student',   'S1008',   'mia.davis@university.edu',      '0423344556'),
  ('Nate',    'Wilson',  'mr',  'password123', 'nate.png',    'guest',      NULL,     'nate.wilson@example.com',       '0424455667'),
  ('Olivia',  'Martin',  'ms',  'password123', 'olivia.png',  'student',   'S1009',   'olivia.martin@university.edu',  '0425566778');


INSERT INTO events
  (host, title, description, price, remaining, total_tickets, event_date, event_location, start_time, end_time, event_type)
VALUES
  ( 1, 'Python for Data Science Workshop', 'Learn Python basics and popular data science libraries in this hands-on session.',  50, 10,  30, '2025-06-20', 'Room 105, Engineering Building', '09:00:00', '12:00:00', 'workshop'),
  ( 2, 'Career Networking Night',           'Connect with industry professionals and alumni over casual drinks and hors d’oeuvres.',  0, 75, 100, '2025-06-22', 'Union Foyer',                     '18:00:00', '20:00:00', 'networking'),
  ( 3, 'Virtual Reality Showcase',           'Experience the latest VR demos from student and faculty projects.',                               20, 50,  50, '2025-06-25', 'Computer Science Lab',            '14:00:00', '17:00:00', 'entertainment'),
  ( 4, 'Cultural Food Fest',                 'Sample dishes from across the globe made by our diverse student clubs.',                          5, 150,200, '2025-06-28', 'University Plaza',                '11:00:00', '13:00:00', 'cultural'),
  ( 5, 'Data Structures Lecture',            'In-depth talk on trees, graphs and hash tables with real-world examples.',                        0,  60,150, '2025-07-01', 'Lecture Theater A',               '10:00:00', '12:00:00', 'workshop'),
  ( 6, 'Campus Movie Night',                 'Outdoor screening of a classic film on the main lawn. BYO blanket!',                               10, 45,100, '2025-07-03', 'Campus Garden',                   '19:00:00', '21:00:00', 'entertainment'),
  ( 7, 'AI Ethics Panel Discussion',         'Panel of experts debating the social impacts and responsibilities of AI.',                         0,150,150, '2025-07-05', 'Panel Room, Library',             '16:00:00', '18:00:00', 'networking'),
  ( 8, 'Coding Bootcamp',                    'Five-day intensive coding bootcamp covering full-stack web development.',                        100, 5, 25,  '2025-07-07', 'Lab 3, Computer Science',         '09:00:00', '17:00:00', 'workshop'),
  ( 9, 'Student Art Exhibition',             'Opening night of the annual student art showcase.',                                                0, 60,100, '2025-07-10', 'Art Gallery, Student Union',      '17:00:00', '19:00:00', 'cultural'),
  (10, 'Guest Lecture: Quantum Computing',   'Renowned researcher discusses recent breakthroughs in quantum algorithms.',                       20, 50, 75,  '2025-07-12', 'Science Lecture Hall',             '13:00:00', '15:00:00', 'workshop'),
  (11, 'Adelaide Music Concert',            'Live performances by local bands and solo artists.',                                             30,180,200, '2025-07-15', 'Music Auditorium',                 '20:00:00', '23:00:00', 'entertainment'),
  (12, 'Networking with Alumni',            'Small-group meetups with recent graduates in your field.',                                        0, 25, 50,  '2025-07-18', 'Alumni Lounge',                   '18:30:00', '20:30:00', 'networking'),
  (13, 'Entrepreneurship Workshop',         'Learn how to pitch your startup idea and secure funding.',                                        80, 10, 40,  '2025-07-20', 'Incubator Space',                 '15:00:00', '17:00:00', 'workshop'),
  (14, 'Photography Walk',                  'Guided city walk to practise street and landscape photography.',                                  15,  5, 30,  '2025-07-22', 'City Botanic Gardens',            '08:00:00', '10:00:00', 'cultural'),
  (15, 'Meditation and Mindfulness Session','Start your day with a guided meditation to reduce stress and improve focus.',                     0, 60, 60,  '2025-07-25', 'Wellness Center',                 '07:30:00', '08:30:00', 'workshop'),
  ( 1, 'Summer Coding Challenge Kickoff',   'Launch event for our 6-week summer coding competition with prizes.',                             0,100,100, '2025-07-28', 'Hackerspace',                     '10:00:00', '16:00:00', 'networking'),
  ( 2, 'Jazz Night at the Union',           'Live jazz quartet in the Union bar; drinks available for purchase.',                              25,100,120, '2025-07-30', 'Union Bar',                       '21:00:00', '23:59:00', 'entertainment'),
  ( 3, 'Language Exchange Meetup',          'Practice foreign languages with fellow learners in a relaxed setting.',                           0, 50, 80,  '2025-08-02', 'Language Center',                 '17:30:00', '19:30:00', 'networking'),
  ( 4, 'Tech Career Fair',                  'Meet recruiters from top tech companies and submit your CV.',                                     0,250,300, '2025-08-05', 'Sports Complex',                  '09:00:00', '17:00:00', 'networking'),
  ( 5, 'Cultural Dance Workshop',           'Learn traditional dances from various cultures—no experience required.',                          10, 50, 50,  '2025-08-07', 'Dance Studio',                    '14:00:00', '16:00:00', 'cultural');

  INSERT INTO orders (user_id, event_id, number_of_tickets, total_price) VALUES
  ( 3,  1, 2, 100),
  ( 4,  3, 1,  20),
  ( 5,  4, 3,  15),
  ( 6,  6, 1,  10),
  ( 7,  8, 1, 100),
  ( 8, 12, 2,   0),
  ( 9, 11, 2,  60),
  (10, 15, 1,   0),
  (11, 14, 3,  45),
  (12, 20, 1,  10),
  (13, 19, 2,   0),
  ( 1,  2, 1,   0),
  ( 2,  7, 1,   0),
  (14, 13, 1,  80),
  (15, 17, 2,  50),
  ( 3, 18, 1,   0),

  ( 5, 10, 2,  40),
  ( 6,  5, 1,   0),
  ( 7, 16, 4,   0);

-- Corresponding tickets (one row per ticket)
INSERT INTO tickets (order_id) VALUES
  ( 1),( 1),
  ( 2),
  ( 3),( 3),( 3),
  ( 4),
  ( 5),
  ( 6),( 6),
  ( 7),( 7),
  ( 8),
  ( 9),( 9),( 9),
  (10),
  (11),(11),
  (12),
  (13),
  (14),
  (15),(15),
  (16),
  (17),(17),(17),
  (18),(18),
  (19);

  INSERT INTO event_images (event_id, image_name, image_order) VALUES
  ( 1,  '1.png',  1),
  ( 2,  '2.png',  1),
  ( 3,  '3.png',  1),
  ( 4,  '4.png',  1),
  ( 5,  '5.png',  1),
  ( 6,  '6.png',  1),
  ( 7,  '7.png',  1),
  ( 8,  '8.png',  1),
  ( 9,  '9.png',  1),
  (10, '10.png',  1),
  (11, '11.png',  1),
  (12, '12.png',  1),
  (13, '13.png',  1),
  (14, '14.png',  1),
  (15, '15.png',  1),
  (16, '16.png',  1),
  (17, '17.png',  1),
  (18, '18.png',  1),
  (19, '19.png',  1),
  (20, '20.png',  1);