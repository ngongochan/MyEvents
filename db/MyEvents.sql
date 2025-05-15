CREATE DATABASE IF NOT EXISTS MyEvents;
USE MyEvents;

CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  user_password VARCHAR(60) NOT NULL,
  avatar VARCHAR(255) DEFAULT 'default_avatar.png',
  user_role ENUM('admin','col_stu','bs_stu','ms_stu','phd_stu','uoa_staff','guest') DEFAULT 'guest',
  student_id VARCHAR(20),
  email VARCHAR(100) NOT NULL UNIQUE,
  phone_number VARCHAR(15) NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  event_id INT AUTO_INCREMENT PRIMARY KEY,
  host INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price INT NOT NULL,
  ticket_count INT NOT NULL,
  event_date DATE NOT NULL,
  event_location VARCHAR(255),
  start_time TIME NOT NULL,
  end_time TIME,
  event_status ENUM('upcoming','ongoing','ended','canceled', 'soldout') DEFAULT 'upcoming',
  event_type ENUM('workshop', 'networking', 'entertain', 'cultural', 'NA') DEFAULT 'NA',
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
  send_at DATETIME NOT NULL,
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
