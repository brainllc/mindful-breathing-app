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
            <p className="font-medium text-foreground">
              Please read this disclaimer carefully before starting any breathing exercises.
            </p>

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
