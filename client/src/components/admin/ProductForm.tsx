import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, categories } from "@shared/schema";
import type { InsertProduct } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from 'react';
import { X } from "lucide-react";

const availableSizes = [
  "Free Size",
  "XS", "S", "M", "L", "XL", "XXL",
  "26", "28", "30", "32", "34", "36", "38", "40"
] as const;

const availableColors = [
  // Basic Colors
  "Black", "White", "Grey", "Navy Blue",
  // Warm Colors
  "Red", "Maroon", "Pink", "Light Pink", "Peach",
  "Orange", "Rust", "Brown", "Beige", "Cream",
  // Cool Colors
  "Blue", "Light Blue", "Sky Blue", "Turquoise",
  "Green", "Olive", "Mint", "Sage",
  // Rich Colors
  "Purple", "Lavender", "Wine",
  "Yellow", "Mustard", "Gold",
  // Prints and Patterns
  "Floral", "Striped", "Checked", "Polka Dots"
] as const;

export function ProductForm() {
  const { toast } = useToast();
  const [previews, setPreviews] = useState<string[]>([]);

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      category: categories[0],
      sizes: [],
      colors: [],
      images: [],
      isNewCollection: false
    }
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: InsertProduct) => {
      console.log("Starting form submission with values:", values);
      const formData = new FormData();

      // Add basic fields
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("category", values.category);
      formData.append("isNewCollection", String(values.isNewCollection));

      // Add arrays as JSON strings
      formData.append("sizes", JSON.stringify(values.sizes));
      formData.append("colors", JSON.stringify(values.colors));

      // Add media files
      if (Array.isArray(values.images)) {
        console.log("Processing images:", values.images.length, "files");
        values.images.forEach((file) => {
          if (file instanceof File) {
            console.log("Appending file:", file.name, file.type);
            formData.append("media", file);
          }
        });
      }

      // Log the FormData entries for debugging
      for (const pair of formData.entries()) {
        console.log('FormData entry:', pair[0], pair[1] instanceof File ? 'File: ' + pair[1].name : pair[1]);
      }

      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.details || error.message);
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product added successfully"
      });
      setPreviews([]);
      form.reset();
    },
    onError: (error: Error) => {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const fileArray = Array.from(files);
    form.setValue("images", fileArray);

    // Generate previews
    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    const currentFiles = form.getValues("images");
    const newFiles = currentFiles.filter((_, i) => i !== index);
    form.setValue("images", newFiles);
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  async function onSubmit(values: InsertProduct) {
    console.log("Submitting form values:", values);
    await mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter product description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
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
          name="sizes"
          render={() => (
            <FormItem>
              <FormLabel>Available Sizes</FormLabel>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <FormField
                    key={size}
                    control={form.control}
                    name="sizes"
                    render={({ field }) => (
                      <FormItem key={size} className="flex items-center space-x-1">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(size)}
                            onCheckedChange={(checked) => {
                              const updatedSizes = checked
                                ? [...(field.value || []), size]
                                : (field.value || []).filter((s) => s !== size);
                              field.onChange(updatedSizes);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">{size}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="colors"
          render={() => (
            <FormItem>
              <FormLabel>Available Colors</FormLabel>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <FormField
                    key={color}
                    control={form.control}
                    name="colors"
                    render={({ field }) => (
                      <FormItem key={color} className="flex items-center space-x-1">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(color)}
                            onCheckedChange={(checked) => {
                              const updatedColors = checked
                                ? [...(field.value || []), color]
                                : (field.value || []).filter((c) => c !== color);
                              field.onChange(updatedColors);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">{color}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="images"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Images & Videos</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <Input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileChange}
                    {...field}
                  />
                  {previews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {previews.map((preview, index) => (
                        <div key={index} className="relative aspect-square">
                          {preview.startsWith('data:video') ? (
                            <video
                              src={preview}
                              className="w-full h-full object-cover rounded-lg"
                              controls
                            />
                          ) : (
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isNewCollection"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>New Collection</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Adding..." : "Add Product"}
        </Button>
      </form>
    </Form>
  );
}