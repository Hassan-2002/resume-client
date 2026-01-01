import { Progress } from "@/components/ui/progress";


export const title = "With Percentage";


const ProgressBar = ({value}:{value : number}) => {
  
  return (
    <div className="w-full max-w-md space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">ATS Score</span>
        <span className="font-medium">{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
};

export default ProgressBar;
