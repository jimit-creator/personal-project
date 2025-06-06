import { useParams, Link } from "wouter";
import { ArrowLeft, Eye, Clock, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuestion } from "@/hooks/use-questions";
import { categoryColors } from "@/lib/types";

export default function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const questionId = parseInt(id || "0");
  
  const { data: question, isLoading, error } = useQuestion(questionId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-20 mb-6"></div>
            <div className="h-8 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/4 mb-8"></div>
            <div className="h-40 bg-slate-200 rounded mb-8"></div>
            <div className="h-60 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-slate-400 text-lg mb-2">Question not found</div>
              <p className="text-slate-500 mb-4">
                The question you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Questions
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const colorScheme = categoryColors[question.category.color] || categoryColors.blue;
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Questions
          </Button>
        </Link>

        {/* Question Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Badge 
              variant="secondary" 
              className={`${colorScheme.bg} ${colorScheme.text}`}
            >
              <Tag className="mr-1 h-3 w-3" />
              {question.category.name}
            </Badge>
            <div className="flex items-center text-slate-500 text-sm">
              <Eye className="mr-1 h-4 w-4" />
              {question.views} views
            </div>
            <div className="flex items-center text-slate-500 text-sm">
              <Clock className="mr-1 h-4 w-4" />
              {formatDate(question.createdAt)}
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            {question.title}
          </h1>
        </div>

        {/* Question Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Question</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {question.content}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Answer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-green-700">Answer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate max-w-none">
              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {question.answer}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Updated Info */}
        {question.updatedAt && question.updatedAt.getTime() !== question.createdAt.getTime() && (
          <>
            <Separator className="my-8" />
            <div className="text-center text-sm text-slate-500">
              Last updated: {formatDate(question.updatedAt)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
