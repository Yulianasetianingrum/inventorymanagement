-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 06, 2026 at 12:46 AM
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
('cmk0rpmyn000oej02805dssx6', 'UPDATE_USER', NULL, 'cmjzmrshe0000c37qk1xr5qws', 'cmjzmrshe0000c37qk1xr5qws', '{\"before\":{\"id\":\"cmjzmrshe0000c37qk1xr5qws\",\"employeeId\":\"ADM-003\",\"name\":\"Putri\",\"role\":\"ADMIN\",\"passwordHash\":\"$2a$10$ThFE5GCuM9irGoG3bob3h..8xjYYK8gjyi.Dxngq0WHMhl.xT.PiC\",\"createdAt\":\"2026-01-04T11:10:38.834Z\",\"updatedAt\":\"2026-01-05T06:16:40.665Z\",\"authType\":\"PASSWORD\",\"isActive\":false,\"lastLoginAt\":\"2026-01-05T06:12:22.300Z\",\"notes\":null,\"phone\":null},\"after\":{\"id\":\"cmjzmrshe0000c37qk1xr5qws\",\"employeeId\":\"ADM-003\",\"name\":\"Putri\",\"role\":\"ADMIN\",\"passwordHash\":\"$2a$10$ThFE5GCuM9irGoG3bob3h..8xjYYK8gjyi.Dxngq0WHMhl.xT.PiC\",\"createdAt\":\"2026-01-04T11:10:38.834Z\",\"updatedAt\":\"2026-01-05T06:16:42.611Z\",\"authType\":\"PASSWORD\",\"isActive\":true,\"lastLoginAt\":\"2026-01-05T06:12:22.300Z\",\"notes\":null,\"phone\":null}}', '2026-01-05 06:16:42.623');

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
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
  `defaultSupplierId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `name`, `brand`, `category`, `location`, `size`, `unit`, `stockNew`, `stockUsed`, `minStock`, `isActive`, `createdAt`, `updatedAt`, `defaultSupplierId`) VALUES
(61, 'Sekrup Gypsum 6x1', 'Krisbow', 'Fastener', 'R01-Gudang Utama', '6x1', 'pcs', 450, 0, 200, 1, '2025-12-31 08:00:53.213', '2025-12-31 08:00:55.213', NULL),
(62, 'Paku Beton 2 inch', 'Kobe', 'Fastener', 'R01-Gudang Utama', '2 inch', 'pcs', 600, 0, 250, 1, '2025-12-31 08:01:25.773', '2025-12-31 08:01:27.773', NULL),
(63, 'Fischer / Dowel 8mm', 'Fischer', 'Fastener', 'R01-Gudang Utama', '8mm', 'pcs', 320, 0, 150, 1, '2025-12-31 08:02:30.380', '2025-12-31 08:02:31.380', NULL),
(64, 'Engsel Sendok', 'Hafele', 'Hardware', 'R01-Gudang Utama', '35mm', 'pcs', 80, 0, 30, 1, '2025-12-31 08:03:17.214', '2025-12-31 08:03:21.214', NULL),
(65, 'Rel Laci Softclose', 'Hafele', 'Hardware', 'R01-Gudang Utama', '45cm', 'set', 18, 0, 8, 1, '2025-12-31 08:04:25.731', '2025-12-31 08:04:29.731', NULL),
(66, 'Handle Lemari Minimalis', 'Oliv', 'Hardware', 'R01-Gudang Utama', '128mm', 'pcs', 55, 0, 25, 1, '2025-12-31 08:05:23.876', '2025-12-31 08:05:27.876', NULL),
(67, 'Kunci Magnet Pintu', 'Dekson', 'Hardware', 'R01-Gudang Utama', NULL, 'pcs', 22, 0, 10, 1, '2025-12-31 08:06:18.098', '2025-12-31 08:06:20.098', NULL),
(68, 'Lem Kayu PVAc', 'Fox', 'Bahan', 'R02-Gudang Utama', '1kg', 'kg', 12, 0, 5, 1, '2025-12-31 08:07:11.882', '2025-12-31 08:07:12.882', NULL),
(69, 'Lem Kuning', 'Aica Aibon', 'Bahan', 'R02-Gudang Utama', '650ml', 'pcs', 9, 0, 4, 1, '2025-12-31 08:08:22.863', '2025-12-31 08:08:23.863', NULL),
(70, 'Thinner A', 'Nippon Paint', 'Bahan', 'R02-Gudang Utama', '1L', 'liter', 16, 0, 6, 1, '2025-12-31 08:09:15.284', '2025-12-31 08:09:19.284', NULL),
(71, 'Cat Duco Putih', 'Nippon Paint', 'Finishing', 'R02-Gudang Utama', '1L', 'liter', 10, 0, 4, 1, '2025-12-31 08:10:38.035', '2025-12-31 08:10:40.035', NULL),
(72, 'Clear Coat Gloss', 'Mowilex', 'Finishing', 'R02-Gudang Utama', '1L', 'liter', 7, 0, 3, 1, '2025-12-31 08:11:28.593', '2025-12-31 08:11:31.593', NULL),
(73, 'Amplas 240', '3M', 'Finishing', 'R02-Gudang Utama', '9x11', 'lembar', 120, 0, 60, 1, '2025-12-31 08:12:02.276', '2025-12-31 08:12:06.276', NULL),
(74, 'Amplas 400', '3M', 'Finishing', 'R02-Gudang Utama', '9x11', 'lembar', 90, 0, 40, 1, '2025-12-31 08:13:32.540', '2025-12-31 08:13:36.540', NULL),
(75, 'Mata Bor Kayu', 'Bosch', 'Tools', 'R04-Gudang Utama', '6mm', 'pcs', 6, 1, 4, 1, '2025-12-31 08:14:45.739', '2025-12-31 08:14:47.739', NULL),
(76, 'Mata Bor Besi', 'Bosch', 'Tools', 'R04-Gudang Utama', '8mm', 'pcs', 5, 0, 3, 1, '2025-12-31 08:15:42.696', '2025-12-31 08:15:45.696', NULL),
(77, 'Cutting Wheel', 'Makita', 'Tools', 'R04-Gudang Utama', '4 inch', 'pcs', 14, 0, 8, 1, '2025-12-31 08:16:00.362', '2025-12-31 08:16:04.362', NULL),
(78, 'Sarung Tangan Kerja', 'Wipro', 'APD', 'R04-Gudang Utama', 'L', 'pasang', 18, 0, 10, 1, '2025-12-31 08:17:50.747', '2025-12-31 08:17:54.747', NULL),
(79, 'Masker', 'Sensi', 'APD', 'R04-Gudang Utama', NULL, 'box', 6, 0, 3, 0, '2025-12-31 08:18:16.549', '2026-01-05 05:18:15.504', NULL),
(80, 'Kabel Ties', 'Krisbow', 'Listrik', 'R01-Gudang Utama', '20cm', 'pack', 65, 0, 9, 1, '2025-12-31 08:19:26.603', '2026-01-05 09:27:31.096', NULL),
(81, 'ok', 'o', 'd', 'wudfiuebhfc', '2326746aa', 'pack', 0, 0, 20, 0, '2026-01-05 05:19:38.982', '2026-01-05 05:19:59.431', NULL),
(82, 'a', 'a', 'a', 'rak 01 - gudang utama', '23cm', 'pcs', 0, 0, 1000, 0, '2026-01-05 06:56:46.946', '2026-01-05 09:29:27.119', NULL),
(83, 'plywood', 'Marine Plywood', 'kayu', 'R04-Gudang Utama', '3m', 'pcs', 15, 0, 5, 1, '2026-01-05 09:14:42.922', '2026-01-05 23:20:58.437', NULL),
(89, 'MDF', 'MDF pro', 'kayu', 'R04-Gudang Utama', '3m', 'pcs', 12, 0, 10, 1, '2026-01-05 23:12:25.562', '2026-01-05 23:12:25.619', NULL),
(90, 'finishing TACO', 'TACO', 'wood finishing', 'R04-Gudang Utama', '3mm', 'pcs', 10, 0, 10, 1, '2026-01-05 23:18:43.810', '2026-01-05 23:18:43.878', NULL);

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
('db99137b-e977-11f0-984e-8447095bc55d', 'Kitchen Set - Bekasi Barat', 'Bu Sari', '+628126688699', 'Plywood + HPL + hardware softclose', '2026-01-04 21:15:44.310', '2026-01-04 21:15:44.310', '2025-01-14', '2025-02-04'),
('db9aeb51-e977-11f0-984e-8447095bc55d', 'Wardrobe - Bekasi Timur', 'Pak Budi', '+628128686841', 'HMR + finishing duco (cat) + handle premium', '2026-01-04 21:15:44.322', '2026-01-04 21:15:44.322', '2025-02-03', '2025-03-10'),
('db9d688f-e977-11f0-984e-8447095bc55d', 'Backdrop TV - Bekasi Selatan', 'Bu Rina', '+628128012498', 'Multiplek + finishing melamine + rel laci', '2026-01-04 21:15:44.336', '2026-01-04 21:15:44.336', '2025-02-21', '2025-03-14'),
('db9e86e2-e977-11f0-984e-8447095bc55d', 'Partisi - Bekasi Utara', 'Pak Andi', '+628129577082', 'Kaca + aluminium (pintu/etalase) + sealant', '2026-01-04 21:15:44.346', '2026-01-04 21:15:44.346', '2025-03-12', '2025-04-09'),
('db9fb4c2-e977-11f0-984e-8447095bc55d', 'Meja Kerja - Cikarang', 'Bu Dewi', '+628124342201', 'LED cabinet + adaptor + sensor pintu', '2026-01-04 21:15:44.354', '2026-01-04 21:15:44.354', '2025-04-07', '2025-04-28'),
('dba0fc32-e977-11f0-984e-8447095bc55d', 'Rak Sepatu - Tambun', 'Pak Hendra', '+628129550666', 'Solid surface top + sink + bracket', '2026-01-04 21:15:44.362', '2026-01-04 21:15:44.362', '2025-05-19', '2025-06-02'),
('dba2183a-e977-11f0-984e-8447095bc55d', 'Lemari Dapur - Babelan', 'Bu Lestari', '+628125016572', 'Upholstery headboard + foam + kain', '2026-01-04 21:15:44.369', '2026-01-04 21:15:44.369', '2025-06-09', '2025-07-24'),
('dba31693-e977-11f0-984e-8447095bc55d', 'Headboard - Jatiasih', 'Pak Rizky', '+628125620194', 'Plywood + HPL + hardware softclose', '2026-01-04 21:15:44.376', '2026-01-04 21:15:44.376', '2025-07-01', '2025-07-22'),
('dba4178c-e977-11f0-984e-8447095bc55d', 'Rak Display - Medansatria', 'Bu Nia', '+628129952948', 'HMR + finishing duco (cat) + handle premium', '2026-01-04 21:15:44.382', '2026-01-04 21:15:44.382', '2025-08-14', '2025-09-28'),
('dba518be-e977-11f0-984e-8447095bc55d', 'Laundry Cabinet - Jatisampurna', 'Pak Dimas', '+628123424979', 'Multiplek + finishing melamine + rel laci', '2026-01-04 21:15:44.389', '2026-01-04 21:15:44.389', '2025-09-08', '2025-10-13'),
('dba6146c-e977-11f0-984e-8447095bc55d', 'Pantry - Harapan Indah', 'Bu Wati', '+628127590997', 'Kaca + aluminium (pintu/etalase) + sealant', '2026-01-04 21:15:44.395', '2026-01-04 21:15:44.395', '2025-10-20', '2025-11-03'),
('dba70a24-e977-11f0-984e-8447095bc55d', 'Kabinet TV - Bintara', 'Pak Arif', '+628124689238', 'LED cabinet + adaptor + sensor pintu', '2026-01-04 21:15:44.402', '2026-01-04 21:15:44.402', '2025-11-11', '2025-12-02'),
('dba8100c-e977-11f0-984e-8447095bc55d', 'Lemari Sepatu - Pekayon', 'Bu Maya', '+628127260110', 'Solid surface top + sink + bracket', '2026-01-04 21:15:44.408', '2026-01-04 21:15:44.408', '2025-12-02', '2025-12-23');

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
(1, 61, '2025-12-31 08:00:51.401', 450, 150, 450, 'Stok awal', '2026-01-05 07:29:45.497', NULL),
(2, 62, '2025-12-31 08:01:20.158', 600, 80, 600, 'Stok awal', '2026-01-05 07:29:45.497', NULL),
(3, 63, '2025-12-31 08:02:17.662', 320, 300, 320, 'Stok awal', '2026-01-05 07:29:45.497', NULL),
(4, 64, '2025-12-31 08:03:33.294', 80, 12000, 80, 'Stok awal', '2026-01-05 07:29:45.497', NULL),
(5, 65, '2025-12-31 08:04:20.253', 18, 85000, 18, 'Stok awal', '2026-01-05 07:29:45.497', NULL),
(6, 66, '2025-12-31 08:05:11.765', 55, 15000, 55, 'Stok awal', '2026-01-05 07:29:45.497', NULL),
(7, 67, '2025-12-31 08:06:52.152', 22, 25000, 22, 'Stok awal', '2026-01-05 07:29:45.497', NULL),
(8, 68, '2025-12-31 08:07:17.538', 12, 35000, 12, 'Stok awal', '2026-01-05 07:29:45.497', NULL),
(9, 69, '2025-12-31 08:08:06.724', 9, 65000, 9, 'Stok awal', '2026-01-05 07:29:45.497', NULL),
(10, 70, '2025-12-31 08:09:51.085', 16, 25000, 16, 'Stok awal', '2026-01-05 07:29:45.497', NULL),
(11, 71, '2025-12-31 08:10:27.583', 10, 80000, 10, 'Stok awal', '2026-01-05 07:29:45.497', NULL),
(12, 72, '2025-12-31 08:11:45.787', 7, 90000, 7, 'Stok awal', '2026-01-05 07:29:45.497', NULL),
(13, 73, '2025-12-31 08:12:54.395', 120, 3000, 120, 'Stok awal', '2026-01-05 07:29:45.497', NULL),
(14, 74, '2025-12-31 08:13:36.611', 90, 3200, 90, 'Stok awal', '2026-01-05 07:29:45.497', NULL),
(15, 75, '2025-12-31 08:14:12.315', 6, 15000, 6, 'Stok awal', '2026-01-05 07:29:45.497', NULL),
(16, 76, '2025-12-31 08:15:07.820', 5, 16000, 5, 'Stok awal', '2026-01-05 07:29:45.497', NULL),
(17, 77, '2025-12-31 08:16:22.305', 14, 7000, 14, 'Stok awal', '2026-01-05 07:29:45.497', NULL),
(18, 78, '2025-12-31 08:17:46.763', 18, 10000, 18, 'Stok awal', '2026-01-05 07:29:45.497', NULL),
(19, 79, '2025-12-31 08:18:44.710', 6, 25000, 6, 'Stok awal', '2026-01-05 07:29:45.497', NULL),
(20, 80, '2025-12-31 00:00:00.000', 5, 8000, 0, 'mode:baru||Stok awal', '2026-01-05 07:29:45.497', NULL),
(42, 80, '2025-12-31 00:00:00.000', 60, 750, 60, 'mode:baru||', '2026-01-05 09:27:21.724', NULL),
(58, 89, '2026-01-05 00:00:00.000', 12, 130000, 12, 'mode:baru||', '2026-01-05 23:12:25.619', 1),
(60, 90, '2026-01-05 00:00:00.000', 10, 100000, 10, 'mode:baru||', '2026-01-05 23:18:43.878', 9),
(61, 83, '2026-01-05 00:00:00.000', 15, 129999, 15, 'mode:baru||', '2026-01-05 23:20:58.437', NULL);

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
  `phone` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `employeeId`, `name`, `role`, `passwordHash`, `createdAt`, `updatedAt`, `authType`, `isActive`, `lastLoginAt`, `notes`, `phone`) VALUES
('cmjzkxxp40000du3webn78thb', 'ADM-001', 'Admin', 'ADMIN', '$2a$10$KsxwXIRTbA0Pt.pyTDiPD.N1IMByCm/aDyigVUOuiHyRvrjpRx3ae', '2026-01-04 10:19:26.297', '2026-01-05 22:16:41.490', 'PASSWORD', 1, '2026-01-05 22:16:41.486', NULL, NULL),
('cmjzkykaq0000141gtbszgst2', 'ADM-002', 'Yuliana Setianingrum', 'ADMIN', '$2a$10$FTZ.QjO.JWqTmt9Ew7IxFeZYt5N6QC3StHf7DzSUfA.j5ffF50hfm', '2026-01-04 10:19:55.586', '2026-01-05 06:16:38.803', 'PASSWORD', 1, '2026-01-05 05:41:09.600', NULL, NULL),
('cmjzmrshe0000c37qk1xr5qws', 'ADM-003', 'Putri', 'ADMIN', '$2a$10$ThFE5GCuM9irGoG3bob3h..8xjYYK8gjyi.Dxngq0WHMhl.xT.PiC', '2026-01-04 11:10:38.834', '2026-01-05 18:56:18.847', 'PASSWORD', 1, '2026-01-05 18:56:18.838', NULL, NULL),
('dae4cdca-e969-11f0-984e-8447095bc55d', 'WKR-001', 'Slamet', 'WORKER', '$2a$10$3fzEoWxpceMHOquodCi7y.orEO6nN8g3.dMY1APus07zEy6AW.H2K', '2026-01-04 19:35:30.174', '2026-01-04 13:11:43.389', 'PASSWORD', 1, NULL, NULL, NULL),
('dae4e36c-e969-11f0-984e-8447095bc55d', 'WKR-002', 'Sugeng Riyadi', 'WORKER', '$2a$10$dKG/7jphGwBsyoIc8HqTzu.fuG/G8aHluOPvn02.GY4.dLifo.Pxi', '2026-01-04 19:35:30.174', '2026-01-04 13:11:54.180', 'PASSWORD', 1, NULL, NULL, NULL),
('dae4e514-e969-11f0-984e-8447095bc55d', 'WKR-003', 'Joko Santoso', 'WORKER', '$2a$10$6ltP3YNSWGYP0Bdym1t91Oalw34zFCmW4/cLk70Tg6wv2W6MEDL3S', '2026-01-04 19:35:30.174', '2026-01-04 13:12:02.309', 'PASSWORD', 1, NULL, NULL, NULL),
('dae4e685-e969-11f0-984e-8447095bc55d', 'WKR-004', 'Eko Setiawan', 'WORKER', '$2a$10$oUCARw2XWuB4WUYZ2kh9eOQiylZfwVlifTMPs7.KQGZvMJIqd8P6e', '2026-01-04 19:35:30.174', '2026-01-04 13:12:09.681', 'PASSWORD', 1, NULL, NULL, NULL),
('dae4e864-e969-11f0-984e-8447095bc55d', 'WKR-005', 'Darto', 'WORKER', '$2a$10$Q3hRq7bU79efVab2d/cIJeCF2KvCStmLODJot2qzPFXD/wQJLos3S', '2026-01-04 19:35:30.174', '2026-01-04 13:12:17.228', 'PASSWORD', 1, NULL, NULL, NULL),
('dae4e99f-e969-11f0-984e-8447095bc55d', 'WKR-006', 'Suyanto', 'WORKER', '$2a$10$wLpiH/QRyKHDKZHHfEnCz.N20/sNEDdICBy8CBptnZsh3KMKcIwQC', '2026-01-04 19:35:30.174', '2026-01-04 13:12:25.243', 'PASSWORD', 1, NULL, NULL, NULL),
('dae4ea8b-e969-11f0-984e-8447095bc55d', 'WKR-007', 'Sutrisno Wibowo', 'WORKER', '$2a$10$jmOgXSAVXov5DkREIuzL9..bXAdpFenYa1iw6AEpL/8i4ELAY9yA2', '2026-01-04 19:35:30.174', '2026-01-04 13:12:33.077', 'PASSWORD', 1, NULL, NULL, NULL),
('dae4eb7f-e969-11f0-984e-8447095bc55d', 'WKR-008', 'Mulyono', 'WORKER', '$2a$10$M9qGPy4DBnbO/wis6q0f/uby/DiwdfWaFZGyYtHkLWzvdfi28r0Vi', '2026-01-04 19:35:30.174', '2026-01-04 13:12:39.635', 'PASSWORD', 1, NULL, NULL, NULL),
('dae4ee14-e969-11f0-984e-8447095bc55d', 'WKR-009', 'Sumarno', 'WORKER', '$2a$10$IsW3FZ4teY/dgHqYR8k9GetT4exBKExuthwmejT5QQm7HhOWgYdS.', '2026-01-04 19:35:30.174', '2026-01-04 13:12:47.846', 'PASSWORD', 1, NULL, NULL, NULL),
('dae4ef31-e969-11f0-984e-8447095bc55d', 'WKR-010', 'Haryanto Prasetyo', 'WORKER', '$2a$10$2gzL8NifRH1.gwJ0I/j8RO82EbIDh34FM0lJp2sruBvcdZYR.TDXu', '2026-01-04 19:35:30.174', '2026-01-04 13:12:58.366', 'PASSWORD', 1, NULL, NULL, NULL),
('dae4f1a8-e969-11f0-984e-8447095bc55d', 'WKR-011', 'Bambang Triyono', 'WORKER', '$2a$10$wXh4x3F492VsocRYqh6olOLMdc/Ap6KWmcKK3ErxHVor5cXBbxODe', '2026-01-04 19:35:30.174', '2026-01-04 13:13:05.006', 'PASSWORD', 1, NULL, NULL, NULL),
('dae4f2ce-e969-11f0-984e-8447095bc55d', 'WKR-012', 'Wahyudi', 'WORKER', '$2a$10$A.w2XRmtlSE57ysKEFTBeuojr0SKjomAuMTzGB1JkpUjxotqjkG6O', '2026-01-04 19:35:30.174', '2026-01-04 13:13:15.006', 'PASSWORD', 1, NULL, NULL, NULL),
('dae4f54c-e969-11f0-984e-8447095bc55d', 'WKR-013', 'Priyono Widodo', 'WORKER', '$2a$10$4uT29OQqcevhRRtMbUisO.yRFUJOj6g6pXlU3wIGnC6v6ug1jMeWu', '2026-01-04 19:35:30.174', '2026-01-04 13:13:25.397', 'PASSWORD', 1, NULL, NULL, NULL),
('dae4f69f-e969-11f0-984e-8447095bc55d', 'WKR-014', 'Purnomo', 'WORKER', '$2a$10$BvImlEk0CiGDZAVkSxA8NO2eSiQXr9lUA/BujhZZ2mxM0x7M96.wW', '2026-01-04 19:35:30.174', '2026-01-04 13:13:32.518', 'PASSWORD', 1, NULL, NULL, NULL),
('dae4f775-e969-11f0-984e-8447095bc55d', 'WKR-015', 'Suparman', 'WORKER', '$2a$10$Vf5U3mgnCDkpcL.9mruoO.N1/5.v7Ez/hJa4Y7pmQY3kJU5LiS.Ou', '2026-01-04 19:35:30.174', '2026-01-04 13:13:39.640', 'PASSWORD', 1, NULL, NULL, NULL),
('dae4f860-e969-11f0-984e-8447095bc55d', 'WKR-016', 'Suroto', 'WORKER', '$2a$10$xjmNEnBqxEY0W.yalbjsFe5a9oeoO3vGkQgW.7UKobOYAQ6vSyMYi', '2026-01-04 19:35:30.174', '2026-01-04 13:13:46.267', 'PASSWORD', 1, NULL, NULL, NULL),
('dae4f946-e969-11f0-984e-8447095bc55d', 'WKR-017', 'Rudi Kurniawan', 'WORKER', '$2a$10$N9fzZCrN8/qOnPXDO3JbneImaTeuXzlq4msKe3/WR08XRVUoTMPFW', '2026-01-04 19:35:30.174', '2026-01-04 13:13:52.785', 'PASSWORD', 1, NULL, NULL, NULL),
('dae4fb8a-e969-11f0-984e-8447095bc55d', 'WKR-018', 'Dwi Hartono Saputro', 'WORKER', '$2a$10$AsnqP/E5essRwgRJ5mbwKO2gHzE0h7/9SK0KcaXzp6cIQMJt4p2Mm', '2026-01-04 19:35:30.174', '2026-01-04 13:14:00.722', 'PASSWORD', 1, NULL, NULL, NULL),
('dae4fcad-e969-11f0-984e-8447095bc55d', 'WKR-019', 'Arif Nugroho', 'WORKER', '$2a$10$IkhrTMFvImAeXO3.yGpyhesoowNANL5un1.iU0W9AS4l302xS4UqG', '2026-01-04 19:35:30.174', '2026-01-04 13:14:08.382', 'PASSWORD', 1, NULL, NULL, NULL),
('dae4fd91-e969-11f0-984e-8447095bc55d', 'WKR-020', 'Teguh Prayitno', 'WORKER', '$2a$10$Snd/rW7rTOdNUSyfcR1.QuP3vEHNj90lPRShs0cQ8kTaFdYaK/yoe', '2026-01-04 19:35:30.174', '2026-01-04 13:14:15.750', 'PASSWORD', 1, NULL, NULL, NULL);

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
  ADD UNIQUE KEY `items_name_size_key` (`name`,`size`),
  ADD KEY `items_isActive_idx` (`isActive`),
  ADD KEY `items_updatedAt_idx` (`updatedAt`),
  ADD KEY `items_defaultSupplierId_idx` (`defaultSupplierId`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT for table `stock_in_batches`
--
ALTER TABLE `stock_in_batches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

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
  ADD CONSTRAINT `items_defaultSupplierId_fkey` FOREIGN KEY (`defaultSupplierId`) REFERENCES `supplier` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
