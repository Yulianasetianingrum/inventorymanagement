const fs = require('fs');
const path = 'c:/inventorymanagement/app/(admin)/items/page.tsx';
const lines = fs.readFileSync(path, 'utf8').split('\n');

// Target range: 635 to 660 (1-based) => indices 634 to 659
const startIdx = 634;
const endIdx = 659;

console.log('Replacing lines ' + (startIdx + 1) + ' to ' + (endIdx + 1));

const newContent = `                            <div className="flex-1 flex gap-2">
                              {/* Stock Params */}
                              <div className="flex-[2] flex gap-2">
                                <div className="w-16">
                                  <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Unit</label>
                                  <input className={styles.formInput + " text-center"} placeholder="Pcs" value={row.unit} onChange={e => {
                                      const n = [...bulkItems]; n[idx].unit = e.target.value; setBulkItems(n);
                                  }} />
                                </div>
                                <div className="w-20">
                                  <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Qty</label>
                                  <input type="number" className={styles.formInput + " text-center font-bold text-navy"} placeholder="0" value={row.qty} onChange={e => {
                                      const n = [...bulkItems]; n[idx].qty = e.target.value; setBulkItems(n);
                                  }} />
                                </div>
                                <div className="w-24">
                                  <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Satuan</label>
                                  <select className={styles.formInput} value={row.unitQty || 'satuan'} onChange={e => {
                                      const n = [...bulkItems]; n[idx].unitQty = e.target.value; setBulkItems(n);
                                  }}>
                                    <option value="satuan">Pcs/Satuan</option>
                                    <option value="pack">Pack/Dus</option>
                                  </select>
                                </div>
                                {row.unitQty === 'pack' && (
                                  <div className="w-16">
                                    <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Isi</label>
                                    <input type="number" className={styles.formInput + " text-center"} placeholder="1" value={row.isiPerPack} onChange={e => {
                                        const n = [...bulkItems]; n[idx].isiPerPack = e.target.value; setBulkItems(n);
                                    }} />
                                  </div>
                                )}
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
                           </div>`;

lines.splice(startIdx, endIdx - startIdx + 1, newContent);

fs.writeFileSync(path, lines.join('\n'));
console.log('DONE');
