'use client';

import { useState } from 'react';
import { Plus, MoreVertical, Pencil, Tags, Trash2 } from 'lucide-react';
import { FormField, SelectField, TextAreaField } from '@/components/Form';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { CustomBtn } from '@/components/shared/CustomBtn';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Modal } from '@/components/shared/Modal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  type VehicleCategory,
  useCreateVehicleCategory,
  useDeleteVehicleCategory,
  useUpdateVehicleCategory,
  useVehicleCategories,
} from '@/lib/hooks/useVehicleDefinitions';

type CategoryFormState = {
  name: string;
  slug: string;
  description: string;
  sortOrder: string;
  isActive: string;
};

const createEmptyForm = (): CategoryFormState => ({
  name: '',
  slug: '',
  description: '',
  sortOrder: '0',
  isActive: 'true',
});

const toCategoryFormState = (category: VehicleCategory): CategoryFormState => ({
  name: category.name,
  slug: category.slug ?? '',
  description: category.description ?? '',
  sortOrder: String(category.sortOrder ?? 0),
  isActive: category.isActive ? 'true' : 'false',
});

const parseOptionalNumber = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export function VehicleCategoriesManager() {
  const { data, isLoading } = useVehicleCategories();
  const createCategory = useCreateVehicleCategory();
  const updateCategory = useUpdateVehicleCategory();
  const deleteCategory = useDeleteVehicleCategory();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<VehicleCategory | null>(null);
  const [form, setForm] = useState<CategoryFormState>(createEmptyForm());
  const [submitted, setSubmitted] = useState(false);

  const categories = data?.items ?? [];
  const isSaving = createCategory.isPending || updateCategory.isPending;
  const categoryToDelete =
    categories.find((category) => category.id === deleteId) ?? null;

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm(createEmptyForm());
    setSubmitted(false);
    setModalOpen(true);
  };

  const openEditModal = (category: VehicleCategory) => {
    setEditingCategory(category);
    setForm(toCategoryFormState(category));
    setSubmitted(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    setForm(createEmptyForm());
    setSubmitted(false);
  };

  const handleSave = () => {
    setSubmitted(true);

    if (!form.name.trim()) {
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      description: form.description.trim() || undefined,
      sortOrder: parseOptionalNumber(form.sortOrder),
      isActive: form.isActive === 'true',
    };

    if (editingCategory) {
      updateCategory.mutate(
        { id: editingCategory.id, payload },
        {
          onSuccess: () => closeModal(),
        },
      );
      return;
    }

    createCategory.mutate(payload, {
      onSuccess: () => closeModal(),
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;

    deleteCategory.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Vehicle Categories</CardTitle>
          <p className="text-sm text-muted-foreground">
            Create, update, and remove reusable vehicle categories.
          </p>
        </div>

        <CustomBtn
          icon={Plus}
          onClick={openCreateModal}
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Add Category
        </CustomBtn>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <LoadingSpinner text="Loading vehicle categories..." />
        ) : categories.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {category.slug || '—'}
                    </TableCell>
                    <TableCell className="max-w-md text-sm text-muted-foreground">
                      {category.description || 'No description'}
                    </TableCell>
                    <TableCell>{category.sortOrder}</TableCell>
                    <TableCell>
                      <StatusBadge status={category.isActive ? 'active' : 'inactive'} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEditModal(category)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteId(category.id)}
                            className="text-red-700"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-6">
            <EmptyState
              icon={Tags}
              title="No vehicle categories"
              description="Create a category to organize the vehicle catalog."
              action={{
                label: 'Add Category',
                onClick: openCreateModal,
                icon: Plus,
              }}
            />
          </div>
        )}
      </CardContent>

      <Modal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            closeModal();
          }
        }}
        title={editingCategory ? 'Edit Vehicle Category' : 'Add Vehicle Category'}
        description="Manage reusable vehicle categories for the admin catalog."
        showFooter
        onConfirm={handleSave}
        confirmText={editingCategory ? 'Update Category' : 'Create Category'}
        isLoading={isSaving}
      >
        <div className="space-y-4">
          <FormField
            label="Category Name"
            htmlFor="vehicle-category-name"
            type="text"
            id="vehicle-category-name"
            value={form.name}
            onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
            required
            reqValue="*"
            isInvalid={submitted && !form.name.trim()}
            errorMessage="Category name is required"
            placeholder="Luxury SUV"
          />

          <FormField
            label="Slug"
            htmlFor="vehicle-category-slug"
            type="text"
            id="vehicle-category-slug"
            value={form.slug}
            onChange={(value) => setForm((prev) => ({ ...prev, slug: value }))}
            placeholder="luxury-suv"
          />

          <TextAreaField
            label="Description"
            htmlFor="vehicle-category-description"
            id="vehicle-category-description"
            placeholder="Short category description"
            value={form.description}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, description: value }))
            }
            isInvalid={false}
            errorMessage=""
            disableAutosize
            fixedHeightClassName="h-28"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Sort Order"
              htmlFor="vehicle-category-sort-order"
              type="number"
              id="vehicle-category-sort-order"
              value={form.sortOrder}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, sortOrder: value }))
              }
              placeholder="0"
            />

            <SelectField
              label="Status"
              id="vehicle-category-status"
              value={form.isActive}
              onChange={(value) => setForm((prev) => ({ ...prev, isActive: value }))}
              options={[
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' },
              ]}
            />
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteId(null);
          }
        }}
        title="Delete Vehicle Category"
        description="This action removes the category from the admin catalog."
        message={
          categoryToDelete
            ? `Are you sure you want to delete ${categoryToDelete.name}?`
            : ''
        }
        onConfirm={handleDelete}
        confirmText="Delete Category"
        isLoading={deleteCategory.isPending}
        variant="destructive"
      />
    </Card>
  );
}
