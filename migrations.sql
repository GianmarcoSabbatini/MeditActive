-- Questo file definisce la struttura del database per MeditActive.
-- Eseguilo per creare tutte le tabelle necessarie.

-- Assicurati di aver creato un database, ad esempio: CREATE DATABASE meditactive;
-- E poi selezionalo: USE meditactive;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Struttura della tabella `users`
--
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `nome` VARCHAR(100) NOT NULL,
  `cognome` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Struttura della tabella `intervals`
--
CREATE TABLE `intervals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) 
    REFERENCES `users`(`id`) 
    ON DELETE CASCADE -- Se un utente viene cancellato, anche i suoi intervalli vengono cancellati.
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Struttura della tabella `interval_goals`
-- Questa è una tabella di collegamento per permettere a ogni intervallo di avere più obiettivi.
--
CREATE TABLE `interval_goals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `interval_id` INT NOT NULL,
  `goal_name` VARCHAR(255) NOT NULL,
  FOREIGN KEY (`interval_id`) 
    REFERENCES `intervals`(`id`) 
    ON DELETE CASCADE -- Se un intervallo viene cancellato, anche i suoi obiettivi vengono cancellati.
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

COMMIT;

