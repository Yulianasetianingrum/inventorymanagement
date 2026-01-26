-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 26, 2026 at 06:52 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `inventory_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `auditlog`
--

CREATE TABLE `auditlog` (
  `id` varchar(191) NOT NULL,
  `action` varchar(191) NOT NULL,
  `detail` varchar(191) DEFAULT NULL,
  `userId` varchar(191) DEFAULT NULL,
  `targetUserId` varchar(191) DEFAULT NULL,
  `metaJson` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metaJson`)),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `auditlog`
--

INSERT INTO `auditlog` (`id`, `action`, `detail`, `userId`, `targetUserId`, `metaJson`, `createdAt`) VALUES
('cmjzkykb40002141gnl7xtboz', 'CREATE_USER', NULL, 'cmjzkxxp40000du3webn78thb', 'cmjzkykaq0000141gtbszgst2', '{\"role\":\"WORKER\",\"phone\":null,\"notes\":null}', '2026-01-04 10:19:55.600'),
('cmjzkyqbv0004141gkaee25in', 'RESET_PIN', NULL, 'cmjzkxxp40000du3webn78thb', 'cmjzkykaq0000141gtbszgst2', '{\"reason\":\"reset by admin\"}', '2026-01-04 10:20:03.404'),
('cmjzl13oq0006141gnt7gxqoh', 'UPDATE_USER', NULL, 'cmjzkxxp40000du3webn78thb', 'cmjzkykaq0000141gtbszgst2', '{\"before\":{\"id\":\"cmjzkykaq0000141gtbszgst2\",\"employeeId\":\"WKR-001\",\"name\":\"Yuliana Setianingrum\",\"role\":\"WORKER\",\"passwordHash\":null,\"pinHash\":\"$2a$10$d4IyulwsEV32EYgzT6eaVOFEi6JH4grhofdeGxT7XZVvAytv8WRba\",\"createdAt\":\"2026-01-04T10:19:55.586Z\",\"updatedAt\":\"2026-01-04T10:20:03.393Z\",\"authType\":\"PIN\",\"isActive\":true,\"lastLoginAt\":null,\"notes\":null,\"phone\":null},\"after\":{\"id\":\"cmjzkykaq0000141gtbszgst2\",\"employeeId\":\"WKR-001\",\"name\":\"Yuliana Setianingrum\",\"role\":\"ADMIN\",\"passwordHash\":null,\"pinHash\":\"$2a$10$d4IyulwsEV32EYgzT6eaVOFEi6JH4grhofdeGxT7XZVvAytv8WRba\",\"createdAt\":\"2026-01-04T10:19:55.586Z\",\"updatedAt\":\"2026-01-04T10:21:54.019Z\",\"authType\":\"PIN\",\"isActive\":true,\"lastLoginAt\":null,\"notes\":null,\"phone\":null}}', '2026-01-04 10:21:54.027'),
('cmjzl1etu0008141gqg8y5mh0', 'UPDATE_USER', NULL, 'cmjzkxxp40000du3webn78thb', 'cmjzkykaq0000141gtbszgst2', '{\"before\":{\"id\":\"cmjzkykaq0000141gtbszgst2\",\"employeeId\":\"WKR-001\",\"name\":\"Yuliana Setianingrum\",\"role\":\"ADMIN\",\"passwordHash\":null,\"pinHash\":\"$2a$10$d4IyulwsEV32EYgzT6eaVOFEi6JH4grhofdeGxT7XZVvAytv8WRba\",\"createdAt\":\"2026-01-04T10:19:55.586Z\",\"updatedAt\":\"2026-01-04T10:21:54.019Z\",\"authType\":\"PIN\",\"isActive\":true,\"lastLoginAt\":null,\"notes\":null,\"phone\":null},\"after\":{\"id\":\"cmjzkykaq0000141gtbszgst2\",\"employeeId\":\"WKR-001\",\"name\":\"Yuliana Setianingrum\",\"role\":\"ADMIN\",\"passwordHash\":null,\"pinHash\":\"$2a$10$d4IyulwsEV32EYgzT6eaVOFEi6JH4grhofdeGxT7XZVvAytv8WRba\",\"createdAt\":\"2026-01-04T10:19:55.586Z\",\"updatedAt\":\"2026-01-04T10:22:08.459Z\",\"authType\":\"PIN\",\"isActive\":true,\"lastLoginAt\":null,\"notes\":null,\"phone\":null}}', '2026-01-04 10:22:08.466'),
('cmjzle4y5000a141gwkmc8r9b', 'UPDATE_USER', NULL, 'cmjzkxxp40000du3webn78thb', 'cmjzkykaq0000141gtbszgst2', '{\"before\":{\"id\":\"cmjzkykaq0000141gtbszgst2\",\"employeeId\":\"WKR-001\",\"name\":\"Yuliana Setianingrum\",\"role\":\"ADMIN\",\"passwordHash\":null,\"pinHash\":\"$2a$10$d4IyulwsEV32EYgzT6eaVOFEi6JH4grhofdeGxT7XZVvAytv8WRba\",\"createdAt\":\"2026-01-04T10:19:55.586Z\",\"updatedAt\":\"2026-01-04T10:22:08.459Z\",\"authType\":\"PIN\",\"isActive\":true,\"lastLoginAt\":null,\"notes\":null,\"phone\":null},\"after\":{\"id\":\"cmjzkykaq0000141gtbszgst2\",\"employeeId\":\"WKR-001\",\"name\":\"Yuliana Setianingrum\",\"role\":\"ADMIN\",\"passwordHash\":null,\"pinHash\":\"$2a$10$d4IyulwsEV32EYgzT6eaVOFEi6JH4grhofdeGxT7XZVvAytv8WRba\",\"createdAt\":\"2026-01-04T10:19:55.586Z\",\"updatedAt\":\"2026-01-04T10:32:02.180Z\",\"authType\":\"PIN\",\"isActive\":true,\"lastLoginAt\":null,\"notes\":null,\"phone\":null}}', '2026-01-04 10:32:02.190'),
('cmjzlgxpa000c141g3is1dswt', 'RESET_PIN', NULL, 'cmjzkxxp40000du3webn78thb', 'cmjzkykaq0000141gtbszgst2', '{\"reason\":\"reset by admin\"}', '2026-01-04 10:34:12.766'),
('cmjzlis8t000e141g9uy1qmj5', 'RESET_PIN', NULL, 'cmjzkxxp40000du3webn78thb', 'cmjzkykaq0000141gtbszgst2', '{\"reason\":\"reset by admin\"}', '2026-01-04 10:35:39.005'),
('cmjzlls530001cq5d2zddrjhe', 'RESET_PIN', NULL, 'cmjzkxxp40000du3webn78thb', 'cmjzkykaq0000141gtbszgst2', '{\"reason\":\"reset by admin\"}', '2026-01-04 10:37:58.839'),
('cmjzma6hu0001kysxbe2c31n7', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'cmjzkykaq0000141gtbszgst2', '{\"reason\":\"reset by admin\",\"authType\":\"PIN\"}', '2026-01-04 10:56:57.186'),
('cmjzmfz700003kysx66tqi9i6', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'cmjzkykaq0000141gtbszgst2', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PIN\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-04 11:01:27.661'),
('cmjzmj59n0005kysxx5blmq2a', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkykaq0000141gtbszgst2', 'cmjzkykaq0000141gtbszgst2', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-04 11:03:55.499'),
('cmjzmlvxd0007kysxas3xi69g', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'cmjzkykaq0000141gtbszgst2', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-04 11:06:03.361'),
('cmjzmrsht0002c37qgkvs0me0', 'CREATE_USER', NULL, 'cmjzkykaq0000141gtbszgst2', 'cmjzmrshe0000c37qk1xr5qws', '{\"role\":\"ADMIN\",\"phone\":null,\"notes\":null}', '2026-01-04 11:10:38.850'),
('cmjzmrymd0004c37q3tta3e7i', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkykaq0000141gtbszgst2', 'cmjzmrshe0000c37qk1xr5qws', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-04 11:10:46.789'),
('cmjzmw4jn0006c37qdemtga99', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkykaq0000141gtbszgst2', 'cmjzkxxp40000du3webn78thb', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-04 11:14:01.091'),
('cmjzr3hv10001wd8wjpwopwkg', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'dae4cdca-e969-11f0-984e-8447095bc55d', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-04 13:11:43.405'),
('cmjzr3q6m0003wd8w9gxok4o6', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'dae4e36c-e969-11f0-984e-8447095bc55d', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-04 13:11:54.191'),
('cmjzr3wgh0005wd8w61wr7fpc', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'dae4e514-e969-11f0-984e-8447095bc55d', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-04 13:12:02.322'),
('cmjzr42560007wd8w2n5xrkyd', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'dae4e685-e969-11f0-984e-8447095bc55d', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-04 13:12:09.691'),
('cmjzr47yu0009wd8wqe1y9ylw', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'dae4e864-e969-11f0-984e-8447095bc55d', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-04 13:12:17.238'),
('cmjzr4e5h000bwd8w637hg6x6', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'dae4e99f-e969-11f0-984e-8447095bc55d', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-04 13:12:25.253'),
('cmjzr4k72000dwd8w841vgxcl', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'dae4ea8b-e969-11f0-984e-8447095bc55d', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-04 13:12:33.087'),
('cmjzr4p99000fwd8w9t6ultk0', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'dae4eb7f-e969-11f0-984e-8447095bc55d', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-04 13:12:39.646'),
('cmjzr4vlg000hwd8w8w2j3t4f', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'dae4ee14-e969-11f0-984e-8447095bc55d', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-04 13:12:47.861'),
('cmjzr53pn000jwd8wfhreauep', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'dae4ef31-e969-11f0-984e-8447095bc55d', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-04 13:12:58.379'),
('cmjzr58u5000lwd8w3j82hr3z', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'dae4f1a8-e969-11f0-984e-8447095bc55d', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-04 13:13:05.021'),
('cmjzr5gjs000nwd8wpv3c251i', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'dae4f2ce-e969-11f0-984e-8447095bc55d', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-04 13:13:15.016'),
('cmjzr5okb000pwd8wdkb6vzpi', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'dae4f54c-e969-11f0-984e-8447095bc55d', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-04 13:13:25.403'),
('cmjzr5u27000rwd8w8hqmgtbz', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'dae4f69f-e969-11f0-984e-8447095bc55d', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-04 13:13:32.528'),
('cmjzr5zk3000twd8wnn6kc6me', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'dae4f775-e969-11f0-984e-8447095bc55d', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-04 13:13:39.651'),
('cmjzr64oa000vwd8wihmqczf3', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'dae4f860-e969-11f0-984e-8447095bc55d', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-04 13:13:46.282'),
('cmjzr69p7000xwd8w9m8dq689', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'dae4f946-e969-11f0-984e-8447095bc55d', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-04 13:13:52.795'),
('cmjzr6ftk000zwd8wqmacp6ji', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'dae4fb8a-e969-11f0-984e-8447095bc55d', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-04 13:14:00.728'),
('cmjzr6lqg0011wd8wx24r0993', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'dae4fcad-e969-11f0-984e-8447095bc55d', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-04 13:14:08.392'),
('cmjzr6rf30013wd8whgtfdib0', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'dae4fd91-e969-11f0-984e-8447095bc55d', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-04 13:14:15.759'),
('cmk0q4p0m0009m3uzeratmzme', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'cmjzkxxp40000du3webn78thb', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-05 05:32:25.894'),
('cmk0q6n52000bm3uz5etib2dc', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkykaq0000141gtbszgst2', 'cmjzkxxp40000du3webn78thb', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-05 05:33:56.775'),
('cmk0q77tb000em3uz29wwxvt6', 'CREATE_USER', NULL, 'cmjzkxxp40000du3webn78thb', NULL, '{\"role\":\"WORKER\",\"authType\":\"PASSWORD\"}', '2026-01-05 05:34:23.567'),
('cmk0q7gas000gm3uzu4avvi7y', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', NULL, '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-05 05:34:34.564'),
('cmk0q7jbf000im3uzjnzpgm22', 'UPDATE_USER', NULL, 'cmjzkxxp40000du3webn78thb', NULL, '{\"before\":{\"id\":\"cmk0q77sw000cm3uzspbrkvo1\",\"employeeId\":\"WKR-021\",\"name\":\"ok\",\"role\":\"WORKER\",\"passwordHash\":\"$2a$10$nNMNvzs0OVsS2BxfH69xveXWQKClkLuVCPO/gR6pP2Xo5wQRf.hSa\",\"createdAt\":\"2026-01-05T05:34:23.552Z\",\"updatedAt\":\"2026-01-05T05:34:34.547Z\",\"authType\":\"PASSWORD\",\"isActive\":true,\"lastLoginAt\":null,\"notes\":null,\"phone\":null},\"after\":{\"id\":\"cmk0q77sw000cm3uzspbrkvo1\",\"employeeId\":\"WKR-021\",\"name\":\"ok\",\"role\":\"WORKER\",\"passwordHash\":\"$2a$10$nNMNvzs0OVsS2BxfH69xveXWQKClkLuVCPO/gR6pP2Xo5wQRf.hSa\",\"createdAt\":\"2026-01-05T05:34:23.552Z\",\"updatedAt\":\"2026-01-05T05:34:38.455Z\",\"authType\":\"PASSWORD\",\"isActive\":false,\"lastLoginAt\":null,\"notes\":null,\"phone\":null}}', '2026-01-05 05:34:38.475'),
('cmk0q7ke9000km3uzfi4v76jz', 'UPDATE_USER', NULL, 'cmjzkxxp40000du3webn78thb', NULL, '{\"before\":{\"id\":\"cmk0q77sw000cm3uzspbrkvo1\",\"employeeId\":\"WKR-021\",\"name\":\"ok\",\"role\":\"WORKER\",\"passwordHash\":\"$2a$10$nNMNvzs0OVsS2BxfH69xveXWQKClkLuVCPO/gR6pP2Xo5wQRf.hSa\",\"createdAt\":\"2026-01-05T05:34:23.552Z\",\"updatedAt\":\"2026-01-05T05:34:38.455Z\",\"authType\":\"PASSWORD\",\"isActive\":false,\"lastLoginAt\":null,\"notes\":null,\"phone\":null},\"after\":{\"id\":\"cmk0q77sw000cm3uzspbrkvo1\",\"employeeId\":\"WKR-021\",\"name\":\"ok\",\"role\":\"WORKER\",\"passwordHash\":\"$2a$10$nNMNvzs0OVsS2BxfH69xveXWQKClkLuVCPO/gR6pP2Xo5wQRf.hSa\",\"createdAt\":\"2026-01-05T05:34:23.552Z\",\"updatedAt\":\"2026-01-05T05:34:39.862Z\",\"authType\":\"PASSWORD\",\"isActive\":true,\"lastLoginAt\":null,\"notes\":null,\"phone\":null}}', '2026-01-05 05:34:39.873'),
('cmk0q7l65000mm3uzus9rjqwi', 'UPDATE_USER', NULL, 'cmjzkxxp40000du3webn78thb', NULL, '{\"before\":{\"id\":\"cmk0q77sw000cm3uzspbrkvo1\",\"employeeId\":\"WKR-021\",\"name\":\"ok\",\"role\":\"WORKER\",\"passwordHash\":\"$2a$10$nNMNvzs0OVsS2BxfH69xveXWQKClkLuVCPO/gR6pP2Xo5wQRf.hSa\",\"createdAt\":\"2026-01-05T05:34:23.552Z\",\"updatedAt\":\"2026-01-05T05:34:39.862Z\",\"authType\":\"PASSWORD\",\"isActive\":true,\"lastLoginAt\":null,\"notes\":null,\"phone\":null},\"after\":{\"id\":\"cmk0q77sw000cm3uzspbrkvo1\",\"employeeId\":\"WKR-021\",\"name\":\"ok\",\"role\":\"WORKER\",\"passwordHash\":\"$2a$10$nNMNvzs0OVsS2BxfH69xveXWQKClkLuVCPO/gR6pP2Xo5wQRf.hSa\",\"createdAt\":\"2026-01-05T05:34:23.552Z\",\"updatedAt\":\"2026-01-05T05:34:40.868Z\",\"authType\":\"PASSWORD\",\"isActive\":false,\"lastLoginAt\":null,\"notes\":null,\"phone\":null}}', '2026-01-05 05:34:40.878'),
('cmk0q7m5r000om3uzhadnran7', 'UPDATE_USER', NULL, 'cmjzkxxp40000du3webn78thb', NULL, '{\"before\":{\"id\":\"cmk0q77sw000cm3uzspbrkvo1\",\"employeeId\":\"WKR-021\",\"name\":\"ok\",\"role\":\"WORKER\",\"passwordHash\":\"$2a$10$nNMNvzs0OVsS2BxfH69xveXWQKClkLuVCPO/gR6pP2Xo5wQRf.hSa\",\"createdAt\":\"2026-01-05T05:34:23.552Z\",\"updatedAt\":\"2026-01-05T05:34:40.868Z\",\"authType\":\"PASSWORD\",\"isActive\":false,\"lastLoginAt\":null,\"notes\":null,\"phone\":null},\"after\":{\"id\":\"cmk0q77sw000cm3uzspbrkvo1\",\"employeeId\":\"WKR-021\",\"name\":\"ok\",\"role\":\"WORKER\",\"passwordHash\":\"$2a$10$nNMNvzs0OVsS2BxfH69xveXWQKClkLuVCPO/gR6pP2Xo5wQRf.hSa\",\"createdAt\":\"2026-01-05T05:34:23.552Z\",\"updatedAt\":\"2026-01-05T05:34:42.145Z\",\"authType\":\"PASSWORD\",\"isActive\":true,\"lastLoginAt\":null,\"notes\":null,\"phone\":null}}', '2026-01-05 05:34:42.159'),
('cmk0qadl8000qm3uz9m9aksqj', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', NULL, '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-05 05:36:51.020'),
('cmk0qbrtm00015ecii2habbuz', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'cmjzkxxp40000du3webn78thb', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-05 05:37:56.122'),
('cmk0qc3a300035eci4n18d08i', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', NULL, '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-05 05:38:10.971'),
('cmk0qflxk00055ecia5co0pgy', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'cmjzkykaq0000141gtbszgst2', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-05 05:40:55.112'),
('cmk0quupt0001ej02pmgjcat7', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'cmjzkxxp40000du3webn78thb', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-05 05:52:46.337'),
('cmk0r4db90003ej0265nvgozh', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'cmjzkykaq0000141gtbszgst2', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-05 06:00:10.341'),
('cmk0r4l4r0005ej02gonwa60v', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'cmjzkxxp40000du3webn78thb', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-05 06:00:20.475'),
('cmk0r51p70007ej02l54yyj4o', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', NULL, '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-05 06:00:41.948'),
('cmk0rcqt90009ej02s549517v', 'DELETE_USER', NULL, 'cmjzkxxp40000du3webn78thb', NULL, '{\"employeeId\":\"WKR-021\",\"role\":\"WORKER\"}', '2026-01-05 06:06:41.085'),
('cmk0rddl7000cej02cysezj1c', 'CREATE_USER', NULL, 'cmjzkxxp40000du3webn78thb', NULL, '{\"role\":\"WORKER\",\"authType\":\"PASSWORD\"}', '2026-01-05 06:07:10.603'),
('cmk0rdj4q000eej020veoacty', 'DELETE_USER', NULL, 'cmjzkxxp40000du3webn78thb', NULL, '{\"employeeId\":\"WKR-021\",\"role\":\"WORKER\"}', '2026-01-05 06:07:17.786'),
('cmk0rf2z9000gej02mizmlwd2', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'cmjzmrshe0000c37qk1xr5qws', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-05 06:08:30.165'),
('cmk0rpbn5000iej02jhlokl4o', 'UPDATE_USER', NULL, 'cmjzmrshe0000c37qk1xr5qws', 'cmjzkykaq0000141gtbszgst2', '{\"before\":{\"id\":\"cmjzkykaq0000141gtbszgst2\",\"employeeId\":\"ADM-002\",\"name\":\"Yuliana Setianingrum\",\"role\":\"ADMIN\",\"passwordHash\":\"$2a$10$FTZ.QjO.JWqTmt9Ew7IxFeZYt5N6QC3StHf7DzSUfA.j5ffF50hfm\",\"createdAt\":\"2026-01-04T10:19:55.586Z\",\"updatedAt\":\"2026-01-05T06:00:10.329Z\",\"authType\":\"PASSWORD\",\"isActive\":true,\"lastLoginAt\":\"2026-01-05T05:41:09.600Z\",\"notes\":null,\"phone\":null},\"after\":{\"id\":\"cmjzkykaq0000141gtbszgst2\",\"employeeId\":\"ADM-002\",\"name\":\"Yuliana Setianingrum\",\"role\":\"ADMIN\",\"passwordHash\":\"$2a$10$FTZ.QjO.JWqTmt9Ew7IxFeZYt5N6QC3StHf7DzSUfA.j5ffF50hfm\",\"createdAt\":\"2026-01-04T10:19:55.586Z\",\"updatedAt\":\"2026-01-05T06:16:27.941Z\",\"authType\":\"PASSWORD\",\"isActive\":false,\"lastLoginAt\":\"2026-01-05T05:41:09.600Z\",\"notes\":null,\"phone\":null}}', '2026-01-05 06:16:27.953'),
('cmk0rpk0v000kej02970i9yww', 'UPDATE_USER', NULL, 'cmjzmrshe0000c37qk1xr5qws', 'cmjzkykaq0000141gtbszgst2', '{\"before\":{\"id\":\"cmjzkykaq0000141gtbszgst2\",\"employeeId\":\"ADM-002\",\"name\":\"Yuliana Setianingrum\",\"role\":\"ADMIN\",\"passwordHash\":\"$2a$10$FTZ.QjO.JWqTmt9Ew7IxFeZYt5N6QC3StHf7DzSUfA.j5ffF50hfm\",\"createdAt\":\"2026-01-04T10:19:55.586Z\",\"updatedAt\":\"2026-01-05T06:16:27.941Z\",\"authType\":\"PASSWORD\",\"isActive\":false,\"lastLoginAt\":\"2026-01-05T05:41:09.600Z\",\"notes\":null,\"phone\":null},\"after\":{\"id\":\"cmjzkykaq0000141gtbszgst2\",\"employeeId\":\"ADM-002\",\"name\":\"Yuliana Setianingrum\",\"role\":\"ADMIN\",\"passwordHash\":\"$2a$10$FTZ.QjO.JWqTmt9Ew7IxFeZYt5N6QC3StHf7DzSUfA.j5ffF50hfm\",\"createdAt\":\"2026-01-04T10:19:55.586Z\",\"updatedAt\":\"2026-01-05T06:16:38.803Z\",\"authType\":\"PASSWORD\",\"isActive\":true,\"lastLoginAt\":\"2026-01-05T05:41:09.600Z\",\"notes\":null,\"phone\":null}}', '2026-01-05 06:16:38.815'),
('cmk0rplge000mej029r4365b2', 'UPDATE_USER', NULL, 'cmjzmrshe0000c37qk1xr5qws', 'cmjzmrshe0000c37qk1xr5qws', '{\"before\":{\"id\":\"cmjzmrshe0000c37qk1xr5qws\",\"employeeId\":\"ADM-003\",\"name\":\"Putri\",\"role\":\"ADMIN\",\"passwordHash\":\"$2a$10$ThFE5GCuM9irGoG3bob3h..8xjYYK8gjyi.Dxngq0WHMhl.xT.PiC\",\"createdAt\":\"2026-01-04T11:10:38.834Z\",\"updatedAt\":\"2026-01-05T06:12:22.303Z\",\"authType\":\"PASSWORD\",\"isActive\":true,\"lastLoginAt\":\"2026-01-05T06:12:22.300Z\",\"notes\":null,\"phone\":null},\"after\":{\"id\":\"cmjzmrshe0000c37qk1xr5qws\",\"employeeId\":\"ADM-003\",\"name\":\"Putri\",\"role\":\"ADMIN\",\"passwordHash\":\"$2a$10$ThFE5GCuM9irGoG3bob3h..8xjYYK8gjyi.Dxngq0WHMhl.xT.PiC\",\"createdAt\":\"2026-01-04T11:10:38.834Z\",\"updatedAt\":\"2026-01-05T06:16:40.665Z\",\"authType\":\"PASSWORD\",\"isActive\":false,\"lastLoginAt\":\"2026-01-05T06:12:22.300Z\",\"notes\":null,\"phone\":null}}', '2026-01-05 06:16:40.671'),
('cmk0rpmyn000oej02805dssx6', 'UPDATE_USER', NULL, 'cmjzmrshe0000c37qk1xr5qws', 'cmjzmrshe0000c37qk1xr5qws', '{\"before\":{\"id\":\"cmjzmrshe0000c37qk1xr5qws\",\"employeeId\":\"ADM-003\",\"name\":\"Putri\",\"role\":\"ADMIN\",\"passwordHash\":\"$2a$10$ThFE5GCuM9irGoG3bob3h..8xjYYK8gjyi.Dxngq0WHMhl.xT.PiC\",\"createdAt\":\"2026-01-04T11:10:38.834Z\",\"updatedAt\":\"2026-01-05T06:16:40.665Z\",\"authType\":\"PASSWORD\",\"isActive\":false,\"lastLoginAt\":\"2026-01-05T06:12:22.300Z\",\"notes\":null,\"phone\":null},\"after\":{\"id\":\"cmjzmrshe0000c37qk1xr5qws\",\"employeeId\":\"ADM-003\",\"name\":\"Putri\",\"role\":\"ADMIN\",\"passwordHash\":\"$2a$10$ThFE5GCuM9irGoG3bob3h..8xjYYK8gjyi.Dxngq0WHMhl.xT.PiC\",\"createdAt\":\"2026-01-04T11:10:38.834Z\",\"updatedAt\":\"2026-01-05T06:16:42.611Z\",\"authType\":\"PASSWORD\",\"isActive\":true,\"lastLoginAt\":\"2026-01-05T06:12:22.300Z\",\"notes\":null,\"phone\":null}}', '2026-01-05 06:16:42.623'),
('cmkql8fm90005fpzz2saumk54', 'CREATE_PICKLIST', 'Created picklist PKL-20260123-0001', 'cmjzkxxp40000du3webn78thb', NULL, '{\"mode\":\"INTERNAL\",\"projectId\":\"dba8100c-e977-11f0-984e-8447095bc55d\",\"itemCount\":1}', '2026-01-23 07:57:22.834'),
('cmkqo4lfr0005dwc3vhddydw6', 'CREATE_PICKLIST', 'Created picklist PKL-20260123-0002', 'cmjzkxxp40000du3webn78thb', NULL, '{\"mode\":\"INTERNAL\",\"projectId\":\"dba6146c-e977-11f0-984e-8447095bc55d\",\"itemCount\":1}', '2026-01-23 09:18:22.599'),
('cmkqojco700052xo352xkd0id', 'CREATE_PICKLIST', 'Created picklist PKL-20260123-0003', 'cmjzkxxp40000du3webn78thb', NULL, '{\"mode\":\"INTERNAL\",\"projectId\":\"dba2183a-e977-11f0-984e-8447095bc55d\",\"itemCount\":1}', '2026-01-23 09:29:51.079'),
('cmkt4k9m60005utbwpj0w4vqi', 'CREATE_PICKLIST', 'Created picklist PKL-20260125-0001', 'cmjzkxxp40000du3webn78thb', NULL, '{\"mode\":\"INTERNAL\",\"projectId\":\"cmkqo9gpx000edwc3mk5bp8jj\",\"itemCount\":1}', '2026-01-25 02:33:59.982'),
('cmku7wxwa0005utv4nwe1xvgz', 'CREATE_PICKLIST', 'Created picklist PKL-20260125-0001', 'cmjzkxxp40000du3webn78thb', NULL, '{\"mode\":\"INTERNAL\",\"projectId\":\"dba6146c-e977-11f0-984e-8447095bc55d\",\"itemCount\":1}', '2026-01-25 20:55:36.347'),
('cmkuf2h4v0005utxsagdpvw8x', 'CREATE_PICKLIST', 'Created picklist PKL-20260126-0001', 'cmjzkxxp40000du3webn78thb', NULL, '{\"mode\":\"INTERNAL\",\"projectId\":\"dba8100c-e977-11f0-984e-8447095bc55d\",\"itemCount\":1}', '2026-01-26 00:15:51.871'),
('cmkufuazh000butxsvosw60f2', 'CREATE_PICKLIST', 'Created picklist PL-20260126-0001', 'cmjzkxxp40000du3webn78thb', NULL, '{\"mode\":\"INTERNAL\",\"projectId\":\"dba8100c-e977-11f0-984e-8447095bc55d\",\"itemCount\":1}', '2026-01-26 00:37:30.270'),
('cmkufznvi000dutxsbyp8i76z', 'UPDATE_USER', NULL, 'cmjzkxxp40000du3webn78thb', 'dae4cdca-e969-11f0-984e-8447095bc55d', '{\"before\":{\"id\":\"dae4cdca-e969-11f0-984e-8447095bc55d\",\"employeeId\":\"WKR-001\",\"name\":\"Slamet\",\"role\":\"WORKER\",\"passwordHash\":\"$2a$10$6fChK3vyc0AbqP76BfyXn.eqKzeYWa844b9.KaGE59UGwrnWYaG1i\",\"createdAt\":\"2026-01-04T19:35:30.174Z\",\"updatedAt\":\"2026-01-26T00:39:57.833Z\",\"authType\":\"PASSWORD\",\"isActive\":true,\"lastLoginAt\":\"2026-01-26T00:39:57.830Z\",\"notes\":null,\"phone\":null,\"resetCode\":null,\"resetCodeExpiresAt\":null},\"after\":{\"id\":\"dae4cdca-e969-11f0-984e-8447095bc55d\",\"employeeId\":\"WKR-001\",\"name\":\"Slamet\",\"role\":\"WORKER\",\"passwordHash\":\"$2a$10$6fChK3vyc0AbqP76BfyXn.eqKzeYWa844b9.KaGE59UGwrnWYaG1i\",\"createdAt\":\"2026-01-04T19:35:30.174Z\",\"updatedAt\":\"2026-01-26T00:41:40.241Z\",\"authType\":\"PASSWORD\",\"isActive\":true,\"lastLoginAt\":\"2026-01-26T00:39:57.830Z\",\"notes\":null,\"phone\":\"09748378545\",\"resetCode\":null,\"resetCodeExpiresAt\":null}}', '2026-01-26 00:41:40.255'),
('cmkuh1ukx0005utp8r6lu2jri', 'CREATE_PICKLIST', 'Created picklist PL-20260126-0001', 'cmjzkxxp40000du3webn78thb', NULL, '{\"mode\":\"INTERNAL\",\"projectId\":\"dba6146c-e977-11f0-984e-8447095bc55d\",\"itemCount\":1}', '2026-01-26 01:11:21.873'),
('cmkuix3xv0007ut54rhyg9y18', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'cmjzkykaq0000141gtbszgst2', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-26 02:03:39.955'),
('cmkuixllc0009ut54etod7x4x', 'RESET_USER_CREDENTIAL', NULL, 'cmjzkxxp40000du3webn78thb', 'dae4e36c-e969-11f0-984e-8447095bc55d', '{\"reason\":\"reset by admin\",\"previousAuthType\":\"PASSWORD\",\"forcedAuthType\":\"PASSWORD\"}', '2026-01-26 02:04:02.833'),
('cmkuja46c000fut54mi4kq9rp', 'CREATE_PICKLIST', 'Created picklist PL-20260126-0001', 'cmjzkxxp40000du3webn78thb', NULL, '{\"mode\":\"INTERNAL\",\"projectId\":\"cmkqo9gpx000edwc3mk5bp8jj\",\"itemCount\":1}', '2026-01-26 02:13:46.788');

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `barcode` varchar(50) DEFAULT NULL,
  `name` varchar(160) NOT NULL,
  `brand` varchar(120) DEFAULT NULL,
  `category` varchar(120) DEFAULT NULL,
  `location` varchar(160) DEFAULT NULL,
  `size` varchar(80) DEFAULT NULL,
  `unit` varchar(30) NOT NULL DEFAULT 'pcs',
  `stockNew` int(11) NOT NULL DEFAULT 0,
  `stockUsed` int(11) NOT NULL DEFAULT 0,
  `minStock` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `defaultSupplierId` int(11) DEFAULT NULL,
  `locationId` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `barcode`, `name`, `brand`, `category`, `location`, `size`, `unit`, `stockNew`, `stockUsed`, `minStock`, `isActive`, `createdAt`, `updatedAt`, `defaultSupplierId`, `locationId`) VALUES
(101, '840214804694', 'Multi Tool 12 in 1', 'Gentlemen’s Hardware', 'Hand Tools', 'Gudang', '12-in-1', 'pcs', -1, 0, 0, 1, '2026-01-25 20:44:14.427', '2026-01-25 20:57:43.316', NULL, NULL),
(102, '778862064224', 'Home Tool Set', 'TACKLIFE', 'Tool Set', 'Gudang', '57 pcs', 'set', 5, 0, 0, 1, '2026-01-25 20:44:14.452', '2026-01-25 20:51:35.130', NULL, NULL),
(103, '716350797988', 'Multi Tool Hammer', 'RAK Pro Tools', 'Hand Tools', 'Gudang', '12-in-1', 'pcs', 8, 0, 0, 1, '2026-01-25 20:44:14.484', '2026-01-25 20:51:35.135', NULL, NULL),
(104, '038728037060', 'Home Tool Kit', 'General Tools', 'Tool Set', 'Gudang', '39 pcs', 'set', 12, 0, 0, 1, '2026-01-25 20:44:14.493', '2026-01-25 20:51:35.146', NULL, NULL),
(105, '681035017982', 'Precision Tool Set', 'General Tools', 'Precision Tools', 'Gudang', '11 pcs', 'set', 20, 0, 0, 1, '2026-01-25 20:44:14.503', '2026-01-25 20:51:35.168', NULL, NULL),
(106, '711639924451', 'Home Repair Tool Kit', 'DEKOPRO', 'Tool Set', 'Gudang', '198 pcs', 'set', 3, 0, 0, 1, '2026-01-25 20:44:14.512', '2026-01-25 20:51:35.178', NULL, NULL),
(107, '313055857810', 'Tool Kit Set', 'Trademark Tools', 'Tool Set', 'Gudang', '130 pcs', 'set', 4, 0, 0, 1, '2026-01-25 20:44:14.540', '2026-01-25 20:51:35.188', NULL, NULL),
(108, '850039064586', 'Magnetic Screwdriver Set', 'INTERTOOL', 'Screwdrivers', 'Gudang', '114 pcs', 'set', 6, 0, 0, 1, '2026-01-25 20:44:14.552', '2026-01-25 20:51:35.194', NULL, NULL),
(109, '680666946241', 'Screwdriver Bit Set', 'TACKLIFE', 'Bits', 'Gudang', 'PTA01A', 'set', 10, 0, 0, 1, '2026-01-25 20:44:14.591', '2026-01-25 20:51:35.200', NULL, NULL),
(110, '680666907860', 'Circular Saw', 'TACKLIFE', 'Power Tools', 'Gudang', '7-1/2 inch', 'pcs', 2, 0, 0, 1, '2026-01-25 20:44:14.623', '2026-01-25 20:51:35.206', NULL, NULL),
(111, '763615763301', 'Swiss Army Multitool', 'Victorinox', 'Multi Tools', 'Gudang', 'Traveler', 'pcs', 6, 0, 0, 1, '2026-01-25 20:44:14.641', '2026-01-26 15:39:52.399', NULL, NULL),
(112, '746160715612', 'Swiss Army Multitool', 'Victorinox', 'Multi Tools', 'Gudang', 'Limited Edition', 'pcs', 2, 0, 0, 1, '2026-01-25 20:44:14.662', '2026-01-25 20:51:35.219', NULL, NULL),
(113, '0406381333931', 'Multi Purpose Tool Set', 'Generic', 'Hand Tools', 'Gudang', 'Assorted', 'set', 15, 0, 0, 1, '2026-01-25 20:44:14.680', '2026-01-25 20:51:35.225', NULL, NULL),
(114, '728370450088', 'Mini Pliers Set', 'Generic', 'Pliers', 'Gudang', 'Mini', 'set', 18, 0, 0, 1, '2026-01-25 20:44:14.688', '2026-01-25 20:51:35.229', NULL, NULL),
(115, '797681946238', 'Wire Cutter Pliers', 'Kingsdun', 'Pliers', 'Gudang', 'Flush Cutter', 'pcs', 22, 0, 0, 1, '2026-01-25 20:44:14.698', '2026-01-25 20:51:35.234', NULL, NULL),
(116, '711639924452', 'Socket Extension Set', 'DEKOPRO', 'Socket Tools', 'Gudang', 'Extension Set', 'set', 9, 0, 0, 1, '2026-01-25 20:44:14.705', '2026-01-25 20:51:35.240', NULL, NULL),
(117, '711639924453', 'Ratchet Handle Set', 'DEKOPRO', 'Socket Tools', 'Gudang', 'Ratchet', 'set', 6, 0, 0, 1, '2026-01-25 20:44:14.714', '2026-01-25 20:51:35.245', NULL, NULL),
(118, '840332391281', 'Furniture Assembly Tool Kit', 'YITAHOME', 'Furniture Tools', 'Gudang', 'Assembly Kit', 'set', 8, 0, 0, 1, '2026-01-25 20:44:14.724', '2026-01-25 20:51:35.250', NULL, NULL),
(119, '810081949812', 'Compact Multi Tool', 'Gentlemen’s Hardware', 'Multi Tools', 'Gudang', 'Compact', 'pcs', 9, 0, 0, 1, '2026-01-25 20:44:14.733', '2026-01-26 16:02:25.533', NULL, NULL),
(120, '850039064587', 'Magnetic Driver Set', 'INTERTOOL', 'Screwdrivers', 'Gudang', 'Driver Set', 'set', 7, 0, 0, 1, '2026-01-25 20:44:14.742', '2026-01-25 20:51:35.260', NULL, NULL),
(121, '778862064225', 'Home Tool Set', 'TACKLIFE', 'Tool Set', 'Gudang', '60 pcs', 'set', 5, 0, 0, 1, '2026-01-25 20:44:14.751', '2026-01-25 20:51:35.265', NULL, NULL),
(122, '716350797990', 'Mini Tool Kit', 'RAK Pro Tools', 'Tool Set', 'Gudang', 'Compact', 'set', 10, 0, 0, 1, '2026-01-25 20:44:14.759', '2026-01-25 20:51:35.270', NULL, NULL),
(123, '0038728037060', 'Basic Home Tool Kit', 'General Tools', 'Tool Set', 'Gudang', 'WS-0101', 'set', 13, 0, 0, 1, '2026-01-25 20:44:14.768', '2026-01-26 15:39:52.381', NULL, NULL),
(124, '08442960668036', 'Large Tool Kit', 'Generic', 'Tool Set', 'Gudang', '130 pcs', 'set', 4, 0, 0, 1, '2026-01-25 20:44:14.778', '2026-01-25 20:51:35.280', NULL, NULL),
(125, '731161037559', 'Tool Box Organizer', 'Keter', 'Storage', 'Gudang', '18 inch', 'pcs', 6, 0, 0, 1, '2026-01-25 20:44:14.788', '2026-01-25 20:51:35.285', NULL, NULL),
(126, '6973107486746', 'Cross Screwdriver', 'Deli Tools', 'Screwdrivers', 'Gudang', 'PH1 x 75mm Yellow', 'pcs', 5, 0, 0, 1, '2026-01-25 20:44:14.797', '2026-01-26 02:27:13.680', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `id` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `letak` varchar(191) DEFAULT NULL,
  `itemsCsv` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `locations`
--

INSERT INTO `locations` (`id`, `code`, `name`, `letak`, `itemsCsv`) VALUES
('cmkqjjkit00026h4s02pb2dth', 'RAK01', 'Rak01 - gudang utama', 'Gudang Utama', 'paku, baut, fastener'),
('cmkqjjkix00036h4saqmgbbje', 'RAK02', 'Rak02 - gudang utama', 'Gudang Utama', 'lem, cat, finishing, cairan kaleng'),
('cmkqjjkiz00046h4sqw5xacrp', 'RAK03', 'Rak03 - gudang utama', 'Gudang Utama', 'meteran, APD, gergaji, palu, mesin kabel'),
('cmkqjjkj000056h4s1keldzwn', 'RAK04', 'Rak04 - gudang utama', 'Gudang Utama', 'kayu lembaran, plywood, MDF');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` varchar(191) NOT NULL,
  `content` text NOT NULL,
  `senderId` varchar(191) NOT NULL,
  `receiverId` varchar(191) NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `content`, `senderId`, `receiverId`, `isRead`, `createdAt`) VALUES
('cmkuiw1z20005ut54gsxotiul', '22752cc0b7f789fc903f2f5d9dbb742c:3fabb08b2669d64ef0efeda0d112ff41', 'cmjzkxxp40000du3webn78thb', 'dae4cdca-e969-11f0-984e-8447095bc55d', 1, '2026-01-26 02:02:50.750');

-- --------------------------------------------------------

--
-- Table structure for table `picklists`
--

CREATE TABLE `picklists` (
  `id` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `projectId` varchar(191) DEFAULT NULL,
  `title` varchar(191) DEFAULT NULL,
  `status` enum('READY','PICKING','PICKED','DELIVERED','CANCELED') NOT NULL DEFAULT 'READY',
  `mode` enum('INTERNAL','EXTERNAL') NOT NULL DEFAULT 'INTERNAL',
  `neededAt` datetime(3) DEFAULT NULL,
  `assigneeId` varchar(191) DEFAULT NULL,
  `createdById` varchar(191) NOT NULL,
  `startedById` varchar(191) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `startedAt` datetime(3) DEFAULT NULL,
  `pickedAt` datetime(3) DEFAULT NULL,
  `deliveredAt` datetime(3) DEFAULT NULL,
  `canceledAt` datetime(3) DEFAULT NULL,
  `pickingImage` longtext DEFAULT NULL,
  `returnImage` longtext DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `picklists`
--

INSERT INTO `picklists` (`id`, `code`, `projectId`, `title`, `status`, `mode`, `neededAt`, `assigneeId`, `createdById`, `startedById`, `notes`, `startedAt`, `pickedAt`, `deliveredAt`, `canceledAt`, `pickingImage`, `returnImage`, `createdAt`, `updatedAt`) VALUES
('cmkuja45k000but54t1hzhb7c', 'PL-20260126-0001', 'cmkqo9gpx000edwc3mk5bp8jj', 'p', 'PICKED', 'INTERNAL', '2026-01-26 02:13:00.000', 'dae4cdca-e969-11f0-984e-8447095bc55d', 'cmjzkxxp40000du3webn78thb', 'dae4cdca-e969-11f0-984e-8447095bc55d', '', '2026-01-26 02:22:59.354', '2026-01-26 02:27:13.627', NULL, NULL, '/uploads/evidence/3aefa3f6-e485-4c32-8d9d-3d9714a29104.jpg', NULL, '2026-01-26 02:13:46.760', '2026-01-26 02:27:13.631'),
('cmkvc2r9z0001ut9kwinviwmg', 'PL-20260126-0002', 'cmkqo9gpx000edwc3mk5bp8jj', 'Pengambilan Mandiri (Self-Service)', 'PICKED', 'INTERNAL', '2026-01-26 15:39:52.334', 'dae4cdca-e969-11f0-984e-8447095bc55d', 'dae4cdca-e969-11f0-984e-8447095bc55d', 'dae4cdca-e969-11f0-984e-8447095bc55d', NULL, '2026-01-26 15:39:52.334', '2026-01-26 15:39:52.334', NULL, NULL, '/uploads/evidence/d10160f7-fb58-414d-b171-2c55cebabdb2.jpg', NULL, '2026-01-26 15:39:52.340', '2026-01-26 15:39:52.340'),
('cmkvcvrdu000but9k5ic5rmlz', 'PL-20260126-0003', 'cmkqo9gpx000edwc3mk5bp8jj', 'Pengambilan Mandiri (Self-Service)', 'DELIVERED', 'INTERNAL', '2026-01-26 16:02:25.503', 'dae4cdca-e969-11f0-984e-8447095bc55d', 'dae4cdca-e969-11f0-984e-8447095bc55d', 'dae4cdca-e969-11f0-984e-8447095bc55d', NULL, '2026-01-26 16:02:25.503', '2026-01-26 16:02:25.503', '2026-01-26 16:02:59.885', NULL, '/uploads/evidence/2dc0ffb6-c129-44ed-b55e-bc5c213bb3ab.jpg', '/uploads/evidence/eabc499a-9b1b-4d34-8fcd-4e3f58e09b80.jpg', '2026-01-26 16:02:25.506', '2026-01-26 16:02:59.887');

-- --------------------------------------------------------

--
-- Table structure for table `picklist_events`
--

CREATE TABLE `picklist_events` (
  `id` varchar(191) NOT NULL,
  `picklistId` varchar(191) NOT NULL,
  `eventType` varchar(191) NOT NULL,
  `actorUserId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `picklist_events`
--

INSERT INTO `picklist_events` (`id`, `picklistId`, `eventType`, `actorUserId`, `createdAt`) VALUES
('cmkujlyjh000hut54acuolqgp', 'cmkuja45k000but54t1hzhb7c', 'START_PICKING', 'dae4cdca-e969-11f0-984e-8447095bc55d', '2026-01-26 02:22:59.357'),
('cmkujreqn000nut54zdojcjfv', 'cmkuja45k000but54t1hzhb7c', 'FINISH_PICKING', 'dae4cdca-e969-11f0-984e-8447095bc55d', '2026-01-26 02:27:13.631'),
('cmkvc2ra00009ut9kug9bxrd7', 'cmkvc2r9z0001ut9kwinviwmg', 'SELF_SERVICE_PICK', 'dae4cdca-e969-11f0-984e-8447095bc55d', '2026-01-26 15:39:52.340'),
('cmkvcvrdu000iut9kev71nug3', 'cmkvcvrdu000but9k5ic5rmlz', 'SELF_SERVICE_PICK', 'dae4cdca-e969-11f0-984e-8447095bc55d', '2026-01-26 16:02:25.506'),
('cmkvcwhwz000kut9kemmbtttj', 'cmkvcvrdu000but9k5ic5rmlz', 'RETURN_AND_DELIVER', 'dae4cdca-e969-11f0-984e-8447095bc55d', '2026-01-26 16:02:59.887');

-- --------------------------------------------------------

--
-- Table structure for table `picklist_evidence`
--

CREATE TABLE `picklist_evidence` (
  `id` varchar(191) NOT NULL,
  `picklistId` varchar(191) NOT NULL,
  `imageUrl` longtext NOT NULL,
  `type` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `picklist_evidence`
--

INSERT INTO `picklist_evidence` (`id`, `picklistId`, `imageUrl`, `type`, `createdAt`) VALUES
('cmkujreqn000out54o902vyxq', 'cmkuja45k000but54t1hzhb7c', '/uploads/evidence/3aefa3f6-e485-4c32-8d9d-3d9714a29104.jpg', 'PICKING', '2026-01-26 02:27:13.631'),
('cmkujreqn000put54n8qtsw69', 'cmkuja45k000but54t1hzhb7c', '/uploads/evidence/b81fd547-a1bf-4f9e-a52e-1e60c1216a3c.jpg', 'PICKING', '2026-01-26 02:27:13.631'),
('cmkvc2ra00002ut9ka7vl60rg', 'cmkvc2r9z0001ut9kwinviwmg', '/uploads/evidence/d10160f7-fb58-414d-b171-2c55cebabdb2.jpg', 'PICKING', '2026-01-26 15:39:52.340'),
('cmkvc2ra00003ut9krtxq0ojr', 'cmkvc2r9z0001ut9kwinviwmg', '/uploads/evidence/76546cd8-924a-4024-bd31-99f706c51375.jpg', 'PICKING', '2026-01-26 15:39:52.340'),
('cmkvcvrdu000cut9kxhy19e3a', 'cmkvcvrdu000but9k5ic5rmlz', '/uploads/evidence/2dc0ffb6-c129-44ed-b55e-bc5c213bb3ab.jpg', 'PICKING', '2026-01-26 16:02:25.506'),
('cmkvcvrdu000dut9k8wfqm3nd', 'cmkvcvrdu000but9k5ic5rmlz', '/uploads/evidence/ef424bd8-f6c3-4c4a-89f9-5194129481f8.jpg', 'PICKING', '2026-01-26 16:02:25.506'),
('cmkvcvrdu000eut9ktr1wvj5k', 'cmkvcvrdu000but9k5ic5rmlz', '/uploads/evidence/358e0473-72b9-4de1-a0b8-297c680bb420.jpg', 'PICKING', '2026-01-26 16:02:25.506'),
('cmkvcwhx0000lut9ky11v9rq2', 'cmkvcvrdu000but9k5ic5rmlz', '/uploads/evidence/eabc499a-9b1b-4d34-8fcd-4e3f58e09b80.jpg', 'RETURN', '2026-01-26 16:02:59.887');

-- --------------------------------------------------------

--
-- Table structure for table `picklist_lines`
--

CREATE TABLE `picklist_lines` (
  `id` varchar(191) NOT NULL,
  `picklistId` varchar(191) NOT NULL,
  `itemId` int(11) NOT NULL,
  `reqQty` int(11) NOT NULL,
  `pickedQty` int(11) NOT NULL DEFAULT 0,
  `usedQty` int(11) NOT NULL DEFAULT 0,
  `returnedQty` int(11) NOT NULL DEFAULT 0,
  `notes` varchar(191) DEFAULT NULL,
  `stockMode` varchar(191) NOT NULL DEFAULT 'baru'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `picklist_lines`
--

INSERT INTO `picklist_lines` (`id`, `picklistId`, `itemId`, `reqQty`, `pickedQty`, `usedQty`, `returnedQty`, `notes`, `stockMode`) VALUES
('cmkuja45k000dut54tlbuz96k', 'cmkuja45k000but54t1hzhb7c', 126, 13, 13, 0, 0, NULL, 'baru'),
('cmkvc2ra00005ut9kv92ttn6m', 'cmkvc2r9z0001ut9kwinviwmg', 123, 1, 1, 0, 0, NULL, 'baru'),
('cmkvc2ra00006ut9kh0gqs54b', 'cmkvc2r9z0001ut9kwinviwmg', 119, 1, 1, 0, 0, NULL, 'baru'),
('cmkvc2ra00007ut9kcm4bfh8d', 'cmkvc2r9z0001ut9kwinviwmg', 111, 1, 1, 0, 0, NULL, 'baru'),
('cmkvcvrdu000gut9kxjvtf9aj', 'cmkvcvrdu000but9k5ic5rmlz', 119, 1, 1, 1, 0, NULL, 'baru');

-- --------------------------------------------------------

--
-- Table structure for table `project`
--

CREATE TABLE `project` (
  `id` varchar(191) NOT NULL,
  `namaProjek` varchar(191) NOT NULL,
  `namaKlien` varchar(191) NOT NULL,
  `noHpWa` varchar(191) NOT NULL,
  `keperluan` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `tglPesan` date DEFAULT NULL,
  `tglPengerjaan` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project`
--

INSERT INTO `project` (`id`, `namaProjek`, `namaKlien`, `noHpWa`, `keperluan`, `createdAt`, `updatedAt`, `tglPesan`, `tglPengerjaan`) VALUES
('cmkqo9gpx000edwc3mk5bp8jj', 'Lemari Sepatu - Pekayon', 'Bu Maya', '+628127260110', 'Solid surface top + sink + bracket', '2026-01-23 09:22:09.765', '2026-01-23 09:22:09.765', NULL, NULL),
('db99137b-e977-11f0-984e-8447095bc55d', 'Kitchen Set - Bekasi Barat', 'Bu Sari', '+628126688699', 'Plywood + HPL + hardware softclose', '2026-01-04 21:15:44.310', '2026-01-04 21:15:44.310', '2025-01-14', '2025-02-04'),
('db9aeb51-e977-11f0-984e-8447095bc55d', 'Wardrobe - Bekasi Timur', 'Pak Budi', '+628128686841', 'HMR + finishing duco (cat) + handle premium', '2026-01-04 21:15:44.322', '2026-01-04 21:15:44.322', '2025-02-03', '2025-03-10'),
('db9d688f-e977-11f0-984e-8447095bc55d', 'Backdrop TV - Bekasi Selatan', 'Bu Rina', '+628128012498', 'Multiplek + finishing melamine + rel laci', '2026-01-04 21:15:44.336', '2026-01-23 08:55:08.223', '2025-02-21', '2025-03-14'),
('db9e86e2-e977-11f0-984e-8447095bc55d', 'Partisi - Bekasi Utara', 'Pak Andi', '+628129577082', 'Kaca + aluminium (pintu/etalase) + sealant', '2026-01-04 21:15:44.346', '2026-01-04 21:15:44.346', '2025-03-12', '2025-04-09'),
('db9fb4c2-e977-11f0-984e-8447095bc55d', 'Meja Kerja - Cikarang', 'Bu Dewi', '+628124342201', 'LED cabinet + adaptor + sensor pintu', '2026-01-04 21:15:44.354', '2026-01-04 21:15:44.354', '2025-04-07', '2025-04-28'),
('dba0fc32-e977-11f0-984e-8447095bc55d', 'Rak Sepatu - Tambun', 'Pak Hendra', '+628129550666', 'Solid surface top + sink + bracket', '2026-01-04 21:15:44.362', '2026-01-04 21:15:44.362', '2025-05-19', '2025-06-02'),
('dba2183a-e977-11f0-984e-8447095bc55d', 'Lemari Dapur - Babelan', 'Bu Lestari', '+628125016572', 'Upholstery headboard + foam + kain', '2026-01-04 21:15:44.369', '2026-01-04 21:15:44.369', '2025-06-09', '2025-07-24'),
('dba31693-e977-11f0-984e-8447095bc55d', 'Headboard - Jatiasih', 'Pak Rizky', '+628125620194', 'Plywood + HPL + hardware softclose', '2026-01-04 21:15:44.376', '2026-01-04 21:15:44.376', '2025-07-01', '2025-07-22'),
('dba4178c-e977-11f0-984e-8447095bc55d', 'Rak Display - Medansatria', 'Bu Nia', '+628129952948', 'HMR + finishing duco (cat) + handle premium', '2026-01-04 21:15:44.382', '2026-01-04 21:15:44.382', '2025-08-14', '2025-09-28'),
('dba518be-e977-11f0-984e-8447095bc55d', 'Laundry Cabinet - Jatisampurna', 'Pak Dimas', '+628123424979', 'Multiplek + finishing melamine + rel laci', '2026-01-04 21:15:44.389', '2026-01-04 21:15:44.389', '2025-09-08', '2025-10-13'),
('dba6146c-e977-11f0-984e-8447095bc55d', 'Pantry - Harapan Indah', 'Bu Wati', '+628127590997', 'Kaca + aluminium (pintu/etalase) + sealant', '2026-01-04 21:15:44.395', '2026-01-04 21:15:44.395', '2025-10-20', '2025-11-03'),
('dba70a24-e977-11f0-984e-8447095bc55d', 'Kabinet TV - Bintara', 'Pak Arif', '+628124689238', 'LED cabinet + adaptor + sensor pintu', '2026-01-04 21:15:44.402', '2026-01-04 21:15:44.402', '2025-11-11', '2025-12-02'),
('dba8100c-e977-11f0-984e-8447095bc55d', 'Lemari Sepatu - Pekayon', 'Bu Maya', '+628127260110', 'Solid surface top + sink + bracket', '2026-01-04 21:15:44.408', '2026-01-23 09:22:04.474', '2025-12-02', '2025-12-23');

-- --------------------------------------------------------

--
-- Table structure for table `stock_in_batches`
--

CREATE TABLE `stock_in_batches` (
  `id` int(11) NOT NULL,
  `itemId` int(11) NOT NULL,
  `date` datetime(3) NOT NULL,
  `qtyInBase` bigint(20) NOT NULL,
  `unitCost` bigint(20) NOT NULL,
  `qtyRemaining` bigint(20) NOT NULL,
  `note` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `supplierId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stock_in_batches`
--

INSERT INTO `stock_in_batches` (`id`, `itemId`, `date`, `qtyInBase`, `unitCost`, `qtyRemaining`, `note`, `createdAt`, `supplierId`) VALUES
(67, 101, '2026-01-25 20:44:14.434', 10, 50000, 0, 'mode:baru||Import Awal', '2026-01-25 20:44:14.442', NULL),
(68, 102, '2026-01-25 20:44:14.469', 5, 250000, 5, 'mode:baru||Import Awal', '2026-01-25 20:44:14.475', NULL),
(69, 103, '2026-01-25 20:44:14.483', 8, 75000, 8, 'mode:baru||Import Awal', '2026-01-25 20:44:14.489', NULL),
(70, 104, '2026-01-25 20:44:14.492', 12, 150000, 12, 'mode:baru||Import Awal', '2026-01-25 20:44:14.498', NULL),
(71, 105, '2026-01-25 20:44:14.501', 20, 45000, 20, 'mode:baru||Import Awal', '2026-01-25 20:44:14.507', NULL),
(72, 106, '2026-01-25 20:44:14.510', 3, 450000, 3, 'mode:baru||Import Awal', '2026-01-25 20:44:14.517', NULL),
(73, 107, '2026-01-25 20:44:14.539', 4, 350000, 4, 'mode:baru||Import Awal', '2026-01-25 20:44:14.546', NULL),
(74, 108, '2026-01-25 20:44:14.552', 6, 180000, 6, 'mode:baru||Import Awal', '2026-01-25 20:44:14.558', NULL),
(75, 109, '2026-01-25 20:44:14.611', 10, 120000, 10, 'mode:baru||Import Awal', '2026-01-25 20:44:14.618', NULL),
(76, 110, '2026-01-25 20:44:14.623', 2, 1250000, 2, 'mode:baru||Import Awal', '2026-01-25 20:44:14.629', NULL),
(77, 111, '2026-01-25 20:44:14.646', 7, 850000, 6, 'mode:baru||Import Awal', '2026-01-25 20:44:14.652', NULL),
(78, 112, '2026-01-25 20:44:14.667', 2, 1500000, 2, 'mode:baru||Import Awal', '2026-01-25 20:44:14.673', NULL),
(79, 113, '2026-01-25 20:44:14.678', 15, 100000, 15, 'mode:baru||Import Awal', '2026-01-25 20:44:14.685', NULL),
(80, 114, '2026-01-25 20:44:14.687', 18, 35000, 18, 'mode:baru||Import Awal', '2026-01-25 20:44:14.693', NULL),
(81, 115, '2026-01-25 20:44:14.696', 22, 40000, 22, 'mode:baru||Import Awal', '2026-01-25 20:44:14.702', NULL),
(82, 116, '2026-01-25 20:44:14.704', 9, 95000, 9, 'mode:baru||Import Awal', '2026-01-25 20:44:14.710', NULL),
(83, 117, '2026-01-25 20:44:14.714', 6, 110000, 6, 'mode:baru||Import Awal', '2026-01-25 20:44:14.720', NULL),
(84, 118, '2026-01-25 20:44:14.722', 8, 140000, 8, 'mode:baru||Import Awal', '2026-01-25 20:44:14.729', NULL),
(85, 119, '2026-01-25 20:44:14.731', 11, 220000, 9, 'mode:baru||Import Awal', '2026-01-25 20:44:14.737', NULL),
(86, 120, '2026-01-25 20:44:14.739', 7, 160000, 7, 'mode:baru||Import Awal', '2026-01-25 20:44:14.746', NULL),
(87, 121, '2026-01-25 20:44:14.749', 5, 280000, 5, 'mode:baru||Import Awal', '2026-01-25 20:44:14.755', NULL),
(88, 122, '2026-01-25 20:44:14.757', 10, 90000, 10, 'mode:baru||Import Awal', '2026-01-25 20:44:14.763', NULL),
(89, 123, '2026-01-25 20:44:14.767', 14, 130000, 13, 'mode:baru||Import Awal', '2026-01-25 20:44:14.773', NULL),
(90, 124, '2026-01-25 20:44:14.777', 4, 320000, 4, 'mode:baru||Import Awal', '2026-01-25 20:44:14.783', NULL),
(91, 125, '2026-01-25 20:44:14.786', 6, 275000, 6, 'mode:baru||Import Awal', '2026-01-25 20:44:14.792', NULL),
(92, 126, '2026-01-25 20:44:14.797', 30, 18000, 0, 'mode:baru||Import Awal', '2026-01-25 20:44:14.803', NULL),
(93, 101, '2026-01-25 00:00:00.000', 10, 10000, 0, 'mode:baru||', '2026-01-25 20:53:09.056', NULL),
(94, 126, '2026-01-26 00:00:00.000', 10, 1000, 5, 'mode:baru||', '2026-01-26 00:12:23.782', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `supplier`
--

CREATE TABLE `supplier` (
  `id` int(11) NOT NULL,
  `namaToko` varchar(191) NOT NULL,
  `keperluanItems` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`keperluanItems`)),
  `alamat` text NOT NULL,
  `mapsUrl` text DEFAULT NULL,
  `noTelp` varchar(50) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `supplier`
--

INSERT INTO `supplier` (`id`, `namaToko`, `keperluanItems`, `alamat`, `mapsUrl`, `noTelp`, `createdAt`, `updatedAt`) VALUES
(1, 'Toko MDF', '[\"Plywood\",\"MDF\",\"HMR\",\"Blockboard\",\"Lem Kayu\" , \"Kabel Ties\"]', 'Jl. Raya Sultan Agung, Medansatria, Bekasi', 'https://maps.google.com/?q=Bekasi+Plywood+MDF+Medansatria', '+6281212345601', '2026-01-04 13:38:55.366', '2026-01-04 13:58:04.629'),
(2, 'Toko Aluminium & Kaca Temperad', '[\"Aluminium Profil\", \"Kaca\", \"Kusen\", \"Pintu\", \"Jendela\", \"Aksesoris Kaca\"]', 'Jl. K.H Noer Ali RT/RW 03/05, Jakasampurna, Bekasi Barat, Kota Bekasi 17133', 'https://www.google.com/maps/search/?api=1&query=Jl.%20K.H%20Noer%20Ali%20RT/RW%2003/05%2C%20Jakasampurna%2C%20Bekasi%20Barat%2C%20Kota%20Bekasi%2017133', '085884887881', '2026-01-04 21:05:07.695', '2026-01-04 21:08:45.000'),
(3, 'HIKARI Aluminium Ltd', '[\"Aluminium Profil\", \"Kusen Aluminium\", \"Aksesoris Kusen\", \"Sealant\", \"Kaca\"]', 'Jl. Raya Mustikajaya Mutiara Gading Timur 2 Blok, Mustika Jaya, Bekasi Timur, Kota Bekasi 17158', 'https://www.google.com/maps/search/?api=1&query=Jl.%20Raya%20Mustikajaya%20Mutiara%20Gading%20Timur%202%20Blok%2C%20Mustika%20Jaya%2C%20Bekasi%20Timur%2C%20Kota%20Bekasi%2017158', '081315697475', '2026-01-04 21:05:07.719', '2026-01-04 21:08:45.000'),
(4, 'Toko Kaca & Aluminium Yura Glass Pekayon', '[\"Kaca\", \"Aluminium Profil\", \"Kusen\", \"Pintu\", \"Jendela\", \"Aksesoris\"]', 'Jl. Irigasi RT.002/RW.017, Pekayon Jaya, Bekasi Selatan, Kota Bekasi 17148', 'https://www.google.com/maps/search/?api=1&query=Jl.%20Irigasi%20RT.002/RW.017%2C%20Pekayon%20Jaya%2C%20Bekasi%20Selatan%2C%20Kota%20Bekasi%2017148', '085717278958', '2026-01-04 21:05:07.727', '2026-01-04 21:08:45.000'),
(5, 'Toko Kaca dan Aluminium (Galaksi)', '[\"Kaca\", \"Aluminium Profil\", \"Pintu Lipat\", \"Kusen\", \"Aksesoris Kaca\"]', 'Galaksi, RT.001/RW.014, Jaka Setia, Bekasi Selatan, Kota Bekasi 17148', 'https://www.google.com/maps/search/?api=1&query=Galaksi%2C%20RT.001/RW.014%2C%20Jaka%20Setia%2C%20Bekasi%20Selatan%2C%20Kota%20Bekasi%2017148', '085287898790', '2026-01-04 21:05:07.735', '2026-01-04 21:08:45.000'),
(6, 'Sulis Kaca Alumunium', '[\"Kaca\", \"Aluminium Profil\", \"Kusen\", \"Aksesoris Kaca\", \"Sealant\"]', 'Jl. Bacang Raya No.61, Pekayon Jaya, Bekasi Selatan, Kota Bekasi 17148', 'https://www.google.com/maps/search/?api=1&query=Jl.%20Bacang%20Raya%20No.61%2C%20Pekayon%20Jaya%2C%20Bekasi%20Selatan%2C%20Kota%20Bekasi%2017148', '087837920618', '2026-01-04 21:05:07.744', '2026-01-04 21:08:45.000'),
(7, 'Toko Kaca Satria Karya Aluminium', '[\"Kaca\", \"Aluminium Profil\", \"Kusen\", \"Etalase\", \"Aksesoris\"]', 'Jl. R. H. Umar / Jl. Kp. Utan No.87, Jaka Setia, Bekasi Selatan, Kota Bekasi 17147', 'https://www.google.com/maps/search/?api=1&query=Jl.%20R.%20H.%20Umar%20/%20Jl.%20Kp.%20Utan%20No.87%2C%20Jaka%20Setia%2C%20Bekasi%20Selatan%2C%20Kota%20Bekasi%2017147', '081281482939', '2026-01-04 21:05:07.752', '2026-01-04 21:08:45.000'),
(8, 'Berkah Aluminium', '[\"Aluminium Profil\", \"Pintu Aluminium\", \"Jendela Aluminium\", \"Etalase\", \"Kaca\"]', 'Kp. Cisalak, Jl. Odeh No.73, Sumur Batu, Bantar Gebang, Kota Bekasi 17154', 'https://www.google.com/maps/search/?api=1&query=Kp.%20Cisalak%2C%20Jl.%20Odeh%20No.73%2C%20Sumur%20Batu%2C%20Bantar%20Gebang%2C%20Kota%20Bekasi%2017154', '081219281983', '2026-01-04 21:05:07.759', '2026-01-04 21:08:45.000'),
(9, 'Sinar Gemilang', '[\"Kusen Aluminium\", \"Kaca\", \"Pintu\", \"Jendela\", \"Aksesoris Kusen\"]', 'Jl. Bintara Jaya Raya No.7E, Bintara Jaya, Bekasi Barat, Kota Bekasi 17136', 'https://www.google.com/maps/search/?api=1&query=Jl.%20Bintara%20Jaya%20Raya%20No.7E%2C%20Bintara%20Jaya%2C%20Bekasi%20Barat%2C%20Kota%20Bekasi%2017136', '081289078485', '2026-01-04 21:05:07.767', '2026-01-04 21:08:45.000'),
(10, 'Toko Kaca Alumunium Putrajaya', '[\"Kaca\", \"Aluminium Profil\", \"Kusen\", \"Pintu\", \"Jendela\", \"Aksesoris\"]', 'Jl. Masjid Hidayatullah No.60, Jaka Setia, Bekasi Selatan, Kota Bekasi 17147', 'https://www.google.com/maps/search/?api=1&query=Jl.%20Masjid%20Hidayatullah%20No.60%2C%20Jaka%20Setia%2C%20Bekasi%20Selatan%2C%20Kota%20Bekasi%2017147', '082268381261', '2026-01-04 21:05:07.774', '2026-01-04 21:08:45.000'),
(11, 'Optima Aluminium (PT Nagakaya Optima Adiperkasa)', '[\"Aluminium Profil\", \"ACP\", \"Sealant\", \"Aksesoris Kusen\", \"Hardware\"]', 'Ruko Permata Harapan Baru Blok H No 57-59, Jl. Raya Pejuang Jaya, Pejuang, Medan Satria, Bekasi', 'https://www.google.com/maps/search/?api=1&query=Ruko%20Permata%20Harapan%20Baru%20Blok%20H%20No%2057-59%2C%20Jl.%20Raya%20Pejuang%20Jaya%2C%20Pejuang%2C%20Medan%20Satria%2C%20Bekasi', '081818886935', '2026-01-04 21:05:07.783', '2026-01-04 21:08:45.000'),
(12, 'CV Tropika Perkasa', '[\"Plywood\", \"Blockboard\", \"Film Faced Plywood\", \"OSB\", \"Marine Plywood\"]', 'Jl. Raya Setu Kampung Utan RT.001/RW.009, Telajung, Cikarang Barat, Kab. Bekasi, Jawa Barat 17530', 'https://www.google.com/maps/search/?api=1&query=Jl.%20Raya%20Setu%20Kampung%20Utan%20RT.001/RW.009%2C%20Telajung%2C%20Cikarang%20Barat%2C%20Kab.%20Bekasi%2C%20Jawa%20Barat%2017530', '+6289547935775', '2026-01-04 21:05:07.789', '2026-01-04 21:08:45.000'),
(13, 'PT Tanjung Jayaprima Abadi', '[\"Plywood\", \"MDF\", \"HMR\", \"Blockboard\", \"HPL\", \"Lem Kayu\"]', 'Jl. Raya Bekasi Km.18 RT.008 RW.011, Jatinegara, Cakung, Jakarta Timur', 'https://www.google.com/maps/search/?api=1&query=Jl.%20Raya%20Bekasi%20Km.18%20RT.008%20RW.011%2C%20Jatinegara%2C%20Cakung%2C%20Jakarta%20Timur', '+6289636822555', '2026-01-04 21:05:07.795', '2026-01-04 21:08:45.000'),
(14, 'Toko Sinar Abadi HPL', '[\"HPL\", \"Lem Kuning\", \"Edging PVC\", \"Multiplek\", \"MDF\"]', 'Jl. Alternatif Cibubur, RT.002/RW.3, Jatisampurna, Kota Bekasi, Jawa Barat 17435', 'https://www.google.com/maps/search/?api=1&query=Jl.%20Alternatif%20Cibubur%2C%20RT.002/RW.3%2C%20Jatisampurna%2C%20Kota%20Bekasi%2C%20Jawa%20Barat%2017435', '082113825589', '2026-01-04 21:05:07.802', '2026-01-04 21:08:45.000');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` varchar(191) NOT NULL,
  `employeeId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `role` enum('OWNER','ADMIN','PURCHASING','WAREHOUSE_LEAD','WORKER') NOT NULL,
  `passwordHash` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `authType` enum('PIN','PASSWORD') DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `lastLoginAt` datetime(3) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `resetCode` varchar(191) DEFAULT NULL,
  `resetCodeExpiresAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `employeeId`, `name`, `role`, `passwordHash`, `createdAt`, `updatedAt`, `authType`, `isActive`, `lastLoginAt`, `notes`, `phone`, `resetCode`, `resetCodeExpiresAt`) VALUES
('cmjzkxxp40000du3webn78thb', 'ADM-001', 'Admin', 'ADMIN', '$2a$10$mVsKsJ.zvEzW3if4OIZIs.5vmTmvrwunJtTA7XPkQvGO6Wzzj/Gaa', '2026-01-04 10:19:26.297', '2026-01-26 16:04:00.963', 'PASSWORD', 1, '2026-01-26 16:04:00.959', NULL, NULL, NULL, NULL),
('cmjzkykaq0000141gtbszgst2', 'ADM-002', 'Yuliana Setianingrum', 'ADMIN', 'admin2', '2026-01-04 10:19:55.586', '2026-01-26 02:04:47.347', 'PASSWORD', 1, '2026-01-26 02:04:47.343', NULL, NULL, NULL, NULL),
('cmjzmrshe0000c37qk1xr5qws', 'ADM-003', 'Putri', 'ADMIN', 'ADM-003', '2026-01-04 11:10:38.834', '2026-01-05 18:56:18.847', 'PASSWORD', 1, '2026-01-05 18:56:18.838', NULL, NULL, NULL, NULL),
('cmkqjdqhq0000agucccyxnig9', 'OWN-001', 'Owner', 'ADMIN', '$2a$10$pMtiwgshLt1LMZwvPQGvreOJPKn/.L4tw.zDJ1siRkKEmkqQ3wx7i', '2026-01-23 07:05:30.973', '2026-01-23 07:05:30.973', NULL, 1, NULL, NULL, NULL, NULL, NULL),
('dae4cdca-e969-11f0-984e-8447095bc55d', 'WKR-001', 'Slamet', 'WORKER', '$2a$10$6fChK3vyc0AbqP76BfyXn.eqKzeYWa844b9.KaGE59UGwrnWYaG1i', '2026-01-04 19:35:30.174', '2026-01-26 16:01:39.197', 'PASSWORD', 1, '2026-01-26 16:01:39.194', NULL, '09748378545', NULL, NULL),
('dae4e36c-e969-11f0-984e-8447095bc55d', 'WKR-002', 'Sugeng Riyadi', 'WORKER', 'worker2', '2026-01-04 19:35:30.174', '2026-01-26 02:05:06.185', 'PASSWORD', 1, '2026-01-26 02:05:06.183', NULL, NULL, NULL, NULL),
('dae4e514-e969-11f0-984e-8447095bc55d', 'WKR-003', 'Joko Santoso', 'WORKER', 'WKR-003', '2026-01-04 19:35:30.174', '2026-01-04 13:12:02.309', 'PASSWORD', 1, NULL, NULL, NULL, NULL, NULL),
('dae4e685-e969-11f0-984e-8447095bc55d', 'WKR-004', 'Eko Setiawan', 'WORKER', 'WKR-004', '2026-01-04 19:35:30.174', '2026-01-04 13:12:09.681', 'PASSWORD', 1, NULL, NULL, NULL, NULL, NULL),
('dae4e864-e969-11f0-984e-8447095bc55d', 'WKR-005', 'Darto', 'WORKER', 'WKR-005', '2026-01-04 19:35:30.174', '2026-01-04 13:12:17.228', 'PASSWORD', 1, NULL, NULL, NULL, NULL, NULL),
('dae4e99f-e969-11f0-984e-8447095bc55d', 'WKR-006', 'Suyanto', 'WORKER', 'WKR-006', '2026-01-04 19:35:30.174', '2026-01-04 13:12:25.243', 'PASSWORD', 1, NULL, NULL, NULL, NULL, NULL),
('dae4ea8b-e969-11f0-984e-8447095bc55d', 'WKR-007', 'Sutrisno Wibowo', 'WORKER', 'WKR-007', '2026-01-04 19:35:30.174', '2026-01-04 13:12:33.077', 'PASSWORD', 1, NULL, NULL, NULL, NULL, NULL),
('dae4eb7f-e969-11f0-984e-8447095bc55d', 'WKR-008', 'Mulyono', 'WORKER', 'WKR-008', '2026-01-04 19:35:30.174', '2026-01-04 13:12:39.635', 'PASSWORD', 1, NULL, NULL, NULL, NULL, NULL),
('dae4ee14-e969-11f0-984e-8447095bc55d', 'WKR-009', 'Sumarno', 'WORKER', 'WKR-009', '2026-01-04 19:35:30.174', '2026-01-04 13:12:47.846', 'PASSWORD', 1, NULL, NULL, NULL, NULL, NULL),
('dae4ef31-e969-11f0-984e-8447095bc55d', 'WKR-010', 'Haryanto Prasetyo', 'WORKER', 'WKR-010', '2026-01-04 19:35:30.174', '2026-01-04 13:12:58.366', 'PASSWORD', 1, NULL, NULL, NULL, NULL, NULL),
('dae4f1a8-e969-11f0-984e-8447095bc55d', 'WKR-011', 'Bambang Triyono', 'WORKER', 'WKR-011', '2026-01-04 19:35:30.174', '2026-01-04 13:13:05.006', 'PASSWORD', 1, NULL, NULL, NULL, NULL, NULL),
('dae4f2ce-e969-11f0-984e-8447095bc55d', 'WKR-012', 'Wahyudi', 'WORKER', 'WKR-012', '2026-01-04 19:35:30.174', '2026-01-04 13:13:15.006', 'PASSWORD', 1, NULL, NULL, NULL, NULL, NULL),
('dae4f54c-e969-11f0-984e-8447095bc55d', 'WKR-013', 'Priyono Widodo', 'WORKER', 'WKR-013', '2026-01-04 19:35:30.174', '2026-01-04 13:13:25.397', 'PASSWORD', 1, NULL, NULL, NULL, NULL, NULL),
('dae4f69f-e969-11f0-984e-8447095bc55d', 'WKR-014', 'Purnomo', 'WORKER', 'WKR-014', '2026-01-04 19:35:30.174', '2026-01-04 13:13:32.518', 'PASSWORD', 1, NULL, NULL, NULL, NULL, NULL),
('dae4f775-e969-11f0-984e-8447095bc55d', 'WKR-015', 'Suparman', 'WORKER', 'WKR-015', '2026-01-04 19:35:30.174', '2026-01-04 13:13:39.640', 'PASSWORD', 1, NULL, NULL, NULL, NULL, NULL),
('dae4f860-e969-11f0-984e-8447095bc55d', 'WKR-016', 'Suroto', 'WORKER', 'WKR-016', '2026-01-04 19:35:30.174', '2026-01-04 13:13:46.267', 'PASSWORD', 1, NULL, NULL, NULL, NULL, NULL),
('dae4f946-e969-11f0-984e-8447095bc55d', 'WKR-017', 'Rudi Kurniawan', 'WORKER', 'WKR-017', '2026-01-04 19:35:30.174', '2026-01-04 13:13:52.785', 'PASSWORD', 1, NULL, NULL, NULL, NULL, NULL),
('dae4fb8a-e969-11f0-984e-8447095bc55d', 'WKR-018', 'Dwi Hartono Saputro', 'WORKER', 'WKR-018', '2026-01-04 19:35:30.174', '2026-01-04 13:14:00.722', 'PASSWORD', 1, NULL, NULL, NULL, NULL, NULL),
('dae4fcad-e969-11f0-984e-8447095bc55d', 'WKR-019', 'Arif Nugroho', 'WORKER', 'WKR-019', '2026-01-04 19:35:30.174', '2026-01-04 13:14:08.382', 'PASSWORD', 1, NULL, NULL, NULL, NULL, NULL),
('dae4fd91-e969-11f0-984e-8447095bc55d', 'WKR-020', 'Teguh Prayitno', 'WORKER', 'WKR-020', '2026-01-04 19:35:30.174', '2026-01-04 13:14:15.750', 'PASSWORD', 1, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `auditlog`
--
ALTER TABLE `auditlog`
  ADD PRIMARY KEY (`id`),
  ADD KEY `AuditLog_userId_fkey` (`userId`),
  ADD KEY `AuditLog_createdAt_idx` (`createdAt`),
  ADD KEY `AuditLog_targetUserId_idx` (`targetUserId`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `items_name_brand_size_key` (`name`,`brand`,`size`),
  ADD UNIQUE KEY `items_barcode_key` (`barcode`),
  ADD KEY `items_isActive_idx` (`isActive`),
  ADD KEY `items_updatedAt_idx` (`updatedAt`),
  ADD KEY `items_defaultSupplierId_idx` (`defaultSupplierId`),
  ADD KEY `items_locationId_fkey` (`locationId`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `locations_code_key` (`code`),
  ADD UNIQUE KEY `locations_name_key` (`name`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `messages_senderId_idx` (`senderId`),
  ADD KEY `messages_receiverId_idx` (`receiverId`);

--
-- Indexes for table `picklists`
--
ALTER TABLE `picklists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `picklists_code_key` (`code`),
  ADD KEY `picklists_assigneeId_fkey` (`assigneeId`),
  ADD KEY `picklists_createdById_fkey` (`createdById`),
  ADD KEY `picklists_startedById_fkey` (`startedById`),
  ADD KEY `picklists_projectId_fkey` (`projectId`);

--
-- Indexes for table `picklist_events`
--
ALTER TABLE `picklist_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `picklist_events_picklistId_fkey` (`picklistId`),
  ADD KEY `picklist_events_actorUserId_fkey` (`actorUserId`);

--
-- Indexes for table `picklist_evidence`
--
ALTER TABLE `picklist_evidence`
  ADD PRIMARY KEY (`id`),
  ADD KEY `picklist_evidence_picklistId_fkey` (`picklistId`);

--
-- Indexes for table `picklist_lines`
--
ALTER TABLE `picklist_lines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `picklist_lines_picklistId_fkey` (`picklistId`),
  ADD KEY `picklist_lines_itemId_fkey` (`itemId`);

--
-- Indexes for table `project`
--
ALTER TABLE `project`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `stock_in_batches`
--
ALTER TABLE `stock_in_batches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stock_in_batches_itemId_idx` (`itemId`),
  ADD KEY `stock_in_batches_supplierId_idx` (`supplierId`);

--
-- Indexes for table `supplier`
--
ALTER TABLE `supplier`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_employeeId_key` (`employeeId`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=127;

--
-- AUTO_INCREMENT for table `stock_in_batches`
--
ALTER TABLE `stock_in_batches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;

--
-- AUTO_INCREMENT for table `supplier`
--
ALTER TABLE `supplier`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `auditlog`
--
ALTER TABLE `auditlog`
  ADD CONSTRAINT `auditlog_targetUserId_fkey` FOREIGN KEY (`targetUserId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `items_defaultSupplierId_fkey` FOREIGN KEY (`defaultSupplierId`) REFERENCES `supplier` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `items_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `user` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `messages_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `picklists`
--
ALTER TABLE `picklists`
  ADD CONSTRAINT `picklists_assigneeId_fkey` FOREIGN KEY (`assigneeId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `picklists_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `picklists_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `project` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `picklists_startedById_fkey` FOREIGN KEY (`startedById`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `picklist_events`
--
ALTER TABLE `picklist_events`
  ADD CONSTRAINT `picklist_events_actorUserId_fkey` FOREIGN KEY (`actorUserId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `picklist_events_picklistId_fkey` FOREIGN KEY (`picklistId`) REFERENCES `picklists` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `picklist_evidence`
--
ALTER TABLE `picklist_evidence`
  ADD CONSTRAINT `picklist_evidence_picklistId_fkey` FOREIGN KEY (`picklistId`) REFERENCES `picklists` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `picklist_lines`
--
ALTER TABLE `picklist_lines`
  ADD CONSTRAINT `picklist_lines_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `picklist_lines_picklistId_fkey` FOREIGN KEY (`picklistId`) REFERENCES `picklists` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `stock_in_batches`
--
ALTER TABLE `stock_in_batches`
  ADD CONSTRAINT `stock_in_batches_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_in_batches_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `supplier` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
