import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiUpsertDepartment, apiUpsertRole } from "@/lib/api/settings";
import { useTenantStore, yearScopedId, type Department, type Role } from "@/lib/tenant-store";

function nextPrefixedId(prefix: string, existingIds: string[]): string {
  let n = existingIds.length + 1;
  for (;;) {
    const id = `${prefix}-${n.toString().padStart(3, "0")}`;
    if (!existingIds.includes(id)) return id;
    n += 1;
  }
}

async function createRoleRecord(input: {
  title: string;
  departmentId: string;
  roles: Role[];
  academicYear: string;
  setRoles: (updater: (prev: Role[]) => Role[]) => void;
}): Promise<Role> {
  const trimmed = input.title.trim();
  const created: Role = {
    id: yearScopedId(
      nextPrefixedId(
        "ROL",
        input.roles.map((r) => r.id),
      ),
      input.academicYear,
    ),
    title: trimmed,
    departmentId: input.departmentId,
    academicYear: input.academicYear,
  };
  const saved = await apiUpsertRole(created);
  const next = saved?.id ? saved : created;
  input.setRoles((prev) => (prev.some((r) => r.id === next.id) ? prev : [...prev, next]));
  return next;
}

export function CreateDepartmentDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (dept: Department) => void;
}) {
  const { activeDepartments: departments, setDepartments, academicYear } = useTenantStore();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName("");
    setCode("");
    setSaving(false);
  }, [open]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedName || !trimmedCode) {
      toast.error("Department name and code are required");
      return;
    }
    if (departments.some((d) => d.name.toLowerCase() === trimmedName.toLowerCase())) {
      toast.error("A department with this name already exists");
      return;
    }

    const created: Department = {
      id: yearScopedId(
        nextPrefixedId(
          "DEP",
          departments.map((d) => d.id),
        ),
        academicYear,
      ),
      name: trimmedName,
      code: trimmedCode,
      academicYear,
    };

    setSaving(true);
    try {
      const saved = await apiUpsertDepartment(created);
      const next = saved?.id ? saved : created;
      setDepartments((prev) => (prev.some((d) => d.id === next.id) ? prev : [...prev, next]));
      toast.success(`Department added · ${next.name}`);
      onCreated?.(next);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save department");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[110] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Department</DialogTitle>
          <DialogDescription>
            Create a department and select it for this staff profile.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => void submit(e)} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-black/55">
              Department Name
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Library Sciences"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-black/55">
              Department Code
            </Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. LIB"
              className="font-mono uppercase"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#0F766E] text-white hover:bg-[#0D9488]"
            >
              {saving ? "Saving…" : "Add Department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CreateRoleDialog({
  open,
  onOpenChange,
  onCreated,
  onNeedDepartment,
  initialTitle = "",
  preferredDepartmentId = "",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (role: Role) => void;
  /** Called with the draft role title when a parent department is required. */
  onNeedDepartment?: (draftTitle: string) => void;
  /** Restored title when returning from the nested Add Department flow. */
  initialTitle?: string;
  /** Department to preselect (usually the one just created). */
  preferredDepartmentId?: string;
}) {
  const {
    activeRoles: roles,
    setRoles,
    activeDepartments: departments,
    academicYear,
  } = useTenantStore();
  const [title, setTitle] = useState(initialTitle);
  const [departmentId, setDepartmentId] = useState("");
  const [saving, setSaving] = useState(false);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      const preferred =
        preferredDepartmentId && departments.some((d) => d.id === preferredDepartmentId)
          ? preferredDepartmentId
          : (departments[0]?.id ?? "");
      setTitle(initialTitle);
      setDepartmentId(preferred);
      setSaving(false);
    }
    wasOpenRef.current = open;
  }, [open, initialTitle, preferredDepartmentId, departments]);

  // If departments arrive while the dialog is open and none is selected, pick one.
  useEffect(() => {
    if (!open || departmentId) return;
    if (preferredDepartmentId && departments.some((d) => d.id === preferredDepartmentId)) {
      setDepartmentId(preferredDepartmentId);
      return;
    }
    if (departments[0]?.id) setDepartmentId(departments[0].id);
  }, [open, departments, departmentId, preferredDepartmentId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      toast.error("Role title is required");
      return;
    }
    if (!departmentId) {
      toast.error("Add a department first", {
        description: "Roles must belong to a parent department.",
      });
      onNeedDepartment?.(trimmed);
      return;
    }
    if (roles.some((r) => r.title.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("A role with this name already exists");
      return;
    }

    setSaving(true);
    try {
      const next = await createRoleRecord({
        title: trimmed,
        departmentId,
        roles,
        academicYear,
        setRoles,
      });
      toast.success(`Role added · ${next.title}`);
      onCreated?.(next);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save role");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[110] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Position / Role</DialogTitle>
          <DialogDescription>Create a role and select it for this staff profile.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => void submit(e)} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-black/55">
              Position / Role name
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chemistry · HOD"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-black/55">
                Parent Department
              </Label>
              <button
                type="button"
                onClick={() => onNeedDepartment?.(title.trim())}
                className="text-[11px] font-semibold text-[#0F766E] hover:underline"
              >
                {departments.length === 0 ? "Add department" : "Add another"}
              </button>
            </div>
            <Select
              value={departmentId || undefined}
              onValueChange={setDepartmentId}
              disabled={departments.length === 0}
            >
              <SelectTrigger className="h-10 w-full rounded-lg border border-[#E5E5E5] bg-white text-[13px]">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent className="z-[120]">
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || departments.length === 0}
              className="rounded-full bg-[#0F766E] text-white hover:bg-[#0D9488]"
            >
              {saving ? "Saving…" : "Add Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function StaffOrgQuickCreateDialogs({
  roleOpen,
  onRoleOpenChange,
  departmentOpen,
  onDepartmentOpenChange,
  onRoleCreated,
  onDepartmentCreated,
}: {
  roleOpen: boolean;
  onRoleOpenChange: (open: boolean) => void;
  departmentOpen: boolean;
  onDepartmentOpenChange: (open: boolean) => void;
  onRoleCreated?: (role: Role) => void;
  onDepartmentCreated?: (dept: Department) => void;
}): ReactNode {
  const {
    activeRoles: roles,
    setRoles,
    academicYear,
  } = useTenantStore();
  const [pendingRoleTitle, setPendingRoleTitle] = useState("");
  const [preferredDepartmentId, setPreferredDepartmentId] = useState("");
  const [creatingRoleAfterDept, setCreatingRoleAfterDept] = useState(false);

  const beginDepartmentForRole = (draftTitle: string) => {
    setPendingRoleTitle(draftTitle);
    setPreferredDepartmentId("");
    onRoleOpenChange(false);
    onDepartmentOpenChange(true);
  };

  return (
    <>
      <CreateDepartmentDialog
        open={departmentOpen}
        onOpenChange={(open) => {
          onDepartmentOpenChange(open);
          if (!open && pendingRoleTitle && !creatingRoleAfterDept) {
            // Department dialog dismissed without creating — restore the role draft.
            onRoleOpenChange(true);
          }
        }}
        onCreated={(dept) => {
          onDepartmentCreated?.(dept);
          const draftTitle = pendingRoleTitle.trim();
          if (!draftTitle) {
            setPreferredDepartmentId(dept.id);
            onDepartmentOpenChange(false);
            onRoleOpenChange(true);
            return;
          }

          // Finish the in-progress role with the department that was just added.
          setCreatingRoleAfterDept(true);
          void (async () => {
            try {
              if (roles.some((r) => r.title.toLowerCase() === draftTitle.toLowerCase())) {
                toast.error("A role with this name already exists");
                setPreferredDepartmentId(dept.id);
                onRoleOpenChange(true);
                return;
              }
              const next = await createRoleRecord({
                title: draftTitle,
                departmentId: dept.id,
                roles,
                academicYear,
                setRoles,
              });
              toast.success(`Role added · ${next.title}`);
              onRoleCreated?.(next);
              setPendingRoleTitle("");
              setPreferredDepartmentId("");
              onRoleOpenChange(false);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Could not save role");
              setPreferredDepartmentId(dept.id);
              onRoleOpenChange(true);
            } finally {
              setCreatingRoleAfterDept(false);
              onDepartmentOpenChange(false);
            }
          })();
        }}
      />
      <CreateRoleDialog
        open={roleOpen}
        onOpenChange={(open) => {
          onRoleOpenChange(open);
          if (!open && !departmentOpen) {
            setPendingRoleTitle("");
            setPreferredDepartmentId("");
          }
        }}
        onCreated={onRoleCreated}
        onNeedDepartment={beginDepartmentForRole}
        initialTitle={pendingRoleTitle}
        preferredDepartmentId={preferredDepartmentId}
      />
    </>
  );
}
