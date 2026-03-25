
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QrCode, Download, Printer } from 'lucide-react';

interface QRCodeGeneratorProps {
  codes: Array<{
    id: string;
    code: string;
    type: string;
    targetId: string;
    targetName?: string;
  }>;
  examTitle?: string;
}

const QRCodeGenerator = ({ codes, examTitle }: QRCodeGeneratorProps) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  const generateQRCode = async () => {
    try {
      const codesList = codes.map(code => `${code.code} - ${code.targetName || 'غير محدد'}`).join('\n');
      const qrData = `أكواد الامتحان: ${examTitle || 'غير محدد'}\n\n${codesList}`;
      
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrDataUrl(qrCodeDataUrl);
      setIsOpen(true);
    } catch (error) {
      console.error('خطأ في إنشاء QR Code:', error);
    }
  };

  const downloadQRCode = () => {
    if (qrDataUrl) {
      const link = document.createElement('a');
      link.download = `qr-codes-${examTitle || 'exam'}.png`;
      link.href = qrDataUrl;
      link.click();
    }
  };

  const printQRCode = () => {
    if (qrDataUrl) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>طباعة QR Code - ${examTitle}</title>
              <style>
                body { 
                  display: flex; 
                  flex-direction: column; 
                  align-items: center; 
                  margin: 20px;
                  font-family: Arial, sans-serif;
                }
                h1 { color: #333; margin-bottom: 20px; }
                img { margin: 20px 0; }
                .codes-list { 
                  text-align: right; 
                  direction: rtl; 
                  margin-top: 20px;
                  border: 1px solid #ccc;
                  padding: 15px;
                  border-radius: 5px;
                }
              </style>
            </head>
            <body>
              <h1>أكواد الامتحان: ${examTitle || 'غير محدد'}</h1>
              <img src="${qrDataUrl}" alt="QR Code" />
              <div class="codes-list">
                <h3>قائمة الأكواد:</h3>
                ${codes.map(code => `<p>${code.code} - ${code.targetName || 'غير محدد'}</p>`).join('')}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          onClick={generateQRCode}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          disabled={codes.length === 0}
        >
          <QrCode className="w-4 h-4 mr-2" />
          إنشاء QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">QR Code للأكواد</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          {qrDataUrl && (
            <>
              <img src={qrDataUrl} alt="QR Code" className="border rounded-lg" />
              <p className="text-sm text-gray-600 text-center">
                امسح الكود للحصول على قائمة الأكواد
              </p>
              <div className="flex space-x-2 space-x-reverse">
                <Button onClick={downloadQRCode} size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  تحميل
                </Button>
                <Button onClick={printQRCode} size="sm" variant="outline">
                  <Printer className="w-4 h-4 mr-2" />
                  طباعة
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeGenerator;
