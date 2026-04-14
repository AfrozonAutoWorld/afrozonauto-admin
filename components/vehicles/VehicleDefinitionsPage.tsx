'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Car, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { FormField, SelectField, TextAreaField } from '@/components/Form';
import { Header } from '@/components/layout/Header';
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
  type VehicleDefinition,
  type VehicleDefinitionKind,
  useCreateVehicleDefinition,
  useDeleteVehicleDefinition,
  useUpdateVehicleDefinition,
  useVehicleDefinitions,
} from '@/lib/hooks/useVehicleDefinitions';
import { VehicleCategoriesManager } from './VehicleCategoriesManager';

type DefinitionFormState = {
  make: string;
  model: string;
  yearStart: string;
  yearEnd: string;
  labelOrReason: string;
  sortOrder: string;
  maxFetchCount: string;
  isActive: string;
  forRecommended: string;
  forSpecialty: string;
};

const createEmptyForm = (): DefinitionFormState => ({
  make: '',
  model: '',
  yearStart: '',
  yearEnd: '',
  labelOrReason: '',
  sortOrder: '0',
  maxFetchCount: '1',
  isActive: 'true',
  forRecommended: 'true',
  forSpecialty: 'false',
});

const toFormState = (
  definition: VehicleDefinition,
  kind: VehicleDefinitionKind,
): DefinitionFormState => ({
  make: definition.make,
  model: definition.model ?? '',
  yearStart: definition.yearStart ? String(definition.yearStart) : '',
  yearEnd: definition.yearEnd ? String(definition.yearEnd) : '',
  labelOrReason:
    kind === 'trending'
      ? definition.label ?? ''
      : definition.reason ?? '',
  sortOrder: String(definition.sortOrder ?? 0),
  maxFetchCount: String(definition.maxFetchCount ?? 1),
  isActive: definition.isActive ? 'true' : 'false',
  forRecommended: definition.forRecommended ? 'true' : 'false',
  forSpecialty: definition.forSpecialty ? 'true' : 'false',
});

const parseOptionalNumber = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const formatYearRange = (
  yearStart?: number | null,
  yearEnd?: number | null,
) => {
  if (yearStart && yearEnd) {
    return yearStart === yearEnd ? `${yearStart}` : `${yearStart} - ${yearEnd}`;
  }

  if (yearStart) return `${yearStart}+`;
  if (yearEnd) return `Up to ${yearEnd}`;

  return 'Any year';
};

const formatDate = (value?: string) => {
  if (!value) return '—';
  return format(new Date(value), 'MMM d, yyyy');
};

const truncate = (value?: string | null, maxLength = 90) => {
  if (!value) return '—';
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
};

const getPageConfig = (kind: VehicleDefinitionKind) => {
  if (kind === 'trending') {
    return {
      title: 'Trending Vehicles',
      description: 'Manage trending vehicle definitions surfaced across the platform.',
      actionLabel: 'Add Trending Vehicle',
      entityLabel: 'Trending Vehicle',
      textFieldLabel: 'Label',
      textFieldPlaceholder: 'Popular Luxury',
      textFieldDescription: 'Tag or short market label used for this trend definition.',
    };
  }

  return {
    title: 'Recommended Vehicles',
    description:
      'Manage recommended and specialty vehicle definitions for curated discovery.',
    actionLabel: 'Add Recommended Vehicle',
    entityLabel: 'Recommended Vehicle',
    textFieldLabel: 'Reason',
    textFieldPlaceholder:
      'Reliable family SUV with low mileage and strong resale value.',
    textFieldDescription: 'Explain why the vehicle is recommended or curated.',
  };
};

export function VehicleDefinitionsPage({
  kind,
}: {
  kind: VehicleDefinitionKind;
}) {
  const config = getPageConfig(kind);
  const { data, isLoading } = useVehicleDefinitions(kind);
  const createDefinition = useCreateVehicleDefinition(kind);
  const updateDefinition = useUpdateVehicleDefinition(kind);
  const deleteDefinition = useDeleteVehicleDefinition(kind);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingDefinition, setEditingDefinition] = useState<VehicleDefinition | null>(null);
  const [form, setForm] = useState<DefinitionFormState>(createEmptyForm());
  const [submitted, setSubmitted] = useState(false);

  const definitions = data?.items ?? [];
  const isSaving = createDefinition.isPending || updateDefinition.isPending;
  const definitionToDelete =
    definitions.find((definition) => definition.id === deleteId) ?? null;

  const stats = {
    total: definitions.length,
    active: definitions.filter((item) => item.isActive).length,
    inactive: definitions.filter((item) => !item.isActive).length,
    totalSlots: definitions.reduce((sum, item) => sum + (item.maxFetchCount || 0), 0),
  };

  const openCreateModal = () => {
    setEditingDefinition(null);
    setForm(createEmptyForm());
    setSubmitted(false);
    setModalOpen(true);
  };

  const openEditModal = (definition: VehicleDefinition) => {
    setEditingDefinition(definition);
    setForm(toFormState(definition, kind));
    setSubmitted(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingDefinition(null);
    setForm(createEmptyForm());
    setSubmitted(false);
  };

  const handleSave = () => {
    setSubmitted(true);

    if (!form.make.trim() || !form.labelOrReason.trim()) {
      return;
    }

    const payload = {
      make: form.make.trim(),
      model: form.model.trim() || undefined,
      yearStart: parseOptionalNumber(form.yearStart),
      yearEnd: parseOptionalNumber(form.yearEnd),
      sortOrder: parseOptionalNumber(form.sortOrder),
      isActive: form.isActive === 'true',
      maxFetchCount: parseOptionalNumber(form.maxFetchCount),
      ...(kind === 'trending'
        ? { label: form.labelOrReason.trim() }
        : {
            reason: form.labelOrReason.trim(),
            forRecommended: form.forRecommended === 'true',
            forSpecialty: form.forSpecialty === 'true',
          }),
    };

    if (editingDefinition) {
      updateDefinition.mutate(
        { id: editingDefinition.id, payload },
        {
          onSuccess: () => closeModal(),
        },
      );
      return;
    }

    createDefinition.mutate(payload, {
      onSuccess: () => closeModal(),
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;

    deleteDefinition.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
    });
  };

  return (
    <div>
      <Header title={config.title} description={config.description} />

      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Definitions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.inactive}</div>
              <p className="text-sm text-muted-foreground">Inactive</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.totalSlots}</div>
              <p className="text-sm text-muted-foreground">Fetch Slots</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{config.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review and manage curated vehicle definitions.
              </p>
            </div>

            <CustomBtn
              icon={Plus}
              onClick={openCreateModal}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {config.actionLabel}
            </CustomBtn>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <LoadingSpinner text={`Loading ${config.title.toLowerCase()}...`} />
            ) : definitions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Make</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Year Range</TableHead>
                      <TableHead>{config.textFieldLabel}</TableHead>
                      {kind === 'recommended' && <TableHead>Flags</TableHead>}
                      <TableHead>Max Fetch</TableHead>
                      <TableHead>Sort Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {definitions.map((definition) => (
                      <TableRow key={definition.id}>
                        <TableCell className="font-medium">{definition.make}</TableCell>
                        <TableCell>{definition.model || 'All models'}</TableCell>
                        <TableCell>
                          {formatYearRange(definition.yearStart, definition.yearEnd)}
                        </TableCell>
                        <TableCell className="max-w-md text-sm text-muted-foreground">
                          {truncate(
                            kind === 'trending' ? definition.label : definition.reason,
                          )}
                        </TableCell>
                        {kind === 'recommended' && (
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {definition.forRecommended && (
                                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                  Recommended
                                </span>
                              )}
                              {definition.forSpecialty && (
                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                  Specialty
                                </span>
                              )}
                              {!definition.forRecommended && !definition.forSpecialty && (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </div>
                          </TableCell>
                        )}
                        <TableCell>{definition.maxFetchCount}</TableCell>
                        <TableCell>{definition.sortOrder}</TableCell>
                        <TableCell>
                          <StatusBadge
                            status={definition.isActive ? 'active' : 'inactive'}
                          />
                        </TableCell>
                        <TableCell>{formatDate(definition.updatedAt)}</TableCell>
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
                              <DropdownMenuItem onClick={() => openEditModal(definition)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteId(definition.id)}
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
                  icon={Car}
                  title={`No ${config.title.toLowerCase()}`}
                  description={`Create your first ${config.entityLabel.toLowerCase()} definition.`}
                  action={{
                    label: config.actionLabel,
                    onClick: openCreateModal,
                    icon: Plus,
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <VehicleCategoriesManager />
      </div>

      <Modal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            closeModal();
          }
        }}
        title={editingDefinition ? `Edit ${config.entityLabel}` : config.actionLabel}
        description={config.textFieldDescription}
        showFooter
        onConfirm={handleSave}
        confirmText={editingDefinition ? 'Update Definition' : 'Create Definition'}
        isLoading={isSaving}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Make"
              htmlFor={`${kind}-vehicle-make`}
              type="text"
              id={`${kind}-vehicle-make`}
              value={form.make}
              onChange={(value) => setForm((prev) => ({ ...prev, make: value }))}
              required
              reqValue="*"
              isInvalid={submitted && !form.make.trim()}
              errorMessage="Make is required"
              placeholder="Mercedes-Benz"
            />

            <FormField
              label="Model"
              htmlFor={`${kind}-vehicle-model`}
              type="text"
              id={`${kind}-vehicle-model`}
              value={form.model}
              onChange={(value) => setForm((prev) => ({ ...prev, model: value }))}
              placeholder="GLE"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Year Start"
              htmlFor={`${kind}-vehicle-year-start`}
              type="number"
              id={`${kind}-vehicle-year-start`}
              value={form.yearStart}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, yearStart: value }))
              }
              placeholder="2020"
            />

            <FormField
              label="Year End"
              htmlFor={`${kind}-vehicle-year-end`}
              type="number"
              id={`${kind}-vehicle-year-end`}
              value={form.yearEnd}
              onChange={(value) => setForm((prev) => ({ ...prev, yearEnd: value }))}
              placeholder="2025"
            />
          </div>

          {kind === 'trending' ? (
            <FormField
              label={config.textFieldLabel}
              htmlFor={`${kind}-vehicle-label`}
              type="text"
              id={`${kind}-vehicle-label`}
              value={form.labelOrReason}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, labelOrReason: value }))
              }
              required
              reqValue="*"
              isInvalid={submitted && !form.labelOrReason.trim()}
              errorMessage={`${config.textFieldLabel} is required`}
              placeholder={config.textFieldPlaceholder}
            />
          ) : (
            <TextAreaField
              label={config.textFieldLabel}
              htmlFor={`${kind}-vehicle-reason`}
              id={`${kind}-vehicle-reason`}
              placeholder={config.textFieldPlaceholder}
              value={form.labelOrReason}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, labelOrReason: value }))
              }
              required
              isInvalid={submitted && !form.labelOrReason.trim()}
              errorMessage={`${config.textFieldLabel} is required`}
              disableAutosize
              fixedHeightClassName="h-32"
            />
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              label="Sort Order"
              htmlFor={`${kind}-vehicle-sort-order`}
              type="number"
              id={`${kind}-vehicle-sort-order`}
              value={form.sortOrder}
              onChange={(value) => setForm((prev) => ({ ...prev, sortOrder: value }))}
              placeholder="0"
            />

            <FormField
              label="Max Fetch Count"
              htmlFor={`${kind}-vehicle-max-fetch`}
              type="number"
              id={`${kind}-vehicle-max-fetch`}
              value={form.maxFetchCount}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, maxFetchCount: value }))
              }
              placeholder="1"
            />

            <SelectField
              label="Status"
              id={`${kind}-vehicle-status`}
              value={form.isActive}
              onChange={(value) => setForm((prev) => ({ ...prev, isActive: value }))}
              options={[
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' },
              ]}
            />
          </div>

          {kind === 'recommended' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="For Recommended"
                id={`${kind}-vehicle-for-recommended`}
                value={form.forRecommended}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, forRecommended: value }))
                }
                options={[
                  { value: 'true', label: 'Yes' },
                  { value: 'false', label: 'No' },
                ]}
              />

              <SelectField
                label="For Specialty"
                id={`${kind}-vehicle-for-specialty`}
                value={form.forSpecialty}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, forSpecialty: value }))
                }
                options={[
                  { value: 'true', label: 'Yes' },
                  { value: 'false', label: 'No' },
                ]}
              />
            </div>
          )}
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteId(null);
          }
        }}
        title={`Delete ${config.entityLabel}`}
        description="This action removes the vehicle definition from the admin catalog."
        message={
          definitionToDelete
            ? `Are you sure you want to delete ${definitionToDelete.make} ${definitionToDelete.model || ''}`.trim()
            : ''
        }
        onConfirm={handleDelete}
        confirmText="Delete Definition"
        isLoading={deleteDefinition.isPending}
        variant="destructive"
      />
    </div>
  );
}
