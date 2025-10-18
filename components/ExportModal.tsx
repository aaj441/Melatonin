import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '~/trpc/react';
import { MysticalCard } from './MysticalCard';
import { GlowingButton } from './GlowingButton';
import { Download, X, FileJson, FileSpreadsheet, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExportModalProps {
  userId: number;
  onClose: () => void;
}

type ExportType = 'dreams' | 'rituals' | 'achievements';
type ExportFormat = 'json' | 'csv';

export function ExportModal({ userId, onClose }: ExportModalProps) {
  const trpc = useTRPC();
  const [exportType, setExportType] = useState<ExportType>('dreams');
  const [format, setFormat] = useState<ExportFormat>('json');
  const [useeDateRange, setUseDateRange] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const handleExport = async () => {
    try {
      let data;
      const dateParams = useDateRange ? {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      } : {};
      
      if (exportType === 'dreams') {
        const result = await trpc.exportDreams.query({
          userId,
          format,
          ...dateParams,
        });
        data = result;
      } else if (exportType === 'rituals') {
        const result = await trpc.exportRituals.query({
          userId,
          format,
          ...dateParams,
        });
        data = result;
      } else {
        const result = await trpc.exportAchievements.query({
          userId,
          format,
        });
        data = result;
      }
      
      // Create and download file
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        downloadFile(blob, `${exportType}-export.json`);
      } else {
        // Convert to CSV
        const csv = convertToCSV(data.data);
        const blob = new Blob([csv], { type: 'text/csv' });
        downloadFile(blob, `${exportType}-export.csv`);
      }
      
      toast.success('Export downloaded!');
      onClose();
    } catch (error) {
      toast.error('Failed to export data');
    }
  };
  
  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma
          const escaped = String(value).replace(/"/g, '""');
          return escaped.includes(',') ? `"${escaped}"` : escaped;
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <MysticalCard glow className="max-w-lg w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-cosmic-indigo/20">
                <Download size={24} className="text-ethereal-purple" />
              </div>
              <div>
                <h2 className="text-2xl font-mystical text-ethereal-purple">
                  Export Your Data
                </h2>
                <p className="text-sm text-cosmic-purple">
                  Download your journal entries and progress
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-cosmic-purple hover:text-ethereal-purple hover:bg-cosmic-navy/50 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Export Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-ethereal-silver mb-3">
              What to Export
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['dreams', 'rituals', 'achievements'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setExportType(type)}
                  className={`px-4 py-4 rounded-xl border-2 transition-all capitalize ${
                    exportType === type
                      ? 'bg-cosmic-indigo/30 border-cosmic-indigo text-ethereal-purple shadow-glow scale-[1.02]'
                      : 'bg-cosmic-navy/30 border-cosmic-purple/30 text-cosmic-purple hover:border-cosmic-purple hover:scale-[1.01]'
                  }`}
                >
                  <div className="font-medium">{type}</div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Format Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-ethereal-silver mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormat('json')}
                className={`flex items-center justify-center gap-3 px-4 py-4 rounded-xl border-2 transition-all ${
                  format === 'json'
                    ? 'bg-cosmic-indigo/30 border-cosmic-indigo text-ethereal-purple shadow-glow'
                    : 'bg-cosmic-navy/30 border-cosmic-purple/30 text-cosmic-purple hover:border-cosmic-purple'
                }`}
              >
                <FileJson size={20} />
                <span className="font-medium">JSON</span>
              </button>
              <button
                onClick={() => setFormat('csv')}
                className={`flex items-center justify-center gap-3 px-4 py-4 rounded-xl border-2 transition-all ${
                  format === 'csv'
                    ? 'bg-cosmic-indigo/30 border-cosmic-indigo text-ethereal-purple shadow-glow'
                    : 'bg-cosmic-navy/30 border-cosmic-purple/30 text-cosmic-purple hover:border-cosmic-purple'
                }`}
              >
                <FileSpreadsheet size={20} />
                <span className="font-medium">CSV</span>
              </button>
            </div>
          </div>
          
          {/* Date Range (for dreams and rituals only) */}
          {exportType !== 'achievements' && (
            <div className="mb-8 p-4 rounded-xl bg-cosmic-navy/30 border border-cosmic-purple/30">
              <label className="flex items-center gap-2 text-sm font-medium text-ethereal-silver mb-3">
                <input
                  type="checkbox"
                  checked={useDateRange}
                  onChange={(e) => setUseDateRange(e.target.checked)}
                  className="rounded border-cosmic-purple/30 bg-cosmic-navy/50 text-cosmic-indigo focus:ring-cosmic-indigo/20"
                />
                <Calendar size={16} />
                Filter by Date Range
              </label>
              
              {useDateRange && (
                <div className="grid grid-cols-2 gap-3 mt-3 animate-fade-in">
                  <div>
                    <label className="block text-xs text-cosmic-purple mb-1.5">From</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-cosmic-navy/50 border border-cosmic-purple/30 rounded-lg px-3 py-2 text-sm text-ethereal-silver focus:outline-none focus:border-cosmic-indigo focus:ring-2 focus:ring-cosmic-indigo/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-cosmic-purple mb-1.5">To</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-cosmic-navy/50 border border-cosmic-purple/30 rounded-lg px-3 py-2 text-sm text-ethereal-silver focus:outline-none focus:border-cosmic-indigo focus:ring-2 focus:ring-cosmic-indigo/20"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-cosmic-purple/20">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-cosmic-navy/30 hover:bg-cosmic-navy/50 rounded-lg transition-colors text-cosmic-purple hover:text-ethereal-purple border border-cosmic-purple/30"
            >
              Cancel
            </button>
            <GlowingButton
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Export {exportType}
            </GlowingButton>
          </div>
        </div>
      </MysticalCard>
    </div>
  );
}
