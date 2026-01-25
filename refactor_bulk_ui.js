const fs = require('fs');
const path = 'c:/inventorymanagement/app/(admin)/items/page.tsx';
const content = fs.readFileSync(path, 'utf8');

// We want to replace the entire BULK MODE UI block
// From: {itemMode === 'bulk' && (
// To: )} (just before single mode)

const startMarker = "{itemMode === 'bulk' && (";
const endMarker = "{/* SINGLE MODE UI */}";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error("Markers not found!");
    console.log("Start:", startIndex, "End:", endIndex);
    process.exit(1);
}

// Find the precise end of the bulk block (it's the closing brace before the single mode comment)
// Actually, endIndex points to { of the comment. We need to go back to find the closing )} of the bulk block.
// Let's just replace from startMarker up to endIndex.

const newBlock = `{itemMode === 'bulk' && (
                <div className="space-y-6">
                  {/* Global Supplier Search REMOVED (moved to row) */}
                  
                  <div className={styles.bulkTableWrapper}>
                    <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto px-1 py-2">
                      <div className="grid grid-cols-12 gap-2 px-4 text-xs font-bold text-navy/40 uppercase tracking-wider">
                        <div className="col-span-4">Identitas & Supplier</div>
                        <div className="col-span-4">Spesifikasi & Lokasi</div>
                        <div className="col-span-4">Stok & Harga</div>
                      </div>
                      {bulkItems.map((row, idx) => (
                        <div key={idx} className="flex flex-col bg-white border border-gray-200 shadow-sm rounded-xl p-4 gap-3 hover:shadow-md transition-shadow relative group">
                          <button className="absolute -right-2 -top-2 w-6 h-6 bg-red-100 text-red-600 rounded-full shadow flex items-center justify-center hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10 font-bold" onClick={() => {
                            const n = [...bulkItems]; n.splice(idx, 1); setBulkItems(n);
                          }}>✕</button>

                          {/* ROW 1: Identity & Supplier */}
                          <div className="flex gap-3 items-center border-b border-dashed border-gray-100 pb-3">
                            <div className="w-8 flex items-center justify-center font-bold text-navy/20">{idx + 1}.</div>
                            <div className="flex-1">
                              <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Nama Produk</label>
                              <input className={styles.formInput} placeholder="Contoh: Semen Gresik 40kg" value={row.name} onChange={e => {
                                const n = [...bulkItems]; n[idx].name = e.target.value; setBulkItems(n);
                              }} />
                            </div>
                            <div className="w-1/4">
                              <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Brand</label>
                              <input className={styles.formInput} placeholder="Merk" value={row.brand} onChange={e => {
                                const n = [...bulkItems]; n[idx].brand = e.target.value; setBulkItems(n);
                              }} />
                            </div>
                            <div className="w-1/3">
                              <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Supplier</label>
                              <SmartSupplierInput
                                value={row.supplierName || ""}
                                onChange={(val) => {
                                  const n = [...bulkItems]; n[idx].supplierName = val; setBulkItems(n);
                                }}
                                onSelect={(id, name) => {
                                  const n = [...bulkItems]; n[idx].supplierId = id; n[idx].supplierName = name; setBulkItems(n);
                                }}
                              />
                            </div>
                          </div>

                          {/* ROW 2: Specs */}
                          <div className="flex gap-3 pl-8 pb-3 border-b border-dashed border-gray-100">
                             <div className="flex-1">
                                <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Kategori</label>
                                <input className={styles.formInput} placeholder="Kategori" value={row.category} onChange={e => {
                                  const n = [...bulkItems]; n[idx].category = e.target.value; setBulkItems(n);
                                }} />
                              </div>
                              <div className="flex-1">
                                <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Rak</label>
                                <input className={styles.formInput} placeholder="Lokasi" value={row.location} onChange={e => {
                                  const n = [...bulkItems]; n[idx].location = e.target.value; setBulkItems(n);
                                }} />
                              </div>
                               <div className="flex-1">
                                <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Size</label>
                                <input className={styles.formInput} placeholder="Ukuran" value={row.size} onChange={e => {
                                  const n = [...bulkItems]; n[idx].size = e.target.value; setBulkItems(n);
                                }} />
                              </div>
                              <div className="w-20">
                                <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Min.</label>
                                <input type="number" className={styles.formInput + " text-center"} placeholder="0" value={row.minStock} onChange={e => {
                                    const n = [...bulkItems]; n[idx].minStock = e.target.value; setBulkItems(n);
                                }} />
                              </div>
                          </div>

                          {/* ROW 3: Stock Logic */}
                          <div className="flex gap-3 pl-8 items-center bg-gray-50/50 p-2 rounded">
                                <div className="w-20">
                                  <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Unit</label>
                                  <input className={styles.formInput + " text-center"} placeholder="Pcs" value={row.unit} onChange={e => {
                                      const n = [...bulkItems]; n[idx].unit = e.target.value; setBulkItems(n);
                                  }} />
                                </div>
                                <div className="w-24">
                                  <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Qty</label>
                                  <input type="number" className={styles.formInput + " text-center font-bold text-navy"} placeholder="0" value={row.qty} onChange={e => {
                                      const n = [...bulkItems]; n[idx].qty = e.target.value; setBulkItems(n);
                                  }} />
                                </div>
                                <div className="w-32">
                                  <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Satuan Beli</label>
                                  <select className={styles.formInput} value={row.unitQty || 'satuan'} onChange={e => {
                                      const n = [...bulkItems]; n[idx].unitQty = e.target.value; setBulkItems(n);
                                  }}>
                                    <option value="satuan">Pcs/Satuan</option>
                                    <option value="pack">Pack/Dus</option>
                                  </select>
                                </div>
                                {row.unitQty === 'pack' && (
                                  <div className="w-20">
                                    <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Isi</label>
                                    <input type="number" className={styles.formInput + " text-center"} placeholder="1" value={row.isiPerPack} onChange={e => {
                                        const n = [...bulkItems]; n[idx].isiPerPack = e.target.value; setBulkItems(n);
                                    }} />
                                  </div>
                                )}
                              
                              <div className="flex-1">
                                <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Harga Beli</label>
                                <input type="number" className={styles.formInput} placeholder="Rp" value={row.harga} onChange={e => {
                                    const n = [...bulkItems]; n[idx].harga = e.target.value; setBulkItems(n);
                                }} />
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                    <Button className="m-4 !h-8 !text-xs" onClick={() => setBulkItems([...bulkItems, { name: "", brand: "", category: "", location: "", size: "", unit: "pcs", unitQty: "satuan", isiPerPack: "", priceType: "per_satuan", minStock: "0", qty: "", harga: "", supplierId: 0, supplierName: "" }])}>+ Tambah Baris</Button>
                  </div>
                </div>
              )}

              `;

// We replace everything between start and end with newBlock.
// Note: endMarker is the start of the next block, so we keep the endMarker (by not including it in the replacement range, but we are replacing UP TO it).
// Wait, splice needs (start, deleteCount, insert).
// We want to delete from startIndex to endIndex - 1.
// But wait, the previous code had a closing `)}` (or similar) before the SINGLE MODE comment.
// Let's verify what lies between the bulk items end and the comment.
// Usually `)}` and some whitespace.
// My newBlock INCLUDES the closing `)}`.
// So I should replace from startIndex up to where the next block starts (endIndex).

const before = content.substring(0, startIndex);
const after = content.substring(endIndex);

fs.writeFileSync(path, before + newBlock + after);
console.log('DONE');
