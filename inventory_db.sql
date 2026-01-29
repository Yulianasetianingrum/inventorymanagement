-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 29, 2026 at 12:12 PM
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
('cmkwujzbn0001utnkqmmxdvo7', 'STOCK_ADJUSTMENT', 'Adj Stock: Compact Multi Tool (+1 pcs)', 'cmjzkxxp40000du3webn78thb', NULL, '{\"itemId\":119,\"mode\":\"baru\",\"qtyBase\":1,\"note\":\"mode:baru||\"}', '2026-01-27 17:04:55.186'),
('cmkwv4s7q0003utnkx0eyshgq', 'STOCK_ADJUSTMENT', 'Adj Stock: Compact Multi Tool (+10 pcs)', 'cmjzkxxp40000du3webn78thb', NULL, '{\"itemId\":119,\"mode\":\"baru\",\"qtyBase\":10,\"note\":\"mode:baru||\"}', '2026-01-27 17:21:05.750');

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
(119, '810081949812', 'Compact Multi Tool', 'Gentlemen’s Hardware', 'Multi Tools', 'Gudang', 'Compact', 'pcs', 19, 1, 100, 1, '2026-01-25 20:44:14.733', '2026-01-27 17:21:05.750', NULL, NULL),
(120, '850039064587', 'Magnetic Driver Set', 'INTERTOOL', 'Screwdrivers', 'Gudang', 'Driver Set', 'set', 7, 0, 0, 1, '2026-01-25 20:44:14.742', '2026-01-25 20:51:35.260', NULL, NULL),
(121, '778862064225', 'Home Tool Set', 'TACKLIFE', 'Tool Set', 'Gudang', '60 pcs', 'set', 5, 0, 0, 1, '2026-01-25 20:44:14.751', '2026-01-25 20:51:35.265', NULL, NULL),
(122, '716350797990', 'Mini Tool Kit', 'RAK Pro Tools', 'Tool Set', 'Gudang', 'Compact', 'set', 10, 0, 0, 1, '2026-01-25 20:44:14.759', '2026-01-25 20:51:35.270', NULL, NULL),
(123, '0038728037060', 'Basic Home Tool Kit', 'General Tools', 'Tool Set', 'Gudang', 'WS-0101', 'set', 13, 0, 0, 1, '2026-01-25 20:44:14.768', '2026-01-26 15:39:52.381', NULL, NULL),
(124, '08442960668036', 'Large Tool Kit', 'Generic', 'Tool Set', 'Gudang', '130 pcs', 'set', 4, 0, 0, 1, '2026-01-25 20:44:14.778', '2026-01-25 20:51:35.280', NULL, NULL),
(125, '731161037559', 'Tool Box Organizer', 'Keter', 'Storage', 'Gudang', '18 inch', 'pcs', 6, 0, 0, 1, '2026-01-25 20:44:14.788', '2026-01-25 20:51:35.285', NULL, NULL),
(126, '6973107486746', 'Cross Screwdriver', 'Deli Tools', 'Screwdrivers', 'Gudang', 'PH1 x 75mm Yellow', 'pcs', 5, 0, 0, 1, '2026-01-25 20:44:14.797', '2026-01-26 02:27:13.680', NULL, NULL),
(127, NULL, 'Plywood Meranti', 'Meranti', 'Plywood', NULL, '18mm', 'lembar', 30, 0, 10, 1, '2026-01-29 11:12:02.949', '2026-01-29 11:12:02.968', 3, NULL),
(128, NULL, 'Plywood Meranti', 'Meranti', 'Plywood', NULL, '12mm', 'lembar', 40, 0, 12, 1, '2026-01-29 11:12:02.977', '2026-01-29 11:12:02.985', 4, NULL),
(129, NULL, 'MDF Board', 'Tropical MDF', 'MDF', NULL, '12mm', 'lembar', 25, 0, 8, 1, '2026-01-29 11:12:02.996', '2026-01-29 11:12:03.004', 14, NULL),
(130, NULL, 'HPL Sheet', 'Taco', 'Finishing', NULL, '1.0mm', 'lembar', 50, 0, 15, 1, '2026-01-29 11:12:03.010', '2026-01-29 11:12:03.018', 12, NULL),
(131, NULL, 'HPL Sheet', 'Decosheet', 'Finishing', NULL, '0.8mm', 'lembar', 45, 0, 15, 1, '2026-01-29 11:12:03.024', '2026-01-29 11:12:03.032', 13, NULL),
(132, NULL, 'Lem Putih PVAc', 'Fox', 'Lem', NULL, '1 kg', 'botol', 60, 0, 20, 1, '2026-01-29 11:12:03.038', '2026-01-29 11:12:03.046', 3, NULL),
(133, NULL, 'Lem Kuning', 'Fox', 'Lem', NULL, '1 kg', 'botol', 40, 0, 15, 1, '2026-01-29 11:12:03.052', '2026-01-29 11:12:03.065', 13, NULL),
(134, NULL, 'Sekrup Kayu', 'Tora', 'Fastener', NULL, '4x40mm', 'box', 30, 0, 10, 1, '2026-01-29 11:12:03.071', '2026-01-29 11:12:03.078', 12, NULL),
(135, NULL, 'Paku Tembak', 'Fasco', 'Fastener', NULL, '32mm', 'box', 35, 0, 10, 1, '2026-01-29 11:12:03.084', '2026-01-29 11:12:03.090', 5, NULL),
(136, NULL, 'Engsel Cabinet', 'Hafele', 'Hardware', NULL, '35mm', 'pcs', 120, 0, 30, 1, '2026-01-29 11:12:03.097', '2026-01-29 11:12:03.104', 31, NULL),
(137, NULL, 'Rel Laci', 'Hafele', 'Hardware', NULL, '45cm', 'set', 60, 0, 20, 1, '2026-01-29 11:12:03.108', '2026-01-29 11:12:03.116', 6, NULL),
(138, NULL, 'Handle Drawer', 'Hafele', 'Hardware', NULL, '128mm', 'pcs', 80, 0, 25, 1, '2026-01-29 11:12:03.121', '2026-01-29 11:12:03.128', 12, NULL),
(139, NULL, 'Amplas', 'Kowei', 'Finishing', NULL, 'P240', 'lembar', 400, 0, 100, 1, '2026-01-29 11:12:03.133', '2026-01-29 11:12:03.139', 8, NULL);

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
(94, 126, '2026-01-26 00:00:00.000', 10, 1000, 5, 'mode:baru||', '2026-01-26 00:12:23.782', NULL),
(95, 119, '2026-01-26 18:35:34.666', 1, 0, 1, 'mode:bekas||Ad-hoc Return from source line cmkvc2ra00006ut9kh0gqs54b by Slamet', '2026-01-26 18:35:34.668', NULL),
(97, 119, '2026-01-27 00:00:00.000', 10, 1000, 10, 'mode:baru||', '2026-01-27 17:21:05.750', 1),
(98, 127, '2026-01-27 00:00:00.000', 30, 185000, 30, 'mode:baru||Catatan: Excel 2025-12-03', '2026-01-29 11:12:02.963', 3),
(99, 128, '2026-01-28 00:00:00.000', 40, 145000, 40, 'mode:baru||Catatan: Excel 2025-12-07', '2026-01-29 11:12:02.981', 4),
(100, 129, '2026-01-29 00:00:00.000', 25, 135000, 25, 'mode:baru||Catatan: Excel 2025-12-12', '2026-01-29 11:12:03.000', 14),
(101, 130, '2026-01-27 00:00:00.000', 50, 120000, 50, 'mode:baru||Catatan: Excel 2025-12-18', '2026-01-29 11:12:03.014', 12),
(102, 131, '2026-01-28 00:00:00.000', 45, 98000, 45, 'mode:baru||Catatan: Excel 2025-12-22', '2026-01-29 11:12:03.028', 13),
(103, 132, '2026-01-29 00:00:00.000', 60, 32000, 60, 'mode:baru||Catatan: Excel 2026-01-02', '2026-01-29 11:12:03.042', 3),
(104, 133, '2026-01-27 00:00:00.000', 40, 45000, 40, 'mode:baru||Catatan: Excel 2026-01-05', '2026-01-29 11:12:03.058', 13),
(105, 134, '2026-01-28 00:00:00.000', 30, 55000, 30, 'mode:baru||Catatan: Excel 2026-01-09', '2026-01-29 11:12:03.074', 12),
(106, 135, '2026-01-29 00:00:00.000', 35, 42000, 35, 'mode:baru||Catatan: Excel 2026-01-14', '2026-01-29 11:12:03.087', 5),
(107, 136, '2026-01-27 00:00:00.000', 120, 14000, 120, 'mode:baru||Catatan: Excel 2026-01-18', '2026-01-29 11:12:03.101', 31),
(108, 137, '2026-01-28 00:00:00.000', 60, 65000, 60, 'mode:baru||Catatan: Excel 2026-01-21', '2026-01-29 11:12:03.112', 6),
(109, 138, '2026-01-29 00:00:00.000', 80, 12000, 80, 'mode:baru||Catatan: Excel 2026-01-24', '2026-01-29 11:12:03.124', 12),
(110, 139, '2026-01-27 00:00:00.000', 400, 1500, 400, 'mode:baru||Catatan: Excel 2026-01-26', '2026-01-29 11:12:03.136', 8);

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
(3, 'HIKARI Aluminium Ltd', '[\"Aluminium Profil\", \"Kusen Aluminium\", \"Aksesoris Kusen\", \"Sealant\", \"Kaca\"]', 'Jl. Raya Mustikajaya Mutiara Gading Timur 2 Blok, Mustika Jaya, Bekasi Timur, Kota Bekasi 17158', 'https://www.google.com/maps/search/?api=1&query=Jl.%20Raya%20Mustikajaya%20Mutiara%20Gading%20Timur%202%20Blok%2C%20Mustika%20Jaya%2C%20Bekasi%20Timur%2C%20Kota%20Bekasi%2017158', '081315697475', '2026-01-04 21:05:07.719', '2026-01-04 21:08:45.000'),
(4, 'Toko Kaca & Aluminium Yura Glass Pekayon', '[\"Kaca\",\"Aluminium Profil\",\"Kusen\",\"Pintu\",\"Jendela\",\"Aksesoris\"]', 'Jl. Irigasi RT.002/RW.017, Pekayon Jaya, Bekasi Selatan, Kota Bekasi 17148', 'https://www.google.com/maps/search/?api=1&query=Jl.%20Irigasi%20RT.002/RW.017%2C%20Pekayon%20Jaya%2C%20Bekasi%20Selatan%2C%20Kota%20Bekasi%2017148', '085717278958', '2026-01-04 21:05:07.727', '2026-01-04 21:08:45.000'),
(5, 'Toko Kaca dan Aluminium (Galaksi)', '[\"Kaca\", \"Aluminium Profil\", \"Pintu Lipat\", \"Kusen\", \"Aksesoris Kaca\"]', 'Galaksi, RT.001/RW.014, Jaka Setia, Bekasi Selatan, Kota Bekasi 17148', 'https://www.google.com/maps/search/?api=1&query=Galaksi%2C%20RT.001/RW.014%2C%20Jaka%20Setia%2C%20Bekasi%20Selatan%2C%20Kota%20Bekasi%2017148', '085287898790', '2026-01-04 21:05:07.735', '2026-01-04 21:08:45.000'),
(6, 'Sulis Kaca Alumunium', '[\"Kaca\", \"Aluminium Profil\", \"Kusen\", \"Aksesoris Kaca\", \"Sealant\"]', 'Jl. Bacang Raya No.61, Pekayon Jaya, Bekasi Selatan, Kota Bekasi 17148', 'https://www.google.com/maps/search/?api=1&query=Jl.%20Bacang%20Raya%20No.61%2C%20Pekayon%20Jaya%2C%20Bekasi%20Selatan%2C%20Kota%20Bekasi%2017148', '087837920618', '2026-01-04 21:05:07.744', '2026-01-04 21:08:45.000'),
(7, 'Toko Kaca Satria Karya Aluminium', '[\"Kaca\", \"Aluminium Profil\", \"Kusen\", \"Etalase\", \"Aksesoris\"]', 'Jl. R. H. Umar / Jl. Kp. Utan No.87, Jaka Setia, Bekasi Selatan, Kota Bekasi 17147', 'https://www.google.com/maps/search/?api=1&query=Jl.%20R.%20H.%20Umar%20/%20Jl.%20Kp.%20Utan%20No.87%2C%20Jaka%20Setia%2C%20Bekasi%20Selatan%2C%20Kota%20Bekasi%2017147', '081281482939', '2026-01-04 21:05:07.752', '2026-01-04 21:08:45.000'),
(8, 'Berkah Aluminium', '[\"Aluminium Profil\", \"Pintu Aluminium\", \"Jendela Aluminium\", \"Etalase\", \"Kaca\"]', 'Kp. Cisalak, Jl. Odeh No.73, Sumur Batu, Bantar Gebang, Kota Bekasi 17154', 'https://www.google.com/maps/search/?api=1&query=Kp.%20Cisalak%2C%20Jl.%20Odeh%20No.73%2C%20Sumur%20Batu%2C%20Bantar%20Gebang%2C%20Kota%20Bekasi%2017154', '081219281983', '2026-01-04 21:05:07.759', '2026-01-04 21:08:45.000'),
(9, 'Sinar Gemilang', '[\"Kusen Aluminium\", \"Kaca\", \"Pintu\", \"Jendela\", \"Aksesoris Kusen\"]', 'Jl. Bintara Jaya Raya No.7E, Bintara Jaya, Bekasi Barat, Kota Bekasi 17136', 'https://www.google.com/maps/search/?api=1&query=Jl.%20Bintara%20Jaya%20Raya%20No.7E%2C%20Bintara%20Jaya%2C%20Bekasi%20Barat%2C%20Kota%20Bekasi%2017136', '081289078485', '2026-01-04 21:05:07.767', '2026-01-04 21:08:45.000'),
(11, 'Optima Aluminium (PT Nagakaya Optima Adiperkasa)', '[\"Aluminium Profil\", \"ACP\", \"Sealant\", \"Aksesoris Kusen\", \"Hardware\"]', 'Ruko Permata Harapan Baru Blok H No 57-59, Jl. Raya Pejuang Jaya, Pejuang, Medan Satria, Bekasi', 'https://www.google.com/maps/search/?api=1&query=Ruko%20Permata%20Harapan%20Baru%20Blok%20H%20No%2057-59%2C%20Jl.%20Raya%20Pejuang%20Jaya%2C%20Pejuang%2C%20Medan%20Satria%2C%20Bekasi', '081818886935', '2026-01-04 21:05:07.783', '2026-01-04 21:08:45.000'),
(12, 'CV Tropika Perkasa', '[\"Plywood\", \"Blockboard\", \"Film Faced Plywood\", \"OSB\", \"Marine Plywood\"]', 'Jl. Raya Setu Kampung Utan RT.001/RW.009, Telajung, Cikarang Barat, Kab. Bekasi, Jawa Barat 17530', 'https://www.google.com/maps/search/?api=1&query=Jl.%20Raya%20Setu%20Kampung%20Utan%20RT.001/RW.009%2C%20Telajung%2C%20Cikarang%20Barat%2C%20Kab.%20Bekasi%2C%20Jawa%20Barat%2017530', '+6289547935775', '2026-01-04 21:05:07.789', '2026-01-04 21:08:45.000'),
(13, 'PT Tanjung Jayaprima Abadi', '[\"Plywood\", \"MDF\", \"HMR\", \"Blockboard\", \"HPL\", \"Lem Kayu\"]', 'Jl. Raya Bekasi Km.18 RT.008 RW.011, Jatinegara, Cakung, Jakarta Timur', 'https://www.google.com/maps/search/?api=1&query=Jl.%20Raya%20Bekasi%20Km.18%20RT.008%20RW.011%2C%20Jatinegara%2C%20Cakung%2C%20Jakarta%20Timur', '+6289636822555', '2026-01-04 21:05:07.795', '2026-01-04 21:08:45.000'),
(14, 'Toko Sinar Abadi HPL', '[\"HPL\", \"Lem Kuning\", \"Edging PVC\", \"Multiplek\", \"MDF\"]', 'Jl. Alternatif Cibubur, RT.002/RW.3, Jatisampurna, Kota Bekasi, Jawa Barat 17435', 'https://www.google.com/maps/search/?api=1&query=Jl.%20Alternatif%20Cibubur%2C%20RT.002/RW.3%2C%20Jatisampurna%2C%20Kota%20Bekasi%2C%20Jawa%20Barat%2017435', '082113825589', '2026-01-04 21:05:07.802', '2026-01-04 21:08:45.000'),
(31, 'toko', '[\"General Supply\"]', 'Alamat belum diisi', NULL, NULL, '2026-01-27 17:04:54.752', '2026-01-27 17:04:54.752');

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
('cmjzkxxp40000du3webn78thb', 'ADM-001', 'Admin', 'ADMIN', '$2a$10$mVsKsJ.zvEzW3if4OIZIs.5vmTmvrwunJtTA7XPkQvGO6Wzzj/Gaa', '2026-01-04 10:19:26.297', '2026-01-29 10:56:36.137', 'PASSWORD', 1, '2026-01-29 10:56:36.134', NULL, NULL, NULL, NULL),
('cmjzkykaq0000141gtbszgst2', 'ADM-002', 'Yuliana Setianingrum', 'ADMIN', 'admin2', '2026-01-04 10:19:55.586', '2026-01-26 02:04:47.347', 'PASSWORD', 1, '2026-01-26 02:04:47.343', NULL, NULL, NULL, NULL),
('cmjzmrshe0000c37qk1xr5qws', 'ADM-003', 'Putri', 'ADMIN', 'ADM-003', '2026-01-04 11:10:38.834', '2026-01-05 18:56:18.847', 'PASSWORD', 1, '2026-01-05 18:56:18.838', NULL, NULL, NULL, NULL),
('cmkqjdqhq0000agucccyxnig9', 'OWN-001', 'Owner', 'ADMIN', '$2a$10$pMtiwgshLt1LMZwvPQGvreOJPKn/.L4tw.zDJ1siRkKEmkqQ3wx7i', '2026-01-23 07:05:30.973', '2026-01-23 07:05:30.973', NULL, 1, NULL, NULL, NULL, NULL, NULL),
('dae4cdca-e969-11f0-984e-8447095bc55d', 'WKR-001', 'Slamet', 'WORKER', '$2a$10$6fChK3vyc0AbqP76BfyXn.eqKzeYWa844b9.KaGE59UGwrnWYaG1i', '2026-01-04 19:35:30.174', '2026-01-26 18:42:45.532', 'PASSWORD', 1, '2026-01-26 18:42:45.524', NULL, '09748378545', NULL, NULL),
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=140;

--
-- AUTO_INCREMENT for table `stock_in_batches`
--
ALTER TABLE `stock_in_batches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=111;

--
-- AUTO_INCREMENT for table `supplier`
--
ALTER TABLE `supplier`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

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
