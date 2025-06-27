import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Card className="w-full max-w-md mx-4 glass-morphism card-hover">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <AlertCircle className="h-16 w-16 text-red-500 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              404 Page Not Found
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              The page you're looking for doesn't exist or may have been moved.
            </p>
            <div className="pt-4">
              <button 
                onClick={() => window.history.back()} 
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Go Back
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
