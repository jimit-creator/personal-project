import { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuestionCard } from "./question-card";
import { useQuestions } from "@/hooks/use-questions";
import { useCategories } from "@/hooks/use-categories";
import { categoryColors } from "@/lib/types";

export function PublicInterface() {
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data: categories = [] } = useCategories();
  const { data: questions = [], isLoading } = useQuestions(selectedCategory, searchQuery);

  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  const handleCategoryFilter = (categoryId?: number) => {
    setSelectedCategory(categoryId);
    setSearchQuery(""); // Clear search when filtering by category
    setSearchInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div>
      {/* Search and Filter Section */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="text-slate-400 h-5 w-5" />
                </div>
                <Input
                  type="text"
                  placeholder="Search questions..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === undefined ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryFilter(undefined)}
                className="rounded-full"
              >
                All Categories
              </Button>
              {categories.map((category) => {
                const colorScheme = categoryColors[category.color] || categoryColors.blue;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryFilter(category.id)}
                    className="rounded-full"
                  >
                    {category.name}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 rounded w-20 mb-3"></div>
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-1"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3 mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-slate-200 rounded w-20"></div>
                  <div className="h-4 bg-slate-200 rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : questions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-slate-400 text-lg mb-2">No questions found</div>
            <p className="text-slate-500">
              {searchQuery 
                ? "Try adjusting your search terms or clear the search filter."
                : selectedCategory 
                ? "No questions in this category yet."
                : "No questions available yet."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onClick={() => {
                  // Handle question detail view
                  console.log('Open question detail:', question.id);
                }}
              />
            ))}
          </div>

          {/* Load More Button */}
          {questions.length >= 9 && (
            <div className="text-center mt-8">
              <Button size="lg">
                Load More Questions
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
