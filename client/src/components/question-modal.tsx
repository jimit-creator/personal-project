import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/use-categories";
import { useCreateQuestion, useUpdateQuestion } from "@/hooks/use-questions";
import { insertQuestionSchema } from "@shared/schema";
import type { QuestionWithCategory } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const formSchema = insertQuestionSchema.extend({
  categoryId: z.number().min(1, "Please select a category"),
});

type FormData = z.infer<typeof formSchema>;

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question?: QuestionWithCategory;
}

export function QuestionModal({ isOpen, onClose, question }: QuestionModalProps) {
  const { toast } = useToast();
  const { data: categories = [] } = useCategories();
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: question?.title || "",
      content: question?.content || "",
      answer: question?.answer || "",
      categoryId: question?.categoryId || 0,
    },
  });

  const isEditing = !!question;

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && question) {
        await updateQuestion.mutateAsync({ id: question.id, data });
        toast({ title: "Question updated successfully" });
      } else {
        await createQuestion.mutateAsync(data);
        toast({ title: "Question created successfully" });
      }
      onClose();
      form.reset();
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to save question", 
        variant: "destructive" 
      });
    }
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Question" : "Add New Question"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Question Title <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your question title..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Category <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    value={field.value?.toString() || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Question Content <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={6}
                      placeholder="Provide detailed question content..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Answer <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={8}
                      placeholder="Provide the answer or explanation..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createQuestion.isPending || updateQuestion.isPending}
              >
                {createQuestion.isPending || updateQuestion.isPending 
                  ? "Saving..." 
                  : isEditing ? "Update Question" : "Add Question"
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
