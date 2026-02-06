import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase credentials in .env');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Data types
export interface UserProfile {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  role: 'user' | 'editor' | 'admin';
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  author_id: number;
  author: UserProfile;
  is_published: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  comments_count?: number;
  reactions_count?: number;
}

export interface Comment {
  id: string;
  article_id: string;
  author_id: number;
  author: UserProfile;
  content: string;
  created_at: string;
}

// Get or create user profile.
export async function getOrCreateUserProfile(telegramUser: any): Promise<UserProfile> {
  try {
    // Try to get an existing profile.
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', telegramUser.id)
      .single();

    // If user does not exist, create a new profile.
    if (error && (error as any).code === 'PGRST116') {
      const { data: newProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: telegramUser.id,
            username: telegramUser.username || `user_${telegramUser.id}`,
            first_name: telegramUser.first_name || '',
            last_name: telegramUser.last_name || '',
            photo_url: telegramUser.photo_url || null,
            role: 'user',
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      return newProfile as UserProfile;
    }

    if (error) throw error;
    return profile as UserProfile;
  } catch (err) {
    console.error('Error in getOrCreateUserProfile:', err);
    throw err;
  }
}

// Get all published articles.
export async function getArticles(limit = 20, offset = 0): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select(
      '*, author:user_profiles(id, username, first_name, last_name, photo_url, role, created_at), comments(id), reactions(id, emoji)',
    )
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return (
    data?.map((article: any) => ({
      ...article,
      comments_count: article.comments?.length || 0,
      reactions_count: article.reactions?.length || 0,
    })) || []
  );
}

// Get single article by ID.
export async function getArticleById(articleId: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select(
      '*, author:user_profiles(id, username, first_name, last_name, photo_url, role, created_at), comments(*, author:user_profiles(id, username, first_name, last_name, photo_url, role, created_at)), reactions(id, user_id, emoji)',
    )
    .eq('id', articleId)
    .single();

  if (error) throw error;
  return data as Article | null;
}

// Create new article.
export async function createArticle(
  title: string,
  content: string,
  authorId: number,
): Promise<Article> {
  const { data, error } = await supabase
    .from('articles')
    .insert([
      {
        title,
        content,
        author_id: authorId,
        is_published: false,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as Article;
}

// Update article.
export async function updateArticle(
  articleId: string,
  updates: Partial<Article>,
): Promise<Article> {
  const { data, error } = await supabase
    .from('articles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', articleId)
    .select()
    .single();

  if (error) throw error;
  return data as Article;
}

// Publish article.
export async function publishArticle(articleId: string): Promise<Article> {
  return updateArticle(articleId, {
    is_published: true,
  });
}

// Add comment.
export async function addComment(
  articleId: string,
  authorId: number,
  content: string,
): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert([
      {
        article_id: articleId,
        author_id: authorId,
        content,
      },
    ])
    .select(
      '*, author:user_profiles(id, username, first_name, last_name, photo_url, role, created_at)',
    )
    .single();

  if (error) throw error;
  return data as Comment;
}

// Toggle reaction.
export async function toggleReaction(
  articleId: string,
  userId: number,
  emoji: string = '👍',
): Promise<any> {
  // Check if reaction already exists.
  const { data: existing } = await supabase
    .from('reactions')
    .select('id')
    .eq('article_id', articleId)
    .eq('user_id', userId)
    .eq('emoji', emoji)
    .single();

  if (existing) {
    // Remove reaction.
    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('id', (existing as any).id);
    if (error) throw error;
    return null;
  }

  // Add new reaction.
  const { data, error } = await supabase
    .from('reactions')
    .insert([
      {
        article_id: articleId,
        user_id: userId,
        emoji,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get user role.
export async function getUserRole(userId: number): Promise<'user' | 'editor' | 'admin'> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return (data?.role as 'user' | 'editor' | 'admin') ?? 'user';
}

// Set user role (admin only).
export async function setUserRole(
  userId: number,
  newRole: 'user' | 'editor' | 'admin',
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ role: newRole })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as UserProfile;
}

// Find user by username or ID.
export async function findUserByUsernameOrId(query: string): Promise<UserProfile[]> {
  const isNumeric = /^\d+$/.test(query);

  let queryBuilder = supabase.from('user_profiles').select('*');

  if (isNumeric) {
    queryBuilder = queryBuilder.eq('id', parseInt(query, 10));
  } else {
    queryBuilder = queryBuilder.ilike('username', `%${query}%`);
  }

  const { data, error } = await queryBuilder.limit(10);

  if (error) throw error;
  return (data as UserProfile[]) || [];
}

