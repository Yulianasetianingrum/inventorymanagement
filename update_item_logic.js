const fs = require('fs');
const path = 'c:/inventorymanagement/app/api/admin/items/route.ts';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `    // Check if item exists (Smart Upsert / Find-or-Create)
    const existing = await prisma.item.findUnique({
      where: { name_size: { name, size: size || null } }
    });

    if (existing) {
      // Optional: Update fields if needed, but for now just return existing
      // Maybe we should update brand/category if they were null?
      // For safety, let's just return it. The Stock entry will add quantity.
      return NextResponse.json({ data: existing });
    }`;

const newStr = `    // Check if item exists (Smart Upsert / Find-or-Create)
    const existing = await prisma.item.findUnique({
      where: { name_size: { name, size: size || null } }
    });

    if (existing) {
       // Check for Brand conflict
       if (existing.brand && brand && existing.brand.toLowerCase() !== brand.toLowerCase()) {
          return NextResponse.json({ 
             error: \`Konflik: Barang '\${name}' size '\${size}' sudah ada dengan brand '\${existing.brand}'. Tidak bisa merge dengan brand '\${brand}'.\` 
          }, { status: 409 });
       }

       // Only update brand if it was missing
       if (!existing.brand && brand) {
          await prisma.item.update({
            where: { id: existing.id },
            data: { brand }
          });
          existing.brand = brand;
       }

       return NextResponse.json({ data: existing });
    }`;

// Try to replace
// We use a slightly looser replacement strategy if exact string match fails due to hidden chars/formatting
// But let's try strict first, but we include the lookup block above to be sure.

if (content.indexOf("if (existing) {") !== -1) {
    // Let's replace the whole block if possible
    const regex = /if \(existing\) \{[\s\S]*?return NextResponse\.json\(\{ data: existing \}\);\s+\}/;
    const replacement = `if (existing) {
       // Check for Brand conflict
       if (existing.brand && brand && existing.brand.toLowerCase() !== brand.toLowerCase()) {
          return NextResponse.json({ 
             error: \`Konflik: Barang '\${name}' size '\${size}' sudah ada dengan brand '\${existing.brand}'. Tidak bisa merge dengan brand '\${brand}'.\` 
          }, { status: 409 });
       }

       // Only update brand if it was missing
       if (!existing.brand && brand) {
          await prisma.item.update({
            where: { id: existing.id },
            data: { brand }
          });
          existing.brand = brand;
       }

       return NextResponse.json({ data: existing });
    }`;

    if (regex.test(content)) {
        content = content.replace(regex, replacement);
        fs.writeFileSync(path, content);
        console.log("Success with regex");
    } else {
        console.log("Regex failed to match");
        process.exit(1);
    }
} else {
    console.log("Block not found");
    process.exit(1);
}
