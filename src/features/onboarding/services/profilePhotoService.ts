import { Directory, File, Paths } from "expo-file-system";

const PROFILE_DIRECTORY = "profile";

export function saveProfilePhoto(sourceUri: string): string {
  const directory = new Directory(Paths.document, PROFILE_DIRECTORY);

  directory.create({
    idempotent: true,
    intermediates: true,
  });

  const extension = sourceUri.split("?")[0].split(".").pop()?.toLowerCase();

  const safeExtension =
    extension === "png" || extension === "heic" || extension === "webp"
      ? extension
      : "jpg";

  // Give each photo a unique filename.
  const filename = `avatar-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}.${safeExtension}`;

  const destination = new File(directory, filename);
  const source = new File(sourceUri);

  // Copy the new photo without deleting the previous one.

  source.copy(destination);

  const savedFile = new File(destination.uri);

  if (!savedFile.exists || savedFile.size === 0) {
    throw new Error("Failed to save profile photo.");
  }

  return savedFile.uri;
}

export function deleteProfilePhoto(photoUri: string | null): void {
  if (!photoUri) return;

  const profileDirectory = new Directory(Paths.document, PROFILE_DIRECTORY);

  // Only delete photos stored in BudgetFlow's profile directory.
  const directoryUri = profileDirectory.uri.endsWith("/")
    ? profileDirectory.uri
    : `${profileDirectory.uri}/`;

  if (!photoUri.startsWith(directoryUri)) {
    return;
  }

  const file = new File(photoUri);

  if (file.exists) {
    file.delete();
  }
}
