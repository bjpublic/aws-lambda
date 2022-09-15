import { Post, PostListItem } from "./models";

export async function insert(post: Post): Promise<boolean> {
  return false;
}

export async function select(title: string): Promise<Post | null> {
  return null;
}

export async function update(
  oldTitle: string,
  post: Omit<Post, "created">
): Promise<boolean> {
  return false;
}

export async function remove(title: string): Promise<void> {}

export async function list(): Promise<PostListItem[]> {
  return [];
}
