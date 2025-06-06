import { Eye, MessageCircle, Bookmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { QuestionWithCategory } from "@shared/schema";
import { categoryColors } from "@/lib/types";

interface QuestionCardProps {
  question: QuestionWithCategory;
  onClick?: () => void;
}

export function QuestionCard({ question, onClick }: QuestionCardProps) {
  const colorScheme = categoryColors[question.category.color] || categoryColors.blue;
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''} ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer" 
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <Badge 
            variant="secondary" 
            className={`${colorScheme.bg} ${colorScheme.text} text-xs font-medium`}
          >
            {question.category.name}
          </Badge>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 h-6 w-6">
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
        
        <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
          {question.title}
        </h3>
        
        <p className="text-slate-600 text-sm mb-4 line-clamp-3">
          {question.content}
        </p>
        
        <div className="flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Eye className="mr-1 h-4 w-4" />
              <span>{question.views}</span>
            </span>
            <span className="flex items-center">
              <MessageCircle className="mr-1 h-4 w-4" />
              <span>1</span>
            </span>
          </div>
          <span>{formatDate(question.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
