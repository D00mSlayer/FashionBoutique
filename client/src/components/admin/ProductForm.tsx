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
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const availableColors = ["Black", "White", "Red", "Blue", "Green", "Pink", "Purple", "Yellow"] as const;

export function ProductForm() {
  const { toast } = useToast();
  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "Tops",
      sizes: [],
      colors: [],
      images: [],
      isNewCollection: false
    }
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: InsertProduct) => {
      const formData = new FormData();

      // Add text fields
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("isNewCollection", String(data.isNewCollection));

      // Add arrays as JSON strings
      formData.append("sizes", JSON.stringify(data.sizes));
      formData.append("colors", JSON.stringify(data.colors));

      // Add images
      if (Array.isArray(data.images)) {
        data.images.forEach((file) => {
          formData.append("images", file);
        });
      }

      const res = await apiRequest("POST", "/api/products", formData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product added successfully"
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  function onSubmit(data: InsertProduct) {
    mutate(data);
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
                <Input {...field} />
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
                <Textarea {...field} />
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Available Sizes</FormLabel>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <FormField
                    key={size}
                    control={form.control}
                    name="sizes"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-1">
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Available Colors</FormLabel>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <FormField
                    key={color}
                    control={form.control}
                    name="colors"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-1">
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
              <FormLabel>Images</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files?.length) {
                      onChange(Array.from(files));
                    }
                  }}
                  {...field}
                />
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