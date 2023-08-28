export function createUrl(baseUrl: string, resource?: string): string {
  if (resource) {
    return `${baseUrl}/${resource}`;
  }
  return baseUrl;
}
