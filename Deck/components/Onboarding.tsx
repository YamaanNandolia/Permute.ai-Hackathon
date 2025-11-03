/**
 * Onboarding - 4-step data import wizard
 * Progress at top, helpful empty states, skeleton loaders
 */

import React, { useState } from 'react';
import { Upload, FileText, TrendingUp, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { toast } from 'sonner@2.0.3';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [floorPlanFile, setFloorPlanFile] = useState<File | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [salesFile, setSalesFile] = useState<File | null>(null);

  const steps = [
    { number: 1, title: 'Upload Floor Plan', description: 'PNG, SVG, or PDF' },
    { number: 2, title: 'Product Locations', description: 'CSV or Map Editor' },
    { number: 3, title: 'Sales History', description: 'CSV or POS Connection' },
    { number: 4, title: 'Review & Run', description: 'Confirm and analyze' }
  ];

  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep === 1 && !floorPlanFile) {
      toast.error('Please upload a floor plan to continue');
      return;
    }
    if (currentStep === 2 && !productFile) {
      toast.error('Please upload product locations to continue');
      return;
    }
    if (currentStep === 3 && !salesFile) {
      toast.error('Please upload sales history to continue');
      return;
    }
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      toast.success(`Step ${currentStep} completed`);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    toast.success('Analysis started! Setting up your dashboard...');
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const FileUploadArea = ({ 
    file, 
    setFile, 
    accept, 
    title, 
    description 
  }: { 
    file: File | null; 
    setFile: (file: File | null) => void; 
    accept: string; 
    title: string; 
    description: string;
  }) => (
    <div
      className={`border-2 border-dashed rounded-[16px] p-12 text-center transition-all ${
        file
          ? 'border-[#22C55E] bg-[rgba(34,197,94,0.05)]'
          : 'border-[rgba(33,38,63,0.12)] bg-[#FAFBFC] hover:border-[rgba(33,38,63,0.24)]'
      }`}
    >
      {file ? (
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#22C55E]/10 flex items-center justify-center mx-auto">
            <Check size={32} className="text-[#22C55E]" />
          </div>
          <div>
            <div className="text-[16px] font-semibold text-[#21263F] mb-1">
              {file.name}
            </div>
            <div className="text-[14px] text-[#676F8E]">
              {(file.size / 1024).toFixed(1)} KB
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFile(null)}
          >
            Remove
          </Button>
        </div>
      ) : (
        <>
          <Upload size={48} className="text-[#676F8E] mx-auto mb-4" />
          <h4 className="text-[#21263F] mb-2">{title}</h4>
          <p className="text-[14px] text-[#676F8E] mb-6">
            {description}
          </p>
          <label htmlFor={`file-${accept}`}>
            <Button variant="outline" asChild>
              <span className="cursor-pointer">Choose File</span>
            </Button>
          </label>
          <input
            id={`file-${accept}`}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setFile(file);
                toast.success(`${file.name} uploaded successfully`);
              }
            }}
          />
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[rgba(33,38,63,0.12)]">
        <div className="max-w-[800px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#3D4468] to-[#21263F] flex items-center justify-center">
                <span className="text-white font-bold text-[16px]">P</span>
              </div>
              <span className="text-[18px] font-semibold text-[#21263F]">Pathwise</span>
            </div>
            <div className="text-[14px] text-[#676F8E]">
              Step {currentStep} of {steps.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <Progress value={progress} className="h-2 mb-4" />
            <div className="grid grid-cols-4 gap-4">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className={`text-center ${
                    step.number === currentStep
                      ? 'text-[#21263F]'
                      : step.number < currentStep
                      ? 'text-[#22C55E]'
                      : 'text-[#676F8E]'
                  }`}
                >
                  <div className="text-[13px] font-semibold mb-1">{step.title}</div>
                  <div className="text-[12px]">{step.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[800px]">
          <div className="bg-white rounded-[20px] border border-[rgba(33,38,63,0.08)] shadow-[0_8px_24px_-6px_rgba(0,0,0,0.28)] p-8">
            {/* Step 1: Floor Plan */}
            {currentStep === 1 && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-[#21263F] mb-2">Upload Your Floor Plan</h2>
                  <p className="text-[15px] text-[#676F8E]">
                    Upload a floor plan image or PDF of your store layout
                  </p>
                </div>

                <FileUploadArea
                  file={floorPlanFile}
                  setFile={setFloorPlanFile}
                  accept=".png,.jpg,.svg,.pdf"
                  title="Drag & drop your floor plan here"
                  description="Supports PNG, JPG, SVG, or PDF up to 10MB"
                />

                <div className="mt-8 p-4 bg-[#F3F4F6] rounded-[12px]">
                  <div className="text-[13px] text-[#525972]">
                    <strong className="text-[#21263F]">💡 Tip:</strong> For best results, use a high-resolution 
                    image with clear aisle and shelf markings. CAD files work great!
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Product Locations */}
            {currentStep === 2 && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-[#21263F] mb-2">Add Product Locations</h2>
                  <p className="text-[15px] text-[#676F8E]">
                    Upload a CSV file or use our interactive map editor
                  </p>
                </div>

                <FileUploadArea
                  file={productFile}
                  setFile={setProductFile}
                  accept=".csv"
                  title="Upload product locations CSV"
                  description="Required columns: sku, name, shelf_id, x, y, z, height_mm"
                />

                <div className="mt-6 text-center">
                  <div className="text-[14px] text-[#676F8E] mb-3">or</div>
                  <Button variant="outline">
                    <FileText className="mr-2" size={16} />
                    Open Map Editor
                  </Button>
                </div>

                <div className="mt-8 p-4 bg-[#F3F4F6] rounded-[12px]">
                  <div className="text-[13px] text-[#525972] mb-3">
                    <strong className="text-[#21263F]">CSV Format Example:</strong>
                  </div>
                  <code className="block text-[12px] font-mono bg-white p-3 rounded-[8px] border border-[rgba(33,38,63,0.08)]">
                    sku,name,shelf_id,x,y,z,height_mm
                    <br />
                    ABC123,Premium Coffee,S1,10.5,20.3,1.2,300
                  </code>
                </div>
              </div>
            )}

            {/* Step 3: Sales History */}
            {currentStep === 3 && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-[#21263F] mb-2">Import Sales Data</h2>
                  <p className="text-[15px] text-[#676F8E]">
                    Upload historical sales data or connect to your POS system
                  </p>
                </div>

                <FileUploadArea
                  file={salesFile}
                  setFile={setSalesFile}
                  accept=".csv"
                  title="Upload sales history CSV"
                  description="At least 30 days of transaction data recommended"
                />

                <div className="mt-8 grid grid-cols-3 gap-4">
                  <Button variant="outline" className="flex-col h-auto py-4">
                    <div className="w-12 h-12 rounded-[10px] bg-[#F3F4F6] flex items-center justify-center mb-2">
                      <TrendingUp size={24} className="text-[#3D4468]" />
                    </div>
                    <div className="text-[13px]">Square POS</div>
                  </Button>
                  <Button variant="outline" className="flex-col h-auto py-4">
                    <div className="w-12 h-12 rounded-[10px] bg-[#F3F4F6] flex items-center justify-center mb-2">
                      <TrendingUp size={24} className="text-[#3D4468]" />
                    </div>
                    <div className="text-[13px]">Shopify</div>
                  </Button>
                  <Button variant="outline" className="flex-col h-auto py-4">
                    <div className="w-12 h-12 rounded-[10px] bg-[#F3F4F6] flex items-center justify-center mb-2">
                      <TrendingUp size={24} className="text-[#3D4468]" />
                    </div>
                    <div className="text-[13px]">Custom API</div>
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-[#21263F] mb-2">Review & Confirm</h2>
                  <p className="text-[15px] text-[#676F8E]">
                    Check your data and start the analysis
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#FAFBFC] rounded-[12px] border border-[rgba(33,38,63,0.08)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[10px] bg-[#22C55E]/10 flex items-center justify-center">
                        <Check size={20} className="text-[#22C55E]" />
                      </div>
                      <div>
                        <div className="text-[14px] font-semibold text-[#21263F]">Floor Plan</div>
                        <div className="text-[13px] text-[#676F8E]">
                          {floorPlanFile?.name || 'store-layout.png'}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                      Edit
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#FAFBFC] rounded-[12px] border border-[rgba(33,38,63,0.08)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[10px] bg-[#22C55E]/10 flex items-center justify-center">
                        <Check size={20} className="text-[#22C55E]" />
                      </div>
                      <div>
                        <div className="text-[14px] font-semibold text-[#21263F]">Product Locations</div>
                        <div className="text-[13px] text-[#676F8E]">
                          {productFile?.name || '243 products mapped'}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>
                      Edit
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#FAFBFC] rounded-[12px] border border-[rgba(33,38,63,0.08)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[10px] bg-[#22C55E]/10 flex items-center justify-center">
                        <Check size={20} className="text-[#22C55E]" />
                      </div>
                      <div>
                        <div className="text-[14px] font-semibold text-[#21263F]">Sales History</div>
                        <div className="text-[13px] text-[#676F8E]">
                          {salesFile?.name || '90 days of data'}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(3)}>
                      Edit
                    </Button>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-gradient-to-br from-[#21263F] to-[#3D4468] rounded-[16px] text-white text-center">
                  <h3 className="text-white mb-2">Ready to Analyze</h3>
                  <p className="text-white/80 text-[14px]">
                    We'll process your data and generate visibility insights.
                    <br />
                    This usually takes 2-3 minutes.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2" size={16} />
              Back
            </Button>

            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                className="bg-[#21263F] hover:bg-[#3D4468] text-white"
              >
                Continue
                <ArrowRight className="ml-2" size={16} />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="bg-[#22C55E] hover:bg-[#16A34A] text-white"
              >
                Start Analysis
                <Check className="ml-2" size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
