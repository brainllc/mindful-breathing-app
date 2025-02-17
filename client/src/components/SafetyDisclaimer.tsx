import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEffect, useRef, useState } from "react";

interface Props {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function SafetyDisclaimer({ isOpen, onAccept, onDecline }: Props) {
  const [hasReadAll, setHasReadAll] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isAtBottom = Math.abs(
      element.scrollHeight - element.clientHeight - element.scrollTop
    ) < 2;

    if (isAtBottom) {
      setHasReadAll(true);
    }
  };

  // Reset hasReadAll when modal opens
  useEffect(() => {
    if (isOpen) {
      setHasReadAll(false);
    }
  }, [isOpen]);

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center mb-6">Important Safety Information</AlertDialogTitle>

          {/* Warning Icon and Initial Message - Fixed at top */}
          <div className="flex flex-col items-center space-y-4 bg-yellow-50/10 p-6 rounded-lg border border-yellow-200/20 mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-12 w-12 text-yellow-500"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p className="text-base text-center max-w-lg">
              Please stop immediately if you experience any discomfort. These exercises are not a substitute for medical advice.
            </p>
          </div>
        </AlertDialogHeader>

        {/* Scrollable Content with Always Visible Scrollbar */}
        <AlertDialogDescription 
          className="space-y-6 overflow-y-auto pr-4 max-h-[calc(60vh-200px)] scrollbar-visible"
          style={{ overflowY: 'scroll' }}
          onScroll={handleScroll}
          ref={contentRef}
        >
          <div className="space-y-6">
            <p className="text-base">
              The breathing exercises provided in this application are for educational purposes only and are not intended to be a substitute for professional medical advice, diagnosis, or treatment.
            </p>

            <div className="space-y-2">
              <p className="text-base font-medium">
                By using these breathing exercises, you acknowledge and agree that:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are responsible for consulting with your healthcare provider before starting any breathing practice</li>
                <li>You should immediately stop if you experience dizziness, lightheadedness, shortness of breath, or any discomfort</li>
                <li>These exercises may not be suitable for everyone, particularly those with certain medical conditions</li>
                <li>You assume all risks associated with using these breathing techniques</li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-base font-medium">
                Medical Conditions: Do not use these breathing exercises if you have any of the following without prior medical approval:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Respiratory conditions including asthma or COPD</li>
                <li>Cardiovascular conditions</li>
                <li>High blood pressure</li>
                <li>History of aneurysm</li>
                <li>Pregnancy</li>
                <li>Any other serious medical condition</li>
              </ul>
            </div>

            <p className="text-base font-medium text-yellow-500">
              In case of emergency, stop immediately and seek appropriate medical attention.
            </p>
          </div>
        </AlertDialogDescription>

        <AlertDialogFooter className="flex-shrink-0 mt-6">
          <AlertDialogCancel onClick={onDecline}>
            I Do Not Accept
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onAccept}
            disabled={!hasReadAll}
            className="disabled:opacity-50"
          >
            I Understand and Accept
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}