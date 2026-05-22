-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: May 22, 2026 at 06:44 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `poolapack_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `kabupatens`
--

CREATE TABLE `kabupatens` (
  `id_kota_kabupaten` bigint(20) UNSIGNED NOT NULL,
  `nama` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kabupatens`
--

INSERT INTO `kabupatens` (`id_kota_kabupaten`, `nama`) VALUES
(2, 'Bandung'),
(4, 'Cimahi'),
(5, 'Kota Bandung'),
(6, 'Kota Cimahi'),
(7, 'Kab. Bandung Barat');

-- --------------------------------------------------------

--
-- Table structure for table `kecamatans`
--

CREATE TABLE `kecamatans` (
  `id_kecamatan` bigint(20) UNSIGNED NOT NULL,
  `nama` varchar(255) NOT NULL,
  `id_kota_kabupaten` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kecamatans`
--

INSERT INTO `kecamatans` (`id_kecamatan`, `nama`, `id_kota_kabupaten`) VALUES
(1, 'Baleendah', 2),
(2, 'Tst cimahi', 4),
(3, 'Bandung Timur', 5),
(4, 'Cimahi Utara', 6),
(5, 'Padalarang', 7),
(6, 'Cimahi Tengah', 6),
(7, 'Antapani', 5),
(8, 'Lembang', 7),
(9, 'Cimahi Selatan', 6),
(10, 'Batujajar', 7);

-- --------------------------------------------------------

--
-- Table structure for table `siswas`
--

CREATE TABLE `siswas` (
  `id_siswa` bigint(20) UNSIGNED NOT NULL,
  `nama_siswa` varchar(255) NOT NULL,
  `id_kota_kabupaten` bigint(20) UNSIGNED NOT NULL,
  `id_kecamatan` bigint(20) UNSIGNED NOT NULL,
  `alamat` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `siswas`
--

INSERT INTO `siswas` (`id_siswa`, `nama_siswa`, `id_kota_kabupaten`, `id_kecamatan`, `alamat`) VALUES
(1, 'Agus', 5, 3, 'Jl. Alamat Siswa No. 1'),
(2, 'Budi', 6, 4, 'Jl. Alamat Siswa No. 2'),
(3, 'Nana', 7, 5, 'Jl. Alamat Siswa No. 3'),
(4, 'Bambang', 7, 5, 'Jl. Alamat Siswa No. 4'),
(5, 'Fitri', 6, 6, 'Jl. Alamat Siswa No. 5'),
(6, 'Bagus', 5, 7, 'Jl. Alamat Siswa No. 6'),
(7, 'Hartoko', 5, 7, 'Jl. Alamat Siswa No. 7'),
(8, 'Dadan', 7, 8, 'Jl. Alamat Siswa No. 8'),
(9, 'Ceceng', 6, 9, 'Jl. Alamat Siswa No. 9'),
(10, 'Ilham', 5, 3, 'Jl. Alamat Siswa No. 10'),
(11, 'Iqbal', 7, 10, 'Jl. Alamat Siswa No. 11'),
(12, 'Adi', 6, 6, 'Jl. Alamat Siswa No. 12');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `created_at`, `updated_at`) VALUES
(1, 'daffaramadhan', '$2a$10$bq7L051/nHhATZEnxjoxAOArnHBraWXZC94gSbSqyYwpg4l0F0ZvO', '2026-05-22 10:48:35.703', '2026-05-22 10:48:35.703'),
(2, 'admin', '$2a$10$Li0eEpl/cbcwvZt7EIqMA.McqA6uOjbJNPZlNllAqOU9CNQfob7.W', '2026-05-22 11:07:30.402', '2026-05-22 11:07:30.407');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `kabupatens`
--
ALTER TABLE `kabupatens`
  ADD PRIMARY KEY (`id_kota_kabupaten`);

--
-- Indexes for table `kecamatans`
--
ALTER TABLE `kecamatans`
  ADD PRIMARY KEY (`id_kecamatan`),
  ADD KEY `fk_kecamatans_kabupaten` (`id_kota_kabupaten`);

--
-- Indexes for table `siswas`
--
ALTER TABLE `siswas`
  ADD PRIMARY KEY (`id_siswa`),
  ADD KEY `fk_siswas_kabupaten` (`id_kota_kabupaten`),
  ADD KEY `fk_siswas_kecamatan` (`id_kecamatan`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_users_username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `kabupatens`
--
ALTER TABLE `kabupatens`
  MODIFY `id_kota_kabupaten` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `kecamatans`
--
ALTER TABLE `kecamatans`
  MODIFY `id_kecamatan` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `siswas`
--
ALTER TABLE `siswas`
  MODIFY `id_siswa` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `kecamatans`
--
ALTER TABLE `kecamatans`
  ADD CONSTRAINT `fk_kecamatans_kabupaten` FOREIGN KEY (`id_kota_kabupaten`) REFERENCES `kabupatens` (`id_kota_kabupaten`) ON UPDATE CASCADE;

--
-- Constraints for table `siswas`
--
ALTER TABLE `siswas`
  ADD CONSTRAINT `fk_siswas_kabupaten` FOREIGN KEY (`id_kota_kabupaten`) REFERENCES `kabupatens` (`id_kota_kabupaten`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_siswas_kecamatan` FOREIGN KEY (`id_kecamatan`) REFERENCES `kecamatans` (`id_kecamatan`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
