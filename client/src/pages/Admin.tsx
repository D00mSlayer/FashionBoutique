import { ProductForm } from "@/components/admin/ProductForm";

export default function Admin() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <div className="max-w-2xl">
        <ProductForm />
      </div>
    </div>
  );
}
