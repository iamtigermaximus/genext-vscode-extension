export function validateComponentName(name: string): string | null {
  if (!name) return "Name is required";
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(name))
    return "Use PascalCase (e.g., UserProfile)";
  return null;
}

export function validateHookName(name: string): string | null {
  if (!name) return "Name is required";
  if (!/^use[A-Z]/.test(name)) return 'Must start with "use" (e.g., useAuth)';
  return null;
}

export function validateUtilityName(name: string): string | null {
  if (!name) return "Name is required";
  if (!/^[a-z][a-zA-Z0-9]*$/.test(name))
    return "Use camelCase (e.g., formatDate)";
  return null;
}

export function validateProjectName(name: string): string | null {
  if (!name) return "Project name required";
  if (!/^[a-z][a-z0-9-]*$/.test(name))
    return "Use lowercase letters, numbers, and hyphens";
  return null;
}

export function validatePageName(name: string): string | null {
  if (!name) return "Name is required";
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    return "Use lowercase letters, numbers, and hyphens";
  }
  return null;
}
