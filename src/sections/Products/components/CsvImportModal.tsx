import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Upload, FileText, Download, AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { useAuth } from '../../../contexts/AuthContext';
import { ProductModel } from '../../../models/ProductModel';
import { parseCsv, downloadCsvTemplate, toDatabaseRow, type CsvParseResult } from '../../../lib/csvImport';

type Step = 'upload' | 'preview';

interface CsvImportModalProps {
  open: boolean;
  onClose: () => void;
  onImported: (count: number) => void;
}

export default function CsvImportModal({ open, onClose, onImported }: CsvImportModalProps) {
  const { activeOrg, user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('upload');
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<CsvParseResult | null>(null);
  const [fileName, setFileName] = useState('');

  function reset() {
    setStep('upload');
    setResult(null);
    setFileName('');
    setParsing(false);
    setImporting(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleFile(file: File) {
    if (!file.name.endsWith('.csv')) {
      toast.error('Only CSV files are supported.');
      return;
    }
    setFileName(file.name);
    setParsing(true);
    try {
      const parsed = await parseCsv(file);
      setResult(parsed);
      setStep('preview');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to parse CSV.');
    } finally {
      setParsing(false);
    }
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleImport() {
    if (!result || !activeOrg || !user) return;
    if (result.valid.length === 0) {
      toast.error('No valid rows to import.');
      return;
    }
    setImporting(true);
    try {
      const rows = result.valid.map((r) => toDatabaseRow(r.data, activeOrg.id, user.id));
      const count = await ProductModel.batchCreate(rows);
      toast.success(`${count} product${count !== 1 ? 's' : ''} imported successfully.`);
      onImported(count);
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  }

  const errorRows = result ? [...new Set(result.errors.map((e) => e.rowIndex))].length : 0;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {step === 'upload' ? 'Import Products via CSV' : `Preview — ${fileName}`}
          </DialogTitle>
          <DialogDescription>
            {step === 'upload'
              ? 'Upload a CSV file to bulk-import products. Required columns: title, purchase_price, competitor_link.'
              : `${result?.totalRows ?? 0} rows parsed · ${result?.valid.length ?? 0} valid · ${errorRows} with errors`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {step === 'upload' && (
            <>
              <label
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  dragging
                    ? 'border-ds-accent bg-ds-accent/5'
                    : 'border-ds-border hover:border-ds-accent/50 hover:bg-ds-surface2/50'
                }`}
              >
                {parsing ? (
                  <Loader2 size={24} className="text-ds-accent animate-spin mb-2" />
                ) : (
                  <Upload size={24} className="text-ds-muted mb-2" />
                )}
                <p className="text-ds-text2 text-sm font-medium">
                  {parsing ? 'Parsing…' : 'Drop your CSV here or click to browse'}
                </p>
                <p className="text-ds-muted text-xs mt-1">Only .csv files</p>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={onFileInput} />
              </label>

              <div className="card-elevated p-4 space-y-2">
                <p className="text-ds-text2 text-xs font-semibold uppercase tracking-wider">Column guide</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  {[
                    ['title', 'required', 'Product name'],
                    ['purchase_price', 'required', 'Numeric (e.g. 29.99)'],
                    ['competitor_link', 'required', 'Full URL'],
                    ['colors', 'optional', 'Pipe-separated (Red|Blue)'],
                    ['sizes', 'optional', 'Pipe-separated (S|M|L)'],
                    ['status', 'optional', 'NOT_IMPORTED · READY_TO_IMPORT'],
                    ['gender', 'optional', 'men · women · unisex · kids'],
                    ['season', 'optional', 'spring · summer · fall · winter'],
                    ['discount', 'optional', '0–100'],
                    ['stock_quantity', 'optional', 'Integer ≥ 0'],
                  ].map(([col, req, hint]) => (
                    <div key={col} className="flex items-baseline gap-1.5">
                      <code className="text-ds-accent text-[11px]">{col}</code>
                      <span className={`text-[10px] px-1 rounded ${req === 'required' ? 'bg-red-500/10 text-red-400' : 'bg-ds-surface2 text-ds-muted'}`}>{req}</span>
                      <span className="text-ds-muted text-[11px] truncate">{hint}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 'preview' && result && (
            <>
              {result.valid.length > 0 && (
                <div>
                  <p className="text-ds-text2 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    Valid rows ({result.valid.length})
                  </p>
                  <div className="border border-ds-border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto max-h-48">
                      <table className="w-full text-xs">
                        <thead className="bg-ds-surface2 sticky top-0">
                          <tr>
                            {['Row', 'Title', 'Price', 'Competitor Link', 'Status'].map((h) => (
                              <th key={h} className="text-left px-3 py-2 text-ds-muted font-medium">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ds-borderSoft">
                          {result.valid.map(({ rowIndex, data }) => (
                            <tr key={rowIndex} className="hover:bg-ds-surface2/50">
                              <td className="px-3 py-2 text-ds-muted">{rowIndex}</td>
                              <td className="px-3 py-2 text-ds-text max-w-[160px] truncate">{data.title}</td>
                              <td className="px-3 py-2 text-emerald-400">${parseFloat(data.purchase_price).toFixed(2)}</td>
                              <td className="px-3 py-2 text-ds-accent max-w-[160px] truncate">{data.competitor_link}</td>
                              <td className="px-3 py-2 text-ds-muted">{data.status || 'NOT_IMPORTED'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {result.errors.length > 0 && (
                <div>
                  <p className="text-ds-text2 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertTriangle size={12} className="text-amber-400" />
                    Rows with errors ({errorRows} rows, {result.errors.length} issue{result.errors.length !== 1 ? 's' : ''})
                    {result.valid.length > 0 && <span className="text-ds-muted font-normal normal-case tracking-normal">— these will be skipped</span>}
                  </p>
                  <div className="border border-amber-500/20 rounded-xl overflow-hidden bg-amber-500/5 max-h-40 overflow-y-auto">
                    {result.errors.map((e, i) => (
                      <div key={i} className="flex items-start gap-3 px-3 py-2 border-b border-amber-500/10 last:border-0">
                        <span className="text-ds-muted shrink-0">Row {e.rowIndex}</span>
                        <span className="text-amber-300 font-mono shrink-0">{e.field}</span>
                        <span className="text-amber-400/80">{e.message}</span>
                      </div>
                    ))}
                  </div>
                  {result.valid.length === 0 && (
                    <p className="text-red-400 text-xs mt-2 flex items-center gap-1.5">
                      <X size={11} />All rows have errors. Fix the CSV and re-upload.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          {step === 'upload' ? (
            <>
              <Button variant="ghost" size="sm" onClick={downloadCsvTemplate} className="mr-auto flex items-center gap-1.5">
                <Download size={13} />Download template
              </Button>
              <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={reset} className="mr-auto flex items-center gap-1.5">
                <FileText size={13} />Upload different file
              </Button>
              <Button variant="secondary" onClick={handleClose} disabled={importing}>Cancel</Button>
              <Button
                variant="primary"
                onClick={handleImport}
                disabled={importing || result?.valid.length === 0}
              >
                {importing
                  ? <><Loader2 size={13} className="animate-spin" />Importing…</>
                  : `Import ${result?.valid.length ?? 0} product${(result?.valid.length ?? 0) !== 1 ? 's' : ''}`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
