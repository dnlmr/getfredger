import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { FolderUp, ImageIcon, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { z } from 'zod';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from "sonner";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

// File validation schema
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'application/pdf': ['.pdf']
};

const FileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, `File size should be less than 5MB`)
    .refine(
      (file) => Object.keys(ACCEPTED_FILE_TYPES).includes(file.type),
      "Only images (JPG, PNG, GIF) and PDF files are accepted"
    ),
});

const invoices = [
    {
        invoice: "INV001",
        paymentStatus: "Paid",
        totalAmount: "$250.00",
        paymentMethod: "Credit Card",
    },
    {
        invoice: "INV002",
        paymentStatus: "Pending",
        totalAmount: "$150.00",
        paymentMethod: "PayPal",
    },
    {
        invoice: "INV003",
        paymentStatus: "Unpaid",
        totalAmount: "$350.00",
        paymentMethod: "Bank Transfer",
    },
    {
        invoice: "INV004",
        paymentStatus: "Paid",
        totalAmount: "$450.00",
        paymentMethod: "Credit Card",
    },
    {
        invoice: "INV005",
        paymentStatus: "Paid",
        totalAmount: "$550.00",
        paymentMethod: "PayPal",
    },
    {
        invoice: "INV006",
        paymentStatus: "Pending",
        totalAmount: "$200.00",
        paymentMethod: "Bank Transfer",
    },
    {
        invoice: "INV007",
        paymentStatus: "Unpaid",
        totalAmount: "$300.00",
        paymentMethod: "Credit Card",
    },
]

// Invoice Upload Dropzone Component
const InvoiceUploadDropzone = () => {
  // Simple, focused state management
  const [files, setFiles] = useState<File[]>([]);
  const [fileStatus, setFileStatus] = useState<Record<string, {
    progress: number;
    status: 'idle' | 'uploading' | 'success' | 'error';
  }>>({});
  const [currentUploadIndex, setCurrentUploadIndex] = useState<number | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const validFiles: File[] = [];

    // Simple validation and initialization
    acceptedFiles.forEach(file => {
      try {
        FileSchema.parse({ file });
        validFiles.push(file);

        // Initialize status for new files
        setFileStatus(prev => ({
          ...prev,
          [file.name]: { progress: 0, status: 'idle' }
        }));
      } catch (error) {
        // Silently ignore invalid files
        console.warn(`Invalid file: ${file.name}`, error);
      }
    });

    setFiles(prev => [...prev, ...validFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true
  });

  const removeFile = (index: number) => {
    // Only allow removing files that aren't being uploaded
    const file = files[index];
    if (fileStatus[file.name]?.status === 'uploading') return;

    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);

    // Clean up status
    setFileStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[file.name];
      return newStatus;
    });
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Show success message when there's a success message from the server
  useEffect(() => {
    const success = (window as Window & { success?: string })?.success;

    if (success) {
      // Replace alert with toast
      toast.success(success);
      // Reset form after successful upload
      setFiles([]);
      setFileStatus({});
    }
  }, []);

  // Upload a single file
  const uploadFile = (index: number) => {
    if (index >= files.length) {
      setCurrentUploadIndex(null);
    //   toast.success(`All uploads completed successfully!`);
      return;
    }

    const file = files[index];

    // Skip files that are already processed
    if (fileStatus[file.name]?.status === 'success' || fileStatus[file.name]?.status === 'error') {
      uploadFile(index + 1);
      return;
    }

    setCurrentUploadIndex(index);
    setFileStatus(prev => ({
      ...prev,
      [file.name]: { ...prev[file.name], status: 'uploading' }
    }));

    router.post('/invoices/upload',
      { file },
      {
        forceFormData: true,
        preserveScroll: true,
        onProgress: (progress) => {
          if (progress) {
            setFileStatus(prev => ({
              ...prev,
              [file.name]: { ...prev[file.name], progress: progress.percentage || 0 }
            }));
          }
        },
        onSuccess: () => {
          setFileStatus(prev => ({
            ...prev,
            [file.name]: { ...prev[file.name], status: 'success' }
          }));

          // Show success toast for individual file
          toast.success(`${file.name} uploaded successfully`);

          // Move to the next file
          uploadFile(index + 1);
        },
        onError: () => {
          setFileStatus(prev => ({
            ...prev,
            [file.name]: { ...prev[file.name], status: 'error' }
          }));

          // Show error toast
          toast.error(`Failed to upload ${file.name}`);

          // Continue with next file even if this one failed
          uploadFile(index + 1);
        }
      }
    );
  };

  // Start the upload process
  const handleSubmit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (files.length === 0 || currentUploadIndex !== null) return;

    // Start with the first file
    uploadFile(0);
  };

  // Clean up successful uploads when all done
  useEffect(() => {
    if (currentUploadIndex === null && files.length > 0) {
      const remainingFiles = files.filter(
        file => fileStatus[file.name]?.status !== 'success'
      );

      if (remainingFiles.length !== files.length) {
        setFiles(remainingFiles);
      }
    }
  }, [currentUploadIndex, files, fileStatus]);

  const getThumbnail = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
        return <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" className="size-8" viewBox="0 0 256 256"><path fill="currentColor" d="M224 152a8 8 0 0 1-8 8h-24v16h16a8 8 0 0 1 0 16h-16v16a8 8 0 0 1-16 0v-56a8 8 0 0 1 8-8h32a8 8 0 0 1 8 8M92 172a28 28 0 0 1-28 28h-8v8a8 8 0 0 1-16 0v-56a8 8 0 0 1 8-8h16a28 28 0 0 1 28 28m-16 0a12 12 0 0 0-12-12h-8v24h8a12 12 0 0 0 12-12m88 8a36 36 0 0 1-36 36h-16a8 8 0 0 1-8-8v-56a8 8 0 0 1 8-8h16a36 36 0 0 1 36 36m-16 0a20 20 0 0 0-20-20h-8v40h8a20 20 0 0 0 20-20M40 112V40a16 16 0 0 1 16-16h96a8 8 0 0 1 5.66 2.34l56 56A8 8 0 0 1 216 88v24a8 8 0 0 1-16 0V96h-48a8 8 0 0 1-8-8V40H56v72a8 8 0 0 1-16 0m120-32h28.69L160 51.31Z" /></svg>;
    }
    return <ImageIcon className="h-8 w-8 text-blue-500" />;
  };

  const getStatusIcon = (status: 'idle' | 'uploading' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div
      {...getRootProps()}
      className={`border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border transition-all duration-200
        ${isDragActive ? 'bg-blue-50/30 dark:bg-blue-900/10 border-blue-300 dark:border-blue-500/50' : 'hover:bg-gray-50 hover:border-gray-300 dark:hover:border-gray-500/50 dark:hover:bg-gray-800/50'}
      `}
    >
      <input {...getInputProps()} />

      <div className="flex h-full flex-col p-4">
        {files.length > 0 ? (
          <div className="flex h-full flex-col">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">
                {files.length} file{files.length > 1 ? 's' : ''} selected
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentUploadIndex === null) {
                      setFiles([]);
                      setFileStatus({});
                    }
                  }}
                  disabled={currentUploadIndex !== null}
                  className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 disabled:opacity-50"
                >
                  Clear All
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={currentUploadIndex !== null || files.length === 0}
                  className={`rounded px-2 py-1 text-xs ${
                    currentUploadIndex !== null
                      ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400'
                  } disabled:opacity-50`}
                >
                  {currentUploadIndex !== null ? 'Uploading...' : 'Upload All'}
                </button>
              </div>
            </div>
            <ScrollArea className="flex-1 pr-4">
              <div className="grid gap-2">
                {files.map((file, index) => {
                  const thumbnail = getThumbnail(file);
                  const fileInfo = fileStatus[file.name] || { progress: 0, status: 'idle' };

                  return (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex flex-col gap-2 rounded border border-gray-200 p-2 dark:border-gray-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 dark:bg-gray-800">
                          {thumbnail ? (
                            <img src={thumbnail} alt={file.name} className="h-full w-full rounded object-cover" />
                          ) : (
                            getFileIcon(file)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium">{file.name}</span>
                            {getStatusIcon(fileInfo.status)}
                          </div>
                          <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                        </div>
                        {fileInfo.status === 'idle' && (
                          <button
                            onClick={() => removeFile(index)}
                            className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="Remove file"
                          >
                            <X className="h-4 w-4 text-gray-500" />
                          </button>
                        )}
                      </div>

                      {fileInfo.status !== 'idle' && (
                        <Progress
                          value={fileInfo.progress}
                          className={`h-1 ${
                            fileInfo.status === 'success'
                              ? 'bg-green-100 dark:bg-green-900/20'
                              : fileInfo.status === 'error'
                                ? 'bg-red-100 dark:bg-red-900/20'
                                : 'bg-blue-100 dark:bg-blue-900/20'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-500">
                Drop more files or click to browse
              </p>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 transition-transform duration-200">
              {isDragActive ? (
                <FolderUp className="size-10 text-blue-500 dark:text-blue-400" />
              ) : (
                <Upload className="size-10 text-gray-400 dark:text-gray-500" />
              )}
            </div>
            <p className="mb-1 font-medium text-gray-700 dark:text-gray-300">
              {isDragActive ? 'Drop invoices here' : 'Upload Invoices'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Drag & drop invoice files, or click to browse
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              JPG, PNG or PDF (max. 5MB each)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <InvoiceUploadDropzone />
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">

                    <div className="flex flex-1 items-center gap-2 p-4">
                        <Table>
                            <TableCaption>A list of your recent invoices.</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Invoice</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((invoice) => (
                                    <TableRow key={invoice.invoice}>
                                        <TableCell className="font-medium">{invoice.invoice}</TableCell>
                                        <TableCell>{invoice.paymentStatus}</TableCell>
                                        <TableCell>{invoice.paymentMethod}</TableCell>
                                        <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={3}>Total</TableCell>
                                    <TableCell className="text-right">$2,500.00</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
