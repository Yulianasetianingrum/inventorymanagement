const fs = require('fs');
const path = 'c:/inventorymanagement/app/(admin)/items/page.tsx';
const lines = fs.readFileSync(path, 'utf8').split('\n');

// Target range: 588 to 636 (1-based) => indices 587 to 635 (inclusive)
const startIdx = 587;
const endIdx = 635;

// Debug log what we are replacing
console.log('Replacing line ' + (startIdx + 1) + ': ' + lines[startIdx]);
console.log('...to line ' + (endIdx + 1) + ': ' + lines[endIdx]);

const newContent = `                      <div key={idx} className="flex flex-col bg-white border border-gray-200 shadow-sm rounded-xl p-4 gap-3 hover:shadow-md transition-shadow relative group">
                        <button className="absolute -right-2 -top-2 w-6 h-6 bg-red-100 text-red-600 rounded-full shadow flex items-center justify-center hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10 font-bold" onClick={() => {
                            const n = [...bulkItems]; n.splice(idx, 1); setBulkItems(n);
                        }}>✕</button>

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
                           <div className="w-1/6">
                              <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Size</label>
                              <input className={styles.formInput} placeholder="Ukuran" value={row.size} onChange={e => {
                                const n = [...bulkItems]; n[idx].size = e.target.value; setBulkItems(n);
                              }} />
                           </div>
                        </div>

                        <div className="flex gap-3 pl-8">
                           <div className="flex-1 flex gap-2">
                              <div className="flex-1">
                                <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Kategori</label>
                                <input className={styles.formInput} placeholder="Kategori" value={row.category} onChange={e => {
                                    const n = [...bulkItems]; n[idx].category = e.target.value; setBulkItems(n);
                                }} />
                              </div>
                              <div className="w-1/3">
                                <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Rak</label>
                                <input className={styles.formInput} placeholder="Lokasi" value={row.location} onChange={e => {
                                    const n = [...bulkItems]; n[idx].location = e.target.value; setBulkItems(n);
                                }} />
                              </div>
                           </div>
                           
                           <div className="w-px bg-gray-100 mx-2" />

                           <div className="flex-1 flex gap-2">
                              <div className="w-16">
                                <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Unit</label>
                                <input className={styles.formInput + " text-center"} placeholder="Pcs" value={row.unit} onChange={e => {
                                    const n = [...bulkItems]; n[idx].unit = e.target.value; setBulkItems(n);
                                }} />
                              </div>
                              <div className="w-16">
                                <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Qty</label>
                                <input type="number" className={styles.formInput + " text-center font-bold text-navy"} placeholder="0" value={row.qty} onChange={e => {
                                    const n = [...bulkItems]; n[idx].qty = e.target.value; setBulkItems(n);
                                }} />
                              </div>
                              <div className="flex-1">
                                <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Harga Beli</label>
                                <input type="number" className={styles.formInput} placeholder="Rp" value={row.harga} onChange={e => {
                                    const n = [...bulkItems]; n[idx].harga = e.target.value; setBulkItems(n);
                                }} />
                              </div>
                              <div className="w-16">
                                <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Min.</label>
                                <input type="number" className={styles.formInput + " text-center"} placeholder="0" value={row.minStock} onChange={e => {
                                    const n = [...bulkItems]; n[idx].minStock = e.target.value; setBulkItems(n);
                                }} />
                              </div>
                           </div>
                        </div>
                      </div>`;

lines.splice(startIdx, endIdx - startIdx + 1, newContent);

fs.writeFileSync(path, lines.join('\n'));
console.log('DONE');
