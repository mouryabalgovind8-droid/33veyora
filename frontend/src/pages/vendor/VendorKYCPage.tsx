import { useState } from 'react';
import { 
  Shield, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Camera, 
  ArrowRight,
  Clock,
  X
} from 'lucide-react';

type DocumentType = 'aadhar' | 'pan' | 'gst' | 'property_deed' | 'safety_cert';

interface UploadedDocument {
  id: string;
  type: DocumentType;
  fileName: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: Date;
  rejectionReason?: string;
}

const documentTypes: { type: DocumentType; label: string; description: string; required: boolean }[] = [
  { type: 'aadhar', label: 'Aadhar Card / Government ID', description: 'Identity verification for host registration', required: true },
  { type: 'pan', label: 'PAN Card', description: 'Required for payment processing', required: true },
  { type: 'property_deed', label: 'Property Ownership Proof', description: 'Ownership deed or rental agreement', required: true },
  { type: 'safety_cert', label: 'Safety Certificate', description: 'Fire safety, electrical safety certificates', required: false },
  { type: 'gst', label: 'GST Registration', description: 'For tax compliance (if applicable)', required: false },
];

export default function VendorKYCPage() {
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([
    {
      id: '1',
      type: 'aadhar',
      fileName: 'aadhar_card.pdf',
      status: 'approved',
      uploadedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      type: 'pan',
      fileName: 'pan_card.jpg',
      status: 'pending',
      uploadedAt: new Date('2024-01-20'),
    },
  ]);
  
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending': return <Clock className="h-5 w-5 text-amber-600" />;
      case 'rejected': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <FileText className="h-5 w-5 text-slate-400" />;
    }
  };
  
  const getDocByType = (type: DocumentType) => {
    return uploadedDocs.find(doc => doc.type === type);
  };
  
  const handleUpload = (type: DocumentType) => {
    setSelectedType(type);
    setShowUploadModal(true);
  };
  
  const handleFileSelect = () => {
    // Simulate file upload
    setIsUploading(true);
    setTimeout(() => {
      if (selectedType) {
        const newDoc: UploadedDocument = {
          id: Date.now().toString(),
          type: selectedType,
          fileName: `document_${Date.now()}.pdf`,
          status: 'pending',
          uploadedAt: new Date(),
        };
        setUploadedDocs([...uploadedDocs, newDoc]);
      }
      setIsUploading(false);
      setShowUploadModal(false);
      setSelectedType(null);
    }, 2000);
  };
  
  const approvedCount = uploadedDocs.filter(d => d.status === 'approved').length;
  const requiredDocs = documentTypes.filter(d => d.required);
  const allRequiredApproved = requiredDocs.every(doc => {
    const uploaded = getDocByType(doc.type);
    return uploaded && uploaded.status === 'approved';
  });
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Verification & KYC</h1>
        <p className="text-slate-500 mt-2">
          Complete your verification to start hosting on 33veyora
        </p>
      </div>
      
      {/* Status Banner */}
      <div className={`p-6 rounded-2xl mb-8 ${
        allRequiredApproved 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-amber-50 border border-amber-200'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            allRequiredApproved ? 'bg-green-100' : 'bg-amber-100'
          }`}>
            {allRequiredApproved ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <Shield className="h-6 w-6 text-amber-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${
              allRequiredApproved ? 'text-green-900' : 'text-amber-900'
            }`}>
              {allRequiredApproved ? 'Verification Complete!' : 'Verification In Progress'}
            </h3>
            <p className={`text-sm mt-1 ${
              allRequiredApproved ? 'text-green-700' : 'text-amber-700'
            }`}>
              {allRequiredApproved 
                ? 'Your account is fully verified. You can now receive bookings.'
                : `${approvedCount} of ${requiredDocs.length} required documents approved.`
              }
            </p>
          </div>
        </div>
      </div>
      
      {/* Documents Grid */}
      <div className="space-y-4">
        {documentTypes.map((docType) => {
          const uploaded = getDocByType(docType.type);
          
          return (
            <div 
              key={docType.type}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{docType.label}</h3>
                      {docType.required && (
                        <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{docType.description}</p>
                    
                    {uploaded && (
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-sm text-slate-600">{uploaded.fileName}</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(uploaded.status)}`}>
                          {uploaded.status.charAt(0).toUpperCase() + uploaded.status.slice(1)}
                        </span>
                      </div>
                    )}
                    
                    {uploaded?.rejectionReason && (
                      <p className="text-sm text-red-600 mt-2">
                        Reason: {uploaded.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {uploaded && getStatusIcon(uploaded.status)}
                  
                  <button
                    onClick={() => handleUpload(docType.type)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                      uploaded?.status === 'approved'
                        ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                        : uploaded?.status === 'pending'
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                    disabled={uploaded?.status === 'approved'}
                  >
                    {uploaded ? (
                      uploaded.status === 'approved' ? (
                        'Verified'
                      ) : uploaded.status === 'pending' ? (
                        'Re-upload'
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Upload
                        </>
                      )
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Upload
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Help Section */}
      <div className="mt-8 bg-slate-50 rounded-2xl p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Need help with verification?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <Camera className="h-6 w-6 text-slate-600 mb-3" />
            <h4 className="font-medium text-slate-900 mb-1">Photo Guidelines</h4>
            <p className="text-sm text-slate-500">Ensure documents are clear, uncut, and all text is readable</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <Clock className="h-6 w-6 text-slate-600 mb-3" />
            <h4 className="font-medium text-slate-900 mb-1">Processing Time</h4>
            <p className="text-sm text-slate-500">Verification typically takes 24-48 business hours</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <AlertCircle className="h-6 w-6 text-slate-600 mb-3" />
            <h4 className="font-medium text-slate-900 mb-1">Common Issues</h4>
            <p className="text-sm text-slate-500">Blurry images, expired documents, or missing information</p>
          </div>
        </div>
      </div>
      
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Upload Document</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-slate-400 transition-colors">
              <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 font-medium mb-1">
                {isUploading ? 'Uploading...' : 'Drag & drop your file here'}
              </p>
              <p className="text-sm text-slate-500 mb-4">
                or click to browse
              </p>
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
              />
              <button
                onClick={handleFileSelect}
                disabled={isUploading}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </span>
                ) : (
                  'Select File'
                )}
              </button>
            </div>
            
            <p className="text-xs text-slate-500 mt-4 text-center">
              Accepted formats: PDF, JPG, PNG (Max 5MB)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
