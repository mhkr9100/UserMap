import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { Upload, FileArchive, Loader2, Play } from 'lucide-react';
import { structurerService } from '../services/structurerService';


interface SocialArchiveDropzoneProps {
    onInsertText: (text: string) => void;
}

export const SocialArchiveDropzone: React.FC<SocialArchiveDropzoneProps> = ({ onInsertText }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file.name.endsWith('.zip')) {
            alert('Please upload a .zip archive (e.g. from Facebook, Instagram, or X).');
            return;
        }

        setIsProcessing(true);
        setStatus('Unzipping archive...');

        try {
            const zip = new JSZip();
            const contents = await zip.loadAsync(file);
            let combinedText = `--- Social Archive Import: ${file.name} ---\n`;
            let filesProcessed = 0;

            const jsonFiles = Object.values(contents.files).filter(f => !f.dir && f.name.endsWith('.json'));
            
            setStatus(`Found ${jsonFiles.length} JSON files. Extracting...`);

            for (const zipEntry of jsonFiles) {
                // Heuristic: Only parse files that sound relevant for personal context
                const lowerName = zipEntry.name.toLowerCase();
                if (lowerName.includes('profile') || lowerName.includes('post') || lowerName.includes('tweet') || lowerName.includes('account')) {
                    const textData = await zipEntry.async('string');
                    try {
                        const parsed = JSON.parse(textData);
                        // Stringify with a strict limit to avoid overloading standard memory ingestion
                        const snippet = JSON.stringify(parsed).slice(0, 5000); 
                        combinedText += `\n[File: ${zipEntry.name}]\n${snippet}\n`;
                        filesProcessed++;
                    } catch {
                        // ignore malformed JSON
                    }
                }
            }

            setStatus(`Done. Extracted context from ${filesProcessed} relevant files.`);
            
            // Queue for background structuring
            structurerService.queueForStructuring({
                content: combinedText,
                source: `Social Archive: ${file.name}`,
                timestamp: new Date().toISOString(),
                metadata: { fileName: file.name, filesCount: filesProcessed }
            });

            setTimeout(() => {

                onInsertText(combinedText);
                setIsProcessing(false);
                setStatus('');
            }, 1000);

        } catch (err: any) {
            alert(`Failed to read ZIP: ${err.message}`);
            setIsProcessing(false);
            setStatus('');
        }
    };

    return (
        <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragging ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-gray-300 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFile(e.dataTransfer.files[0]);
                }
            }}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
        >
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".zip"
                onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            />
            
            {isProcessing ? (
                <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 size={32} className="animate-spin text-violet-500" />
                    <div className="text-[12px] font-bold text-gray-700 dark:text-white/80">{status}</div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-3 cursor-pointer">
                    <FileArchive size={32} className="text-gray-400 dark:text-white/40" />
                    <div>
                        <div className="text-[12px] font-bold text-gray-700 dark:text-white/80 drop-area-text">
                            Drop a Social Media Archive (.zip)
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-white/40 mt-1">
                            Prism will extract posts & profile context locally.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
