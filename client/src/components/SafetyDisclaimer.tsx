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

interface Props {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function SafetyDisclaimer({ isOpen, onAccept, onDecline }: Props) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Important Safety Information</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 text-base">
            <div className="flex items-center justify-center h-16 bg-yellow-50/10 p-4 rounded-lg border border-yellow-200/20">
              <div className="flex items-center justify-center w-full gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 flex-shrink-0 text-yellow-500"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <p className="text-sm text-center flex-1">
                  Please stop immediately if you experience any discomfort. These exercises are not a substitute for medical advice.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p>
                The breathing exercises provided in this application are for general wellness purposes only and are not intended to be a substitute for professional medical advice, diagnosis, or treatment.
              </p>

              <p>
                By using these breathing exercises, you acknowledge and agree that:
              </p>

              <ul className="list-disc pl-6 space-y-1">
                <li>You are responsible for consulting with your healthcare provider before starting any breathing practice</li>
                <li>You should immediately stop if you experience dizziness, lightheadedness, shortness of breath, or any discomfort</li>
                <li>These exercises may not be suitable for everyone, particularly those with certain medical conditions</li>
                <li>You assume all risks associated with using these breathing techniques</li>
              </ul>

              <p className="font-medium mt-4">
                Medical Conditions: Do not use these breathing exercises if you have any of the following without prior medical approval:
              </p>

              <ul className="list-disc pl-6 space-y-1">
                <li>Respiratory conditions including asthma or COPD</li>
                <li>Cardiovascular conditions</li>
                <li>High blood pressure</li>
                <li>History of aneurysm</li>
                <li>Pregnancy</li>
                <li>Any other serious medical condition</li>
              </ul>

              <p className="mt-4">
                In case of emergency, stop immediately and seek appropriate medical attention.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDecline}>
            I Do Not Accept
          </AlertDialogCancel>
          <AlertDialogAction onClick={onAccept}>
            I Understand and Accept
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}