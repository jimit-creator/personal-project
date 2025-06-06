import { useState } from "react";
import { Plus, Search, Eye, Edit2, Trash2, FolderPlus, Calculator, Microscope, Church, Book } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { QuestionModal } from "./question-modal";
import { CategoryModal } from "./category-modal";
import { useQuestions, useDeleteQuestion, useStats } from "@/hooks/use-questions";
import { useCategories, useDeleteCategory } from "@/hooks/use-categories";
import { useToast } from "@/hooks/use-toast";
import { categoryColors } from "@/lib/types";
import type { AdminTabType } from "@/lib/types";
import type { QuestionWithCategory, Category } from "@shared/schema";

const iconMap = {
  calculator: Calculator,
  microscope: Microscope,
  monument: Church,
  book: Book,
};

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTabType>("questions");
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionWithCategory | undefined>();
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'question' | 'category'; id: number } | null>(null);

  const { toast } = useToast();
  const { data: questions = [], isLoading: questionsLoading } = useQuestions();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: stats } = useStats();
  const deleteQuestion = useDeleteQuestion();
  const deleteCategory = useDeleteCategory();

  const handleEditQuestion = (question: QuestionWithCategory) => {
    setEditingQuestion(question);
    setQuestionModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  const handleDeleteClick = (type: 'question' | 'category', id: number) => {
    setItemToDelete({ type, id });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'question') {
        await deleteQuestion.mutateAsync(itemToDelete.id);
        toast({ title: "Question deleted successfully" });
      } else {
        await deleteCategory.mutateAsync(itemToDelete.id);
        toast({ title: "Category deleted successfully" });
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: `Failed to delete ${itemToDelete.type}`, 
        variant: "destructive" 
      });
    }

    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const closeQuestionModal = () => {
    setQuestionModalOpen(false);
    setEditingQuestion(undefined);
  };

  const closeCategoryModal = () => {
    setCategoryModalOpen(false);
    setEditingCategory(undefined);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div>
      {/* Admin Dashboard Header */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Admin Dashboard</h2>
              <p className="text-slate-600">Manage questions, categories, and platform content</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
              <Button onClick={() => setQuestionModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
              <Button variant="secondary" onClick={() => setCategoryModalOpen(true)}>
                <FolderPlus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Eye className="text-blue-600 h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Questions</p>
                <p className="text-2xl font-semibold text-slate-900">{stats?.totalQuestions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FolderPlus className="text-green-600 h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Categories</p>
                <p className="text-2xl font-semibold text-slate-900">{stats?.totalCategories || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Eye className="text-purple-600 h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Views</p>
                <p className="text-2xl font-semibold text-slate-900">{stats?.totalViews || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Search className="text-amber-600 h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Avg. Views</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {stats?.totalQuestions && stats.totalQuestions > 0 
                    ? Math.round(stats.totalViews / stats.totalQuestions) 
                    : 0
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Content Tabs */}
      <Card>
        {/* Sub-tab Navigation */}
        <div className="border-b border-slate-200 px-6">
          <nav className="-mb-px flex space-x-8">
            <Button
              variant="ghost"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'questions'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
              onClick={() => setActiveTab('questions')}
            >
              Questions
            </Button>
            <Button
              variant="ghost"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
              onClick={() => setActiveTab('categories')}
            >
              Categories
            </Button>
            <Button
              variant="ghost"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </Button>
          </nav>
        </div>

        {/* Questions Management */}
        {activeTab === 'questions' && (
          <CardContent className="p-6">
            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-slate-400 h-5 w-5" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search questions..."
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Sort by Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Sort by Date</SelectItem>
                    <SelectItem value="views">Sort by Views</SelectItem>
                    <SelectItem value="title">Sort by Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Questions Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questionsLoading ? (
                    [...Array(3)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-slate-200 rounded w-20 animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-slate-200 rounded w-12 animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-slate-200 rounded w-20 animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-slate-200 rounded w-16 animate-pulse"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : questions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        No questions found. Create your first question to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    questions.map((question) => {
                      const colorScheme = categoryColors[question.category.color] || categoryColors.blue;
                      return (
                        <TableRow key={question.id}>
                          <TableCell>
                            <div className="font-medium text-slate-900 line-clamp-1">
                              {question.title}
                            </div>
                            <div className="text-sm text-slate-500 line-clamp-1 max-w-xs">
                              {question.content}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="secondary" 
                              className={`${colorScheme.bg} ${colorScheme.text}`}
                            >
                              {question.category.name}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-500">
                            {question.views}
                          </TableCell>
                          <TableCell className="text-slate-500">
                            {formatDate(question.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditQuestion(question)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick('question', question.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        )}

        {/* Categories Management */}
        {activeTab === 'categories' && (
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Categories Management</h3>
                <p className="text-slate-600">Organize your questions into meaningful categories</p>
              </div>
              <Button onClick={() => setCategoryModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoriesLoading ? (
                [...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-20 bg-slate-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))
              ) : categories.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center">
                    <div className="text-slate-400 text-lg mb-2">No categories</div>
                    <p className="text-slate-500">Create your first category to organize questions.</p>
                  </CardContent>
                </Card>
              ) : (
                categories.map((category) => {
                  const colorScheme = categoryColors[category.color] || categoryColors.blue;
                  const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Book;
                  const questionCount = questions.filter(q => q.categoryId === category.id).length;
                  
                  return (
                    <Card key={category.id} className="bg-slate-50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 ${colorScheme.bg} rounded-lg flex items-center justify-center`}>
                              <IconComponent className={`${colorScheme.text} h-5 w-5`} />
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-900">{category.name}</h4>
                              <p className="text-sm text-slate-500">{category.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditCategory(category)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick('category', category.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <div className="flex items-center justify-between text-sm text-slate-500">
                            <span>{questionCount} question{questionCount !== 1 ? 's' : ''}</span>
                            <span>Updated {formatDate(category.createdAt)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </CardContent>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <CardContent className="p-6">
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Platform Settings</h3>
              
              <div className="space-y-6">
                <Card className="bg-slate-50">
                  <CardHeader>
                    <CardTitle className="text-base">General Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Platform Name
                      </label>
                      <Input defaultValue="StudyHub" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Description
                      </label>
                      <textarea 
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        defaultValue="Q&A Learning Platform for students and educators"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button>Save Settings</Button>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Modals */}
      <QuestionModal
        isOpen={questionModalOpen}
        onClose={closeQuestionModal}
        question={editingQuestion}
      />

      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={closeCategoryModal}
        category={editingCategory}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{" "}
              {itemToDelete?.type === 'category' ? 'category and all its questions' : 'question'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
