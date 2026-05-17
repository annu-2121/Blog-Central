import { format, formatDistanceToNow } from "date-fns";

export function formatDate(dateString: string) {
  return format(new Date(dateString), "MMMM d, yyyy");
}

export function formatRelativeDate(dateString: string) {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}
