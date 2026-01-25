-- Ensure barcode column exists
ALTER TABLE items ADD COLUMN IF NOT EXISTS barcode VARCHAR(50) UNIQUE;

-- Insert or Update Items
INSERT INTO items (barcode, name, brand, size, unit, category, stockNew, minStock, updatedAt) VALUES
('840214804694', 'Multi Tool 12 in 1', 'Gentlemen’s Hardware', '12-in-1 multitool', 'pcs', 'Tools', 10, 5, NOW()),
('778862064224', 'Home Tool Set 57 Pcs', 'TACKLIFE', '57 pieces tool kit', 'set', 'Tools', 10, 5, NOW()),
('716350797988', 'Multi Tool Hammer', 'RAK Pro Tools', '12-in-1 hammer tool', 'pcs', 'Tools', 10, 5, NOW()),
('038728037060', 'Home Tool Kit', 'General Tools', '39 pieces set', 'set', 'Tools', 10, 5, NOW()),
('681035017982', 'Precision Tool Set', 'General Tools', '11 pcs precision set', 'set', 'Tools', 10, 5, NOW()),
('711639924451', 'Home Repair Tool Kit', 'DEKOPRO', '198 pieces tool kit', 'set', 'Tools', 10, 5, NOW()),
('313055857810', 'Tool Kit Set', 'Trademark Tools', '130 pieces', 'set', 'Tools', 10, 5, NOW()),
('850039064586', 'Magnetic Screwdriver Set', 'INTERTOOL', '114 pcs magnetic bit set', 'set', 'Tools', 10, 5, NOW()),
('680666946241', 'Screwdriver Bit Set', 'TACKLIFE', 'PTA01A bit set', 'set', 'Tools', 10, 5, NOW()),
('680666907860', 'Circular Saw', 'TACKLIFE', '7-1/2 inch, 1800W', 'pcs', 'Tools', 10, 5, NOW()),
('763615763301', 'Swiss Army Multitool', 'Victorinox', 'Traveler model', 'pcs', 'Tools', 10, 5, NOW()),
('746160715612', 'Swiss Army Multitool', 'Victorinox', 'Limited edition', 'pcs', 'Tools', 10, 5, NOW()),
('0406381333931', 'Multi Purpose Hand Tool Set', 'Generic', 'Assorted hand tools', 'set', 'Tools', 10, 5, NOW()),
('728370450088', 'Mini Pliers Set', 'Generic', 'Small pliers set', 'set', 'Tools', 10, 5, NOW()),
('797681946238', 'Wire Cutter Pliers', 'Kingsdun', 'Flush side cutter', 'pcs', 'Tools', 10, 5, NOW()),
('711639924452', 'Socket Extension Set', 'DEKOPRO', 'Socket accessories', 'set', 'Tools', 10, 5, NOW()),
('711639924453', 'Ratchet Handle Set', 'DEKOPRO', 'Ratchet & adapter', 'set', 'Tools', 10, 5, NOW()),
('840332391281', 'Furniture Assembly Tool Kit', 'YITAHOME', 'Wood furniture kit', 'set', 'Tools', 10, 5, NOW()),
('810081949812', 'Compact Multi Tool', 'Gentlemen’s Hardware', 'Compact version', 'pcs', 'Tools', 10, 5, NOW()),
('850039064587', 'Magnetic Driver Set', 'INTERTOOL', 'Driver & bit set', 'set', 'Tools', 10, 5, NOW()),
('778862064225', 'Home Tool Set', 'TACKLIFE', '60 pcs variant', 'set', 'Tools', 10, 5, NOW()),
('716350797990', 'Mini Tool Kit', 'RAK Pro Tools', 'Compact tool kit', 'set', 'Tools', 10, 5, NOW()),
('0038728037060', 'Basic Home Tool Kit', 'General Tools', 'WS-0101 variant', 'set', 'Tools', 10, 5, NOW()),
('08442960668036', 'Large Tool Kit', 'Generic', '130 pcs mixed tools', 'set', 'Tools', 10, 5, NOW()),
('731161037559', 'Tool Box Organizer', 'Keter', '18 inch cantilever toolbox', 'pcs', 'Tools', 10, 5, NOW()),
('6973107486746', 'Cross Screwdriver', 'Deli Tools', 'PH1 x 75mm, Yellow', 'pcs', 'Tools', 10, 5, NOW())
ON DUPLICATE KEY UPDATE 
    barcode = VALUES(barcode),
    updatedAt = NOW();
